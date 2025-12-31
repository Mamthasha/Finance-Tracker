import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Your Account</h2>
        <p style={styles.subtitle}>Join our community today</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSignup} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              style={styles.input}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button 
            style={styles.button} 
            disabled={loading}
            onMouseEnter={(e) => e.target.style.background = styles.button.hoverBg}
            onMouseLeave={(e) => e.target.style.background = styles.button.background}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <div style={styles.divider}>
          <hr style={styles.dividerLine} />
          <span style={styles.dividerText}>or</span>
          <hr style={styles.dividerLine} />
        </div>

        <div style={styles.linkContainer}>
          <div style={styles.linkText}>
            Already have an account? <Link to="/login" style={styles.link}>Login</Link>
          </div>
          <div style={styles.linkText}>
            <Link to="/" style={styles.link}>Continue as Guest</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #b3e0ff 0%, #ffccd5 100%)", // Matching Login page gradient
    padding: "20px",
  },
  card: {
    background: "rgba(255, 255, 255, 0.92)",
    padding: "40px 32px",
    borderRadius: "24px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 8px 32px rgba(173, 216, 230, 0.25)",
    border: "1px solid rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(8px)",
  },
  title: {
    textAlign: "center",
    marginBottom: "8px",
    color: "#4a5568",
    fontSize: "32px",
    fontWeight: "600",
    background: "linear-gradient(90deg, #66b3ff, #ff99cc)", // Matching gradient
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: "32px",
    color: "#718096",
    fontSize: "14px",
    fontWeight: "400",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    color: "#4a5568",
    fontSize: "14px",
    fontWeight: "500",
    marginLeft: "4px",
  },
  input: {
    padding: "14px 16px",
    borderRadius: "12px",
    border: "2px solid #e2e8f0",
    fontSize: "15px",
    color: "#2d3748",
    backgroundColor: "#f8fafc",
    transition: "all 0.3s ease",
    outline: "none",
  },
  button: {
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #66b3ff, #ff99cc)", // Same as Login button
    color: "#ffffff",
    fontWeight: "600",
    fontSize: "16px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginTop: "8px",
    boxShadow: "0 4px 12px rgba(102, 179, 255, 0.3)",
    hoverBg: "linear-gradient(135deg, #3399ff, #ff66a3)",
  },
  error: {
    color: "#c53030",
    background: "linear-gradient(135deg, #fed7d7, #fff5f5)",
    padding: "14px",
    borderRadius: "12px",
    marginBottom: "24px",
    textAlign: "center",
    fontSize: "14px",
    border: "1px solid #fc8181",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "28px 0",
    gap: "12px",
  },
  dividerLine: {
    flex: "1",
    border: "none",
    height: "1px",
    background: "#e2e8f0",
  },
  dividerText: {
    color: "#a0aec0",
    fontSize: "14px",
    padding: "0 12px",
  },
  linkContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  linkText: {
    textAlign: "center",
    fontSize: "14px",
    color: "#718096",
  },
  link: {
    color: "#66b3ff",
    textDecoration: "none",
    fontWeight: "500",
    transition: "color 0.3s ease",
  },
};