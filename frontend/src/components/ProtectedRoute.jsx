import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        Checking session...
      </div>
    );
  }

  return user ? children : <Navigate to="/auth" replace />;
}
