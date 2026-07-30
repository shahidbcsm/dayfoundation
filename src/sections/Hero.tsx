import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Award, Calendar, CheckCircle } from "lucide-react";

/* Count-up Stat Item */
const HeroStatItem: React.FC<{ value: number; suffix?: string; label: string }> = ({ value, suffix = "+", label }) => {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1500;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [value]);

  return (
    <div style={{ textAlign: "center", flex: 1, padding: "0 0.5rem" }}>
      <div style={{
        fontSize: "clamp(1.5rem, 3vw, 2.1rem)",
        fontWeight: 900,
        color: "#405A6F",
        fontFamily: "'Neue Montreal', 'Plus Jakarta Sans', sans-serif",
        lineHeight: 1.1
      }}>
        {count.toLocaleString()}
        <span style={{ fontFamily: "Inter, sans-serif" }}>{suffix}</span>
      </div>
      <div style={{
        fontSize: "0.77rem",
        fontWeight: 600,
        color: "#68696B",
        fontFamily: "'Garet', 'Outfit', 'Inter', sans-serif",
        opacity: 0.9,
        marginTop: "0.25rem",
        whiteSpace: "nowrap"
      }}>
        {label}
      </div>
    </div>
  );
};

export const Hero: React.FC = () => {
  return (
    <div style={{ backgroundColor: "#FFFBF5", minHeight: "100vh", paddingTop: "80px" }}>

      {/* ══ HERO SECTION ══ */}
      <section style={{ backgroundColor: "#FFFBF5", padding: "3.5rem 0 2.5rem" }}>
        <div className="container-custom">
          <div className="hero-grid" style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "3.5rem",
            alignItems: "center",
          }}>

            {/* ─── LEFT: Text ─── */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
            >
              {/* Soft Pink Pill Badge */}
              <div style={{
                display: "inline-block",
                backgroundColor: "#F5C4D1",
                color: "#68696B",
                fontFamily: "'Garet', 'Outfit', 'Inter', sans-serif",
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "0.38rem 1.1rem",
                borderRadius: "9999px",
                marginBottom: "1.4rem"
              }}>
                OUR LEGACY
              </div>

              {/* Editorial Serif Heading */}
              <h1 className="heading" style={{
                fontFamily: "'Recoleta', serif",
                fontSize: "clamp(2.5rem, 5vw, 64px)",
                lineHeight: 1.1,
                color: "#343537",
                marginBottom: "1.4rem",
                textAlign: "left",
              }}>
                <div className="regular" style={{ fontWeight: 400, color: "#343537" }}>Empowering</div>
                <div className="bold" style={{ fontWeight: 700, color: "#343537" }}>communities,</div>
                <div className="regular" style={{ fontWeight: 400, color: "#343537" }}>inspiring changes</div>
              </h1>

              {/* Body text */}
              <p style={{
                fontFamily: "'Garet', 'Inter', sans-serif",
                fontSize: "0.9rem",
                lineHeight: 1.75,
                color: "#343537",
                marginBottom: "0.6rem",
                maxWidth: "430px"
              }}>
                Founded on <strong style={{ color: "#343537" }}>12th April 2022</strong>, DAY Foundation is a
                youth-led organization dedicated to empowering underserved communities through
                Education, Aid, Youth, and Care. Active across multiple cities in India.
              </p>

              <p style={{ fontSize: "0.86rem", color: "#68696B", fontFamily: "'Garet', 'Inter', sans-serif", marginBottom: "0.3rem" }}>
                Guided by our motto
              </p>
              <p className="motto" style={{
                fontFamily: "'Anek Devanagari', sans-serif",
                fontSize: "clamp(1.4rem, 2.5vw, 34px)",
                fontWeight: 700,
                color: "#D9854E",
                lineHeight: 1.2,
                margin: 0,
                marginBottom: "2rem"
              }}>
                "शिक्षा से सशक्तिकरण, युवा से समर्थन"
              </p>

              {/* CTA Buttons */}
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <Link
                  to="/volunteer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "0.68rem 1.5rem",
                    borderRadius: "9999px",
                    backgroundColor: "#DCFBA6",
                    color: "#68696B",
                    fontFamily: "'Garet', 'Outfit', 'Inter', sans-serif",
                    fontSize: "0.88rem",
                    fontWeight: 700,
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                    letterSpacing: "0.01em"
                  }}
                >
                  Join Our Mission
                </Link>

                <Link
                  to="/donate"
                  className="btn-donate"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "0.68rem 1.5rem",
                    borderRadius: "9999px",
                    backgroundColor: "#DCFBA6",
                    color: "#68696B",
                    fontFamily: "'Garet', 'Outfit', 'Inter', sans-serif",
                    fontSize: "0.88rem",
                    fontWeight: 700,
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                    letterSpacing: "0.01em"
                  }}
                >
                  Donate Now
                </Link>
              </div>
            </motion.div>

            {/* ─── RIGHT: Sliding Image Gallery ─── */}
            <HeroGalleryColumn />
          </div>
        </div>
      </section>

      {/* ══ STATS BAR ══ */}
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.45 }}
        style={{ backgroundColor: "var(--color-bg-white, #FFFBF5)", padding: "1rem 0 2.5rem" }}
      >
        <div className="container-custom">

          {/* Stats Pill */}
          <div style={{
            backgroundColor: "#D6E8F7",
            color: "#405A6F",
            borderRadius: "9999px",
            padding: "1.15rem 2.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            border: "1px solid rgba(64, 90, 111, 0.15)",
            boxShadow: "0 6px 24px rgba(64, 90, 111, 0.08)",
            maxWidth: "820px",
            margin: "0 auto"
          }}>
            <HeroStatItem value={320} suffix="+" label="Active Volunteers" />
            <div style={{ width: "1.5px", height: "42px", backgroundColor: "rgba(64, 90, 111, 0.2)" }} />
            <HeroStatItem value={1200} suffix="+" label="Interns Trained" />
            <div style={{ width: "1.5px", height: "42px", backgroundColor: "rgba(64, 90, 111, 0.2)" }} />
            <HeroStatItem value={800} suffix="+" label="Certificates Issued" />
            <div style={{ width: "1.5px", height: "42px", backgroundColor: "rgba(64, 90, 111, 0.2)" }} />
            <HeroStatItem value={3} suffix="" label="Active Cities" />

            {/* Bee mascot */}
            <div style={{
              position: "absolute",
              right: "-30px",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "2.2rem",
              animation: "hoverBeeHero 2s ease-in-out infinite"
            }}>
              🐝
            </div>
          </div>

          {/* Credentials */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "0.8rem",
            fontSize: "0.76rem",
            color: "#68696B",
            marginTop: "0.9rem",
            letterSpacing: "0.02em",
            fontWeight: 600
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <ShieldCheck size={14} style={{ color: "#D9854E" }} />
              <span>Section 8 Registered Entity</span>
            </div>
            <span style={{ color: "#DBCBB5" }}>|</span>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Award size={14} style={{ color: "#D9854E" }} />
              <span>NITI Aayog Darpan Verified</span>
            </div>
            <span style={{ color: "#DBCBB5" }}>|</span>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Calendar size={14} style={{ color: "#D9854E" }} />
              <span>Established April 2022</span>
            </div>
            <span style={{ color: "#DBCBB5" }}>|</span>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <CheckCircle size={14} style={{ color: "#D9854E" }} />
              <span>80G Tax Exemption</span>
            </div>
          </div>
        </div>
      </motion.section>

      <style>{`
        @keyframes hoverBeeHero {
          0%   { transform: translateY(-50%); }
          50%  { transform: translateY(calc(-50% - 8px)); }
          100% { transform: translateY(-50%); }
        }
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
};

/* ─── Hero Slideshow Column ─── */
import { subscribeGallery } from "../firebase/services";
import { AnimatePresence } from "framer-motion";

const FALLBACK_HERO_IMAGES = [
  "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=900", // children studying
  "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=900", // books
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=900", // teacher classroom
  "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=900", // reading
  "https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?auto=format&fit=crop&q=80&w=900"  // happy child smiling
];

const HeroGalleryColumn: React.FC = () => {
  const [images, setImages] = React.useState<string[]>(FALLBACK_HERO_IMAGES);
  const [currentIndex, setCurrentIndex] = React.useState<number>(0);

  React.useEffect(() => {
    const unsub = subscribeGallery((items) => {
      const activeUrls = items
        .filter(item => !item.hidden && !item.deleted && item.imageUrl)
        .map(item => item.imageUrl);
      if (activeUrls.length > 0) {
        setImages(activeUrls);
      }
    });
    return () => unsub();
  }, []);

  React.useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.65, delay: 0.2, ease: "easeOut" }}
      style={{ position: "relative" }}
    >
      <div style={{
        borderRadius: "22px",
        overflow: "hidden",
        aspectRatio: "4/3",
        position: "relative",
        boxShadow: "0 20px 60px rgba(58, 107, 42, 0.15), 0 6px 20px rgba(0,0,0,0.06)",
        background: "var(--color-bg-sand)"
      }}>
        {/* Slideshow Image Transition */}
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt="DAY Foundation Gallery Photo"
            initial={{ opacity: 0, scale: 1.04, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.98, filter: "blur(2px)" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              position: "absolute",
              top: 0, left: 0
            }}
          />
        </AnimatePresence>

        {/* DAY Logo — Top Right Corner of Photo */}
        <div style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          width: "64px",
          height: "64px",
          aspectRatio: "1 / 1",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12)",
          padding: "0",
          overflow: "hidden",
          zIndex: 10
        }}>
          <img
            src="/logo.png"
            alt="DAY Foundation Logo"
            style={{ width: "100%", height: "100%", aspectRatio: "1 / 1", borderRadius: "50%", objectFit: "contain" }}
          />
        </div>

        {/* Warm star decoration */}
        <div style={{
          position: "absolute",
          bottom: "16px",
          right: "16px",
          fontSize: "1.5rem",
          filter: "drop-shadow(0 2px 6px rgba(58, 107, 42, 0.20))",
          zIndex: 10
        }}>
          ⭐
        </div>

        {/* Dynamic Slide indicators */}
        <div style={{
          position: "absolute",
          bottom: "16px",
          left: "16px",
          display: "flex",
          gap: "6px",
          zIndex: 10
        }}>
          {images.map((_, idx) => (
            <div
              key={idx}
              style={{
                width: idx === currentIndex ? "16px" : "6px",
                height: "6px",
                borderRadius: "3px",
                backgroundColor: idx === currentIndex ? "var(--color-primary)" : "rgba(255,255,255,0.6)",
                transition: "all 0.3s ease"
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};
