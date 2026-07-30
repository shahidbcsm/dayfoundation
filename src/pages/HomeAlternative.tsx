import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Heart, Users, GraduationCap, HeartPulse, Handshake, MapPin, Quote, Star, ChevronLeft, ChevronRight, ShieldCheck, Award, Calendar, CheckCircle } from "lucide-react";
import { subscribeTestimonials, useCardImages } from "../firebase/services";
import "../styles/home-alternative.css";

/* ─── Count-up hook ─── */
function useCountUp(target: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let cur = 0;
        const step = target / (duration / 16);
        const t = setInterval(() => {
          cur += step;
          if (cur >= target) { setCount(target); clearInterval(t); }
          else setCount(Math.floor(cur));
        }, 16);
      }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);
  return { count, ref };
}

const StatItem: React.FC<{ value: number; suffix?: string; label: string }> = ({ value, suffix = "+", label }) => {
  const { count, ref } = useCountUp(value);
  return (
    <div className="alt-stat-item">
      <div className="alt-stat-value">
        <span ref={ref}>{count.toLocaleString()}</span>
        <span style={{ fontFamily: "Inter, sans-serif" }}>{suffix}</span>
      </div>
      <div className="alt-stat-label">{label}</div>
    </div>
  );
};

const fallbackTestimonials = [
  { name: "Teshu Namdev", role: "Campaign Management Intern", city: "Indore", rating: 5, quote: "My internship with DAY Foundation, Indore was a deeply enriching and purpose-driven experience. Being part of initiatives like crowdfunding, project pitching, sponsorship research and campaign planning allowed me to witness how small efforts can create a powerful social impact.", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200" },
  { name: "Kushagra Jain", role: "Public Relations & Marketing Intern", city: "Delhi NCR", rating: 5, quote: "My 15-day internship with DAY Foundation was a meaningful learning experience. I researched SHGs and subsidised education, worked on Project Muskan — creating a crowdfunding pitch, video, and graphic — and explored PR for NGOs. This experience strengthened my skills in research, creativity, and communication.", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200" },
  { name: "Pooja Sindhu", role: "Legal Aid & Advocacy Intern", city: "Jabalpur", rating: 5, quote: "As a law student, interning with DAY Foundation has been a truly meaningful experience. The internship gave me valuable exposure to grassroots-level initiatives focused on women empowerment, access to free education for children, and awareness of government welfare schemes.", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200" },
  { name: "Moulshree Sahu", role: "Ex City Representative", city: "Jabalpur", rating: 5, quote: "Being a part of DAY has been a truly life changing experience. It showed me that real change doesn't always come from big actions it often begins with small acts of kindness and people who genuinely care. Every experience... every conversation... and every community initiative taught me something valuable about compassion, responsibility, and the importance of giving back. More than the work itself, it was the people and the shared purpose that left a lasting impact on me. This journey has shaped the way I see the world, helping me grow with empathy, gratitude, and a constant desire to learn and contribute wherever I can.", img: "/assets/VOLUN/Moulshree Sahu.jpeg" }
];

const HomeAlternative: React.FC = () => {
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  const [donationAmt, setDonationAmt] = useState("1000");
  const [dynamicTestimonials, setDynamicTestimonials] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  const [selectedTestimonial, setSelectedTestimonial] = useState<any | null>(null);

  const { getCardImg } = useCardImages();

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeTestimonials((data) => {
      setDynamicTestimonials(data);
    });
    return () => unsubscribe();
  }, []);

  const displayTestimonials = (dynamicTestimonials.length > 0 ? dynamicTestimonials : fallbackTestimonials).map(t => ({
    name: t.name,
    role: t.role,
    city: t.role.includes(", ") ? t.role.split(", ").pop() : (t.city || ""),
    rating: 5,
    quote: t.quote,
    img: t.image || t.img || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(t.name)}`
  }));

  const visibleCount = windowWidth < 768 ? 1 : (windowWidth < 1024 ? 2 : 3);

  useEffect(() => {
    if (displayTestimonials.length <= visibleCount) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        const maxIndex = displayTestimonials.length - visibleCount;
        return prev >= maxIndex ? 0 : prev + 1;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [displayTestimonials.length, visibleCount]);

  const faqs = [
    { q: "What is DAY Foundation?", a: "DAY Foundation is a youth-led organization working in the fields of education, healthcare, youth empowerment, environmental sustainability, and community welfare." },
    { q: "How can I become a volunteer?", a: "You can join DAY Foundation by filling out our volunteer registration form and completing the onboarding process." },
    { q: "In which cities does DAY Foundation operate?", a: "DAY Foundation currently operates in Jabalpur, Delhi, and Indore, with plans to expand to Prayagraj and Mumbai soon." },
    { q: "How can I support DAY Foundation?", a: "You can support us by volunteering, donating, partnering with us, applying for internships, or participating in our social initiatives and awareness campaigns." },
    { q: "Is DAY Foundation a registered organization?", a: "Yes, DAY Foundation is a legally registered Section 8 company. The organization is also registered on the NITI Aayog Darpan portal and has received 12A and 80G certifications under the Income Tax Act." },
    { q: "Does DAY Foundation offer internships?", a: "Yes, DAY Foundation offers internship opportunities for students and young professionals to gain practical experience in social impact, leadership, community development, event management, fundraising, and other areas." },
  ];

  const focusAreas = [
    { key: "focus_edu", icon: <GraduationCap size={22} />, title: "Education", desc: "Providing education to slum children and underserved communities. Digital literacy programs and learning initiatives transforming futures.", img: "/assets/gallery/gallery-001.jpg", color: "#DCE9F7", iconColor: "#034356" },
    { key: "focus_aid", icon: <HeartPulse size={22} />, title: "Aid & Welfare", desc: "Organizing healthcare drives, welfare campaigns, and community support programs to provide essential aid where it's needed most.", img: "/assets/gallery/gallery-005.jpg", color: "#F3D5BA", iconColor: "#4A2800" },
    { key: "focus_youth", icon: <Users size={22} />, title: "Youth Empowerment", desc: "Engaging youth through internship programs, volunteer opportunities, and leadership development to build the next generation of changemakers.", img: "/assets/gallery/gallery-010.jpg", color: "#D9F99D", iconColor: "#052100" },
    { key: "focus_community", icon: <Handshake size={22} />, title: "Community Development", desc: "Strengthening communities through engagement events, distribution drives, awareness campaigns, and inclusive social initiatives.", img: "/assets/gallery/gallery-015.jpg", color: "#E68952", iconColor: "#ffffff" },
  ];

  const cities = [
    {
      name: "Jabalpur",
      state: "Madhya Pradesh",
      programs: "Education, Healthcare",
      icon: (
        // Madan Mahal Fort silhouette
        <svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 64, height: 48 }}>
          <rect x="30" y="38" width="20" height="16" rx="1" fill="currentColor" opacity="0.85"/>
          <rect x="34" y="30" width="12" height="10" rx="1" fill="currentColor" opacity="0.9"/>
          <rect x="38" y="22" width="4" height="10" rx="0.5" fill="currentColor"/>
          <rect x="36" y="20" width="8" height="4" rx="1" fill="currentColor"/>
          <rect x="10" y="46" width="14" height="8" rx="1" fill="currentColor" opacity="0.7"/>
          <rect x="13" y="40" width="8" height="8" rx="1" fill="currentColor" opacity="0.75"/>
          <rect x="56" y="46" width="14" height="8" rx="1" fill="currentColor" opacity="0.7"/>
          <rect x="59" y="40" width="8" height="8" rx="1" fill="currentColor" opacity="0.75"/>
          <rect x="0" y="54" width="80" height="4" rx="1" fill="currentColor" opacity="0.5"/>
          <rect x="33" y="14" width="2" height="8" fill="currentColor" opacity="0.6"/>
          <rect x="45" y="14" width="2" height="8" fill="currentColor" opacity="0.6"/>
          <path d="M38 22 Q40 16 42 22" fill="currentColor" opacity="0.8"/>
        </svg>
      ),
    },
    {
      name: "Delhi",
      state: "Delhi NCR",
      programs: "Youth Empowerment, Internships",
      icon: (
        // India Gate silhouette
        <svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 64, height: 48 }}>
          {/* Base */}
          <rect x="5" y="52" width="70" height="4" rx="1" fill="currentColor" opacity="0.5"/>
          {/* Wide plinth */}
          <rect x="14" y="48" width="52" height="4" rx="1" fill="currentColor" opacity="0.7"/>
          {/* Left leg */}
          <rect x="18" y="28" width="12" height="20" rx="1" fill="currentColor" opacity="0.85"/>
          {/* Right leg */}
          <rect x="50" y="28" width="12" height="20" rx="1" fill="currentColor" opacity="0.85"/>
          {/* Arch */}
          <path d="M18 28 Q40 8 62 28" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round"/>
          {/* Top horizontal beam */}
          <rect x="16" y="22" width="48" height="5" rx="1" fill="currentColor" opacity="0.9"/>
          {/* Flame plinth */}
          <rect x="36" y="16" width="8" height="7" rx="1" fill="currentColor"/>
          {/* Flame */}
          <path d="M40 6 C38 10 37 12 40 16 C43 12 42 10 40 6Z" fill="currentColor" opacity="0.8"/>
        </svg>
      ),
    },
    {
      name: "Indore",
      state: "Madhya Pradesh",
      programs: "Community Development, Campaigns",
      icon: (
        // Rajwada Palace silhouette
        <svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 64, height: 48 }}>
          {/* Ground */}
          <rect x="0" y="54" width="80" height="4" rx="1" fill="currentColor" opacity="0.5"/>
          {/* Main body */}
          <rect x="10" y="38" width="60" height="16" rx="1" fill="currentColor" opacity="0.8"/>
          {/* Second floor */}
          <rect x="16" y="28" width="48" height="12" rx="1" fill="currentColor" opacity="0.85"/>
          {/* Centre tower */}
          <rect x="32" y="16" width="16" height="14" rx="1" fill="currentColor" opacity="0.9"/>
          {/* Side turrets */}
          <rect x="14" y="22" width="8" height="8" rx="1" fill="currentColor" opacity="0.75"/>
          <rect x="58" y="22" width="8" height="8" rx="1" fill="currentColor" opacity="0.75"/>
          {/* Spires */}
          <path d="M40 6 L36 16 L44 16 Z" fill="currentColor"/>
          <path d="M18 16 L15 22 L21 22 Z" fill="currentColor" opacity="0.7"/>
          <path d="M62 16 L59 22 L65 22 Z" fill="currentColor" opacity="0.7"/>
          {/* Windows row */}
          <rect x="20" y="40" width="6" height="8" rx="0.5" fill="white" opacity="0.2"/>
          <rect x="37" y="40" width="6" height="8" rx="0.5" fill="white" opacity="0.2"/>
          <rect x="54" y="40" width="6" height="8" rx="0.5" fill="white" opacity="0.2"/>
        </svg>
      ),
    },
  ];

  const amts = ["500", "1000", "5000"];

  return (
    <div className="alt-page">

      {/* ── HERO ── */}
      <div className="alt-container">
        <div className="alt-hero">
          <div className="alt-hero-text">
            <div className="gap">
              <span className="alt-pill">Our Legacy Since 2022</span>
              <h1 className="alt-h1">
                <div className="regular">Empowering</div>
                <div className="bold">communities,</div>
                <div className="regular">inspiring changes</div>
              </h1>
              <p className="alt-lead">Founded on <strong>12th April 2022</strong>, DAY Foundation is a youth-led organization dedicated to empowering underserved communities through Education, Aid, Youth, and Care.</p>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(40,24,8,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Guided by our motto</p>
                <p className="motto">"शिक्षा से सशक्तिकरण, युवा से समर्थन"</p>
              </div>
              <div className="alt-hero-btns">
                <Link to="/volunteer" className="alt-btn alt-btn-primary">Join Our Mission</Link>
                <Link to="/donate" className="alt-btn alt-btn-orange">Donate Now</Link>
              </div>
            </div>
          </div>

          <div className="alt-hero-img-wrap">
            <div className="alt-hero-img-frame">
              <img src={getCardImg("hero_image", "/assets/gallery/gallery-020.jpg")} alt="Children drawing" />
              <div className="alt-hero-logo-badge">
                <img src="/logo.png" alt="DAY Foundation Logo" />
              </div>
              <div className="alt-hero-year-badge">
                <p>Active Since</p>
                <p>April 2022</p>
              </div>
            </div>
            <div className="alt-hero-blob" />
          </div>
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <div className="alt-container" style={{ marginBottom: 64 }}>
        <div className="alt-stats-bar">
          <div className="alt-stats-grid">
            <StatItem value={320} label="Active Volunteers" />
            <StatItem value={1200} label="Interns Trained" />
            <StatItem value={800} label="Certificates Issued" />
            <StatItem value={3} suffix="" label="Active Cities" />
          </div>
        </div>
        <div className="alt-stats-badges" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px", alignItems: "center" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><ShieldCheck size={14} /> Section 8 Registered</span>
          <span className="sep">|</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><Award size={14} /> NITI Aayog Verified</span>
          <span className="sep">|</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><CheckCircle size={14} /> 12A &amp; 80G Certified</span>
          <span className="sep">|</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><Calendar size={14} /> Founded April 2022</span>
        </div>
      </div>

      {/* ── MISSION ── */}
      <div className="alt-container alt-section" style={{ borderTop: "1px solid rgba(40,24,8,0.05)" }}>
        <div className="alt-mission-grid">
          <div className="alt-mission-text">
            <span className="alt-pill">Who We Are</span>
            <h2 className="alt-h2">Our Mission</h2>
            <p className="alt-lead">To empower underprivileged communities across India through Education, Aid, Youth, and Care. We focus on providing education to slum children, organizing healthcare and welfare drives, engaging youth through internships and volunteer programs, and creating employment opportunities via innovative projects like <strong>Rojgar</strong>.</p>
            <Link to="/mission" className="alt-read-link">Read Our Full Mission <ArrowRight size={14} /></Link>
          </div>
          <div className="alt-mission-img">
            <img src={getCardImg("gallery_home_1", "/assets/gallery/gallery-015.jpg")} alt="Community gathering" />
          </div>
        </div>

        <div className="alt-vision-grid">
          <div className="alt-vision-card-orange">
            <h2 className="alt-h2">Our Vision</h2>
            <p>To build a brighter and more inclusive future through sustainable social impact. We envision expanding into universities and colleges, reaching more communities, launching mental health initiatives, and empowering youth to become self-reliant leaders of change.</p>
          </div>
          <div className="alt-vision-card">
            <div className="alt-vision-card-icon"><GraduationCap size={28} /></div>
            <h3 className="alt-h3">Transformative Education</h3>
            <p>Ensuring every child in urban slums has access to quality foundational schooling, learning resources, and pathways to university.</p>
          </div>
          <div className="alt-vision-card">
            <div className="alt-vision-card-icon"><Users size={28} /></div>
            <h3 className="alt-h3">Grassroots Mobilization</h3>
            <p>Engaging thousands of college youths in impactful volunteerism, community welfare drives, and local developmental projects.</p>
          </div>
        </div>
      </div>

      {/* ── FOCUS AREAS ── */}
      <div className="alt-focus-bg">
        <div className="alt-container alt-section">
          <div className="alt-section-header">
            <span className="alt-pill">What We Do</span>
            <h2 className="alt-h2">Areas of Focus</h2>
            <p className="alt-sub">Four pillars that guide every initiative, every program, and every life we touch.</p>
          </div>
          <div className="alt-focus-grid">
            {focusAreas.map((area, i) => (
              <div key={i} className="alt-focus-card">
                <div className="alt-focus-img"><img src={getCardImg(area.key, area.img)} alt={area.title} /></div>
                <div className="alt-focus-body">
                  <div className="alt-focus-icon" style={{ backgroundColor: area.color, color: area.iconColor }}>{area.icon}</div>
                  <h3 className="alt-h3">{area.title}</h3>
                  <p className="alt-sub">{area.desc}</p>
                  <Link to="/programs" className="alt-focus-link">Learn More <ArrowRight size={11} /></Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── IMPACT STORIES ── */}
      <div className="alt-container alt-section">
        <div className="alt-section-header">
          <span className="alt-pill">Impact Stories</span>
          <h2 className="alt-h2">Voices from the Field</h2>
          <p className="alt-sub">Every program tells a story. These are the real experiences of communities we serve.</p>
        </div>
        <div className="alt-stories-grid">
          <div className="alt-story-main">
            <img src={getCardImg("story_card_1", "/assets/gallery/gallery-025.jpg")} alt="Featured Story" />
            <div className="alt-story-overlay" />
            <div className="alt-story-content">
              <span className="alt-story-tag">Education</span>
              <h3 className="alt-h3" style={{ color: "#fff", fontSize: "1.5rem" }}>Learning Circles in Jabalpur</h3>
              <p>Children in community learning groups are building daily reading habits, confidence, and curiosity with support from volunteer mentors.</p>
              <Link to="/programs" className="alt-story-link">Read Full Story <ArrowRight size={13} /></Link>
            </div>
          </div>
          <div className="alt-side-stories">
            <div className="alt-side-card">
              <span className="alt-side-tag alt-side-tag-blue">Healthcare</span>
              <h4 className="alt-h4">Care Camps Reach Families Early</h4>
              <p className="alt-sub">Monthly awareness camps help underserved families access preventive health information and welfare guidance.</p>
              <Link to="/programs" className="alt-side-link">Read More <ArrowRight size={11} /></Link>
            </div>
            <div className="alt-side-card">
              <span className="alt-side-tag alt-side-tag-blue">Volunteer Stories</span>
              <h4 className="alt-h4">Youth Turning Weekends Into Service</h4>
              <p className="alt-sub">Students and young professionals contribute time, planning, and on-ground energy to strengthen drives.</p>
              <Link to="/volunteer" className="alt-side-link">Read More <ArrowRight size={11} /></Link>
            </div>
            <div className="alt-side-card">
              <span className="alt-side-tag alt-side-tag-green">Internship</span>
              <h4 className="alt-h4">15-Day Immersive Social Internships</h4>
              <p className="alt-sub">Real-world work in campaigns, PR, legal aid, and education alongside field practitioners.</p>
              <Link to="/internship" className="alt-side-link">Apply Now <ArrowRight size={11} /></Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── CITIES ── */}
      <div style={{ borderTop: "1px solid rgba(40,24,8,0.05)" }}>
        <div className="alt-container alt-section">
          <div className="alt-section-header">
            <span className="alt-pill">Where We Work</span>
            <h2 className="alt-h2">Active Across India</h2>
            <p className="alt-sub">Youth-led chapters actively driving grassroots social impact across key regional hubs.</p>
          </div>
          <div className="alt-cities-grid">
            {cities.map((c, i) => (
              <div key={i} className="alt-city-card">
                <div className="alt-city-emoji">{c.icon}</div>
                <h3 className="alt-h3">{c.name}</h3>
                <div className="alt-city-meta"><MapPin size={12} />{c.state}</div>
                <p className="alt-city-programs">{c.programs}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TESTIMONIALS ── */}
      <div className="alt-testi-bg" style={{ overflow: "hidden" }}>
        <div className="alt-container alt-section">
          <div className="alt-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem" }}>
            <div>
              <h2 className="alt-h2" style={{ fontStyle: "italic", margin: 0 }}>Echoes of Gratitude</h2>
              <p className="alt-sub" style={{ margin: "0.5rem 0 0 0" }}>Hearing the real voices of people whose lives have been touched by our work.</p>
            </div>
            {displayTestimonials.length > visibleCount && (
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button 
                  disabled={currentIndex === 0} 
                  onClick={() => setCurrentIndex(p => Math.max(0, p - 1))}
                  className="alt-amt-btn"
                  style={{ width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", padding: 0, border: "1px solid rgba(40,24,8,0.15)" }}
                  aria-label="Previous testimonials"
                >
                  <ChevronLeft size={18} />
                </button>
                <button 
                  disabled={currentIndex >= displayTestimonials.length - visibleCount} 
                  onClick={() => setCurrentIndex(p => Math.min(displayTestimonials.length - visibleCount, p + 1))}
                  className="alt-amt-btn"
                  style={{ width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", padding: 0, border: "1px solid rgba(40,24,8,0.15)" }}
                  aria-label="Next testimonials"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
          
          <div style={{ overflow: "hidden", width: "100%" }}>
            <motion.div
              animate={{ x: `-${currentIndex * (100 / displayTestimonials.length)}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              style={{ 
                display: "flex", 
                gap: "2rem", 
                width: `${(displayTestimonials.length / visibleCount) * 100}%`,
                boxSizing: "border-box"
              }}
            >
              {displayTestimonials.map((t, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <div key={idx} style={{ width: `calc(${100 / displayTestimonials.length}% - ${(2 * (displayTestimonials.length - 1)) / displayTestimonials.length}rem)`, flexShrink: 0, boxSizing: "border-box" }}>
                    <div className={`alt-testi-card${isActive ? " active" : ""}`} style={{ height: "100%", margin: 0 }}>
                      <div>
                        <div className="alt-testi-stars">{Array.from({ length: t.rating }).map((_, j) => <Star key={j} size={13} fill="currentColor" />)}</div>
                        <div className="alt-testi-quote"><Quote size={26} /></div>
                        <p className="alt-testi-text" style={{ minHeight: "90px" }}>
                          "{t.quote.length > 150 ? t.quote.substring(0, 140) + "..." : t.quote}"
                          {t.quote.length > 150 && (
                            <button 
                              onClick={() => setSelectedTestimonial(t)}
                              style={{
                                background: "none",
                                border: "none",
                                color: "var(--color-primary)",
                                cursor: "pointer",
                                fontSize: "0.85rem",
                                fontWeight: "bold",
                                padding: "0 0 0 4px",
                                textDecoration: "underline"
                              }}
                            >
                              Read More
                            </button>
                          )}
                        </p>
                      </div>
                      <div className="alt-testi-footer">
                        <img 
                          src={t.img} 
                          alt={t.name} 
                          className="alt-testi-avatar" 
                          onError={(e) => { 
                            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(t.name)}`; 
                          }} 
                        />
                        <div>
                          <p className="alt-testi-name">{t.name}</p>
                          <p className="alt-testi-role">{t.role}{t.city ? ` · ${t.city}` : ""}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── DONATE ── */}
      <div className="alt-container alt-section">
        <div className="alt-donate-wrap">
          <div className="alt-donate-left">
            <span className="alt-donate-badge">Make a Difference</span>
            <h2 className="alt-h2">Every contribution creates ripples.</h2>
            <p>Your contribution directly funds sewing machines, digital tablets, and mobile diagnostic camps. Join us in making a tangible difference.</p>
            <ul className="alt-donate-benefits">
              <li>✅ 80G Tax Exemption Available</li>
              <li>✅ Secure Razorpay Gateway</li>
              <li>✅ Certificate of Donation Provided</li>
            </ul>
          </div>
          <div className="alt-donate-box">
            <p className="alt-donate-label">Select Donation Amount (INR)</p>
            <div className="alt-amount-grid">
              {amts.map(amt => (
                <button key={amt} className={`alt-amt-btn${donationAmt === amt ? " selected" : ""}`} onClick={() => setDonationAmt(amt)}>₹{amt}</button>
              ))}
              <button className={`alt-amt-btn${!amts.includes(donationAmt) ? " selected" : ""}`} onClick={() => setDonationAmt("")}>Other</button>
            </div>
            {!amts.includes(donationAmt) && (
              <input className="alt-amt-input" type="number" placeholder="Enter custom amount" value={donationAmt} onChange={e => setDonationAmt(e.target.value)} />
            )}
            <p className="alt-donate-hint">*A ₹{donationAmt || "1000"} donation supplies learning materials for slum circles or health camp diagnostics.</p>
            <Link to="/donate" className="alt-donate-cta"><Heart size={15} fill="currentColor" /> Donate Securely</Link>
          </div>
        </div>
      </div>

      {/* ── COMING SOON ── */}
      <div className="alt-coming-bg">
        <div className="alt-container alt-section">
          <div className="alt-section-header">
            <span className="alt-pill">Future Initiatives</span>
            <h2 className="alt-h2">Coming Soon</h2>
            <p className="alt-sub">We are continuously expanding our service verticals to address more dimensions of social development.</p>
          </div>
          <div className="alt-coming-card">
            <div className="alt-coming-meta">
              <span className="alt-coming-tag">Rojgar Segment 2 starts soon</span>
              <span className="alt-coming-date">Est. Launch Late 2026</span>
            </div>
            <h3 className="alt-h3" style={{ fontSize: "1.8rem", fontFamily: "'Playfair Display', serif", marginBottom: 12 }}>DAY Rojgar</h3>
            <p className="alt-lead">A new initiative dedicated to supporting employment opportunities, career guidance, skill development, and youth empowerment, helping individuals move toward sustainable livelihoods.</p>
          </div>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div className="alt-container alt-section">
        <div className="alt-section-header">
          <span className="alt-pill">Common Questions</span>
          <h2 className="alt-h2">Frequently Asked Questions</h2>
          <p className="alt-sub">Answers to questions from prospective donors, interns, and community partners.</p>
        </div>
        <div className="alt-faq-list">
          {faqs.map((faq, i) => (
            <div key={i} className="alt-faq-item">
              <button className={`alt-faq-btn${activeFAQ === i ? " open" : ""}`} onClick={() => setActiveFAQ(activeFAQ === i ? null : i)}>
                <span>{faq.q}</span>
                <span className="icon">+</span>
              </button>
              <AnimatePresence>
                {activeFAQ === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: "easeInOut" }} style={{ overflow: "hidden" }}>
                    <p className="alt-faq-answer">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
        <div className="alt-faq-footer">
          <Link to="/contact" className="alt-faq-link">Still have questions? Contact our support unit <ArrowRight size={13} /></Link>
        </div>
      </div>

      {/* ── CTA BANNER ── */}
      <div className="alt-cta-banner">
        <img src="/assets/gallery/gallery-040.jpg" alt="Volunteers" />
        <div className="alt-cta-overlay" />
        <div className="alt-cta-content">
          <h2 className="alt-h2" style={{ color: "#fff" }}>Ready to make a difference?</h2>
          <p>Join 1,200+ interns and volunteers who are already transforming communities across India. Apply for our 15-day internship or sign up as a long-term volunteer.</p>
          <div className="alt-cta-btns">
            <Link to="/internship" className="alt-btn alt-btn-primary">Apply for Internship</Link>
            <Link to="/volunteer" className="alt-btn alt-btn-outline">Become a Volunteer</Link>
          </div>
        </div>
      </div>

      {/* Testimonial Modal overlay */}
      <AnimatePresence>
        {selectedTestimonial && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "1rem"
            }} 
            onClick={() => setSelectedTestimonial(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{
                backgroundColor: "white",
                padding: "2rem",
                borderRadius: "20px",
                maxWidth: "550px",
                width: "100%",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                border: "1px solid rgba(40,24,8,0.15)",
                position: "relative"
              }} 
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedTestimonial(null)}
                style={{
                  position: "absolute",
                  top: "1.25rem",
                  right: "1.25rem",
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  color: "rgba(40,24,8,0.4)"
                }}
              >
                &times;
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.5rem" }}>
                <div className="alt-testi-avatar" style={{ margin: 0, width: "48px", height: "48px" }}>
                  <img 
                    src={selectedTestimonial.img} 
                    alt={selectedTestimonial.name} 
                    onError={(e) => { 
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(selectedTestimonial.name)}`; 
                    }} 
                    style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                  />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: "bold", color: "#034356", margin: 0 }}>{selectedTestimonial.name}</h3>
                  <p style={{ fontSize: "0.78rem", color: "rgba(40,24,8,0.6)", margin: "2px 0 0 0" }}>{selectedTestimonial.role}{selectedTestimonial.city ? ` · ${selectedTestimonial.city}` : ""}</p>
                </div>
              </div>
              <p style={{ fontSize: "0.95rem", fontStyle: "italic", lineHeight: 1.7, color: "#034356", marginBottom: "1.5rem", whiteSpace: "pre-line" }}>
                "{selectedTestimonial.quote}"
              </p>
              <button 
                onClick={() => setSelectedTestimonial(null)}
                className="alt-btn alt-btn-primary"
                style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", border: "none", cursor: "pointer" }}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomeAlternative;
