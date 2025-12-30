import React from "react";
import { Navigate } from "react-router-dom";
import { useTransactions } from "../contexts/TransactionContext"; // Fix path

export default function ProtectedRoute({ children }) {
  const { user, loading } = useTransactions();
  
  if (loading) {
    return <div>Loading...</div>; // Show loading while checking auth
  }
  
  if (!user || user.isGuest) { // Check if user exists AND is not guest
    return <Navigate to="/login" replace />;
  }
  
  return children;
}