// src/layout/Layout.jsx
import React, { useState } from "react";   // ✅ FIXED: React added
import Sidebar from "../components/sidebar/Sidebar";
import Header from "../components/header/Header";
import AddPatientModal from "../components/patients/AddPatientModal";

import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";

import { createPatient } from "../services/patientService";
import toast from "react-hot-toast";

export default function Layout({ children }) {
  const location = useLocation();

  // GLOBAL PATIENT MODAL STATE
  const [patientModalOpen, setPatientModalOpen] = useState(false);

  // Open modal from Header/Add button
  const openAddPatient = () => setPatientModalOpen(true);

  // Global save function
  const handleGlobalSave = async (payload) => {
    try {
      await createPatient(payload);
      toast.success("Patient added successfully!");

      // close modal
      setPatientModalOpen(false);

      // OPTIONAL: Force reload if you're on Patients.jsx
      if (location.pathname === "/patients") {
        window.location.reload(); // simplest method
      }
    } catch (err) {
      toast.error("Failed to save patient.");
    }
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-64 z-50">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="ml-64 w-full min-h-screen bg-slate-50 dark:bg-slate-900">
        
        {/* Pass global Add patient handler */}
        <Header onAddPatient={openAddPatient} />

        <main className="p-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* GLOBAL ADD PATIENT MODAL */}
      <AddPatientModal
        open={patientModalOpen}
        onClose={() => setPatientModalOpen(false)}
        onSave={handleGlobalSave}  // <--- GLOBAL SAVE HERE
      />
    </div>
  );
}
