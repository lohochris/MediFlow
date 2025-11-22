import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  Building2,
  UserCog,
  Stethoscope,
  NotebookPen,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

export default function Sidebar() {
  const { user, logout } = useAuth();

  /** GENERAL MENU — for all authenticated users */
  const mainMenu = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Patients", icon: Users, path: "/patients" },
    { label: "Appointments", icon: CalendarCheck, path: "/appointments" },
    { label: "Reports", icon: BarChart3, path: "/reports" },
    { label: "Settings", icon: Settings, path: "/settings" },
  ];

  /** ADMIN (Admin + SuperAdmin) */
  const adminMenu = [
    { label: "Admin Dashboard", icon: Shield, path: "/admin" },
    { label: "Departments", icon: Building2, path: "/admin/departments" },
    { label: "User Management", icon: UserCog, path: "/admin/users" },
  ];

  /** DOCTOR (Doctor + SuperAdmin) */
const doctorMenu = [
  { label: "Doctor Dashboard", icon: Stethoscope, path: "/doctor/dashboard" },
  { label: "My Patients", icon: Users, path: "/doctor/patients" },
  { label: "My Appointments", icon: NotebookPen, path: "/doctor/appointments" },
];

  // Utility: UI for each nav item
  const renderNav = ({ label, icon: Icon, path }) => (
    <NavLink
      key={path}
      to={path}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-soft cursor-pointer ${
          isActive
            ? "bg-emerald-600 text-white shadow-sm"
            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        }`
      }
    >
      <Icon size={20} />
      {label}
    </NavLink>
  );

  return (
    <aside className="w-64 h-screen bg-white dark:bg-slate-900 shadow-card fixed left-0 top-0 flex flex-col border-r border-slate-200 dark:border-slate-700 overflow-hidden">

      {/* LOGO */}
      <div className="px-6 py-6 border-b border-slate-200 dark:border-slate-700">
        <h1 className="text-2xl font-bold text-brand dark:text-brand-light">
          MediFlow
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Health Management System
        </p>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-4 scrollbar-thin">

        {/* MAIN MENU */}
        <div className="space-y-2">
          {mainMenu.map(renderNav)}
        </div>

        {/* SUPERADMIN EXCLUSIVE */}
        {user?.role === "SuperAdmin" && (
          <div className="pt-4 border-t border-slate-300 dark:border-slate-700">
            <p className="text-xs font-semibold text-slate-400 uppercase mb-2">
              SuperAdmin
            </p>
            {renderNav({
              label: "SuperAdmin Dashboard",
              icon: Shield,
              path: "/admin/superadmin",
            })}
          </div>
        )}

        {/* ADMIN */}
        {(user?.role === "Admin" || user?.role === "SuperAdmin") && (
          <div className="pt-4 border-t border-slate-300 dark:border-slate-700">
            <p className="text-xs font-semibold text-slate-400 uppercase mb-2">
              Admin Tools
            </p>
            <div className="flex flex-col space-y-2">
              {adminMenu.map(renderNav)}
            </div>
          </div>
        )}

        {/* DOCTOR */}
        {(user?.role === "Doctor" || user?.role === "SuperAdmin") && (
          <div className="pt-4 border-t border-slate-300 dark:border-slate-700">
            <p className="text-xs font-semibold text-slate-400 uppercase mb-2">
              Doctor Panel
            </p>
            <div className="flex flex-col space-y-2">
              {doctorMenu.map(renderNav)}
            </div>
          </div>
        )}
      </nav>

      {/* LOGOUT BUTTON */}
      <div className="px-4 pb-6 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-800/20 hover:text-red-600 transition-soft"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}
