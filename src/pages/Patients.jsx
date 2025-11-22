// src/pages/Patients.jsx
import React, { useEffect, useMemo, useState } from "react";
import AddPatientModal from "../components/patients/AddPatientModal";
import { Pencil, Trash2, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

import {
  getAllPatients,
  createPatient,
  updatePatient,
  deletePatient,
} from "../services/patientService";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editPatient, setEditPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ---------- helpers ----------
  // Robust age calculation: prefer explicit age field, otherwise compute from dob
  const calculateAge = (dob, explicitAge) => {
    if (typeof explicitAge === "number" && !Number.isNaN(explicitAge)) return explicitAge;
    if (!dob) return "—";
    const d = new Date(dob);
    if (isNaN(d)) return "—";
    const diffMs = Date.now() - d.getTime();
    const ageDt = new Date(diffMs);
    return ageDt.getUTCFullYear() - 1970;
  };

  const normalizeId = (p) => p?.id || p?._id || "";

  // ---------- load ----------
  const loadPatients = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllPatients();
      setPatients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load patients error:", err);
      setError("Could not load patients. Make sure the API is running.");
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  // ---------- search ----------
  const filtered = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((p) => {
      const name = (p.name || "").toString().toLowerCase();
      const gender = (p.gender || "").toString().toLowerCase();
      const phone = (p.phone || "").toString().toLowerCase();
      const email = (p.email || "").toString().toLowerCase();
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

  // ---------- create / update ----------
  const handleSave = async (payload) => {
    try {
      if (editPatient) {
        // update
        const id = normalizeId(editPatient);
        await updatePatient(id, payload);
        toast.success("Patient updated!");
        setPatients((prev) =>
          prev.map((p) => (String(normalizeId(p)) === String(id) ? { ...p, ...payload } : p))
        );
      } else {
        // create
        const created = await createPatient(payload);
        toast.success("Patient added successfully!");
        // backend may return the created patient object
        const added = Array.isArray(created)
          ? created[0]
          : created;
        setPatients((prev) => [added || payload, ...prev]);
      }

      setModalOpen(false);
      setEditPatient(null);
    } catch (err) {
      console.error("Save patient error:", err);
      toast.error(err?.response?.data?.error || "Failed to save patient.");
    }
  };

  // ---------- delete ----------
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this patient? This action cannot be undone.")) return;
    try {
      await deletePatient(id);
      toast.success("Patient deleted.");
      setPatients((prev) => prev.filter((p) => String(normalizeId(p)) !== String(id)));
    } catch (err) {
      console.error("Delete patient error:", err);
      toast.error("Failed to delete patient.");
    }
  };

  // ---------- edit ----------
  const openEdit = (p) => {
    setEditPatient(p);
    setModalOpen(true);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">Patients</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage patient records and information.</p>
        </div>

        <div className="flex items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patients..."
            className="
              hidden md:block w-72 
              border border-slate-200 dark:border-slate-700
              rounded-lg px-3 py-2 text-sm 
              focus:ring-2 focus:ring-brand
            "
          />

          <button
            onClick={() => {
              setEditPatient(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg shadow-sm hover:bg-brand-dark transition"
          >
            <UserPlus size={16} />
            Add Patient
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading / Table */}
      {loading ? (
        <div className="py-12 text-center text-slate-500">Loading patients...</div>
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
                  <td colSpan="5" className="text-center py-10 text-slate-500 dark:text-slate-400">
                    No patients found.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const pid = normalizeId(p);
                  const age = calculateAge(p.dob, p.age);

                  return (
                    <tr
                      key={pid || Math.random()}
                      className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="px-4 py-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-semibold">
                          {String(p.name || " ").charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <div className="font-medium text-slate-800 dark:text-white">{p.name}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{p.email || "—"}</div>
                        </div>
                      </td>

                      <td className="px-4 py-3">{typeof age === "number" ? `${age}` : age}</td>

                      <td className="px-4 py-3">{p.gender || "—"}</td>

                      <td className="px-4 py-3">{p.phone || "—"}</td>

                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => openEdit(p)}
                            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Edit"
                          >
                            <Pencil size={16} className="text-emerald-600" />
                          </button>

                          <button
                            onClick={() => handleDelete(pid)}
                            className="p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                            title="Delete"
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

      {/* Modal */}
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
