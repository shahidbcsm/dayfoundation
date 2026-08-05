import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, MapPin, Shield, ChevronDown } from "lucide-react";
import { subscribeNewsletter } from "../firebase/services";

/* ─── Collapsible Footer Section (mobile) ─── */
const FooterSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="footer-section-wrap">
      <button
        className="footer-section-toggle"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <h3>{title}</h3>
        <ChevronDown
          size={16}
          className="footer-toggle-icon"
          style={{
            transition: "transform 0.25s ease",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>
      <div className={`footer-section-body${open ? " open" : ""}`}>
        {children}
      </div>
    </div>
  );
};

export const Footer: React.FC = () => {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterMsg, setNewsletterMsg] = useState("");

  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterLoading(true);
    setNewsletterMsg("");
    try {
      await subscribeNewsletter(newsletterEmail, "Footer Subscription");
      setNewsletterMsg("🎉 Subscribed successfully!");
      setNewsletterEmail("");
    } catch (err: any) {
      setNewsletterMsg(err.message || "Failed to subscribe.");
    } finally {
      setNewsletterLoading(false);
    }
  };

  const handleLinkClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer id="footer" className="site-footer-main">
      <div className="container-custom section-padding">

        {/* ── Grid ── */}
        <div className="footer-grid">

          {/* Brand Col */}
          <div className="footer-brand-col">
            <Link to="/" onClick={handleLinkClick} style={{ display: "inline-flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <img src="/logo.png" alt="DAY Foundation Logo" style={{ width: "40px", height: "40px", borderRadius: "50%" }} />
              <span className="footer-brand-title">DAY Foundation</span>
            </Link>
            <p className="footer-desc">
              DAY Foundation (BHTDAY Welfare Foundation) is a Section 8, NITI Aayog-registered NGO empowering
              underprivileged communities across India through Education, Aid, Youth, and Care.
            </p>

            {/* Social Icons */}
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
              {[
                { href: "https://www.instagram.com/dayfoundation_ngo", label: "Instagram", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><circle cx="17.5" cy="6.5" r="1.5"></circle></svg> },
                { href: "https://www.linkedin.com/company/day-foundation", label: "LinkedIn", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg> },
                { href: "https://linktr.ee/dayfoundation", label: "Linktree", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg> },
                { href: "https://www.whatsapp.com/channel/0029VaSrBkW4Y9lsGYcgPn0E", label: "WhatsApp", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg> },
              ].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  className="footer-social-link">
                  {s.icon}
                </a>
              ))}
            </div>

            {/* Newsletter Subscription */}
            <div style={{ marginTop: "1rem" }}>
              <span className="footer-newsletter-heading">
                📧 Subscribe to our Newsletter
              </span>
              <form onSubmit={handleNewsletterSubscribe} style={{ display: "flex", gap: "8px", maxWidth: "320px" }}>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                  className="footer-newsletter-input"
                />
                <button
                  type="submit"
                  disabled={newsletterLoading}
                  className="footer-newsletter-btn"
                >
                  {newsletterLoading ? "..." : "Join"}
                </button>
              </form>
              {newsletterMsg && (
                <p style={{ 
                  fontSize: "0.75rem", 
                  color: newsletterMsg.includes("successfully") ? "#25D366" : "#fc4e1e", 
                  marginTop: "6px", 
                  marginBlockEnd: 0 
                }}>
                  {newsletterMsg}
                </p>
              )}
            </div>
          </div>

          {/* Navigate Col — collapsible on mobile */}
          <FooterSection title="Navigate">
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.875rem", paddingLeft: 0 }}>
              {[
                { to: "/", label: "Home" },
                { to: "/about", label: "About Us" },
                { to: "/mission", label: "Our Mission" },
                { to: "/programs", label: "Our Work" },
                { to: "/volunteer", label: "Volunteer" },
                { to: "/internship", label: "Internship" },
                { to: "/contact", label: "Contact Us" },
              ].map(l => (
                <li key={l.to}><Link to={l.to} onClick={handleLinkClick} className="footer-link">{l.label}</Link></li>
              ))}
              <li>
                <Link to="/internship-status" onClick={handleLinkClick} style={{ color: "var(--color-secondary)", fontWeight: 700 }}>
                  🔍 Track Status / Print Invoice
                </Link>
              </li>
            </ul>
          </FooterSection>

          {/* Governance Col — collapsible on mobile */}
          <FooterSection title="Governance">
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.875rem", paddingLeft: 0 }}>
              <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Shield size={12} className="footer-icon-muted" />
                <span className="footer-link-static">Section 8 NITI Aayog</span>
              </li>
              <li className="footer-link-static">Reg. No: U88900MP2023NPL068178</li>
              <li><Link to="/about" onClick={handleLinkClick} className="footer-link">Foundation Overview</Link></li>
              <li><Link to="/privacy" onClick={handleLinkClick} className="footer-link">Privacy Policy</Link></li>
              <li><Link to="/terms" onClick={handleLinkClick} className="footer-link">Terms &amp; Conditions</Link></li>
              <li><Link to="/refund" onClick={handleLinkClick} className="footer-link">Refund Policy</Link></li>
            </ul>
          </FooterSection>

        </div>

        {/* Divider */}
        <hr className="footer-hr" />

        {/* Footer strip */}
        <div className="footer-strip" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <p className="footer-copyright">© 2022 DAY Foundation (BHTDAY Welfare Foundation). All Rights Reserved.</p>
          
          <div style={{ display: "flex", alignItems: "center", gap: "1.2rem", flexWrap: "wrap" }}>
            <a href="mailto:info@dayfoundation.in" className="footer-meta-link">
              <Mail size={12} />
              <span>info@dayfoundation.in</span>
            </a>
            <span className="footer-meta-link">
              <MapPin size={12} />
              <span>Jabalpur, Madhya Pradesh, India</span>
            </span>
          </div>
        </div>

      </div>

      {/* Footer CSS */}
      <style>{`
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 3rem;
        }

        .footer-section-toggle {
          display: none;
          width: 100%;
          background: none;
          border: none;
          cursor: pointer;
          padding: 1rem 0;
          text-align: left;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--color-border-light, rgba(40,24,8,0.08));
        }

        .footer-section-body {
          padding-top: 1.25rem;
        }

        /* Desktop: show headings normally */
        @media (min-width: 769px) {
          .footer-section-wrap > .footer-section-toggle {
            display: flex;
            pointer-events: none;
          }
          .footer-section-toggle svg { display: none; }
          .footer-section-body { display: block !important; }
        }

        /* Mobile: grid becomes 1 col, sections collapse */
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 0;
          }
          .footer-brand-col {
            padding-bottom: 1.5rem;
            border-bottom: 1px solid var(--color-border-light, rgba(40,24,8,0.08));
            margin-bottom: 0;
          }
          .footer-section-toggle {
            display: flex;
          }
          .footer-section-body {
            display: none;
            padding-top: 0.75rem;
            padding-bottom: 1rem;
          }
          .footer-section-body.open {
            display: block;
          }
          .footer-strip {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
