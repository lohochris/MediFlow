// src/components/DashboardWelcome.jsx
import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function DashboardWelcome() {
  const { user } = useContext(AuthContext);

  const name = user?.displayName || (user?.email ? user.email.split("@")[0] : "Guest");

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-card border flex items-center justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Welcome back, {name} 👋</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Here’s today’s snapshot of your clinic.</p>
      </div>

      <div className="text-right">
        <div className="text-sm text-slate-500 dark:text-slate-300">Today</div>
        <div className="text-lg font-medium text-slate-800 dark:text-white">{new Date().toLocaleDateString()}</div>
      </div>
    </div>
  );
}
