import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
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

import api from "../../api/api";

// ✅ Import your actual logo
import Logo from "../../assets/logo.png";

/* KPI CARD */
function KPI({ title, value, icon }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 uppercase">{title}</p>
          <p className="mt-1 text-2xl font-semibold dark:text-white">
            {value}
          </p>
        </div>
        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  );
}

/* SMALL SPINNER */
function SmallSpinner() {
  return (
    <div className="inline-block w-5 h-5 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin"></div>
  );
}

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
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  /* LOAD SUPERADMIN DATA */
  useEffect(() => {
    let mount = true;

    const load = async () => {
      setLoading(true);
      try {
        const [
          kpiRes,
          actRes,
          perfRes,
          trendRes,
          notifRes,
          adminsRes,
        ] = await Promise.all([
          api.get("/api/admin/kpis", { withCredentials: true }).catch(() => ({ data: {} })),
          api.get("/api/admin/activity?limit=50", { withCredentials: true }).catch(() => ({ data: [] })),
          api.get("/api/admin/doctor-performance", { withCredentials: true }).catch(() => ({ data: [] })),
          api.get("/api/admin/trends?range=30", { withCredentials: true }).catch(() => ({ data: [] })),
          api.get("/api/admin/notifications?limit=20", { withCredentials: true }).catch(() => ({ data: [] })),
          api.get("/api/superadmin/admins", { withCredentials: true }).catch(() => ({ data: [] })),
        ]);

        if (!mount) return;

        setKpis(kpiRes.data || {});
        setActivity(Array.isArray(actRes.data) ? actRes.data : []);
        setDoctorPerformance(Array.isArray(perfRes.data) ? perfRes.data : []);
        setTrendData(Array.isArray(trendRes.data) ? trendRes.data : []);
        setNotifications(Array.isArray(notifRes.data) ? notifRes.data : []);
        setAdmins(Array.isArray(adminsRes.data) ? adminsRes.data : []);
      } catch (err) {
        console.error("SuperAdmin dashboard load error:", err);
      } finally {
        if (mount) setLoading(false);
      }
    };

    load();
    return () => (mount = false);
  }, []);

  const topDoctors = useMemo(
    () => doctorPerformance.slice(0, 8),
    [doctorPerformance]
  );

  /* MARK NOTIFICATIONS READ */
  const markAllRead = async () => {
    try {
      await api.patch("/api/admin/notifications/mark-read", {}, { withCredentials: true });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Mark read failed:", err);
    }
  };

  /* ---------------------- UI ---------------------- */
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">

      {/* HEADER */}
      <div className="rounded-2xl overflow-hidden shadow-sm bg-gradient-to-r from-emerald-600 to-emerald-500 text-white p-6 mb-6 flex items-center gap-6">
       
        {/* LEFT SIDE */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold">Hospital Overview</h2>
          <p className="mt-1 text-slate-100/90">Welcome, SuperAdmin — here’s your global system overview.</p>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPI title="Patients" value={kpis.patients ?? "--"} icon={<Users size={20} />} />
            <KPI title="Doctors" value={kpis.doctors ?? "--"} icon={<UserCheck size={20} />} />
            <KPI title="Appointments Today" value={kpis.appointmentsToday ?? "--"} icon={<CalendarCheck size={20} />} />
            <KPI title="Departments" value={kpis.departments ?? "--"} icon={<Stethoscope size={20} />} />
          </div>
        </div>

        {/* RIGHT SIDE — LOGO */}
        <div className="hidden md:block w-44 h-32">
          <img
            src={Logo}
            alt="Hospital Logo"
            className="w-full h-full object-contain rounded-lg drop-shadow"
          />
        </div>
      </div>

      {/* GRID CONTENT */}
      <div className="grid grid-cols-12 gap-6">
       
        {/* LEFT COLUMN */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
         
          {/* TRENDS CHART */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Appointments & Patient Flow (30 days)</h3>
              <p className="text-sm text-slate-400">Auto updates</p>
            </div>

            <div style={{ height: 280 }}>
              {loading ? (
                <div className="flex items-center justify-center h-full"><SmallSpinner /></div>
              ) : (
                <ResponsiveContainer>
                  <AreaChart data={trendData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area dataKey="appointments" stroke="#10B981" fill="#10B98140" />
                    <Area dataKey="patients" stroke="#0EA5A4" fill="#0EA5A420" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* BAR CHART */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Appointments by Day</h3>
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

          {/* ACTIVITY LOG */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Recent Activity</h3>

            <div className="max-h-64 overflow-y-auto">
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
                    <tr><td colSpan="4" className="py-6 text-center text-slate-400">No recent activity</td></tr>
                  ) : (
                    activity.map((a) => (
                      <tr key={a._id} className="border-b">
                        <td className="py-2 text-sm">{new Date(a.timestamp).toLocaleString()}</td>
                        <td className="py-2 text-sm">{a.userName}</td>
                        <td className="py-2 text-sm">{a.action}</td>
                        <td className="py-2 text-sm text-slate-400">{a.target}</td>
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

          {/* NOTIFICATIONS */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Notifications</h3>
              <button onClick={markAllRead} className="text-xs text-emerald-600">
                Mark all read
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-3">
              {notifications.length === 0 ? (
                <p className="text-sm text-slate-400">No notifications</p>
              ) : (
                notifications.map((n) => (
                  <div key={n._id} className="flex gap-3 items-start">
                    <div className="p-2 rounded-md bg-emerald-50 dark:bg-emerald-900/20">
                      <Bell size={18} />
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

          {/* TOP DOCTORS */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Top Doctors</h3>

            <div className="max-h-72 overflow-y-auto space-y-3">
              {topDoctors.length === 0 ? (
                <p className="text-sm text-slate-400">No data</p>
              ) : (
                topDoctors.map((d) => (
                  <div key={d._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
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

            <div className="text-center mt-4">
              <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm">
                View Full Report
              </button>
            </div>
          </div>

          {/* ADMINS LIST */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Admins</h3>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {admins.length === 0 ? (
                <p className="text-sm text-slate-400">No admins found</p>
              ) : (
                admins.map((a) => (
                  <div key={a._id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{a.name}</p>
                      <p className="text-xs text-slate-400">{a.email}</p>
                    </div>

                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg">
                      Admin
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border shadow-sm">
            <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => navigate("/admin/departments")}
                className="py-2 border rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Add Department
              </button>

              <button
                onClick={() => navigate("/admin/users")}
                className="py-2 border rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Add Doctor
              </button>

              <button
                onClick={() => navigate("/superadmin/add-admin")}
                className="py-2 border rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Add Admin
              </button>

              <button
                onClick={async () => {
                  try {
                    const res = await api.post("/api/admin/reports/generate", {}, { withCredentials: true });
                    if (res.status === 200) alert("Report generated!");
                  } catch (err) {
                    console.error("Generate report failed:", err);
                  }
                }}
                className="py-2 border rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Generate Report
              </button>

              <button
                onClick={() => window.open("/api/admin/export?format=csv", "_blank")}
                className="py-2 border rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Export Data
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
