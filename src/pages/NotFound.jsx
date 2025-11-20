import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-5xl font-bold mb-4">404</h1>

      <p className="text-lg text-slate-600 mb-6">
        Oops! The page you are looking for does not exist.
      </p>

      <Link
        to="/dashboard"
        className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
      >
        Go Back Home
      </Link>
    </div>
  );
}
