import { getCurrentUser } from "../services/authService";
import React, { useEffect, useMemo, useState } from "react";
import { Users, Calendar, Activity, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

// FIXED IMPORTS
import { getAllPatients } from "../services/patientService";
import { getAppointments } from "../services/appointmentService";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function Dashboard() {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // FIXED: Load data using correct functions
  const load = async () => {
    try {
      setLoading(true);

      const [p, a] = await Promise.all([
        getAllPatients(),
        getAppointments(), // FIXED
      ]);

      setPatients(Array.isArray(p) ? p : []);
      setAppointments(Array.isArray(a) ? a : []);
    } catch (err) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Utility: month label
  const monthLabel = (year, monthIndex) =>
    new Date(year, monthIndex, 1).toLocaleString("default", { month: "short" });

  // Generate last 6 months
  const lastSixMonths = useMemo(() => {
    const arr = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      arr.push({ year: date.getFullYear(), month: date.getMonth() });
    }
    return arr;
  }, []);

  // Aggregate monthly appointment counts
  const monthlyData = useMemo(() => {
    const counts = lastSixMonths.map(() => 0);

    appointments.forEach((a) => {
      if (!a?.date) return;
      const dt = new Date(a.date);
      if (isNaN(dt)) return;
      lastSixMonths.forEach((m, idx) => {
        if (dt.getFullYear() === m.year && dt.getMonth() === m.month) {
          counts[idx]++;
        }
      });
    });

    return lastSixMonths.map((m, i) => ({
      month: monthLabel(m.year, m.month),
      value: counts[i],
    }));
  }, [appointments, lastSixMonths]);

  const totalPatients = patients.length;
  const totalAppointments = appointments.length;

  // Calculate growth %
  const growth = useMemo(() => {
    const vals = monthlyData.map((d) => d.value);
    const last = vals.at(-1) ?? 0;
    const prev = vals.at(-2) ?? 0;
    if (prev === 0) return last > 0 ? 100 : 0;
    return Math.round(((last - prev) / prev) * 100);
  }, [monthlyData]);

  // Recent patients (last 5)
  const recentPatients = useMemo(() => {
    const sorted = [...patients].sort((a, b) =>
      a.createdAt && b.createdAt
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : (b.id ?? 0) - (a.id ?? 0)
    );
    return sorted.slice(0, 5);
  }, [patients]);

  // Upcoming appointments (next 6)
  const upcoming = useMemo(() => {
    const now = new Date();
    return appointments
      .filter((a) => new Date(`${a.date}T${a.time ?? "00:00"}`) >= now)
      .sort(
        (x, y) =>
          new Date(`${x.date}T${x.time ?? "00:00"}`) -
          new Date(`${y.date}T${y.time ?? "00:00"}`)
      )
      .slice(0, 6);
  }, [appointments]);

  // Skeleton loader card
  const SkeletonCard = () => (
    <div className="animate-pulse bg-white dark:bg-slate-800 rounded-xl p-5 shadow-card h-28"></div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Replaces existing TITLE section */}
<div className="relative rounded-2xl overflow-hidden">
  <div className="bg-gradient-to-r from-emerald-600 to-sky-500 text-white p-6 rounded-2xl">
    <div className="flex items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {getCurrentUser()?.name || "Clinician"}</h1>
        <p className="text-sm opacity-90 mt-1">Here’s what’s happening at your clinic today.</p>
      </div>
      <div className="text-right">
        <div className="text-sm">Today</div>
        <div className="font-semibold">{new Date().toLocaleDateString()}</div>
      </div>
    </div>
  </div>
</div>


      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            {/* Patients */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 border rounded-xl p-5 shadow-card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Patients</p>
                  <div className="text-2xl font-semibold">
                    {totalPatients.toLocaleString()}
                  </div>
                </div>
                <div className="rounded-full bg-emerald-50 p-3 text-emerald-600">
                  <Users size={22} />
                </div>
              </div>
            </motion.div>

            {/* Appointments */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white dark:bg-slate-900 border rounded-xl p-5 shadow-card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Appointments</p>
                  <div className="text-2xl font-semibold">
                    {totalAppointments.toLocaleString()}
                  </div>
                </div>
                <div className="rounded-full bg-sky-50 p-3 text-sky-600">
                  <Calendar size={22} />
                </div>
              </div>
            </motion.div>

            {/* This Month */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-slate-900 border rounded-xl p-5 shadow-card"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-slate-500">This Month</p>
                  <div className="text-2xl font-semibold">
                    {monthlyData.at(-1)?.value ?? 0}
                  </div>
                </div>
                <div className="rounded-full bg-amber-50 p-3 text-amber-600">
                  <TrendingUp size={22} />
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-500">
                {growth >= 0 ? (
                  <span className="text-emerald-600">
                    ▲ {growth}% vs last month
                  </span>
                ) : (
                  <span className="text-red-500">
                    ▼ {Math.abs(growth)}% vs last month
                  </span>
                )}
              </div>
            </motion.div>

            {/* Alerts */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white dark:bg-slate-900 border rounded-xl p-5 shadow-card"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-slate-500">Active Alerts</p>
                  <div className="text-2xl font-semibold">—</div>
                </div>
                <div className="rounded-full bg-red-50 p-3 text-red-600">
                  <Activity size={22} />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* QUICK ACTIONS */}
      {/* QUICK ACTIONS */}
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.15 }}
  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-card"
>
  <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
    Quick Actions
  </h3>

  <div className="flex flex-wrap gap-4">
    
    {/* Add Patient */}
    <button
      onClick={() => (window.location.href = "/patients")}
      className="px-5 py-2.5 bg-brand text-white rounded-lg shadow-sm hover:bg-brand-dark transition"
    >
      + Add Patient
    </button>

    {/* Book Appointment → FIXED */} 
    <button
      onClick={() => (window.location.href = "/book-appointment")}
      className="px-5 py-2.5 border border-emerald-600 
                 text-emerald-600 rounded-lg 
                 hover:bg-emerald-50 transition"
    >
      + Book Appointment
    </button>

  </div>
</motion.div>


      {/* MAIN GRID - CHART & SIDEBAR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-card border"
        >
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-3">
            Monthly Appointments
          </h3>

          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyData}
                margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fill: "#64748b" }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Right Column */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-card border"
        >
          {/* Recent Patients */}
          <h4 className="text-md font-semibold text-slate-800 dark:text-white mb-3">
            Recent Patients
          </h4>

          {loading ? (
            <div className="space-y-3">
              <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"></div>
              <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"></div>
            </div>
          ) : (
            <ul className="space-y-3">
              {recentPatients.map((p) => (
                <li key={p.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-semibold">
                    {p.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-800 dark:text-white">
                      {p.name}
                    </div>
                    <div className="text-xs text-slate-500">{p.phone}</div>
                  </div>
                  <div className="text-xs text-slate-500">{p.age} yrs</div>
                </li>
              ))}
            </ul>
          )}

          {/* Upcoming Appointments */}
          <h4 className="text-md font-semibold text-slate-800 dark:text-white mt-6 mb-3">
            Upcoming Appointments
          </h4>

          {upcoming.length === 0 ? (
            <div className="text-sm text-slate-500">No upcoming appointments</div>
          ) : (
            <ul className="space-y-3">
              {upcoming.map((a) => {
                const patient = patients.find((p) => p.id === a.patientId);
                return (
                  <li key={a.id} className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-slate-800 dark:text-white text-sm">
                        {patient?.name || "Unknown"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {a.date} • {a.time}
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs h-fit">
                      {a.type}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </motion.div>
      </div>
    </div>
  );
}
