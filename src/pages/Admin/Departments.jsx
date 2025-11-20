import React, { useEffect, useState } from "react";
import {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../../services/departmentService";
import toast from "react-hot-toast";
import { Building2, Pencil, Trash2 } from "lucide-react";

export default function Departments() {
  const [depts, setDepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editing, setEditing] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const list = await getAllDepartments();
      setDepts(list || []);
    } catch (err) {
      toast.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      if (!name.trim()) return toast.error("Department name required");

      if (editing) {
        await updateDepartment(editing._id, { name, description });
        toast.success("Department updated");
      } else {
        await createDepartment({ name, description });
        toast.success("Department created");
      }

      setName("");
      setDescription("");
      setEditing(null);
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Error saving department");
    }
  };

  const startEdit = (dept) => {
    setEditing(dept);
    setName(dept.name);
    setDescription(dept.description || "");
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this department?")) return;

    try {
      await deleteDepartment(id);
      toast.success("Deleted");
      await load();
    } catch (err) {
      toast.error("Failed to delete department");
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">
          Departments
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage hospital departments and organizational units.
        </p>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-card mb-6">
        <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-3">
          <input
            className="p-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
            placeholder="Department name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="p-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
            placeholder="Short description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="px-4 py-3 bg-brand text-white rounded-lg shadow-sm hover:bg-brand-dark transition"
            >
              {editing ? "Update" : "Create"}
            </button>

            {editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setName("");
                  setDescription("");
                }}
                className="px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-10 text-slate-500">Loading...</div>
      ) : depts.length === 0 ? (
        <div className="text-slate-500">No departments found.</div>
      ) : (
        <div className="space-y-4">
          {depts.map((d) => (
            <div
              key={d._id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 
                         rounded-xl p-5 shadow-sm flex items-center justify-between hover:shadow-md 
                         transition"
            >
              <div className="flex items-start gap-3">
                <Building2 className="text-brand mt-1" />
                <div>
                  <div className="font-semibold text-slate-800 dark:text-white">
                    {d.name}
                  </div>
                  {d.description && (
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {d.description}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => startEdit(d)}
                  className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Edit"
                >
                  <Pencil className="text-emerald-600" size={18} />
                </button>

                <button
                  onClick={() => handleDelete(d._id)}
                  className="p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                  title="Delete"
                >
                  <Trash2 className="text-red-600" size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
