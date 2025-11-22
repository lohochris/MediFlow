// src/pages/Doctor/DoctorDashboard.jsx
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  Stethoscope,
  Bell,
  Users,
} from "lucide-react";

import {
  getTodayAppointments,
  getDoctorPatients,
} from "../../services/doctorService";

import api from "../../api/api";

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  /* -----------------------------------------------------
     LOAD DASHBOARD DATA
  ------------------------------------------------------*/
  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [todayAppt, patientList, notif, profile] = await Promise.all([
        getTodayAppointments().catch(() => []),
        getDoctorPatients().catch(() => []),

        api
          .get("/api/notifications?limit=10")
          .then((r) => r.data)
          .catch(() => []),

        api
          .get("/api/users/me")
          .then((r) => r.data)
          .catch(() => null),
      ]);

      setAppointments(Array.isArray(todayAppt) ? todayAppt : []);
      setPatients(Array.isArray(patientList) ? patientList : []);
      setNotifications(Array.isArray(notif) ? notif : []);
      setDoctor(profile);
    } catch (err) {
      console.error("Dashboard load error:", err);
      toast.error("Failed to load doctor dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  /* -----------------------------------------------------
     COMPUTED VALUES
  ------------------------------------------------------*/
  const todayStr = new Date().toISOString().slice(0, 10);

  const todays = appointments.filter(
    (a) => (a.date || "").slice(0, 10) === todayStr
  );

  const nextAppointment = (() => {
    const sorted = [...appointments].sort(
      (a, b) =>
        new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)
    );
    return sorted.find((s) => new Date(`${s.date}T${s.time}`) > new Date());
  })();

  /* -----------------------------------------------------
     HELPERS
  ------------------------------------------------------*/
  const gotoPatient = (patientRef) => {
    const pid =
      typeof patientRef === "string"
        ? patientRef
        : patientRef?.id || patientRef?._id;

    if (!pid) {
      toast.error("Could not determine patient ID");
      return;
    }

    navigate(`/doctor/patients/${pid}`);
  };

  /* -----------------------------------------------------
     UI
  ------------------------------------------------------*/
  return (
    <div className="p-6 fade-in">
      {/* HEADER */}
      <h1 className="text-2xl font-semibold text-slate-800 dark:text-white mb-1">
        Doctor Dashboard
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Welcome back{doctor?.name ? `, ${doctor.name}` : ""}.
      </p>

      {/* DOCTOR INFO */}
      <div className="mb-8 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 className="text-lg font-semibold mb-3">Your Profile</h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-slate-800 dark:text-white">
              {doctor?.name || "—"}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Department:{" "}
              <span className="font-medium">
                {doctor?.department || "None"}
              </span>
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Role: Doctor
            </p>
          </div>

          <div className="px-3 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-sm font-semibold">
            {doctor?.isActive ? "Active" : "Inactive"}
          </div>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {/* Patients */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/40">
              <Users className="text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Your Patients</p>
              <p className="text-2xl font-bold">{patients.length}</p>
            </div>
          </div>
        </div>

        {/* Today */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
              <CalendarDays className="text-emerald-600 dark:text-emerald-300" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Today's Appointments</p>
              <p className="text-2xl font-bold">{todays.length}</p>
            </div>
          </div>
        </div>

        {/* Next appointment */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/40">
              <Clock className="text-purple-600 dark:text-purple-300" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Next Appointment</p>
              <p className="text-base font-medium mt-1">
                {nextAppointment ? (
                  <>
                    {nextAppointment.date} at {nextAppointment.time} –{" "}
                    {nextAppointment.patient?.name || "Unknown"}
                  </>
                ) : (
                  "No upcoming appointments"
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* TODAY'S APPOINTMENTS */}
      <div className="bg-white dark:bg-slate-900 border rounded-xl p-6 shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4">Today's Appointments</h2>

        {loading ? (
          <p className="text-center py-6">Loading…</p>
        ) : appointments.length === 0 ? (
          <p className="text-center py-6 text-slate-500">
            No appointments scheduled today.
          </p>
        ) : (
          <div className="space-y-3">
            {appointments.slice(0, 10).map((a) => {
              const id = a.id || a._id;
              const pid = a.patient?.id || a.patient?._id;

              return (
                <div
                  key={id}
                  className="p-4 border rounded-lg flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  <div>
                    <p className="font-medium">{a.patient?.name || "Unknown"}</p>
                    <p className="text-sm text-slate-500">
                      {a.date} • {a.time}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-300">
                      {a.type}
                    </p>

                    <button
                      onClick={() => gotoPatient(pid)}
                      className="px-3 py-1 rounded bg-emerald-600 text-white text-sm"
                    >
                      View
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* NOTIFICATIONS */}
      <div className="bg-white dark:bg-slate-900 border rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Notifications</h2>

        {notifications.length === 0 ? (
          <p className="text-slate-500 text-sm">No notifications</p>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id || n._id} className="flex gap-3">
                <div className="p-2 rounded-md bg-emerald-100 dark:bg-emerald-900/20">
                  <Bell size={18} className="text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold">{n.title}</p>
                  <p className="text-sm text-slate-500">{n.message}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(n.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
