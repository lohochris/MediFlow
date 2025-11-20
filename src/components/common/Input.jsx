import React from "react";

export default function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder = "",
  error = "",
  className = "",
}) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm mb-1 text-slate-600 dark:text-slate-300">
          {label}
        </label>
      )}

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="
          w-full border border-slate-300 dark:border-slate-600
          dark:bg-slate-700 dark:text-white
          rounded-lg px-3 py-2 text-sm
          focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
          outline-none
        "
      />

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
