// src/pages/Admin/UserManagement.jsx
import React, { useEffect, useState } from "react";
import api from "../../api/api"; // unified axios instance
import toast from "react-hot-toast";
import { UserCog, Trash2, UserPlus, X } from "lucide-react";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [doctorForm, setDoctorForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
  });

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

  /* ============================================================
       Load Users + Departments
  ============================================================ */
  const loadData = async () => {
    try {
      setLoading(true);

      const [usersRes, deptRes] = await Promise.all([
        api.get("/api/users", { withCredentials: true }),
        api.get("/api/departments", { withCredentials: true }),
      ]);

      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ============================================================
       Doctor Form Handling
  ============================================================ */
  const handleDoctorInput = (e) => {
    const { name, value } = e.target;
    setDoctorForm((prev) => ({ ...prev, [name]: value }));
  };

  /* ============================================================
       Submit Doctor
  ============================================================ */
  const submitDoctor = async () => {
    const { name, email, password, department } = doctorForm;

    if (!name || !email || !password || !department) {
      toast.error("Please fill all fields.");
      return;
    }

    try {
      await api.post(
        "/api/users",
        {
          name,
          email,
          password,
          role: "Doctor",
          department,
        },
        { withCredentials: true }
      );

      toast.success("Doctor created successfully!");

      setShowModal(false);
      setDoctorForm({
        name: "",
        email: "",
        password: "",
        department: "",
      });

      loadData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Creation failed");
    }
  };

  /* ============================================================
       Update Role
  ============================================================ */
  const handleRoleChange = async (id, role) => {
    try {
      await api.put(
        `/api/users/${id}/role`,
        { role },
        { withCredentials: true }
      );

      toast.success("Role updated");
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update role");
    }
  };

  /* ============================================================
       Update Department
  ============================================================ */
  const handleDeptChange = async (id, department) => {
    try {
      await api.put(
        `/api/users/${id}/department`,
        { department },
        { withCredentials: true }
      );

      toast.success("Department updated");
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update department");
    }
  };

  /* ============================================================
       Toggle Active Status
  ============================================================ */
  const toggleActive = async (id, active) => {
    try {
      await api.put(
        `/api/users/${id}/status`,
        { active },
        { withCredentials: true }
      );

      toast.success(active ? "User activated" : "User deactivated");
      loadData();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  /* ============================================================
       Delete User (Soft Delete)
  ============================================================ */
  const handleDelete = async (id) => {
    if (!confirm("Soft delete this user?")) return;

    try {
      await api.delete(`/api/users/${id}`, { withCredentials: true });

      toast.success("User deleted");
      loadData();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  /* ============================================================
                          UI
  ============================================================ */
  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
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

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow"
        >
          <UserPlus size={18} /> Add Doctor
        </button>
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="text-center py-10 text-slate-500">
          Loading users...
        </div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-slate-900 border rounded-xl shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Department</th>
                <th className="px-4 py-3 text-left">Active</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr
                  key={u._id}
                  className="border-t border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-slate-500">{u.email}</td>

                  {/* Role */}
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="px-3 py-2 rounded-lg border dark:bg-slate-800"
                    >
                      {roles.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Department */}
                  <td className="px-4 py-3">
                    <select
                      value={u.department || ""}
                      onChange={(e) =>
                        handleDeptChange(u._id, e.target.value)
                      }
                      className="px-3 py-2 rounded-lg border dark:bg-slate-800"
                    >
                      <option value="">None</option>
                      {departments.map((d) => (
                        <option key={d._id} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Active */}
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={u.isActive}
                      onChange={(e) => toggleActive(u._id, e.target.checked)}
                    />
                  </td>

                  {/* Delete */}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDelete(u._id)}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-1 justify-center"
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

      {/* ================== DOCTOR CREATION MODAL ================== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[2000]">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-xl shadow-xl p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-semibold mb-4">Create Doctor Account</h2>

            <div className="space-y-4">
              <input
                name="name"
                value={doctorForm.name}
                onChange={handleDoctorInput}
                placeholder="Doctor Name"
                className="w-full p-3 border rounded-lg dark:bg-slate-800"
              />

              <input
                name="email"
                value={doctorForm.email}
                onChange={handleDoctorInput}
                placeholder="Email"
                className="w-full p-3 border rounded-lg dark:bg-slate-800"
              />

              <input
                name="password"
                value={doctorForm.password}
                onChange={handleDoctorInput}
                placeholder="Password"
                type="password"
                className="w-full p-3 border rounded-lg dark:bg-slate-800"
              />

              <select
                name="department"
                value={doctorForm.department}
                onChange={handleDoctorInput}
                className="w-full p-3 border rounded-lg dark:bg-slate-800"
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={submitDoctor}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Create Doctor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
