import React, { useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LightboxProps {
  isOpen: boolean;
  imageUrl: string;
  title: string;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export const Lightbox: React.FC<LightboxProps> = ({ 
  isOpen, 
  imageUrl, 
  title, 
  onClose,
  onNext,
  onPrev
}) => {
  
  // Keyboard listeners for Esc, ArrowLeft, ArrowRight
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight" && onNext) {
        onNext();
      } else if (e.key === "ArrowLeft" && onPrev) {
        onPrev();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // freeze background scroll
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = ""; // restore background scroll
    };
  }, [isOpen, onClose, onNext, onPrev]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(15, 23, 42, 0.98)", // dark glass
            backdropFilter: "blur(12px)",
            zIndex: 3000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem"
          }}
          onClick={onClose}
        >
          {/* Close Trigger Button */}
          <button 
            onClick={onClose}
            style={{
              position: "absolute",
              top: "24px",
              right: "24px",
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              cursor: "pointer",
              transition: "background-color 0.2s",
              zIndex: 3010
            }}
            aria-label="Close image preview"
          >
            <X size={24} />
          </button>

          {/* Previous Button */}
          {onPrev && (
            <button
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
              style={{
                position: "absolute",
                left: "24px",
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                cursor: "pointer",
                transition: "background-color 0.2s",
                zIndex: 3010
              }}
              aria-label="Previous image"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Next Button */}
          {onNext && (
            <button
              onClick={(e) => { e.stopPropagation(); onNext(); }}
              style={{
                position: "absolute",
                right: "24px",
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                cursor: "pointer",
                transition: "background-color 0.2s",
                zIndex: 3010
              }}
              aria-label="Next image"
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* Centered Image Card */}
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            style={{
              maxWidth: "80%",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1.25rem",
              zIndex: 3005
            }}
            onClick={(e) => e.stopPropagation()} // halt bubbling close
          >
            <img 
              src={imageUrl} 
              alt={title} 
              style={{
                maxWidth: "100%",
                maxHeight: "75vh",
                borderRadius: "var(--radius-lg)",
                objectFit: "contain",
                boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
                border: "1px solid rgba(255,255,255,0.08)"
              }}
            />
            {title && (
              <div 
                style={{
                  backgroundColor: "rgba(15, 23, 42, 0.75)",
                  padding: "0.5rem 1.25rem",
                  borderRadius: "99px",
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow: "var(--shadow-sm)"
                }}
              >
                <p style={{ color: "white", fontSize: "0.95rem", fontWeight: 600, textAlign: "center" }}>
                  {title}
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Lightbox;
