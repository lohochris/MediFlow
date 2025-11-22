// src/pages/Doctor/UploadFiles.jsx
import React, { useState } from "react";
import api from "../../api/api";
import toast from "react-hot-toast";

export default function UploadFiles({ patientId, onUploaded }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const fd = new FormData();
      fd.append("file", file);

      // Correct backend route
      const res = await api.post(`/api/patients/${patientId}/files`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      toast.success("File uploaded successfully");
      if (onUploaded) onUploaded(res.data);

    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      toast.error(err?.response?.data?.error || "File upload failed");
    } finally {
      setUploading(false);

      // reset file input so same file can be re-uploaded if needed
      if (e?.target) e.target.value = "";
    }
  };

  return (
    <label
      className="
        inline-flex items-center gap-2 
        px-3 py-2 rounded cursor-pointer
        bg-slate-100 dark:bg-slate-800
        hover:bg-slate-200 dark:hover:bg-slate-700
        transition
      "
    >
      <input type="file" className="hidden" onChange={handleUpload} />
      {uploading ? "Uploading..." : "Upload File"}
    </label>
  );
}
