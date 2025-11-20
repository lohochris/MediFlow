import React from "react";
import clsx from "clsx";

export default function Button({
  children,
  onClick,
  variant = "primary",
  className = "",
  type = "button",
  disabled = false,
}) {
  const base =
    "px-4 py-2 rounded-xl text-sm font-medium transition-transform transform-gpu inline-flex items-center justify-center gap-2";

  const variants = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700",
    outline:
      "border border-slate-300 hover:bg-slate-100 text-slate-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "bg-transparent hover:bg-slate-50",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={clsx(base, variants[variant], className, {
        "opacity-50 cursor-not-allowed": disabled,
        "hover:-translate-y-[2px] active:translate-y-0": !disabled,
      })}
    >
      {children}
    </button>
  );
}
