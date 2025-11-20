// src/pages/OAuthSuccess.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { saveUser, fetchCurrentUser } from "../services/authService";
import toast from "react-hot-toast";

export default function OAuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    async function finalizeOAuth() {
      try {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get("token");

        if (!accessToken) {
          toast.error("Google login failed. Missing access token.");
          return navigate("/");
        }

        // STEP 1 — Save token temporarily
        saveUser({ accessToken });

        // STEP 2 — Fetch the real logged-in user from backend
        const user = await fetchCurrentUser();

        if (!user) {
          toast.error("Could not load your profile. Please log in again.");
          return navigate("/");
        }

        // STEP 3 — Save FULL user object + the token
        saveUser({
          ...user,
          accessToken,
        });

        toast.success(`Welcome, ${user.name}!`);

        // STEP 4 — Redirect by role
        if (user.role === "Admin") return navigate("/admin");
        if (user.role === "Doctor") return navigate("/doctor");

        // Default → patient/nurse/etc.
        return navigate("/dashboard");

      } catch (err) {
        console.error("OAuth finalize error:", err);
        toast.error("Google login failed.");
        navigate("/");
      }
    }

    finalizeOAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center text-lg">
      Logging you in with Google...
    </div>
  );
}
