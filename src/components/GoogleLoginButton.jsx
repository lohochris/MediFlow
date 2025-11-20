import React from "react";
import { FcGoogle } from "react-icons/fc";

export default function GoogleLoginButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2 border py-2.5 rounded-lg hover:bg-slate-100 transition"
    >
      <FcGoogle size={22} /> Continue with Google
    </button>
  );
}
