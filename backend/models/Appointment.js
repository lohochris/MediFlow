import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    // Link to patient → MUST reference Patient model, not User
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    // Assigned doctor (User model)
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    // Appointment details
    date: { type: String, required: true },
    time: { type: String, required: true },
    type: { type: String, required: true },

    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },

    completedAt: {
      type: Date,
      default: null,
    },

    scheduledAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  { timestamps: true }
);

/* Auto-set completedAt */
appointmentSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update?.status === "completed") {
    update.completedAt = new Date();
  }
  next();
});

/* JSON formatting */
appointmentSchema.method("toJSON", function () {
  const obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
});

export default mongoose.model("Appointment", appointmentSchema);
