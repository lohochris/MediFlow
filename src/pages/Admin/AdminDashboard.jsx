import React from "react";
import { Link } from "react-router-dom";
import { Building2, Users2, Settings } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage departments, users, and system-wide settings.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Departments */}
        <Link
          to="/admin/departments"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 
                     rounded-xl p-6 shadow-card hover:shadow-lg transition transform 
                     hover:-translate-y-1"
        >
          <div className="flex items-center gap-3 mb-3">
            <Building2 className="text-brand" size={24} />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
              Departments
            </h3>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Create and manage hospital departments.
          </p>
        </Link>

        {/* Users */}
        <Link
          to="/admin/users"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 
                     rounded-xl p-6 shadow-card hover:shadow-lg transition transform 
                     hover:-translate-y-1"
        >
          <div className="flex items-center gap-3 mb-3">
            <Users2 className="text-brand" size={24} />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
              Users & Roles
            </h3>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage staff accounts, roles, and permissions.
          </p>
        </Link>

        {/* System Settings */}
        <Link
          to="/admin/system"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 
                     rounded-xl p-6 shadow-card hover:shadow-lg transition transform 
                     hover:-translate-y-1"
        >
          <div className="flex items-center gap-3 mb-3">
            <Settings className="text-brand" size={24} />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
              System Settings
            </h3>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configure system preferences and audit logs.
          </p>
        </Link>
      </div>
    </div>
  );
}
