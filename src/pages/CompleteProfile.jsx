import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateMyProfile } from "../services/patientService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom"; 

export default function CompleteProfile() {
  const { user, reloadUser } = useAuth();
  const navigate = useNavigate(); 

  // Initialize form state with existing data or defaults
  const initialProfile = user?.patientProfile || {
    gender: "",
    dob: "",
    phone: "",
    condition: "",
  };

  const [form, setForm] = useState(initialProfile);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* =========================================================================
     SAVE PROFILE HANDLER
     → Calls backend, reloads AuthContext, and redirects.
  ========================================================================= */
  const saveProfile = async (e) => {
    e.preventDefault();

    if (!form.gender || !form.dob) {
      toast.error("Gender and Date of Birth are mandatory.");
      return;
    }

    setLoading(true);
    try {
      // 1. Send data to backend (this sets isProfileComplete: true on the server)
      await updateMyProfile(form);
      
      // 2. CRITICAL: Force the AuthContext to fetch the updated user data from the server.
      // This ensures the dashboard sees isProfileComplete: true immediately.
      await reloadUser(); 

      toast.success("Profile updated successfully!");

      // 3. Smoothly navigate back to the dashboard.
      navigate("/dashboard", { replace: true });
      
    } catch (err) {
      console.error("Profile save error:", err);
      toast.error(err.message || "Failed to save profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-1 text-emerald-700">
          Complete Your Medical Profile
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          This information helps us provide better care and personalized services.
        </p>
        <p className="text-red-500 text-sm mb-4">
          (Gender and Date of Birth are mandatory.)
        </p>

        <form onSubmit={saveProfile} className="space-y-4">
          {/* Select Gender */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Select Gender
            </label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2 border"
            >
              <option value="">-- Choose Gender --</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Date of Birth (yyyy-mm-dd format)
            </label>
            <input
              type="date"
              name="dob"
              value={form.dob}
              onChange={handleChange}
              placeholder="dd/mm/yyyy"
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2 border"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Phone Number
            </label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2 border"
            />
          </div>

          {/* Medical Condition */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Medical Condition (optional)
            </label>
            <textarea
              name="condition"
              value={form.condition}
              onChange={handleChange}
              placeholder="E.g., Asthma, Diabetes"
              rows="3"
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2 border"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full justify-center rounded-md border border-transparent bg-emerald-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}