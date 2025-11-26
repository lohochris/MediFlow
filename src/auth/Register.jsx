// src/auth/Register.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import GoogleLoginButton from "../components/GoogleLoginButton";
import { registerUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Patient", // always Patient for self-registration
  });

  /* ============================================================
     SUBMIT REGISTRATION
  ============================================================ */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      };

      const newUser = await registerUser(payload);

      login(newUser);
      toast.success("Account created! Welcome 🎉");

      // ROLE BASED REDIRECT
      switch (newUser.role) {
        case "SuperAdmin":
        case "Admin":
          return navigate("/admin");

        case "Doctor":
          return navigate("/doctor/dashboard");

        default:
          // All Patients must complete medical profile
          return navigate("/complete-profile");
      }
    } catch (err) {
      console.error("Register error:", err);
      toast.error(err?.message || "Registration failed.");
    }
  };

  /* ============================================================
     GOOGLE REGISTER
  ============================================================ */
  const handleGoogleRegister = () => {
    const backendURL = import.meta.env.VITE_BACKEND_URL;

    if (!backendURL) {
      toast.error("Backend URL not configured");
      return;
    }

    window.location.href = `${backendURL}/api/auth/google`;
  };

  /* ============================================================
     UI
  ============================================================ */
  return (
    <div className="min-h-screen flex justify-center items-center bg-slate-100 dark:bg-slate-900 px-4">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-700">

        {/* TITLE */}
        <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-white">
          Create an Account
        </h2>
        <p className="text-center text-slate-500 dark:text-slate-400 text-sm mb-4">
          Join MediFlow and start your health journey.
        </p>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* FULL NAME */}
          <input
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:text-white"
            required
          />

          {/* EMAIL */}
          <input
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:text-white"
            required
          />

          {/* PASSWORD */}
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:text-white"
            required
          />

          {/* ROLE (hidden) */}
          <input type="hidden" value={form.role} readOnly />

          {/* SUBMIT */}
          <button
            type="submit"
            className="
              w-full py-3 bg-emerald-600 text-white
              rounded-lg text-sm font-medium shadow-md
              hover:bg-emerald-700 active:scale-[0.98] transition
            "
          >
            Register
          </button>
        </form>

        {/* OR Divider */}
        <div className="flex items-center my-5">
          <div className="flex-1 h-px bg-slate-300 dark:bg-slate-600"></div>
          <span className="px-3 text-slate-500 dark:text-slate-400 text-sm">OR</span>
          <div className="flex-1 h-px bg-slate-300 dark:bg-slate-600"></div>
        </div>

        {/* GOOGLE BUTTON */}
        <GoogleLoginButton onClick={handleGoogleRegister} />

        {/* FOOTER LINKS */}
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
