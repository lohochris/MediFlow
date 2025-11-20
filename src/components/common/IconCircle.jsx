import React from "react";

export default function IconCircle({ children, size = 40, color = "emerald" }) {
  const colorMap = {
    emerald: "bg-emerald-100 text-emerald-600",
    blue: "bg-blue-100 text-blue-600",
    red: "bg-red-100 text-red-600",
    orange: "bg-orange-100 text-orange-600",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <div
      className={`${colorMap[color]} rounded-full flex items-center justify-center`}
      style={{ width: size, height: size }}
    >
      {children}
    </div>
  );
}
