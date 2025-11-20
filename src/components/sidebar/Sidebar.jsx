// src/components/sidebar/Sidebar.jsx
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

  /** MAIN MENU — visible to all authenticated users */
  const menu = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Patients", icon: Users, path: "/patients" },
    { label: "Appointments", icon: CalendarCheck, path: "/appointments" },
    { label: "Reports", icon: BarChart3, path: "/reports" },
    { label: "Settings", icon: Settings, path: "/settings" },
  ];

  /** ADMIN MENU — only Admin or SuperAdmin */
  const adminMenu = [
    { label: "Admin Dashboard", icon: Shield, path: "/admin" },
    { label: "Departments", icon: Building2, path: "/admin/departments" },
    { label: "User Management", icon: UserCog, path: "/admin/users" },
  ];

  /** DOCTOR MENU — only Doctor */
  const doctorMenu = [
    { label: "Doctor Dashboard", icon: Stethoscope, path: "/doctor" },
    { label: "My Patients", icon: Users, path: "/doctor/patients" },
    { label: "My Appointments", icon: NotebookPen, path: "/doctor/appointments" },
  ];

  return (
    <aside className="w-64 h-screen bg-white dark:bg-slate-900 shadow-card fixed left-0 top-0 flex flex-col border-r border-slate-200 dark:border-slate-700">
      
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-200 dark:border-slate-700">
        <h1 className="text-2xl font-bold text-brand dark:text-brand-light tracking-tight">
          MediFlow
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Health Management System
        </p>
      </div>

      {/* MAIN NAVIGATION */}
      <nav className="flex-1 px-4 py-6 space-y-2">

        {/* GENERAL MENU */}
        {menu.map(({ label, icon: Icon, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `
              flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-soft cursor-pointer
              ${isActive
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }
            `
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}

        {/* ADMIN SECTION */}
        {user && (user.role === "Admin" || user.role === "SuperAdmin") && (
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs font-semibold text-slate-400 uppercase mb-2">
              Admin
            </p>

            {adminMenu.map(({ label, icon: Icon, path }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `
                  flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-soft cursor-pointer
                  ${isActive
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }
                `
                }
              >
                <Icon size={20} />
                {label}
              </NavLink>
            ))}
          </div>
        )}

        {/* DOCTOR SECTION */}
        {user && user.role === "Doctor" && (
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs font-semibold text-slate-400 uppercase mb-2">
              Doctor
            </p>

            {doctorMenu.map(({ label, icon: Icon, path }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `
                  flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-soft cursor-pointer
                  ${isActive
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }
                `
                }
              >
                <Icon size={20} />
                {label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* Logout */}
      <div className="px-4 pb-6 border-t border-slate-200 dark:border-slate-700 mt-auto">
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
