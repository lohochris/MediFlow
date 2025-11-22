// src/components/patients/AddPatientModal.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function AddPatientModal({ open, onClose, onSave, existing }) {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Male");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  /* ---------------------------------------------------------
     Sync form when modal opens OR when editing changes
  --------------------------------------------------------- */
  useEffect(() => {
    if (!open) return;

    if (existing) {
      setName(existing.name || "");
      setDob(existing.dob ? existing.dob.substring(0, 10) : "");
      setGender(existing.gender || "Male");
      setPhone(existing.phone || "");
      setEmail(existing.email || "");
    } else {
      setName("");
      setDob("");
      setGender("Male");
      setPhone("");
      setEmail("");
    }
  }, [open, existing]);

  if (!open) return null;

  /* ---------------------------------------------------------
     Submit Handler
  --------------------------------------------------------- */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim() || !dob.trim() || !phone.trim()) {
      toast.error("Please fill all required fields.");
      return;
    }

    // Pass clean payload upward
    onSave({
      name: name.trim(),
      dob: dob.trim(),
      gender,
      phone: phone.trim(),
      email: email.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.25 }}
        className="bg-white dark:bg-slate-900 w-full max-w-md p-6 rounded-2xl shadow-xl"
      >
        <h2 className="text-xl font-semibold mb-1 text-slate-800 dark:text-white">
          {existing ? "Edit Patient" : "Add New Patient"}
        </h2>

        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          {existing
            ? "Update the patient's information."
            : "Fill in the patient’s details below."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm mb-1">Full Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-800"
            />
          </div>

          {/* DOB + Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Date of Birth *</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-800"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Gender *</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-800"
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm mb-1">Phone *</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-800"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-800"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-b-2xl p-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium shadow-sm hover:bg-emerald-700 active:bg-emerald-800 transition"
            >
              {existing ? "Save Changes" : "Add Patient"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
