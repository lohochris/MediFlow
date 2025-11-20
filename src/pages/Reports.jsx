import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function Reports() {
  // Fake monthly data (replace with API data later)
  const monthlyData = [
    { month: "Jan", value: 120 },
    { month: "Feb", value: 180 },
    { month: "Mar", value: 90 },
    { month: "Apr", value: 230 },
    { month: "May", value: 260 },
    { month: "Jun", value: 190 },
  ];

  const exportCSV = () => {
    const header = "Month,Patients\n";
    const rows = monthlyData.map((d) => `${d.month},${d.value}`).join("\n");
    const csv = header + rows;

    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "mediflow-reports.csv";
    a.click();
  };

  return (
    <div className="p-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">
            Reports
          </h1>
          <p className="text-slate-500 text-sm">
            Analytics and hospital performance overview.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="border px-4 py-2 rounded-lg text-sm hover:bg-slate-100"
        >
          Export CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <h3 className="text-sm text-slate-500">Patients This Month</h3>
          <div className="text-2xl font-semibold mt-2">260</div>
          <p className="text-xs text-emerald-600 mt-1">+8% vs last month</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <h3 className="text-sm text-slate-500">Total Appointments</h3>
          <div className="text-2xl font-semibold mt-2">1,452</div>
          <p className="text-xs text-emerald-600 mt-1">+12% growth</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <h3 className="text-sm text-slate-500">Surgeries Completed</h3>
          <div className="text-2xl font-semibold mt-2">52</div>
          <p className="text-xs text-red-500 mt-1">-3% vs last month</p>
        </div>
      </div>

      {/* Line Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border mt-6">
        <h2 className="text-lg font-semibold text-slate-700">
          Monthly Patient Trends
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          Overview of patient growth over the past 6 months.
        </p>

        {/* RECHARTS LINE CHART */}
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={monthlyData}
              margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 12 }} />
              <YAxis hide />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ stroke: "#10b981", strokeWidth: 2, r: 4, fill: "#10b981" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Extra Analytics */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        {/* Table */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            Top Procedures
          </h3>

          <ul className="text-sm text-slate-600 space-y-2">
            <li>✔ General Consultation — 542</li>
            <li>✔ Dental Checkup — 189</li>
            <li>✔ Eye Examination — 133</li>
            <li>✔ Cardiology Review — 98</li>
          </ul>
        </div>

        {/* Activity */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            Appointment Activity Overview
          </h3>

          <ul className="text-sm text-slate-600 space-y-2">
            <li>📅 Peak day: Monday</li>
            <li>⏰ Busiest time: 10AM – 12PM</li>
            <li>👥 New patients: 56 this month</li>
            <li>❤️ Most requested: Checkups</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
