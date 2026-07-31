import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion as motionFramer } from "framer-motion";
import { Heart, Shield, Check, Award, Printer } from "lucide-react";
import { createDonation } from "../firebase/services";
import { sanitizeFormData } from "../utils/security";
import "../styles/pages.css";

// Safe dynamic loader for Razorpay SDK
function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

export const Donate: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    purpose: "General Donation",
    internName: "",
    internId: "",
    donorType: "Donor",
    billingAddress: "",
    message: "",
  });

  const [amount, setAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isCustom, setIsCustom] = useState<boolean>(false);

  const presets = [100, 500, 1000, 5000];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePresetSelect = (val: number) => {
    setIsCustom(false);
    setAmount(val);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    setAmount(Number(e.target.value) || 0);
  };

  // Use Vite env var if provided, otherwise fall back to test publishable key
  const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_live_TIDxXsbdq9994b";

  const triggerCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedData = sanitizeFormData(formData);
    const finalAmount = isCustom ? (Number(customAmount) || 0) : amount;
    if (finalAmount < 1) {
      alert("Please enter a valid donation amount (minimum ₹1).");
      return;
    }

    const sdkLoaded = await loadRazorpay();
    if (!sdkLoaded || !window.Razorpay) {
      alert("Razorpay SDK failed to load. Please check your internet connection or browser extensions.");
      return;
    }

    if (!RAZORPAY_KEY) {
      console.error("Razorpay key missing at runtime");
      alert("Payment key not configured.");
      return;
    }

    const options = {
      key: RAZORPAY_KEY,
      amount: finalAmount * 100, // Amount in paise
      currency: "INR",
      name: "BHTDAY Welfare Foundation",
      description: `Donation for ${sanitizedData.purpose}`,
      image: "https://bhtday-foundation-33200.web.app/logo.png",
      prefill: {
        name: sanitizedData.name,
        email: sanitizedData.email,
        contact: sanitizedData.phone,
      },
      theme: {
        color: "#FC4E1E", // brand color
      },
      handler: async function (response: { razorpay_payment_id: string }) {
        const txId = response.razorpay_payment_id;
        try {
          await createDonation({
            donorName: sanitizedData.name,
            donorEmail: sanitizedData.email,
            donorPhone: sanitizedData.phone,
            amount: finalAmount,
            purpose: sanitizedData.purpose,
            transactionId: txId,
            status: "success",
            city: sanitizedData.city,
            internName: sanitizedData.internName,
            internId: sanitizedData.internId,
            donorType: sanitizedData.donorType,
            billingAddress: sanitizedData.billingAddress,
            message: sanitizedData.message,
          });

          // Sync with Google Sheets
          try {
            const { syncDonationWithSheets } = await import("../services/googleSheetsService");
            await syncDonationWithSheets({
              donorName: formData.name,
              donorEmail: formData.email,
              donorPhone: formData.phone,
              amount: finalAmount,
              purpose: formData.purpose,
              transactionId: txId,
              status: "success",
              city: formData.city,
              internName: formData.internName,
              internId: formData.internId,
              donorType: formData.donorType,
              billingAddress: formData.billingAddress,
              message: formData.message,
              isAnonymous: false // Razorpay checkout has actual donor info
            });
          } catch (sheetErr) {
            console.error("Failed to sync donation with Google Sheets:", sheetErr);
          }

          // Auto-send donation receipt via email with programmatic jsPDF attachment
          let base64Pdf: string | undefined;
          try {
            const { generateReceiptBase64 } = await import("../utils/receiptGenerator");
            base64Pdf = await generateReceiptBase64({
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              city: formData.city,
              amount: finalAmount,
              txId: txId,
              purpose: formData.purpose
            });
          } catch (pdfErr) {
            console.error("Failed to generate PDF receipt attachment:", pdfErr);
          }

          const { sendDonationReceipt, sendAdminNotification } = await import("../services/emailService");
          await sendDonationReceipt({
            donorEmail: formData.email,
            donorName: formData.name,
            amount: finalAmount,
            txId: txId,
            purpose: formData.purpose,
            pdfAttachment: base64Pdf
          });

          await sendAdminNotification('donation', {
            donorName: formData.name,
            donorEmail: formData.email,
            amount: finalAmount,
            purpose: formData.purpose,
            transactionId: txId
          });
        } catch (err) {
          console.error("Failed to save donation log to database:", err);
        }

        // Navigate to success page with query params
        navigate(
          `/donate/success?tx=${txId}&amt=${finalAmount}&name=${encodeURIComponent(
            formData.name
          )}&email=${encodeURIComponent(formData.email)}&purpose=${encodeURIComponent(
            formData.purpose
          )}&city=${encodeURIComponent(formData.city)}&phone=${encodeURIComponent(
            formData.phone
          )}&donorType=${encodeURIComponent(formData.donorType)}&billingAddress=${encodeURIComponent(
            formData.billingAddress
          )}&internName=${encodeURIComponent(formData.internName)}&internId=${encodeURIComponent(
            formData.internId
          )}&message=${encodeURIComponent(formData.message)}`
        );
      },
      modal: {
        ondismiss: function () {
          console.log("Razorpay checkout closed by user.");
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <motionFramer.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{ minHeight: "100vh", backgroundColor: "var(--color-bg-gray)" }}
    >
      {/* Subpage Header */}
      <section className="subpage-hero">
        <div className="container-custom" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <span className="badge-custom">Support Our Campaigns</span>
          <h1 className="subpage-hero-title">Rooted in Compassion, Fuelled by You</h1>
          <p className="subpage-hero-desc">
            Your generous financial support funds digital classrooms, medical supplies, and micro-business tailoring packages.
          </p>
          <div style={{ marginTop: "1.25rem" }}>
            <Link 
              to="/reprint-receipt" 
              className="btn btn-outline" 
              style={{ fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "8px", border: "1.5px solid var(--color-primary)", color: "var(--color-primary)", padding: "0.55rem 1.35rem", backgroundColor: "rgba(255,255,255,0.8)", fontWeight: 700 }}
            >
              <Printer size={16} />
              <span>Print / Reprint Invoice</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Donation panels */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid-2" style={{ alignItems: "start" }}>

            {/* 1. Value pitch Column */}
            <div style={{ padding: "1rem" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(252, 78, 30, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--color-secondary)",
                  marginBottom: "1.5rem",
                }}
              >
                <Heart size={24} className="fill-current" />
              </div>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", color: "var(--color-primary)", marginBottom: "1.5rem" }}>
                Make an Immediate Social Impact
              </h2>
              <p style={{ color: "var(--color-text-muted)", lineHeight: "1.7", marginBottom: "1.5rem" }}>
                BHTDAY Welfare Foundation runs on independent donations. Every single contribution directly supports our core missions:
              </p>

              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1rem", color: "var(--color-text-dark)", fontSize: "0.95rem" }}>
                <li style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "rgba(37, 211, 102, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-primary)" }}>
                    <Check size={14} style={{ marginInline: "auto" }} />
                  </div>
                  <span>Support Education &amp; Skill Development</span>
                </li>
                <li style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "rgba(37, 211, 102, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-primary)" }}>
                    <Check size={14} style={{ marginInline: "auto" }} />
                  </div>
                  <span>Promote Healthcare &amp; Well-being</span>
                </li>
                <li style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "rgba(37, 211, 102, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-primary)" }}>
                    <Check size={14} style={{ marginInline: "auto" }} />
                  </div>
                  <span>Strengthen Community Welfare Initiatives</span>
                </li>
                <li style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "rgba(37, 211, 102, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-primary)" }}>
                    <Check size={14} style={{ marginInline: "auto" }} />
                  </div>
                  <span>Empower Youth Through Volunteering &amp; Leadership</span>
                </li>
              </ul>

              <div
                className="glass-panel"
                style={{
                  marginTop: "3rem",
                  padding: "1.5rem",
                  display: "flex",
                  gap: "1rem",
                  alignItems: "center",
                  backgroundColor: "var(--color-bg-white)",
                  border: "1px solid var(--color-border-light)",
                }}
              >
                <Shield size={28} className="text-secondary" style={{ flexShrink: 0 }} />
                <div>
                  <h4 style={{ fontSize: "0.95rem", color: "var(--color-primary)", fontWeight: 800 }}>Fully Secure Payment Gateway</h4>
                  <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", lineHeight: "1.4" }}>
                    Payments are processed securely via industry-standard, encrypted PCI-compliant interfaces.
                  </p>
                </div>
              </div>

              <div
                className="glass-panel"
                style={{
                  marginTop: "1.5rem",
                  padding: "1.5rem",
                  display: "flex",
                  gap: "1rem",
                  alignItems: "center",
                  backgroundColor: "var(--color-bg-white)",
                  border: "1px solid var(--color-border-light)",
                }}
              >
                <Award size={28} className="text-secondary" style={{ flexShrink: 0 }} />
                <div>
                  <h4 style={{ fontSize: "0.95rem", color: "var(--color-primary)", fontWeight: 800 }}>Transparency & Accountability</h4>
                  <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", lineHeight: "1.4" }}>
                    DAY Foundation is committed to utilizing every contribution responsibly and effectively. We believe in transparency, accountability, and creating measurable impact through our programs and initiatives.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Donation Form Column */}
            <div className="premium-card" style={{ padding: "2.5rem", backgroundColor: "var(--color-bg-white)", border: "1px solid var(--color-border-light)" }}>
              <h3 style={{ fontSize: "1.5rem", color: "var(--color-primary)", marginBottom: "1.5rem", borderBottom: "1px solid var(--color-border-light)", paddingBottom: "0.75rem" }}>
                Donation Amount Selection
              </h3>

              <form onSubmit={triggerCheckout}>
                {/* Presets Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem", marginBottom: "1rem" }}>
                  {presets.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handlePresetSelect(val)}
                      className={`filter-btn ${!isCustom && amount === val ? "active" : ""}`}
                      style={{ padding: "0.6rem 0", fontSize: "0.85rem" }}
                    >
                      ₹{val}
                    </button>
                  ))}
                </div>

                {/* Custom choice */}
                <div style={{ marginBottom: "2rem" }}>
                  <button
                    type="button"
                    onClick={() => setIsCustom(true)}
                    className={`filter-btn ${isCustom ? "active" : ""}`}
                    style={{ width: "100%", marginBottom: "0.5rem" }}
                  >
                    Custom Amount Choice
                  </button>

                  {isCustom && (
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontWeight: 700, color: "var(--color-text-dark)" }}>₹</span>
                      <input
                        type="number"
                        placeholder="Enter custom sum..."
                        value={customAmount}
                        onChange={handleCustomChange}
                        required={isCustom}
                        min={1}
                        className="form-input"
                        style={{ width: "100%", paddingLeft: "28px" }}
                      />
                    </div>
                  )}
                </div>

                                <h3 style={{ fontSize: "1.25rem", color: "var(--color-primary)", marginBottom: "1rem" }}>Donor & Billing Details</h3>

                {/* Donor Type */}
                <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                  <label className="form-label" style={{ display: "block", marginBottom: "0.5rem" }}>Donor Type *</label>
                  <div style={{ display: "flex", gap: "1.5rem" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.9rem", color: "var(--color-text-dark)" }}>
                      <input 
                        type="radio" 
                        name="donorType" 
                        value="Donor" 
                        checked={formData.donorType === "Donor"} 
                        onChange={handleChange} 
                        style={{ cursor: "pointer" }}
                      />
                      <span>Donor</span>
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.9rem", color: "var(--color-text-dark)" }}>
                      <input 
                        type="radio" 
                        name="donorType" 
                        value="Volunteer" 
                        checked={formData.donorType === "Volunteer"} 
                        onChange={handleChange} 
                        style={{ cursor: "pointer" }}
                      />
                      <span>Volunteer</span>
                    </label>
                  </div>
                </div>

                {/* Purpose of Donation */}
                <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                  <label className="form-label" htmlFor="purpose">Purpose of Donation *</label>
                  <select 
                    id="purpose" 
                    name="purpose" 
                    value={formData.purpose} 
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="General Donation">General Donation</option>
                    <option value="Internship Crowdfunding">Internship Crowdfunding</option>
                    <option value="Monthly Volunteer Donation">Monthly Volunteer Donation</option>
                    <option value="Education Support">Education Support</option>
                    <option value="Healthcare Support">Healthcare Support</option>
                    <option value="Environmental Initiatives">Environmental Initiatives</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Conditional Intern Details */}
                {formData.purpose === "Internship Crowdfunding" && (
                  <div className="form-group-row" style={{ animation: "fadeIn 0.3s ease", marginBottom: "1.25rem" }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="internName">Intern Name *</label>
                      <input
                        type="text"
                        id="internName"
                        name="internName"
                        value={formData.internName}
                        onChange={handleChange}
                        required
                        placeholder="Name of the intern"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="internId">Intern ID *</label>
                      <input
                        type="text"
                        id="internId"
                        name="internId"
                        value={formData.internId}
                        onChange={handleChange}
                        required
                        placeholder="e.g. INT12345"
                        className="form-input"
                      />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label" htmlFor="name">Full Name / Detail Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Vikram Malhotra"
                    className="form-input"
                  />
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="e.g. vikram@gmail.com"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="phone">Mobile Number *</label>
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
                </div>

                <div className="form-group" style={{ marginTop: "1rem" }}>
                  <label className="form-label" htmlFor="city">City *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Jabalpur"
                    className="form-input"
                  />
                </div>

                <div className="form-group" style={{ marginTop: "1rem" }}>
                  <label className="form-label" htmlFor="billingAddress">Billing Address *</label>
                  <textarea
                    id="billingAddress"
                    name="billingAddress"
                    value={formData.billingAddress}
                    onChange={handleChange}
                    required
                    rows={2}
                    placeholder="Enter your complete billing address"
                    className="form-textarea"
                  ></textarea>
                </div>

                <div className="form-group" style={{ marginTop: "1rem" }}>
                  <label className="form-label" htmlFor="message">Message for DAY Foundation</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Write a message or notes (optional)"
                    className="form-textarea"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary donate-submit-btn"
                  style={{ width: "100%", marginTop: "1.5rem", padding: "0.9rem" }}
                >
                  <Heart size={18} className="fill-current" />
                  <span>Donate ₹{isCustom ? (customAmount || 0) : amount}</span>
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* Razorpay checkout handles the overlay modal internally */}
    </motionFramer.div>
  );
};
export default Donate;
