import React from "react";
import { Link } from "react-router-dom";
import { useTransactions } from "../../contexts/TransactionContext";

export default function Footer() {
  const { darkMode } = useTransactions();
  
  return (
    <footer className={`mt-5 pt-4 border-top ${darkMode ? "bg-dark border-secondary" : "bg-light"}`}>
      <div className="container">
        <div className="row">
          {/* Brand */}
          <div className="col-md-4">
            <div className="d-flex align-items-center mb-2">
              <img 
                src={process.env.PUBLIC_URL + "/logo/cashsanctum.png"}
                alt="CashSanctum Logo" 
                width="28" 
                height="28"
                className="me-2 rounded"
                style={{ objectFit: "contain" }}
              />
              <h5 className={`fw-bold mb-0 ${darkMode ? "text-light" : ""}`}>
                CashSanctum
              </h5>
            </div>
            <p className={`small ${darkMode ? "text-light opacity-75" : "text-muted"}`}>
              Your financial fortress. Secure, track, and manage your money with confidence.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-md-4">
            <h5 className={darkMode ? "text-light" : ""}>Quick Links</h5>
            <ul className="list-unstyled">
              <li>
                <Link
                  to="/login"
                  className={`text-decoration-none ${darkMode ? "text-light opacity-75" : "text-muted"}`}
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/signup"
                  className={`text-decoration-none ${darkMode ? "text-light opacity-75" : "text-muted"}`}
                >
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="col-md-4">
            <h5 className={darkMode ? "text-light" : ""}>Legal</h5>
            <ul className="list-unstyled">
              <li>
                <Link
                  to="/privacy"
                  className={`text-decoration-none ${darkMode ? "text-light opacity-75" : "text-muted"}`}
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className={`text-decoration-none ${darkMode ? "text-light opacity-75" : "text-muted"}`}
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center mt-3 pt-3 border-top">
          <small className={`${darkMode ? "text-light opacity-75" : "text-muted"}`}>
            © {new Date().getFullYear()} CashSanctum. All rights reserved.
          </small>
        </div>
      </div>
    </footer>
  );
}
