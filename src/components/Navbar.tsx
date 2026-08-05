import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { Sun, Moon, Menu, X, Heart, ChevronDown } from "lucide-react";
import "../styles/navbar.css";

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return sessionStorage.getItem("day_dark_mode_session") === "true";
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
      sessionStorage.setItem("day_dark_mode_session", "true");
    } else {
      document.body.classList.remove("dark-mode");
      sessionStorage.setItem("day_dark_mode_session", "false");
    }
    localStorage.setItem("day_dark_mode", String(darkMode));
  }, [darkMode]);

  // Prevent background scrolling when mobile menu drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);


  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleNavLinkClick = () => {
    closeMobileMenu();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const navLinks: (
    | { path: string; label: string; isDropdown?: never; items?: never }
    | { label: string; isDropdown: boolean; items: { path: string; label: string }[]; path?: never }
  )[] = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About Us" },
    { 
      label: "Mission & Programs", 
      isDropdown: true,
      items: [
        { path: "/mission", label: "Our Mission" },
        { path: "/programs", label: "Programs" }
      ]
    },
    { 
      label: "Blogs & Events", 
      isDropdown: true,
      items: [
        { path: "/blogs", label: "Blogs" },
        { path: "/events", label: "Events" }
      ]
    },
    { path: "/gallery", label: "Gallery" },
    { 
      label: "Join Us", 
      isDropdown: true,
      items: [
        { path: "/volunteer", label: "Volunteer" },
        { path: "/internship", label: "Internship" }
      ]
    },
    { path: "/contact", label: "Contact Us" }
  ];

  return (
    <>
      <header className={`header-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="container-custom nav-container">
          <Link to="/" className="nav-logo" onClick={handleNavLinkClick}>
            <img src="/logo.png" alt="DAY Foundation Logo" />
            <span className="nav-logo-text">DAY Foundation</span>
          </Link>

          {/* Desktop Navigation Links */}
          <ul className="nav-links">
            {navLinks.map((link) => {
              if (link.isDropdown) {
                return (
                  <li key={link.label} className="nav-item-dropdown">
                    <span className="nav-link nav-dropdown-trigger">
                      <span>{link.label}</span>
                      <ChevronDown size={12} className="dropdown-arrow-icon" />
                    </span>
                    <ul className="nav-dropdown-menu">
                      {link.items.map((sublink) => (
                        <li key={sublink.path}>
                          <NavLink 
                            to={sublink.path} 
                            className={({ isActive }) => `nav-dropdown-item ${isActive ? "active" : ""}`}
                            onClick={handleNavLinkClick}
                          >
                            {sublink.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              }
              return (
                <li key={link.path || link.label}>
                  <NavLink 
                    to={link.path!} 
                    className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                    onClick={handleNavLinkClick}
                  >
                    {link.label}
                  </NavLink>
                </li>
              );
            })}
          </ul>

          <div className="nav-actions">


            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleDarkMode} 
              className="theme-toggle-btn"
              aria-label="Toggle visual theme"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Donate CTA button (Desktop) */}
            <Link to="/donate" className="btn btn-primary nav-donate-desktop" onClick={handleNavLinkClick}>
              <Heart size={14} className="fill-current" />
              <span>Donate</span>
            </Link>

            {/* Mobile Hamburger menu */}
            <button 
              className="mobile-nav-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <div className={`mobile-nav-backdrop ${mobileMenuOpen ? "open" : ""}`} onClick={closeMobileMenu}></div>
      <div className={`mobile-nav-menu ${mobileMenuOpen ? "open" : ""}`}>
        <ul className="mobile-nav-links">
          {navLinks.map((link) => {
            if (link.isDropdown) {
              return (
                <li key={link.label} className="mobile-dropdown-group">
                  <span className="mobile-dropdown-label">{link.label}</span>
                  <ul className="mobile-dropdown-sublinks">
                    {link.items.map((sublink) => (
                      <li key={sublink.path}>
                        <NavLink 
                          to={sublink.path} 
                          className={({ isActive }) => `mobile-nav-sublink ${isActive ? "active" : ""}`}
                          onClick={handleNavLinkClick}
                        >
                          {sublink.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            }
            return (
              <li key={link.path || link.label}>
                <NavLink 
                  to={link.path!} 
                  className={({ isActive }) => `mobile-nav-link ${isActive ? "active" : ""}`}
                  onClick={handleNavLinkClick}
                >
                  {link.label}
                </NavLink>
              </li>
            );
          })}
          
          <li className="mobile-theme-actions" style={{ marginTop: "1.5rem" }}>
            <button 
              onClick={toggleDarkMode} 
              className="theme-toggle-btn mobile-theme-btn"
              aria-label="Toggle visual theme"
              style={{ width: "100%" }}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>{darkMode ? "Light Mode" : "Dark Mode"}</span>
            </button>
          </li>

          <li style={{ marginTop: "1rem" }}>
            <Link to="/donate" className="btn btn-primary" style={{ width: "100%" }} onClick={handleNavLinkClick}>
              <Heart size={16} className="fill-current" />
              <span>Donate Now</span>
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
};
export default Navbar;
