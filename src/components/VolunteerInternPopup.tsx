import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, HeartHandshake, GraduationCap, X, ArrowRight } from "lucide-react";

export const VolunteerInternPopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Show popup ONLY on the Home Page ("/")
    if (location.pathname !== "/") {
      return;
    }

    // Check if popup was already shown/dismissed during this session (prevents popup on refresh)
    const hasSeen = sessionStorage.getItem("day_opportunity_popup_seen");
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("day_opportunity_popup_seen", "true");
  };

  const handleNavigate = (path: string) => {
    handleClose();
    navigate(path);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "520px",
              background: "linear-gradient(135deg, #ffffff 0%, #FAF6F0 100%)",
              borderRadius: "24px",
              padding: "2.25rem 2rem 2rem 2rem",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(252, 78, 30, 0.15)",
              overflow: "hidden",
            }}
          >
            {/* Top Accent Gradient Bar */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "6px",
                background: "linear-gradient(90deg, #FC4E1E 0%, #FF8A00 50%, #0F4C81 100%)",
              }}
            />

            {/* Close Button */}
            <button
              onClick={handleClose}
              aria-label="Close modal"
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "none",
                backgroundColor: "rgba(15, 23, 42, 0.06)",
                color: "#64748b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(252, 78, 30, 0.1)";
                e.currentTarget.style.color = "#FC4E1E";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(15, 23, 42, 0.06)";
                e.currentTarget.style.color = "#64748b";
              }}
            >
              <X size={18} />
            </button>

            {/* Header Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                borderRadius: "100px",
                backgroundColor: "rgba(252, 78, 30, 0.1)",
                color: "#FC4E1E",
                fontSize: "0.825rem",
                fontWeight: 700,
                letterSpacing: "0.02em",
                marginBottom: "1rem",
              }}
            >
              <Sparkles size={14} />
              <span>Join DAY Foundation Family</span>
            </div>

            {/* Title */}
            <h2
              style={{
                fontSize: "1.65rem",
                fontWeight: 800,
                color: "#0F4C81",
                lineHeight: "1.25",
                marginBottom: "0.75rem",
                letterSpacing: "-0.02em",
              }}
            >
              Make an Impact — Become a Volunteer or Intern!
            </h2>

            {/* Subtext */}
            <p
              style={{
                fontSize: "0.95rem",
                color: "#475569",
                lineHeight: "1.55",
                marginBottom: "1.75rem",
              }}
            >
              Gain real-world leadership experience, earn certified credentials, and help empower youth & underprivileged communities across India.
            </p>

            {/* Action Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", marginBottom: "1.5rem" }}>
              {/* Option 1: Internship */}
              <div
                onClick={() => handleNavigate("/internship")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "1rem 1.25rem",
                  borderRadius: "16px",
                  backgroundColor: "#ffffff",
                  border: "1.5px solid #e2e8f0",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#FC4E1E";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(252, 78, 30, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.05)";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      backgroundColor: "rgba(252, 78, 30, 0.1)",
                      color: "#FC4E1E",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <GraduationCap size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0F4C81", margin: 0 }}>
                      Apply for Internship
                    </h3>
                    <p style={{ fontSize: "0.8rem", color: "#64748b", margin: 0, marginTop: "2px" }}>
                      Earn Verified Certificate & LOR
                    </p>
                  </div>
                </div>
                <ArrowRight size={18} style={{ color: "#FC4E1E", flexShrink: 0 }} />
              </div>

              {/* Option 2: Volunteer */}
              <div
                onClick={() => handleNavigate("/volunteer")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "1rem 1.25rem",
                  borderRadius: "16px",
                  backgroundColor: "#ffffff",
                  border: "1.5px solid #e2e8f0",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#0F4C81";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(15, 76, 129, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.05)";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      backgroundColor: "rgba(15, 76, 129, 0.1)",
                      color: "#0F4C81",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <HeartHandshake size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0F4C81", margin: 0 }}>
                      Become a Volunteer
                    </h3>
                    <p style={{ fontSize: "0.8rem", color: "#64748b", margin: 0, marginTop: "2px" }}>
                      Drive Education, Social & Healthcare Drives
                    </p>
                  </div>
                </div>
                <ArrowRight size={18} style={{ color: "#0F4C81", flexShrink: 0 }} />
              </div>
            </div>

            {/* Footer dismiss link */}
            <div style={{ textAlign: "center" }}>
              <button
                onClick={handleClose}
                style={{
                  background: "none",
                  border: "none",
                  color: "#94a3b8",
                  fontSize: "0.825rem",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Maybe later, continue browsing website
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default VolunteerInternPopup;
