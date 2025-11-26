// src/components/appointments/AppointmentModal.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function AppointmentModal({
  open,
  onClose,
  onSave,
  editData,
  patients = [],
}) {
  const [form, setForm] = useState({
    patient: "",
    date: "",
    time: "",
    type: "",
  });

  /* ============================================================
     LOAD INITIAL VALUES
  ============================================================ */
  useEffect(() => {
    if (!open) return;

    if (editData) {
      const patientId =
        editData.patient?.id ||
        editData.patient?._id ||
        editData.patient ||
        "";

      setForm({
        patient: patientId,
        date: editData.date || "",
        time: editData.time || "",
        type: editData.type || "",
      });
    } else {
      setForm({
        patient: "",
        date: "",
        time: "",
        type: "",
      });
    }
  }, [open, editData]);

  /* ============================================================
     SUBMIT
  ============================================================ */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.patient || !form.date || !form.time || !form.type) {
      toast.error("All fields are required.");
      return;
    }

    // Ensure normalized id
    const patientId = form.patient;

    if (!patientId || String(patientId).trim() === "") {
      toast.error("Invalid patient selected.");
      return;
    }

    // Clean payload
    onSave({
      patientId,
      date: form.date,
      time: form.time,
      type: form.type,
    });
  };

  /* ============================================================
     UI
  ============================================================ */
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ duration: 0.25 }}
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6 shadow-xl"
          >
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
              {editData ? "Edit Appointment" : "New Appointment"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* PATIENT SELECT */}
              <div>
                <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">
                  Patient
                </label>

                <select
                  value={form.patient}
                  onChange={(e) =>
                    setForm({ ...form, patient: e.target.value })
                  }
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select patient</option>

                  {patients.length === 0 ? (
                    <option disabled>No patients available</option>
                  ) : (
                    patients.map((p) => (
                      <option key={p._id || p.id} value={p._id || p.id}>
                        {p.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* DATE & TIME */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) =>
                      setForm({ ...form, date: e.target.value })
                    }
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) =>
                      setForm({ ...form, time: e.target.value })
                    }
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2"
                    required
                  />
                </div>
              </div>

              {/* TYPE */}
              <div>
                <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">
                  Appointment Type
                </label>

                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value })
                  }
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select type</option>
                  <option value="Consultation">Consultation</option>
                  <option value="Checkup">Checkup</option>
                  <option value="Dental">Dental</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Surgery">Surgery</option>
                </select>
              </div>

              {/* FOOTER */}
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 rounded-lg text-sm"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-brand text-white rounded-lg text-sm"
                >
                  {editData ? "Save Changes" : "Add Appointment"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
