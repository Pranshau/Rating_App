import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles = [], children }) {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  if (!user || !user.role) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/login" replace />;

  return children;
}
