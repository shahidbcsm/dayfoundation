import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createVolunteer } from "../firebase/services";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader, ArrowRight, Award, Calendar, ShieldAlert, BookOpen } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import "../styles/pages.css";

export const Internship: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    currentDate: new Date().toISOString().split("T")[0],
    dob: "",
    fatherName: "",
    motherName: "",
    city: "Delhi",
    age: 20,
    aadharNumber: "",
    internshipMode: "Online",
    educationStatus: "",
    motivation: "",
    type: "internship" as const,
    college: "",
    course: "",
    year: "3rd Year",
    department: "Education"
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tempId, setTempId] = useState<string>("");
  const [internId, setInternId] = useState<string>("");
  const [subscribeNewsletterOptIn, setSubscribeNewsletterOptIn] = useState<boolean>(true);

  const cities = ["Delhi", "Indore", "Jabalpur", "Others"];
  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Post Graduate"];
  const departments = [
    "Education & Slum School Teaching",
    "Healthcare & Care Camp Coordination",
    "Logistics & Drive Management",
    "PR & Marketing",
    "Social Media & Content Creation",
    "Creative & Graphic Design",
    "Corporate & Sponsorships",
    "Human Resources (HR)",
    "Legal & Advisory"
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      let calculatedAge = prev.age;
      if (name === "dob" && value) {
        const birthDate = new Date(value);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        calculatedAge = age >= 0 ? age : 0;
      }
      return {
        ...prev,
        [name]: name === "age" ? Number(value) : value,
        age: name === "dob" ? calculatedAge : (name === "age" ? Number(value) : prev.age)
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await createVolunteer(formData);
      setTempId(result.tempInternshipId || "");
      setInternId(result.permanentInternshipId || "");
      setSubmitted(true);

      // Auto-send submission confirmation email
      try {
        const { sendSubmissionConfirmation } = await import("../services/emailService");
        await sendSubmissionConfirmation({
          email: formData.email,
          name: formData.name,
          type: "internship",
          tempId: result.tempInternshipId
        });
      } catch (emailErr) {
        console.error("Failed to send submission confirmation email:", emailErr);
      }

      // Auto-send admin notification
      try {
        const { sendAdminNotification } = await import("../services/emailService");
        await sendAdminNotification('internship_application', {
          type: "internship",
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          city: formData.city,
          ticketNo: result.tempInternshipId || ""
        });
      } catch (adminEmailErr) {
        console.error("Failed to send admin notification email:", adminEmailErr);
      }

      // Sync with Google Sheets
      try {
        const { syncWithGoogleSheets } = await import("../services/googleSheetsService");
        await syncWithGoogleSheets({
          ...formData,
          type: "internship",
          ticketNo: result.tempInternshipId || "",
          status: "pending"
        });
      } catch (sheetErr) {
        console.error("Failed to sync with Google Sheets:", sheetErr);
      }

      if (subscribeNewsletterOptIn && formData.email) {
        try {
          const { subscribeNewsletter } = await import("../firebase/services");
          await subscribeNewsletter(formData.email, "Internship Form");
        } catch {
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
        age: 20,
        aadharNumber: "",
        internshipMode: "Online",
        educationStatus: "",
        motivation: "",
        type: "internship",
        college: "",
        course: "",
        year: "3rd Year",
        department: "Education"
      });
    } catch (err: unknown) {
      console.error("Internship registration error.", err);
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
        <div className="container-custom">
          <span className="badge-custom">Summer Internship 2026</span>
          <h1 className="subpage-hero-title">Social Work Internship Program</h1>
          <p className="subpage-hero-desc">
            Apply for our structured 15-day summer internship program starting on May 30th, 2026. Build leadership, gain field experience, and drive social impact.
          </p>
          <div style={{ marginTop: "1.25rem" }}>
            <Link
              to="/internship-status"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "0.5rem 1.25rem",
                fontSize: "0.825rem",
                fontWeight: 700,
                borderRadius: "999px",
                backgroundColor: "rgba(217, 133, 78, 0.14)",
                border: "1px solid rgba(217, 133, 78, 0.35)",
                color: "#D9854E",
                textDecoration: "none",
                transition: "all 0.2s ease-in-out"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = "rgba(217, 133, 78, 0.24)";
                e.currentTarget.style.borderColor = "rgba(217, 133, 78, 0.5)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = "rgba(217, 133, 78, 0.14)";
                e.currentTarget.style.borderColor = "rgba(217, 133, 78, 0.35)";
              }}
            >
              🔍 Already applied? Check Status
            </Link>
          </div>
        </div>
      </section>

      {/* Program Details Section */}
      <section className="section-padding" style={{ backgroundColor: "var(--color-bg-cream)", borderBottom: "1px solid var(--color-border-light)" }}>
        <div className="container-custom">
          <div className="grid-2" style={{ marginBottom: "3rem" }}>
            {/* Left Box: Overview */}
            <div className="premium-card internship-detail-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem", backgroundColor: "var(--color-bg-white)", padding: "2.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--color-primary)" }}>
                <Calendar size={22} color="var(--color-primary)" />
                <h2 style={{ fontSize: "1.25rem", margin: 0, fontWeight: 700, color: "var(--color-primary)" }}>Program Parameters</h2>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.9rem" }}>
                <li style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--color-border-light)", paddingBottom: "6px", alignItems: "center" }}>
                  <span style={{ color: "var(--color-text-muted)" }}>Commencement Date:</span>
                  <strong style={{ color: "var(--color-primary)" }}>30th May 2026</strong>
                </li>
                <li style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--color-border-light)", paddingBottom: "6px", alignItems: "center" }}>
                  <span style={{ color: "var(--color-text-muted)" }}>Duration:</span>
                  <strong style={{ color: "var(--color-primary)" }}>15 Days (Structured)</strong>
                </li>
                <li style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--color-border-light)", paddingBottom: "6px", alignItems: "center" }}>
                  <span style={{ color: "var(--color-text-muted)" }}>Stipend:</span>
                  <span style={{ backgroundColor: "rgba(104, 105, 107, 0.08)", color: "var(--color-text-muted)", padding: "4px 10px", borderRadius: "8px", fontSize: "0.8rem", fontWeight: "800", border: "1px solid rgba(104, 105, 107, 0.15)" }}>Unpaid / No Stipend</span>
                </li>
                <li style={{ display: "flex", justifyContent: "space-between", paddingBottom: "6px" }}>
                  <span style={{ color: "var(--color-text-muted)" }}>Credentials Earned:</span>
                  <strong style={{ color: "var(--color-primary)", textAlign: "right" }}>Internship Certificate, Letter of Recommendation (LOR) &amp; Mentor Report</strong>
                </li>
              </ul>
            </div>

            {/* Right Box: Tasks & Focus */}
            <div className="premium-card internship-detail-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem", backgroundColor: "var(--color-bg-white)", padding: "2.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--color-primary)" }}>
                <Award size={22} color="var(--color-primary)" />
                <h2 style={{ fontSize: "1.25rem", margin: 0, fontWeight: 700, color: "var(--color-primary)" }}>Internship Tasks &amp; Focus</h2>
              </div>
              <p style={{ fontSize: "0.9rem", color: "var(--color-text-muted)", margin: 0, lineHeight: "1.6" }}>
                Interns will receive hands-on experience by working on real-world assignments. Depending on the department, tasks include:
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                {[
                  "Sponsorship research and outreach",
                  "Public relations and awareness campaigns",
                  "Crowdfunding initiatives",
                  "LinkedIn networking and professional outreach",
                  "Research and documentation",
                  "Community engagement activities",
                  "Offline social drives and event exposure"
                ].map((task) => (
                  <li key={task} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span style={{ color: "var(--color-secondary)", fontWeight: "bold" }}>✔</span>
                    <span style={{ color: "var(--color-text-muted)" }}>{task}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Internship Guidelines Alert Banner */}
          <div className="premium-card internship-detail-card" style={{ backgroundColor: "var(--color-bg-white)", border: "1px solid var(--color-border-light)", borderRadius: "24px", padding: "2.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--color-primary)", marginBottom: "1rem" }}>
              <ShieldAlert size={22} color="var(--color-primary)" />
              <h3 style={{ fontSize: "1.1rem", margin: 0, fontWeight: 700, color: "var(--color-primary)" }}>Internship Protocol &amp; Guidelines</h3>
            </div>
            
            <div className="grid-2">
              <div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                  <li style={{ display: "flex", gap: "8px" }}>
                    <span style={{ color: "var(--color-primary)", fontWeight: 800 }}>1.</span>
                    <span style={{ color: "var(--color-text-muted)" }}><strong style={{ color: "var(--color-primary)" }}>Unique Task Submissions:</strong> Each intern must attach distinct screenshots/proofs to their tasks. Duplicating work or screenshots is strictly prohibited.</span>
                  </li>
                  <li style={{ display: "flex", gap: "8px" }}>
                    <span style={{ color: "var(--color-primary)", fontWeight: 800 }}>2.</span>
                    <span style={{ color: "var(--color-text-muted)" }}><strong style={{ color: "var(--color-primary)" }}>Exclusive Articles &amp; Reports:</strong> Reports or articles requested must be unique. Plagiarism will lead to immediate cancellation of internship.</span>
                  </li>
                  <li style={{ display: "flex", gap: "8px" }}>
                    <span style={{ color: "var(--color-primary)", fontWeight: 800 }}>3.</span>
                    <span style={{ color: "var(--color-text-muted)" }}><strong style={{ color: "var(--color-primary)" }}>Completion of Tasks:</strong> All tasks must be completed fully. Incomplete tasks may result in withholding certificates and recommendations.</span>
                  </li>
                </ul>
              </div>

              <div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                  <li style={{ display: "flex", gap: "8px" }}>
                    <span style={{ color: "var(--color-primary)", fontWeight: 800 }}>4.</span>
                    <span style={{ color: "var(--color-text-muted)" }}><strong style={{ color: "var(--color-primary)" }}>Respectful Conduct:</strong> Treat team members, coordinators, slum communities, and mentors with utmost respect. Disrespect is not tolerated.</span>
                  </li>
                  <li style={{ display: "flex", gap: "8px" }}>
                    <span style={{ color: "var(--color-primary)", fontWeight: 800 }}>5.</span>
                    <span style={{ color: "var(--color-text-muted)" }}><strong style={{ color: "var(--color-primary)" }}>Mandatory Offline Backups:</strong> Interns must maintain local, offline backups of their work and drive logs for verification.</span>
                  </li>
                  <li style={{ display: "flex", gap: "8px" }}>
                    <span style={{ color: "var(--color-primary)", fontWeight: 800 }}>6.</span>
                    <span style={{ color: "var(--color-text-muted)" }}><strong style={{ color: "var(--color-primary)" }}>Invalid AI Responses:</strong> Utilizing AI-generated text or graphics for task submissions is strictly prohibited. AI-produced reports will be marked as incomplete.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values & Professional Working Culture Section */}
      <section className="section-padding" style={{ backgroundColor: "var(--color-bg-white)", borderBottom: "1px solid var(--color-border-light)" }}>
        <div className="container-custom" style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
          
          {/* Our Values card */}
          <div className="premium-card values-culture-card" style={{ padding: "2.5rem", backgroundColor: "var(--color-bg-cream)" }}>
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
                <span style={{ color: "#68696B" }}>Every intern is treated with dignity and respect.</span>
              </li>
            </ul>
          </div>

          {/* Professional Working Culture card */}
          <div className="premium-card values-culture-card" style={{ padding: "3rem", borderLeft: "4px solid #68696B", backgroundColor: "var(--color-bg-cream)" }}>
            <h3 style={{ fontSize: "1.75rem", color: "#68696B", marginBottom: "1.5rem" }}>Professional Working Culture</h3>
            <div className="grid-2">
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", fontSize: "0.875rem", color: "#68696B" }}>
                  <span style={{ color: "#68696B", fontWeight: "bold" }}>✔</span>
                  <span style={{ color: "#68696B" }}>Interns work under a structured management system.</span>
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
                className="premium-card premium-form-card internship-form-gray-card"
                style={{ backgroundColor: "#383532", border: "1px solid rgba(255,255,255,0.15)", color: "#FFFFFF", maxWidth: "800px", marginInline: "auto" }}
              >
                <div style={{ marginBottom: "2rem", borderBottom: "1px solid rgba(255,255,255,0.15)", paddingBottom: "1.5rem" }}>
                  <h2 style={{ fontSize: "1.5rem", color: "#FC4E1E", display: "flex", alignItems: "center", gap: "8px" }}>
                    <BookOpen size={22} color="#FC4E1E" style={{ color: "#FC4E1E" }} />
                    <span style={{ color: "#FC4E1E" }}>Internship Application Form</span>
                  </h2>
                  <p className="form-subtitle-adaptive" style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
                    Apply for the 15-day summer internship program. Selected candidates will be notified via email for the onboarding session.
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
                        placeholder="e.g. Kushagra Jain"
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
                        placeholder="e.g. kushagra@gmail.com"
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

                  {/* Row 6: Internship Type & Education Status */}
                  <div className="form-group-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="internshipMode">Online or Offline Internship *</label>
                      <select 
                        id="internshipMode" 
                        name="internshipMode" 
                        value={formData.internshipMode} 
                        onChange={handleChange}
                        className="form-select"
                      >
                        <option value="Online">Online</option>
                        <option value="Offline Jabalpur">Offline Jabalpur</option>
                        <option value="Offline Indore">Offline Indore</option>
                        <option value="Offline Delhi">Offline Delhi</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="educationStatus">Current Education / Occupation Status *</label>
                      <input 
                        type="text" 
                        id="educationStatus" 
                        name="educationStatus" 
                        value={formData.educationStatus} 
                        onChange={handleChange} 
                        required 
                        placeholder="e.g. B.Com Student / Graduate"
                        className="form-input"
                      />
                    </div>
                  </div>

                  {/* Row 7: College Name & Course */}
                  <div className="form-group-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="college">College / University Name *</label>
                      <input 
                        type="text" 
                        id="college" 
                        name="college" 
                        value={formData.college} 
                        onChange={handleChange} 
                        required 
                        placeholder="e.g. Delhi University"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="course">Course / Branch *</label>
                      <input 
                        type="text" 
                        id="course" 
                        name="course" 
                        value={formData.course} 
                        onChange={handleChange} 
                        required 
                        placeholder="e.g. B.Tech Computer Science / B.A. Sociology"
                        className="form-input"
                      />
                    </div>
                  </div>

                  {/* Row 8: Year of Study & Department */}
                  <div className="form-group-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="year">Year of Study *</label>
                      <select 
                        id="year" 
                        name="year" 
                        value={formData.year} 
                        onChange={handleChange}
                        className="form-select"
                      >
                        {years.map(yr => (
                          <option key={yr} value={yr}>{yr}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="department">Preferred Department *</label>
                      <select 
                        id="department" 
                        name="department" 
                        value={formData.department} 
                        onChange={handleChange}
                        className="form-select"
                      >
                        {departments.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Motivation Textarea */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="motivation">Motivation &amp; Relevant Experience *</label>
                    <textarea 
                      id="motivation" 
                      name="motivation" 
                      value={formData.motivation} 
                      onChange={handleChange} 
                      required 
                      rows={5}
                      placeholder="Why do you want to intern with BHTDAY Welfare Foundation? Mention any skills, past campaign planning, or why you'd like to work in your selected department."
                      className="form-textarea"
                    ></textarea>
                  </div>

                  {/* AI & Plagiarism check agreement checkbox */}
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "1.25rem" }}>
                    <input 
                      type="checkbox" 
                      id="guidelineAgree" 
                      required 
                      style={{ marginTop: "4px", cursor: "pointer" }}
                    />
                    <label htmlFor="guidelineAgree" style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", cursor: "pointer", lineHeight: "1.4" }}>
                      I agree to the BHTDAY Summer Internship protocol and <Link to="/terms" target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-secondary)", textDecoration: "underline" }} onClick={(e) => e.stopPropagation()}>Terms &amp; Conditions</Link>. I understand that utilizing AI-generated responses for tasks or duplicating screenshot submissions is strictly prohibited and will lead to termination.
                    </label>
                  </div>

                  {/* Optional Newsletter Subscription Checkbox */}
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                    <input 
                      type="checkbox" 
                      id="newsletterOptIn" 
                      checked={subscribeNewsletterOptIn}
                      onChange={(e) => setSubscribeNewsletterOptIn(e.target.checked)}
                      style={{ marginTop: "4px", cursor: "pointer", accentColor: "var(--color-secondary)" }}
                    />
                    <label htmlFor="newsletterOptIn" style={{ fontSize: "0.825rem", color: "var(--color-primary)", cursor: "pointer", lineHeight: "1.4", fontWeight: "600" }}>
                      Subscribe to DAY Foundation Newsletter (Optional — receive updates on impact drives &amp; community campaigns)
                    </label>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="btn btn-primary donate-submit-btn"
                    style={{ width: "100%", marginTop: "1rem" }}
                  >
                    {loading ? (
                      <>
                        <Loader className="animate-spin" size={18} />
                        <span>Submitting Application...</span>
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        <span>Submit Internship Application</span>
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
                style={{ textAlign: "center", padding: "3rem 2rem", backgroundColor: "var(--color-bg-white)", border: "1px solid var(--color-border-light)", maxWidth: "600px", marginInline: "auto" }}
              >
                <div style={{ width: "180px", height: "180px", margin: "0 auto 1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <DotLottieReact
                    src="https://lottie.host/6cd5a294-ff1e-492b-88fd-4050680b4097/7tYpihZN1T.lottie"
                    loop
                    autoplay
                    style={{ width: "100%", height: "100%" }}
                  />
                </div>
                
                <h2 style={{ fontSize: "1.75rem", color: "var(--color-primary)", marginBottom: "1rem" }}>Internship Application Submitted!</h2>
                
                <p style={{ color: "var(--color-text-muted)", lineHeight: "1.7", marginBottom: "1.5rem", maxWidth: "480px", marginInline: "auto" }}>
                  Thank you for applying. The DAY Foundation HR &amp; Hiring team will review your application details, college credentials, and motivation statement.
                </p>

                {tempId && (
                  <div style={{ background: "linear-gradient(135deg, var(--color-primary-light), rgba(0,169,157,0.08))", border: "2px dashed var(--color-primary)", borderRadius: "16px", padding: "1.5rem", marginBottom: "1.5rem" }}>
                    <div style={{ marginBottom: "1rem" }}>
                      <p style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>🆔 Your Ticket / Application ID</p>
                      <p style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--color-primary)", fontFamily: "monospace", letterSpacing: "0.05em", margin: 0 }}>{tempId}</p>
                    </div>
                    {internId && (
                      <div style={{ borderTop: "1px solid var(--color-border-light)", paddingTop: "1rem", marginBottom: "1rem" }}>
                        <p style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>🎓 Allotted Permanent Intern ID</p>
                        <p style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--color-primary)", fontFamily: "monospace", letterSpacing: "0.05em", margin: 0 }}>{internId}</p>
                      </div>
                    )}
                    <p style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", lineHeight: 1.5, margin: 0 }}>
                      📌 Save these credentials! You can check your application review status and admin remarks at <strong>/internship-status</strong>.
                    </p>
                  </div>
                )}

                <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="btn btn-outline"
                    style={{ padding: "0.6rem 1.5rem", fontSize: "0.875rem" }}
                  >
                    Apply Again
                  </button>
                  <Link 
                    to="/internship-status"
                    className="btn btn-primary"
                    style={{ padding: "0.6rem 1.5rem", fontSize: "0.875rem" }}
                  >
                    <span>Check Status</span>
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

export default Internship;
