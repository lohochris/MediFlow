import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CalendarDays, Clock, Stethoscope } from "lucide-react";
import { getDoctorAppointments } from "../../services/appointmentService";

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const appts = await getDoctorAppointments();
      setAppointments(Array.isArray(appts) ? appts : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const todays = appointments.filter((a) => (a.date || "").slice(0, 10) === today);

  const nextAppointment = (() => {
    const sorted = [...appointments].sort(
      (a, b) =>
        new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)
    );
    return sorted.find(
      (s) => new Date(`${s.date}T${s.time}`) > new Date()
    );
  })();

  return (
    <div className="p-6 fade-in">
      {/* Header */}
      <h1 className="text-2xl font-semibold text-slate-800 dark:text-white mb-2">
        Doctor Dashboard
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Overview of your schedule and upcoming appointments.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">

        {/* Total Appointments */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow transition">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/40">
              <Stethoscope className="text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <div className="text-sm text-slate-500">Total Appointments</div>
              <div className="text-2xl font-bold">{appointments.length}</div>
            </div>
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow transition">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
              <CalendarDays className="text-emerald-600 dark:text-emerald-300" />
            </div>
            <div>
              <div className="text-sm text-slate-500">Today's Appointments</div>
              <div className="text-2xl font-bold">{todays.length}</div>
            </div>
          </div>
        </div>

        {/* Next Appointment */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow transition">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/40">
              <Clock className="text-purple-600 dark:text-purple-300" />
            </div>
            <div>
              <div className="text-sm text-slate-500">Next Appointment</div>
              <div className="text-base font-medium mt-1">
                {nextAppointment ? (
                  <>
                    <span className="font-semibold">
                      {nextAppointment.date} at {nextAppointment.time}
                    </span>{" "}
                    — {nextAppointment.patient?.name || "Unknown"}
                  </>
                ) : (
                  "No upcoming appointments"
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
          Upcoming Appointments
        </h2>

        {loading ? (
          <div className="py-10 text-slate-500 text-center">Loading…</div>
        ) : appointments.length === 0 ? (
          <div className="py-6 text-slate-500 text-center">
            No appointments scheduled.
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.slice(0, 10).map((a) => (
              <div
                key={a._id || a.id}
                className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg 
                           flex items-center justify-between hover:bg-slate-50 
                           dark:hover:bg-slate-800 transition"
              >
                <div>
                  <div className="font-medium text-slate-800 dark:text-white">
                    {a.patient?.name || "Unknown"}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {a.date} • {a.time}
                  </div>
                </div>

                <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {a.type}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
