import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import {
  AreaChart,
  Area,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import {
  Bell,
  UserCheck,
  Users,
  CalendarCheck,
  Stethoscope,
} from "lucide-react";

const HEADER_IMAGE_URL = "/mnt/data/23ce51da-0295-4c76-b418-de9281927108.png";

/* ------------------- KPI CARD ------------------- */
function KPI({ title, value, icon }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 uppercase">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-slate-800 dark:text-slate-100">{value}</p>
        </div>
        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">{icon}</div>
      </div>
    </div>
  );
}

/* ------------------- LOADING SPINNER ------------------- */
function SmallSpinner() {
  return (
    <div className="inline-block w-5 h-5 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin" />
  );
}

/* ============================================================
                      SUPERADMIN DASHBOARD
============================================================ */
export default function SuperAdminDashboard() {
  const navigate = useNavigate();

  const [kpis, setKpis] = useState({
    patients: 0,
    doctors: 0,
    appointmentsToday: 0,
    departments: 0,
  });

  const [activity, setActivity] = useState([]);
  const [doctorPerformance, setDoctorPerformance] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ------------------- INITIAL DATA LOAD ------------------- */
  useEffect(() => {
    let mounted = true;

    const fetchAll = async () => {
      try {
        setLoading(true);

        const [kpiRes, actRes, perfRes, trendRes, notifRes] = await Promise.all([
          fetch("/api/admin/kpis", { credentials: "include" }).then((r) =>
            r.ok ? r.json() : {}
          ),
          fetch("/api/admin/activity?limit=50", { credentials: "include" }).then((r) =>
            r.ok ? r.json() : []
          ),
          fetch("/api/admin/doctor-performance", { credentials: "include" }).then((r) =>
            r.ok ? r.json() : []
          ),
          fetch("/api/admin/trends?range=30", { credentials: "include" }).then((r) =>
            r.ok ? r.json() : []
          ),
          fetch("/api/admin/notifications?limit=20", { credentials: "include" }).then((r) =>
            r.ok ? r.json() : []
          ),
        ]);

        if (!mounted) return;

        setKpis(kpiRes || {});
        setActivity(actRes || []);
        setDoctorPerformance(perfRes || []);
        setTrendData(trendRes || []);
        setNotifications(notifRes || []);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAll();
    return () => (mounted = false);
  }, []);

  const topDoctors = useMemo(() => doctorPerformance.slice(0, 8), [doctorPerformance]);

  /* ------------------- MARK ALL NOTIFICATIONS READ ------------------- */
  const markAllRead = async () => {
    try {
      await fetch("/api/admin/notifications/mark-read", {
        method: "PATCH",
        credentials: "include",
      });
      setNotifications((n) => n.map((x) => ({ ...x, read: true })));
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
    }
  };

  /* ============================================================
                          RENDER UI
  ============================================================ */
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      {/* Header */}
      <div className="rounded-2xl overflow-hidden shadow-sm bg-gradient-to-r from-emerald-600 to-emerald-500 text-white p-6 mb-6 flex items-center gap-6">
        <div className="flex-1">
          <h2 className="text-2xl font-bold">Hospital Overview</h2>
          <p className="mt-1 text-slate-100/90">
            Welcome, SuperAdmin — here’s your real-time system overview.
          </p>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPI title="Patients" value={kpis.patients ?? "--"} icon={<Users size={20} />} />
            <KPI title="Doctors" value={kpis.doctors ?? "--"} icon={<UserCheck size={20} />} />
            <KPI title="Appointments Today" value={kpis.appointmentsToday ?? "--"} icon={<CalendarCheck size={20} />} />
            <KPI title="Departments" value={kpis.departments ?? "--"} icon={<Stethoscope size={20} />} />
          </div>
        </div>

        <div className="w-44 h-32 hidden md:block flex-shrink-0">
          <img src={HEADER_IMAGE_URL} alt="Hospital" className="w-full h-full object-cover rounded-lg shadow-inner" />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* LEFT COLUMN */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Trend Chart */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Appointments & Patient Flow (Last 30 days)</h3>
              <p className="text-sm text-slate-400">Auto updates</p>
            </div>

            <div style={{ height: 280 }}>
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <SmallSpinner />
                </div>
              ) : (
                <ResponsiveContainer>
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="appt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="10%" stopColor="#10B981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />

                    <Area type="monotone" dataKey="appointments" stroke="#10B981" fill="url(#appt)" />
                    <Area type="monotone" dataKey="patients" stroke="#0EA5A4" fill="#0EA5A4" fillOpacity={0.1} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Appointments by Day</h3>
              <p className="text-sm text-slate-400">Last 30 days</p>
            </div>

            <div style={{ height: 240 }}>
              {loading ? (
                <div className="flex items-center justify-center h-full"><SmallSpinner /></div>
              ) : (
                <ResponsiveContainer>
                  <BarChart data={trendData.map((d) => ({ name: d.date, appointments: d.appointments }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="appointments" fill="#16A34A" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border">
            <h3 className="text-lg font-semibold mb-3">Recent Activity</h3>

            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs text-slate-400 border-b">
                    <th className="py-2">Time</th>
                    <th className="py-2">User</th>
                    <th className="py-2">Action</th>
                    <th className="py-2">Target</th>
                  </tr>
                </thead>
                <tbody>
                  {activity.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-6 text-slate-400">
                        No recent activity
                      </td>
                    </tr>
                  ) : (
                    activity.map((a) => (
                      <tr key={a._id} className="border-b">
                        <td className="py-3 text-sm">{new Date(a.timestamp).toLocaleString()}</td>
                        <td className="py-3 text-sm">{a.userName}</td>
                        <td className="py-3 text-sm">{a.action}</td>
                        <td className="py-3 text-sm">{a.target}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-span-12 lg:col-span-4 space-y-6">

          {/* Notifications */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Notifications</h3>
              <button onClick={markAllRead} className="text-xs text-emerald-600">
                Mark all read
              </button>
            </div>

            <ul className="space-y-3 max-h-48 overflow-y-auto">
              {notifications.length === 0 ? (
                <li className="text-slate-400 text-sm">No notifications</li>
              ) : (
                notifications.map((n) => (
                  <li key={n._id} className="flex items-start gap-3">
                    <div className="p-2 rounded-md bg-emerald-50 dark:bg-emerald-900/10">
                      <Bell size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-slate-400">{n.message}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(n.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Top Doctors */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border">
            <h3 className="text-lg font-semibold mb-3">Top Doctors</h3>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {topDoctors.length === 0 ? (
                <p className="text-sm text-slate-400">No data</p>
              ) : (
                topDoctors.map((d) => (
                  <div key={d._id} className="flex justify-between items-center">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-semibold">
                        {(d.name || "")
                          .split(" ")
                          .map((x) => x[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium">{d.name}</p>
                        <p className="text-xs text-slate-400">{d.department}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold">{d.completed}</p>
                      <p className="text-xs text-slate-400">completed</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 text-center">
              <button className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm">
                View full report
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border">
            <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>

            <div className="grid grid-cols-2 gap-2">

              <button
                onClick={() => navigate("/admin/departments")}
                className="py-2 rounded-lg border text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                Add Department
              </button>

              <button
                onClick={() => navigate("/admin/users")}
                className="py-2 rounded-lg border text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                Add Doctor
              </button>

              <button
                onClick={async () => {
                  try {
                    const res = await fetch("/api/admin/reports/generate", {
                      method: "POST",
                      credentials: "include",
                    });
                    if (res.ok) alert("Report generated successfully!");
                  } catch (err) {
                    console.error("Report generation failed:", err);
                  }
                }}
                className="py-2 rounded-lg border text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                Generate Report
              </button>

              <button
                onClick={() => window.open("/api/admin/export?format=csv", "_blank")}
                className="py-2 rounded-lg border text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                Export Data
              </button>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
