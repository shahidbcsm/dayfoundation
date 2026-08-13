import React from "react";
import { motion } from "framer-motion";
import { ShieldAlert, Key, Eye, FileText } from "lucide-react";
import "../styles/pages.css";

export const PrivacyPolicy: React.FC = () => {
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
          <span className="badge-custom">Security & Transparency</span>
          <h1 className="subpage-hero-title">Privacy Policy</h1>
          <p className="subpage-hero-desc">
            We value your trust. This Privacy Policy details how BHTDAY Welfare Foundation (DAY Foundation) collects, uses, and safeguards your personal information.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding" style={{ backgroundColor: "var(--color-bg-white)" }}>
        <div className="container-custom">
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            
            {/* Quick Summary Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
              <div className="premium-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ color: "var(--color-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Eye size={20} />
                  <h3 style={{ fontSize: "1rem", margin: 0 }}>Data Visibility</h3>
                </div>
                <p style={{ fontSize: "0.85rem", margin: 0 }}>
                  We do not sell, trade, or share your contact or financial information with third parties.
                </p>
              </div>

              <div className="premium-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ color: "var(--color-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Key size={20} />
                  <h3 style={{ fontSize: "1rem", margin: 0 }}>Secure Payments</h3>
                </div>
                <p style={{ fontSize: "0.85rem", margin: 0 }}>
                  All donations are processed securely via certified, encrypted payment gateways.
                </p>
              </div>

              <div className="premium-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ color: "var(--color-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <ShieldAlert size={20} />
                  <h3 style={{ fontSize: "1rem", margin: 0 }}>Tax Receipts</h3>
                </div>
                <p style={{ fontSize: "0.85rem", margin: 0 }}>
                  PAN card details are used strictly for registering 80G tax exemptions with the Income Tax Department.
                </p>
              </div>
            </div>

            {/* Policy Details */}
            <div className="policy-doc-content font-serif-heading" style={{ display: "flex", flexDirection: "column", gap: "2rem", lineHeight: "1.8" }}>
              <div>
                <h2 style={{ fontSize: "1.5rem", color: "var(--color-primary)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "10px" }}>
                  <FileText size={22} />
                  1. Information We Collect
                </h2>
                <p style={{ marginBottom: "1rem" }}>
                  We collect personal information that you voluntarily provide when you donate, sign up to volunteer, register for events, or contact us. This includes:
                </p>
                <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <li><strong className="policy-doc-label">Identity Information:</strong> Name, age, gender, and social profiles.</li>
                  <li><strong className="policy-doc-label">Contact Information:</strong> Email address, phone number, and physical mailing address.</li>
                  <li><strong className="policy-doc-label">Financial Information:</strong> Transaction IDs and payment summaries (we do NOT store credit card details or bank passwords).</li>
                  <li><strong className="policy-doc-label">Tax Identification:</strong> PAN card number (required exclusively for generating Indian Income Tax Section 80G receipts).</li>
                </ul>
              </div>

              <div>
                <h2 style={{ fontSize: "1.5rem", color: "var(--color-primary)", marginBottom: "1rem" }}>2. How We Use Your Information</h2>
                <p style={{ marginBottom: "1rem" }}>
                  The information we collect is used to power grassroots operations and maintain legal compliance:
                </p>
                <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <li>To process your donations and deliver official digital and physical tax-exempt donation receipts.</li>
                  <li>To register and verify volunteers, coordinate drive assignments, and dispatch program schedules.</li>
                  <li>To send periodic newsletters, updates on impact metrics, and notifications regarding upcoming drives.</li>
                  <li>To comply with regulatory guidelines from the Ministry of Corporate Affairs, Income Tax Department, and NITI Aayog.</li>
                </ul>
              </div>

              <div>
                <h2 style={{ fontSize: "1.5rem", color: "var(--color-primary)", marginBottom: "1rem" }}>3. Data Protection and Retention</h2>
                <p style={{ marginBottom: "1rem" }}>
                  We employ rigorous physical, electronic, and administrative security measures to prevent unauthorized data access, maintain accuracy, and ensure proper utilization. 
                </p>
                <p style={{ marginBottom: "1rem" }}>
                  Your personal records are kept in secure folders with restricted access. We retain tax compliance and donation records in compliance with Indian corporate and trust accounting laws, while contact details for mailing lists are held until you choose to unsubscribe.
                </p>
              </div>

              <div>
                <h2 style={{ fontSize: "1.5rem", color: "var(--color-primary)", marginBottom: "1rem" }}>4. Cookies and Web Analytics</h2>
                <p style={{ marginBottom: "1rem" }}>
                  Our website uses cookies to enhance user experience, track visual theme preferences (e.g. keeping dark mode or custom palette selections active across visits), and compile anonymous analytics. 
                </p>
                <p>
                  You can configure your browser to reject cookies, though doing so might restore design preferences to defaults on subsequent loads.
                </p>
              </div>

              <div>
                <h2 style={{ fontSize: "1.5rem", color: "var(--color-primary)", marginBottom: "1rem" }}>5. Updates and Contact</h2>
                <p style={{ marginBottom: "1rem" }}>
                  We reserve the right to revise this Privacy Policy to match changing regulations or updated technology. Changes will be posted immediately with an updated timestamp.
                </p>
                <p>
                  For inquiries or requests regarding deleting or modifying your records, reach out directly to our Governance Board at <strong>info@dayfoundation.in</strong>.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default PrivacyPolicy;
