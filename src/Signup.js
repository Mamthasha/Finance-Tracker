import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      alert("Signup Failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <button 
        className="auth-back-btn" 
        onClick={() => navigate("/")}
        title="Back to Dashboard"
      >
        ←
      </button>
      
      <div className="auth-container">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p className="auth-subtitle">Start tracking your finances today</p>
        </div>

        <form className="auth-form" onSubmit={handleSignup}>
          <div className="auth-input-group">
            <span className="icon">✉️</span>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="auth-input-group">
            <span className="icon">🔒</span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password (min. 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
              disabled={loading}
            />
            <button 
              type="button" 
              className="auth-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex="-1"
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>

          <button 
            type="submit" 
            className={`auth-btn ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account →'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{" "}
            <button className="auth-link" onClick={() => navigate("/login")}>
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}