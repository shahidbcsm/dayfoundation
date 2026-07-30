import React from "react";
import { motion } from "framer-motion";
import { Scale, Heart, AlertCircle, FileText } from "lucide-react";
import "../styles/pages.css";

export const TermsConditions: React.FC = () => {
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
          <span className="badge-custom">Legal Framework</span>
          <h1 className="subpage-hero-title">Terms & Conditions</h1>
          <p className="subpage-hero-desc">
            These terms define the guidelines and legal conditions under which you may access our website and interact with BHTDAY Welfare Foundation.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding" style={{ backgroundColor: "var(--color-bg-white)" }}>
        <div className="container-custom">
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            
            {/* Quick Summary Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
              <div className="premium-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ color: "var(--color-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Scale size={20} />
                  <h3 style={{ fontSize: "1rem", margin: 0 }}>Governing Law</h3>
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", margin: 0 }}>
                  We operate as a Section 8 NGO registered in India (Corporate Identification No. U85300MP2022NPL060825).
                </p>
              </div>

              <div className="premium-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ color: "var(--color-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Heart size={20} />
                  <h3 style={{ fontSize: "1rem", margin: 0 }}>Donation Integrity</h3>
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", margin: 0 }}>
                  Funds are deployed strictly toward community education, medical aid, and livelihood initiatives.
                </p>
              </div>

              <div className="premium-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ color: "var(--color-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <AlertCircle size={20} />
                  <h3 style={{ fontSize: "1rem", margin: 0 }}>Volunteer Code</h3>
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", margin: 0 }}>
                  Participation in our welfare events implies respect for local cultures, safety measures, and rules.
                </p>
              </div>
            </div>

            {/* Terms Details */}
            <div className="font-serif-heading" style={{ display: "flex", flexDirection: "column", gap: "2rem", lineHeight: "1.8", color: "var(--color-text-dark)" }}>
              <div>
                <h2 style={{ fontSize: "1.5rem", color: "var(--color-primary)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "10px" }}>
                  <FileText size={22} />
                  1. Acceptance of Terms
                </h2>
                <p style={{ color: "var(--color-text-muted)" }}>
                  By accessing, browsing, or utilizing the DAY Foundation website (including making online donations or signing up for volunteer programs), you acknowledge that you have read, understood, and agreed to be bound by these Terms and Conditions and all applicable laws and regulations. If you do not agree, please discontinue website usage immediately.
                </p>
              </div>

              <div>
                <h2 style={{ fontSize: "1.5rem", color: "var(--color-primary)", marginBottom: "1rem" }}>2. Use of Content & Copyright</h2>
                <p style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }}>
                  All website design, text, graphs, photographs, videos, logos, and custom code are the exclusive intellectual property of BHTDAY Welfare Foundation.
                </p>
                <p style={{ color: "var(--color-text-muted)" }}>
                  You are permitted to share links, download informational PDFs, and read blogs for personal, non-commercial purposes. Any unauthorized copying, republishing, or commercial exploitation of the materials on this site without explicit written consent from our Board of Directors is strictly prohibited.
                </p>
              </div>

              <div>
                <h2 style={{ fontSize: "1.5rem", color: "var(--color-primary)", marginBottom: "1rem" }}>3. Online Donations and Section 80G Tax Exemption</h2>
                <p style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }}>
                  Donations made to DAY Foundation are processed through security-certified payment gateways. By submitting a donation, you agree that:
                </p>
                <ul style={{ paddingLeft: "1.5rem", color: "var(--color-text-muted)", marginBottom: "1rem", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <li>You are donating from legitimate sources of income in compliance with Indian currency regulations.</li>
                  <li>You must provide an accurate Permanent Account Number (PAN) and billing address if you intend to claim tax deductions under Section 80G of the Income Tax Act.</li>
                  <li>You recognize that donations once processed are immediately allocated to active program funds and are subject to our Refund Policy.</li>
                </ul>
              </div>

              <div>
                <h2 style={{ fontSize: "1.5rem", color: "var(--color-primary)", marginBottom: "1rem" }}>4. Volunteer & Internship Participation</h2>
                <p style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }}>
                  Volunteers and interns are critical to our field drives in Jabalpur, Indore, and Delhi. By registering as a volunteer/intern, you commit to:
                </p>
                <ul style={{ paddingLeft: "1.5rem", color: "var(--color-text-muted)", marginBottom: "1rem", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <li>Upholding the dignity of the communities we support. Discriminatory, offensive, or exploitative behavior will result in immediate termination of association.</li>
                  <li>Adhering strictly to local safety, hygiene, and organizational protocols set by our project leads.</li>
                  <li>Refraining from collecting cash donations, organizing private drives, or using the DAY Foundation logo/brand name for private fundraising without explicit official authorization.</li>
                </ul>
              </div>

              <div>
                <h2 style={{ fontSize: "1.5rem", color: "var(--color-primary)", marginBottom: "1rem" }}>5. Limitation of Liability</h2>
                <p style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }}>
                  DAY Foundation strives to ensure all information regarding programs, events, and reports is accurate. However, we do not guarantee the completeness or absolute timeliness of website materials. 
                </p>
                <p style={{ color: "var(--color-text-muted)" }}>
                  In no event will BHTDAY Welfare Foundation, its directors, or its employees be held liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use this site, or from transactions processed through our secure payment partners.
                </p>
              </div>

              <div>
                <h2 style={{ fontSize: "1.5rem", color: "var(--color-primary)", marginBottom: "1rem" }}>6. Governing Law & Dispute Resolution</h2>
                <p style={{ color: "var(--color-text-muted)" }}>
                  These terms shall be governed by, construed, and enforced in accordance with the laws of the Republic of India. Any legal actions, disputes, or claims arising out of these terms or website usage shall fall under the exclusive jurisdiction of the competent courts in Jabalpur, Madhya Pradesh, India.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default TermsConditions;
