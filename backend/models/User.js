// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/* =====================================================================
   REFRESH TOKEN SUB-SCHEMA (FIXED: disable versionKey)
===================================================================== */
const RefreshTokenSchema = new mongoose.Schema({
  tokenId: { type: String, required: true },
  tokenHash: { type: String, required: true },
  device: { type: String },
  ip: { type: String },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
}, { _id: false, versionKey: false });  // ⭐ FIX HERE

/* =====================================================================
   USER SCHEMA (FIXED: disable versionKey)
===================================================================== */
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    phone: { type: String },

    passwordHash: { type: String },

    refreshTokens: [RefreshTokenSchema],  // versionSafe

    role: {
      type: String,
      enum: [
        "SuperAdmin", "Admin", "Management", "Doctor", "Nurse", "Surgeon",
        "Pediatrician", "Cardiologist", "Pharmacist", "PharmacyAssistant",
        "LabScientist", "LabTechnician", "Radiologist", "ImagingTechnician",
        "RecordsOfficer", "Receptionist", "BillingOfficer", "Accountant",
        "ProcurementOfficer", "ITAdmin", "ITSupport", "Security", "Cleaner",
        "AmbulanceDriver",
        "Patient"
      ],
      default: "Patient",
    },

    department: {
      type: String,
      enum: [
        "Outpatient", "Emergency", "General Medicine", "Surgery", "Pediatrics",
        "Obstetrics & Gynecology", "Orthopedics", "Cardiology", "Nephrology",
        "Neurology", "ENT", "Ophthalmology", "Dentistry", "Laboratory",
        "Radiology", "Pharmacy", "Nursing", "ICU", "Theatre", "Billing",
        "Records", "Management", "HR", "Procurement", "IT", "Reception",
        "Security", "Maintenance", "Transport",
        "None"
      ],
      default: "None",
    },

    isActive: { type: Boolean, default: true },

    deletedAt: { type: Date, default: null },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,        // ⭐ FIX HERE (no __v increment)
  }
);

/* =====================================================================
   PASSWORD METHODS
===================================================================== */
UserSchema.methods.verifyPassword = function (password) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(password, this.passwordHash);
};

UserSchema.statics.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

/* =====================================================================
   CLEAN JSON OUTPUT
===================================================================== */
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();

  obj.id = obj._id;

  delete obj._id;
  delete obj.passwordHash;
  delete obj.refreshTokens;

  return obj;
};

export default mongoose.model("User", UserSchema);
