import React from "react";
import PatientCard from "./PatientCard";

export default function PatientList({ patients = [], onView }) {
  if (!patients.length) {
    return (
      <div className="text-sm text-slate-500">
        No patients available.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {patients.map((p) => (
        <PatientCard key={p.id} patient={p} onView={onView} />
      ))}
    </div>
  );
}
