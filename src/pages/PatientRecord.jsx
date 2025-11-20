// src/pages/PatientRecord.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { ArrowLeftCircle, NotebookPen } from "lucide-react";

import { getPatient, addPatientNote } from "../services/patientService";

export default function PatientRecord() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const p = await getPatient(id);
      setPatient(p);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load patient record");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      toast.error("Please enter a note");
      return;
    }

    try {
      setSubmitting(true);

      const updatedNotes = await addPatientNote(id, newNote.trim());

      setPatient((prev) => ({
        ...prev,
        medicalNotes: updatedNotes,
      }));

      setNewNote("");
      toast.success("Note added successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add note");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="p-6 text-center text-slate-600 dark:text-slate-300">
        Loading patient...
      </div>
    );

  if (!patient)
    return (
      <div className="p-6 text-center">
        <p className="text-slate-600 dark:text-slate-300 mb-3">
          Patient not found.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition"
        >
          <ArrowLeftCircle size={18} /> Go Back
        </button>
      </div>
    );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* HEADER */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">
            {patient.name}
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            {patient.email || "—"} • {patient.phone || "—"}
          </p>

          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Gender: {patient.gender} • DOB:{" "}
            {patient.dob ? format(new Date(patient.dob), "yyyy-MM-dd") : "—"}
          </p>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
        >
          <ArrowLeftCircle size={18} /> Back
        </button>
      </div>

      {/* MEDICAL NOTES */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <NotebookPen className="text-brand" size={20} />
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
            Medical Notes
          </h2>
        </div>

        {(!patient.medicalNotes || patient.medicalNotes.length === 0) && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm text-slate-500 dark:text-slate-400">
            No notes added yet.
          </div>
        )}

        <div className="space-y-3 mt-3">
          {patient.medicalNotes.map((note) => (
            <div
              key={note._id || note.createdAt}
              className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {note.doctor?.name || "Doctor"}
                </div>
                <div className="text-xs text-slate-400">
                  {format(new Date(note.createdAt), "yyyy-MM-dd HH:mm")}
                </div>
              </div>

              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {note.note}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ADD NEW NOTE */}
      <section>
        <h3 className="text-md font-medium mb-2 text-slate-800 dark:text-white">
          Add Note
        </h3>

        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          rows="4"
          placeholder="Write examination, diagnosis, prescription or notes..."
          className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-slate-200 mb-3"
        ></textarea>

        <div className="flex gap-3">
          <button
            onClick={handleAddNote}
            disabled={submitting}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:bg-emerald-400 transition"
          >
            {submitting ? "Saving..." : "Save Note"}
          </button>

          <button
            onClick={() => setNewNote("")}
            className="px-4 py-2 border rounded-xl border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            Cancel
          </button>
        </div>
      </section>
    </div>
  );
}
