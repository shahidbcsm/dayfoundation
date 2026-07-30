import React from "react";
import { Shield, Building, Heart, Eye, Target } from "lucide-react";
import { motion } from "framer-motion";

interface ValueItem {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

interface TrustPillar {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

export const Team: React.FC = () => {
  const values: ValueItem[] = [
    {
      icon: <Heart size={24} className="text-secondary" />,
      title: "Compassion First",
      desc: "Every community deployment and educational workbook begins with deep empathy and respect for individual human dignity."
    },
    {
      icon: <Target size={24} className="text-secondary" />,
      title: "Impact Driven",
      desc: "We prioritize tangible success and community development over tracking cosmetic data markers. Real lives changed is our metric."
    },
    {
      icon: <Eye size={24} className="text-secondary" />,
      title: "Radical Transparency",
      desc: "Providing highly open donation channels, clear financial structures, and regular audited updates to build iron-clad public trust."
    }
  ];

  const trustPillars: TrustPillar[] = [
    {
      icon: <Shield size={24} className="text-secondary" />,
      title: "Section 8 Registered",
      desc: "Fully registered, legal non-profit social welfare organization under the Indian Companies Act."
    },
    {
      icon: <Building size={24} className="text-secondary" />,
      title: "NITI Aayog Registered",
      desc: "Registered with NITI Aayog's official NGO Darpan portal (Govt of India), verifying our credentials."
    }
  ];

  return (
    <section className="section-padding" style={{ backgroundColor: "var(--color-bg-gray)" }}>
      <div className="container-custom">
        
        {/* Core Values */}
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <span className="badge-custom">Our Values</span>
          <h2 className="section-title">Credentials of Trust</h2>
          <p className="section-subtitle">
            BHTDAY Welfare Foundation is anchored in solid governance, transparent structures, and humanitarian principles.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem", marginBottom: "5rem" }}>
          {values.map((val, idx) => (
            <motion.div 
              key={idx}
              className="premium-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              style={{ textAlign: "center" }}
            >
              <div 
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "16px",
                  backgroundColor: "rgba(252, 78, 30, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1.5rem auto"
                }}
              >
                {val.icon}
              </div>
              <h3 style={{ fontSize: "1.25rem", color: "var(--color-primary)", marginBottom: "0.75rem" }}>{val.title}</h3>
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", lineHeight: "1.6" }}>{val.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Governance badging */}
        <div 
          className="glass-panel" 
          style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
            gap: "3rem", 
            padding: "3rem",
            backgroundColor: "var(--color-bg-white)",
            border: "1px solid var(--color-border-light)",
            boxShadow: "var(--shadow-md)"
          }}
        >
          {trustPillars.map((pillar, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={{ display: "flex", gap: "1.5rem" }}
            >
              <div 
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(252, 78, 30, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}
              >
                {pillar.icon}
              </div>
              <div>
                <h4 style={{ fontSize: "1.125rem", color: "var(--color-primary)", fontWeight: 800, marginBottom: "0.5rem" }}>{pillar.title}</h4>
                <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", lineHeight: "1.6" }}>{pillar.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
export default Team;
