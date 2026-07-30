import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FloatingWhatsApp from "./components/FloatingWhatsApp";
import { NotificationPrompt } from "./components/NotificationPrompt";
import VolunteerInternPopup from "./components/VolunteerInternPopup";
import { useScrollToTop } from "./hooks/useScrollToTop";
import { useAutoSEO } from "./hooks/useAutoSEO";

// Page View Imports
import HomeAlternative from "./pages/HomeAlternative";
import About from "./pages/About";
import Mission from "./pages/Mission";
import Programs from "./pages/Programs";
import Gallery from "./pages/Gallery";
import Blogs from "./pages/Blogs";
import BlogDetail from "./pages/BlogDetail";
import Events from "./pages/Events";
import Volunteer from "./pages/Volunteer";
import Internship from "./pages/Internship";
import Donate from "./pages/Donate";
import DonateSuccess from "./pages/DonateSuccess";
import Contact from "./pages/Contact";
import AdminDashboard from "./pages/AdminDashboard";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import RefundPolicy from "./pages/RefundPolicy";
import InternshipStatus from "./pages/InternshipStatus";

// Styles
import "./styles/index.css";

import { rtdb } from "./firebase/config";
import { ref, onValue } from "firebase/database";
import { subscribeDefaultTheme, incrementVisitorCount } from "./firebase/services";

// Component to wrap routes and handle scroll to top
const AppContent: React.FC = () => {
  useScrollToTop();
  useAutoSEO();

  // Always use the earthy alternative layout
  React.useEffect(() => {
    document.body.classList.add("layout-alternative");
    return () => document.body.classList.remove("layout-alternative");
  }, []);

  const isFirstLoad = React.useRef(true);

  React.useEffect(() => {
    incrementVisitorCount();
  }, []);

  /* ── Scroll Progress Bar ── */
  React.useEffect(() => {
    const bar = document.createElement("div");
    bar.id = "scroll-progress-bar";
    bar.style.width = "0%";
    document.body.appendChild(bar);

    const onScroll = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const pct = total > 0 ? (scrolled / total) * 100 : 0;
      bar.style.width = `${pct}%`;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      bar.remove();
    };
  }, []);

  // Global Error Interceptor to notify admin
  React.useEffect(() => {
    const handleGlobalError = async (event: ErrorEvent) => {
      try {
        const { sendAdminNotification } = await import("./services/emailService");
        await sendAdminNotification('error_alert', {
          message: event.message || "Unhandled Runtime Error",
          component: event.filename || "Window Context",
          stack: event.error?.stack || "No stack trace available.",
          ip: "127.0.0.1"
        });
      } catch (err) {
        console.error("Failed to trigger admin error alert:", err);
      }
    };

    window.addEventListener("error", handleGlobalError);
    return () => window.removeEventListener("error", handleGlobalError);
  }, []);

  React.useEffect(() => {
    // Register Service Worker for notifications support
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(err => {
        console.warn("Service Worker registration failed:", err);
      });
    }
  }, []);

  React.useEffect(() => {
    if (!rtdb) return;
    const notifRef = ref(rtdb, "live_notification");
    const unsubscribe = onValue(notifRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.id) {
        if (isFirstLoad.current) {
          isFirstLoad.current = false;
          localStorage.setItem("last_processed_push_id", data.id);
          return;
        }

        const lastId = localStorage.getItem("last_processed_push_id");
        if (lastId !== data.id) {
          localStorage.setItem("last_processed_push_id", data.id);
          if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
            if ("serviceWorker" in navigator) {
              navigator.serviceWorker.ready.then((reg) => {
                reg.showNotification(data.title, {
                  body: data.body,
                  icon: "/assets/teams/owner.jpeg",
                  badge: "/assets/teams/owner.jpeg"
                });
              }).catch(() => {
                new Notification(data.title, {
                  body: data.body,
                  icon: "/assets/teams/owner.jpeg"
                });
              });
            } else {
              new Notification(data.title, {
                body: data.body,
                icon: "/assets/teams/owner.jpeg"
              });
            }
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  /* ── Subscribe to Admin Default Theme Setting ── */
  React.useEffect(() => {
    const unsub = subscribeDefaultTheme((theme) => {
      document.body.classList.remove(
        "theme-roots", "theme-collective", "theme-harmony",
        "theme-empower", "theme-editorial", "theme-peach",
        "theme-brown", "theme-pink", "theme-cream", "theme-teal",
        "theme-organic", "classic-ngo", "theme-premium-ngo",
        "theme-pride", "theme-silver", "theme-gold", "theme-gray",
        "theme-purple", "theme-red", "theme-white", "theme-blue",
        "theme-neon", "theme-future"
      );
      document.body.classList.add(`theme-${theme}`);
      localStorage.setItem("day_design_theme", theme);
    });
    return () => unsub();
  }, []);

  /* ── Glass Page Transition Variants ── */
  const pageVariants = {
    initial:  { opacity: 0, x: 40,  filter: "blur(6px)", scale: 0.98 },
    animate:  { opacity: 1, x: 0,   filter: "blur(0px)", scale: 1,
      transition: { duration: 0.45, ease: "easeOut" as const } },
    exit:     { opacity: 0, x: -40, filter: "blur(5px)", scale: 0.98,
      transition: { duration: 0.28, ease: "easeIn" as const } },
  };

  const location = useLocation();
  const isAdminRoute = location.pathname === "/mrshahidbabu";

  return (
    <>
      {/* Global sticky blurred navigation bar — hidden on admin panel */}
      {!isAdminRoute && <Navbar />}

      {/* Core viewports with glass page transitions */}
      <div style={{ flex: 1 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ willChange: "transform, opacity, filter" }}
          >
            <Routes location={location}>
              {/* Home — always uses the Earthy Flat Alternative layout */}
              <Route path="/" element={<HomeAlternative />} />
              <Route path="/about" element={<About />} />
              <Route path="/mission" element={<Mission />} />
              <Route path="/programs" element={<Programs />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/blogs" element={<Blogs />} />
              <Route path="/blogs/:id" element={<BlogDetail />} />
              <Route path="/events" element={<Events />} />
              <Route path="/volunteer" element={<Volunteer />} />
              <Route path="/internship" element={<Internship />} />
              <Route path="/donate" element={<Donate />} />
              <Route path="/donate/success" element={<DonateSuccess />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/mrshahidbabu" element={<AdminDashboard />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsConditions />} />
              <Route path="/refund" element={<RefundPolicy />} />
              <Route path="/internship-status" element={<InternshipStatus />} />
              <Route path="/find-receipt" element={<InternshipStatus defaultTab="donation" />} />
              <Route path="/reprint-receipt" element={<InternshipStatus defaultTab="donation" />} />
              <Route path="/receipt" element={<InternshipStatus defaultTab="donation" />} />
              {/* Fallback to home */}
              <Route path="*" element={<HomeAlternative />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Global structured footer — hidden on admin panel */}
      {!isAdminRoute && <Footer />}

      {/* Direct quick connect Floating WhatsApp CTA — hidden on admin panel */}
      {!isAdminRoute && <FloatingWhatsApp />}

      {/* Browser push notifications subscriber prompt — hidden on admin panel */}
      {!isAdminRoute && <NotificationPrompt />}

      {/* Landing popup modal — hidden on admin panel */}
      {!isAdminRoute && <VolunteerInternPopup />}
    </>
  );
};


const App: React.FC = () => {
  return (
    <Router>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          justifyContent: "space-between"
        }}
      >
        <AppContent />
      </div>
    </Router>
  );
};

export default App;
