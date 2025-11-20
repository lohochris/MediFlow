import React, { useState, useEffect, useMemo } from "react";
import { CalendarPlus, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import AppointmentModal from "../components/appointments/AppointmentModal";

import {
  getAllAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "../services/appointmentService";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editAppt, setEditAppt] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getAllAppointments();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return appointments;

    return appointments.filter((a) => {
      const name = a.patient?.name?.toLowerCase() || "";
      return (
        name.includes(q) ||
        (a.type || "").toLowerCase().includes(q) ||
        (a.date || "").toLowerCase().includes(q) ||
        (a.time || "").toLowerCase().includes(q)
      );
    });
  }, [appointments, query]);

  const getStatus = (date, time) => {
    const apptDateTime = new Date(`${date}T${time}`);
    return apptDateTime < new Date() ? "Completed" : "Upcoming";
  };

  const statusStyles = {
    Upcoming: "bg-emerald-100 text-emerald-700",
    Completed: "bg-slate-200 text-slate-700",
  };

  const typeColors = {
    Checkup: "bg-blue-100 text-blue-700",
    Consultation: "bg-amber-100 text-amber-700",
    Dental: "bg-teal-100 text-teal-700",
    Emergency: "bg-red-100 text-red-700",
    Surgery: "bg-purple-100 text-purple-700",
  };

  /* -----------------------------------------
     FIXED: Always send backend the correct key
  ----------------------------------------- */
  const handleSave = async (form) => {
    try {
      const payload = {
        patientId: form.patient || form.patientId,
        date: form.date,
        time: form.time,
        type: form.type,
      };

      if (editAppt) {
        await updateAppointment(editAppt.id, payload);
        toast.success("Appointment updated");
      } else {
        await createAppointment(payload);
        toast.success("Appointment created");
      }

      setModalOpen(false);
      setEditAppt(null);
      await loadData();
    } catch (err) {
      console.error("SAVE ERROR:", err);
      toast.error("Error saving appointment");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete appointment?")) return;

    try {
      await deleteAppointment(id);
      toast.success("Appointment deleted");
      loadData();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const openEdit = (appt) => {
    setEditAppt(appt);
    setModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">
            Appointments
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage and schedule patient appointments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patient, date, or type..."
            className="hidden md:block w-80 border rounded-lg px-3 py-2"
          />

          <button
            onClick={() => {
              setEditAppt(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg shadow-sm"
          >
            <CalendarPlus size={16} /> New Appointment
          </button>
        </div>
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
                <th className="px-4 py-3 text-left">Patient</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Time</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
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

                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium ${
                          typeColors[a.type] || "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {a.type}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium ${
                          statusStyles[getStatus(a.date, a.time)]
                        }`}
                      >
                        {getStatus(a.date, a.time)}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => openEdit(a)}
                          className="p-2 rounded-md hover:bg-slate-100"
                        >
                          <Pencil size={16} className="text-emerald-600" />
                        </button>

                        <button
                          onClick={() => handleDelete(a.id)}
                          className="p-2 rounded-md hover:bg-red-50"
                        >
                          <Trash2 size={16} className="text-red-600" />
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

      {/* Modal — now receives unique patients list */}
      <AppointmentModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditAppt(null);
        }}
        onSave={handleSave}
        editData={editAppt}
        patients={[
          ...new Map(
            appointments
              .map((a) => a.patient)
              .filter((p) => p && p.id)
              .map((p) => [p.id, p])
          ).values() // unique patients
        ]}
      />
    </div>
  );
}
