import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Heart, BookOpen, Mail, AlertTriangle } from "lucide-react";
import "../styles/pages.css";

export const NotFound: React.FC = () => {
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
          maxWidth: "680px",
          width: "100%",
          padding: "3rem 2rem",
          textAlign: "center",
          borderRadius: "24px",
          border: "1px solid var(--color-border-light)",
          boxShadow: "var(--shadow-xl)",
        }}
      >
        {/* Animated Badge Icon */}
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            backgroundColor: "rgba(var(--color-primary-rgb), 0.12)",
            color: "var(--color-primary)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1.5rem",
          }}
        >
          <AlertTriangle size={42} />
        </div>

        <span
          className="badge-custom"
          style={{
            fontSize: "0.8rem",
            marginBottom: "1rem",
            display: "inline-block",
          }}
        >
          Error 404 — Page Not Found
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
          Oops! You've Discovered a Missing Pathway
        </h1>

        <p
          style={{
            fontSize: "1rem",
            color: "var(--color-text-muted)",
            maxWidth: "520px",
            margin: "0 auto 2.5rem auto",
            lineHeight: 1.6,
          }}
        >
          The page you are looking for doesn't exist, was renamed, or has been moved. Let's guide you back to our community welfare initiatives.
        </p>

        {/* Primary Action Buttons */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: "3rem",
          }}
        >
          <Link to="/" className="btn btn-primary" style={{ padding: "0.85rem 1.8rem" }}>
            <Home size={18} />
            <span>Return to Homepage</span>
          </Link>

          <Link to="/donate" className="btn btn-secondary" style={{ padding: "0.85rem 1.8rem" }}>
            <Heart size={18} />
            <span>Support Our Work</span>
          </Link>
        </div>

        {/* Quick Nav Links Grid */}
        <div
          style={{
            borderTop: "1px solid var(--color-border-light)",
            paddingTop: "2rem",
          }}
        >
          <p
            style={{
              fontSize: "0.85rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--color-text-muted)",
              marginBottom: "1.25rem",
            }}
          >
            Popular Destinations
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "1rem",
            }}
          >
            <Link
              to="/about"
              className="premium-card"
              style={{
                padding: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                justifyContent: "center",
                textDecoration: "none",
              }}
            >
              <BookOpen size={16} style={{ color: "var(--color-primary)" }} />
              <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>About Us</span>
            </Link>

            <Link
              to="/programs"
              className="premium-card"
              style={{
                padding: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                justifyContent: "center",
                textDecoration: "none",
              }}
            >
              <Heart size={16} style={{ color: "var(--color-primary)" }} />
              <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>Our Programs</span>
            </Link>

            <Link
              to="/volunteer"
              className="premium-card"
              style={{
                padding: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                justifyContent: "center",
                textDecoration: "none",
              }}
            >
              <Home size={16} style={{ color: "var(--color-primary)" }} />
              <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>Volunteer</span>
            </Link>

            <Link
              to="/contact"
              className="premium-card"
              style={{
                padding: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                justifyContent: "center",
                textDecoration: "none",
              }}
            >
              <Mail size={16} style={{ color: "var(--color-primary)" }} />
              <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>Contact Us</span>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NotFound;
