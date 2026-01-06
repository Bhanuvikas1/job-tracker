import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/api";

const AuthContext = createContext(null);

// normalize backend response into {name,email}
function normalizeUser(data) {
  if (!data) return null;

  // backend returned "email" as string
  if (typeof data === "string") return { name: "", email: data };

  const name = data.name ?? data.fullName ?? data.username ?? data.userName ?? "";
  const email = data.email ?? data.mail ?? data.userEmail ?? "";

  return { name, email };
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  const saveUser = (u) => {
    setUser(u);
    if (u) localStorage.setItem("user", JSON.stringify(u));
    else localStorage.removeItem("user");
  };

  const loadMe = async () => {
    try {
      const res = await api.get("/api/auth/me");
      const normalized = normalizeUser(res.data);
      saveUser(normalized);
    } catch (e) {
      saveUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMe();
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/api/auth/login", { email, password });

    const normalized = normalizeUser(res.data);
    if (normalized && (normalized.email || normalized.name)) {
      saveUser({ ...normalized, email: normalized.email || email });
      setLoading(false);
    } else {
      setLoading(true);
      await loadMe();
    }

    return res;
  };

  const register = async (name, email, password) => {
    const res = await api.post("/api/auth/register", { name, email, password });


    return res;
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (e) {

    }
    saveUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        reload: loadMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
