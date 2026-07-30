import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Users,
  MessageSquare,
  Scale,
  Shield,
  Telescope,
  UserPlus,
  Briefcase,
  Mail,
  Phone,
  ExternalLink,
  Star,
  Heart,
  Zap,
  Globe,
  BookOpen,
  Award,
  Flag,
  Building,
  ShieldCheck,
  Trophy,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock
} from "lucide-react";
import "../styles/pages.css";
import { subscribeTeam, subscribeCityMembers } from "../firebase/services";
import type { TeamMember, CityMember } from "../data/mockData";

const InstagramIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <circle cx="17.5" cy="6.5" r="1.5" />
  </svg>
);

interface SectionTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

interface Milestone {
  step: string;
  year: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  tag: string;
  location: string;
  highlights: string[];
}

export const About: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>("management");
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [cityMembers, setCityMembers] = useState<CityMember[]>([]);
  const [activeMilestone, setActiveMilestone] = useState<number>(0);

  useEffect(() => {
    const unsub = subscribeTeam((data) => {
      setTeam(data);
    });
    const unsubCity = subscribeCityMembers((data) => {
      setCityMembers(data);
    });
    return () => {
      unsub();
      unsubCity();
    };
  }, []);

  const sections: SectionTab[] = [
    { id: "management", label: "Management Structure", icon: <Users size={20} />, color: "#1e6b5e" },
    { id: "resources", label: "Resources & Communication", icon: <MessageSquare size={20} />, color: "#3b6e9e" },
    { id: "legal", label: "Legal Unit", icon: <Shield size={20} />, color: "#9e3b4c" },
    { id: "vision", label: "Our Future Vision", icon: <Telescope size={20} />, color: "#c47c1a" },
    { id: "hiring", label: "Management Hiring", icon: <UserPlus size={20} />, color: "#1a7a8a" },
    { id: "working", label: "Working Model", icon: <Briefcase size={20} />, color: "#4a7a1a" },
  ];

  const milestones: Milestone[] = [
    {
      step: "STEP 01",
      year: "12 April 2022",
      title: "DAY Foundation Founded",
      desc: "Our journey began with a clear mission to channel youth energy into community development, grassroots welfare, and primary education.",
      icon: <Flag size={26} />,
      tag: "FOUNDATION",
      location: "Jabalpur, MP",
      highlights: ["Youth Energy Mobilization", "Slum Community Baseline Survey", "Core Founding Volunteer Team"]
    },
    {
      step: "STEP 02",
      year: "May 2022",
      title: "Operations in Jabalpur",
      desc: "Began on-ground implementations starting with local slum school learning circles, health drives, and weekend teaching sessions.",
      icon: <BookOpen size={26} />,
      tag: "FIELD DEPLOYMENT",
      location: "Jabalpur Slum Clusters",
      highlights: ["1st Slum School Circle", "Free Educational Kit Distribution", "Weekend Teaching Modules"]
    },
    {
      step: "STEP 03",
      year: "13 October 2023",
      title: "Section 8 Incorporation",
      desc: "Incorporated officially as a Section 8 non-profit company under the Ministry of Corporate Affairs (MCA) & registered on NITI Aayog Darpan.",
      icon: <ShieldCheck size={26} />,
      tag: "LEGAL STANDING",
      location: "National Level",
      highlights: ["MCA Non-Profit Charter", "NITI Aayog Darpan Verified", "Formal Governance Structure"]
    },
    {
      step: "STEP 04",
      year: "April 2024",
      title: "Expansion to Indore",
      desc: "Launched our second city chapter, mobilizing student volunteers and establishing university internship hubs across Indore.",
      icon: <Globe size={26} />,
      tag: "CHAPTER EXPANSION",
      location: "Indore Chapter",
      highlights: ["2nd City Chapter Active", "University Volunteer Drive", "Indore Slum Learning Centers"]
    },
    {
      step: "STEP 05",
      year: "September 2024",
      title: "Launch in Delhi NCR",
      desc: "Expanded our operations to the national capital region, launching youth leadership modules and corporate partnership channels.",
      icon: <Building size={26} />,
      tag: "METRO HUB",
      location: "Delhi NCR Chapter",
      highlights: ["Metro Chapter Operational", "Student Ambassador Program", "National Capital Outreach"]
    },
    {
      step: "STEP 06",
      year: "April 2025",
      title: "DAY Utsav Celebration",
      desc: "Celebrated DAY Utsav, marking four years of grassroots social impact, over 1,200+ trained student interns and 3 active cities.",
      icon: <Trophy size={26} />,
      tag: "ANNIVERSARY",
      location: "All 3 Active Cities",
      highlights: ["4 Years of Grassroots Impact", "1,200+ Interns Certified", "3 Active City Networks"]
    },
    {
      step: "STEP 07",
      year: "Next Chapter",
      title: "Support Our Next Achievement",
      desc: "Help us expand our reach to more underserved communities. Support our next milestone by donating to empower our grassroots programs, or join us as a volunteer or intern to drive on-ground impact.",
      icon: <Heart size={26} />,
      tag: "CALL TO ACTION",
      location: "Nationwide Growth",
      highlights: ["Donate to Empower Communities", "Join as a Volunteer or Intern", "Fuel Next Milestone Growth"]
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{ minHeight: "100vh", backgroundColor: "var(--color-bg-gray)" }}
    >
      {/* Subpage Header Banner */}
      <section className="subpage-hero">
        <div className="container-custom">
          <span className="badge-custom">About Us</span>
          <h1 className="subpage-hero-title">Our Story of Compassion</h1>
          <p className="subpage-hero-desc">
            Learn about the origins of BHTDAY Welfare Foundation, our registered credentials, and the journey of youth-driven community welfare.
          </p>
        </div>
      </section>

      {/* Origin Details */}
      <section className="section-padding" style={{ backgroundColor: "var(--color-bg-white)" }}>
        <div className="container-custom">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "3rem", alignItems: "center" }}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img 
                src="/assets/gallery/gallery-008.jpg" 
                alt="DAY Foundation community gathering" 
                style={{ borderRadius: "24px", boxShadow: "var(--shadow-lg)", width: "100%", height: "400px", objectFit: "cover" }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "2.25rem", color: "var(--color-primary)", marginBottom: "1.5rem" }}>
                How It All Began
              </h2>
              <p style={{ color: "var(--color-text-muted)", lineHeight: "1.7", marginBottom: "1rem" }}>
                Founded on <strong>12th April 2022</strong>, DAY Foundation (BHTDAY Welfare Foundation) began with a clear, radical goal: to bridge critical gaps in primary education, healthcare diagnostics, and employment options by transforming youth energy into standard social work.
              </p>
              <p style={{ color: "var(--color-text-muted)", lineHeight: "1.7", marginBottom: "1.5rem" }}>
                Under our motto <strong>“शिक्षा से सशक्तिकरण, युवा से समर्थन”</strong>, we established local chapters where student interns manage on-ground crowdfunding, welfare distributions, and micro-business workshops, helping underprivileged clusters build self-reliance.
              </p>
              <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
                <div>
                  <h4 style={{ fontSize: "1.5rem", color: "var(--color-secondary)", fontWeight: 800 }}>1,200+</h4>
                  <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>Interns Trained</p>
                </div>
                <div>
                  <h4 style={{ fontSize: "1.5rem", color: "var(--color-secondary)", fontWeight: 800 }}>3 Cities</h4>
                  <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>Delhi, Indore, Jabalpur</p>
                </div>
                <div>
                  <h4 style={{ fontSize: "1.5rem", color: "var(--color-secondary)", fontWeight: 800 }}>800+</h4>
                  <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>Certificates Issued</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ INTERACTIVE MILESTONE TIMELINE SHOWCASE SECTION ══ */}
      <section className="milestone-nexus-section" style={{ position: "relative", overflow: "hidden", padding: "5rem 0 6rem", backgroundColor: "var(--color-bg-cream)" }}>
        
        {/* Background Decorative Ambient Glow Orbs */}
        <div className="nexus-bg-glow glow-1"></div>
        <div className="nexus-bg-glow glow-2"></div>

        <div className="container-custom" style={{ position: "relative", zIndex: 5 }}>
          
          {/* Section Header */}
          <div style={{ textAlign: "center", maxWidth: "720px", margin: "0 auto 3rem auto" }}>
            <span className="badge-custom">
              <Sparkles size={14} style={{ color: "var(--color-secondary)", marginRight: "6px" }} />
              OUR EVOLUTIONARY JOURNEY
            </span>
            <h2 className="section-title" style={{ marginTop: "0.75rem" }}>
              Milestones of <span className="text-gradient-nexus">Impact</span>
            </h2>
            <p className="section-subtitle">
              Explore how our operations evolved from a single grassroots classroom into a multi-city Section 8 non-profit platform.
            </p>
          </div>

          {/* ── Top Interactive Step Navigator & Progress Bar ── */}
          <div className="nexus-nav-bar">
            <button 
              className="nexus-nav-arrow" 
              onClick={() => setActiveMilestone(prev => Math.max(0, prev - 1))}
              disabled={activeMilestone === 0}
              aria-label="Previous Milestone"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="nexus-nav-track">
              {/* Fill progress line */}
              <div 
                className="nexus-nav-progress-fill" 
                style={{ width: `${(activeMilestone / (milestones.length - 1)) * 100}%` }}
              ></div>

              {milestones.map((ms, idx) => {
                const isActive = idx === activeMilestone;
                const isPassed = idx <= activeMilestone;

                return (
                  <button
                    key={idx}
                    className={`nexus-nav-node ${isActive ? 'active' : ''} ${isPassed ? 'passed' : ''}`}
                    onClick={() => setActiveMilestone(idx)}
                  >
                    <div className="nexus-nav-node-dot">
                      {isPassed ? <CheckCircle2 size={12} /> : <span>{idx + 1}</span>}
                    </div>
                    <div className="nexus-nav-node-label-wrap">
                      <span className="nexus-nav-node-step">{ms.step}</span>
                      <span className="nexus-nav-node-year">{ms.year.split(' ').pop()}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <button 
              className="nexus-nav-arrow" 
              onClick={() => setActiveMilestone(prev => Math.min(milestones.length - 1, prev + 1))}
              disabled={activeMilestone === milestones.length - 1}
              aria-label="Next Milestone"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* ── Main Showcase Area: Left Spotlight Card + Right Node Stack ── */}
          <div className="nexus-grid">
            
            {/* ── LEFT: Animated Milestone Spotlight Showcase ── */}
            <div className="nexus-spotlight-col">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeMilestone}
                  initial={{ opacity: 0, x: -30, scale: 0.98 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 30, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="nexus-spotlight-card"
                >
                  {/* Top Tag & Index */}
                  <div className="nexus-spotlight-top">
                    <span className="nexus-spotlight-tag">{milestones[activeMilestone].tag}</span>
                    <span className="nexus-spotlight-location">
                      <Globe size={13} /> {milestones[activeMilestone].location}
                    </span>
                    <span className="nexus-spotlight-index">
                      STEP {String(activeMilestone + 1).padStart(2, '0')} / {String(milestones.length).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Floating 3D Icon Badge */}
                  <div className="nexus-spotlight-hero">
                    <motion.div 
                      className="nexus-spotlight-icon-badge"
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                      {milestones[activeMilestone].icon}
                    </motion.div>
                    <div>
                      <span className="nexus-spotlight-date">
                        <Clock size={14} /> {milestones[activeMilestone].year}
                      </span>
                      <h3 className="nexus-spotlight-title">{milestones[activeMilestone].title}</h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="nexus-spotlight-desc">{milestones[activeMilestone].desc}</p>

                  {/* Key Achievement Highlights */}
                  <div className="nexus-spotlight-highlights">
                    <span className="nexus-highlights-heading">KEY ACHIEVEMENTS &amp; IMPACT</span>
                    <div className="nexus-highlights-list">
                      {milestones[activeMilestone].highlights.map((item, hIdx) => (
                        <div key={hIdx} className="nexus-highlight-pill">
                          <CheckCircle2 size={15} className="nexus-highlight-check" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card Footer Navigation Controller */}
                  <div className="nexus-spotlight-footer">
                    <div className="nexus-footer-steps">
                      {milestones.map((_, dotIdx) => (
                        <span 
                          key={dotIdx} 
                          className={`nexus-footer-dot ${dotIdx === activeMilestone ? 'active' : ''}`}
                          onClick={() => setActiveMilestone(dotIdx)}
                        />
                      ))}
                    </div>

                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center", marginTop: "1rem" }}>
                      <Link to="/donate" className="nexus-spotlight-btn btn-donate" style={{ padding: "11px 24px", fontSize: "0.92rem" }}>
                        <span>Donate</span>
                        <ArrowRight size={16} />
                      </Link>
                      <Link to="/volunteer" className="nexus-spotlight-btn btn-donate" style={{ backgroundColor: "var(--color-primary)", borderColor: "var(--color-primary)", padding: "11px 24px", fontSize: "0.92rem" }}>
                        <span>Join Us</span>
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>

                </motion.div>
              </AnimatePresence>
            </div>

            {/* ── RIGHT: Interactive Floating 3D Card Stack ── */}
            <div className="nexus-stack-col">
              <div className="nexus-stack-list">
                {milestones.map((ms, idx) => {
                  const isActive = idx === activeMilestone;

                  return (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.02, x: 6 }}
                      className={`nexus-stack-item ${isActive ? 'active' : ''}`}
                      onClick={() => setActiveMilestone(idx)}
                    >
                      <div className="nexus-stack-item-icon">
                        {ms.icon}
                      </div>
                      <div className="nexus-stack-item-info">
                        <div className="nexus-stack-item-meta">
                          <span className="nexus-stack-item-step">{ms.step}</span>
                          <span className="nexus-stack-item-year">{ms.year}</span>
                        </div>
                        <h4 className="nexus-stack-item-title">{ms.title}</h4>
                      </div>
                      <div className="nexus-stack-item-indicator">
                        <div className="nexus-indicator-orb"></div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      </section>

      <section 
        className="section-padding founders-message-section" 
        style={{ 
          backgroundColor: "var(--color-bg-cream)", 
          borderTop: "1px solid var(--color-border-light)",
          paddingTop: "2.25rem",
          paddingBottom: "2.25rem",
          position: "relative",
          zIndex: 10
        }}
      >
        <div className="container-custom">
          
          <div className="founders-message-grid" style={{ alignItems: "flex-start" }}>
            
            {/* Left Column: Founder Photo Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="founder-photo-float founder-photo-card"
            >
              <div 
                style={{ 
                  borderRadius: "24px", 
                  overflow: "hidden", 
                  boxShadow: "var(--shadow-lg)", 
                  height: "380px", 
                  width: "100%",
                  border: "4px solid var(--color-bg-white)",
                  position: "relative"
                }}
              >
                <img 
                  src="/assets/teams/owner.jpeg" 
                  alt="Om Sen - Founder and Executive Director" 
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
                />
              </div>
              <div style={{ 
                backgroundColor: "var(--color-secondary)", 
                color: "#ffffff", 
                padding: "0.6rem 1.2rem", 
                borderRadius: "12px", 
                boxShadow: "var(--shadow-md)",
                display: "block",
                marginTop: "-25px",
                position: "relative",
                zIndex: 20,
                textAlign: "center"
              }}>
                <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "800", fontFamily: "var(--font-serif)" }}>Om Sen</h4>
                <p style={{ margin: 0, fontSize: "0.7rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.95 }}>Founder & Director</p>
              </div>
            </motion.div>

            {/* Right Column: Founder Message Heading + Text + Signature */}
            <div style={{ color: "var(--color-text-muted)", fontSize: "1.05rem", lineHeight: "1.8" }}>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "2.3rem", color: "var(--color-primary)", marginTop: "0", marginBottom: "1.25rem", textAlign: "left" }}>
                Founder's Message
              </h2>

              <p style={{ marginBottom: "1.25rem" }}>
                At DAY Foundation, we believe that every child deserves access to education, care, and opportunities, and that empowered youth can drive meaningful change in society. Built on the values of professionalism, accountability, and teamwork, our mission is to create lasting impact through collective action.
              </p>
              <p style={{ marginBottom: "1.25rem" }}>
                While I founded DAY Foundation, its true strength lies in the dedication of our volunteers, whose commitment has transformed a vision into a growing movement. Together, we are working to expand our efforts in education, healthcare, mental health, and employment support to build a brighter future for communities across India.
              </p>
              <p style={{ marginBottom: "1.25rem" }}>
                My hope is that DAY Foundation will always be known for its compassion, integrity, and commitment to empowering children and youth.
              </p>

              {/* Signature Block directly below paragraph */}
              <div style={{ marginTop: "1.5rem", textAlign: "left" }}>
                <p style={{ fontFamily: "'Caveat', cursive", fontSize: "2.4rem", color: "var(--color-secondary)", margin: 0, lineHeight: 1.1 }}>
                  Om Sen
                </p>
                <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", margin: "4px 0 0 0", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Founder &amp; Executive Director
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Leadership Team Grid */}
      <section className="section-padding" style={{ backgroundColor: "var(--color-bg-white)", borderTop: "1px solid var(--color-border-light)" }}>
        <div className="container-custom">
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <span className="badge-custom">Our Leadership</span>
            <h2 className="section-title">People Behind BHTDAY Welfare Foundation</h2>
            <p className="section-subtitle">
              Meet the founders, coordinators, and advisors driving our mission of youth-powered grassroots development.
            </p>
          </div>

          <div className="team-grid-layout">
            {team.map((member, idx) => (
              <motion.div
                key={idx}
                className="premium-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (idx % 5) * 0.07 }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  padding: "1.25rem 1rem",
                  backgroundColor: "var(--color-bg-white)",
                  border: "1px solid var(--color-border-light)",
                  boxShadow: "var(--shadow-sm)",
                  borderRadius: "16px"
                }}
              >
                {/* Circular Avatar with gradient border ring */}
                <div className="team-avatar-circular-wrap">
                  <div className="team-avatar-circular">
                    <img
                      src={member.image}
                      alt={member.name}
                    />
                  </div>
                </div>


                <h3 style={{ fontSize: "0.95rem", color: "var(--color-primary)", marginBottom: "0.2rem", fontWeight: 700, lineHeight: 1.2 }}>{member.name}</h3>
                <h4 style={{ fontSize: "0.7rem", color: "var(--color-secondary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.6rem" }}>
                  {member.role}
                </h4>
                <p style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", lineHeight: "1.5", marginBottom: "0.75rem", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {member.bio}
                </p>

                {/* Social Buttons */}
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto" }}>
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      backgroundColor: "var(--color-bg-cream)",
                      border: "1px solid var(--color-border-light)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-secondary)",
                      transition: "var(--transition-fast)"
                    }}
                    className="social-btn"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                  </a>
                  <a
                    href={`mailto:${member.email}`}
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      backgroundColor: "var(--color-bg-cream)",
                      border: "1px solid var(--color-border-light)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-secondary)",
                      transition: "var(--transition-fast)"
                    }}
                    className="social-btn"
                  >
                    <Mail size={13} />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Our Foundation & Governance section */}
      <section id="foundation" style={{ borderTop: "1px solid var(--color-border-light)", backgroundColor: "var(--color-bg-gray)" }}>
        {/* Section Header */}
        <div className="container-custom section-padding" style={{ paddingBottom: "2rem" }}>
          <div style={{ textAlign: "center" }}>
            <span className="badge-custom">GOVERNANCE & STRUCTURE</span>
            <h2 className="section-title">Our Foundation Overview</h2>
            <p className="section-subtitle">
              Detailed guidelines, structure, and procedures that govern BHTDAY Welfare Foundation's daily operations and future plans.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ backgroundColor: "var(--color-bg-white)", borderBottom: "1px solid var(--color-border-light)", borderTop: "1px solid var(--color-border-light)", position: "sticky", top: "70px", zIndex: 40, boxShadow: "var(--shadow-sm)" }}>
          <div className="container-custom" style={{ overflowX: "auto", paddingTop: "0.75rem", paddingBottom: "0.75rem" }}>
            <div style={{ display: "flex", gap: "0.5rem", minWidth: "max-content" }}>
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 18px",
                    borderRadius: "12px",
                    border: activeSection === s.id ? `2px solid ${s.color}` : "2px solid transparent",
                    backgroundColor: activeSection === s.id ? `${s.color}18` : "transparent",
                    color: activeSection === s.id ? s.color : "var(--color-text-muted)",
                    fontWeight: activeSection === s.id ? 700 : 500,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    whiteSpace: "nowrap"
                  }}
                >
                  {s.icon}
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="section-padding" style={{ backgroundColor: "var(--color-bg-gray)" }}>
          <div className="container-custom">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
              >
                {/* ── 1. MANAGEMENT STRUCTURE ── */}
                {activeSection === "management" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div style={{ width: "52px", height: "52px", borderRadius: "16px", backgroundColor: "#1e6b5e20", display: "flex", alignItems: "center", justifyContent: "center", color: "#1e6b5e" }}>
                        <Users size={26} />
                      </div>
                      <div>
                        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", color: "var(--color-primary)", margin: 0 }}>Management Structure</h2>
                        <p style={{ color: "var(--color-text-muted)", margin: 0 }}>Three-tier governance ensuring effective operations nationwide</p>
                      </div>
                    </div>

                    {/* Tier 1 - Board of Directors */}
                    <div className="premium-card" style={{ borderLeft: "4px solid #1e6b5e" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.25rem" }}>
                        <span style={{ backgroundColor: "#1e6b5e", color: "white", fontSize: "0.75rem", fontWeight: 800, padding: "4px 12px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Tier 1</span>
                        <h3 style={{ fontSize: "1.25rem", color: "var(--color-primary)", margin: 0 }}>Board of Directors</h3>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
                        <div style={{ backgroundColor: "var(--color-bg-cream)", borderRadius: "16px", padding: "1.25rem", borderLeft: "3px solid #1e6b5e" }}>
                          <p style={{ fontWeight: 800, color: "var(--color-text-dark)", margin: "0 0 4px 0" }}>Mr. Om Sen</p>
                          <p style={{ fontSize: "0.8rem", color: "#1e6b5e", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 8px 0" }}>Founder & Executive Director</p>
                          <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", margin: 0, lineHeight: "1.6" }}>Holds permanent and sole authority over governance, management, and all internal/external operations of BHTDAY Welfare Foundation.</p>
                        </div>
                        <div style={{ backgroundColor: "var(--color-bg-cream)", borderRadius: "16px", padding: "1.25rem", borderLeft: "3px solid var(--color-secondary)" }}>
                          <p style={{ fontWeight: 800, color: "var(--color-text-dark)", margin: "0 0 4px 0" }}>Mr. Shantanu Sen</p>
                          <p style={{ fontSize: "0.8rem", color: "var(--color-secondary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 8px 0" }}>Legally Registered Director</p>
                          <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", margin: 0, lineHeight: "1.6" }}>Co-registered Director under the Ministry of Corporate Affairs (MCA), Reg. No: U88900MP2023NPL068178.</p>
                        </div>
                      </div>
                    </div>

                    {/* Tier 2 - Central Management */}
                    <div className="premium-card" style={{ borderLeft: "4px solid #3b6e9e" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.25rem" }}>
                        <span style={{ backgroundColor: "#3b6e9e", color: "white", fontSize: "0.75rem", fontWeight: 800, padding: "4px 12px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Tier 2</span>
                        <h3 style={{ fontSize: "1.25rem", color: "var(--color-primary)", margin: 0 }}>Central Management</h3>
                      </div>
                      <p style={{ color: "var(--color-text-muted)", marginBottom: "1.25rem", fontSize: "0.9rem", lineHeight: "1.7" }}>
                        Core functional heads responsible for overseeing the internal operations of the NGO. Not legally registered under MCA, but governed by the internal bylaws and policies of the Foundation.
                      </p>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
                        {[
                          { name: "Niharika Vasvani", role: "Head of Human Resources", color: "#3b6e9e" },
                          { name: "Aditi Tiwari", role: "Head of Development and Program", color: "#1e6b5e" },
                          { name: "Khushali Takk", role: "Head of Finance and Hiring", color: "#2a7a4b" },
                          { name: "Radhika Umre", role: "Head Of Social Media", color: "#c47c1a" },
                          { name: "Shubhra Jain Garhawal", role: "Head of Legal and Communication", color: "#9e3b4c" },
                        ].map((m, i) => (
                          <div key={i} style={{ backgroundColor: "var(--color-bg-gray)", borderRadius: "12px", padding: "1rem", display: "flex", flexDirection: "column", gap: "4px" }}>
                            <p style={{ fontWeight: 700, color: "var(--color-text-dark)", margin: 0, fontSize: "0.95rem" }}>{m.name}</p>
                            <p style={{ fontSize: "0.78rem", color: m.color, fontWeight: 700, margin: 0 }}>{m.role}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tier 3 - City Management */}
                    <div className="premium-card" style={{ borderLeft: "4px solid #4a7a1a" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.25rem" }}>
                        <span style={{ backgroundColor: "#4a7a1a", color: "white", fontSize: "0.75rem", fontWeight: 800, padding: "4px 12px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Tier 3</span>
                        <h3 style={{ fontSize: "1.25rem", color: "var(--color-primary)", margin: 0 }}>City Management</h3>
                      </div>
                      <p style={{ color: "var(--color-text-muted)", marginBottom: "1.5rem", fontSize: "0.9rem", lineHeight: "1.7" }}>
                        City Management volunteers are appointed to oversee regional implementation across our active city chapters. They are directly answerable to the Board of Management.
                      </p>
                      <div className="team-grid-layout">
                        {cityMembers.filter(c => !c.hidden).map((c, idx) => (
                          <motion.div 
                            key={idx} 
                            className="premium-card"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: (idx % 5) * 0.07 }}
                            style={{ 
                              padding: "1.25rem 1rem", 
                              border: "1px solid var(--color-border-light)", 
                              boxShadow: "var(--shadow-sm)",
                              display: "flex", 
                              flexDirection: "column",
                              alignItems: "center",
                              textAlign: "center",
                              borderRadius: "16px",
                              backgroundColor: "var(--color-bg-white)"
                            }}
                          >
                            {/* Circular Avatar with gradient border ring */}
                            <div className="team-avatar-circular-wrap">
                              <div className="team-avatar-circular">
                                <img
                                  src={c.image || "/assets/teams/default.jpeg"}
                                  alt={c.name}
                                />
                              </div>
                            </div>

                            <h3 style={{ fontSize: "0.95rem", color: "var(--color-primary)", marginBottom: "0.2rem", fontWeight: 700, lineHeight: 1.2 }}>{c.name}</h3>
                            <h4 style={{ fontSize: "0.7rem", color: "var(--color-secondary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.4rem", lineHeight: "1.3" }}>
                              {c.role}
                            </h4>
                            {c.dayId && c.dayId !== "NA" && (
                              <p style={{ fontSize: "0.68rem", color: "var(--color-text-muted)", margin: "0 0 0.5rem 0", fontFamily: "monospace" }}>
                                ID: {c.dayId}
                              </p>
                            )}

                            {/* Social Buttons */}
                            <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto" }}>
                              {c.linkedin && (
                                <a
                                  href={c.linkedin}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    width: "28px",
                                    height: "28px",
                                    borderRadius: "50%",
                                    backgroundColor: "var(--color-bg-cream)",
                                    border: "1px solid var(--color-border-light)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "var(--color-secondary)",
                                    transition: "var(--transition-fast)"
                                  }}
                                  className="social-btn"
                                >
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                                </a>
                              )}
                              {c.email && (
                                <a
                                  href={`mailto:${c.email}`}
                                  style={{
                                    width: "28px",
                                    height: "28px",
                                    borderRadius: "50%",
                                    backgroundColor: "var(--color-bg-cream)",
                                    border: "1px solid var(--color-border-light)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "var(--color-secondary)",
                                    transition: "var(--transition-fast)"
                                  }}
                                  className="social-btn"
                                >
                                  <Mail size={13} />
                                </a>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── 3. RESOURCES & COMMUNICATION ── */}
                {activeSection === "resources" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div style={{ width: "52px", height: "52px", borderRadius: "16px", backgroundColor: "#3b6e9e20", display: "flex", alignItems: "center", justifyContent: "center", color: "#3b6e9e" }}>
                        <MessageSquare size={26} />
                      </div>
                      <div>
                        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", color: "var(--color-primary)", margin: 0 }}>Resources & Communication</h2>
                        <p style={{ color: "var(--color-text-muted)", margin: 0 }}>How we connect, share, and engage with our community</p>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="premium-card" style={{ borderLeft: "4px solid #3b6e9e" }}>
                      <h3 style={{ fontSize: "1.25rem", color: "var(--color-primary)", marginBottom: "1.25rem" }}>Official Contact Channels</h3>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
                        <a href="mailto:info@dayfoundation.in" style={{ display: "flex", alignItems: "center", gap: "12px", backgroundColor: "var(--color-bg-cream)", borderRadius: "12px", padding: "1rem 1.25rem", textDecoration: "none" }}>
                          <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#3b6e9e20", display: "flex", alignItems: "center", justifyContent: "center", color: "#3b6e9e", flexShrink: 0 }}>
                            <Mail size={20} />
                          </div>
                          <div>
                            <p style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-light)", margin: "0 0 2px 0" }}>Email</p>
                            <p style={{ fontWeight: 700, color: "var(--color-text-dark)", margin: 0, fontSize: "0.9rem" }}>info@dayfoundation.in</p>
                          </div>
                        </a>
                        <a href="tel:+918982144416" style={{ display: "flex", alignItems: "center", gap: "12px", backgroundColor: "var(--color-bg-cream)", borderRadius: "12px", padding: "1rem 1.25rem", textDecoration: "none" }}>
                          <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#2a7a4b20", display: "flex", alignItems: "center", justifyContent: "center", color: "#2a7a4b", flexShrink: 0 }}>
                            <Phone size={20} />
                          </div>
                          <div>
                            <p style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-light)", margin: "0 0 2px 0" }}>Phone / WhatsApp</p>
                            <p style={{ fontWeight: 700, color: "var(--color-text-dark)", margin: 0, fontSize: "0.9rem" }}>+91 89821 44416</p>
                          </div>
                        </a>
                      </div>
                    </div>

                    {/* Social Media Handles */}
                    <div className="premium-card">
                      <h3 style={{ fontSize: "1.25rem", color: "var(--color-primary)", marginBottom: "0.75rem" }}>Official Social Media Handles</h3>
                      <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", marginBottom: "1.25rem", lineHeight: "1.7" }}>
                        All social media handles operate under the name <strong>D.A.Y.</strong> (Development and Youth), which clearly specifies our registered name BHTDAY Welfare Foundation.
                      </p>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
                        {[
                          { platform: "Instagram", handle: "@dayfoundation_ngo", icon: <InstagramIcon size={20} />, color: "#E1306C", url: "https://www.instagram.com/dayfoundation_ngo" },
                          { platform: "LinkedIn", handle: "DAY Foundation", icon: <ExternalLink size={20} />, color: "#0077B5", url: "https://www.linkedin.com/company/day-foundation" },
                          { platform: "WhatsApp Channel", handle: "Join Channel", icon: <MessageSquare size={20} />, color: "#25D366", url: "https://www.whatsapp.com/channel/0029VaSrBkW4Y9lsGYcgPn0E" },
                          { platform: "Linktree", handle: "dayfoundation", icon: <ExternalLink size={20} />, color: "#39E09B", url: "https://linktr.ee/dayfoundation" },
                        ].map((s, i) => (
                          <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "12px", backgroundColor: `${s.color}10`, borderRadius: "12px", padding: "1rem 1.25rem", textDecoration: "none", border: `1px solid ${s.color}30`, transition: "all 0.2s" }}>
                            <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: `${s.color}20`, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>
                              {s.icon}
                            </div>
                            <div>
                              <p style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: s.color, margin: "0 0 2px 0" }}>{s.platform}</p>
                              <p style={{ fontWeight: 700, color: "var(--color-text-dark)", margin: 0, fontSize: "0.9rem" }}>{s.handle}</p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>

                    {/* Internal Communication & Resources */}
                    <div className="premium-card">
                      <h3 style={{ fontSize: "1.25rem", color: "var(--color-primary)", marginBottom: "1.25rem" }}>Internal Communication & Resources</h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {[
                          { tool: "WhatsApp Groups", use: "Real-time coordination between volunteer teams, department heads, and city chapters. Used for daily updates, task assignments, and emergency notices.", color: "#25D366" },
                          { tool: "Weekly Online Meetings", use: "Central and City Management are required to attend weekly online meetings scheduled by the ED or Board of Management.", color: "#3b6e9e" },
                          { tool: "Monthly Reports", use: "Central and City Management must submit a detailed monthly report by the end of each month, summarizing activities, challenges, and future plans.", color: "#c47c1a" },
                          { tool: "Digital Record Keeping", use: "All official records, volunteer data, financial reports, and communications are securely stored in digital format as per bylaws Part 11.", color: "#6b4c9e" },
                          { tool: "Exit Documentation", use: "On offboarding, all credentials and access are revoked. Volunteers must return all organizational materials and submit a handover report.", color: "#9e3b4c" },
                        ].map((item, i) => (
                          <div key={i} style={{ borderRadius: "12px", padding: "1rem 1.25rem", backgroundColor: "var(--color-bg-cream)", borderLeft: `3px solid ${item.color}` }}>
                            <p style={{ fontWeight: 700, color: "var(--color-text-dark)", margin: "0 0 4px 0", fontSize: "0.95rem" }}>{item.tool}</p>
                            <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", margin: 0, lineHeight: "1.6" }}>{item.use}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── 4. BYLAWS & COMPLIANCE ── */}
                {activeSection === "bylaws" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div style={{ width: "52px", height: "52px", borderRadius: "16px", backgroundColor: "#6b4c9e20", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b4c9e" }}>
                        <Scale size={26} />
                      </div>
                      <div>
                        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", color: "var(--color-primary)", margin: 0 }}>Bylaws & Compliance</h2>
                        <p style={{ color: "var(--color-text-muted)", margin: 0 }}>Our governing constitution — 19 parts covering every aspect of the Foundation</p>
                      </div>
                    </div>

                    {/* Registration Info */}
                    <div className="premium-card" style={{ background: "linear-gradient(135deg, rgba(107,76,158,0.06) 0%, rgba(30,107,94,0.06) 100%)", borderLeft: "4px solid #6b4c9e" }}>
                      <h3 style={{ fontSize: "1.1rem", color: "var(--color-primary)", marginBottom: "0.75rem" }}>Official Registration</h3>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                        {[
                          { label: "Company Type", value: "Section 8 Non-Profit" },
                          { label: "Reg. No.", value: "U88900MP2023NPL068178" },
                          { label: "Incorporated On", value: "13 October 2023" },
                          { label: "Registered Under", value: "Ministry of Corporate Affairs (MCA)" },
                          { label: "Also Registered", value: "NITI Aayog NGO-DARPAN Portal" },
                          { label: "Jurisdiction", value: "Jabalpur, Madhya Pradesh" },
                        ].map((item, i) => (
                          <div key={i} style={{ backgroundColor: "var(--color-bg-white)", borderRadius: "10px", padding: "0.85rem 1rem" }}>
                            <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-light)", margin: "0 0 3px 0" }}>{item.label}</p>
                            <p style={{ fontWeight: 700, color: "var(--color-text-dark)", margin: 0, fontSize: "0.9rem" }}>{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 19 Parts Overview */}
                    <div className="premium-card">
                      <h3 style={{ fontSize: "1.25rem", color: "var(--color-primary)", marginBottom: "0.5rem" }}>Constitution: 19-Part Bylaws Overview</h3>
                      <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", marginBottom: "1.25rem" }}>The complete governing document covers all aspects of operations, governance, and conduct.</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {[
                          "Part 1: Name and Purpose",
                          "Part 2: Membership",
                          "Part 3: Board of Directors & Management Governance",
                          "Part 4: Meetings Conduct & Procedures",
                          "Part 5: Organizational Committees & Departments",
                          "Part 6: Financial Management",
                          "Part 7: Amendments Process",
                          "Part 8: Dissolution",
                          "Part 9: Conflict of Interest",
                          "Part 10: Non-Discrimination Policy",
                          "Part 11: Record Keeping and Accessibility",
                          "Part 12: Legal Compliance",
                          "Part 13: Event Management",
                          "Part 14: Volunteer Engagement & Drive Management",
                          "Part 15: Volunteer Onboarding, Certification & Documentation",
                          "Part 16: Volunteer Etiquettes and Conduct",
                          "Part 17: Management Volunteer Etiquette",
                          "Part 18: Internship Bylaws",
                          "Part 19: Adoption of Bylaws & Signatories",
                        ].map((part, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0.7rem 1rem", borderRadius: "10px", backgroundColor: i % 2 === 0 ? "var(--color-bg-cream)" : "transparent" }}>
                            <span style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "#6b4c9e20", color: "#6b4c9e", fontWeight: 800, fontSize: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
                            <span style={{ fontSize: "0.88rem", color: "var(--color-text-dark)", fontWeight: 600 }}>{part}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTA to Bylaws page */}
                    <div className="premium-card" style={{ textAlign: "center", padding: "2.5rem" }}>
                      <Scale size={40} color="#6b4c9e" style={{ marginBottom: "1rem" }} />
                      <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", color: "var(--color-primary)", marginBottom: "0.75rem" }}>Read the Full Constitution</h3>
                      <p style={{ color: "var(--color-text-muted)", marginBottom: "1.5rem", maxWidth: "480px", marginInline: "auto", lineHeight: "1.7" }}>
                        Our complete, interactive 19-part bylaws document is available online. Explore every article, article by article.
                      </p>
                      <Link to="/bylaws" className="btn-custom btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
                        <BookOpen size={18} />
                        Explore Full Bylaws & Constitution
                      </Link>
                    </div>
                  </div>
                )}

                {/* ── 5. LEGAL UNIT ── */}
                {activeSection === "legal" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div style={{ width: "52px", height: "52px", borderRadius: "16px", backgroundColor: "#9e3b4c20", display: "flex", alignItems: "center", justifyContent: "center", color: "#9e3b4c" }}>
                        <Shield size={26} />
                      </div>
                      <div>
                        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", color: "var(--color-primary)", margin: 0 }}>Legal Unit</h2>
                        <p style={{ color: "var(--color-text-muted)", margin: 0 }}>BHTDAY Legal, Justice & Advocacy Unit — independent and impartial</p>
                      </div>
                    </div>

                    {/* Overview */}
                    <div className="premium-card" style={{ borderLeft: "4px solid #9e3b4c" }}>
                      <h3 style={{ fontSize: "1.25rem", color: "var(--color-primary)", marginBottom: "1rem" }}>BHTDAY Legal, Justice & Advocacy Unit</h3>
                      <p style={{ color: "var(--color-text-muted)", lineHeight: "1.75", marginBottom: "1rem" }}>
                        The Legal, Justice & Advocacy Unit is comprised of <strong>four major members</strong> positioned to promptly and impartially resolve differences and crises within the foundation. This unit guarantees <strong>strict confidentiality</strong> and <strong>impartial decision-making</strong>, and is free to take all decisions independently without the involvement of any other foundation members.
                      </p>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", backgroundColor: "#9e3b4c10", borderRadius: "12px", padding: "1.25rem" }}>
                        <Shield size={20} color="#9e3b4c" style={{ flexShrink: 0, marginTop: "2px" }} />
                        <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", margin: 0, lineHeight: "1.7" }}>
                          <strong>Current Head:</strong> Shubhra Jain Garhawal — Head of Legal & Advocacy. Directs legal compliance, NITI Aayog registrations, audits, and ensures all community campaigns align with Section 8 company regulations.
                        </p>
                      </div>
                    </div>

                    {/* Key Responsibilities */}
                    <div className="premium-card">
                      <h3 style={{ fontSize: "1.25rem", color: "var(--color-primary)", marginBottom: "1.25rem" }}>Key Responsibilities</h3>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
                        {[
                          { title: "Legal Compliance", desc: "Ensures full compliance with Section 8 of the Companies Act, MCA regulations, and NITI Aayog NGO-DARPAN requirements.", color: "#9e3b4c" },
                          { title: "Conflict Resolution", desc: "Impartially resolves internal disputes and crises within the foundation with strict confidentiality.", color: "#3b6e9e" },
                          { title: "Audit Oversight", desc: "Oversees financial audits and ensures all expenditure aligns with GAAP standards and legal restrictions.", color: "#2a7a4b" },
                          { title: "NDA Administration", desc: "Drafts and administers Non-Disclosure Agreements for all Central Management members and advisors.", color: "#c47c1a" },
                          { title: "Campaign Compliance", desc: "Reviews all community campaigns, donation drives, and CSR partnerships to ensure legal and ethical alignment.", color: "#6b4c9e" },
                          { title: "Advocacy & Rights", desc: "Advocates for the rights of volunteers, members, and beneficiary communities through proper legal channels.", color: "#1e6b5e" },
                        ].map((r, i) => (
                          <div key={i} style={{ borderRadius: "14px", padding: "1.25rem", backgroundColor: "var(--color-bg-cream)", borderTop: `3px solid ${r.color}` }}>
                            <h4 style={{ color: r.color, fontWeight: 700, margin: "0 0 8px 0", fontSize: "0.95rem" }}>{r.title}</h4>
                            <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", margin: 0, lineHeight: "1.6" }}>{r.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Legal Governance */}
                    <div className="premium-card" style={{ borderLeft: "4px solid #9e3b4c" }}>
                      <h3 style={{ fontSize: "1.1rem", color: "var(--color-primary)", marginBottom: "1rem" }}>Legal Governance Principles</h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {[
                          "Non-Discrimination: The foundation upholds equality, inclusion, and a zero-tolerance policy for discrimination and harassment.",
                          "Conflict of Interest: All members must disclose any conflicts of interest. Those with interests must recuse themselves from related decisions.",
                          "Political Neutrality: The foundation is politically neutral. No funds are used for political purposes.",
                          "Whistleblower Protection: Volunteers reporting misconduct are protected from retaliation and handled with confidentiality.",
                          "Dissolution Protocol: In case of dissolution, all assets are transferred to a legally registered charitable organization.",
                        ].map((principle, i) => (
                          <div key={i} style={{ display: "flex", gap: "12px", padding: "0.85rem 1rem", borderRadius: "10px", backgroundColor: "var(--color-bg-gray)" }}>
                            <Scale size={16} color="#9e3b4c" style={{ flexShrink: 0, marginTop: "2px" }} />
                            <p style={{ fontSize: "0.87rem", color: "var(--color-text-muted)", margin: 0, lineHeight: "1.6" }}>{principle}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── 6. FUTURE VISION ── */}
                {activeSection === "vision" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div style={{ width: "52px", height: "52px", borderRadius: "16px", backgroundColor: "#c47c1a20", display: "flex", alignItems: "center", justifyContent: "center", color: "#c47c1a" }}>
                        <Telescope size={26} />
                      </div>
                      <div>
                        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", color: "var(--color-primary)", margin: 0 }}>Our Future Vision — DAY Foundation</h2>
                        <p style={{ color: "var(--color-text-muted)", margin: 0 }}>Building an equitable, empowered India — one community at a time</p>
                      </div>
                    </div>

                    {/* Vision Statement */}
                    <div className="premium-card" style={{ background: "linear-gradient(135deg, rgba(196,124,26,0.08) 0%, rgba(30,107,94,0.08) 100%)", padding: "2.5rem", textAlign: "center" }}>
                      <Telescope size={40} color="#c47c1a" style={{ marginBottom: "1.25rem" }} />
                      <span className="badge-custom" style={{ marginBottom: "1rem", display: "inline-block" }}>Our Vision</span>
                      <blockquote style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", color: "var(--color-primary)", lineHeight: "1.7", margin: "0 auto", maxWidth: "750px", fontStyle: "italic" }}>
                        "To build an inclusive society where every individual, regardless of their background, has access to education, healthcare, and opportunities for growth, empowering them to lead dignified and self-sufficient lives."
                      </blockquote>
                      <p style={{ color: "var(--color-text-muted)", marginTop: "1.25rem", fontSize: "1rem", lineHeight: "1.7", maxWidth: "650px", marginInline: "auto" }}>
                        Through sustainable initiatives, youth engagement, and community-driven efforts, we aim to create a future marked by equality, care, and social impact.
                      </p>
                    </div>

                    {/* Mission Statement */}
                    <div className="premium-card" style={{ borderLeft: "4px solid var(--color-primary)" }}>
                      <span className="badge-custom" style={{ marginBottom: "0.75rem", display: "inline-block" }}>Our Mission</span>
                      <p style={{ color: "var(--color-text-muted)", lineHeight: "1.75", fontSize: "1.025rem" }}>
                        At the DAY Foundation, our mission is to build an inclusive society where every individual has access to <strong>Education, Aid, Youth, and Care</strong>. Since our inception, we have been dedicated to empowering youth, supporting underprivileged communities, and providing sustainable solutions through initiatives like Rojgar and child development programs.
                      </p>
                      <p style={{ color: "var(--color-text-muted)", lineHeight: "1.75", fontSize: "1.025rem", marginTop: "1rem" }}>
                        Our goal is to create a future where everyone has the opportunity to grow, lead a dignified life, and become self-reliant.
                      </p>
                    </div>

                    {/* Four Pillars */}
                    <div>
                      <h3 style={{ fontSize: "1.25rem", color: "var(--color-primary)", marginBottom: "1.25rem", textAlign: "center" }}>Our Four Pillars — E.A.Y.C.</h3>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
                        {[
                          { pillar: "Education", icon: <BookOpen size={28} />, color: "#1e6b5e", desc: "To provide quality education and resources to underprivileged children, empowering them to build a brighter future." },
                          { pillar: "Aid", icon: <Heart size={28} />, color: "#9e3b4c", desc: "To extend support to marginalized communities through healthcare, livelihood, and welfare programs." },
                          { pillar: "Youth", icon: <Zap size={28} />, color: "#c47c1a", desc: "To engage and uplift the youth by creating employment opportunities and fostering leadership through initiatives like DAY Rojgar." },
                          { pillar: "Care", icon: <Globe size={28} />, color: "#6b4c9e", desc: "To nurture a society that values empathy, equality, and inclusivity, ensuring every individual leads a dignified life." },
                        ].map((p, i) => (
                          <motion.div
                            key={i}
                            className="premium-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            style={{ textAlign: "center", padding: "2rem 1.5rem" }}
                          >
                            <div style={{ width: "64px", height: "64px", borderRadius: "20px", backgroundColor: `${p.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: p.color, marginInline: "auto", marginBottom: "1rem" }}>
                              {p.icon}
                            </div>
                            <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", color: p.color, marginBottom: "0.75rem" }}>{p.pillar}</h4>
                            <p style={{ fontSize: "0.87rem", color: "var(--color-text-muted)", lineHeight: "1.65", margin: 0 }}>{p.desc}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Upcoming Initiatives */}
                    <div className="premium-card" style={{ borderLeft: "4px solid #c47c1a" }}>
                      <h3 style={{ fontSize: "1.25rem", color: "var(--color-primary)", marginBottom: "1.25rem" }}>Upcoming & Future Initiatives</h3>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
                        {[
                          { name: "DAY Rojgar", desc: "Employment creation and skill development programs to tackle youth unemployment across our city chapters.", tag: "Employment" },
                          { name: "Higher Education Support", desc: "Mentoring underprivileged students through the higher education system with guidance, scholarships, and career counseling.", tag: "Education" },
                          { name: "Mental Health Initiative", desc: "Expanding Project Chetna to include regular mental health camps, counseling sessions, and awareness webinars.", tag: "Healthcare" },
                          { name: "National Expansion", desc: "Opening new city chapters beyond Delhi, Indore, and Jabalpur to amplify impact on a national scale.", tag: "Growth" },
                        ].map((item, i) => (
                          <div key={i} style={{ backgroundColor: "#c47c1a08", borderRadius: "14px", padding: "1.25rem", border: "1px solid #c47c1a20" }}>
                            <span style={{ backgroundColor: "#c47c1a20", color: "#c47c1a", fontSize: "0.72rem", fontWeight: 800, padding: "3px 10px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.tag}</span>
                            <h4 style={{ fontWeight: 700, color: "var(--color-text-dark)", margin: "0.75rem 0 0.5rem 0", fontSize: "1rem" }}>{item.name}</h4>
                            <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", margin: 0, lineHeight: "1.6" }}>{item.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Founder's Vision */}
                    <div className="premium-card" style={{ background: "linear-gradient(135deg, rgba(30,107,94,0.05) 0%, rgba(196,124,26,0.05) 100%)", padding: "2rem" }}>
                      <span className="badge-custom" style={{ marginBottom: "1rem", display: "inline-block" }}>Founder's Words</span>
                      <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", color: "var(--color-primary)", lineHeight: "1.8", fontStyle: "italic" }}>
                        "My dream is simple: when people hear the name DAY Foundation, they should think of an organization built on professionalism, compassion, and integrity — an organization where children find opportunities and youth discover purpose. Most importantly, I hope every volunteer feels that they are not just contributing to an NGO but helping build a movement that will create impact for generations to come."
                      </p>
                      <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.5rem", color: "var(--color-secondary)", marginTop: "1.25rem", marginBottom: "2px" }}>Om Sen</p>
                      <p style={{ fontSize: "0.8rem", color: "var(--color-text-light)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>Founder & Executive Director, DAY Foundation</p>
                    </div>
                  </div>
                )}

                {/* ── 7. MANAGEMENT HIRING ── */}
                {activeSection === "hiring" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div style={{ width: "52px", height: "52px", borderRadius: "16px", backgroundColor: "#1a7a8a20", display: "flex", alignItems: "center", justifyContent: "center", color: "#1a7a8a" }}>
                        <UserPlus size={26} />
                      </div>
                      <div>
                        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", color: "var(--color-primary)", margin: 0 }}>Management Hiring</h2>
                        <p style={{ color: "var(--color-text-muted)", margin: 0 }}>Our structured, merit-based hiring process for management positions</p>
                      </div>
                    </div>

                    {/* Hiring Philosophy */}
                    <div className="premium-card" style={{ borderLeft: "4px solid #1a7a8a" }}>
                      <h3 style={{ fontSize: "1.2rem", color: "var(--color-primary)", marginBottom: "0.75rem" }}>Our Hiring Philosophy</h3>
                      <p style={{ color: "var(--color-text-muted)", lineHeight: "1.75" }}>
                        Both Central and City Management positions must go through a <strong>structured hiring process</strong>, including an application form, interview, and final review/approval by the Executive Director and Board of Management. Final placement decisions rest solely with the Executive Director, while the Board of Management holds operational oversight of day-to-day activities.
                      </p>
                    </div>

                    {/* Process Steps */}
                    <div className="premium-card">
                      <h3 style={{ fontSize: "1.25rem", color: "var(--color-primary)", marginBottom: "1.5rem" }}>Hiring Process — Step by Step</h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                        {[
                          { step: "1", title: "Application Form", desc: "Candidates submit a structured application form detailing their background, skills, interest, and motivation for joining DAY Foundation.", color: "#1a7a8a" },
                          { step: "2", title: "Initial Screening", desc: "The Head of Human Resources reviews applications and shortlists candidates based on alignment with the role's requirements.", color: "#2a7a4b" },
                          { step: "3", title: "Interview Round", desc: "Shortlisted candidates attend an interview conducted by the Board of Management, assessing competency, commitment, and cultural fit.", color: "#c47c1a" },
                          { step: "4", title: "ED Approval", desc: "Final selections are reviewed and approved by the Executive Director (Om Sen). No appointment is confirmed without ED's consent.", color: "#6b4c9e" },
                          { step: "5", title: "Documentation Signing", desc: "Selected members sign a Tenure Letter, Non-Disclosure Agreement (NDA), and Acceptance of Bylaws before joining.", color: "#9e3b4c" },
                          { step: "6", title: "Onboarding", desc: "New management members undergo an orientation, receive access to internal tools, and are briefed by their departmental heads.", color: "#1e6b5e" },
                        ].map((step, i) => (
                          <div key={i} style={{ display: "flex", gap: "1.25rem", paddingBottom: i < 5 ? "1.5rem" : "0", position: "relative" }}>
                            {i < 5 && <div style={{ position: "absolute", left: "20px", top: "44px", width: "2px", height: "calc(100% - 28px)", backgroundColor: "var(--color-border-light)" }} />}
                            <div style={{ width: "42px", height: "42px", borderRadius: "50%", backgroundColor: step.color, color: "#ffffff", fontWeight: 800, fontSize: "1.05rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, zIndex: 1, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
                              {step.step}
                            </div>
                            <div style={{ flex: 1, paddingTop: "8px" }}>
                              <h4 style={{ fontWeight: 700, color: "var(--color-text-dark)", margin: "0 0 4px 0" }}>{step.title}</h4>
                              <p style={{ fontSize: "0.87rem", color: "var(--color-text-muted)", margin: 0, lineHeight: "1.65" }}>{step.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Documentation Required */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
                      <div className="premium-card" style={{ borderTop: "3px solid #1a7a8a" }}>
                        <h4 style={{ color: "#1a7a8a", fontWeight: 700, marginBottom: "1rem" }}>Executive Director Signs:</h4>
                        <ul style={{ paddingLeft: "1.25rem", color: "var(--color-text-muted)", display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.87rem" }}>
                          <li>Tenure Letters</li>
                          <li>NDA Agreements</li>
                          <li>Certificates of Recognition</li>
                          <li>Appointment or Termination Orders</li>
                        </ul>
                      </div>
                      <div className="premium-card" style={{ borderTop: "3px solid #2a7a4b" }}>
                        <h4 style={{ color: "#2a7a4b", fontWeight: 700, marginBottom: "1rem" }}>Head of HR Signs:</h4>
                        <ul style={{ paddingLeft: "1.25rem", color: "var(--color-text-muted)", display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.87rem" }}>
                          <li>Experience Letters</li>
                          <li>Letters of Recommendation (LOR)</li>
                          <li>Department Notices and Internal Memos</li>
                        </ul>
                      </div>
                      <div className="premium-card" style={{ borderTop: "3px solid #c47c1a" }}>
                        <h4 style={{ color: "#c47c1a", fontWeight: 700, marginBottom: "1rem" }}>Tenure & Resignation:</h4>
                        <ul style={{ paddingLeft: "1.25rem", color: "var(--color-text-muted)", display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.87rem" }}>
                          <li>Tenure is not permanent</li>
                          <li>ED has exclusive authority over termination or extension</li>
                          <li>Resignation requires formal notice of at least 1 month in advance</li>
                        </ul>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="premium-card" style={{ textAlign: "center", padding: "2.5rem", background: "linear-gradient(135deg, rgba(26,122,138,0.06) 0%, rgba(30,107,94,0.06) 100%)" }}>
                      <UserPlus size={40} color="#1a7a8a" style={{ marginBottom: "1rem" }} />
                      <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", color: "var(--color-primary)", marginBottom: "0.75rem" }}>Join Our Management Team</h3>
                      <p style={{ color: "var(--color-text-muted)", marginBottom: "1.5rem", maxWidth: "500px", marginInline: "auto", lineHeight: "1.7" }}>
                        We are always looking for passionate, purpose-driven individuals to take on management roles. If you want to lead change and build a better India, apply today.
                      </p>
                      <Link to="/volunteer" className="btn-custom btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
                        <UserPlus size={18} />
                        Apply to Join Management
                      </Link>
                    </div>
                  </div>
                )}

                {/* ── 8. WORKING MODEL ── */}
                {activeSection === "working" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div style={{ width: "52px", height: "52px", borderRadius: "16px", backgroundColor: "#4a7a1a20", display: "flex", alignItems: "center", justifyContent: "center", color: "#4a7a1a" }}>
                        <Briefcase size={26} />
                      </div>
                      <div>
                        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", color: "var(--color-primary)", margin: 0 }}>Working Model</h2>
                        <p style={{ color: "var(--color-text-muted)", margin: 0 }}>How DAY Foundation operates — 4 years of community-driven impact</p>
                      </div>
                    </div>

                    {/* Stats Banner */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem" }}>
                      {[
                        { value: "4 Years", label: "Operational Experience", color: "#1e6b5e" },
                        { value: "700+", label: "Total Engagements", color: "#3b6e9e" },
                        { value: "3 Cities", label: "Active Chapters", color: "#c47c1a" },
                        { value: "1,200+", label: "Interns Trained", color: "#6b4c9e" },
                        { value: "800+", label: "Certificates Issued", color: "#2a7a4b" },
                      ].map((s, i) => (
                        <div key={i} className="premium-card" style={{ textAlign: "center", padding: "1.25rem" }}>
                          <h3 style={{ fontSize: "1.6rem", fontWeight: 800, color: s.color, margin: "0 0 4px 0" }}>{s.value}</h3>
                          <p style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", margin: 0 }}>{s.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* How We Work */}
                    <div className="premium-card" style={{ borderLeft: "4px solid #4a7a1a" }}>
                      <h3 style={{ fontSize: "1.25rem", color: "var(--color-primary)", marginBottom: "1rem" }}>How We Work</h3>
                      <p style={{ color: "var(--color-text-muted)", lineHeight: "1.75", marginBottom: "0" }}>
                        DAY Foundation operates on a <strong>three-tier, city-chapter model</strong> where Central Management (based online) coordinates with City Management volunteers on the ground. Interns are recruited in batches and deployed across projects under close mentorship. All activities are planned, supervised, and documented to ensure transparency and impact.
                      </p>
                    </div>

                    {/* Our Services */}
                    <div className="premium-card">
                      <h3 style={{ fontSize: "1.25rem", color: "var(--color-primary)", marginBottom: "1.25rem" }}>Our Services & Programs</h3>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.75rem" }}>
                        {[
                          { name: "Child Development Programs", icon: "👶", color: "#1e6b5e" },
                          { name: "Youth Development Programs", icon: "🎯", color: "#3b6e9e" },
                          { name: "Community Engagement & Welfare", icon: "🤝", color: "#2a7a4b" },
                          { name: "Healthcare Initiatives", icon: "🏥", color: "#9e3b4c" },
                          { name: "Employment & Empowerment", icon: "💼", color: "#c47c1a" },
                          { name: "Online Webinars & Educational Sessions", icon: "💻", color: "#6b4c9e" },
                          { name: "Cultural & Extracurricular Events", icon: "🎭", color: "#1a7a8a" },
                          { name: "Internship Programs (15-Day)", icon: "📋", color: "#4a7a1a" },
                        ].map((svc, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", backgroundColor: "var(--color-bg-cream)", borderRadius: "12px", padding: "0.9rem 1rem" }}>
                            <span style={{ fontSize: "1.25rem" }}>{svc.icon}</span>
                            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-text-dark)" }}>{svc.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Active Projects */}
                    <div>
                      <h3 style={{ fontSize: "1.25rem", color: "var(--color-primary)", marginBottom: "1.25rem" }}>Active Projects & Initiatives</h3>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
                        {[
                          {
                            name: "Project Udaan",
                            tag: "Education",
                            color: "#1e6b5e",
                            desc: "Weekly Educational Drives advocate for school attendance, prevent dropouts, aid readmission, and monitor progress weekly. Tailored for two age groups, sessions are engaging and interactive, supplying essentials like stationery. Targets slum children to foster consistent education.",
                          },
                          {
                            name: "Project Chetna",
                            tag: "Healthcare",
                            color: "#9e3b4c",
                            desc: "Targets the overall well-being of slum kids, youth, and volunteers. Events include WHO Day Webinar on mental health, International Yoga & Music Day celebration, Medical Health Camp, and Mental Health Camp with collaborations with medical professionals.",
                          },
                          {
                            name: "Shakti Samvaad Campaign",
                            tag: "Women's Rights",
                            color: "#6b4c9e",
                            desc: "Prioritizes women's rights and gender equity. Conducts awareness drives including a Menstrual Health Awareness Campaign, providing sanitary pads, education, and debunking myths through a holistic approach.",
                          },
                          {
                            name: "Prakriti Raksha Pahal",
                            tag: "Environment",
                            color: "#4a7a1a",
                            desc: "Focuses on environmental protection and sustainability — targeting youth awareness, afforestation, and cleanliness. Regular drives educate slum kids on environmental significance and instill cleanliness habits.",
                          },
                        ].map((project, i) => (
                          <div key={i} className="premium-card" style={{ borderTop: `4px solid ${project.color}` }}>
                            <span style={{ backgroundColor: `${project.color}20`, color: project.color, fontSize: "0.72rem", fontWeight: 800, padding: "3px 10px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{project.tag}</span>
                            <h4 style={{ fontWeight: 800, color: "var(--color-text-dark)", margin: "0.75rem 0 0.5rem 0", fontSize: "1.05rem" }}>{project.name}</h4>
                            <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", margin: 0, lineHeight: "1.65" }}>{project.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Internship Model */}
                    <div className="premium-card" style={{ borderLeft: "4px solid #4a7a1a" }}>
                      <h3 style={{ fontSize: "1.25rem", color: "var(--color-primary)", marginBottom: "1rem" }}>Our Internship Model</h3>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1.25rem" }}>
                        {[
                          { label: "Duration", value: "15 Days" },
                          { label: "Type", value: "Social Work Internship" },
                          { label: "Total Interns", value: "1,200+" },
                          { label: "Certificates", value: "800+ Issued" },
                        ].map((d, i) => (
                          <div key={i} style={{ backgroundColor: "#4a7a1a10", borderRadius: "10px", padding: "1rem", textAlign: "center" }}>
                            <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#4a7a1a", margin: "0 0 4px 0" }}>{d.label}</p>
                            <p style={{ fontWeight: 800, color: "var(--color-text-dark)", margin: 0, fontSize: "1.1rem" }}>{d.value}</p>
                          </div>
                        ))}
                      </div>
                      <p style={{ color: "var(--color-text-muted)", lineHeight: "1.7", fontSize: "0.9rem", margin: 0 }}>
                        Interns are recruited in structured batches and work on real social impact projects. They manage crowdfunding, assist in educational drives, healthcare camps, and community welfare activities. All interns receive an experience certificate and Letter of Recommendation upon successful completion.
                      </p>
                    </div>

                    {/* Achievements */}
                    <div className="premium-card" style={{ background: "linear-gradient(135deg, rgba(74,122,26,0.06) 0%, rgba(30,107,94,0.06) 100%)", textAlign: "center", padding: "2.5rem" }}>
                      <Award size={40} color="#4a7a1a" style={{ marginBottom: "1rem" }} />
                      <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", color: "var(--color-primary)", marginBottom: "1.25rem" }}>Felicitations & Recognition</h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: "560px", marginInline: "auto" }}>
                        {[
                          "Felicitated by Jain Samaj and other ministers for outstanding community contributions.",
                          "Felicitated by Gunjan Kala Sadan, Madhya Pradesh for social and cultural impact.",
                          "Felicitated by Uddan 2024 for outstanding contributions to social work.",
                        ].map((award, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", backgroundColor: "var(--color-bg-white)", borderRadius: "12px", padding: "0.9rem 1.25rem" }}>
                            <Star size={16} color="#c47c1a" style={{ flexShrink: 0 }} />
                            <p style={{ fontSize: "0.87rem", color: "var(--color-text-muted)", margin: 0, textAlign: "left", lineHeight: "1.5" }}>{award}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>
    </motion.div>
  );
};
export default About;

