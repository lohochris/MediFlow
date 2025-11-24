import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

import GoogleLoginButton from "../components/GoogleLoginButton";
import { loginUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth(); // stores authenticated user globally

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ==================================================
  // EMAIL + PASSWORD LOGIN
  // ==================================================
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Call backend login
      const res = await loginUser(email, password);

      const userObj = {
        ...res.user,
        accessToken: res.accessToken,
      };

      // Save globally
      login(userObj);

      toast.success("Logged in successfully!");

      // RBAC REDIRECT LOGIC — identical to Register.jsx
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
      toast.error(err?.response?.data?.error || "Invalid email or password");
    }
  };

  // ==================================================
  // GOOGLE LOGIN
  // ==================================================
  const handleGoogle = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 px-4">
      <div className="bg-white dark:bg-slate-800 p-8 shadow-xl rounded-2xl w-full max-w-md border border-slate-200 dark:border-slate-700">

        <h2 className="text-3xl font-bold mb-2 text-slate-800 dark:text-white text-center">
          MediFlow Login
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 text-center">
          Welcome back! Please login.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:text-white"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:text-white"
            required
          />

          <button
            type="submit"
            className="
              w-full py-3 
              rounded-lg 
              bg-emerald-600 text-white 
              font-medium 
              shadow-md
              hover:bg-emerald-700 
              active:scale-[0.98]
              transition
            "
          >
            Login
          </button>
        </form>

        <div className="flex items-center my-5">
          <div className="flex-1 h-px bg-slate-300 dark:bg-slate-600"></div>
          <span className="px-3 text-slate-500 dark:text-slate-400 text-sm">
            OR
          </span>
          <div className="flex-1 h-px bg-slate-300 dark:bg-slate-600"></div>
        </div>

        <GoogleLoginButton onClick={handleGoogle} />

        <p className="text-center mt-6 text-sm text-slate-600 dark:text-slate-300">
          Don’t have an account?{" "}
          <Link to="/register" className="text-emerald-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
