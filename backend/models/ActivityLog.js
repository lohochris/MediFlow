// backend/models/ActivityLogger.js

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

const ActivityLog = mongoose.model("ActivityLog", ActivityLogSchema);

/**
 * Creates a new activity log entry, ensuring metaData is a plain object.
 * This fixes the "Cannot convert circular structure to BSON" error.
 * * @param {object} logData - Object containing log fields (userId, userName, action, target, meta).
 * @param {object | null | undefined} logData.meta - The data to store in the 'meta' field.
 */
export const createActivity = async (logData) => {
    try {
        const { meta: originalMeta, ...rest } = logData;

        // ⭐ CRITICAL FIX: Ensure the meta object is a plain JavaScript object.
        // If originalMeta is a Mongoose Document, we call .toObject() to strip circular references.
        const cleanedMeta = originalMeta && originalMeta.toObject 
            ? originalMeta.toObject({ getters: true, virtuals: true })
            : originalMeta;

        await ActivityLog.create({
            ...rest,
            meta: cleanedMeta,
        });
        
    } catch (error) {
        // Log the error but don't stop the main application flow
        console.error("❌ createActivity error:", error.message || "BSON Error during logging");
    }
}

export default ActivityLog;