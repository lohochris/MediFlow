// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./context/ThemeContext";
// ⭐ FIX 1: Import the named export { AuthProvider }
import { AuthProvider } from "./context/AuthContext"; 
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "./components/common/ErrorBoundary";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <ThemeProvider>
        {/* ⭐ FIX 2: Wrap the App component with AuthProvider */}
        <AuthProvider>
          <App />
          <Toaster position="top-right" />
        </AuthProvider>
    </ThemeProvider>
  </ErrorBoundary>
);