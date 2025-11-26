import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";

// AUTH PAGES
import Login from "../auth/Login.jsx";
import Register from "../auth/Register.jsx";
import OAuthSuccess from "../auth/OAuthSuccess.jsx";

// GUARDS
import RequireAuth from "../auth/RequireAuth.jsx";
import RequireAdmin from "../auth/RequireAdmin.jsx";
import RequireDoctor from "../auth/RequireDoctor.jsx";
import RequirePatient from "../auth/RequirePatient.jsx";

// LAYOUT
import Layout from "../layout/Layout.jsx";

// MAIN PAGES
import Dashboard from "../pages/Dashboard";
import Patients from "../pages/Patients";
import Appointments from "../pages/Appointments";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";
import BookAppointment from "../pages/BookAppointment";
import NotFound from "../pages/NotFound";
import PatientRecord from "../pages/PatientRecord";

// PATIENT PROFILE
import CompleteProfile from "../pages/CompleteProfile.jsx";

// ADMIN
import AdminDashboard from "../pages/Admin/AdminDashboard";
import Departments from "../pages/Admin/Departments";
import UserManagement from "../pages/Admin/UserManagement";
import CreateDoctor from "../pages/Admin/CreateDoctor";
import SuperAdminDashboard from "../pages/Admin/SuperAdminDashboard";
import AddAdmin from "../pages/Admin/AddAdmin";   // ⭐ NEW IMPORT

// DOCTOR
import DoctorDashboard from "../pages/Doctor/DoctorDashboard";
import PatientList from "../pages/Doctor/PatientList";
import DoctorPatientRecord from "../pages/Doctor/DoctorPatientRecord";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Routes>

            {/* PUBLIC ROUTES */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/oauth-success/*" element={<OAuthSuccess />} />

            {/* PATIENT MUST BE LOGGED IN */}
            <Route
              path="/book-appointment"
              element={
                <RequirePatient>
                  <Layout><BookAppointment /></Layout>
                </RequirePatient>
              }
            />

            {/* COMPLETE PROFILE */}
            <Route
              path="/complete-profile"
              element={
                <RequireAuth>
                  <CompleteProfile />
                </RequireAuth>
              }
            />

            {/* GENERAL DASHBOARD */}
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <Layout><Dashboard /></Layout>
                </RequireAuth>
              }
            />

            {/* ADMIN + DOCTOR SHARED ROUTES */}
            <Route
              path="/patients"
              element={
                <RequireAuth>
                  <Layout><Patients /></Layout>
                </RequireAuth>
              }
            />

            <Route
              path="/patients/:id"
              element={
                <RequireAuth>
                  <Layout><PatientRecord /></Layout>
                </RequireAuth>
              }
            />

            <Route
              path="/appointments"
              element={
                <RequireAuth>
                  <Layout><Appointments /></Layout>
                </RequireAuth>
              }
            />

            <Route
              path="/reports"
              element={
                <RequireAuth>
                  <Layout><Reports /></Layout>
                </RequireAuth>
              }
            />

            <Route
              path="/settings"
              element={
                <RequireAuth>
                  <Layout><Settings /></Layout>
                </RequireAuth>
              }
            />

            {/* DOCTOR ONLY */}
            <Route
              path="/doctor/dashboard"
              element={
                <RequireDoctor>
                  <Layout><DoctorDashboard /></Layout>
                </RequireDoctor>
              }
            />

            <Route
              path="/doctor/patients"
              element={
                <RequireDoctor>
                  <Layout><PatientList /></Layout>
                </RequireDoctor>
              }
            />

            <Route
              path="/doctor/patients/:id"
              element={
                <RequireDoctor>
                  <Layout><DoctorPatientRecord /></Layout>
                </RequireDoctor>
              }
            />

            {/* ADMIN ONLY (includes SuperAdmin) */}
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <Layout><AdminDashboard /></Layout>
                </RequireAdmin>
              }
            />

            <Route
              path="/admin/departments"
              element={
                <RequireAdmin>
                  <Layout><Departments /></Layout>
                </RequireAdmin>
              }
            />

            <Route
              path="/admin/users"
              element={
                <RequireAdmin>
                  <Layout><UserManagement /></Layout>
                </RequireAdmin>
              }
            />

            <Route
              path="/admin/create-doctor"
              element={
                <RequireAdmin>
                  <Layout><CreateDoctor /></Layout>
                </RequireAdmin>
              }
            />

            {/* SUPERADMIN DASHBOARD (Admin Guard allows SuperAdmin) */}
            <Route
              path="/admin/superadmin"
              element={
                <RequireAdmin>
                  <Layout><SuperAdminDashboard /></Layout>
                </RequireAdmin>
              }
            />

            {/* ⭐ SUPERADMIN ADD ADMIN PAGE */}
            <Route
              path="/superadmin/add-admin"
              element={
                <RequireAdmin>
                  <Layout><AddAdmin /></Layout>
                </RequireAdmin>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
