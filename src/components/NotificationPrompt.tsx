import React, { useState, useEffect } from "react";
import { Bell, X, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getSubscriptionStatus, requestNotificationPermission, subscribeToLiveBroadcasts, type BroadcastDoc } from "../services/notificationService";

export const NotificationPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [activeBroadcast, setActiveBroadcast] = useState<BroadcastDoc | null>(null);

  useEffect(() => {
    // Show prompt to new visitors after 6 seconds
    const status = getSubscriptionStatus();
    if (status === "default") {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // Listen to real-time broadcasts
    const unsub = subscribeToLiveBroadcasts((broadcast) => {
      setActiveBroadcast(broadcast);
      // Auto-hide broadcast after 8 seconds
      setTimeout(() => {
        setActiveBroadcast(null);
      }, 8000);
    });
    return () => unsub();
  }, []);

  const handleSubscribe = async () => {
    const success = await requestNotificationPermission();
    setShowPrompt(false);
    if (success) {
      // Trigger a direct congratulations notification
      if (Notification.permission === "granted") {
        new Notification("Subscribed!", {
          body: "You've successfully subscribed to live notifications from DAY Foundation.",
          icon: "/logo.png"
        });
      }
    }
  };

  return (
    <>
      <AnimatePresence>
        {/* Visitor Subscription Prompt */}
        {showPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="notification-prompt-card"
            style={{
              position: "fixed",
              bottom: "24px",
              left: "24px",
              zIndex: 9999,
              maxWidth: "360px",
              backgroundColor: "var(--color-bg-white)",
              backdropFilter: "blur(16px)",
              border: "1px solid var(--color-border)",
              borderRadius: "16px",
              padding: "1.25rem",
              boxShadow: "var(--shadow-lg)",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem"
            }}
          >
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <div 
                className="notification-icon-wrap"
                style={{
                  background: "var(--color-primary-light)",
                  color: "var(--color-primary)",
                  borderRadius: "10px",
                  padding: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Bell size={20} className="animate-pulse" />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--color-primary)", margin: 0 }}>Stay Connected</h4>
                <p style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", margin: "4px 0 0 0", lineHeight: 1.4 }}>
                  Get real-time browser alerts about Sunday learning circles, health drives, and urgent community updates.
                </p>
              </div>
              <button 
                onClick={() => setShowPrompt(false)}
                className="notification-close-btn"
                style={{ background: "none", border: "none", color: "var(--color-text-muted)", cursor: "pointer", padding: "2px" }}
              >
                <X size={16} />
              </button>
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "4px" }}>
              <button 
                onClick={() => setShowPrompt(false)}
                className="notification-later-btn"
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "var(--color-text-muted)",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                Later
              </button>
              <button 
                onClick={handleSubscribe}
                className="notification-subscribe-btn"
                style={{
                  background: "var(--color-primary)",
                  border: "none",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#ffffff",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  boxShadow: "var(--shadow-sm)"
                }}
              >
                Subscribe
              </button>
            </div>
          </motion.div>
        )}

        {/* Live Broadcast Pop-up / Notification Toast */}
        {activeBroadcast && (
          <motion.div
            initial={{ opacity: 0, x: 100, y: 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{
              position: "fixed",
              top: "24px",
              right: "24px",
              zIndex: 10000,
              maxWidth: "400px",
              width: "calc(100% - 48px)",
              background: "rgba(15, 76, 129, 0.95)",
              backdropFilter: "blur(12px)",
              color: "white",
              borderRadius: "16px",
              padding: "1.25rem",
              boxShadow: "0 15px 35px rgba(0, 0, 0, 0.2)",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}
          >
            <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
              <div style={{
                background: "rgba(255, 255, 255, 0.15)",
                color: "white",
                borderRadius: "12px",
                padding: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <CheckCircle size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.7)", fontWeight: 700 }}>Live Broadcast Alert</div>
                <h4 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "4px 0 0 0", color: "#ffffff" }}>{activeBroadcast.title}</h4>
                <p style={{ fontSize: "0.82rem", color: "rgba(255, 255, 255, 0.9)", margin: "6px 0 0 0", lineHeight: 1.4 }}>{activeBroadcast.body}</p>
              </div>
              <button 
                onClick={() => setActiveBroadcast(null)}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", padding: "2px" }}
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
