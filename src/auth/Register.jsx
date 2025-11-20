import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";

import GoogleLoginButton from "../components/GoogleLoginButton";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth(); // save authenticated user globally

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Patient", // Public signup default
  });

  // ============================================================
  // HANDLE FORM SUBMIT — REGISTER + AUTO LOGIN
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1️⃣ REGISTER USER (Backend must return: { user, accessToken })
      const res = await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });

      toast.success("Account created! Logging you in...");

      // 2️⃣ PREPARE USER OBJECT FOR CONTEXT
      const userObj = {
        ...res.data.user,
        accessToken: res.data.accessToken,
      };

      // 3️⃣ SAVE INTO AuthContext + localStorage
      login(userObj);

      // 4️⃣ RBAC REDIRECTION
      switch (userObj.role) {
        case "SuperAdmin":
        case "Admin":
          navigate("/admin");
          break;

        case "Doctor":
          navigate("/doctor");
          break;

        default:
          navigate("/dashboard");
      }

    } catch (err) {
      console.error("Register error:", err);
      toast.error(err?.response?.data?.error || "Registration failed.");
    }
  };

  // ============================================================
  // GOOGLE REGISTER
  // ============================================================
  const handleGoogleRegister = () => {
    window.location.href = "http://localhost:5000/auth/google";
  };

  // ============================================================
  // UI
  // ============================================================
  return (
    <div className="min-h-screen flex justify-center items-center bg-slate-100 dark:bg-slate-900 px-4">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-700">

        <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-white">
          Create an Account
        </h2>
        <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-6">
          Register to access the MediFlow dashboard.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name */}
          <input
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:text-white"
            required
          />

          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:text-white"
            required
          />

          {/* Password */}
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:text-white"
            required
          />

          {/* Hidden Role — Patients only */}
          <input type="hidden" value={form.role} readOnly />

          <button
            type="submit"
            className="
              w-full py-3 
              bg-emerald-600 text-white 
              rounded-lg shadow-md 
              text-sm font-medium
              hover:bg-emerald-700 
              active:scale-[0.98]
              transition
            "
          >
            Register
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-5">
          <div className="flex-1 h-px bg-slate-300 dark:bg-slate-600"></div>
          <span className="px-3 text-slate-500 dark:text-slate-400 text-sm">OR</span>
          <div className="flex-1 h-px bg-slate-300 dark:bg-slate-600"></div>
        </div>

        {/* Google */}
        <GoogleLoginButton onClick={handleGoogleRegister} />

        <p className="text-center text-sm text-slate-600 dark:text-slate-300 mt-6">
          Already have an account?{" "}
          <Link to="/" className="text-emerald-600 hover:underline">
            Login
          </Link>
        </p>

        <div className="mt-5 text-center">
          <Link
            to="/book-appointment"
            className="text-sm text-emerald-600 hover:underline"
          >
            Book Appointment
          </Link>
        </div>

      </div>
    </div>
  );
}
