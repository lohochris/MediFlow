// src/pages/Patients.jsx
import React, { useEffect, useMemo, useState } from "react";
import AddPatientModal from "../components/patients/AddPatientModal";
import { Pencil, Trash2, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

import {
  getAllPatients,
  createPatient,
  updatePatient,
  deletePatient,
} from "../services/patientService";

export default function Patients() {
  const { user } = useAuth();

  // Prevent patients from accessing this page
  if (user?.role === "Patient") {
    window.location.href = "/dashboard";
    return null;
  }

  const [patients, setPatients] = useState([]);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editPatient, setEditPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================================================================
     ID NORMALIZER
  ========================================================================= */
  const normalizeId = (p) => p?.id || p?._id || "";

  /* =========================================================================
     AGE CALCULATION
  ========================================================================= */
  const calculateAge = (dob, explicitAge) => {
    if (typeof explicitAge === "number" && !Number.isNaN(explicitAge)) {
      return explicitAge;
    }
    if (!dob) return "—";

    const d = new Date(dob);
    if (isNaN(d)) return "—";

    const diffMs = Date.now() - d.getTime();
    const ageDt = new Date(diffMs);
    return ageDt.getUTCFullYear() - 1970;
  };

  /* =========================================================================
     LOAD PATIENTS
  ========================================================================= */
  const loadPatients = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllPatients();
      setPatients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load patients error:", err);
      setError("Could not load patients. Backend may be offline.");
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  /* =========================================================================
     SEARCH FILTER
  ========================================================================= */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;

    return patients.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const gender = (p.gender || "").toLowerCase();
      const phone = (p.phone || "").toLowerCase();
      const email = (p.email || "").toLowerCase();
      const ageStr = String(calculateAge(p.dob, p.age)).toLowerCase();

      return (
        name.includes(q) ||
        gender.includes(q) ||
        phone.includes(q) ||
        email.includes(q) ||
        ageStr.includes(q)
      );
    });
  }, [patients, query]);

  /* =========================================================================
     SAVE (CREATE OR UPDATE)
  ========================================================================= */
  const handleSave = async (payload) => {
    try {
      // UPDATE
      if (editPatient) {
        const id = normalizeId(editPatient);

        const updated = await updatePatient(id, payload);
        toast.success("Patient updated!");

        setPatients((prev) =>
          prev.map((p) =>
            normalizeId(p) === id ? updated : p
          )
        );
      }

      // CREATE
      else {
        const created = await createPatient(payload);
        toast.success("Patient added!");

        setPatients((prev) => [created, ...prev]);
      }

      setModalOpen(false);
      setEditPatient(null);
    } catch (err) {
      console.error("Save patient error:", err);
      toast.error(err.message || "Failed to save patient.");
    }
  };

  /* =========================================================================
     DELETE
  ========================================================================= */
  const handleDelete = async (id) => {
    if (!confirm("Delete this patient permanently?")) return;

    try {
      await deletePatient(id);
      toast.success("Patient deleted.");

      setPatients((prev) =>
        prev.filter((p) => normalizeId(p) !== id)
      );
    } catch (err) {
      console.error("Delete patient error:", err);
      toast.error(err.message || "Failed to delete patient.");
    }
  };

  /* =========================================================================
     EDIT BUTTON
  ========================================================================= */
  const openEdit = (p) => {
    setEditPatient(p);
    setModalOpen(true);
  };

  /* =========================================================================
     UI
  ========================================================================= */
  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">
            Patients
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage patient records and information.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patients..."
            className="hidden md:block w-72 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand"
          />

          <button
            onClick={() => {
              setEditPatient(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg shadow hover:bg-brand-dark transition"
          >
            <UserPlus size={16} /> Add Patient
          </button>
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {/* TABLE */}
      {loading ? (
        <div className="py-12 text-center text-slate-500">
          Loading patients...
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <tr>
                <th className="text-left px-4 py-3">Patient</th>
                <th className="text-left px-4 py-3">Age</th>
                <th className="text-left px-4 py-3">Gender</th>
                <th className="text-left px-4 py-3">Phone</th>
                <th className="text-center px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-10 text-slate-500 dark:text-slate-400"
                  >
                    No patients found.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const id = normalizeId(p);
                  const age = calculateAge(p.dob, p.age);
                  const initial = String(p.name || "?").charAt(0).toUpperCase();

                  return (
                    <tr
                      key={id}
                      className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                    >
                      {/* Patient */}
                      <td className="px-4 py-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-semibold">
                          {initial}
                        </div>

                        <div>
                          <div className="font-medium text-slate-800 dark:text-white">
                            {p.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {p.email || "—"}
                          </div>
                        </div>
                      </td>

                      {/* Age */}
                      <td className="px-4 py-3">
                        {typeof age === "number" ? age : "—"}
                      </td>

                      {/* Gender */}
                      <td className="px-4 py-3">{p.gender || "—"}</td>

                      {/* Phone */}
                      <td className="px-4 py-3">{p.phone || "—"}</td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => openEdit(p)}
                            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          >
                            <Pencil size={16} className="text-emerald-600" />
                          </button>

                          <button
                            onClick={() => handleDelete(id)}
                            className="p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                          >
                            <Trash2 size={16} className="text-red-600" />
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

      {/* MODAL */}
      <AddPatientModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditPatient(null);
        }}
        onSave={handleSave}
        existing={editPatient}
      />
    </div>
  );
}
