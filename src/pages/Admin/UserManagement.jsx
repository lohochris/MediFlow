import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import {
  UserCog,
  Trash2,
  ShieldCheck,
  Ban,
  Building2,
} from "lucide-react";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const roles = [
    "SuperAdmin",
    "Admin",
    "Doctor",
    "Nurse",
    "Pharmacist",
    "LabScientist",
    "Radiologist",
    "Receptionist",
    "Accountant",
    "Patient",
  ];

  // Load users + departments
  const loadData = async () => {
    try {
      setLoading(true);

      const [userRes, deptRes] = await Promise.all([
        api.get("/users"),
        api.get("/departments"),
      ]);

      setUsers(userRes.data || []);
      setDepartments(deptRes.data || []);
    } catch (err) {
      toast.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update Role
  const handleRoleChange = async (id, role) => {
    try {
      await api.put(`/users/${id}/role`, { role });
      toast.success("Role updated");
      loadData();
    } catch {
      toast.error("Failed to update role");
    }
  };

  // Update Department
  const handleDeptChange = async (id, department) => {
    try {
      await api.put(`/users/${id}/department`, { department });
      toast.success("Department updated");
      loadData();
    } catch {
      toast.error("Failed to update department");
    }
  };

  // Activate / Deactivate User
  const toggleActive = async (id, active) => {
    try {
      await api.put(`/users/${id}/status`, { active });
      toast.success(active ? "User activated" : "User deactivated");
      loadData();
    } catch {
      toast.error("Failed to update status");
    }
  };

  // Soft Delete
  const handleDelete = async (id) => {
    if (!confirm("Soft delete this user?")) return;

    try {
      await api.delete(`/users/${id}`);
      toast.success("User deleted");
      loadData();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-6">
        <UserCog className="text-brand" size={28} />
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">
            User Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage users, roles, departments, and access.
          </p>
        </div>
      </div>

      {/* TABLE WRAPPER */}
      {loading ? (
        <div className="text-center py-10 text-slate-500">
          Loading users...
        </div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Department</th>
                <th className="text-left px-4 py-3">Active</th>
                <th className="text-center px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr
                  key={u._id}
                  className="border-t border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                >
                  <td className="px-4 py-3 font-medium">
                    {u.name}
                  </td>

                  <td className="px-4 py-3 text-slate-500 dark:text-slate-300">
                    {u.email}
                  </td>

                  {/* ROLE SELECT */}
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-800"
                    >
                      {roles.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* DEPARTMENT SELECT */}
                  <td className="px-4 py-3">
                    <select
                      value={u.department || ""}
                      onChange={(e) => handleDeptChange(u._id, e.target.value)}
                      className="px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-800"
                    >
                      <option value="">None</option>
                      {departments.map((d) => (
                        <option key={d._id} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* ACTIVE / INACTIVE TOGGLE */}
                  <td className="px-4 py-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={u.active !== false}
                        onChange={(e) =>
                          toggleActive(u._id, e.target.checked)
                        }
                        className="h-4 w-4"
                      />
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          u.active !== false
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {u.active !== false ? "Active" : "Inactive"}
                      </span>
                    </label>
                  </td>

                  {/* ACTIONS */}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDelete(u._id)}
                      className="inline-flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg shadow-sm hover:bg-red-700 transition"
                    >
                      <Trash2 size={15} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
