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

// Reusable KPI Card
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

  // SAFELY parse JSON, fallback to array/object
  const safeJson = async (res, fallback) => {
    try {
      if (!res.ok) return fallback;
      const data = await res.json();
      return Array.isArray(fallback) ? (Array.isArray(data) ? data : fallback) : data;
    } catch {
      return fallback;
    }
  };

  /* Load Admin Data */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const [kpiRes, notifRes, actRes] = await Promise.all([
          safeJson(await fetch("/api/admin/kpis", { credentials: "include" }), {}),
          safeJson(await fetch("/api/admin/notifications?limit=10", { credentials: "include" }), []),
          safeJson(await fetch("/api/admin/activity?limit=20", { credentials: "include" }), []),
        ]);

        setKpis(kpiRes || {});
        setNotifications(notifRes || []);
        setActivity(actRes || []);
      } catch (err) {
        console.error("Error loading admin dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const markAllRead = async () => {
    try {
      await fetch("/api/admin/notifications/mark-read", {
        method: "PATCH",
        credentials: "include",
      });
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage departments, staff, and system operations.
        </p>
      </div>

      {/* KPI Section */}
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
        {/* Left Section */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Activity Log */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Recent Activity</h3>
              <span className="text-sm text-slate-400">Latest 20 entries</span>
            </div>

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
                        key={a._id}
                        className="border-b hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <td className="py-2 text-sm text-slate-500">
                          {new Date(a.timestamp).toLocaleString()}
                        </td>
                        <td className="py-2 text-sm">{a.userName}</td>
                        <td className="py-2 text-sm">{a.action}</td>
                        <td className="py-2 text-sm text-slate-500">{a.target}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Management Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              to="/admin/departments"
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-card hover:shadow-lg transition transform hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-3">
                <Building2 className="text-brand" size={24} />
                <h3 className="text-lg font-semibold">Departments</h3>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Create and manage hospital departments.
              </p>
            </Link>

            <Link
              to="/admin/users"
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-card hover:shadow-lg transition transform hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-3">
                <Users2 className="text-brand" size={24} />
                <h3 className="text-lg font-semibold">Users & Roles</h3>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Manage staff accounts & permissions.
              </p>
            </Link>

            <Link
              to="/admin/system"
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-card hover:shadow-lg transition transform hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-3">
                <Settings className="text-brand" size={24} />
                <h3 className="text-lg font-semibold">System Settings</h3>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Configure preferences & audit logs.
              </p>
            </Link>
          </div>
        </div>

        {/* Right Section */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Notifications */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
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
                  <div key={n._id} className="flex items-start gap-3">
                    <div className="p-2 rounded-md bg-emerald-50 dark:bg-emerald-900/20">
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

          {/* Quick Actions */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate("/admin/departments")}
                className="py-2 rounded-lg border text-sm flex items-center justify-center gap-2 border-slate-200 dark:border-slate-700"
              >
                <FolderPlus size={16} /> Add Dept
              </button>

              <button
                onClick={() => navigate("/admin/users")}
                className="py-2 rounded-lg border text-sm flex items-center justify-center gap-2 border-slate-200 dark:border-slate-700"
              >
                <Users2 size={16} /> Add Doctor
              </button>

              <button className="py-2 rounded-lg border text-sm border-slate-200 dark:border-slate-700">
                Generate Report
              </button>

              <button className="py-2 rounded-lg border text-sm border-slate-200 dark:border-slate-700">
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
