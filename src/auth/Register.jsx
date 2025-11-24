// src/auth/Register.jsx
import React, { useState } from "react"; 
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// ❗ FIXED: Correct axios instance
import api from "../api/api";

import GoogleLoginButton from "../components/GoogleLoginButton";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Patient",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // FIXED: Always uses correct backend URL from api.js
      const res = await api.post("/api/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });

      toast.success("Account created! Logging you in...");

      const userObj = {
        ...res.data.user,
        accessToken: res.data.accessToken,
      };

      login(userObj);

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

  // ❗ FIXED: Google URL must use backend base URL
  const handleGoogleRegister = () => {
    window.location.href = 
      `${import.meta.env.VITE_BACKEND_URL}/api/auth/google`;
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-slate-100 dark:bg-slate-900 px-4">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-700">

        <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-white">
          Create an Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:text-white"
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:text-white"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:text-white"
            required
          />

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

        <div className="flex items-center my-5">
          <div className="flex-1 h-px bg-slate-300 dark:bg-slate-600"></div>
          <span className="px-3 text-slate-500 dark:text-slate-400 text-sm">OR</span>
          <div className="flex-1 h-px bg-slate-300 dark:bg-slate-600"></div>
        </div>

        <GoogleLoginButton onClick={handleGoogleRegister} />

        <p className="text-center text-sm text-slate-600 dark:text-slate-300 mt-6">
          Already have an account?
          <Link to="/" className="text-emerald-600 hover:underline"> Login </Link>
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
