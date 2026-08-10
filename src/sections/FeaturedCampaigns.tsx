import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, ShieldAlert, Users, Award, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface FocusArea {
  icon: React.ReactNode;
  title: string;
  description: string;
  image: string;
}

interface Campaign {
  id: string;
  tag: string;
  title: string;
  description: string;
  image: string;
  link: string;
}

export const FeaturedCampaigns: React.FC = () => {
  const focusAreas: FocusArea[] = [
    {
      icon: <BookOpen size={20} className="text-secondary" />,
      title: "Education",
      description: "Providing foundational education and literacy tools to slum children and underprivileged groups in active clusters.",
      image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=400"
    },
    {
      icon: <ShieldAlert size={20} className="text-secondary" />,
      title: "Aid & Welfare",
      description: "Organizing mobile diagnostic clinics, awareness programs, and sanitization support to strengthen community health.",
      image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=400"
    },
    {
      icon: <Users size={20} className="text-secondary" />,
      title: "Youth Empowerment",
      description: "Developing vocational and corporate training internships for students, preparing them as active agents of social change.",
      image: "https://images.unsplash.com/photo-1526976721119-550a13d3930e?auto=format&fit=crop&q=80&w=400"
    },
    {
      icon: <Award size={20} className="text-secondary" />,
      title: "Project Rojgar",
      description: "Generating employment opportunities for women by distributing sewing machines and teaching micro-business skills.",
      image: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=400"
    }
  ];

  const campaigns: Campaign[] = [
    {
      id: "story-1",
      tag: "Education",
      title: "Learning Circles in Jabalpur",
      description: "Our weekly community circles are empowering underprivileged children with essential math, science, and computer skills, mentored by energetic youth leaders.",
      image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800",
      link: "/mission"
    },
    {
      id: "story-2",
      tag: "Healthcare",
      title: "Care Camps That Reach Families Early",
      description: "Regular medical checkups and basic hygiene drives in local Indore settlements ensure that critical illnesses are diagnosed early and welfare support is given.",
      image: "/assets/gallery/gallery-006.jpg",
      link: "/programs"
    }
  ];

  return (
    <>
      {/* 1. FOCUS AREAS SECTION */}
      <section className="section-padding" style={{ backgroundColor: "var(--color-bg-white)" }}>
        <div className="container-custom">
          
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <span className="badge-custom">What We Do</span>
            <h2 className="section-title">Pillars of Impact</h2>
            <p className="section-subtitle">
              Every initiative of the BHTDAY Welfare Foundation is centered on these four focus areas, creating a structural framework for long-term growth.
            </p>
          </div>

          <div className="grid-4">
            {focusAreas.map((area, idx) => (
              <motion.div 
                key={idx}
                className="premium-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                style={{ display: "flex", flexDirection: "column", overflow: "hidden", padding: 0 }}
              >
                <div style={{ height: "180px", width: "100%", overflow: "hidden", position: "relative" }}>
                  <img 
                    src={area.image} 
                    alt={area.title} 
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                  />
                  <div 
                    style={{ 
                      position: "absolute", 
                      top: "16px", 
                      left: "16px",
                      width: "40px",
                      height: "40px",
                      borderRadius: "12px",
                      backgroundColor: "var(--color-bg-white)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "var(--shadow-md)"
                    }}
                  >
                    {area.icon}
                  </div>
                </div>
                <div style={{ padding: "1.5rem" }}>
                  <h3 style={{ fontSize: "1.25rem", color: "var(--color-primary)", marginBottom: "0.5rem" }}>{area.title}</h3>
                  <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", lineHeight: "1.6" }}>{area.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* 2. FEATURED STORIES / CAMPAIGNS */}
      <section className="section-padding" style={{ backgroundColor: "var(--color-bg-cream)" }}>
        <div className="container-custom">
          
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <span className="badge-custom">Impact Stories</span>
            <h2 className="section-title">Voices from the Field</h2>
            <p className="section-subtitle">
              Read real-life stories of community change, driven by our local programs and volunteers across cities.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
            {campaigns.map((camp, idx) => (
              <motion.div 
                key={camp.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="premium-card"
                style={{ 
                  display: "flex", 
                  flexDirection: idx % 2 === 0 ? "row" : "row-reverse", 
                  gap: "2.5rem",
                  padding: "2rem",
                  flexWrap: "wrap",
                  alignItems: "center",
                  backgroundColor: "var(--color-bg-white)"
                }}
              >
                <div style={{ flex: "1 1 300px", borderRadius: "16px", overflow: "hidden", height: "300px" }}>
                  <img 
                    src={camp.image} 
                    alt={camp.title} 
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                  />
                </div>
                
                <div style={{ flex: "1 1 300px" }}>
                  <span className="badge-custom" style={{ marginBottom: "0.5rem" }}>{camp.tag}</span>
                  <h3 style={{ fontSize: "1.75rem", color: "var(--color-primary)", marginBottom: "1rem" }}>{camp.title}</h3>
                  <p style={{ color: "var(--color-text-muted)", lineHeight: "1.7", marginBottom: "1.5rem" }}>{camp.description}</p>
                  
                  <Link 
                    to={camp.link} 
                    className="btn btn-outline"
                    style={{ padding: "0.6rem 1.5rem", fontSize: "0.875rem" }}
                  >
                    <span>Read Full Journey</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>
    </>
  );
};
export default FeaturedCampaigns;
