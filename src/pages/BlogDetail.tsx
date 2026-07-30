import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getBlogById } from "../firebase/services";
import type { Blog } from "../data/mockData";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, User, Clock, Loader } from "lucide-react";
import "../styles/pages.css";

export const BlogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!id) return;
      try {
        const data = await getBlogById(id);
        if (data) {
          setBlog(data);
        } else {
          // If article not found, redirect to blog catalog
          navigate("/blogs");
        }
      } catch (err) {
        console.error("Error fetching detailed article log.", err);
        navigate("/blogs");
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id, navigate]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "var(--color-bg-gray)", color: "var(--color-secondary)" }}>
        <Loader className="animate-spin" size={36} />
      </div>
    );
  }

  if (!blog) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ minHeight: "100vh", backgroundColor: "var(--color-bg-gray)", paddingTop: "120px", paddingBottom: "5rem" }}
    >
      <div className="container-custom" style={{ maxWidth: "800px" }}>
        
        {/* Back Link Button */}
        <Link 
          to="/blogs" 
          style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "0.5rem", 
            fontSize: "0.875rem", 
            fontWeight: 700, 
            color: "var(--color-text-muted)",
            marginBottom: "2rem" 
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Articles</span>
        </Link>

        {/* Article Meta */}
        <span className="blog-card-category" style={{ fontSize: "0.85rem" }}>{blog.category}</span>
        <h1 
          style={{ 
            fontFamily: "var(--font-serif)", 
            fontSize: "clamp(2rem, 4vw, 3rem)", 
            color: "var(--color-primary)", 
            lineHeight: "1.2",
            margin: "0.75rem 0 1.5rem 0" 
          }}
        >
          {blog.title}
        </h1>

        <div 
          style={{ 
            display: "flex", 
            flexWrap: "wrap", 
            gap: "1.5rem", 
            fontSize: "0.85rem", 
            color: "var(--color-text-light)",
            borderBottom: "1px solid var(--color-border-light)",
            paddingBottom: "1.5rem",
            marginBottom: "2.5rem"
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <User size={14} />
            <strong>By {blog.author}</strong>
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <Calendar size={14} />
            {blog.createdAt}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <Clock size={14} />
            3 min read
          </span>
        </div>

        {/* Big Cover Image */}
        <div style={{ height: "450px", width: "100%", borderRadius: "20px", overflow: "hidden", marginBottom: "3rem", boxShadow: "var(--shadow-md)" }}>
          <img 
            src={blog.coverImage} 
            alt={blog.title} 
            style={{ width: "100%", height: "100%", objectFit: "cover" }} 
          />
        </div>

        {/* Typography Content Container */}
        <article 
          style={{ 
            fontSize: "1.05rem", 
            lineHeight: "1.8", 
            color: "var(--color-text-dark)",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem"
          }}
        >
          {blog.content.split("\n\n").map((para, idx) => {
            // Primitive Markdown parsing for headers inside standard paragraph text block
            if (para.startsWith("### ")) {
              return (
                <h3 
                  key={idx} 
                  style={{ 
                    fontFamily: "var(--font-sans)", 
                    fontSize: "1.5rem", 
                    color: "var(--color-primary)", 
                    marginTop: "1.5rem", 
                    marginBottom: "0.5rem" 
                  }}
                >
                  {para.replace("### ", "")}
                </h3>
              );
            }
            if (para.startsWith("- ") || para.startsWith("1. ")) {
              return (
                <ul key={idx} style={{ paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {para.split("\n").map((li, lIdx) => (
                    <li key={lIdx} style={{ listStyleType: "disc" }}>
                      {li.replace(/^- |^\d+\. /, "")}
                    </li>
                  ))}
                </ul>
              );
            }
            // Parse blockquotes
            if (para.startsWith("*") && para.endsWith("*")) {
              return (
                <blockquote 
                  key={idx} 
                  style={{ 
                    borderLeft: "4px solid var(--color-secondary)", 
                    paddingLeft: "1.5rem", 
                    fontStyle: "italic", 
                    color: "var(--color-text-muted)", 
                    margin: "1.5rem 0",
                    fontSize: "1.1rem" 
                  }}
                >
                  {para.replace(/\*/g, "")}
                </blockquote>
              );
            }
            return <p key={idx}>{para}</p>;
          })}
        </article>

      </div>
    </motion.div>
  );
};
export default BlogDetail;
