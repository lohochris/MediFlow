// src/pages/Doctor/PatientList.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { getMyPatients } from "../../services/patientService";

export default function PatientList() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);

      // Doctors ONLY see their own assigned patients
      const list = await getMyPatients();

      setPatients(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load assigned patients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = patients.filter((p) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;

    return (
      (p.name || "").toLowerCase().includes(q) ||
      (p.phone || "").toLowerCase().includes(q) ||
      (p.email || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">My Patients</h1>
          <p className="text-sm text-slate-500">
            These are the patients assigned to you.
          </p>
        </div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, phone or email..."
          className="hidden md:block w-80 border border-slate-300 dark:border-slate-700 rounded px-3 py-2"
        />
      </div>

      {/* BODY */}
      {loading ? (
        <div className="py-12 text-center text-slate-500">
          Loading patients...
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-6 text-sm text-slate-500">No patients found.</div>
          ) : (
            <div className="divide-y">
              {filtered.map((p) => {
                const id = p.id || p._id;

                return (
                  <div
                    key={id}
                    className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-sm text-slate-500">
                        {p.email || "—"} • {p.phone || "—"}
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/doctor/patients/${id}`)}
                      className="px-3 py-1 bg-emerald-600 text-white rounded"
                    >
                      View
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
