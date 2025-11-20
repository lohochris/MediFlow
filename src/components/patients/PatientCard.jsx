import React from "react";

export default function PatientCard({ patient, onView }) {
  // Calculate age from DOB
  const calculateAge = (dob) => {
    if (!dob) return "-";
    const diff = Date.now() - new Date(dob).getTime();
    return new Date(diff).getUTCFullYear() - 1970;
  };

  const age = calculateAge(patient.dob);

  return (
    <div className="flex items-center justify-between p-3 rounded hover:bg-slate-50 transition">
      <div>
        <div className="font-medium">{patient.name}</div>

        <div className="text-xs text-slate-500">
          {age} yrs • {patient.gender}
        </div>
      </div>

      <button
        onClick={() => onView(patient)}
        className="text-xs text-emerald-600 hover:underline"
      >
        View
      </button>
    </div>
  );
}
