// backend/models/ActivityLog.js
import mongoose from "mongoose";

const ActivityLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    userName: { type: String, required: false },
    action: { type: String, required: true }, // e.g. "Created Doctor"
    target: { type: String, required: false }, // e.g. "Doctor: Dr John Doe"
    meta: { type: mongoose.Schema.Types.Mixed }, // extra data
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("ActivityLog", ActivityLogSchema);
