import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    // Link to User model (the account)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Ensure one Patient profile per User
    },

    // Patient personal information
    name: { type: String, required: true },
    email: { type: String, default: null },
    phone: { type: String, default: null },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: null,
    },

    dob: {
      type: Date,
      default: null,
    },

    condition: {
      type: String,
      default: null,
    },

    // Assigned doctor (User account)
    assignedDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

/* ---------------------------------------------------------
   JSON Formatting
--------------------------------------------------------- */
patientSchema.method("toJSON", function () {
  const obj = this.toObject();
  obj.id = obj._id;

  delete obj._id;
  delete obj.__v;

  return obj;
});

export default mongoose.model("Patient", patientSchema);
