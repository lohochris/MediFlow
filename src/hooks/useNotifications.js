// src/hooks/useNotifications.js
import { useEffect, useState, useRef } from "react";

export default function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [connected, setConnected] = useState(false);
  const evtSourceRef = useRef(null);

  useEffect(() => {
    // fetch initial notifications
    const fetchInitial = async () => {
      try {
        const res = await fetch("/api/notifications", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (e) { console.error(e); }
    };
    fetchInitial();

    // open SSE connection
    const es = new EventSource("/api/notifications/stream", { withCredentials: true });
    evtSourceRef.current = es;

    es.addEventListener("open", () => setConnected(true));
    es.addEventListener("notification", (ev) => {
      const note = JSON.parse(ev.data);
      setNotifications((n) => [note, ...n]);
    });
    es.addEventListener("activity", (ev) => {
      // optional: you can use this to trigger refreshes of dashboards
      const act = JSON.parse(ev.data);
      // For example you could set a small state to cause re-fetch
      // or use a global state manager to trigger dashboard reloads
      // console.debug("activity", act);
    });
    es.addEventListener("ping", () => {});

    es.onerror = (e) => {
      setConnected(false);
      // Try reconnect logic is automatic for EventSource (browser-level)
    };

    return () => {
      es.close();
    };
  }, []);

  const markAllRead = async () => {
    try {
      const res = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        setNotifications((n) => n.map((x) => ({ ...x, read: true })));
      }
    } catch (e) { console.error(e); }
  };

  return { notifications, markAllRead, connected };
}
