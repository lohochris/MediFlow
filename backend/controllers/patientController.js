// backend/controllers/patientController.js
import Patient from "../models/Patient.js";

/**
 * @desc Create a new patient
 * @route POST /patients
 * @access Private (Admin | Doctor)
 */
export const createPatient = async (req, res) => {
  try {
    const { name, email, phone, gender, dob, condition } = req.body;

    if (!name || !gender || !dob) {
      return res.status(400).json({
        error: "Name, Gender, and Date of Birth are required.",
      });
    }

    const patient = await Patient.create({
      name,
      email,
      phone,
      gender,
      dob,
      condition,
    });

    res.status(201).json(patient);
  } catch (err) {
    console.error("Create Patient Error:", err);
    res.status(500).json({ error: "Server error creating patient." });
  }
};

/**
 * @desc Get all patients (Admin)
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
 * @desc Get single patient
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
 * @desc Update patient
 * @route PUT /patients/:id
 * @access Private
 */
export const updatePatient = async (req, res) => {
  try {
    const { name, email, phone, gender, dob, condition } = req.body;

    const updatedPatient = await Patient.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        phone,
        gender,
        dob,
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
 * @desc Delete patient
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
