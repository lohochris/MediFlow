// src/router/AppRouter.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";

// AUTH PAGES
import Login from "../auth/Login.jsx";
import Register from "../auth/Register.jsx";
import OAuthSuccess from "../auth/OAuthSuccess.jsx";

// AUTH GUARDS
import RequireAuth from "../auth/RequireAuth.jsx";
import RequireAdmin from "../auth/RequireAdmin.jsx";

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

// ADMIN PAGES
import AdminDashboard from "../pages/Admin/AdminDashboard";
import Departments from "../pages/Admin/Departments";
import UserManagement from "../pages/Admin/UserManagement";

// DOCTOR PAGES
import DoctorDashboard from "../pages/Doctor/DoctorDashboard";
import PatientList from "../pages/Doctor/PatientList";
import DoctorPatientRecord from "../pages/Doctor/DoctorPatientRecord";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Routes>

            {/* ===================================== */}
            {/*           PUBLIC ROUTES               */}
            {/* ===================================== */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/oauth-success" element={<OAuthSuccess />} />

            {/* Public patient record view (after booking) */}
            <Route path="/patients/:id" element={<PatientRecord />} />

            {/* Public appointment booking page */}
            <Route path="/book-appointment" element={<BookAppointment />} />


            {/* ===================================== */}
            {/*        AUTHENTICATED USER ROUTES      */}
            {/* ===================================== */}

            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </RequireAuth>
              }
            />

            {/* Patients */}
            <Route
              path="/patients"
              element={
                <RequireAuth>
                  <Layout>
                    <Patients />
                  </Layout>
                </RequireAuth>
              }
            />

            {/* Appointments */}
            <Route
              path="/appointments"
              element={
                <RequireAuth>
                  <Layout>
                    <Appointments />
                  </Layout>
                </RequireAuth>
              }
            />

            {/* Reports */}
            <Route
              path="/reports"
              element={
                <RequireAuth>
                  <Layout>
                    <Reports />
                  </Layout>
                </RequireAuth>
              }
            />

            {/* Settings */}
            <Route
              path="/settings"
              element={
                <RequireAuth>
                  <Layout>
                    <Settings />
                  </Layout>
                </RequireAuth>
              }
            />


            {/* ===================================== */}
            {/*             DOCTOR ROUTES             */}
            {/* ===================================== */}

            <Route
              path="/doctor"
              element={
                <RequireAuth>
                  <Layout>
                    <DoctorDashboard />
                  </Layout>
                </RequireAuth>
              }
            />

            <Route
              path="/doctor/patients"
              element={
                <RequireAuth>
                  <Layout>
                    <PatientList />
                  </Layout>
                </RequireAuth>
              }
            />

            <Route
              path="/doctor/patients/:id"
              element={
                <RequireAuth>
                  <Layout>
                    <DoctorPatientRecord />
                  </Layout>
                </RequireAuth>
              }
            />


            {/* ===================================== */}
            {/*              ADMIN ROUTES             */}
            {/* ===================================== */}

            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <Layout>
                    <AdminDashboard />
                  </Layout>
                </RequireAdmin>
              }
            />

            <Route
              path="/admin/departments"
              element={
                <RequireAdmin>
                  <Layout>
                    <Departments />
                  </Layout>
                </RequireAdmin>
              }
            />

            <Route
              path="/admin/users"
              element={
                <RequireAdmin>
                  <Layout>
                    <UserManagement />
                  </Layout>
                </RequireAdmin>
              }
            />


            {/* ===================================== */}
            {/*               NOT FOUND               */}
            {/* ===================================== */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
