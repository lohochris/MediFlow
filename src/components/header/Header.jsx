// src/components/header/Header.jsx

import React, { useContext, useEffect, useState } from "react";
import { Bell, ChevronDown, Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";

import { useAuth } from "../../context/AuthContext";

export default function Header({ onAddPatient }) {
  const navigate = useNavigate();
  const { theme, toggle } = useContext(ThemeContext);

  // 🔥 Use global auth state ONLY
  const { user, reloadUser, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);

  // Load fresh user on mount
  useEffect(() => {
    reloadUser();
  }, []);

  const displayName =
    user?.name ||
    user?.displayName ||
    (user?.email ? user.email.split("@")[0] : "User");

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="w-full flex items-center justify-between px-4 sm:px-6 py-4 bg-white dark:bg-slate-900 shadow-soft border-b border-slate-200 dark:border-slate-700">

      {/* Greeting */}
      <div>
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
          Hello, {displayName} 👋
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Welcome back to MediFlow
        </p>
      </div>

      <div className="flex items-center gap-3">

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded-full cursor-pointer">
          <Bell size={18} className="text-slate-600 dark:text-slate-300" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
        </div>

        {/* Add patient */}
        <button
          onClick={onAddPatient}
          className="hidden sm:block bg-brand text-white px-4 py-2 rounded-lg text-sm"
        >
          + Add Patient
        </button>

        {/* Avatar */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-semibold">
              {displayName?.charAt(0)?.toUpperCase()}
            </div>
            <ChevronDown size={16} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-card py-2 z-40">
              <button
                onClick={() => navigate("/settings")}
                className="w-full px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Settings
              </button>

              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-800/30"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
