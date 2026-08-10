import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { subscribeEvents, subscribeFlagshipCampaigns } from "../firebase/services";
import type { Event, FlagshipCampaign } from "../data/mockData";
import { defaultFlagshipCampaigns } from "../data/mockData";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, MapPin, AlertCircle } from "lucide-react";
import { CardSkeleton } from "../components/Skeleton";
import "../styles/pages.css";

export const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [flagshipList, setFlagshipList] = useState<FlagshipCampaign[]>(defaultFlagshipCampaigns);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>("upcoming");

  useEffect(() => {
    const unsubEvents = subscribeEvents((data) => {
      setEvents(data);
      setLoading(false);
    });
    const unsubFlagship = subscribeFlagshipCampaigns((data) => {
      setFlagshipList(data);
    });
    return () => {
      unsubEvents();
      unsubFlagship();
    };
  }, []);

  const filteredEvents = events.filter(e => e.status === activeTab);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{ minHeight: "100vh", backgroundColor: "var(--color-bg-gray)" }}
    >
      {/* Page Hero */}
      <section className="subpage-hero">
        <div className="container-custom">
          <span className="badge-custom">Initiative Calendars</span>
          <h1 className="subpage-hero-title">Events &amp; Welfare Deployments</h1>
          <p className="subpage-hero-desc" style={{ maxWidth: "950px" }}>
            Explore our flagship annual campaigns or stay updated on scheduled deployments and past social drives.
          </p>
        </div>
      </section>

      {/* Flagship Events Section */}
      <section className="section-padding" style={{ backgroundColor: "var(--color-bg-white)" }}>
        <div className="container-custom">
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <span className="badge-custom">Year-Round Initiatives</span>
            <h2 className="section-title">Our Flagship Events &amp; Campaigns</h2>
            <p className="section-subtitle" style={{ maxWidth: "750px", marginInline: "auto" }}>
              At DAY Foundation, we organize year-round events and campaigns that promote education, healthcare, community engagement, inclusion, and youth empowerment. Each initiative is designed to create meaningful experiences and lasting social impact.
            </p>
          </div>

          <div className="grid-cols-responsive">
            {flagshipList.filter(camp => !camp.hidden).map((camp, idx) => (
              <motion.div
                key={camp.id || camp.title}
                className="blog-card"
                style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  justifyContent: "space-between",
                  borderTop: `4px solid ${camp.color || 'var(--color-primary)'}`
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: (idx % 3) * 0.08 }}
              >
                <div className="blog-card-image" style={{ height: "190px", position: "relative" }}>
                  <img 
                    src={camp.image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800'} 
                    alt={camp.title}
                    onError={(ev) => { (ev.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800'; }}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />

                </div>

                <div className="blog-card-content" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <h3 className="blog-card-title" style={{ fontSize: "1.15rem", fontWeight: "800", color: camp.color || "var(--color-primary)", marginBottom: "8px" }}>
                      {camp.title}
                    </h3>
                    <p className="blog-card-summary" style={{ fontSize: "0.86rem", lineHeight: "1.6", color: "var(--color-text-muted)", margin: 0 }}>
                      {camp.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Active Deployments Tracker Board */}
      <section className="section-padding" style={{ borderTop: "1px solid var(--color-border-light)" }}>
        <div className="container-custom">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span className="badge-custom">DEPLOYMENT SCHEDULE</span>
            <h2 className="section-title">Welfare Deployments Log</h2>
            <p className="section-subtitle">Stay updated on active physical campaigns or review our completed welfare drives across cities.</p>
          </div>

          {/* Tab Selector Buttons */}
          <div className="gallery-filters" style={{ marginBottom: "2.5rem" }}>
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`filter-btn ${activeTab === "upcoming" ? "active" : ""}`}
              style={{ paddingInline: "2rem" }}
            >
              Upcoming Initiatives
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`filter-btn ${activeTab === "past" ? "active" : ""}`}
              style={{ paddingInline: "2rem" }}
            >
              Past Welfare Campaigns
            </button>
          </div>

          {loading ? (
            <div className="grid-cols-responsive">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {filteredEvents.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ textAlign: "center", padding: "4rem 0", color: "var(--color-text-muted)" }}
                >
                  <AlertCircle size={36} style={{ color: "var(--color-text-light)", marginBottom: "1rem", marginInline: "auto" }} />
                  <p style={{ fontSize: "1.125rem", fontWeight: 700 }}>
                    No {activeTab} campaigns found. Check back soon!
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid-cols-responsive"
                >
                  {filteredEvents.map((item, idx) => (
                    <motion.article
                      key={item.id}
                      className="blog-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.08 }}
                    >
                      <div className="blog-card-image" style={{ height: "200px", position: "relative" }}>
                        <img
                          src={item.coverImage || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800'}
                          alt={item.title}
                          onError={(ev) => { (ev.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800'; }}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <span
                          className="blog-card-category"
                          style={{
                            position: "absolute",
                            top: "12px",
                            left: "12px",
                            backgroundColor: "rgba(255, 255, 255, 0.92)",
                            backdropFilter: "blur(6px)",
                            padding: "4px 12px",
                            borderRadius: "9999px",
                            fontSize: "0.72rem",
                            fontWeight: 800,
                            color: "var(--color-secondary)",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.12)"
                          }}
                        >
                          {item.category || "Event"}
                        </span>
                      </div>
                      <div className="blog-card-content" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", fontSize: "0.78rem", color: "var(--color-text-muted)", marginBottom: "8px" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <Calendar size={13} className="text-secondary" /> {item.date}
                            </span>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <MapPin size={13} className="text-secondary" /> {item.location}
                            </span>
                          </div>

                          <h3 className="blog-card-title" style={{ fontSize: "1.15rem", fontWeight: "800", color: "var(--color-primary)", marginBottom: "8px", lineHeight: "1.3" }}>
                            {item.title}
                          </h3>

                          <p className="blog-card-summary" style={{ fontSize: "0.85rem", lineHeight: "1.6", color: "var(--color-text-muted)", marginBottom: "1.25rem" }}>
                            {item.description}
                          </p>
                        </div>

                        <div style={{ borderTop: "1px solid var(--color-border-light)", paddingTop: "1rem", marginTop: "auto" }}>
                          {activeTab === "upcoming" ? (
                            <Link
                              to="/volunteer"
                              className="btn btn-primary"
                              style={{ width: "100%", justifyContent: "center", padding: "0.6rem 1rem", fontSize: "0.85rem" }}
                            >
                              Register to Join
                            </Link>
                          ) : (
                            <Link
                              to="/gallery"
                              className="btn btn-outline"
                              style={{ width: "100%", justifyContent: "center", padding: "0.6rem 1rem", fontSize: "0.85rem" }}
                            >
                              View Drive Photos
                            </Link>
                          )}
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}

        </div>
      </section>
    </motion.div>
  );
};

export default Events;
