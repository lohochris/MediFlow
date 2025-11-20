// src/pages/Doctor/DoctorDashboard.jsx
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
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

  const todays = appointments.filter(a => (a.date || "").slice(0,10) === today);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Doctor Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white dark:bg-slate-800 rounded shadow">
          <div className="text-sm text-slate-500">Total Appointments</div>
          <div className="text-2xl font-bold">{appointments.length}</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-800 rounded shadow">
          <div className="text-sm text-slate-500">Today's Appointments</div>
          <div className="text-2xl font-bold">{todays.length}</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-800 rounded shadow">
          <div className="text-sm text-slate-500">Next Appointment</div>
          <div className="text-lg">
            {appointments.length === 0 ? "—" : (
              (() => {
                const sorted = [...appointments].sort((a,b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
                const next = sorted.find(s => new Date(`${s.date}T${s.time}`) > new Date());
                return next ? `${next.date} ${next.time} — ${next.patient?.name || "Unknown"}` : "No upcoming";
              })()
            )}
          </div>
        </div>
      </div>

      <section className="bg-white dark:bg-slate-800 rounded p-4">
        <h2 className="text-lg font-medium mb-3">Upcoming Appointments</h2>
        {appointments.length === 0 ? (
          <div className="text-sm text-slate-500">No appointments scheduled.</div>
        ) : (
          <div className="space-y-2">
            {appointments.slice(0, 10).map(a => (
              <div key={a.id || a._id} className="p-3 border rounded flex items-center justify-between">
                <div>
                  <div className="font-medium">{a.patient?.name || "Unknown"}</div>
                  <div className="text-sm text-slate-500">{a.date} • {a.time}</div>
                </div>
                <div className="text-sm text-slate-500">{a.type}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
