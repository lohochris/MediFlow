# ⚕️ MediFlow — Hospital & Patient Management System

MediFlow is a modern, role-based, full-stack Hospital Information Management System (HIMS).  
It provides secure authentication, patient management, doctor workflow, appointment booking, admin dashboard, and advanced RBAC (Role-Based Access Control).

This project is built with **React + Tailwind + Node.js + Express + MongoDB**, with secure JWT + Refresh Token authentication.

---

## Features
## Authentication & Security

Email/Password login

Google OAuth

JWT Access + Refresh Tokens (secure rotation)

Auto token refresh (silent auth)

Protected routes (frontend + backend)

Role-Based Access Control (RBAC)

Activity tracking (middleware)

Soft delete + permanent delete support

### Role-Based Dashboards
Role	      Permissions
SuperAdmin	  Full control, manage system, admins, staff, departments
Admin	      Manage users, departments, settings
Doctor	      Patient list, records, appointments, file uploads
Patient	      Book/view appointments, profile info
Nurse / Lab / Pharmacy / Others	  Extendable role permissions

permissions
## Core Hospital Modules

- Patient registration & management

- Appointment scheduling & calendar

- Doctor–patient view

- File uploads (Lab/Doctor)

- Department management

- User management (RBAC)

- Activity logs

- Dark/light theme

- Notification dropdown system

- Charts and analytics (Recharts)

## System Architecture
# Frontend

- React (Vite)

- TailwindCSS

- Axios (interceptors + token storage)

- React Router v6

- Context API (Auth, Theme, Notification)

- Recharts / Lucide Icons / Framer Motion
  
# Backend

- Node.js

- Express.js

- MongoDB (Mongoose)

- Passport.js (Google OAuth)

- JWT Authentication

- RBAC Permissions

- Activity Logger Middleware


##  Project Structure

mediflow-app/
│
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   ├── passport.js
│   │   ├── permissions.js
│   │
│   ├── controllers/
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── withActivity.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Patient.js
│   │   ├── Appointment.js
│   │   ├── Department.js
│   │
│   ├── routes/
│   │   ├── auth.js
│   │   ├── googleAuth.js
│   │   ├── users.js
│   │   ├── patients.js
│   │   ├── appointments.js
│   │   ├── doctor.js
│   │   ├── departments.js
│   │
│   ├── services/
│   │   ├── activityService.js
│   │
│   ├── server.js
│   └── package.json
│
├── public/
│   └── assets/
│
├── src/
│   ├── api/
│   │   ├── api.js
│   │   ├── axios.js
│   │   └── tokenStore.js
│   │
│   ├── assets/
│   │   ├── logo.png
│   │   └── react.svg
│   │
│   ├── auth/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── OAuthSuccess.jsx
│   │   ├── RequireAuth.jsx
│   │   └── RequireAdmin.jsx
│   │
│   ├── components/
│   │   ├── appointments/
│   │   │   ├── AppointmentCard.jsx
│   │   │   └── AppointmentModal.jsx
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── IconCircle.jsx
│   │   │   └── Input.jsx
│   │   ├── header/
│   │   │   └── Header.jsx
│   │   ├── patients/
│   │   │   ├── AddPatientModal.jsx
│   │   │   ├── PatientCard.jsx
│   │   │   └── PatientList.jsx
│   │   ├── sidebar/
│   │   └── stats/
│   │       ├── DashboardWelcome.jsx
│   │       ├── DepartmentSelect.jsx
│   │       └── GoogleLoginButton.jsx
│   │
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── MediFlowContext.jsx
│   │   └── ThemeContext.jsx
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useNotifications.js
│   │   └── useResettableState.js
│   │
│   ├── layout/
│   │   └── Layout.jsx
│   │
│   ├── pages/
│   │   ├── Admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── CreateDoctor.jsx
│   │   │   ├── Departments.jsx
│   │   │   ├── SuperAdminDashboard.jsx
│   │   │   └── UserManagement.jsx
│   │   ├── Doctor/
│   │   │   ├── DoctorDashboard.jsx
│   │   │   ├── DoctorPatientRecord.jsx
│   │   │   ├── PatientList.jsx
│   │   │   └── UploadFiles.jsx
│   │   ├── Appointments.jsx
│   │   ├── BookAppointment.jsx
│   │   ├── Dashboard.jsx
│   │   ├── DoctorAppointments.jsx
│   │   ├── NotFound.jsx
│   │   ├── PatientRecord.jsx
│   │   ├── Patients.jsx
│   │   ├── Reports.jsx
│   │   └── Settings.jsx
│   │
│   ├── router/
│   │   └── AppRouter.jsx
│   │
│   ├── services/
│   │   ├── adminService.js
│   │   ├── appointmentService.js
│   │   ├── authService.js
│   │   ├── departmentService.js
│   │   ├── doctorService.js
│   │   ├── notificationService.js
│   │   ├── patientService.js
│   │   └── usersService.js
│   │
│   ├── styles/
│   │   ├── globals.css
│   │   ├── App.css
│   │   └── index.css
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── tailwind.config.js
├── vite.config.js
├── package.json
└── README.md


---

## 🛠️ Installation & Setup
### 📥 Clone the Repository
```bash
git clone https://github.com/lohochris/MediFlow.git
cd mediflow-app
Backend Setup (/backend)
1️⃣ Install dependencies
cd backend
npm install

2️⃣ Create .env
MONGO_URI=mongodb://127.0.0.1:27017/mediflow
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
FRONTEND_ORIGIN=http://localhost:5173
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:50001/auth/google/cal
Seed SuperAdmin (important)
npm run seed:admin


Default credentials:

Email: admin@mediflow.com
Password: Admin123!

Start backend server
npm run dev


Server runs on:
👉 http://localhost:5000

💻 Frontend Setup (/frontend)
1️⃣ Install dependencies
cd frontend
npm install
2️⃣ Create .env
ini
Copy code
VITE_BACKEND_URL=http://localhost:5000
3️⃣ Run app
bash
Copy code
npm run dev
Frontend runs on:
👉 http://localhost:5173

🔐 Available User Roles
The system supports advanced RBAC with over 20 hospital roles, including:

SuperAdmin

Admin

Doctor

Nurse

LabScientist

Pharmacist

Radiologist

Accountant

Receptionist

Patient
… and many more (extensible in backend).

🧪 API Endpoints (Quick Overview)
Auth
bash
Copy code
POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/refresh
GET  /users/me
Users (Admin/SuperAdmin)
bash
Copy code
GET    /users
PUT    /users/:id/role
PUT    /users/:id/department
PUT    /users/:id/status
DELETE /users/:id
Departments
bash
Copy code
POST   /departments
GET    /departments
PUT    /departments/:id
DELETE /departments/:id

📊 Roadmap (Next 30%)

 Doctor → add patient notes, prescriptions, vitals

 Pharmacy → drug stock management

 Lab → lab test ordering & results upload

 Radiology → scan image uploads

 Billing module (invoices/payments)

 Analytics dashboard (charts)

 System audit logs

🤝 Contributing

Fork the repo

Create a new branch

Commit changes

Submit PR

🛡️ License

This project is licensed under the MIT License.

Support the Project

If you like this project, give it a star on GitHub ⭐
Your support encourages further development!