import React, { useState, useEffect } from "react";
import { subscribeGallery } from "../firebase/services";
import type { GalleryItem } from "../data/mockData";
import { Lightbox } from "../components/Lightbox";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "../components/Skeleton";
import "../styles/pages.css";

export const Gallery: React.FC = () => {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [lightboxIndex, setLightboxIndex] = useState<number>(-1);

  useEffect(() => {
    const unsub = subscribeGallery((data) => {
      const activeItems = data.filter(item => !item.hidden && !item.deleted);
      setGallery(activeItems);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleOpenLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleNextLightbox = () => {
    if (gallery.length === 0) return;
    setLightboxIndex((prev) => (prev + 1) % gallery.length);
  };

  const handlePrevLightbox = () => {
    if (gallery.length === 0) return;
    setLightboxIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  const currentItem = lightboxIndex >= 0 && lightboxIndex < gallery.length
    ? gallery[lightboxIndex]
    : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{ minHeight: "100vh", backgroundColor: "var(--color-bg-gray)" }}
    >
      {/* Subpage Header */}
      <section className="subpage-hero">
        <div className="container-custom">
          <span className="badge-custom">Welfare Gallery</span>
          <h1 className="subpage-hero-title">Welfare Captured in Moments</h1>
          <p className="subpage-hero-desc">
            Visual logs of DAY Foundation campaigns, slum school classrooms, mobile camps, and youth team events.
          </p>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="section-padding">
        <div className="container-custom">
          {loading ? (
            <div className="gallery-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="gallery-item" style={{ height: "250px" }}>
                  <Skeleton borderRadius="12px" />
                </div>
              ))}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                className="gallery-grid"
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                {gallery.map((item, index) => (
                  <motion.div
                    key={item.id}
                    className="gallery-item"
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => handleOpenLightbox(index)}
                    style={{ cursor: "pointer", background: "none", border: "none" }}
                  >
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      loading="lazy" 
                      onError={(e) => {
                        const parent = e.currentTarget.closest('.gallery-item') as HTMLElement;
                        if (parent) parent.style.display = 'none';
                      }}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <Lightbox
        isOpen={lightboxOpen}
        imageUrl={currentItem?.imageUrl || ""}
        title={currentItem?.title || ""}
        onClose={() => { setLightboxOpen(false); setLightboxIndex(-1); }}
        onNext={handleNextLightbox}
        onPrev={handlePrevLightbox}
      />
    </motion.div>
  );
};
export default Gallery;
