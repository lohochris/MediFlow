// src/services/api.js
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;

  const opts = {
    method: options.method || "GET",

    // VERY IMPORTANT: send cookies to backend
    credentials: "include",

    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },

    // Body (stringified if provided)
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  };

  try {
    const res = await fetch(url, opts);

    // JSON Server returns 204 for delete
    if (res.status === 204) return null;

    const data = await res.json();

    if (!res.ok) {
      const err = new Error(data?.message || "API request failed");
      err.status = res.status;
      err.payload = data;
      throw err;
    }

    return data;

  } catch (err) {
    throw err;
  }
}

export default {
  get: (path) => request(path, { method: "GET" }),
  post: (path, body) => request(path, { method: "POST", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  del: (path) => request(path, { method: "DELETE" }),
};
