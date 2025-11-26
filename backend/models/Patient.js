// backend/models/Patient.js
import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    /* ---------------------------------------------------------
       USER ACCOUNT (OPTIONAL)
    --------------------------------------------------------- */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      unique: false,
    },

    /* ---------------------------------------------------------
       PERSONAL DETAILS
    --------------------------------------------------------- */
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      default: null,
    },

    phone: {
      type: String,
      trim: true,
      default: null,
    },

    /* ---------------------------------------------------------
       GENDER
    --------------------------------------------------------- */
   gender: {
  type: String,
  enum: {
    values: ["Male", "Female", "Other"],
    message: "{VALUE} is not a valid gender",
  },
  default: undefined,
  required: false,
},

    dob: {
      type: Date,
      default: null,
    },

    condition: {
      type: String,
      trim: true,
      default: null,
    },

    /* ---------------------------------------------------------
       ASSIGNED DOCTOR
    --------------------------------------------------------- */
    assignedDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    /* ---------------------------------------------------------
       PUBLIC FLAG
    --------------------------------------------------------- */
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  { 
    timestamps: true,
    // ⭐ IMPORTANT: Enable virtuals on toJSON and toObject (Step 1)
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true }
  } // Ensure this is the correct place for schema options
);


/* ---------------------------------------------------------
   VIRTUALS
   - Calculates profile completeness
--------------------------------------------------------- */
patientSchema.virtual('isProfileComplete').get(function() {
    // Define the mandatory fields for the profile to be considered complete.
    // NOTE: 'gender' uses 'undefined' as default, others use 'null'.
    const requiredFields = [
        this.phone,
        this.gender,
        this.dob,
        this.condition,
    ];

    // Check if ALL required fields are NOT null AND NOT undefined.
    // We explicitly check against 'undefined' because Mongoose default for the schema is 'undefined'
    // and explicitly against 'null' because that's the default we set for other fields.
    const isComplete = requiredFields.every(field => 
        field !== undefined && 
        field !== null
    );

    return isComplete;
});


/* ---------------------------------------------------------
   JSON FORMATTER — safe output (Step 2)
--------------------------------------------------------- */
patientSchema.method("toJSON", function () {
  const obj = this.toObject({ virtuals: true }); // Pass virtuals: true here to include the status

  obj.id = obj._id;

  delete obj._id;
  delete obj.__v;

  return obj;
});

export default mongoose.model("Patient", patientSchema);