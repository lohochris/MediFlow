// src/auth/OAuthSuccess.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { saveGoogleLogin, getCurrentUser } from "../services/authService";
import toast from "react-hot-toast";

export default function OAuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    async function finalize() {
      try {
        const params = new URLSearchParams(window.location.search);

        // Data passed from backend redirect
        const token = params.get("token");
        const name = params.get("name");
        const email = params.get("email");
        const role = params.get("role");
        const id = params.get("id");

        if (!token || !email || !id) {
          toast.error("Google login failed.");
          return navigate("/");
        }

        // Construct user object from redirect info
        const userObj = {
          _id: id,
          name,
          email,
          role,
        };

        // Save login with token
        saveGoogleLogin(token, userObj);

        const saved = getCurrentUser();

        if (!saved) {
          toast.error("Login session failed.");
          return navigate("/");
        }

        // Redirect
        if (saved.role === "Admin") navigate("/admin");
        else if (saved.role === "Doctor") navigate("/doctor");
        else navigate("/dashboard");

      } catch (err) {
        console.error(err);
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
