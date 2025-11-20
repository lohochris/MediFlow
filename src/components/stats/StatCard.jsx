import React from "react";
import IconCircle from "../common/IconCircle";

export default function StatCard({ title, value, icon, color = "emerald", growth }) {
  return (
    <div
      className="
        bg-white dark:bg-slate-900
        shadow-card border border-slate-200 dark:border-slate-700
        rounded-xl p-5 flex items-center justify-between
        transition-soft hover:shadow-heavy
      "
    >
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
          {title}
        </p>

        <div className="text-2xl font-semibold text-slate-800 dark:text-white">
          {value}
        </div>

        {growth && (
          <p
            className={`text-sm mt-1 ${
              growth > 0 ? "text-emerald-600" : "text-red-500"
            }`}
          >
            {growth > 0 ? `↑ ${growth}%` : `↓ ${Math.abs(growth)}%`} this month
          </p>
        )}
      </div>

      <IconCircle color={color} size={48}>
        {icon}
      </IconCircle>
    </div>
  );
}
