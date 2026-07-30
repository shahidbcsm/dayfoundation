import React, { useState, useEffect } from "react";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { subscribeTestimonials } from "../firebase/services";
import type { Testimonial } from "../data/mockData";

export const Testimonials: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [direction, setDirection] = useState<number>(0); // -1 for left, 1 for right

  useEffect(() => {
    const unsubscribe = subscribeTestimonials((data) => {
      setTestimonials(data);
    });
    return () => unsubscribe();
  }, []);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 100 : -100,
      opacity: 0
    })
  };

  const nextSlide = () => {
    if (testimonials.length === 0) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    if (testimonials.length === 0) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  if (testimonials.length === 0) {
    return null; // Or a loading/empty state
  }

  const current = testimonials[currentIndex];

  return (
    <section className="section-padding" style={{ backgroundColor: "var(--color-bg-white)", position: "relative", overflow: "hidden" }}>
      {/* Visual background accents */}
      <div 
        style={{
          position: "absolute",
          top: "10%",
          right: "5%",
          width: "250px",
          height: "250px",
          borderRadius: "50%",
          backgroundColor: "rgba(14, 31, 56, 0.02)",
          filter: "blur(50px)",
          zIndex: 0
        }}
      ></div>

      <div className="container-custom" style={{ position: "relative", zIndex: 10 }}>
        
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <span className="badge-custom">Testimonials</span>
          <h2 className="section-title">Echoes of Gratitude</h2>
          <p className="section-subtitle">
            Hear from our former interns and volunteers whose lives and skills have been transformed through their active support of our campaigns.
          </p>
        </div>

        <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative" }}>
          
          <div 
            className="glass-panel" 
            style={{ 
              padding: "4rem 3rem", 
              backgroundColor: "var(--color-bg-cream)",
              border: "1px solid var(--color-border-light)",
              boxShadow: "var(--shadow-md)",
              minHeight: "360px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden"
            }}
          >
            <div style={{ position: "absolute", top: "24px", left: "24px", color: "rgba(252, 78, 30, 0.15)" }}>
              <Quote size={56} className="fill-current" />
            </div>

            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                style={{ position: "relative", zIndex: 10 }}
              >
                <p 
                  style={{ 
                    fontFamily: "var(--font-sans)", 
                    fontSize: "clamp(1.1rem, 2vw, 1.25rem)", 
                    lineHeight: "1.7", 
                    color: "var(--color-text-dark)", 
                    fontStyle: "italic",
                    marginBottom: "2.5rem" 
                  }}
                >
                  “{current.quote}”
                </p>

                <div 
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "1rem", 
                    borderTop: "1px solid var(--color-border-light)", 
                    paddingTop: "1.5rem" 
                  }}
                >
                  <img 
                    src={current.image} 
                    alt={current.name} 
                    style={{ 
                      width: "56px", 
                      height: "56px", 
                      borderRadius: "50%", 
                      objectFit: "cover",
                      border: "2px solid var(--color-secondary)"
                    }} 
                  />
                  <div>
                    <h4 style={{ fontSize: "1.1rem", color: "var(--color-primary)", fontWeight: 800 }}>{current.name}</h4>
                    <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", fontWeight: 700 }}>{current.role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div 
            style={{ 
              display: "flex", 
              justifyContent: "flex-end", 
              gap: "1rem", 
              marginTop: "1.5rem" 
            }}
          >
            <button 
              onClick={prevSlide}
              className="theme-toggle-btn"
              style={{ width: "44px", height: "44px" }}
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={nextSlide}
              className="theme-toggle-btn"
              style={{ width: "44px", height: "44px" }}
              aria-label="Next testimonial"
            >
              <ChevronRight size={20} />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};
export default Testimonials;
