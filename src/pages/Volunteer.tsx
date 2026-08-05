import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createVolunteer } from "../firebase/services";
import { sanitizeFormData } from "../utils/security";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader, ArrowRight, Heart, Search } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import "../styles/pages.css";

export const Volunteer: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    currentDate: new Date().toISOString().split("T")[0],
    dob: "",
    fatherName: "",
    motherName: "",
    city: "Delhi",
    age: 18,
    aadharNumber: "",
    preferredMode: "hybrid",
    motivation: "",
    type: "volunteer" as const
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [ticketNo, setTicketNo] = useState<string>("");
  const [subscribeNewsletterOptIn, setSubscribeNewsletterOptIn] = useState<boolean>(true);

  const cities = ["Delhi", "Indore", "Jabalpur", "Others"];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      let calculatedAge = prev.age;
      if (name === "dob" && value) {
        const birthDate = new Date(value);
        const today = new Date();
        calculatedAge = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          calculatedAge--;
        }
      }
      return {
        ...prev,
        [name]: value,
        age: calculatedAge >= 0 ? calculatedAge : 0
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const sanitizedData = sanitizeFormData(formData);

    if (!sanitizedData.name.trim() || !sanitizedData.email.trim() || !sanitizedData.phone.trim()) {
      setError("Please complete all required fields (*).");
      setLoading(false);
      return;
    }

    try {
      const res = await createVolunteer({
        ...sanitizedData,
        city: sanitizedData.city || "Delhi",
        age: Number(sanitizedData.age) || 18,
        preferredMode: sanitizedData.preferredMode as 'online' | 'offline' | 'hybrid',
        type: 'volunteer'
      });

      const generatedTicket = res.ticketNo || res.tempInternshipId || "VOL-DAY-2026";
      setTicketNo(generatedTicket);
      setSubmitted(true);

      try {
        const { syncWithGoogleSheets } = await import("../services/googleSheetsService");
        await syncWithGoogleSheets({
          ...sanitizedData,
          type: "volunteer",
          ticketNo: generatedTicket,
          status: "pending"
        });
      } catch (sheetErr) {
        console.error("Failed to sync volunteer with Google Sheets:", sheetErr);
      }

      try {
        const { sendSubmissionConfirmation, sendAdminNotification } = await import("../services/emailService");
        await sendSubmissionConfirmation({
          email: sanitizedData.email,
          name: sanitizedData.name,
          type: 'volunteer',
          tempId: generatedTicket
        });

        await sendAdminNotification('volunteer_application', {
          type: 'volunteer',
          name: sanitizedData.name,
          email: sanitizedData.email,
          phone: sanitizedData.phone,
          city: sanitizedData.city,
          ticketNo: generatedTicket
        });
      } catch (emailErr) {
        console.error("Failed to send email notifications:", emailErr);
      }

      if (subscribeNewsletterOptIn && sanitizedData.email) {
        try {
          const { subscribeNewsletter } = await import("../firebase/services");
          await subscribeNewsletter(sanitizedData.email);
        } catch (subErr) {
          // Ignore if already subscribed
        }
      }

      setFormData({
        name: "",
        email: "",
        phone: "",
        currentDate: new Date().toISOString().split("T")[0],
        dob: "",
        fatherName: "",
        motherName: "",
        city: "Delhi",
        age: 18,
        aadharNumber: "",
        preferredMode: "hybrid",
        motivation: "",
        type: "volunteer"
      });
    } catch (err: unknown) {
      console.error("Volunteer registration error.", err);
      setError("Failed to submit your application. Please check your network and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{ minHeight: "100vh", backgroundColor: "var(--color-bg-gray)" }}
    >
      {/* Header section */}
      <section className="subpage-hero">
        <div className="container-custom" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <span className="badge-custom">Join Our Movement</span>
          <h1 className="subpage-hero-title">Become a Volunteer</h1>
          <p className="subpage-hero-desc">
            Directly contribute your skills, time, and heart to community transformation. Together, we build last-mile impact across India.
          </p>
          <div style={{ marginTop: "1.25rem" }}>
            <Link 
              to="/internship-status" 
              className="btn btn-outline" 
              style={{ fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "8px", border: "1.5px solid var(--color-primary)", color: "var(--color-primary)", padding: "0.55rem 1.35rem", backgroundColor: "rgba(255,255,255,0.8)", fontWeight: 700 }}
            >
              <Search size={16} />
              <span>Track Application Status</span>
            </Link>
          </div>
        </div>
      </section>


      {/* Why Join Us & Values */}
      <section className="section-padding" style={{ backgroundColor: "var(--color-bg-cream)", borderBottom: "1px solid var(--color-border-light)" }}>
        <div className="container-custom">
          <div className="grid-2">
            
            {/* Why Join Us card */}
            <div className="premium-card" style={{ padding: "2.5rem", backgroundColor: "var(--color-bg-white)" }}>
              <span className="badge-custom">GET INVOLVED</span>
              <h3 style={{ fontSize: "1.75rem", color: "var(--color-primary)", marginTop: "0.5rem", marginBottom: "1rem" }}>Why Join Us?</h3>
              <p style={{ color: "var(--color-text-muted)", lineHeight: "1.7", fontSize: "0.95rem", margin: 0 }}>
                Become a part of a passionate team working to create positive social impact through education, healthcare, community engagement, and youth empowerment. We offer on-ground leadership roles, direct community exposure, and structured teamwork.
              </p>
            </div>

            {/* Our Values card */}
            <div className="premium-card values-culture-card" style={{ padding: "2.5rem", backgroundColor: "var(--color-bg-white)" }}>
              <span className="badge-custom">OUR CULTURE</span>
              <h3 style={{ fontSize: "1.75rem", color: "#68696B", marginTop: "0.5rem", marginBottom: "1rem" }}>Our Values</h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.9rem", color: "#68696B" }}>
                <li style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                  <span style={{ color: "#68696B", fontWeight: 800 }}>•</span>
                  <span style={{ color: "#68696B" }}>We respect all castes, religions, cultures, and sexual orientations.</span>
                </li>
                <li style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                  <span style={{ color: "#68696B", fontWeight: 800 }}>•</span>
                  <span style={{ color: "#68696B" }}>We believe in creating an inclusive, safe, and welcoming environment for everyone.</span>
                </li>
                <li style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                  <span style={{ color: "#68696B", fontWeight: 800 }}>•</span>
                  <span style={{ color: "#68696B" }}>Every volunteer is treated with dignity and respect.</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Departments & Activities */}
      <section className="section-padding" style={{ backgroundColor: "var(--color-bg-white)", borderBottom: "1px solid var(--color-border-light)" }}>
        <div className="container-custom">
          <div className="grid-2">
            
            {/* Departments */}
            <div>
              <span className="badge-custom">CHOOSE YOUR PATH</span>
              <h3 style={{ fontSize: "1.75rem", color: "var(--color-primary)", marginTop: "0.5rem", marginBottom: "1.5rem" }}>Our Departments</h3>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                Choose a department based on your interests and skills:
              </p>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                {[
                  "Logistics", "Creative", "Education", "Public Relations (PR)", 
                  "Human Resources (HR)", "Social Media Handling (SMH)", "Healthcare"
                ].map(dept => (
                  <div key={dept} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0.75rem 1rem", backgroundColor: "var(--color-bg-gray)", borderRadius: "10px", fontSize: "0.85rem", fontWeight: "700", color: "var(--color-primary)" }}>
                    <span style={{ color: "var(--color-secondary)" }}>✔</span> {dept}
                  </div>
                ))}
              </div>
            </div>

            {/* Volunteer Activities */}
            <div>
              <span className="badge-custom">ENGAGEMENTS</span>
              <h3 style={{ fontSize: "1.75rem", color: "var(--color-primary)", marginTop: "0.5rem", marginBottom: "1.5rem" }}>Volunteer Activities</h3>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                As a volunteer, you may participate in:
              </p>
              
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                <li style={{ display: "flex", gap: "10px" }}>
                  <span style={{ color: "var(--color-secondary)" }}>▪</span>
                  <span><strong>Education Drives</strong> – Every Sunday morning</span>
                </li>
                <li style={{ display: "flex", gap: "10px" }}>
                  <span style={{ color: "var(--color-secondary)" }}>▪</span>
                  <span><strong>Healthcare Camps</strong> – Regular monthly health initiatives</span>
                </li>
                <li style={{ display: "flex", gap: "10px" }}>
                  <span style={{ color: "var(--color-secondary)" }}>▪</span>
                  <span><strong>Online Awareness Webinars</strong></span>
                </li>
                <li style={{ display: "flex", gap: "10px" }}>
                  <span style={{ color: "var(--color-secondary)" }}>▪</span>
                  <span><strong>Community Engagement Events</strong> – Organized on alternate months</span>
                </li>
                <li style={{ display: "flex", gap: "10px" }}>
                  <span style={{ color: "var(--color-secondary)" }}>▪</span>
                  <span><strong>Special campaigns and celebrations</strong> such as DAY Utsav, DAY Carnival, Pride Month, Diwali DAY Wali, and more</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Professional Working Culture */}
      <section className="section-padding" style={{ backgroundColor: "var(--color-bg-cream)", borderBottom: "1px solid var(--color-border-light)" }}>
        <div className="container-custom">
          <div className="premium-card values-culture-card" style={{ padding: "3rem", borderLeft: "4px solid #68696B", backgroundColor: "var(--color-bg-white)", maxWidth: "800px", margin: "0 auto" }}>
            <h3 style={{ fontSize: "1.75rem", color: "#68696B", marginBottom: "1.5rem" }}>Professional Working Culture</h3>
            <div className="grid-2">
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", fontSize: "0.875rem", color: "#68696B" }}>
                  <span style={{ color: "#68696B", fontWeight: "bold" }}>✔</span>
                  <span style={{ color: "#68696B" }}>Volunteers work under a structured management system.</span>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", fontSize: "0.875rem", color: "#68696B" }}>
                  <span style={{ color: "#68696B", fontWeight: "bold" }}>✔</span>
                  <span style={{ color: "#68696B" }}>Clear roles and responsibilities are assigned to every department.</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", fontSize: "0.875rem", color: "#68696B" }}>
                  <span style={{ color: "#68696B", fontWeight: "bold" }}>✔</span>
                  <span style={{ color: "#68696B" }}>Adherence to our bylaws, code of conduct, and organizational policies is essential.</span>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", fontSize: "0.875rem", color: "#68696B" }}>
                  <span style={{ color: "#68696B", fontWeight: "bold" }}>✔</span>
                  <span style={{ color: "#68696B" }}>Discipline, accountability, and teamwork help us deliver better outcomes for the children and communities we serve.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hiring Process */}
      <section className="section-padding" style={{ backgroundColor: "var(--color-bg-white)", borderBottom: "1px solid var(--color-border-light)" }}>
        <div className="container-custom">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span className="badge-custom">ONBOARDING STEPS</span>
            <h2 className="section-title">Our Hiring Process</h2>
            <p className="section-subtitle">A simple 5-step roadmap detailing candidate screening and placement cycles.</p>
          </div>

          <div className="grid-5">
            {[
              { num: "1", title: "📝 Apply", desc: "Fill out the volunteer application form below with authentic details." },
              { num: "2", title: "📞 Screening", desc: "Our Hiring Team conducts recruitment 3 times a month, with each hiring cycle lasting around 10 days." },
              { num: "3", title: "🎯 Orientation", desc: "Shortlisted candidates attend an orientation session to understand our mission and work culture." },
              { num: "4", title: "🏢 Department Allocation", desc: "Volunteers are assigned to a department based on their interests and skills." },
              { num: "5", title: "🤝 Onboarding", desc: "Once selected, the onboarding process begins and you can start your journey with DAY Foundation." }
            ].map(step => (
              <div key={step.num} className="premium-card" style={{ padding: "1.5rem", position: "relative", borderTop: "3px solid var(--color-secondary)" }}>
                <span style={{ position: "absolute", top: "10px", right: "15px", fontSize: "2.5rem", fontWeight: "800", color: "rgba(252,78,30,0.06)", userSelect: "none" }}>{step.num}</span>
                <h4 style={{ fontSize: "1.05rem", color: "var(--color-primary)", fontWeight: "800", marginBottom: "0.5rem" }}>{step.title}</h4>
                <p style={{ fontSize: "0.825rem", color: "var(--color-text-muted)", lineHeight: "1.6", margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "2.5rem", fontSize: "0.85rem", color: "var(--color-text-muted)", fontWeight: "bold" }}>
            💡 Note: After submitting your application, kindly wait for our Hiring Team to contact you. Responses are provided according to the scheduled hiring cycle.
          </div>
        </div>
      </section>

      {/* Form section */}
      <section className="section-padding">
        <div className="container-custom">
          
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="premium-card premium-form-card volunteer-form-gray-card"
                style={{ backgroundColor: "#383532", border: "1px solid rgba(255,255,255,0.15)", color: "#FFFFFF", maxWidth: "800px", marginInline: "auto" }}
              >
                <div style={{ marginBottom: "2rem", borderBottom: "1px solid rgba(255,255,255,0.15)", paddingBottom: "1.5rem" }}>
                  <h2 style={{ fontSize: "1.5rem", color: "#FC4E1E", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Heart size={22} color="#FC4E1E" style={{ color: "#FC4E1E" }} className="fill-current" />
                    <span style={{ color: "#FC4E1E" }}>Volunteer Registration Form</span>
                  </h2>
                  <p className="form-subtitle-adaptive" style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
                    Please fill in your authentic details below. A coordinator from your selected city will contact you.
                  </p>
                </div>

                {error && (
                  <div style={{ padding: "1rem", backgroundColor: "rgba(252, 78, 30, 0.08)", border: "1px solid rgba(252, 78, 30, 0.2)", borderRadius: "8px", color: "var(--color-secondary-dark)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Row 1: Name & Email */}
                  <div className="form-group-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="name">Full Name / Detail Name *</label>
                      <input 
                        type="text" 
                        id="name" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        required 
                        placeholder="e.g. Aman Verma"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="email">Email Address *</label>
                      <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        required 
                        placeholder="e.g. aman@gmail.com"
                        className="form-input"
                      />
                    </div>
                  </div>

                  {/* Row 2: Phone (WhatsApp Only) & Current Date */}
                  <div className="form-group-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="phone">Phone Number (WhatsApp Only) *</label>
                      <input 
                        type="tel" 
                        id="phone" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleChange} 
                        required 
                        placeholder="10-digit mobile number"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="currentDate">Current Date</label>
                      <input 
                        type="date" 
                        id="currentDate" 
                        name="currentDate" 
                        value={formData.currentDate} 
                        readOnly 
                        disabled
                        className="form-input"
                        style={{ backgroundColor: "var(--color-bg-gray)", cursor: "not-allowed" }}
                      />
                    </div>
                  </div>

                  {/* Row 3: DOB & Age */}
                  <div className="form-group-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="dob">Date of Birth *</label>
                      <input 
                        type="date" 
                        id="dob" 
                        name="dob" 
                        value={formData.dob} 
                        onChange={handleChange} 
                        required 
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="age">Age *</label>
                      <input 
                        type="number" 
                        id="age" 
                        name="age" 
                        value={formData.age} 
                        onChange={handleChange} 
                        required 
                        min={15}
                        max={99}
                        className="form-input"
                      />
                    </div>
                  </div>

                  {/* Row 4: Father's Name & Mother's Name */}
                  <div className="form-group-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="fatherName">Father's Name *</label>
                      <input 
                        type="text" 
                        id="fatherName" 
                        name="fatherName" 
                        value={formData.fatherName} 
                        onChange={handleChange} 
                        required 
                        placeholder="Father's full name"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="motherName">Mother's Name *</label>
                      <input 
                        type="text" 
                        id="motherName" 
                        name="motherName" 
                        value={formData.motherName} 
                        onChange={handleChange} 
                        required 
                        placeholder="Mother's full name"
                        className="form-input"
                      />
                    </div>
                  </div>

                  {/* Row 5: Active City & Aadhar Number */}
                  <div className="form-group-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="city">Active City *</label>
                      <select 
                        id="city" 
                        name="city" 
                        value={formData.city} 
                        onChange={handleChange}
                        className="form-select"
                      >
                        {cities.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="aadharNumber">Aadhar Number *</label>
                      <input 
                        type="text" 
                        id="aadharNumber" 
                        name="aadharNumber" 
                        value={formData.aadharNumber} 
                        onChange={handleChange} 
                        required 
                        pattern="[0-9]{12}"
                        maxLength={12}
                        placeholder="12-digit Aadhar number"
                        className="form-input"
                      />
                    </div>
                  </div>

                  {/* Row 6: Preferred Mode of Volunteering */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="preferredMode">Preferred Mode of Volunteering *</label>
                    <select 
                      id="preferredMode" 
                      name="preferredMode" 
                      value={formData.preferredMode} 
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="in-person/offline">In-person / Offline</option>
                      <option value="remote/online">Remote / Online</option>
                      <option value="hybrid">Hybrid (both in-person and online)</option>
                    </select>
                  </div>

                  {/* Row 7: Motivation Letter */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="motivation">Motivation Letter *</label>
                    <textarea 
                      id="motivation" 
                      name="motivation" 
                      value={formData.motivation} 
                      onChange={handleChange} 
                      required 
                      rows={5}
                      placeholder="Why do you want to join BHTDAY Welfare Foundation as a volunteer? Mention any skills, past social work, or campaign preferences."
                      className="form-textarea"
                    ></textarea>
                  </div>

                  <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "1.5rem", padding: "0.85rem 1.1rem", backgroundColor: "rgba(252, 78, 30, 0.06)", borderRadius: "12px", border: "1px solid rgba(252, 78, 30, 0.2)" }}>
                    <input 
                      type="checkbox" 
                      id="bylawAgree" 
                      required 
                      style={{ cursor: "pointer", width: "18px", height: "18px", flexShrink: 0, accentColor: "var(--color-secondary)" }}
                    />
                    <label htmlFor="bylawAgree" style={{ fontSize: "0.875rem", cursor: "pointer", lineHeight: "1.5", fontWeight: "600" }} className="bylaw-agree-label">
                      I agree to abide by the BHTDAY Welfare Foundation <Link to="/terms" target="_blank" rel="noopener noreferrer" style={{ color: "#FC4E1E", textDecoration: "underline" }} onClick={(e) => e.stopPropagation()}>Terms &amp; Conditions</Link>, Bylaws, code of conduct, and volunteer guidelines.
                    </label>
                  </div>

                  <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "1.5rem", padding: "0.85rem 1.1rem", backgroundColor: "rgba(255, 255, 255, 0.05)", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.15)" }}>
                    <input 
                      type="checkbox" 
                      id="newsletterOptIn" 
                      checked={subscribeNewsletterOptIn}
                      onChange={(e) => setSubscribeNewsletterOptIn(e.target.checked)}
                      style={{ cursor: "pointer", width: "18px", height: "18px", flexShrink: 0, accentColor: "#FC4E1E" }}
                    />
                    <label htmlFor="newsletterOptIn" style={{ fontSize: "0.875rem", cursor: "pointer", lineHeight: "1.5", fontWeight: "500" }}>
                      Subscribe to DAY Foundation Newsletter (Optional — receive updates on impact drives &amp; community campaigns)
                    </label>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="btn btn-primary donate-submit-btn"
                    style={{ width: "100%", marginTop: "1.5rem" }}
                  >
                    {loading ? (
                      <>
                        <Loader className="animate-spin" size={18} />
                        <span>Submitting Application...</span>
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        <span>Submit Volunteer Application</span>
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="premium-card premium-form-card"
                style={{ textAlign: "center", padding: "4rem 2rem", backgroundColor: "var(--color-bg-white)", border: "1px solid var(--color-border-light)", maxWidth: "600px", marginInline: "auto" }}
              >
                <div style={{ width: "180px", height: "180px", margin: "0 auto 1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <DotLottieReact
                    src="https://lottie.host/6cd5a294-ff1e-492b-88fd-4050680b4097/7tYpihZN1T.lottie"
                    loop
                    autoplay
                    style={{ width: "100%", height: "100%" }}
                  />
                </div>
                
                <h2 style={{ fontSize: "1.75rem", color: "var(--color-primary)", marginBottom: "1rem" }}>Application Submitted!</h2>
                
                <p style={{ color: "var(--color-text-muted)", lineHeight: "1.7", marginBottom: "1.5rem", maxWidth: "480px", marginInline: "auto" }}>
                  Thank you for registering. BHTDAY Welfare Foundation coordinates youth networks weekly. A local city coordinator will review your motivation letter and contact you via email or phone within 3-5 working days.
                </p>

                {ticketNo && (
                  <div style={{ background: "linear-gradient(135deg, var(--color-primary-light), rgba(0,169,157,0.08))", border: "2px dashed var(--color-primary)", borderRadius: "16px", padding: "1.5rem", marginBottom: "2rem", maxWidth: "480px", marginInline: "auto" }}>
                    <p style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>🆔 Your Volunteer Ticket Number</p>
                    <p style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--color-primary)", fontFamily: "monospace", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>{ticketNo}</p>
                    <p style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", lineHeight: 1.5, margin: 0 }}>
                      📌 Save this ticket number! Use it to track your application status at <strong>/internship-status</strong>.
                    </p>
                  </div>
                )}

                <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="btn btn-outline"
                    style={{ padding: "0.6rem 1.5rem", fontSize: "0.875rem" }}
                  >
                    Submit Another Application
                  </button>
                  <Link 
                    to="/"
                    className="btn btn-primary"
                    style={{ padding: "0.6rem 1.5rem", fontSize: "0.875rem" }}
                  >
                    <span>Back to Home</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </section>
    </motion.div>
  );
};

export default Volunteer;
