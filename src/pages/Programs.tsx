import React from "react";
import { Link } from "react-router-dom";
import { 
  BookOpen, 
  HeartPulse, 
  Heart, 
  Sprout, 
  Handshake, 
  Video, 
  Gift, 
  Sparkles, 
  Smile, 
  ArrowRight 
} from "lucide-react";
import { motion } from "framer-motion";
import "../styles/pages.css";

interface Program {
  id: string;
  icon: React.ReactNode;
  title: string;
  badge: string;
  description: string;
  image: string;
  ctaText: string;
  ctaPath: string;
  secondaryCtaText?: string;
  secondaryCtaPath?: string;
}

export const Programs: React.FC = () => {
  const programsList: Program[] = [
    {
      id: "prog-edu",
      icon: <BookOpen size={24} className="text-secondary" />,
      title: "Education Program",
      badge: "📚 Sunday Drive",
      description: "We conduct Education Drives every Sunday to provide learning support, interactive activities, and educational resources for underprivileged children, helping them build a brighter future.",
      image: "/assets/gallery/gallery-002.jpg",
      ctaText: "Support Education",
      ctaPath: "/donate",
      secondaryCtaText: "Volunteer",
      secondaryCtaPath: "/volunteer"
    },
    {
      id: "prog-health",
      icon: <HeartPulse size={24} className="text-secondary" />,
      title: "Healthcare Program",
      badge: "🏥 Medical Camp",
      description: "Our Healthcare Camps offer basic health check-ups, health awareness sessions, and guidance to improve the well-being of underserved communities.",
      image: "/assets/gallery/gallery-008.jpg",
      ctaText: "Donate Health Kits",
      ctaPath: "/donate",
      secondaryCtaText: "Join Camp",
      secondaryCtaPath: "/volunteer"
    },
    {
      id: "prog-youth",
      icon: <Sprout size={24} className="text-secondary" />,
      title: "Youth Development",
      badge: "🌱 Skill & Leadership",
      description: "We organize Youth Activities that focus on leadership, volunteering, skill development, and empowering young people to become responsible changemakers.",
      image: "/assets/gallery/gallery-012.jpg",
      ctaText: "Join Internships",
      ctaPath: "/internship",
      secondaryCtaText: "Volunteer",
      secondaryCtaPath: "/volunteer"
    },
    {
      id: "prog-community",
      icon: <Handshake size={24} className="text-secondary" />,
      title: "Community Engagement",
      badge: "🤝 Local Impact",
      description: "Through Community Engagement Events, we work closely with local communities to address social issues, encourage participation, and strengthen social bonds.",
      image: "/assets/gallery/gallery-016.jpg",
      ctaText: "Support Drives",
      ctaPath: "/donate",
      secondaryCtaText: "Volunteer",
      secondaryCtaPath: "/volunteer"
    },
    {
      id: "prog-awareness",
      icon: <Video size={24} className="text-secondary" />,
      title: "Awareness & Webinar",
      badge: "💻 Online Sessions",
      description: "We host Online Webinars and Awareness Sessions featuring experts and professionals to educate the public on important social, health, educational, and legal topics.",
      image: "/assets/gallery/gallery-022.jpg",
      ctaText: "Watch Webinars",
      ctaPath: "/blogs",
      secondaryCtaText: "Register to Join",
      secondaryCtaPath: "/volunteer"
    },
    {
      id: "prog-relief",
      icon: <Gift size={24} className="text-secondary" />,
      title: "Relief & Distribution",
      badge: "🎁 Aid Campaigns",
      description: "Our Distribution Drives provide essential items such as food, clothing, stationery, hygiene kits, and other necessities to individuals and families in need.",
      image: "/assets/gallery/gallery-028.jpg",
      ctaText: "Donate Supplies",
      ctaPath: "/donate",
      secondaryCtaText: "Join Drives",
      secondaryCtaPath: "/volunteer"
    },
    {
      id: "prog-equality",
      icon: <Sparkles size={24} className="text-secondary" />,
      title: "Inclusion & Equality",
      badge: "🌈 Diverse Action",
      description: "Through initiatives such as Pride Month events and awareness campaigns, we promote equality, dignity, inclusion, and respect for every individual regardless of gender identity or sexual orientation.",
      image: "/assets/gallery/gallery-033.jpg",
      ctaText: "Support Equality",
      ctaPath: "/donate",
      secondaryCtaText: "Join Us",
      secondaryCtaPath: "/volunteer"
    },
    {
      id: "prog-happiness",
      icon: <Smile size={24} className="text-secondary" />,
      title: "Child Happiness",
      badge: "🎉 Joy & Celebrations",
      description: "We celebrate birthdays, festivals, and special occasions with children through fun activities, games, gifts, and educational experiences, creating joyful memories and promoting emotional well-being.",
      image: "/assets/gallery/gallery-038.jpg",
      ctaText: "Share Joy",
      ctaPath: "/donate",
      secondaryCtaText: "Volunteer",
      secondaryCtaPath: "/volunteer"
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
          <span className="badge-custom">Our Programs</span>
          <h1 className="subpage-hero-title">Programs of Sustained Change</h1>
          <p className="subpage-hero-desc" style={{ maxWidth: "950px" }}>
            Explore our core community deployments, learning modules, medical campaigns, and inclusivity campaigns.
          </p>
        </div>
      </section>

      {/* Programs Cards Grid */}
      <section className="section-padding">
        <div className="container-custom">
          
          <div className="grid-2">
            {programsList.map((prog, idx) => (
              <motion.div
                key={prog.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="premium-card group"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: 0,
                  backgroundColor: "var(--color-bg-white)",
                  border: "1px solid var(--color-border-light)",
                  boxShadow: "var(--shadow-md)",
                  borderRadius: "24px",
                  overflow: "hidden",
                  height: "100%"
                }}
              >
                {/* Visual Card Image */}
                <div 
                  style={{ 
                    position: "relative",
                    width: "100%",
                    height: "220px",
                    overflow: "hidden"
                  }}
                >
                  <img 
                    src={prog.image} 
                    alt={prog.title} 
                    style={{ 
                      width: "100%", 
                      height: "100%", 
                      objectFit: "cover",
                      transition: "transform 0.5s ease" 
                    }} 
                    className="group-hover:scale-105"
                  />
                  
                  {/* Category Badge overlay */}
                  <div 
                    style={{ 
                      position: "absolute", 
                      top: "20px", 
                      left: "20px"
                    }}
                  >
                    <span 
                      className="badge-custom" 
                      style={{ 
                        backgroundColor: "rgba(255, 255, 255, 0.95)", 
                        color: "var(--color-primary)",
                        backdropFilter: "blur(4px)",
                        border: "1px solid rgba(255, 255, 255, 0.5)",
                        fontWeight: "700"
                      }}
                    >
                      {prog.badge}
                    </span>
                  </div>
                </div>

                {/* Content Panel */}
                <div 
                  style={{ 
                    padding: "2rem",
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1,
                    justifyContent: "space-between"
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                      <div 
                        style={{ 
                          width: "40px", 
                          height: "40px", 
                          borderRadius: "12px", 
                          backgroundColor: "rgba(252, 78, 30, 0.08)", 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center",
                          color: "var(--color-secondary)"
                        }}
                      >
                        {prog.icon}
                      </div>
                      <h3 style={{ fontSize: "1.35rem", color: "var(--color-primary)", margin: 0, fontWeight: "700" }}>
                        {prog.title}
                      </h3>
                    </div>
                    
                    <p style={{ fontSize: "0.925rem", color: "var(--color-text-muted)", lineHeight: "1.6", marginBottom: "2rem" }}>
                      {prog.description}
                    </p>
                  </div>

                  {/* Actions Row */}
                  <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "auto", borderTop: "1px solid var(--color-border-light)", paddingTop: "1.25rem" }}>
                    <Link 
                      to={prog.ctaPath} 
                      className="btn btn-primary" 
                      style={{ padding: "0.5rem 1.25rem", fontSize: "0.825rem", flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: "6px" }}
                    >
                      <Heart size={14} className="fill-current" />
                      <span>{prog.ctaText}</span>
                    </Link>
                    {prog.secondaryCtaText && (
                      <Link 
                        to={prog.secondaryCtaPath || "/"} 
                        className="btn btn-outline" 
                        style={{ padding: "0.5rem 1.25rem", fontSize: "0.825rem", display: "flex", justifyContent: "center", alignItems: "center", gap: "6px" }}
                      >
                        <span>{prog.secondaryCtaText}</span>
                        <ArrowRight size={12} />
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>
    </motion.div>
  );
};

export default Programs;
