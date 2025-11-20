# ⚕️ MediFlow — Hospital & Patient Management System

MediFlow is a modern, role-based, full-stack Hospital Information Management System (HIMS).  
It provides secure authentication, patient management, doctor workflow, appointment booking, admin dashboard, and advanced RBAC (Role-Based Access Control).

This project is built with **React + Tailwind + Node.js + Express + MongoDB**, with secure JWT + Refresh Token authentication.

---

## 🚀 Features

### 🔐 Authentication & Security
- Email/password login
- Google OAuth login
- JWT Access & Refresh Token (secure rotation)
- Auto token refresh (silent login)
- Protected routes (frontend + backend)
- Role-Based Access Control (RBAC)
- Soft delete & hard delete handling

---

### 👨‍⚕️ Role-Based Dashboards
| Role | Features |
|------|----------|
| **SuperAdmin** | Full system control, create admins, manage users, roles, departments |
| **Admin** | Manage users (except SuperAdmin), departments, system settings |
| **Doctor** | Own dashboard, view patients, view patient records |
| **Patient** | Book appointments, view own medical info |
| **Others (Nurses, Pharm, Lab, etc.)** | Extensible permissions system |

---

### 🏥 Clinical Features
- Patient registration & management
- Appointment scheduling system
- Doctor–patient interaction module
- Department & staff management
- Patient records view
- Role-based permissions (view/edit restrictions)

---

### ⚙️ System Architecture
- **Frontend:** React, TailwindCSS, Framer Motion
- **Backend:** Node.js, Express, Passport
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT + refresh tokens (secure rotation)
- **API:** RESTful API structure

---

## 📦 Project Structure

mediflow-app/
│
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   ├── passport.js
│   │   └── permissions.js
│   │
│   ├── controllers/
│   │   └── PatientController.js
│   │
│   ├── middleware/
│   │   └── auth.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Department.js
│   │   └── Patient.js
│   │
│   ├── routes/
│   │   ├── auth.js
│   │   ├── googleAuth.js
│   │   ├── users.js
│   │   ├── patients.js
│   │   ├── departments.js
│   │   ├── doctor.js
│   │   └── appointments.js
│   │
│   ├── scripts/
│   │   ├── seedAdmin.js
│   │   └── deleteUser.js
│   │
│   ├── utils/
│   │   ├── tokens.js
│   │   └── helpers.js
│   │
│   ├── node_modules/
│   ├── .env
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
├── public/
│
├── src/
│   ├── api/
│   │   └── api.js
│   │
│   ├── assets/
│   │
│   ├── auth/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── OAuthSuccess.jsx
│   │
│   ├── components/
│   │   ├── header/
│   │   ├── sidebar/
│   │   ├── appointments/
│   │   └── forms/
│   │
│   ├── context/
│   │   └── AuthContext.js
│   │
│   ├── hooks/
│   │
│   ├── layout/
│   │   └── Layout.jsx
│   │
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Users.jsx
│   │   │   └── Departments.jsx
│   │   ├── patient/
│   │   ├── doctor/
│   │   └── dashboard/
│   │
│   ├── router/
│   │   └── AppRouter.jsx
│   │
│   ├── services/
│   │   ├── authService.js
│   │   ├── patientService.js
│   │   ├── appointmentService.js
│   │   └── departmentService.js
│   │
│   ├── styles/
│   │   └── global.css
│   │
│   └── App.jsx
│
├── node_modules/
├── package.json
├── package-lock.json
└── README.md

---

## 🛠️ Installation & Setup

### 📥 Clone the Repository
```bash
git clone https://github.com/lohochris/MediFlow.git
cd MediFlow

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
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

Seed SuperAdmin (important)
npm run seed:admin


Default credentials:

Email: admin@mediflow.com
Password: Admin123

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

⭐ Support the Project

If you like this project, give it a star on GitHub ⭐
Your support encourages further development!