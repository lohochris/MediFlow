// src/pages/NotFound.jsx
import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 p-6 text-center">
      
      <div className="flex flex-col items-center mb-6">
        <AlertTriangle size={64} className="text-emerald-600 mb-4" />
        <h1 className="text-5xl font-extrabold text-slate-800 dark:text-white">
          404
        </h1>
      </div>

      <p className="text-lg text-slate-600 dark:text-slate-300 max-w-md mb-6">
        Oops! The page you are looking for doesn’t exist or may have been moved.
      </p>

      <Link
        to="/dashboard"
        className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg shadow hover:bg-emerald-700 transition"
      >
        Go Back Home
      </Link>
    </div>
  );
}
