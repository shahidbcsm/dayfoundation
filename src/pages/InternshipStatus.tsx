import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { lookupByTicketNo, lookupDonation } from "../firebase/services";
import { motion, AnimatePresence } from "framer-motion";
import { Search, CheckCircle2, Clock, XCircle, Loader, BookOpen, Heart, Printer, X } from "lucide-react";
import "../styles/pages.css";

interface InternshipStatusProps {
  defaultTab?: 'application' | 'donation';
}

export const InternshipStatus: React.FC<InternshipStatusProps> = ({ defaultTab }) => {
  const [searchParams] = useSearchParams();
  const [searchType, setSearchType] = useState<'application' | 'donation'>(defaultTab || "application");
  
  // Application Ticket Search
  const [tempId, setTempId] = useState<string>("");
  const [result, setResult] = useState<{ type: 'volunteer' | 'internship' | 'contact' | 'complaint'; data: any } | null | "notfound">(null);

  // Donation Search
  const [donorName, setDonorName] = useState<string>("");
  const [donationExtraQuery, setDonationExtraQuery] = useState<string>("");
  const [donations, setDonations] = useState<any[]>([]);
  const [donationLookupAttempted, setDonationLookupAttempted] = useState<boolean>(false);

  // Print Receipt Modal
  const [printReceiptData, setPrintReceiptData] = useState<any | null>(null);

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const typeParam = searchParams.get("type");
    const reprintParam = searchParams.get("reprint");
    const emailParam = searchParams.get("email");
    const nameParam = searchParams.get("name");
    const txParam = searchParams.get("tx") || searchParams.get("utr");
    const qParam = searchParams.get("q") || searchParams.get("query");

    if (typeParam === "donation" || reprintParam === "true" || defaultTab === "donation") {
      setSearchType("donation");
    }

    if (nameParam) setDonorName(nameParam);
    if (emailParam || txParam || qParam) {
      setDonationExtraQuery(emailParam || txParam || qParam || "");
    }

    // Auto trigger search if query params provided
    if ((nameParam || emailParam || txParam || qParam) && (typeParam === "donation" || defaultTab === "donation")) {
      const runAutoSearch = async () => {
        setLoading(true);
        try {
          const found = await lookupDonation(nameParam || "", emailParam || txParam || qParam || "");
          setDonations(found || []);
          setDonationLookupAttempted(true);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      runAutoSearch();
    }
  }, [searchParams, defaultTab]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempId.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const found = await lookupByTicketNo(tempId.trim().toUpperCase());
      setResult(found ?? "notfound");
    } catch (err) {
      console.error(err);
      setResult("notfound");
    } finally {
      setLoading(false);
    }
  };

  const handleDonationSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!donorName.trim() && !donationExtraQuery.trim()) {
      alert("Please enter a Donor Name, Email, Phone Number, or Transaction/UTR ID to search.");
      return;
    }
    setLoading(true);
    setDonations([]);
    setDonationLookupAttempted(false);
    try {
      const found = await lookupDonation(donorName.trim(), donationExtraQuery.trim());
      setDonations(found || []);
      setDonationLookupAttempted(true);
    } catch (err) {
      console.error(err);
      setDonations([]);
      setDonationLookupAttempted(true);
    } finally {
      setLoading(false);
    }
  };



  const StatusCard = ({ res }: { res: { type: 'volunteer' | 'internship' | 'contact' | 'complaint'; data: any } }) => {
    const { type, data } = res;
    const isPending = data.status === "pending" || !data.status;
    const isApproved = data.status === "approved" || data.status === "resolved" || data.status === "reviewed";
    const isRejected = data.status === "rejected";

    let typeLabel = "Internship Application";
    if (type === 'volunteer') typeLabel = "Volunteer Application";
    if (type === 'contact') typeLabel = "Contact Message / Inquiry";
    if (type === 'complaint') typeLabel = "Official Complaint Registration";

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="premium-card"
        style={{
          backgroundColor: "var(--color-bg-white)",
          border: "1px solid var(--color-border-light)",
          maxWidth: "620px",
          marginInline: "auto",
          padding: "2.5rem",
          textAlign: "center"
        }}
      >
        {/* Status icon */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
          {isPending && <Clock size={64} color="var(--color-accent)" />}
          {isApproved && <CheckCircle2 size={64} color="#16A34A" />}
          {isRejected && <XCircle size={64} color="var(--color-secondary)" />}
        </div>

        {/* Form Type Badge */}
        <span style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-muted)", display: "block", marginBottom: "0.25rem" }}>
          {typeLabel}
        </span>

        {/* Applicant name */}
        <h2 style={{ fontSize: "1.5rem", color: "var(--color-primary)", marginBottom: "0.5rem" }}>
          {data.name}
        </h2>
        
        {type === 'internship' && (
          <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>
            {data.college} • {data.department} • Applied: {data.currentDate || data.createdAt?.split("T")[0]}
          </p>
        )}
        
        {type === 'volunteer' && (
          <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>
            Role: Volunteer • City: {data.city} • Applied: {data.createdAt?.split("T")[0]}
          </p>
        )}

        {type === 'contact' && (
          <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>
            Subject: "{data.subject}" • Received: {data.createdAt?.split("T")[0]}
          </p>
        )}

        {type === 'complaint' && (
          <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>
            Type: {data.complaintType} • ID: {data.membershipId} • Filed: {data.createdAt?.split("T")[0]}
          </p>
        )}

        {/* Status pill */}
        <div style={{
          display: "inline-block",
          padding: "0.5rem 1.5rem",
          borderRadius: "999px",
          fontWeight: 800,
          fontSize: "0.875rem",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: "1.5rem",
          background: isPending
            ? "rgba(244,180,0,0.12)"
            : isApproved
            ? "rgba(22,163,74,0.10)"
            : "rgba(220,38,38,0.10)",
          color: isPending
            ? "var(--color-accent-dark)"
            : isApproved
            ? "#15803d"
            : "var(--color-danger)",
          border: `1px solid ${isPending ? "rgba(244,180,0,0.3)" : isApproved ? "rgba(22,163,74,0.3)" : "rgba(220,38,38,0.3)"}`
        }}>
          {isPending 
            ? "⏳ Under Review / Pending" 
            : isApproved 
            ? (type === 'contact' || type === 'complaint' ? "✅ Responded / Resolved" : "✅ Approved") 
            : "❌ Not Selected"}
        </div>

        {/* Permanent ID if approved internship or volunteer */}
        {isApproved && (data.permanentInternshipId || data.permanentVolunteerId) && (
          <div style={{
            background: "linear-gradient(135deg, var(--color-primary-light), rgba(0,169,157,0.08))",
            border: "2px solid var(--color-primary)",
            borderRadius: "16px",
            padding: "1.5rem",
            marginBottom: "1.5rem"
          }}>
            <p style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>
              🎓 Your Official Allotted ID ({type === 'volunteer' ? 'Volunteer' : 'Internship'})
            </p>
            <p style={{ fontFamily: "monospace", fontSize: "1.5rem", fontWeight: 800, color: "var(--color-primary)", letterSpacing: "0.1em", margin: 0 }}>
              {data.permanentVolunteerId || data.permanentInternshipId}
            </p>
            <p style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", marginTop: "0.5rem", margin: 0 }}>
              Keep this ID for your certificate verification and official correspondence.
            </p>
          </div>
        )}

        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button 
            onClick={() => setResult(null)}
            className="btn btn-outline" 
            style={{ fontSize: "0.875rem" }}
          >
            Search Again
          </button>
          <Link to="/" className="btn btn-primary" style={{ fontSize: "0.875rem" }}>
            Return Home
          </Link>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{ paddingTop: "120px", paddingBottom: "5rem", minHeight: "100vh", backgroundColor: "var(--color-bg-gray)" }}
    >
      <section style={{ padding: "0 1.5rem" }}>
        <div className="container-custom" style={{ maxWidth: "720px" }}>
          
          {/* Section Header */}
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-primary)", display: "block", marginBottom: "0.5rem" }}>
              Verification & Receipt Portal
            </span>
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2.25rem", color: "var(--color-primary)", marginBottom: "0.75rem" }}>
              Track Application & Reprint Invoice
            </h1>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.95rem", maxWidth: "520px", marginInline: "auto" }}>
              Track your internship/volunteer application, look up contact inquiries, or search and reprint your donation receipts instantly.
            </p>
          </div>

          {/* Form Card */}
          <div 
            className="premium-card"
            style={{
              backgroundColor: "var(--color-bg-white)",
              border: "1px solid var(--color-border-light)",
              padding: "2rem",
              marginBottom: "2rem"
            }}
          >
            {/* Toggle Tabs */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "2rem", borderBottom: "1px solid var(--color-border-light)", paddingBottom: "0.75rem" }}>
              <button
                onClick={() => { setSearchType("application"); setResult(null); }}
                className={`btn ${searchType === "application" ? "btn-primary" : "btn-outline"}`}
                style={{ flex: 1, padding: "0.5rem 1rem", fontSize: "0.85rem", fontWeight: 700 }}
              >
                <BookOpen size={14} />
                <span>Track Tickets</span>
              </button>
              <button
                onClick={() => { setSearchType("donation"); setDonations([]); setDonationLookupAttempted(false); }}
                className={`btn ${searchType === "donation" ? "btn-primary" : "btn-outline"}`}
                style={{ flex: 1, padding: "0.5rem 1rem", fontSize: "0.85rem", fontWeight: 700 }}
              >
                <Heart size={14} />
                <span>Reprint Invoice</span>
              </button>
            </div>

            {searchType === "application" ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--color-primary)", marginBottom: "1.5rem" }}>
                  <BookOpen size={22} />
                  <h2 style={{ fontSize: "1.25rem", margin: 0, fontWeight: 700 }}>Lookup Your Submission</h2>
                </div>

                <form onSubmit={handleSearch}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="tempIdInput">
                      Ticket Number or Application ID *
                    </label>
                    <input
                      type="text"
                      id="tempIdInput"
                      value={tempId}
                      onChange={(e) => setTempId(e.target.value.toUpperCase())}
                      placeholder="e.g. VOL-DAY-20260627-4821"
                      className="form-input"
                      required
                      style={{ fontFamily: "monospace", letterSpacing: "0.04em" }}
                    />
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.5rem" }}>
                      Enter the ticket number or application ID you received upon submitting your form.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                    style={{ width: "100%" }}
                  >
                    {loading ? (
                      <><Loader className="animate-spin" size={18} /><span>Searching...</span></>
                    ) : (
                      <><Search size={18} /><span>Track Status</span></>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--color-primary)", marginBottom: "1.5rem" }}>
                  <Heart size={22} />
                  <h2 style={{ fontSize: "1.25rem", margin: 0, fontWeight: 700 }}>Find & Reprint Donation Invoice</h2>
                </div>

                <form onSubmit={handleDonationSearch}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="donorNameInput">
                      Donor Name (Optional)
                    </label>
                    <input
                      type="text"
                      id="donorNameInput"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="donationExtraQueryInput">
                      UTR / Phone / Email / Invoice ID
                    </label>
                    <input
                      type="text"
                      id="donationExtraQueryInput"
                      value={donationExtraQuery}
                      onChange={(e) => setDonationExtraQuery(e.target.value)}
                      placeholder="e.g. UTR Ref, Phone (9876543210), Email or Invoice ID"
                      className="form-input"
                    />
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.5rem" }}>
                      Search using your registered name, email address, phone number, UTR number, or transaction ID.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                    style={{ width: "100%" }}
                  >
                    {loading ? (
                      <><Loader className="animate-spin" size={18} /><span>Searching Invoices...</span></>
                    ) : (
                      <><Search size={18} /><span>Find & Reprint Invoice</span></>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Results */}
          <AnimatePresence mode="wait">
            {searchType === "application" ? (
              <>
                {result === "notfound" && (
                  <motion.div
                    key="notfound"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="premium-card"
                    style={{ backgroundColor: "var(--color-bg-white)", border: "1px solid var(--color-border-light)", maxWidth: "560px", marginInline: "auto", padding: "2.5rem", textAlign: "center" }}
                  >
                    <XCircle size={48} color="var(--color-text-light)" style={{ marginInline: "auto", marginBottom: "1rem" }} />
                    <h3 style={{ color: "var(--color-text-dark)", marginBottom: "0.75rem" }}>No Record Found</h3>
                    <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                      No submission matched the ticket number <code style={{ fontFamily: "monospace", color: "var(--color-primary)" }}>{tempId}</code>. Please verify the number and try again.
                    </p>
                    <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                      <Link to="/internship" className="btn btn-outline" style={{ fontSize: "0.875rem" }}>
                        <span>Internship Form</span>
                      </Link>
                      <Link to="/volunteer" className="btn btn-outline" style={{ fontSize: "0.875rem" }}>
                        <span>Volunteer Form</span>
                      </Link>
                    </div>
                  </motion.div>
                )}

                {result && result !== "notfound" && (
                  <StatusCard res={result} />
                )}
              </>
            ) : (
              <>
                {donationLookupAttempted && donations.length === 0 && (
                  <motion.div
                    key="no-donation"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="premium-card"
                    style={{ backgroundColor: "var(--color-bg-white)", border: "1px solid var(--color-border-light)", maxWidth: "560px", marginInline: "auto", padding: "2.5rem", textAlign: "center" }}
                  >
                    <XCircle size={48} color="var(--color-text-light)" style={{ marginInline: "auto", marginBottom: "1rem" }} />
                    <h3 style={{ color: "var(--color-text-dark)", marginBottom: "0.75rem" }}>No Donation Record Found</h3>
                    <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                      No donation was found matching your search. Please verify your details or search with your registered email or phone number.
                    </p>
                  </motion.div>
                )}

                {donations.length > 0 && (
                  <motion.div
                    key="donations-list"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{ maxWidth: "680px", marginInline: "auto" }}
                  >
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-primary)", marginBottom: "1rem", textAlign: "left" }}>
                      Donation Invoices Found ({donations.length})
                    </h3>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      {donations.map((don) => (
                        <div
                          key={don.id || don.transactionId}
                          className="premium-card"
                          style={{
                            backgroundColor: "var(--color-bg-white)",
                            border: "1px solid var(--color-border-light)",
                            padding: "1.5rem 2rem",
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: "1rem",
                            textAlign: "left"
                          }}
                        >
                          <div>
                            <span style={{ fontSize: "0.68rem", backgroundColor: "rgba(22,163,74,0.1)", color: "#16a34a", padding: "3px 8px", borderRadius: "999px", fontWeight: 800, textTransform: "uppercase", display: "inline-block", marginBottom: "6px" }}>
                              Verified Transaction
                            </span>
                            <h4 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "var(--color-text-dark)" }}>
                              {don.donorName || "Valued Donor"}
                            </h4>
                            <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
                              UTR/Tx ID: <code style={{ fontFamily: "monospace" }}>{don.transactionId || don.id}</code> • {don.createdAt?.split("T")[0]}
                            </p>
                            <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
                              Purpose: {don.purpose || "General Support"} • Phone: {don.donorPhone || "N/A"}
                            </p>
                          </div>
                          
                          <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                            <p style={{ margin: 0, fontSize: "1.3rem", fontWeight: 800, color: "var(--color-primary)" }}>
                              ₹{don.amount}
                            </p>
                            <div>
                              <button
                                onClick={() => setPrintReceiptData(don)}
                                className="btn btn-primary"
                                style={{ padding: "0.5rem 1.25rem", fontSize: "0.85rem", display: "inline-flex", gap: "6px", alignItems: "center" }}
                              >
                                <Printer size={15} />
                                <span>Print Invoice</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Printable Invoice Modal (Identical to Admin Panel) */}
      {printReceiptData && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999999,
          backgroundColor: "rgba(15, 23, 42, 0.85)",
          backdropFilter: "blur(8px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          padding: "100px 1rem 3rem 1rem"
        }}>
          {/* Action Bar Header */}
          <div className="no-print" style={{
            width: "100%",
            maxWidth: "210mm",
            backgroundColor: "#ffffff",
            borderRadius: "12px 12px 0 0",
            padding: "1rem 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid var(--color-border-light)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            position: "sticky",
            top: 0,
            zIndex: 10
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Heart size={20} color="var(--color-primary)" />
              <span style={{ fontWeight: 800, fontSize: "1rem", color: "var(--color-text-dark)" }}>
                Official Donation Receipt Invoice
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                onClick={() => window.print()}
                className="btn btn-primary"
                style={{ padding: "0.55rem 1.5rem", fontSize: "0.9rem", display: "inline-flex", alignItems: "center", gap: "8px", fontWeight: 700 }}
              >
                <Printer size={18} />
                <span>Print Invoice</span>
              </button>

              <button
                onClick={() => setPrintReceiptData(null)}
                style={{
                  background: "rgba(0,0,0,0.06)",
                  border: "none",
                  cursor: "pointer",
                  color: "#334155",
                  padding: "6px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease"
                }}
                title="Close Modal"
              >
                <X size={22} />
              </button>
            </div>
          </div>

          {/* Receipt Printable Sheet Container */}
          <div id="receipt-pdf-content" className="receipt-page-container">
            <style dangerouslySetInnerHTML={{ __html: `
              @page { size: A4; margin: 0; }
              * { box-sizing: border-box; }
              @media print {
                body * {
                  visibility: hidden !important;
                }
                #receipt-pdf-content, #receipt-pdf-content * {
                  visibility: visible !important;
                }
                #receipt-pdf-content {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 210mm !important;
                  height: 296mm !important;
                  padding: 12mm 14mm 14mm 14mm !important;
                  box-shadow: none !important;
                  border: none !important;
                  background-color: white !important;
                }
              }
              .receipt-page-container {
                width: 210mm;
                min-height: 297mm;
                margin: 0 auto;
                background: #ffffff;
                padding: 12mm 14mm 14mm 14mm;
                position: relative;
                box-shadow: 0 10px 30px rgba(0,0,0,0.12);
                border: 1px solid var(--color-border-light);
                text-align: left;
                color: #034356;
                font-family: 'Segoe UI', Calibri, Arial, sans-serif;
                border-radius: 0 0 12px 12px;
              }
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
            ` }} />
            
            <div className="org-title">BHTDAY WELFARE<br />FOUNDATION</div>
            <div className="header-row">
              <div></div>
              <div className="header-meta">
                Date<span className="value-line">{printReceiptData.createdAt ? new Date(printReceiptData.createdAt).toLocaleDateString("en-IN") : new Date().toLocaleDateString("en-IN")}</span><br />
                Transaction ID<span className="value-line" style={{ fontFamily: "monospace" }}>{printReceiptData.transactionId || printReceiptData.id}</span>
              </div>
            </div>

            <div className="billed-to">BILLED TO</div>
            <div className="field-block">
              <div className="field-line">Name:<span className="field-fill">{printReceiptData.donorName || "Valued Supporter"}</span></div>
              <div className="field-line">Purpose:<span className="field-fill">{printReceiptData.purpose || "General Support Funds"}</span></div>
              <div className="field-line">Phone No.:<span className="field-fill">{printReceiptData.donorPhone || "N/A"}</span></div>
              <div className="field-line with-rule">City:<span className="field-fill">{printReceiptData.city || "N/A"}</span></div>
            </div>

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
                  <td style={{ fontFamily: "monospace" }}>{(printReceiptData.transactionId || printReceiptData.id || "").substring(0, 14)}</td>
                  <td>Donation Support</td>
                  <td>₹{printReceiptData.amount}.00</td>
                  <td>₹{printReceiptData.amount}.00</td>
                </tr>
              </tbody>
            </table>

            <div className="seal-wrap">
              <img className="seal-img" src="/seal.jpg" alt="Seal" />
            </div>

            <div className="remittance-title">Remittance</div>
            <div className="remittance-rule"></div>
            <div className="remit-area">
              <div className="remit-fields">
                <div className="underline-field">Customer Name: {printReceiptData.donorName || "Valued Supporter"}</div>
                <div className="underline-field">Customer ID: {printReceiptData.donorEmail || "info@dayfoundation.in"}</div>
                <div className="underline-field">Transaction no.: {printReceiptData.transactionId || printReceiptData.id}</div>
                <div className="underline-field">Date: {printReceiptData.createdAt ? new Date(printReceiptData.createdAt).toLocaleDateString("en-IN") : new Date().toLocaleDateString("en-IN")}</div>
                <div className="underline-field">Amount Enclosed: ₹{printReceiptData.amount}.00</div>
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
                  Email: info@dayfoundation.in
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default InternshipStatus;
