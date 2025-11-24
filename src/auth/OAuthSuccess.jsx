// src/auth/OAuthSuccess.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { saveGoogleLogin } from "../services/authService";
import toast from "react-hot-toast";

export default function OAuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    async function finalize() {
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (!token) {
          toast.error("Google login failed: No token received.");
          return navigate("/");
        }

        // Decode JWT payload
        const payload = JSON.parse(atob(token.split(".")[1]));

        const userObj = {
          _id: payload.sub,
          role: payload.role,
          // Optional fields if included in backend JWT
          email: payload.email,
          name: payload.name,
        };

        // Save login session (your existing system)
        saveGoogleLogin(token, userObj);

        // Redirect based on role
        switch (userObj.role) {
          case "Admin":
          case "SuperAdmin":
            return navigate("/admin");

          case "Doctor":
            return navigate("/doctor");

          default:
            return navigate("/dashboard");
        }

      } catch (err) {
        console.error("OAuthSuccess error:", err);
        toast.error("Google login error.");
        navigate("/");
      }
    }

    finalize();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center text-lg">
      Logging you in with Google...
    </div>
  );
}
