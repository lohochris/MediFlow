import React, { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import { useAuth } from "../context/AuthContext";
import { getAllPatients, createPatient } from "../services/patientService";
import { getAllAppointments } from "../services/appointmentService";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    condition: "",
  });


  /* --------------------------------------------------------------------------
     DASHBOARD STATE CHECK
  -------------------------------------------------------------------------- */
  // Use the robust virtual property from the backend
  const isProfileComplete = useMemo(() => {
    if (user?.role !== "Patient") return true; 

    // Check the profile completion status
    return user.patientProfile?.isProfileComplete === true;
  }, [user]);


  /* --------------------------------------------------------------------------
     LOAD DASHBOARD DATA (Admin + Doctor)
  -------------------------------------------------------------------------- */
  const load = async () => {
    try {
      setLoading(true);

      if (user.role === "Patient") {
        setLoading(false);
        return;
      }

      const [p, a] = await Promise.all([
        getAllPatients(),
        getAllAppointments(),
      ]);

      setPatients(Array.isArray(p) ? p : []);
      setAppointments(Array.isArray(a) ? a : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) load();
  }, [user]);

  /* =========================================================================
     AGE CALCULATION & HANDLERS
  ========================================================================= */
  const calculateAge = (dob) => {
    if (!dob) return null;
    const birth = new Date(dob);
    const diff = Date.now() - birth.getTime();
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    // ... (Add patient logic unchanged)
    try {
      const newP = await createPatient(form);
      toast.success("Patient added successfully!");

      setShowAddModal(false);
      setForm({
        name: "",
        email: "",
        phone: "",
        gender: "",
        dob: "",
        condition: "",
      });

      setPatients((prev) => [newP, ...prev]);
    } catch (err) {
      toast.error(err.message || "Failed to add patient");
    }
  };

  /* =========================================================================
     CHART DATA & MEMOS
  ========================================================================= */
  const monthLabel = (year, month) =>
    new Date(year, month, 1).toLocaleString("default", { month: "short" });

  const lastSixMonths = useMemo(() => {
    const arr = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
      arr.push({ year: dt.getFullYear(), month: dt.getMonth() });
    }
    return arr;
  }, []);

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

  const growth = useMemo(() => {
    const vals = monthlyData.map((d) => d.value);
    const last = vals.at(-1) ?? 0;
    const prev = vals.at(-2) ?? 0;

    if (prev === 0) return last > 0 ? 100 : 0;
    return Math.round(((last - prev) / prev) * 100);
  }, [monthlyData]);

  const recentPatients = useMemo(() => {
    const sorted = [...patients].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    return sorted.slice(0, 5);
  }, [patients]);

  const upcoming = useMemo(() => {
    const now = new Date();
    return appointments
      .filter(
        (a) =>
          new Date(`${a.date}T${a.time ?? "00:00"}`) >= now
      )
      .sort(
        (x, y) =>
          new Date(`${x.date}T${x.time ?? "00:00"}`) -
          new Date(`${y.date}T${y.time ?? "00:00"}`)
      )
      .slice(0, 6);
  }, [appointments]);

  /* =========================================================================
     SKELETON LOADER & GUARD CLAUSE
  ========================================================================= */
  const SkeletonCard = () => (
    <div className="animate-pulse bg-white dark:bg-slate-800 rounded-xl p-5 shadow-card h-28" />
  );

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600"></div>
      </div>
    );
  }

  /* =========================================================================
     UI
  ========================================================================= */
  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="relative rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-sky-500 text-white p-6 rounded-2xl">
          <h1 className="text-2xl font-bold">
            Welcome back, {user?.name || "User"}
          </h1>
          <p className="text-sm opacity-90 mt-1">
            Here’s what’s happening today.
          </p>
        </div>
      </div>
      
      {/* REMOVED: CONDITIONAL PROFILE COMPLETION NOTIFICATION CARD */}


      {/* PATIENT DASHBOARD */}
      {user.role === "Patient" ? (
        <div className="text-center mt-10 text-slate-600">
          <h2 className="text-xl font-semibold mb-3">Your Dashboard</h2>
          <p className="text-sm text-slate-500">
            Use the buttons below to manage your profile and schedule appointments.
          </p>

          {/* Unified Action Buttons: Profile Action is always adjacent to Appointment */}
          <div className="mt-6 flex justify-center gap-4">
            
            {/* 1. Book Appointment Button (Now always primary and clickable) */}
            <button
              onClick={() => navigate("/book-appointment")}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg transition-colors hover:bg-emerald-700"
            >
              Book Appointment
            </button>

            {/* 2. Profile Action Button (Now always secondary) */}
            <button
              onClick={() => navigate("/complete-profile")}
              className="px-6 py-3 border border-emerald-600 text-emerald-600 rounded-lg transition-colors hover:bg-emerald-50"
            >
              {isProfileComplete ? "Update Profile" : "Complete Your Profile"}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* STAT CARDS, QUICK ACTIONS, CHARTS, SIDEBAR (Unchanged) */}
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
                <motion.div className="bg-white dark:bg-slate-900 border rounded-xl p-5 shadow-card">
                  <p className="text-sm text-slate-500">Total Patients</p>
                  <div className="text-2xl font-semibold">{totalPatients}</div>
                </motion.div>

                <motion.div className="bg-white dark:bg-slate-900 border rounded-xl p-5 shadow-card">
                  <p className="text-sm text-slate-500">Appointments</p>
                  <div className="text-2xl font-semibold">{totalAppointments}</div>
                </motion.div>

                <motion.div className="bg-white dark:bg-slate-900 border rounded-xl p-5 shadow-card">
                  <p className="text-sm text-slate-500">This Month</p>
                  <div className="text-2xl font-semibold">
                    {monthlyData.at(-1)?.value ?? 0}
                  </div>
                  <div className="text-xs mt-2 text-slate-500">
                    {growth >= 0 ? (
                      <span className="text-emerald-600">▲ {growth}%</span>
                    ) : (
                      <span className="text-red-500">▼ {Math.abs(growth)}%</span>
                    )}
                  </div>
                </motion.div>

                <motion.div className="bg-white dark:bg-slate-900 border rounded-xl p-5 shadow-card">
                  <p className="text-sm text-slate-500">Active Alerts</p>
                  <div className="text-2xl font-semibold">—</div>
                </motion.div>
              </>
            )}
          </div>

          <motion.div className="bg-white dark:bg-slate-900 border p-6 rounded-xl shadow-card">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="flex gap-4">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg flex items-center gap-2"
              >
                <Plus size={18} /> Add Patient
              </button>

              <button
                onClick={() => navigate("/book-appointment")}
                className="px-5 py-2.5 border border-emerald-600 text-emerald-600 rounded-lg"
              >
                + Book Appointment
              </button>
            </div>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-card border">
              <h3 className="text-lg font-semibold mb-3">Monthly Appointments</h3>

              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#10b981"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-card border">
              <h4 className="text-md font-semibold mb-3">Recent Patients</h4>

              {loading ? (
                <div className="space-y-3">
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              ) : (
                <ul className="space-y-3">
                  {recentPatients.map((p) => (
                    <li key={p.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-semibold">
                        {p.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-slate-500">
                          {p.phone || "—"}
                        </div>
                      </div>
                      <div className="text-xs text-slate-500">
                        {calculateAge(p.dob) || "—"} yrs
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <h4 className="text-md font-semibold mt-6 mb-3">
                Upcoming Appointments
              </h4>

              {upcoming.length === 0 ? (
                <div className="text-sm text-slate-500">
                  No upcoming appointments
                </div>
              ) : (
                <ul className="space-y-3">
                  {upcoming.map((a) => {
                    const patient = patients.find(
                      (p) => p.id === a.patientId
                    );

                    return (
                      <li key={a.id} className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-sm">
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
        </>
      )}
    </div>
  );
}