import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

  // Load data when opening or editing
  useEffect(() => {
    if (open && editData) {
      setForm({
        patient: editData.patient?.id || editData.patient?._id || "",
        date: editData.date,
        time: editData.time,
        type: editData.type,
      });
    } else if (open) {
      setForm({ patient: "", date: "", time: "", type: "" });
    }
  }, [open, editData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.patient || !form.date || !form.time || !form.type) return;

    // Backend expects: patient, date, time, type
    onSave({
      patient: form.patient,
      date: form.date,
      time: form.time,
      type: form.type,
    });
  };

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
              {/* Patient */}
              <div>
                <label className="text-sm text-slate-600 dark:text-slate-300">
                  Patient
                </label>
                <select
                  value={form.patient}
                  onChange={(e) =>
                    setForm({ ...form, patient: e.target.value })
                  }
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2"
                >
                  <option value="">Select patient</option>
                  {patients.map((p) => (
                    <option key={p.id || p._id} value={p.id || p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-600 dark:text-slate-300">
                    Date
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) =>
                      setForm({ ...form, date: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-600 dark:text-slate-300">
                    Time
                  </label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) =>
                      setForm({ ...form, time: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="text-sm text-slate-600 dark:text-slate-300">
                  Appointment Type
                </label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">Select type</option>
                  <option>Checkup</option>
                  <option>Consultation</option>
                  <option>Dental</option>
                  <option>Emergency</option>
                  <option>Surgery</option>
                </select>
              </div>

              {/* Footer */}
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
