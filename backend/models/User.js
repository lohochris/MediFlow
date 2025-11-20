// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const RefreshTokenSchema = new mongoose.Schema({
  tokenId: { type: String, required: true },
  tokenHash: { type: String, required: true },
  device: String,
  ip: String,
  createdAt: { type: Date, default: Date.now },
  expiresAt: Date,
});

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true, lowercase: true },

    phone: { type: String },

    // ❗ FIXED — Google OAuth users do NOT have passwords
    passwordHash: { type: String },

    refreshTokens: [RefreshTokenSchema],

    role: {
      type: String,
      enum: [
        "SuperAdmin","Admin","Management","Doctor","Nurse","Surgeon",
        "Pediatrician","Cardiologist","Pharmacist","PharmacyAssistant",
        "LabScientist","LabTechnician","Radiologist","ImagingTechnician",
        "RecordsOfficer","Receptionist","BillingOfficer","Accountant",
        "ProcurementOfficer","ITAdmin","ITSupport","Security","Cleaner",
        "AmbulanceDriver","Patient"
      ],
      default: "Patient"
    },

    department: {
      type: String,
      enum: [
        "Outpatient","Emergency","General Medicine","Surgery","Pediatrics",
        "Obstetrics & Gynecology","Orthopedics","Cardiology","Nephrology",
        "Neurology","ENT","Ophthalmology","Dentistry","Laboratory",
        "Radiology","Pharmacy","Nursing","ICU","Theatre","Billing",
        "Records","Management","HR","Procurement","IT","Reception",
        "Security","Maintenance","Transport","None"
      ],
      default: "None"
    },

    isActive: { type: Boolean, default: true },

    deletedAt: { type: Date, default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// VERIFY PASSWORD
UserSchema.methods.verifyPassword = function (password) {
  if (!this.passwordHash) return false; // 🚀 prevent crash for Google users
  return bcrypt.compare(password, this.passwordHash);
};

// HASH PASSWORD
UserSchema.statics.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

// REMOVE SENSITIVE FIELDS
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.refreshTokens;
  return obj;
};

export default mongoose.model("User", UserSchema);
