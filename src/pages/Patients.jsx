import React, { useState, useEffect, useMemo } from "react";
import AddPatientModal from "../components/patients/AddPatientModal";
import { Pencil, Trash2, UserPlus } from "lucide-react";
import {
  getAllPatients,
  createPatient,
  updatePatient,
  deletePatient,
} from "../services/patientService";
import toast from "react-hot-toast";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editPatient, setEditPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Calculate age from DOB
  const calculateAge = (dob) => {
    if (!dob) return "-";
    const diff = Date.now() - new Date(dob).getTime();
    return new Date(diff).getUTCFullYear() - 1970;
  };

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await getAllPatients();
      setPatients(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError("Could not load patients. Make sure the API is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  // Search functionality (fixed)
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return patients.filter((p) =>
      [
        p.name,
        p.gender,
        p.phone,
        p.email,
        calculateAge(p.dob).toString(),
      ]
        .filter(Boolean)
        .some((value) => value.toString().toLowerCase().includes(q))
    );
  }, [patients, query]);

  // Save patient (create or update)
  const handleSave = async (payload) => {
    try {
      if (editPatient) {
        await updatePatient(editPatient.id, payload);
        toast.success("Patient updated!");
      } else {
        await createPatient(payload);
        toast.success("Patient added successfully!");
      }

      setModalOpen(false);
      setEditPatient(null);
      await loadPatients();
    } catch (err) {
      toast.error("Failed to save patient.");
    }
  };

  // Delete patient
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this patient? This action cannot be undone."))
      return;

    try {
      await deletePatient(id);
      toast.success("Patient deleted.");
      await loadPatients();
    } catch (err) {
      toast.error("Failed to delete patient.");
    }
  };

  const openEdit = (p) => {
    setEditPatient(p);
    setModalOpen(true);
  };

  return (
    <div className="p-6">

      {/* Title */}
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
          {/* Search */}
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

          {/* Add Patient */}
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

      {/* Loading */}
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
                  <td
                    colSpan="5"
                    className="text-center py-10 text-slate-500 dark:text-slate-400"
                  >
                    No patients found.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                  >
                    <td className="px-4 py-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-semibold">
                        {p.name.charAt(0).toUpperCase()}
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

                    <td className="px-4 py-3">
                      {calculateAge(p.dob)}
                    </td>

                    <td className="px-4 py-3">{p.gender}</td>

                    <td className="px-4 py-3">{p.phone}</td>

                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-3">
                        {/* Edit */}
                        <button
                          onClick={() => openEdit(p)}
                          className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Edit"
                        >
                          <Pencil size={16} className="text-emerald-600" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                          title="Delete"
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
