// src/pages/Admin/CreateDoctor.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function CreateDoctor() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
  });

  // Load Departments
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const res = await fetch("/departments", { credentials: "include" });
        const data = await res.json();
        setDepartments(data);
      } catch (err) {
        console.error("Failed to load departments:", err);
      }
    };

    loadDepartments();
  }, []);

  // Handle Input
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!form.name || !form.email || !form.phone || !form.department) {
      toast.error("All fields are required");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/users", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          role: "Doctor",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to create doctor");
        setLoading(false);
        return;
      }

      toast.success("Doctor created successfully!");

      // Redirect to user management
      navigate("/admin/users");

    } catch (err) {
      console.error(err);
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-slate-50 dark:bg-slate-900">

      {/* Title */}
      <h1 className="text-2xl font-semibold text-slate-800 dark:text-white mb-4">
        Create Doctor Profile
      </h1>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 max-w-xl">

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name */}
          <div>
            <label className="text-sm text-slate-500">Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Doctor full name"
              className="w-full mt-1 p-2 rounded-lg border dark:bg-slate-700"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm text-slate-500">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email address"
              className="w-full mt-1 p-2 rounded-lg border dark:bg-slate-700"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm text-slate-500">Phone Number</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone number"
              className="w-full mt-1 p-2 rounded-lg border dark:bg-slate-700"
              required
            />
          </div>

          {/* Department */}
          <div>
            <label className="text-sm text-slate-500">Department</label>
            <select
              name="department"
              value={form.department}
              onChange={handleChange}
              className="w-full mt-1 p-2 rounded-lg border dark:bg-slate-700"
              required
            >
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d._id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg"
            >
              {loading ? "Creating..." : "Create Doctor"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/users")}
              className="px-4 py-2 rounded-lg border"
            >
              Cancel
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
