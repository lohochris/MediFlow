// src/pages/Admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  Users2,
  Settings,
  Bell,
  CalendarCheck,
  UserCheck,
  FolderPlus,
} from "lucide-react";

import {
  getAdminKPIs,
  getAdminActivity,
} from "../../services/adminService";

import api from "../../api/api"; // unified axios

/* ------------------------------------------
   KPI COMPONENT
-------------------------------------------*/
function KPI({ title, value, icon }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 uppercase">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-800 dark:text-white">
            {value}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [kpis, setKpis] = useState({
    doctors: 0,
    patients: 0,
    departments: 0,
    appointmentsToday: 0,
  });

  const [notifications, setNotifications] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  /* -------------------------------------------------------
     LOAD ADMIN DASHBOARD
  --------------------------------------------------------*/
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        const [kpiData, activityData, notifRes] = await Promise.all([
          getAdminKPIs(),
          getAdminActivity(20),
          api
            .get("/api/admin/notifications?limit=10", {
              withCredentials: true,
            })
            .then((r) => r.data)
            .catch(() => []),
        ]);

        setKpis(kpiData || {});
        setActivity(Array.isArray(activityData) ? activityData : []);
        setNotifications(Array.isArray(notifRes) ? notifRes : []);
      } catch (err) {
        console.error("AdminDashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  /* -------------------------------------------------------
     MARK ALL NOTIFICATIONS READ
  --------------------------------------------------------*/
  const markAllRead = async () => {
    try {
      await api.patch("/api/admin/notifications/mark-read", {}, { withCredentials: true });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage departments, staff, and system operations.
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPI
          title="Departments"
          value={kpis.departments}
          icon={<Building2 size={22} className="text-emerald-600" />}
        />
        <KPI
          title="Doctors"
          value={kpis.doctors}
          icon={<UserCheck size={22} className="text-emerald-600" />}
        />
        <KPI
          title="Patients"
          value={kpis.patients}
          icon={<Users2 size={22} className="text-emerald-600" />}
        />
        <KPI
          title="Appointments Today"
          value={kpis.appointmentsToday}
          icon={<CalendarCheck size={22} className="text-emerald-600" />}
        />
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* LEFT PANEL */}
        <div className="col-span-12 lg:col-span-8 space-y-6">

          {/* ACTIVITY LOG */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-lg mb-4">Recent Activity</h3>

            <div className="max-h-72 overflow-y-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs text-slate-400 border-b">
                    <th className="py-2">Time</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Target</th>
                  </tr>
                </thead>

                <tbody>
                  {activity.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-6 text-center text-slate-400">
                        No activity found
                      </td>
                    </tr>
                  ) : (
                    activity.map((a) => (
                      <tr
                        key={a._id || a.timestamp}
                        className="border-b hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <td className="py-2 text-sm text-slate-500">
                          {new Date(a.timestamp).toLocaleString()}
                        </td>
                        <td className="py-2 text-sm">{a.userName}</td>
                        <td className="py-2 text-sm">{a.action}</td>
                        <td className="py-2 text-sm text-slate-500">
                          {a.target}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* MANAGEMENT LINKS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <Link
              to="/admin/departments"
              className="bg-white dark:bg-slate-900 border rounded-xl p-6 shadow hover:shadow-lg transition"
            >
              <div className="flex items-center gap-3 mb-3">
                <Building2 size={24} className="text-brand" />
                <h3 className="text-lg font-semibold">Departments</h3>
              </div>
              <p className="text-sm text-slate-500">
                Create & manage hospital departments.
              </p>
            </Link>

            <Link
              to="/admin/users"
              className="bg-white dark:bg-slate-900 border rounded-xl p-6 shadow hover:shadow-lg transition"
            >
              <div className="flex items-center gap-3 mb-3">
                <Users2 size={24} className="text-brand" />
                <h3 className="text-lg font-semibold">Users & Roles</h3>
              </div>
              <p className="text-sm text-slate-500">
                Manage staff accounts & permissions.
              </p>
            </Link>

            <Link
              to="/admin/system"
              className="bg-white dark:bg-slate-900 border rounded-xl p-6 shadow hover:shadow-lg transition"
            >
              <div className="flex items-center gap-3 mb-3">
                <Settings size={24} className="text-brand" />
                <h3 className="text-lg font-semibold">System Settings</h3>
              </div>
              <p className="text-sm text-slate-500">
                Configure preferences & audit logs.
              </p>
            </Link>

          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="col-span-12 lg:col-span-4 space-y-6">

          {/* NOTIFICATIONS */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Notifications</h3>
              <button onClick={markAllRead} className="text-xs text-emerald-600">
                Mark all read
              </button>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-sm text-slate-400">No notifications</p>
              ) : (
                notifications.map((n) => (
                  <div key={n._id || n.timestamp} className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-md">
                      <Bell size={18} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-slate-400">{n.message}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(n.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border">
            <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate("/admin/departments")}
                className="py-2 text-sm border rounded-lg flex items-center justify-center gap-2"
              >
                <FolderPlus size={16} /> Add Dept
              </button>

              <button
                onClick={() => navigate("/admin/users")}
                className="py-2 text-sm border rounded-lg flex items-center justify-center gap-2"
              >
                <Users2 size={16} /> Add Doctor
              </button>

              <button className="py-2 text-sm border rounded-lg">
                Generate Report
              </button>
              <button className="py-2 text-sm border rounded-lg">
                Export Data
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
