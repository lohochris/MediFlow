// src/auth/OAuthSuccess.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { saveGoogleLogin } from "../services/authService";
import { useAuth } from "../context/AuthContext";

export default function OAuthSuccess() {
  const navigate = useNavigate();
  const { reloadUser } = useAuth();

  useEffect(() => {
    async function finalizeGoogleLogin() {
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (!token) {
          toast.error("Google login failed: No token received.");
          return navigate("/");
        }

        // --- Decode JWT payload ---
        let payload;
        try {
          const base64 = token.split(".")[1];
          payload = JSON.parse(atob(base64));
        } catch {
          toast.error("Invalid Google login token");
          return navigate("/");
        }

        // Construct user object for temporary local storage
        const userObj = {
          _id: payload.sub,
          role: payload.role,
          email: payload.email,
          name: payload.name,
        };

        // Save token + user → LocalStorage (same as email/password login)
        saveGoogleLogin(token, userObj);

        // Reload full user data from backend (patientId, profile, etc.)
        const finalUser = await reloadUser();

        if (!finalUser) {
          toast.error("Failed to load your account.");
          return navigate("/");
        }

        // ---- Role-based redirects ----
        switch (finalUser.role) {
          case "Admin":
          case "SuperAdmin":
            return navigate("/admin");

          case "Doctor":
            return navigate("/doctor/dashboard");

          default:
            return navigate("/dashboard");
        }
      } catch (err) {
        console.error("OAuthSuccess error:", err);
        toast.error("Google login error.");
        navigate("/");
      }
    }

    finalizeGoogleLogin();
  }, [navigate, reloadUser]);

  return (
    <div className="min-h-screen flex items-center justify-center text-lg">
      Logging you in with Google...
    </div>
  );
}
