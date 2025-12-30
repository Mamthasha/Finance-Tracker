import React from "react";
import { Routes, Route } from "react-router-dom";
import DashboardPage from "./components/Dashboard/Dashboard";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import PrivacyPolicy from "./components/Footer/PrivacyPolicy";
import TermsOfService from "./components/Footer/TermsOfService";
import "./App.css";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
    </Routes>
  );
}