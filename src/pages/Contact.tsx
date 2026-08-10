import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, MapPin, Send, Loader, CheckCircle2, Share2 } from "lucide-react";
import "../styles/pages.css";

import { createContactMessage, createComplaint } from "../firebase/services";
import { sanitizeFormData } from "../utils/security";

export const Contact: React.FC = () => {
  const [formType, setFormType] = useState<'contact' | 'complaint'>('contact');

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const [complaintData, setComplaintData] = useState({
    name: "",
    email: "",
    phone: "",
    complaintType: "volunteer", // 'volunteer' | 'internship'
    membershipId: "",
    issue: ""
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [ticketNo, setTicketNo] = useState<string>("");
  const [subscribeNewsletterOptIn, setSubscribeNewsletterOptIn] = useState<boolean>(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleComplaintChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setComplaintData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const sanitizedData = sanitizeFormData(formData);
    try {
      const result = await createContactMessage(sanitizedData, 'CON');
      setTicketNo(result.ticketNo || "");
      setSubmitted(true);

      // Auto-send submission confirmation email
      try {
        const { sendSubmissionConfirmation } = await import("../services/emailService");
        await sendSubmissionConfirmation({
          email: sanitizedData.email,
          name: sanitizedData.name,
          type: "contact",
          tempId: result.ticketNo
        });
      } catch (emailErr) {
        console.error("Failed to send submission confirmation email:", emailErr);
      }

      // Auto-send admin notification
      try {
        const { sendAdminNotification } = await import("../services/emailService");
        await sendAdminNotification('contact', {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          ticketNo: result.ticketNo
        });
      } catch (adminEmailErr) {
        console.error("Failed to send admin notification email:", adminEmailErr);
      }

      if (subscribeNewsletterOptIn && sanitizedData.email) {
        try {
          const { subscribeNewsletter } = await import("../firebase/services");
          await subscribeNewsletter(sanitizedData.email, "Contact Form");
        } catch {
          // Ignore if already subscribed
        }
      }

      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      console.error("Failed to save contact message:", err);
      alert("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const sanitizedComplaint = sanitizeFormData(complaintData);
    try {
      const payload = {
        name: sanitizedComplaint.name,
        email: sanitizedComplaint.email,
        phone: sanitizedComplaint.phone,
        complaintType: sanitizedComplaint.complaintType,
        membershipId: sanitizedComplaint.membershipId,
        issue: sanitizedComplaint.issue
      };

      const result = await createComplaint(payload);
      setTicketNo(result.ticketNo || "");
      setSubmitted(true);

      // Auto-send confirmation to user
      try {
        const { sendSubmissionConfirmation } = await import("../services/emailService");
        await sendSubmissionConfirmation({
          email: complaintData.email,
          name: complaintData.name,
          type: "contact",
          tempId: result.ticketNo
        });
      } catch (emailErr) {
        console.error("Failed to send confirmation email:", emailErr);
      }

      // Auto-send admin notification
      try {
        const { sendAdminNotification } = await import("../services/emailService");
        await sendAdminNotification('complaint', {
          name: complaintData.name,
          email: complaintData.email,
          phone: complaintData.phone,
          complaintType: complaintData.complaintType,
          membershipId: complaintData.membershipId,
          issue: complaintData.issue,
          ticketNo: result.ticketNo
        });
      } catch (adminEmailErr) {
        console.error("Failed to send admin notification email:", adminEmailErr);
      }

      if (subscribeNewsletterOptIn && sanitizedComplaint.email) {
        try {
          const { subscribeNewsletter } = await import("../firebase/services");
          await subscribeNewsletter(sanitizedComplaint.email, "Complaint Form");
        } catch {
          // Ignore if already subscribed
        }
      }

      setComplaintData({ name: "", email: "", phone: "", complaintType: "volunteer", membershipId: "", issue: "" });
    } catch (err) {
      console.error("Failed to submit complaint:", err);
      alert("Failed to submit complaint. Please try again.");
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
      {/* Subpage Header */}
      <section className="subpage-hero">
        <div className="container-custom">
          <span className="badge-custom">Connect With Us</span>
          <h1 className="subpage-hero-title">We'd Love to Hear From You</h1>
          <p className="subpage-hero-desc">
            Reach out to BHTDAY Welfare Foundation for partnership inquiries, internship details, or general support queries.
          </p>
        </div>
      </section>

      {/* Grid panels */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid-2" style={{ alignItems: "start" }}>
            
            {/* 1. Contact Information Card */}
            <div className="premium-card contact-info-card gray-content-card" style={{ padding: "2.5rem", backgroundColor: "var(--color-bg-white)", border: "1px solid var(--color-border-light)", display: "flex", flexDirection: "column", gap: "2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid var(--color-border-light)", paddingBottom: "0.75rem" }}>
                <MapPin size={24} color="#FC4E1E" style={{ color: "#FC4E1E" }} />
                <h2 style={{ fontSize: "1.5rem", color: "#FC4E1E", margin: 0, fontWeight: 700 }}>
                  Contact Information
                </h2>
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "rgba(252, 78, 30, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-secondary)", flexShrink: 0 }}>
                  <Mail size={18} style={{ marginInline: "auto" }} />
                </div>
                <div style={{ width: "100%" }}>
                  <h4 style={{ fontSize: "0.95rem", color: "var(--color-primary)", fontWeight: 800, marginBottom: "0.5rem" }}>Official Email Desk</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "6px", fontSize: "0.85rem", color: "#68696B" }}>
                    <div style={{ color: "#68696B" }}><strong style={{ color: "#68696B" }}>Official/General:</strong> <a href="mailto:info@dayfoundation.in" style={{ color: "#68696B", textDecoration: "none" }}>info@dayfoundation.in</a></div>
                    <div style={{ color: "#68696B" }}><strong style={{ color: "#68696B" }}>HR Department:</strong> <a href="mailto:hr@dayfoundation.in" style={{ color: "#68696B", textDecoration: "none" }}>hr@dayfoundation.in</a></div>
                    <div style={{ color: "#68696B" }}><strong style={{ color: "#68696B" }}>Legal &amp; Communication:</strong> <a href="mailto:legal@dayfoundation.in" style={{ color: "#68696B", textDecoration: "none" }}>legal@dayfoundation.in</a></div>
                    <div style={{ color: "#68696B" }}><strong style={{ color: "#68696B" }}>Connect &amp; PR:</strong> <a href="mailto:connect@dayfoundation.in" style={{ color: "#68696B", textDecoration: "none" }}>connect@dayfoundation.in</a></div>
                    <div style={{ color: "#68696B" }}><strong style={{ color: "#68696B" }}>Volunteer Support:</strong> <a href="mailto:volunteer@dayfoundation.in" style={{ color: "#68696B", textDecoration: "none" }}>volunteer@dayfoundation.in</a></div>
                    <div style={{ color: "#68696B" }}><strong style={{ color: "#68696B" }}>General Support:</strong> <a href="mailto:support@dayfoundation.in" style={{ color: "#68696B", textDecoration: "none" }}>support@dayfoundation.in</a></div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "rgba(252, 78, 30, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-secondary)", flexShrink: 0 }}>
                  <Phone size={18} style={{ marginInline: "auto" }} />
                </div>
                <div>
                  <h4 style={{ fontSize: "0.95rem", color: "var(--color-primary)", fontWeight: 800 }}>Support &amp; Emergency Mobiles</h4>
                  <div><strong style={{ color: "#68696B" }}>Contact Number:</strong> <a href="tel:+918982144416" style={{ fontSize: "0.9rem", color: "#68696B" }}>+91 89821 44416</a></div>
                  <div><strong style={{ color: "#68696B" }}>Emergency Contact:</strong> <a href="tel:+916265114416" style={{ fontSize: "0.9rem", color: "#68696B" }}>+91 62651 14416</a></div>
                  <p style={{ fontSize: "0.75rem", color: "#68696B", marginTop: "0.25rem" }}>Monday - Saturday (10 AM to 6 PM)</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "rgba(252, 78, 30, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-secondary)", flexShrink: 0 }}>
                  <MapPin size={18} style={{ marginInline: "auto" }} />
                </div>
                <div>
                  <h4 style={{ fontSize: "0.95rem", color: "var(--color-primary)", fontWeight: 800 }}>Registered Address</h4>
                  <p style={{ fontSize: "0.9rem", color: "#68696B", lineHeight: "1.5" }}>
                    C/O Maharajpur Adhartal, 2 Patel Nagar, Ankita Parisar, Jabalpur - 482004, Madhya Pradesh, India.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "rgba(252, 78, 30, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-secondary)", flexShrink: 0 }}>
                  <Share2 size={18} style={{ marginInline: "auto" }} />
                </div>
                <div style={{ width: "100%" }}>
                  <h4 style={{ fontSize: "0.95rem", color: "var(--color-primary)", fontWeight: 800, marginBottom: "0.5rem" }}>Official Social Channels</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.85rem", color: "#68696B" }}>
                    <div style={{ color: "#68696B" }}><strong style={{ color: "#68696B" }}>LinkedIn:</strong> <a href="https://www.linkedin.com/company/day-foundation" target="_blank" rel="noopener noreferrer" style={{ color: "#68696B", textDecoration: "none" }}>dayfoundation (LinkedIn)</a></div>
                    <div style={{ color: "#68696B" }}><strong style={{ color: "#68696B" }}>WhatsApp Channel:</strong> <a href="https://www.whatsapp.com/channel/0029VaSrBkW4Y9lsGYcgPn0E" target="_blank" rel="noopener noreferrer" style={{ color: "#68696B", textDecoration: "none" }}>Join WhatsApp Channel</a></div>
                    <div style={{ color: "#68696B" }}><strong style={{ color: "#68696B" }}>Linktree Directory:</strong> <a href="https://linktr.ee/dayfoundation" target="_blank" rel="noopener noreferrer" style={{ color: "#68696B", textDecoration: "none" }}>dayfoundation (Linktree)</a></div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Feedback Form Card */}
            <div id="contact-form-card" className="premium-card contact-form-gray-card" style={{ padding: "2.5rem", backgroundColor: "#383532", border: "1px solid rgba(255,255,255,0.15)" }}>

              <AnimatePresence mode="wait">
                {!submitted ? (
                  formType === 'contact' ? (
                    <motion.form key="form" onSubmit={handleSubmit}>
                      <h3 style={{ fontSize: "1.25rem", color: "#FC4E1E", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "8px" }}>
                        <Send size={20} color="#FC4E1E" style={{ color: "#FC4E1E" }} />
                        <span style={{ color: "#FC4E1E" }}>Send A Direct Message</span>
                      </h3>

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
                          <label className="form-label" htmlFor="email">Email *</label>
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

                      <div className="form-group">
                        <label className="form-label" htmlFor="subject">Subject *</label>
                        <input
                          type="text"
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          placeholder="Inquiry topic..."
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="message">Message Body *</label>
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={4}
                          placeholder="Write your detailed query here. We will reach back within 24 hours."
                          className="form-textarea"
                        ></textarea>
                      </div>

                      {/* Optional Newsletter Subscription Checkbox */}
                      <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginTop: "1.25rem", marginBottom: "1rem" }}>
                        <input 
                          type="checkbox" 
                          id="contactNewsletterOptIn" 
                          checked={subscribeNewsletterOptIn}
                          onChange={(e) => setSubscribeNewsletterOptIn(e.target.checked)}
                          style={{ marginTop: "3px", cursor: "pointer", accentColor: "#FC4E1E" }}
                        />
                        <label htmlFor="contactNewsletterOptIn" style={{ fontSize: "0.825rem", color: "var(--color-primary)", cursor: "pointer", lineHeight: "1.4", fontWeight: "600" }}>
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
                            <span>Sending Message...</span>
                          </>
                        ) : (
                          <>
                            <Send size={18} />
                            <span>Send Message</span>
                          </>
                        )}
                      </button>
                    </motion.form>
                  ) : (
                    <motion.form key="complaint-form" onSubmit={handleComplaintSubmit}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "8px" }}>
                        <h3 style={{ fontSize: "1.25rem", color: "#FC4E1E", margin: 0 }}>Register Complaint</h3>
                        <button
                          type="button"
                          onClick={() => { setFormType('contact'); setSubmitted(false); }}
                          style={{ fontSize: "0.85rem", color: "var(--color-secondary)", textDecoration: "underline", border: "none", cursor: "pointer", background: "none", fontWeight: 700 }}
                        >
                          Back to Message Form
                        </button>
                      </div>

                      <div className="form-group-row">
                        <div className="form-group">
                          <label className="form-label" htmlFor="comp-name">Full Name / Detail Name *</label>
                          <input
                            type="text"
                            id="comp-name"
                            name="name"
                            value={complaintData.name}
                            onChange={handleComplaintChange}
                            required
                            placeholder="e.g. Aman Verma"
                            className="form-input"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label" htmlFor="comp-email">Email *</label>
                          <input
                            type="email"
                            id="comp-email"
                            name="email"
                            value={complaintData.email}
                            onChange={handleComplaintChange}
                            required
                            placeholder="e.g. aman@gmail.com"
                            className="form-input"
                          />
                        </div>
                      </div>

                      <div className="form-group-row">
                        <div className="form-group">
                          <label className="form-label" htmlFor="comp-phone">Mobile Number *</label>
                          <input
                            type="tel"
                            id="comp-phone"
                            name="phone"
                            value={complaintData.phone}
                            onChange={handleComplaintChange}
                            required
                            placeholder="e.g. +91 98765 43210"
                            className="form-input"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label" htmlFor="membershipId">Volunteer / Intern ID *</label>
                          <input
                            type="text"
                            id="membershipId"
                            name="membershipId"
                            value={complaintData.membershipId}
                            onChange={handleComplaintChange}
                            required
                            placeholder="e.g. VOL-DAY-XXXX or DAY-INT-XXXX"
                            className="form-input"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="complaintType">I am a *</label>
                        <select
                          id="complaintType"
                          name="complaintType"
                          value={complaintData.complaintType}
                          onChange={handleComplaintChange}
                          required
                          className="form-select"
                        >
                          <option value="volunteer">Volunteer</option>
                          <option value="internship">Intern</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="issue">Issue Description *</label>
                        <textarea
                          id="issue"
                          name="issue"
                          value={complaintData.issue}
                          onChange={handleComplaintChange}
                          required
                          rows={4}
                          placeholder="Please describe the issue or complaint in detail. The management board will review it."
                          className="form-textarea"
                        ></textarea>
                      </div>

                      {/* Optional Newsletter Subscription Checkbox */}
                      <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginTop: "1.25rem", marginBottom: "1rem" }}>
                        <input 
                          type="checkbox" 
                          id="complaintNewsletterOptIn" 
                          checked={subscribeNewsletterOptIn}
                          onChange={(e) => setSubscribeNewsletterOptIn(e.target.checked)}
                          style={{ marginTop: "3px", cursor: "pointer", accentColor: "#FC4E1E" }}
                        />
                        <label htmlFor="complaintNewsletterOptIn" style={{ fontSize: "0.825rem", color: "var(--color-primary)", cursor: "pointer", lineHeight: "1.4", fontWeight: "600" }}>
                          Subscribe to DAY Foundation Newsletter (Optional — receive updates on impact drives &amp; community campaigns)
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ width: "100%", marginTop: "1rem" }}
                      >
                        {loading ? (
                          <>
                            <Loader className="animate-spin" size={18} />
                            <span>Submitting Complaint...</span>
                          </>
                        ) : (
                          <>
                            <Send size={18} />
                            <span>Submit Complaint</span>
                          </>
                        )}
                      </button>
                    </motion.form>
                  )
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ textAlign: "center", padding: "2rem 0" }}
                  >
                    <div style={{ color: "#25D366", display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
                      <CheckCircle2 size={56} className="fill-current text-white" style={{ color: "#25D366" }} />
                    </div>
                    <h3 style={{ fontSize: "1.5rem", color: "var(--color-primary)", marginBottom: "0.5rem" }}>
                      {formType === 'complaint' ? "Complaint Registered!" : "Message Dispatched!"}
                    </h3>
                    <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", lineHeight: "1.6", marginBottom: "1.5rem" }}>
                      {formType === 'complaint' 
                        ? "Your complaint has been successfully registered. The DAY administrative panel has been notified and our desk will review it shortly."
                        : "Thank you for contacting DAY Foundation. A support coordinator will review your request and get in touch with you shortly."}
                    </p>

                    {ticketNo && (
                      <div style={{ background: "linear-gradient(135deg, var(--color-primary-light), rgba(0,169,157,0.08))", border: "2px dashed var(--color-primary)", borderRadius: "12px", padding: "1.25rem", marginBottom: "1.5rem", maxWidth: "440px", marginInline: "auto" }}>
                        <p style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Your Ticket Number</p>
                        <p style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--color-primary)", fontFamily: "monospace", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>{ticketNo}</p>
                        <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", lineHeight: 1.4, margin: 0 }}>
                          Save this ticket! Track status and view admin response at <strong>/internship-status</strong>.
                        </p>
                      </div>
                    )}

                    <button onClick={() => setSubmitted(false)} className="btn btn-outline" style={{ fontSize: "0.85rem" }}>
                      {formType === 'complaint' ? "Register Another Complaint" : "Send Another Message"}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </section>

      {/* Bottom Callout to Register a Complaint */}
      <section style={{ backgroundColor: "var(--color-bg-white)", borderTop: "1px solid var(--color-border-light)", padding: "3rem 0", textAlign: "center" }}>
        <div className="container-custom">
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.95rem", marginBottom: "1.25rem", lineHeight: 1.6 }}>
            Are you a volunteer or intern currently facing an issue? You can register an official complaint here.
          </p>
          <button
            onClick={() => {
              setFormType('complaint');
              setSubmitted(false);
              setTimeout(() => {
                document.getElementById("contact-form-card")?.scrollIntoView({ behavior: "smooth", block: "center" });
              }, 100);
            }}
            className="btn btn-outline"
            style={{ paddingInline: "2rem" }}
          >
            Register a Complaint
          </button>
        </div>
      </section>
    </motion.div>
  );
};
export default Contact;
