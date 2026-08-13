import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Share2, ShieldCheck, Home } from "lucide-react";
import "../styles/pages.css";

export const ThankYou: React.FC = () => {
  const [searchParams] = useSearchParams();
  const name = searchParams.get("name") || "Supporter";
  const type = searchParams.get("type") || "contribution";
  const txId = searchParams.get("txId") || `DAY-${Math.floor(100000 + Math.random() * 900000)}`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "I supported DAY Foundation!",
        text: "Join me in empowering underprivileged children and communities with DAY Foundation.",
        url: "https://www.dayfoundation.in",
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText("https://www.dayfoundation.in");
      alert("Link copied to clipboard! Share it with your friends.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      style={{
        minHeight: "85vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "120px 1rem 4rem 1rem",
        backgroundColor: "var(--color-bg-white)",
      }}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: "720px",
          width: "100%",
          padding: "3.5rem 2rem",
          textAlign: "center",
          borderRadius: "24px",
          border: "1px solid var(--color-border-light)",
          boxShadow: "var(--shadow-xl)",
        }}
      >
        {/* Animated Checkmark Badge */}
        <div
          style={{
            width: "90px",
            height: "90px",
            borderRadius: "50%",
            backgroundColor: "rgba(37, 211, 102, 0.15)",
            color: "#25D366",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1.5rem",
          }}
        >
          <CheckCircle2 size={52} />
        </div>

        <span
          className="badge-custom"
          style={{
            fontSize: "0.8rem",
            marginBottom: "1rem",
            display: "inline-block",
          }}
        >
          Impact Confirmed
        </span>

        <h1
          style={{
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontFamily: "var(--font-serif)",
            color: "var(--color-text-dark)",
            marginBottom: "1rem",
            lineHeight: 1.2,
          }}
        >
          Thank You, {name}! 🎉
        </h1>

        <p
          style={{
            fontSize: "1.05rem",
            color: "var(--color-text-muted)",
            maxWidth: "560px",
            margin: "0 auto 2rem auto",
            lineHeight: 1.6,
          }}
        >
          Your {type} brings hope, education, and vital resources to underprivileged children and families across India.
        </p>

        {/* Reference / Transaction Ticket Box */}
        <div
          className="premium-card"
          style={{
            maxWidth: "480px",
            margin: "0 auto 2.5rem auto",
            padding: "1.25rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            textAlign: "left",
            backgroundColor: "var(--color-bg-gray)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
              Reference ID
            </span>
            <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--color-primary)", fontFamily: "monospace" }}>
              {txId}
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
              Status
            </span>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#25D366", display: "flex", alignItems: "center", gap: "4px" }}>
              <ShieldCheck size={14} /> Received & Processing
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
              Tax Exemption (80G)
            </span>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-dark)" }}>
              Receipt sent to email
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: "2rem",
          }}
        >
          <Link to="/" className="btn btn-primary" style={{ padding: "0.85rem 1.8rem" }}>
            <Home size={18} />
            <span>Return Home</span>
          </Link>

          <button onClick={handleShare} className="btn btn-outline" style={{ padding: "0.85rem 1.8rem" }}>
            <Share2 size={18} />
            <span>Share Impact</span>
          </button>
        </div>

        <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
          Need assistance or want to track your receipt status?{" "}
          <Link to="/internship-status" style={{ color: "var(--color-primary)", fontWeight: 700 }}>
            Click here to Track Status
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default ThankYou;
