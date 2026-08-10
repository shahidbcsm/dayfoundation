import React from "react";
import { BookOpen, Users, HeartPulse, Sprout } from "lucide-react";
import { motion } from "framer-motion";
import "../styles/pages.css";

interface MissionPillar {
  icon: React.ReactNode;
  title: string;
  hindiMotto: string;
  englishMotto: string;
  desc: string;
  color: string;
}

export const Mission: React.FC = () => {
  const pillars: MissionPillar[] = [
    {
      icon: <BookOpen size={28} />,
      title: "Education",
      hindiMotto: "शिक्षा से सशक्तिकरण",
      englishMotto: "Empowerment through Education",
      desc: "We establish digital classrooms and weekend Learning Circles in slum pockets. By teaching primary subjects, computer literacy, and confidence, we give children the base tools to break the cycle of poverty.",
      color: "rgba(252, 78, 30, 0.1)"
    },
    {
      icon: <Users size={28} />,
      title: "Youth Empowerment",
      hindiMotto: "युवा से समर्थन",
      englishMotto: "Support from Youth",
      desc: "Our internship bootcamps develop college students into project leaders. By researching, crowdfunding, and organizing community drives, they learn high-level skills while delivering essential support.",
      color: "rgba(246, 193, 51, 0.1)"
    },
    {
      icon: <HeartPulse size={28} />,
      title: "Aid & Healthcare",
      hindiMotto: "स्वस्थ समुदाय",
      englishMotto: "Healthy Communities",
      desc: "Conducting monthly physical diagnostic checkups, raising hygiene awareness, and distributing clean items (sanitary pads, sanitizers, dental packs) to ensure basic health guidelines reach every family.",
      color: "rgba(14, 31, 56, 0.05)"
    },
    {
      icon: <Sprout size={28} />,
      title: "Project Rojgar & Livelihood",
      hindiMotto: "आत्मनिर्भरता",
      englishMotto: "Self-Reliance",
      desc: "Providing vocational training bootcamps (like tailoring and micro-retail support) to underprivileged women, helping families double their household incomes and fund their children's secondary schooling.",
      color: "rgba(37, 211, 102, 0.08)"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{ minHeight: "100vh", backgroundColor: "var(--color-bg-white)" }}
    >
      {/* Page Header */}
      <section className="subpage-hero">
        <div className="container-custom">
          <span className="badge-custom">Our Mission</span>
          <h1 className="subpage-hero-title">Rooted in Compassion, Built for Impact</h1>
          <p className="subpage-hero-desc" style={{ maxWidth: "950px" }}>
            Deep dive into the operational values and four central pillars of BHTDAY Welfare Foundation.
          </p>
        </div>
      </section>

      {/* Motto Explanation */}
      <section className="section-padding" style={{ backgroundColor: "var(--color-bg-cream)" }}>
        <div className="container-custom">
          <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem", width: "100%" }}>
              <img 
                src="/tagline-hindi.png" 
                alt="शिक्षा से सशक्तिकरण, युवा से समर्थन" 
                style={{ 
                  height: "auto", 
                  maxHeight: "38px", 
                  maxWidth: "100%", 
                  display: "block",
                  marginInline: "auto",
                  objectFit: "contain" 
                }} 
              />
            </div>
            <p style={{ color: "var(--color-text-muted)", lineHeight: "1.8", fontSize: "1.05rem" }}>
              Our guiding motto bridges two of society's most powerful elements: Education and Youth. 
              We believe that true, scalable community welfare cannot happen simply through passive charity. 
              By training energetic university students to manage and execute grassroots programs, we create a self-sustaining cycle where youth develop high leadership competence while elevating underprivileged children.
            </p>
          </div>
        </div>
      </section>

      {/* Operational Pillars grid */}
      <section className="section-padding">
        <div className="container-custom">
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <span className="badge-custom">Operational Columns</span>
            <h2 className="section-title">Four Pillars of Social Change</h2>
            <p className="section-subtitle">How we structure our localized deployments across Jabalpur, Indore, and Delhi.</p>
          </div>

          <div className="grid-4">
            {pillars.map((pillar, idx) => (
              <motion.div
                key={idx}
                className="premium-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  justifyContent: "space-between",
                  height: "100%",
                  border: "1px solid var(--color-border-light)"
                }}
              >
                <div>
                  <div 
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "16px",
                      backgroundColor: pillar.color,
                      color: "var(--color-secondary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "1.5rem"
                    }}
                  >
                    {pillar.icon}
                  </div>
                  <h3 style={{ fontSize: "1.35rem", color: "var(--color-primary)", marginBottom: "0.4rem" }}>{pillar.title}</h3>
                  <div style={{ marginBottom: "1rem" }}>
                    <div style={{ fontFamily: "'Anek Devanagari', sans-serif", fontSize: "0.95rem", fontWeight: 700, color: "#D9854E", marginBottom: "2px" }}>
                      "{pillar.hindiMotto}"
                    </div>
                    <div style={{ fontSize: "0.76rem", color: "var(--color-text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      {pillar.englishMotto}
                    </div>
                  </div>
                  <p style={{ fontSize: "0.9rem", color: "var(--color-text-muted)", lineHeight: "1.6" }}>{pillar.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Future Vision Section */}
      <section className="section-padding mission-future-vision-section" style={{ borderTop: "1px solid var(--color-border-light)" }}>
        <div className="container-custom">
          <div className="grid-2" style={{ alignItems: "center" }}>
            <div>
              <span className="badge-custom">Next Chapters</span>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "2.25rem", color: "var(--color-primary)", marginBottom: "1.5rem" }}>
                Our Future Vision
              </h2>
              <p style={{ lineHeight: "1.7", marginBottom: "1.25rem" }}>
                BHTDAY Welfare Foundation is expanding its boundaries and deepening its social footprint. We are launching key campaigns to establish a larger, youth-powered network of change.
              </p>
              
              <ul className="mission-future-list" style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.9rem" }}>
                <li style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                  <span style={{ color: "var(--color-secondary)", fontWeight: 800 }}>✓</span>
                  <span className="mission-future-text"><strong>Geographical Expansion:</strong> Expanding operational branches into Mumbai, Prayagraj, and Delhi NCR.</span>
                </li>
                <li style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                  <span style={{ color: "var(--color-secondary)", fontWeight: 800 }}>✓</span>
                  <span className="mission-future-text"><strong>Segment 2 Launch:</strong> Launching a structured segment by Diwali focusing on expanded Rozgar options and professional Mental Wellness initiatives.</span>
                </li>
                <li style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                  <span style={{ color: "var(--color-secondary)", fontWeight: 800 }}>✓</span>
                  <span className="mission-future-text"><strong>DAY Influencer Community:</strong> Mobilizing social media creators and campus leaders to promote primary child rights and environmental sanitation awareness.</span>
                </li>
                <li style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                  <span style={{ color: "var(--color-secondary)", fontWeight: 800 }}>✓</span>
                  <span className="mission-future-text"><strong>Compliance &amp; Governance:</strong> Recruiting selective, dedicated professionals to strengthen our internal Legal Unit and Human Resource compliance.</span>
                </li>
              </ul>
            </div>

            <div>
              <img 
                src="/assets/gallery/gallery-018.jpg" 
                alt="DAY Foundation Future Vision Campaign" 
                style={{ borderRadius: "24px", boxShadow: "var(--shadow-lg)", width: "100%", height: "380px", objectFit: "cover" }}
              />
            </div>
          </div>
        </div>
      </section>

    </motion.div>
  );
};
export default Mission;
