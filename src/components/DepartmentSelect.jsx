import React from "react";
import departments from "../data/departments.json";

export default function DepartmentSelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full p-3 border rounded-lg bg-white text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
    >
      <option value="">Select Department</option>
      {departments.map((dept) => (
        <option key={dept.id} value={dept.name}>
          {dept.name}
        </option>
      ))}
    </select>
  );
}
