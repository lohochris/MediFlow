// src/pages/Doctor/DoctorAppointments.jsx
import React, { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { CheckCircle, XCircle } from "lucide-react";

import {
  getDoctorAppointments,
  updateAppointmentStatus,
} from "../../services/appointmentService";

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  /* -------------------------------------------
     Load appointments assigned to this doctor
  --------------------------------------------*/
  const loadAppointments = async () => {
    try {
      setLoading(true);

      const data = await getDoctorAppointments();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Loading error:", err);
      toast.error("Failed to load doctor appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  /* -------------------------------------------
     Search Filter
  --------------------------------------------*/
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return appointments;

    return appointments.filter((a) => {
      const patientName = a.patient?.name?.toLowerCase() || "";
      return (
        patientName.includes(q) ||
        (a.type || "").toLowerCase().includes(q) ||
        (a.date || "").toLowerCase().includes(q) ||
        (a.time || "").toLowerCase().includes(q)
      );
    });
  }, [appointments, query]);

  /* -------------------------------------------
     Update Status
  --------------------------------------------*/
  const changeStatus = async (id, status) => {
    try {
      await updateAppointmentStatus(id, status);
      toast.success("Status updated");
      loadAppointments();
    } catch (err) {
      console.error("Update status error:", err);
      toast.error("Failed to update appointment");
    }
  };

  const statusColors = {
    pending: "bg-amber-100 text-amber-700",
    completed: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">
            My Appointments
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            View and manage appointments assigned to you.
          </p>
        </div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          className="hidden md:block w-72 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2"
        />
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="py-10 text-center text-slate-500">
          Loading appointments…
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow overflow-hidden">
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
                  <td className="text-center py-10 text-slate-500" colSpan="6">
                    No appointments found.
                  </td>
                </tr>
              ) : (
                filtered.map((appt) => {
                  const id = appt.id || appt._id;

                  return (
                    <tr
                      key={id}
                      className="border-t hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-4 py-3">{appt.patient?.name || "—"}</td>
                      <td className="px-4 py-3">{appt.date}</td>
                      <td className="px-4 py-3">{appt.time}</td>
                      <td className="px-4 py-3">{appt.type}</td>

                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-md text-xs font-medium ${
                            statusColors[appt.status] ||
                            "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {appt.status
                            ? appt.status.charAt(0).toUpperCase() +
                              appt.status.slice(1)
                            : "—"}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-3">
                          {/* Mark Completed */}
                          <button
                            onClick={() => changeStatus(id, "completed")}
                            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
                          >
                            <CheckCircle
                              size={18}
                              className="text-emerald-600"
                            />
                          </button>

                          {/* Cancel */}
                          <button
                            onClick={() => changeStatus(id, "cancelled")}
                            className="p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <XCircle size={18} className="text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
