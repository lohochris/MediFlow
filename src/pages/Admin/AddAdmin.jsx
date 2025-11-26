import React, { useState } from "react";
import api from "../../api/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function AddAdmin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      // ⭐ Correct backend endpoint
      const res = await api.post(
        "/api/admin/admins",
        { ...form, role: "Admin" }, // ⭐ Correct role capitalization
        { withCredentials: true }
      );

      if (res.status === 201) {
        toast.success("Admin created successfully!");
        navigate("/admin/superadmin"); // ⭐ Matches your router path
      }
    } catch (err) {
      console.error("CREATE ADMIN ERROR:", err);
      toast.error(err.response?.data?.message || "Failed to create admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-12 bg-white dark:bg-slate-800 p-6 rounded-xl shadow">
      <h2 className="text-2xl font-semibold mb-4 dark:text-white">Add Admin</h2>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Full Name</label>
          <input
            type="text"
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border dark:bg-slate-700 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border dark:bg-slate-700 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Phone</label>
          <input
            type="text"
            name="phone"
            required
            value={form.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border dark:bg-slate-700 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            name="password"
            required
            value={form.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border dark:bg-slate-700 rounded-lg"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-emerald-600 text-white rounded-lg"
        >
          {loading ? "Creating..." : "Create Admin"}
        </button>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-full py-2 mt-2 border rounded-lg dark:bg-slate-700"
        >
          Cancel
        </button>
      </form>
    </div>
  );
}
