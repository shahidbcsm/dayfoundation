import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { subscribeBlogs } from "../firebase/services";
import type { Blog } from "../data/mockData";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Calendar, User, ArrowRight } from "lucide-react";
import { CardSkeleton } from "../components/Skeleton";
import "../styles/pages.css";

export const Blogs: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  useEffect(() => {
    const unsub = subscribeBlogs((data) => {
      setBlogs(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const categories = ["All", "Education", "Aid & Welfare", "Rojgar", "Mental Health"];

  // Filters blogs based on visibility, search, and category choice
  const filteredBlogs = blogs.filter((blog) => {
    if (blog.hidden) return false;
    const matchesSearch = 
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.summary.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      activeCategory === "All" || 
      blog.category.toLowerCase() === activeCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  // Highlight latest article as Featured
  const featuredBlog = filteredBlogs.length > 0 ? filteredBlogs[0] : null;
  const regularBlogs = featuredBlog ? filteredBlogs.slice(1) : filteredBlogs;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{ minHeight: "100vh", backgroundColor: "var(--color-bg-gray)" }}
    >
      {/* Page Header */}
      <section className="subpage-hero">
        <div className="container-custom">
          <span className="badge-custom">Our Stories</span>
          <h1 className="subpage-hero-title">Welfare Journals & Insights</h1>
          <p className="subpage-hero-desc">
            Explore articles and program updates written by our leaders and student interns.
          </p>
        </div>
      </section>

      {/* Blogs Hub */}
      <section className="section-padding">
        <div className="container-custom">
          
          {/* Controls Bar: Search & Categories */}
          <div 
            style={{ 
              display: "flex", 
              flexWrap: "wrap", 
              justifyContent: "space-between", 
              alignItems: "center", 
              gap: "1.5rem", 
              marginBottom: "3rem" 
            }}
          >
            {/* Category Tags */}
            <div className="gallery-filters" style={{ marginBottom: 0 }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`filter-btn ${activeCategory === cat ? "active" : ""}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input Box */}
            <div style={{ position: "relative", width: "100%", maxWidth: "320px" }}>
              <Search 
                size={16} 
                style={{ 
                  position: "absolute", 
                  left: "14px", 
                  top: "50%", 
                  transform: "translateY(-50%)", 
                  color: "var(--color-text-light)" 
                }} 
              />
              <input 
                type="text" 
                placeholder="Search articles..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ 
                  width: "100%", 
                  paddingLeft: "42px", 
                  borderRadius: "9999px",
                  fontSize: "0.875rem",
                  backgroundColor: "var(--color-bg-white)"
                }}
              />
            </div>
          </div>

          {loading ? (
            <div className="grid-cols-responsive">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {filteredBlogs.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ textAlign: "center", padding: "4rem 0", color: "var(--color-text-muted)" }}
                >
                  <p style={{ fontSize: "1.125rem", fontWeight: 700 }}>No articles matching your criteria.</p>
                </motion.div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
                  
                  {/* FEATURED BLOG BANNER */}
                  {featuredBlog && activeCategory === "All" && searchQuery === "" && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="premium-card featured-blog-card"
                      style={{ 
                        display: "flex", 
                        flexWrap: "wrap", 
                        gap: "2.5rem", 
                        padding: "2rem",
                        backgroundColor: "var(--color-bg-white)",
                        alignItems: "center"
                      }}
                    >
                      <div style={{ flex: "1 1 350px", height: "320px", borderRadius: "16px", overflow: "hidden" }}>
                        <img 
                          src={featuredBlog.coverImage} 
                          alt={featuredBlog.title} 
                          style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                        />
                      </div>
                      <div style={{ flex: "1 1 350px" }}>
                        <span className="blog-card-category">{featuredBlog.category}</span>
                        <h2 className="featured-blog-title" style={{ fontSize: "2rem", margin: "0.5rem 0 1rem 0", lineHeight: "1.25" }}>
                          <Link to={`/blogs/${featuredBlog.id}`} style={{ color: "inherit" }}>
                            {featuredBlog.title}
                          </Link>
                        </h2>
                        <p style={{ color: "var(--color-text-muted)", lineHeight: "1.7", marginBottom: "1.5rem" }}>
                          {featuredBlog.summary}
                        </p>
                        
                        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", fontSize: "0.85rem", color: "var(--color-text-light)", marginBottom: "2rem" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                            <User size={14} />
                            {featuredBlog.author}
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                            <Calendar size={14} />
                            {featuredBlog.createdAt}
                          </span>
                        </div>

                        <Link to={`/blogs/${featuredBlog.id}`} className="btn btn-primary featured-blog-btn">
                          <span>Read Full Story</span>
                          <ArrowRight size={16} />
                        </Link>
                      </div>
                    </motion.div>
                  )}

                  {/* REGULAR BLOGS GRID */}
                  <div className="grid-cols-responsive">
                    {(activeCategory === "All" && searchQuery === "" ? regularBlogs : filteredBlogs).map((blog) => (
                      <motion.article 
                        key={blog.id}
                        className="blog-card"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="blog-card-image">
                          <img src={blog.coverImage} alt={blog.title} />
                        </div>
                        <div className="blog-card-content">
                          <span className="blog-card-category">{blog.category}</span>
                          <h3 className="blog-card-title">
                            <Link to={`/blogs/${blog.id}`} style={{ color: "inherit" }}>
                              {blog.title}
                            </Link>
                          </h3>
                          <p className="blog-card-summary">{blog.summary}</p>
                          <div className="blog-card-footer">
                            <span style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                              <User size={12} />
                              {blog.author}
                            </span>
                            <span style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                              <Calendar size={12} />
                              {blog.createdAt}
                            </span>
                          </div>
                        </div>
                      </motion.article>
                    ))}
                  </div>

                </div>
              )}
            </AnimatePresence>
          )}

        </div>
      </section>
    </motion.div>
  );
};
export default Blogs;
