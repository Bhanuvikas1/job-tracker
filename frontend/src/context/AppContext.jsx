import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/api";
import { useAuth } from "./AuthContext";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const { user } = useAuth();

  const loadApplications = async () => {
    if (!user) {
      setApplications([]);
      return;
    }
    try {
      setLoadingApps(true);
      const res = await api.get("/api/applications");
      setApplications(res.data || []);
    } catch (e) {
      // If backend isn't started yet, keep UI usable.
      setApplications([]);
    } finally {
      setLoadingApps(false);
    }
  };

  useEffect(() => {
    loadApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const addApplication = async ({ company, role, status, notes }) => {
    const res = await api.post("/api/applications", { company, role, status, notes });
    setApplications((prev) => [...prev, res.data]);
  };

  const deleteApplication = async (id) => {
    await api.delete(`/api/applications/${id}`);
    setApplications((prev) => prev.filter((a) => a.id !== id));
  };

  const updateStatus = async (id, newStatus) => {
    const res = await api.put(`/api/applications/${id}/status`, { status: newStatus });
    setApplications((prev) => prev.map((a) => (a.id === id ? res.data : a)));
  };

  const counts = useMemo(() => {
    const c = { APPLIED: 0, INTERVIEW: 0, OFFER: 0, REJECTED: 0 };
    for (const a of applications) c[a.status] = (c[a.status] || 0) + 1;
    return c;
  }, [applications]);

  const value = {
    applications,
    addApplication,
    deleteApplication,
    updateStatus,
    counts,
    loadingApps,
    reload: loadApplications,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
