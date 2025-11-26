// backend/controllers/patientController.js
import Patient from "../models/Patient.js";

/**
 * @desc Create a new patient
 * @route POST /patients
 * @access Private (Admin | Doctor)
 *
 * NOTE:
 * - Manual creation (Admin/Doctor) → validate required gender & dob
 * - Auto creation during registration → allow null gender & dob
 */
export const createPatient = async (req, res) => {
  try {
    const { name, email, phone, gender, dob, condition, isPublic } = req.body;

    // Manual creation: enforce required fields
    if (!isPublic) {
      if (!name) {
        return res.status(400).json({ error: "Name is required." });
      }
    }

    // Validate gender only when provided
    const allowedGender = ["Male", "Female", "Other"];
    if (gender && !allowedGender.includes(gender)) {
      return res.status(400).json({ error: "Invalid gender value." });
    }

    const patient = await Patient.create({
      name,
      email: email ?? null,
      phone: phone ?? null,
      gender: gender ?? undefined, // <— IMPORTANT: Prevents enum crash
      dob: dob ?? null,
      condition: condition ?? null,
      isPublic: isPublic ?? false,
      user: req.body.user ?? null,
      assignedDoctor: req.body.assignedDoctor ?? null,
    });

    res.status(201).json(patient);
  } catch (err) {
    console.error("Create Patient Error:", err);
    res.status(500).json({ error: "Server error creating patient." });
  }
};

/**
 * @desc Get all patients (Admin/Doctor)
 * @route GET /patients
 * @access Private
 */
export const getPatients = async (req, res) => {
  try {
    const { assignedTo } = req.query;

    // Return only patients assigned to logged-in doctor
    if (assignedTo === "me") {
      const patients = await Patient.find({
        assignedDoctor: req.user.id,
      }).sort({ createdAt: -1 });

      return res.json(patients);
    }

    // Return all patients
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (err) {
    console.error("Get Patients Error:", err);
    res.status(500).json({ error: "Server error fetching patients." });
  }
};

/**
 * @desc Get a single patient
 * @route GET /patients/:id
 * @access Private
 */
export const getPatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({ error: "Patient not found." });
    }

    res.json(patient);
  } catch (err) {
    console.error("Get Patient Error:", err);
    res.status(500).json({ error: "Server error fetching patient." });
  }
};

/**
 * @desc Update a patient
 * @route PUT /patients/:id
 * @access Private
 */
export const updatePatient = async (req, res) => {
  try {
    const { name, email, phone, gender, dob, condition } = req.body;

    // Validate gender only if provided
    const allowedGender = ["Male", "Female", "Other"];
    if (gender && !allowedGender.includes(gender)) {
      return res.status(400).json({ error: "Invalid gender value." });
    }

    const updatedPatient = await Patient.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        phone,
        gender: gender ?? undefined, // avoid enum crash
        dob: dob ?? null,
        condition,
      },
      { new: true, runValidators: true }
    );

    if (!updatedPatient) {
      return res.status(404).json({ error: "Patient not found." });
    }

    res.json(updatedPatient);
  } catch (err) {
    console.error("Update Patient Error:", err);
    res.status(500).json({ error: "Server error updating patient." });
  }
};

/**
 * @desc Delete a patient
 * @route DELETE /patients/:id
 * @access Private
 */
export const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);

    if (!patient) {
      return res.status(404).json({ error: "Patient not found." });
    }

    res.json({ message: "Patient removed successfully." });
  } catch (err) {
    console.error("Delete Patient Error:", err);
    res.status(500).json({ error: "Server error deleting patient." });
  }
};
