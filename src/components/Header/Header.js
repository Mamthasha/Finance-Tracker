import React from "react";
import { Link } from "react-router-dom";
import { useTransactions } from "../../contexts/TransactionContext";

export default function Header(){
  const { user, handleLogout, darkMode, setDarkMode } = useTransactions();
  
  return (
    <header className="navbar navbar-expand-lg navbar-dark bg-primary mb-4 rounded shadow">
      <div className="container-fluid">
        <div>
          <h1 className="navbar-brand mb-0 h1 d-flex align-items-center">
            {/* LOGO */}
            <img 
              src={process.env.PUBLIC_URL + "/logo/cashsanctum.png"}
              alt="CashSanctum Logo" 
              width="40" 
              height="40"
              className="me-2 rounded"
              style={{ objectFit: "contain" }}
            />
            
            <div className="d-flex flex-column">
              <span className="fw-bold fs-3">CashSanctum</span>
              <small className="text-light opacity-75 fs-6">
                Your Financial Fortress
              </small>
            </div>
          </h1>
        </div>
        
        <div className="d-flex align-items-center">
          {user && !user.isGuest ? (
            <div className="d-flex align-items-center gap-3">
              <span className="badge bg-light text-dark">
                {user.email || "User"}
              </span>
              <button 
                className="btn btn-outline-light btn-sm" 
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="d-flex gap-2 align-items-center">
              <span className="badge bg-light text-dark me-2">
                Guest Mode
              </span>
              <Link to="/login" className="btn btn-light btn-sm">Login</Link>
              <Link to="/signup" className="btn btn-success btn-sm">Sign Up</Link>
            </div>
          )}
          <div className="form-check form-switch ms-3">
            <input 
              className="form-check-input" 
              type="checkbox" 
              id="darkModeSwitch" 
              checked={darkMode} 
              onChange={() => setDarkMode(!darkMode)} 
            />
            <label className="form-check-label text-white" htmlFor="darkModeSwitch">
              {darkMode ? "🌙 Dark" : "☀️ Light"}
            </label>
          </div>
        </div>
      </div>
    </header>
  );
}
