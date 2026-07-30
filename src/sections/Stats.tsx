import React from "react";
import { Users, MapPin, Award, Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface StatItem {
  icon: React.ReactNode;
  value: string;
  label: string;
  description: string;
}

export const Stats: React.FC = () => {
  const stats: StatItem[] = [
    {
      icon: <Users size={24} className="text-secondary" />,
      value: "1,200+",
      label: "Interns Trained",
      description: "Nurturing future leaders"
    },
    {
      icon: <MapPin size={24} className="text-secondary" />,
      value: "3 Active Cities",
      label: "Delhi, Indore, Jabalpur",
      description: "Empowering local regions"
    },
    {
      icon: <Award size={24} className="text-secondary" />,
      value: "800+",
      label: "Certificates Issued",
      description: "Recognizing active social work"
    },
    {
      icon: <Calendar size={24} className="text-secondary" />,
      value: "April 2022",
      label: "Active Since",
      description: "Years of grassroots service"
    }
  ];

  return (
    <section className="section-padding" style={{ position: "relative", zIndex: 10, marginTop: "-4rem" }}>
      <div className="container-custom">
        <div 
          className="glass-panel" 
          style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
            gap: "2rem", 
            padding: "3rem 2rem",
            boxShadow: "0 20px 40px rgba(14, 31, 56, 0.06)",
            border: "1px solid var(--color-border-light)"
          }}
        >
          {stats.map((stat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              style={{
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
              }}
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
                  marginBottom: "1rem"
                }}
              >
                {stat.icon}
              </div>
              <h3 
                style={{ 
                  fontSize: "var(--fs-2xl)", 
                  fontWeight: "800", 
                  color: "var(--color-primary)", 
                  marginBottom: "0.25rem",
                  fontFamily: "var(--font-sans)"
                }}
              >
                {stat.value.endsWith("+") ? (
                  <>
                    {stat.value.slice(0, -1)}
                    <span style={{ fontFamily: "Inter, sans-serif" }}>+</span>
                  </>
                ) : (
                  stat.value
                )}
              </h3>
              <p 
                style={{ 
                  fontWeight: "700", 
                  fontSize: "0.95rem",
                  color: "var(--color-text-dark)", 
                  marginBottom: "0.25rem" 
                }}
              >
                {stat.label}
              </p>
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                {stat.description}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default Stats;
