// backend/models/Appointment.js
import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    // Link to patient document (REQUIRED)
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    // Doctor is optional (Admin may schedule without choosing doctor)
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
  },
  { timestamps: true }
);

// Ensure frontend gets "id" instead of "_id"
appointmentSchema.method("toJSON", function () {
  const obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
});

export default mongoose.model("Appointment", appointmentSchema);
