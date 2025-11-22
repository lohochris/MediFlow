// src/pages/Doctor/DoctorPatientRecord.jsx
// Full, production-ready rewrite — consistent `/api/...` endpoints, robust error handling,
// form validation, button disabling, safe null checks, and small UX improvements.

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { format } from "date-fns";
import {
  Plus,
  FileText,
  CheckCircle,
  Trash2,
  Download,
  UploadCloud,
} from "lucide-react";

import api from "../../api/api"; // canonical axios instance
import { addDoctorNote as addDoctorNoteService } from "../../services/doctorService";

// ---------- Small UI helpers ----------
const Section = ({ title, children, actions }) => (
  <section className="bg-white dark:bg-slate-800 border rounded p-4">
    <div className="flex items-start justify-between mb-3">
      <h2 className="text-lg font-medium">{title}</h2>
      {actions}
    </div>
    <div>{children}</div>
  </section>
);

// default empty forms
const emptyVitals = { bp: "", hr: "", temp: "", rr: "", weight: "" };
const emptyDiagnosis = { code: "", name: "", notes: "" };
const emptyPrescription = { medication: "", dose: "", frequency: "", duration: "", notes: "" };
const emptyLab = { testName: "", value: "", unit: "", notes: "" };

export default function DoctorPatientRecord() {
  const { id } = useParams();
  const navigate = useNavigate();

  // core data
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [files, setFiles] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // forms / UI
  const [vitalsForm, setVitalsForm] = useState(emptyVitals);
  const [diagnosisForm, setDiagnosisForm] = useState(emptyDiagnosis);
  const [prescriptionForm, setPrescriptionForm] = useState(emptyPrescription);
  const [labForm, setLabForm] = useState(emptyLab);
  const [visitSummary, setVisitSummary] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // ---------- Helpers ----------
  const pushActivity = (entry) => setActivity((a) => [entry, ...a].slice(0, 200));
  const safeSetPatientField = (patch) => setPatient((p) => (p ? { ...p, ...patch } : p));

  // central load with sensible fallbacks
  const load = async () => {
    setLoading(true);
    try {
      const pReq = api.get(`/api/patients/${id}`, { withCredentials: true });

      const apptReq = api.get(`/api/appointments?patientId=${id}`, { withCredentials: true })
        .catch(async (err) => {
          // fallback: doctor's own appointments which we can filter client-side
          if (err?.response?.status === 401 || err?.response?.status === 403) {
            try {
              const mine = await api.get("/api/appointments/my", { withCredentials: true });
              return { data: (Array.isArray(mine.data) ? mine.data : []).filter(a => {
                const pid = a.patient?._id || a.patient?.id || a.patient;
                return String(pid) === String(id);
              }) };
            } catch {
              return { data: [] };
            }
          }
          return { data: [] };
        });

      const filesReq = api.get(`/api/patients/${id}/files`, { withCredentials: true }).catch(() => ({ data: [] }));

      // try general activity then patient-specific
      const activityReq = api.get(`/api/activity?patientId=${id}&limit=50`, { withCredentials: true })
        .catch(() => api.get(`/api/patients/${id}/activity?limit=50`, { withCredentials: true }).catch(() => ({ data: [] })));

      const [pRes, apptRes, filesRes, activityRes] = await Promise.all([pReq, apptReq, filesReq, activityReq]);

      setPatient(pRes?.data ?? null);
      setAppointments(Array.isArray(apptRes?.data) ? apptRes.data : []);
      setFiles(Array.isArray(filesRes?.data) ? filesRes.data : []);
      setActivity(Array.isArray(activityRes?.data) ? activityRes.data : []);
    } catch (err) {
      console.error("Load patient error:", err);
      if (err?.response?.status === 404) toast.error("Patient not found (404).");
      else if (err?.response?.status === 401) toast.error("Unauthorized. Please login.");
      else toast.error("Failed to load patient data.");
      setPatient(null);
      setAppointments([]);
      setFiles([]);
      setActivity([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ---------- ACTIONS ----------

  // Vitals
  const submitVitals = async () => {
    // optional: require at least one field
    if (!vitalsForm.bp && !vitalsForm.hr && !vitalsForm.temp && !vitalsForm.rr && !vitalsForm.weight) {
      return toast.error("Enter at least one vital sign.");
    }
    setSubmitting(true);
    try {
      const payload = { ...vitalsForm, recordedAt: new Date().toISOString() };
      const res = await api.post(`/api/patients/${id}/vitals`, payload, { withCredentials: true });
      const created = res.data;
      safeSetPatientField({ vitals: [created, ...(patient?.vitals || [])] });
      pushActivity({ userName: created.recordedByName || "You", action: "Added vitals", target: `${created.bp || ""}`, timestamp: new Date() });
      toast.success("Vitals added");
      setVitalsForm(emptyVitals);
    } catch (err) {
      console.error("Add vitals error:", err);
      toast.error(err?.response?.data?.error || "Failed to add vitals");
    } finally {
      setSubmitting(false);
    }
  };

  // Diagnosis
  const submitDiagnosis = async () => {
    if (!diagnosisForm.name || !diagnosisForm.name.trim()) return toast.error("Diagnosis name required");
    setSubmitting(true);
    try {
      const res = await api.post(`/api/patients/${id}/diagnoses`, diagnosisForm, { withCredentials: true });
      const created = res.data;
      safeSetPatientField({ diagnoses: [created, ...(patient?.diagnoses || [])] });
      pushActivity({ userName: created.createdByName || "You", action: "Added diagnosis", target: created.name, timestamp: new Date() });
      toast.success("Diagnosis saved");
      setDiagnosisForm(emptyDiagnosis);
    } catch (err) {
      console.error("Add diagnosis error:", err);
      toast.error("Failed to add diagnosis");
    } finally {
      setSubmitting(false);
    }
  };

  // Prescription
  const submitPrescription = async () => {
    if (!prescriptionForm.medication || !prescriptionForm.dose) {
      return toast.error("Medication and dose are required");
    }
    setSubmitting(true);
    try {
      const res = await api.post(`/api/patients/${id}/prescriptions`, prescriptionForm, { withCredentials: true });
      const created = res.data;
      safeSetPatientField({ prescriptions: [created, ...(patient?.prescriptions || [])] });
      pushActivity({ userName: created.createdByName || "You", action: "Prescribed medication", target: created.medication, timestamp: new Date() });
      toast.success("Prescription saved");
      setPrescriptionForm(emptyPrescription);
    } catch (err) {
      console.error("Add prescription error:", err);
      toast.error("Failed to save prescription");
    } finally {
      setSubmitting(false);
    }
  };

  // Lab
  const submitLab = async () => {
    if (!labForm.testName || !labForm.testName.trim()) return toast.error("Test name required");
    setSubmitting(true);
    try {
      const res = await api.post(`/api/patients/${id}/labs`, labForm, { withCredentials: true });
      const created = res.data;
      safeSetPatientField({ labs: [created, ...(patient?.labs || [])] });
      pushActivity({ userName: created.enteredByName || "You", action: "Added lab result", target: created.testName, timestamp: new Date() });
      toast.success("Lab result saved");
      setLabForm(emptyLab);
    } catch (err) {
      console.error("Add lab error:", err);
      toast.error("Failed to save lab");
    } finally {
      setSubmitting(false);
    }
  };

  // Visit summary
  const submitVisitSummary = async (appointmentId = null) => {
    if (!visitSummary.trim()) return toast.error("Visit summary is empty");
    setSubmitting(true);
    try {
      const res = await api.post(`/api/patients/${id}/visits`, { summary: visitSummary, appointmentId }, { withCredentials: true });
      const created = res.data;
      safeSetPatientField({ visits: [created, ...(patient?.visits || [])] });
      pushActivity({ userName: created.createdByName || "You", action: "Saved visit summary", target: appointmentId ? `Appointment ${appointmentId}` : "Ad-hoc", timestamp: new Date() });
      toast.success("Visit summary saved");
      setVisitSummary("");
    } catch (err) {
      console.error("Save visit error:", err);
      toast.error("Failed to save summary");
    } finally {
      setSubmitting(false);
    }
  };

  // Notes (Doctor-only endpoint)
  // Use doctor-specific route to avoid permission issues for doctor role.
  const addNote = async (noteText) => {
    if (!noteText || !noteText.trim()) return;
    try {
      // Prefer service helper to keep logic centralised
      const res = await addDoctorNoteService(id, noteText.trim());
      const data = res; // service returns res.data already

      // The backend might return a single note or the full notes array.
      if (Array.isArray(data)) safeSetPatientField({ medicalNotes: data });
      else safeSetPatientField({ medicalNotes: [data, ...(patient?.medicalNotes || [])] });

      pushActivity({ userName: (data.createdByName || data.doctor?.name) || "You", action: "Added clinical note", target: (data.note || "").slice(0, 40), timestamp: new Date() });
      toast.success("Note added");
      return true;
    } catch (err) {
      console.error("Add note error:", err);
      // Provide a clearer message if permission error
      if (err?.response?.status === 403) toast.error("You don't have permission to add notes.");
      else toast.error("Failed to add note");
      return false;
    }
  };

  // Appointment actions
  const markAppointmentCompleted = async (apptId) => {
    if (!confirm("Mark appointment as completed?")) return;
    try {
      const res = await api.put(`/api/appointments/${apptId}`, { status: "completed" }, { withCredentials: true });
      const updated = res.data;
      setAppointments((arr) => arr.map((a) => (String(a._id || a.id) === String(apptId) ? updated : a)));
      pushActivity({ userName: updated.updatedByName || "You", action: "Marked appointment completed", target: `Appointment ${apptId}`, timestamp: new Date() });
      toast.success("Appointment marked completed");
    } catch (err) {
      console.error("Complete appointment error:", err);
      toast.error("Failed to mark appointment completed");
    }
  };

  const addFollowUp = async (apptId, followUpDate) => {
    if (!followUpDate) return toast.error("Pick a follow-up date");
    try {
      const res = await api.put(`/api/appointments/${apptId}`, { followUp: followUpDate }, { withCredentials: true });
      const updated = res.data;
      setAppointments((arr) => arr.map((a) => (String(a._id || a.id) === String(apptId) ? updated : a)));
      pushActivity({ userName: updated.updatedByName || "You", action: "Added follow-up", target: `Appointment ${apptId} → ${followUpDate}`, timestamp: new Date() });
      toast.success("Follow-up added");
    } catch (err) {
      console.error("Add follow-up error:", err);
      toast.error("Failed to add follow-up");
    }
  };

  // Files
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.post(`/api/patients/${id}/files`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      const created = res.data;
      setFiles((f) => [created, ...f]);
      pushActivity({ userName: created.uploadedByName || "You", action: "Uploaded file", target: created.filename || file.name, timestamp: new Date() });
      toast.success("File uploaded");
    } catch (err) {
      console.error("File upload error:", err);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      // reset input
      if (e?.target) e.target.value = "";
    }
  };

  const deleteFile = async (fileId) => {
    if (!confirm("Delete file?")) return;
    try {
      await api.delete(`/api/patients/${id}/files/${fileId}`, { withCredentials: true });
      setFiles((f) => f.filter((x) => String(x._id || x.id) !== String(fileId)));
      pushActivity({ userName: "You", action: "Deleted file", target: fileId, timestamp: new Date() });
      toast.success("File deleted");
    } catch (err) {
      console.error("Delete file error:", err);
      toast.error("Delete failed");
    }
  };

  // Export (pdf/csv)
  const exportPatientRecord = async (format = "pdf") => {
    try {
      const res = await api.get(`/api/patients/${id}/export?format=${format}`, {
        responseType: "blob",
        withCredentials: true,
      });
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `patient-${id}-record.${format === "csv" ? "csv" : "pdf"}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      // release object URL after a short delay
      setTimeout(() => window.URL.revokeObjectURL(url), 5000);
      toast.success("Export started");
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Export failed");
    }
  };

  // ---------- Computed ----------
  const todaysAppointments = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return appointments.filter((a) => (a.date || "").slice(0, 10) === today);
  }, [appointments]);

  // ---------- Render ----------
  if (loading) return <div className="p-6 text-center">Loading patient...</div>;

  if (!patient) {
    return (
      <div className="p-6 text-center">
        <p>Patient not found.</p>
        <button onClick={() => navigate(-1)} className="mt-4 underline">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{patient.name || "Unnamed"}</h1>
          <p className="text-sm text-slate-500">{patient.email || "—"} • {patient.phone || "—"}</p>
          <p className="text-sm text-slate-500">
            Gender: {patient.gender || "—"} • DOB: {patient.dob ? format(new Date(patient.dob), "yyyy-MM-dd") : "—"}
          </p>
        </div>

        <div className="flex gap-2">
          <button onClick={() => exportPatientRecord("pdf")} className="px-3 py-2 rounded border flex items-center gap-2">
            <Download size={16} /> Export
          </button>
          <button onClick={() => navigate(-1)} className="px-3 py-2 rounded border">
            Back
          </button>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded p-4 shadow-sm border">
          <div className="text-xs text-slate-400">Total Visits</div>
          <div className="text-xl font-semibold">{(patient.visits || []).length}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded p-4 shadow-sm border">
          <div className="text-xs text-slate-400">Current Prescriptions</div>
          <div className="text-xl font-semibold">{(patient.prescriptions || []).filter(p => !p.completed).length}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded p-4 shadow-sm border">
          <div className="text-xs text-slate-400">Last Lab</div>
          <div className="text-xl font-semibold">{patient.labs && patient.labs[0] ? patient.labs[0].testName : "—"}</div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* LEFT */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Clinical Notes & Visit Summary */}
          <Section
            title="Clinical Notes & Visit Summary"
            actions={
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const text = prompt("Quick note:");
                    if (text && text.trim()) addNote(text.trim());
                  }}
                  className="px-3 py-1 rounded bg-emerald-600 text-white flex items-center gap-2"
                >
                  <Plus size={14} /> Quick note
                </button>
              </div>
            }
          >
            <div className="mb-3">
              <textarea
                rows={4}
                value={visitSummary}
                onChange={(e) => setVisitSummary(e.target.value)}
                placeholder="Write visit summary..."
                className="w-full rounded border p-2 dark:bg-slate-800"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button onClick={() => setVisitSummary("")} className="px-3 py-1 border rounded">Cancel</button>
                <button onClick={() => submitVisitSummary(null)} className="px-3 py-1 bg-emerald-600 text-white rounded" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Summary"}
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {(patient.medicalNotes || []).length === 0 && <div className="text-sm text-slate-400">No notes yet.</div>}
              {(patient.medicalNotes || []).map((n) => (
                <div key={n._id || n.createdAt} className="p-3 bg-white dark:bg-slate-900 border rounded">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{n.doctor?.name || n.createdByName || "Doctor"}</div>
                    <div className="text-xs text-slate-400">{n.createdAt ? format(new Date(n.createdAt), "yyyy-MM-dd HH:mm") : ""}</div>
                  </div>
                  <div className="mt-2 text-sm text-slate-700 dark:text-slate-300">{n.note}</div>
                </div>
              ))}
            </div>
          </Section>

          {/* Appointments */}
          <Section title="Appointments" actions={<div className="text-sm text-slate-400">{todaysAppointments.length} today</div>}>
            {(appointments || []).length === 0 ? (
              <div className="text-sm text-slate-400">No appointments for this patient.</div>
            ) : (
              <div className="space-y-2">
                {appointments.map((a) => (
                  <div key={a._id || a.id} className="p-3 border rounded flex items-center justify-between">
                    <div>
                      <div className="font-medium">{a.type} — {a.doctor?.name || "TBA"}</div>
                      <div className="text-sm text-slate-500">{a.date} • {a.time}</div>
                      {a.followUp && <div className="text-xs text-emerald-600 mt-1">Follow-up: {a.followUp}</div>}
                    </div>

                    <div className="flex items-center gap-2">
                      {a.status !== "completed" && (
                        <>
                          <button onClick={() => markAppointmentCompleted(a._id || a.id)} className="px-2 py-1 bg-emerald-600 text-white rounded flex items-center gap-2">
                            <CheckCircle size={14} /> Complete
                          </button>
                          <input
                            type="date"
                            onBlur={(e) => {
                              const v = e.target.value;
                              if (v) addFollowUp(a._id || a.id, v);
                            }}
                            className="px-2 py-1 border rounded text-sm"
                            title="Set follow-up date (leave and blur to submit)"
                          />
                        </>
                      )}
                      <div className="text-sm text-slate-500">{(a.status || "pending").toUpperCase()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Prescriptions */}
          <Section title="Prescriptions" actions={<div className="text-sm text-slate-400">Create and manage medications</div>}>
            <div className="space-y-3 mb-3">
              {(patient.prescriptions || []).length === 0 && <div className="text-sm text-slate-400">No prescriptions</div>}
              {(patient.prescriptions || []).map((p) => (
                <div key={p._id || p.id} className="p-3 border rounded flex items-center justify-between">
                  <div>
                    <div className="font-medium">{p.medication} <span className="text-xs text-slate-400">({p.dose})</span></div>
                    <div className="text-sm text-slate-500">{p.frequency} • {p.duration}</div>
                    {p.notes && <div className="text-xs text-slate-400 mt-1">{p.notes}</div>}
                    <div className="text-xs text-slate-400 mt-1">Prescribed: {p.createdAt ? format(new Date(p.createdAt), "yyyy-MM-dd") : "—"}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        if (!confirm("Mark prescription as completed?")) return;
                        try {
                          const res = await api.put(`/api/patients/${id}/prescriptions/${p._id || p.id}/complete`, {}, { withCredentials: true });
                          const updated = res.data;
                          safeSetPatientField({ prescriptions: (patient.prescriptions || []).map(x => (String(x._id || x.id) === String(p._id || p.id) ? updated : x)) });
                          pushActivity({ userName: "You", action: "Completed prescription", target: p.medication, timestamp: new Date() });
                          toast.success("Marked completed");
                        } catch (err) {
                          console.error("Complete prescription:", err);
                          toast.error("Failed");
                        }
                      }}
                      className="px-2 py-1 bg-emerald-600 text-white rounded"
                    >
                      Complete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Create prescription form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input value={prescriptionForm.medication} onChange={(e) => setPrescriptionForm((s) => ({ ...s, medication: e.target.value }))} placeholder="Medication" className="p-2 border rounded dark:bg-slate-800" />
              <input value={prescriptionForm.dose} onChange={(e) => setPrescriptionForm((s) => ({ ...s, dose: e.target.value }))} placeholder="Dose (e.g. 500mg)" className="p-2 border rounded dark:bg-slate-800" />
              <input value={prescriptionForm.frequency} onChange={(e) => setPrescriptionForm((s) => ({ ...s, frequency: e.target.value }))} placeholder="Frequency (e.g. twice daily)" className="p-2 border rounded dark:bg-slate-800" />
              <input value={prescriptionForm.duration} onChange={(e) => setPrescriptionForm((s) => ({ ...s, duration: e.target.value }))} placeholder="Duration (e.g. 7 days)" className="p-2 border rounded dark:bg-slate-800" />
              <input value={prescriptionForm.notes} onChange={(e) => setPrescriptionForm((s) => ({ ...s, notes: e.target.value }))} placeholder="Notes" className="p-2 border rounded dark:bg-slate-800 md:col-span-2" />
              <div className="flex justify-end md:col-span-2 gap-2">
                <button onClick={() => setPrescriptionForm(emptyPrescription)} className="px-3 py-1 border rounded">Reset</button>
                <button onClick={submitPrescription} className="px-3 py-1 bg-emerald-600 text-white rounded" disabled={submitting}>{submitting ? "Saving..." : <><Plus size={14} /> Save</>}</button>
              </div>
            </div>
          </Section>
        </div>

        {/* RIGHT */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Vitals */}
          <Section title="Vitals" actions={<div className="text-sm text-slate-400">{(patient.vitals || []).length} records</div>}>
            <div className="space-y-2 mb-3 max-h-44 overflow-y-auto">
              {(patient.vitals || []).slice(0, 20).map((v) => (
                <div key={v._id || v.createdAt} className="p-2 border rounded flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{v.bp} • HR {v.hr} • T {v.temp}</div>
                    <div className="text-xs text-slate-400">{v.recordedAt ? format(new Date(v.recordedAt), "yyyy-MM-dd HH:mm") : ""}</div>
                  </div>
                  <div className="text-xs text-slate-400">{v.recordedByName || "You"}</div>
                </div>
              ))}
              {(patient.vitals || []).length === 0 && <div className="text-sm text-slate-400">No vitals yet.</div>}
            </div>

            <div className="grid grid-cols-1 gap-2">
              <input value={vitalsForm.bp} onChange={(e) => setVitalsForm((s) => ({ ...s, bp: e.target.value }))} placeholder="BP (e.g. 120/80)" className="p-2 border rounded dark:bg-slate-800" />
              <div className="grid grid-cols-3 gap-2">
                <input value={vitalsForm.hr} onChange={(e) => setVitalsForm((s) => ({ ...s, hr: e.target.value }))} placeholder="HR" className="p-2 border rounded dark:bg-slate-800" />
                <input value={vitalsForm.temp} onChange={(e) => setVitalsForm((s) => ({ ...s, temp: e.target.value }))} placeholder="Temp (°C)" className="p-2 border rounded dark:bg-slate-800" />
                <input value={vitalsForm.rr} onChange={(e) => setVitalsForm((s) => ({ ...s, rr: e.target.value }))} placeholder="RR" className="p-2 border rounded dark:bg-slate-800" />
              </div>
              <input value={vitalsForm.weight} onChange={(e) => setVitalsForm((s) => ({ ...s, weight: e.target.value }))} placeholder="Weight (kg)" className="p-2 border rounded dark:bg-slate-800" />
              <div className="flex justify-end gap-2">
                <button onClick={() => setVitalsForm(emptyVitals)} className="px-3 py-1 border rounded">Reset</button>
                <button onClick={submitVitals} className="px-3 py-1 bg-emerald-600 text-white rounded" disabled={submitting}>{submitting ? "Saving..." : "Add"}</button>
              </div>
            </div>
          </Section>

          {/* Labs */}
          <Section title="Lab Results">
            <div className="space-y-2 mb-3 max-h-36 overflow-y-auto">
              {(patient.labs || []).slice(0, 10).map((l) => (
                <div key={l._id || l.createdAt} className="p-2 border rounded flex items-center justify-between">
                  <div>
                    <div className="font-medium">{l.testName} — {l.value} {l.unit || ""}</div>
                    <div className="text-xs text-slate-400">{l.notes}</div>
                  </div>
                  <div className="text-xs text-slate-400">{l.enteredAt ? format(new Date(l.enteredAt), "yyyy-MM-dd") : ""}</div>
                </div>
              ))}
              {(patient.labs || []).length === 0 && <div className="text-sm text-slate-400">No lab results</div>}
            </div>

            <div className="grid grid-cols-1 gap-2">
              <input value={labForm.testName} onChange={(e) => setLabForm((s) => ({ ...s, testName: e.target.value }))} placeholder="Test name" className="p-2 border rounded dark:bg-slate-800" />
              <div className="grid grid-cols-3 gap-2">
                <input value={labForm.value} onChange={(e) => setLabForm((s) => ({ ...s, value: e.target.value }))} placeholder="Value" className="p-2 border rounded dark:bg-slate-800" />
                <input value={labForm.unit} onChange={(e) => setLabForm((s) => ({ ...s, unit: e.target.value }))} placeholder="Unit" className="p-2 border rounded dark:bg-slate-800" />
                <input value={labForm.notes} onChange={(e) => setLabForm((s) => ({ ...s, notes: e.target.value }))} placeholder="Notes" className="p-2 border rounded dark:bg-slate-800" />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setLabForm(emptyLab)} className="px-3 py-1 border rounded">Reset</button>
                <button onClick={submitLab} className="px-3 py-1 bg-emerald-600 text-white rounded" disabled={submitting}>{submitting ? "Saving..." : <><Plus size={14} /> Save</>}</button>
              </div>
            </div>
          </Section>

          {/* Files & Reports */}
          <Section title="Files & Reports" actions={<div className="text-sm text-slate-400">{files.length} files</div>}>
            <div className="flex items-center gap-2 mb-3">
              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-slate-100 rounded">
                <input type="file" className="hidden" onChange={handleFileUpload} />
                <UploadCloud size={16} /> {uploading ? "Uploading..." : "Upload file"}
              </label>
              <button onClick={() => exportPatientRecord("csv")} className="px-3 py-2 rounded border flex items-center gap-2">
                <FileText size={16} /> Export CSV
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {files.length === 0 && <div className="text-sm text-slate-400">No files uploaded.</div>}
              {files.map((f) => (
                <div key={f._id || f.id} className="flex items-center justify-between p-2 border rounded bg-white">
                  <div>
                    <div className="font-medium">{f.filename || f.name}</div>
                    <div className="text-xs text-slate-400">{f.uploadedAt ? format(new Date(f.uploadedAt), "yyyy-MM-dd") : ""}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={f.url || f.path || "#"} target="_blank" rel="noreferrer" className="text-sm underline flex items-center gap-1"><Download size={14} />View</a>
                    <button onClick={() => deleteFile(f._id || f.id)} className="text-sm text-red-600 flex items-center gap-1"><Trash2 size={14} />Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Activity */}
          <Section title="Activity Log">
            <div className="max-h-60 overflow-y-auto space-y-2">
              {activity.length === 0 && <div className="text-sm text-slate-400">No activity</div>}
              {activity.map((a, i) => (
                <div key={a._id || i} className="p-2 border rounded flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{a.userName || a.actor || "System"}</div>
                    <div className="text-xs text-slate-400">{a.action} — {a.target}</div>
                  </div>
                  <div className="text-xs text-slate-400">{a.timestamp ? format(new Date(a.timestamp), "yyyy-MM-dd HH:mm") : ""}</div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
