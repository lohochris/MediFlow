// backend/models/Appointment.js
import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    // Link to patient
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    // Optional doctor assignment
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    // Appointment details
    date: { type: String, required: true },
    time: { type: String, required: true },
    type: { type: String, required: true },

    // Status
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },

    // Automatically set when appointment is completed
    completedAt: {
      type: Date,
      default: null,
    },

    // Helpful for analytics (timestamp at creation)
    scheduledAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  { timestamps: true }
);

/* ---------------------------------------------------------
   AUTO-HANDLE COMPLETION TIMESTAMP
--------------------------------------------------------- */
appointmentSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();

  // If status changes to completed and no completedAt is set
  if (update?.status === "completed") {
    update.completedAt = new Date();
  }

  next();
});

/* ---------------------------------------------------------
   Format JSON output for frontend
--------------------------------------------------------- */
appointmentSchema.method("toJSON", function () {
  const obj = this.toObject();
  obj.id = obj._id;

  delete obj._id;
  delete obj.__v;
  return obj;
});

export default mongoose.model("Appointment", appointmentSchema);
