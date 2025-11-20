import React, { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

export default function Settings() {
  const [theme, setTheme] = useState("light");

  const [profile, setProfile] = useState({
    name: "Christopher Loho",
    email: "admin@mediflow.com",
    phone: "+234 801 123 4567",
  });

  const [clinic, setClinic] = useState({
    clinicName: "MediFlow Health Center",
    address: "123 Main Street, Lagos",
    hotline: "+234 700 111 2222",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  // Load theme
  useEffect(() => {
    const saved = localStorage.getItem("mediflow-theme") || "light";
    setTheme(saved);
    document.documentElement.classList.toggle("dark", saved === "dark");
  }, []);

  // Save theme
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("mediflow-theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const updateProfile = (e) => {
    e.preventDefault();
    alert("Profile settings updated!");
  };

  const updateClinic = (e) => {
    e.preventDefault();
    alert("Clinic information saved!");
  };

  const updatePassword = (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) {
      alert("New passwords do not match!");
      return;
    }
    alert("Password updated successfully!");
  };

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-semibold text-slate-800 mb-2">Settings</h1>
      <p className="text-slate-500 text-sm mb-6">
        Manage your profile, clinic settings and preferences.
      </p>

      {/* Theme Switch */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl shadow-sm mb-6">
        <div>
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Theme
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Switch between light and dark mode.
          </p>
        </div>

        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition"
        >
          {theme === "light" ? (
            <>
              <Moon size={16} /> Dark Mode
            </>
          ) : (
            <>
              <Sun size={16} /> Light Mode
            </>
          )}
        </button>
      </div>

      {/* Profile Settings */}
      <form
        onSubmit={updateProfile}
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-sm mb-6"
      >
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
          Profile Information
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) =>
                setProfile({ ...profile, name: e.target.value })
              }
              className="w-full border border-slate-300 dark:bg-slate-700 dark:border-slate-600 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) =>
                setProfile({ ...profile, email: e.target.value })
              }
              className="w-full border border-slate-300 dark:bg-slate-700 dark:border-slate-600 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={profile.phone}
              onChange={(e) =>
                setProfile({ ...profile, phone: e.target.value })
              }
              className="w-full border border-slate-300 dark:bg-slate-700 dark:border-slate-600 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        <button className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">
          Save Changes
        </button>
      </form>

      {/* Clinic Settings */}
      <form
        onSubmit={updateClinic}
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-sm mb-6"
      >
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
          Clinic Information
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-600 dark:text-slate-300 mb-1 block">
              Clinic Name
            </label>
            <input
              type="text"
              value={clinic.clinicName}
              onChange={(e) =>
                setClinic({ ...clinic, clinicName: e.target.value })
              }
              className="w-full border border-slate-300 dark:bg-slate-700 dark:border-slate-600 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-slate-600 dark:text-slate-300 mb-1 block">
              Address
            </label>
            <input
              type="text"
              value={clinic.address}
              onChange={(e) =>
                setClinic({ ...clinic, address: e.target.value })
              }
              className="w-full border border-slate-300 dark:bg-slate-700 dark:border-slate-600 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-slate-600 dark:text-slate-300 mb-1 block">
              Hotline
            </label>
            <input
              type="text"
              value={clinic.hotline}
              onChange={(e) =>
                setClinic({ ...clinic, hotline: e.target.value })
              }
              className="w-full border border-slate-300 dark:bg-slate-700 dark:border-slate-600 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        <button className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">
          Save Clinic Info
        </button>
      </form>

      {/* Password Settings */}
      <form
        onSubmit={updatePassword}
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-sm"
      >
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
          Change Password
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-600 dark:text-slate-300 mb-1 block">
              Current Password
            </label>
            <input
              type="password"
              value={passwords.current}
              onChange={(e) =>
                setPasswords({ ...passwords, current: e.target.value })
              }
              className="w-full border border-slate-300 dark:bg-slate-700 dark:border-slate-600 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-slate-600 dark:text-slate-300 mb-1 block">
              New Password
            </label>
            <input
              type="password"
              value={passwords.newPass}
              onChange={(e) =>
                setPasswords({ ...passwords, newPass: e.target.value })
              }
              className="w-full border border-slate-300 dark:bg-slate-700 dark:border-slate-600 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-slate-600 dark:text-slate-300 mb-1 block">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwords.confirm}
              onChange={(e) =>
                setPasswords({ ...passwords, confirm: e.target.value })
              }
              className="w-full border border-slate-300 dark:bg-slate-700 dark:border-slate-600 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        <button className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">
          Update Password
        </button>
      </form>
    </div>
  );
}
