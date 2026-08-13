import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Cookie, X, Check } from "lucide-react";
import "../styles/pages.css";

export const CookieBanner: React.FC = () => {
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    const consent = localStorage.getItem("day_cookie_consent");
    if (!consent) {
      // Small delay for smooth entry after load
      const timer = setTimeout(() => {
        setVisible(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("day_cookie_consent", "accepted");
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("day_cookie_consent", "essential_only");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="cookie-banner-wrap"
      style={{
        position: "fixed",
        bottom: "20px",
        left: "20px",
        right: "20px",
        maxWidth: "520px",
        margin: "0 auto",
        zIndex: 9999,
      }}
    >
      <div
        className="glass-panel"
        style={{
          padding: "1.25rem 1.5rem",
          borderRadius: "18px",
          border: "1px solid var(--color-border)",
          boxShadow: "0 12px 36px rgba(0, 0, 0, 0.25)",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          backgroundColor: "var(--glass-bg)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-primary)" }}>
            <Cookie size={20} />
            <h4 style={{ fontSize: "0.95rem", margin: 0, fontWeight: 700, color: "var(--color-text-dark)" }}>
              Cookie & Privacy Consent
            </h4>
          </div>

          <button
            onClick={handleDecline}
            aria-label="Close cookie banner"
            style={{ color: "var(--color-text-muted)", cursor: "pointer", padding: "4px" }}
          >
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", margin: 0, lineHeight: 1.5 }}>
          We use cookies and local storage to personalize your experience, remember theme preferences (e.g. Dark Mode), and ensure secure donation processing. Learn more in our{" "}
          <Link to="/privacy" style={{ color: "var(--color-primary)", textDecoration: "underline", fontWeight: 600 }}>
            Privacy Policy
          </Link>.
        </p>

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", flexWrap: "wrap", marginTop: "4px" }}>
          <button
            onClick={handleDecline}
            className="btn-outline"
            style={{
              padding: "0.45rem 0.9rem",
              fontSize: "0.78rem",
              borderRadius: "9999px",
              cursor: "pointer",
            }}
          >
            Essential Only
          </button>

          <button
            onClick={handleAccept}
            className="btn-primary"
            style={{
              padding: "0.45rem 1.1rem",
              fontSize: "0.78rem",
              borderRadius: "9999px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <Check size={14} /> Accept All
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
