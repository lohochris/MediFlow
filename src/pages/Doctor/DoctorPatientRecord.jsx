// src/pages/Doctor/DoctorPatientRecord.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { format } from "date-fns";
import api from "../../api/api";

import { getPatient, addPatientNote } from "../../services/patientService";
import { getAllAppointments } from "../../services/appointmentService";

export default function DoctorPatientRecord() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);

  const load = async () => {
    try {
      setLoading(true);
      const p = await getPatient(id);
      setPatient(p);

      // load appointments and filter by patient id
      const appts = await getAllAppointments();
      setAppointments(Array.isArray(appts) ? appts.filter(a => {
        // a.patient may be populated (object) or an id string
        const pid = a.patient?.id || a.patient?._id || a.patient;
        return pid === p.id || pid === p._id;
      }) : []);
      // load files (if backend provides)
      const filesRes = await api.get(`/patients/${id}/files`).catch(() => ({ data: [] }));
      setFiles(filesRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load patient");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [id]);

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      toast.error("Please write a note.");
      return;
    }
    try {
      const notes = await addPatientNote(id, newNote.trim());
      // API returns populated notes array — update state
      setPatient(prev => ({ ...prev, medicalNotes: notes }));
      setNewNote("");
      toast.success("Note added");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add note");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      // Backend expected: POST /patients/:id/files
      const res = await api.post(`/patients/${id}/files`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFiles(prev => [res.data, ...prev]);
      toast.success("File uploaded");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      // reset input value
      e.target.value = "";
    }
  };

  const handleFileDelete = async (fileId) => {
    if (!confirm("Delete file?")) return;
    try {
      await api.delete(`/patients/${id}/files/${fileId}`);
      setFiles(prev => prev.filter(f => f._id !== fileId && f.id !== fileId));
      toast.success("Deleted");
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading patient...</div>;
  }

  if (!patient) {
    return (
      <div className="p-6 text-center">
        <p>Patient not found.</p>
        <button onClick={() => navigate(-1)} className="mt-4 underline">Go back</button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{patient.name}</h1>
          <p className="text-sm text-slate-500">{patient.email || "—"} • {patient.phone || "—"}</p>
          <p className="text-sm text-slate-500">Gender: {patient.gender} • DOB: {patient.dob ? format(new Date(patient.dob), "yyyy-MM-dd") : "—"}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate(-1)} className="px-3 py-2 rounded border">Back</button>
        </div>
      </div>

      {/* Medical notes */}
      <section className="bg-white dark:bg-slate-800 border rounded p-4">
        <h2 className="text-lg font-medium mb-3">Medical Notes</h2>

        {(!patient.medicalNotes || patient.medicalNotes.length === 0) && (
          <div className="p-3 text-sm text-slate-500 bg-slate-50 rounded">No notes yet.</div>
        )}

        <div className="space-y-3 mt-3">
          {patient.medicalNotes?.map((n) => (
            <div key={n._id || n.createdAt} className="p-3 bg-white dark:bg-slate-900 border rounded">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">{n.doctor?.name || "Doctor"}</div>
                <div className="text-xs text-slate-400">{format(new Date(n.createdAt), "yyyy-MM-dd HH:mm")}</div>
              </div>
              <div className="mt-2 text-sm text-slate-700 dark:text-slate-300">{n.note}</div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows="3"
            className="w-full rounded border p-2 mb-2 dark:bg-slate-800"
            placeholder="Write a new note..."
          />
          <div className="flex gap-2">
            <button onClick={handleAddNote} className="px-4 py-2 bg-emerald-600 text-white rounded">Save Note</button>
            <button onClick={() => setNewNote("")} className="px-4 py-2 border rounded">Cancel</button>
          </div>
        </div>
      </section>

      {/* Appointments history */}
      <section className="bg-white dark:bg-slate-800 border rounded p-4">
        <h2 className="text-lg font-medium mb-3">Appointments</h2>

        {appointments.length === 0 ? (
          <div className="text-sm text-slate-500">No appointments found for this patient.</div>
        ) : (
          <div className="space-y-2">
            {appointments.map(a => (
              <div key={a.id || a._id} className="p-3 border rounded flex items-center justify-between">
                <div>
                  <div className="font-medium">{a.type}</div>
                  <div className="text-sm text-slate-500">{a.date} • {a.time}</div>
                </div>
                <div className="text-sm text-slate-500">{(a.status || "pending").toUpperCase()}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Files Upload */}
      <section className="bg-white dark:bg-slate-800 border rounded p-4">
        <h2 className="text-lg font-medium mb-3">Files & Reports</h2>

        <div className="flex items-center gap-3 mb-3">
          <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-slate-100 rounded">
            <input type="file" className="hidden" onChange={handleFileUpload} />
            <span>{uploading ? "Uploading..." : "Upload file"}</span>
          </label>
        </div>

        {files.length === 0 ? (
          <div className="text-sm text-slate-500">No files uploaded.</div>
        ) : (
          <div className="space-y-2">
            {files.map(f => (
              <div key={f.id || f._id} className="flex items-center justify-between p-2 border rounded bg-white">
                <div>
                  <div className="font-medium">{f.filename || f.name}</div>
                  <div className="text-xs text-slate-500">{f.uploadedAt ? format(new Date(f.uploadedAt), "yyyy-MM-dd") : ""}</div>
                </div>
                <div className="flex items-center gap-2">
                  <a href={f.url || f.path} target="_blank" rel="noreferrer" className="text-sm underline">View</a>
                  <button onClick={() => handleFileDelete(f._id || f.id)} className="text-sm text-red-600">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
