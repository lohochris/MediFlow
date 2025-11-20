import React from "react";

export default function MiniChart({ color = "#10b981" }) {
  return (
    <svg width="100" height="40" className="opacity-80">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="3"
        points="0,30 20,25 40,28 60,10 80,15 100,5"
        strokeLinecap="round"
      />
    </svg>
  );
}
