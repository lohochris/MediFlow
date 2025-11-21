// backend/models/Notification.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    // Notification title shown in UI
    title: { type: String, required: true },

    // Detailed description/message
    message: { type: String, required: true },

    // Who should see this notification (SuperAdmin, Admin, Doctor)
    targetRoles: {
      type: [String],
      enum: ["SuperAdmin", "Admin", "Doctor"],
      default: ["SuperAdmin"],
    },

    // Users who have marked it as read
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Optional metadata for deep links (example: recordId, type: "doctor")
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // For sorting and timeline
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Clean JSON output for frontend
notificationSchema.method("toJSON", function () {
  const obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
});

export default mongoose.model("Notification", notificationSchema);
