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
      const res = await api.post(`/patients/${patientId}/files`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Uploaded");
      onUploaded && onUploaded(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <label className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 rounded cursor-pointer">
      <input type="file" className="hidden" onChange={handleUpload} />
      {uploading ? "Uploading..." : "Upload file"}
    </label>
  );
}
