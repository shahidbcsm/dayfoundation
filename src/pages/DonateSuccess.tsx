import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Printer, Home, BookOpen } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import "../styles/pages.css";

export const DonateSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [tx, setTx] = useState<string>("pay_MOCK");
  
  useEffect(() => {
    const txParam = searchParams.get("tx");
    if (txParam) {
      setTx(txParam);
    } else {
      setTx("pay_MOCK" + Math.floor(10000000 + Math.random() * 90000000).toString());
    }
  }, [searchParams]);

  const amt = searchParams.get("amt") || "1000";
  const name = searchParams.get("name") || "Valued Supporter";
  const email = searchParams.get("email") || "info@dayfoundation.in";
  const purpose = searchParams.get("purpose") || "General Support Funds";
  const city = searchParams.get("city") || "N/A";
  const phone = searchParams.get("phone") || "N/A";

  const currentDate = useMemo(() => {
    return new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }, []);

  const triggerPrint = () => {
    window.print();
  };



  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ minHeight: "100vh", backgroundColor: "var(--color-bg-gray)", paddingTop: "120px", paddingBottom: "5rem" }}
    >
      {/* Stylesheet injection for exact A4 template layout */}
      <style dangerouslySetInnerHTML={{ __html: `
        @page { size: A4; margin: 0; }
        * { box-sizing: border-box; }

        .receipt-page-container {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          background: #ffffff;
          padding: 12mm 14mm 14mm 14mm;
          position: relative;
          box-shadow: 0 10px 30px rgba(0,0,0,0.06);
          border: 1px solid var(--color-border-light);
          text-align: left;
          color: #034356;
          font-family: 'Segoe UI', Calibri, Arial, sans-serif;
          border-radius: 8px;
        }

        /* ---------- Header ---------- */
        .receipt-page-container .org-title {
          font-size: 30px;
          line-height: 1.15;
          letter-spacing: 0.3px;
          font-weight: 400;
          color: #034356;
        }

        .receipt-page-container .header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          border-bottom: 1px solid #034356;
          padding-bottom: 4px;
          margin-top: 4px;
        }

        .receipt-page-container .header-meta {
          text-align: right;
          font-size: 14px;
          line-height: 1.7;
        }

        .receipt-page-container .header-meta .value-line {
          display: inline-block;
          min-width: 160px;
          border-bottom: 1px solid #bbbbbb;
          margin-left: 6px;
          font-weight: 600;
        }

        /* ---------- Billed To ---------- */
        .receipt-page-container .billed-to {
          font-size: 16px;
          margin-top: 22px;
          margin-bottom: 14px;
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .receipt-page-container .field-block {
          font-size: 13px;
          line-height: 1.85;
        }

        .receipt-page-container .field-line {
          border-bottom: 1px solid transparent;
        }

        .receipt-page-container .field-line.with-rule {
          border-bottom: 1px solid #034356;
          padding-bottom: 14px;
          margin-bottom: 4px;
        }

        .receipt-page-container .field-fill {
          display: inline-block;
          min-width: 220px;
          margin-left: 6px;
          font-weight: 600;
        }

        /* ---------- Table ---------- */
        .receipt-page-container table.payment-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 22px;
          font-size: 13px;
        }

        .receipt-page-container table.payment-table th {
          text-align: left;
          font-weight: 700;
          font-size: 14px;
          padding: 7px 8px;
          border: 1px solid #034356;
          background: #ffffff;
        }

        .receipt-page-container table.payment-table td {
          padding: 14px 8px;
          border: 1px solid #034356;
          height: 16px;
        }

        /* ---------- Seal ---------- */
        .receipt-page-container .seal-wrap {
          position: relative;
          height: 0;
        }

        .receipt-page-container .seal-img {
          position: absolute;
          top: 14px;
          right: 60px;
          width: 92px;
          height: auto;
          opacity: 0.92;
        }

        /* ---------- Remittance section ---------- */
        .receipt-page-container .remittance-title {
          font-size: 17px;
          margin-top: 46px;
          font-weight: 700;
        }

        .receipt-page-container .remittance-rule {
          width: 270px;
          border-bottom: 1px solid #a0a0a0;
          margin: 2px 0 10px 0;
        }

        .receipt-page-container .remit-area {
          display: flex;
          justify-content: space-between;
          margin-top: 4px;
        }

        .receipt-page-container .remit-fields {
          font-size: 13px;
          line-height: 1.9;
        }

        .receipt-page-container .remit-fields .underline-field {
          display: block;
          width: 230px;
          padding-bottom: 2px;
          margin-bottom: 4px;
          border-bottom: 1px solid #bbbbbb;
        }

        .receipt-page-container .remit-signoff {
          text-align: right;
          font-family: 'Gill Sans MT', Calibri, sans-serif;
          font-size: 11.5px;
          line-height: 1.85;
          padding-top: 2px;
        }

        .receipt-page-container .remit-signoff .org-name {
          margin-top: 4px;
          font-size: 11.5px;
        }

        .receipt-page-container .remit-bottom-rule {
          width: 270px;
          border-bottom: 1px solid #a0a0a0;
          margin: 16px 0 0 0;
        }

        /* ---------- Footer ---------- */
        .receipt-page-container .footer-rule {
          border-top: 1px solid #034356;
          margin-top: 100px;
        }

        .receipt-page-container .footer-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-top: 40px;
        }

        .receipt-page-container .footer-logo img {
          width: 78px;
          height: auto;
          display: block;
          border: none;
          outline: none;
          vertical-align: bottom;
        }

        .receipt-page-container .footer-contact {
          flex: 1;
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          padding-left: 30px;
        }

        .receipt-page-container .footer-contact .addr-col {
          line-height: 1.85;
        }

        .receipt-page-container .footer-contact .phone-col {
          line-height: 1.85;
          text-align: right;
        }

        .receipt-page-container .footer-contact a {
          color: #1155cc;
          text-decoration: underline;
        }

        /* Print tuning */
        @media print {
          nav, footer, header, .nav-actions, .no-print, .btn, button, a:not(.receipt-email-link), hr, .success-message-header {
            display: none !important;
          }
          body {
            background: none !important;
            background-color: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .container-custom {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .receipt-page-container {
            width: 210mm !important;
            height: 296mm !important;
            box-sizing: border-box !important;
            margin: 0 !important;
            padding: 12mm 14mm 14mm 14mm !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            position: relative !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}} />

      <div className="container-custom" style={{ maxWidth: "800px" }}>
        
        {/* Success Header (Hidden during printing) */}
        <div className="success-message-header text-center no-print" style={{ marginBottom: "2rem" }}>
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 15 }}
            style={{ display: "flex", justifyContent: "center", marginBottom: "0.5rem" }}
          >
            <DotLottieReact
              src="https://lottie.host/3e0665b8-b6e3-4260-8268-3468e718a786/X7wOb5b9Hn.lottie"
              loop
              autoplay
              style={{ width: "180px", height: "180px" }}
            />
          </motion.div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.75rem", color: "var(--color-primary)", marginBottom: "0.25rem" }}>
            Donation Received! 🎉
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
            Thank you for your generous support. Your receipt is generated below.
          </p>
        </div>

        {/* Receipt Container (Targeted by html2pdf and @media print) */}
        <div id="receipt-pdf-content" className="receipt-page-container">
          
          {/* Header */}
          <div className="org-title">BHTDAY WELFARE<br />FOUNDATION</div>
          <div className="header-row">
            <div></div>
            <div className="header-meta">
              Date<span className="value-line">{currentDate}</span><br />
              Transaction ID<span className="value-line" style={{ fontFamily: "monospace" }}>{tx}</span>
            </div>
          </div>

          {/* Billed To */}
          <div className="billed-to">BILLED TO</div>
          <div className="field-block">
            <div className="field-line">Name:<span className="field-fill">{name}</span></div>
            <div className="field-line">Purpose:<span className="field-fill">{purpose}</span></div>
            <div className="field-line">Phone No.:<span className="field-fill">{phone}</span></div>
            <div className="field-line with-rule">City:<span className="field-fill">{city}</span></div>
          </div>

          {/* Payment Table */}
          <table className="payment-table">
            <colgroup>
              <col style={{ width: "22%" }} />
              <col style={{ width: "25%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: "17%" }} />
              <col style={{ width: "18%" }} />
            </colgroup>
            <thead>
              <tr>
                <th>Payment Type</th>
                <th>Account/UPI NO.</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Online Payment</td>
                <td style={{ fontFamily: "monospace" }}>{tx.substring(0, 14)}</td>
                <td>Donation Support</td>
                <td>₹{amt}.00</td>
                <td>₹{amt}.00</td>
              </tr>
            </tbody>
          </table>

          {/* Seal */}
          <div className="seal-wrap">
            <img className="seal-img" src="/seal.jpg" alt="Seal" />
          </div>

          {/* Remittance section */}
          <div className="remittance-title">Remittance</div>
          <div className="remittance-rule"></div>
          <div className="remit-area">
            <div className="remit-fields">
              <div className="underline-field">Customer Name: {name}</div>
              <div className="underline-field">Customer ID: {email}</div>
              <div className="underline-field">Transaction no.: {tx}</div>
              <div className="underline-field">Date: {currentDate}</div>
              <div className="underline-field">Amount Enclosed: ₹{amt}.00</div>
            </div>
            <div className="remit-signoff">
              Regards,<br />
              <br />
              <br />
              <strong>Khushali Tak</strong><br />
              Head of Finance<br />
              <div className="org-name">BHTDAY WELFARE FOUNDATION</div>
            </div>
          </div>
          <div className="remit-bottom-rule"></div>

          {/* Footer */}
          <div className="footer-rule"></div>
          <div className="footer-row">
            <div className="footer-logo">
              <img src="/footer-logo.png" alt="Logo" />
            </div>
            <div className="footer-contact">
              <div className="addr-col">
                <strong>Address:</strong><br />
                Patel Nagar, Adhartal, Ankita Parisar,<br />
                Maharajpur, Jabalpur, MP 482004
              </div>
              <div className="phone-col">
                Phone: 8982144416<br />
                Phone: 9251525127<br />
                Email: <a href="mailto:info@dayfoundation.in" className="receipt-email-link">info@dayfoundation.in</a>
              </div>
            </div>
          </div>

        </div>

        {/* Actions Row (Hidden during printing) */}
        <div className="no-print" style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center", marginTop: "2.5rem" }}>
          <button 
            onClick={triggerPrint} 
            className="btn btn-secondary"
            style={{ padding: "0.6rem 1.5rem", fontSize: "0.875rem" }}
          >
            <Printer size={16} />
            <span>Print Receipt</span>
          </button>
          
          <Link 
            to="/blogs" 
            className="btn btn-outline"
            style={{ padding: "0.6rem 1.5rem", fontSize: "0.875rem", border: "1px solid var(--color-border)" }}
          >
            <BookOpen size={16} />
            <span>Read Stories</span>
          </Link>

          <Link 
            to="/" 
            className="btn btn-primary"
            style={{ padding: "0.6rem 1.5rem", fontSize: "0.875rem" }}
          >
            <Home size={16} />
            <span>Return Home</span>
          </Link>
        </div>

      </div>
    </motion.div>
  );
};
export default DonateSuccess;
