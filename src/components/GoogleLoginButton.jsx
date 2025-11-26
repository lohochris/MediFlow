// src/components/GoogleLoginButton.jsx
import React from "react";
import { FcGoogle } from "react-icons/fc";

export default function GoogleLoginButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Continue with Google"
      className="
        w-full flex items-center justify-center gap-2
        py-2.5 px-4 
        border border-slate-300 dark:border-slate-600 
        rounded-lg
        bg-white dark:bg-slate-700
        text-slate-700 dark:text-white
        hover:bg-slate-100 dark:hover:bg-slate-600
        active:scale-[0.98]
        transition-all
        font-medium
      "
    >
      <FcGoogle size={22} />
      <span>Continue with Google</span>
    </button>
  );
}
