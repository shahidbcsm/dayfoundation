import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Heart, UserPlus } from "lucide-react";
import "../styles/pages.css";

export const StickyMobileCTA: React.FC = () => {
  const [show, setShow] = useState<boolean>(false);
  const location = useLocation();

  // Hide on donate, admin, or status routes
  const hideOnRoutes = ["/donate", "/mrshahidbabu", "/donate/success", "/thank-you"];
  const isHiddenRoute = hideOnRoutes.includes(location.pathname);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky CTA after scrolling 250px down on mobile
      if (window.scrollY > 250 && window.innerWidth < 768) {
        setShow(true);
      } else {
        setShow(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  if (isHiddenRoute || !show) return null;

  return (
    <div
      className="sticky-mobile-cta-bar"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9990,
        backgroundColor: "rgba(18, 17, 16, 0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(255, 255, 255, 0.12)",
        padding: "10px 16px",
        display: "flex",
        gap: "10px",
        alignItems: "center",
        boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.3)",
      }}
    >
      <Link
        to="/volunteer"
        className="btn-outline"
        style={{
          flex: 1,
          padding: "10px 14px",
          fontSize: "0.85rem",
          fontWeight: 700,
          borderRadius: "9999px",
          textAlign: "center",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          border: "1.5px solid var(--color-primary)",
          color: "var(--color-primary)",
          backgroundColor: "transparent",
        }}
      >
        <UserPlus size={16} />
        <span>Volunteer</span>
      </Link>

      <Link
        to="/donate"
        className="donate-cta-btn"
        style={{
          flex: 1.3,
          padding: "11px 16px",
          fontSize: "0.9rem",
          fontWeight: 800,
          borderRadius: "9999px",
          textAlign: "center",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          backgroundColor: "#DCFBA6",
          color: "#1E2D12",
          border: "none",
          boxShadow: "0 4px 12px rgba(220, 251, 166, 0.3)",
        }}
      >
        <Heart size={16} fill="#1E2D12" />
        <span>Donate Now</span>
      </Link>
    </div>
  );
};

export default StickyMobileCTA;
