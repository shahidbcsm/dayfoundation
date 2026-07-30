import React from "react";
import { motion } from "framer-motion";
import { HelpCircle, RefreshCcw, Landmark, ShieldCheck, FileText } from "lucide-react";
import "../styles/pages.css";

export const RefundPolicy: React.FC = () => {
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
          <span className="badge-custom">Donor Protection</span>
          <h1 className="subpage-hero-title">Refund & Cancellation Policy</h1>
          <p className="subpage-hero-desc">
            We strive to maintain absolute transparency and trust. This policy explains our protocols for donations, transactions, and potential refund requests.
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
                  <HelpCircle size={20} />
                  <h3 style={{ fontSize: "1rem", margin: 0 }}>Refund Status</h3>
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", margin: 0 }}>
                  Donations are generally non-refundable as they are deployed immediately to fund our social welfare programs.
                </p>
              </div>

              <div className="premium-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ color: "var(--color-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <RefreshCcw size={20} />
                  <h3 style={{ fontSize: "1rem", margin: 0 }}>Gateway Errors</h3>
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", margin: 0 }}>
                  Accidental double deductions or payment gateway errors are fully refundable if reported within 7 days.
                </p>
              </div>

              <div className="premium-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ color: "var(--color-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Landmark size={20} />
                  <h3 style={{ fontSize: "1rem", margin: 0 }}>Tax Receipts</h3>
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", margin: 0 }}>
                  Refunds cannot be processed if an official tax exemption certificate (Section 80G receipt) has been issued.
                </p>
              </div>
            </div>

            {/* Terms Details */}
            <div className="font-serif-heading" style={{ display: "flex", flexDirection: "column", gap: "2rem", lineHeight: "1.8", color: "var(--color-text-dark)" }}>
              <div>
                <h2 style={{ fontSize: "1.5rem", color: "var(--color-primary)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "10px" }}>
                  <FileText size={22} />
                  1. General Policy on Donations
                </h2>
                <p style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }}>
                  BHTDAY Welfare Foundation (DAY Foundation) appreciates your generous contributions to our social programs. As a registered Section 8 NGO, we deploy your contributions directly into community welfare drives, digital classrooms, weekend Learning Circles, and medical camps.
                </p>
                <p style={{ color: "var(--color-text-muted)" }}>
                  Because resources are committed immediately to these projects to ensure continuity of care, <strong>all donations processed on our website are considered final and non-refundable</strong>, except in the specific circumstances outlined below.
                </p>
              </div>

              <div>
                <h2 style={{ fontSize: "1.5rem", color: "var(--color-primary)", marginBottom: "1rem" }}>2. Payment Gateway and System Errors</h2>
                <p style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }}>
                  In the event of transaction discrepancies caused by technical difficulties or payment gateway failures, we will gladly reverse the transactions:
                </p>
                <ul style={{ paddingLeft: "1.5rem", color: "var(--color-text-muted)", marginBottom: "1rem", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <li><strong>Duplicate Deductions:</strong> If your bank account or credit card was charged twice for a single donation attempt due to network lag.</li>
                  <li><strong>Incorrect Amount Deductions:</strong> If the payment processor executed a transaction for an amount different from what you selected on our donation form.</li>
                </ul>
                <p style={{ color: "var(--color-text-muted)" }}>
                  If you encounter such errors, please email our finance team at <strong>info@dayfoundation.in</strong> within <strong>7 working days</strong> of the transaction date.
                </p>
              </div>

              <div>
                <h2 style={{ fontSize: "1.5rem", color: "var(--color-primary)", marginBottom: "1rem" }}>3. Refund Evaluation & Timeline</h2>
                <p style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }}>
                  To submit a request, your email must include:
                </p>
                <ul style={{ paddingLeft: "1.5rem", color: "var(--color-text-muted)", marginBottom: "1rem", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <li>Your full name, email address, and phone number.</li>
                  <li>Date and exact time of the transaction.</li>
                  <li>The payment method utilized and transaction ID.</li>
                  <li>A screenshot of the deduction notification or bank statement showing the debit.</li>
                </ul>
                <p style={{ color: "var(--color-text-muted)" }}>
                  Approved refunds will be processed and returned to the original payment source (credit card, net banking, or digital wallet) within <strong>15 to 20 business days</strong>. Note that processing speeds are partially dependent on bank and card settlement schedules.
                </p>
              </div>

              <div>
                <h2 style={{ fontSize: "1.5rem", color: "var(--color-primary)", marginBottom: "1rem" }}>4. Tax Receipt Compliance (Section 80G)</h2>
                <p style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }}>
                  Under compliance guidelines set by the Indian Income Tax Department, DAY Foundation issues tax exemption receipts (Section 80G certificates) to donors.
                </p>
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", backgroundColor: "var(--color-primary-light)", padding: "1rem", borderRadius: "10px", color: "var(--color-primary-dark)", fontSize: "0.9rem", marginBottom: "1rem" }}>
                  <ShieldCheck size={20} style={{ flexShrink: 0, marginTop: "2px" }} />
                  <span>
                    <strong>Important Note:</strong> If an official tax exemption certificate has already been generated and sent to you, the donation cannot be refunded under any circumstances. If a refund is processed prior to issuing the receipt, the corresponding 80G certificate will be rendered void and will not be reported to the IT Department.
                  </span>
                </div>
              </div>

              <div>
                <h2 style={{ fontSize: "1.5rem", color: "var(--color-primary)", marginBottom: "1rem" }}>5. Recurring Donation Plans</h2>
                <p style={{ color: "var(--color-text-muted)" }}>
                  If you have signed up for a monthly or recurring donation program and wish to cancel it, you can do so at any time by contacting us at <strong>info@dayfoundation.in</strong>. Upon receipt of your cancellation request, all future automated transactions will be terminated within 3 working days. Past processed payments in the monthly cycle remain non-refundable.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default RefundPolicy;
