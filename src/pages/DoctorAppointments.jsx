import React, { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { CalendarDays, CheckCircle, XCircle } from "lucide-react";

import {
  getDoctorAppointments,
  updateAppointmentStatus,
} from "../../services/appointmentService";

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);

      const apptData = await getDoctorAppointments();
      setAppointments(Array.isArray(apptData) ? apptData : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* -------------------------------------------
     Filter Appointments
  --------------------------------------------*/
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return appointments;

    return appointments.filter((a) => {
      const patientName = a.patient?.name?.toLowerCase() || "";
      return (
        patientName.includes(q) ||
        a.type.toLowerCase().includes(q) ||
        a.date.includes(q) ||
        a.time.includes(q)
      );
    });
  }, [appointments, query]);

  /* -------------------------------------------
     Update Appointment Status
  --------------------------------------------*/
  const updateStatus = async (id, status) => {
    try {
      await updateAppointmentStatus(id, status);
      toast.success("Status updated");
      loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  const statusColors = {
    pending: "bg-amber-100 text-amber-700",
    completed: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">
            My Appointments
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Appointments assigned to you as a doctor.
          </p>
        </div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search patient, type, or date..."
          className="hidden md:block w-80 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2"
        />
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500">
          Loading appointments...
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border rounded-xl shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800">
              <tr>
                <th className="text-left px-4 py-3">Patient</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Time</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-center px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center">
                    No appointments found.
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr
                    key={a.id}
                    className="border-t hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-4 py-3">{a.patient?.name || "Unknown"}</td>
                    <td className="px-4 py-3">{a.date}</td>
                    <td className="px-4 py-3">{a.time}</td>
                    <td className="px-4 py-3">{a.type}</td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium ${
                          statusColors[a.status]
                        }`}
                      >
                        {a.status.charAt(0).toUpperCase() +
                          a.status.slice(1)}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => updateStatus(a.id, "completed")}
                          className="p-2 rounded-md hover:bg-slate-100"
                        >
                          <CheckCircle
                            className="text-emerald-600"
                            size={18}
                          />
                        </button>

                        <button
                          onClick={() => updateStatus(a.id, "cancelled")}
                          className="p-2 rounded-md hover:bg-red-50"
                        >
                          <XCircle className="text-red-600" size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
