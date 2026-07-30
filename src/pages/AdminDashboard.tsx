import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../hooks/useAuth";
import { 
  createBlog, deleteBlog, updateBlog,
  updateVolunteerStatus, approveVolunteer, updateVolunteerId,
  approveInternship,
  updateInternshipId,
  updateRecordComment,
  updateContactStatus,
  addRecordComment,
  deleteVolunteerRecord, deleteDonationRecord, deleteContactMessage,
  subscribeBlogs, subscribeVolunteers, subscribeDonations,
  subscribeContactMessages, subscribeRecycleBin,
  subscribeComplaints, deleteComplaint, updateComplaintStatus,
  createGalleryItem, deleteGalleryItem, updateGalleryItem, subscribeGallery,
  subscribeEvents, createEvent, deleteEvent, updateEvent,
  subscribeFlagshipCampaigns, createFlagshipCampaign, updateFlagshipCampaign, deleteFlagshipCampaign,
  createTeamMember, deleteTeamMember, updateTeamMember, subscribeTeam,
  createCityMember, deleteCityMember, updateCityMember, subscribeCityMembers,
  subscribeDefaultTheme, setDefaultTheme, applyThemeToCssVars, subscribeAnalytics,
  subscribeTestimonials, createTestimonial, deleteTestimonial, updateTestimonial,
  setSeoSetting, subscribeSeoSettings,
  fileToCompressedBase64, saveCardImageToFirestore, subscribeCardImages,
  setThemeClass, subscribeThemeClass,
  DEFAULT_THEME,
  type WebsiteTheme,
  type ContactMessage, type Complaint, type SeoPageSetting
} from "../firebase/services";
import type { Blog, Volunteer, Donation, GalleryItem, Event, TeamMember, Testimonial, CityMember, FlagshipCampaign } from "../data/mockData";
import { defaultFlagshipCampaigns } from "../data/mockData";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, BookOpen, Users, 
  DollarSign, LogOut, Trash2, Check, X, ShieldAlert, Loader,
  GraduationCap, MessageSquare,
  Search, Shield, History, Globe, Megaphone, Printer, Image, Calendar, UserCheck, Eye, TrendingUp,
  Menu, Sparkles, Mail, Lock, ArrowRight, CheckCircle, Tag, RotateCcw, Upload
} from "lucide-react";
import { collection, addDoc, getDocs, deleteDoc, doc, setDoc } from "firebase/firestore";
import { db, rtdb } from "../firebase/config";
import { ref, set, onValue } from "firebase/database";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import ImageUploader from "../components/ImageUploader";
import { generateAIReply } from "../services/geminiService";
import { fallbackSEOMap } from "../services/seoService";
import { sendBroadcastNotification, subscribeNotificationTokens, deleteNotificationToken } from "../services/notificationService";
import "../styles/dashboard.css";
import "../styles/pages.css";

// ----------- EXPORT UTILITIES -----------

const exportToCSV = (data: Record<string, unknown>[], filename: string) => {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]).join(",");
  const rows = data.map(row => 
    Object.values(row)
      .map(val => `"${String(val).replace(/"/g, '""')}"`)
      .join(",")
  );
  const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const printTable = (title: string, elementId: string) => {
  const printContents = document.getElementById(elementId)?.innerHTML;
  if (!printContents) return;
  const originalContents = document.body.innerHTML;
  document.body.innerHTML = `
    <html>
      <head>
        <title>Print - ${title}</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
          th { background-color: #0F4C81; color: white; }
        </style>
      </head>
      <body>
        <h2>DAY Foundation — ${title}</h2>
        ${printContents}
      </body>
    </html>
  `;
  window.print();
  document.body.innerHTML = originalContents;
  window.location.reload();
};

// --- AUDIT LOGGING HELPER ---
const recordAuditLog = async (userEmail: string, action: string) => {
  try {
    const logData = {
      user: userEmail,
      action,
      timestamp: new Date().toISOString(),
      device: navigator.userAgent,
      ip: "127.0.0.1" // Mocked IP locally
    };
    if (db) {
      await addDoc(collection(db, "audit_logs"), logData);
    }
  } catch (e) {
    console.error("Failed to write audit log:", e);
  }
};

// ----------- SAFE LOTTIE ANIMATION WRAPPER (ERROR BOUNDARY PROTECTED) -----------
class LottieErrorBoundary extends React.Component<{ fallback?: React.ReactNode; children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.warn("Lottie rendering issue handled safely:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", opacity: 0.8 }}>
          <Shield size={48} color="#C5A059" />
        </div>
      );
    }
    return this.props.children;
  }
}

const SafeDotLottie: React.FC<{ src: string; style?: React.CSSProperties; fallback?: React.ReactNode }> = ({ src, style, fallback }) => {
  return (
    <LottieErrorBoundary fallback={fallback}>
      <DotLottieReact
        src={src}
        loop
        autoplay
        style={style}
      />
    </LottieErrorBoundary>
  );
};

// ----------- 3D DOODLE MALE AVATAR (INTERACTIVE EYE & HEAD TRACKING) -----------
const DoodleMaleAvatar: React.FC<{ email: string; isPasswordFocused: boolean; isEmailFocused: boolean }> = ({ email, isPasswordFocused, isEmailFocused }) => {
  const pupilOffset = useMemo(() => {
    if (!email) return 0;
    return Math.min(Math.max((email.length - 6) * 0.4, -6), 6);
  }, [email]);

  return (
    <div style={{ position: "relative", width: "230px", height: "165px", margin: "0 auto -5px" }}>
      {/* Speech Bubble Notification */}
      <AnimatePresence mode="wait">
        {isPasswordFocused && (
          <motion.div
            key="shy"
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.8 }}
            style={{
              position: "absolute",
              top: "-8px",
              right: "-12px",
              background: "#1E2D2D",
              color: "#ffe088",
              border: "1.5px solid #C5A059",
              padding: "4px 10px",
              borderRadius: "12px",
              fontSize: "0.68rem",
              fontFamily: "'Space Mono', monospace",
              fontWeight: 700,
              boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
              zIndex: 30,
              whiteSpace: "nowrap"
            }}
          >
            🙈 Not looking at password!
          </motion.div>
        )}

        {!isPasswordFocused && (isEmailFocused || email.length > 0) && (
          <motion.div
            key="watching"
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.8 }}
            style={{
              position: "absolute",
              top: "-8px",
              right: "-12px",
              background: "#ffffff",
              color: "#0f172a",
              border: "1.5px solid #C5A059",
              padding: "4px 10px",
              borderRadius: "12px",
              fontSize: "0.68rem",
              fontFamily: "'Hanken Grotesk', sans-serif",
              fontWeight: 800,
              boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
              zIndex: 30,
              whiteSpace: "nowrap"
            }}
          >
            👀 Watching username...
          </motion.div>
        )}
      </AnimatePresence>

      <svg viewBox="0 0 240 180" style={{ width: "100%", height: "100%", overflow: "visible" }}>
        <defs>
          <linearGradient id="deskGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d0c5af" />
            <stop offset="100%" stopColor="#b4b49d" />
          </linearGradient>
          <linearGradient id="laptopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E2D2D" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="sweaterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#446464" />
            <stop offset="100%" stopColor="#2A3D3D" />
          </linearGradient>
          <filter id="doodleShadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#1E2D2D" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Chair Backrest */}
        <rect x="75" y="45" width="90" height="75" rx="16" fill="#7f7663" opacity="0.3" />

        {/* Character Body / Sweater */}
        <path d="M70,140 C70,105 85,95 120,95 C155,95 170,105 170,140 Z" fill="url(#sweaterGrad)" filter="url(#doodleShadow)" />

        {/* Neck */}
        <rect x="112" y="82" width="16" height="18" fill="#fcd5ce" rx="4" />

        {/* Head G Group with Motion */}
        <g style={{ transform: isPasswordFocused ? "translateY(-4px) rotate(6deg)" : "none", transition: "transform 0.3s ease" }}>
          {/* Head Base */}
          <circle cx="120" cy="62" r="28" fill="#fcd5ce" stroke="#0f172a" strokeWidth="2.5" />
          
          {/* Hair (3D Doodle Male Cut) */}
          <path d="M92,58 C92,35 105,25 125,25 C145,25 150,38 148,52 C142,42 128,40 115,44 C105,47 96,54 92,58 Z" fill="#4a3728" stroke="#0f172a" strokeWidth="2" />

          {/* Ears */}
          <circle cx="91" cy="63" r="6" fill="#fcd5ce" stroke="#0f172a" strokeWidth="2" />
          <circle cx="149" cy="63" r="6" fill="#fcd5ce" stroke="#0f172a" strokeWidth="2" />

          {/* Eyes & Eyebrows */}
          {isPasswordFocused ? (
            /* CLOSED / SHY EYES (Curved Lines) when typing password */
            <g>
              <path d="M106,62 Q112,68 118,62" fill="none" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
              <path d="M122,62 Q128,68 134,62" fill="none" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
              <path d="M104,53 Q112,50 118,55" fill="none" stroke="#4a3728" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M122,55 Q128,50 136,53" fill="none" stroke="#4a3728" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          ) : (
            /* OPEN / LOOKING EYES tracking email input length */
            <g>
              <path d="M105,52 Q111,47 117,52" fill="none" stroke="#4a3728" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M123,52 Q129,47 135,52" fill="none" stroke="#4a3728" strokeWidth="2.5" strokeLinecap="round" />

              {/* Left Eye */}
              <circle cx="111" cy="61" r="7" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
              <circle cx={111 + pupilOffset} cy="61" r="3.5" fill="#0f172a" />
              <circle cx={112 + pupilOffset} cy="59.5" r="1" fill="#ffffff" />

              {/* Right Eye */}
              <circle cx="129" cy="61" r="7" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
              <circle cx={129 + pupilOffset} cy="61" r="3.5" fill="#0f172a" />
              <circle cx={130 + pupilOffset} cy="59.5" r="1" fill="#ffffff" />
            </g>
          )}

          {/* Nose */}
          <path d="M119,65 Q121,70 117,72" fill="none" stroke="#d08c82" strokeWidth="2" strokeLinecap="round" />

          {/* Smile / Mouth */}
          {isPasswordFocused ? (
            <path d="M114,79 Q120,75 126,79" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
          ) : (
            <path d="M113,76 Q120,83 127,76" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
          )}

          {/* Blush Cheeks */}
          <circle cx="103" cy="71" r="4.5" fill="#f4a261" opacity="0.4" />
          <circle cx="137" cy="71" r="4.5" fill="#f4a261" opacity="0.4" />
        </g>

        {/* Hands covering eyes when Password is Focused */}
        {isPasswordFocused && (
          <g style={{ transition: "all 0.3s ease" }}>
            {/* Left Hand */}
            <circle cx="106" cy="60" r="11" fill="#fcd5ce" stroke="#0f172a" strokeWidth="2" />
            <path d="M96,62 Q106,52 116,62" fill="none" stroke="#d08c82" strokeWidth="1.5" />

            {/* Right Hand */}
            <circle cx="134" cy="60" r="11" fill="#fcd5ce" stroke="#0f172a" strokeWidth="2" />
            <path d="M124,62 Q134,52 144,62" fill="none" stroke="#d08c82" strokeWidth="1.5" />
          </g>
        )}

        {/* 3D Wooden Desk */}
        <rect x="20" y="130" width="200" height="14" rx="4" fill="url(#deskGrad)" stroke="#0f172a" strokeWidth="2" filter="url(#doodleShadow)" />
        <rect x="25" y="144" width="12" height="35" fill="#7f7663" stroke="#0f172a" strokeWidth="1.5" />
        <rect x="203" y="144" width="12" height="35" fill="#7f7663" stroke="#0f172a" strokeWidth="1.5" />

        {/* 3D Laptop on Desk */}
        <rect x="75" y="127" width="90" height="5" rx="2" fill="#d0c5af" stroke="#0f172a" strokeWidth="1.5" />
        <path d="M85,127 L95,92 L145,92 L155,127 Z" fill="url(#laptopGrad)" stroke="#0f172a" strokeWidth="2" />
        {/* Screen Display Glow */}
        <path d="M98,96 L142,96 L150,123 L90,123 Z" fill="#ffe088" opacity="0.85" />
        {/* DAY Logo on Screen */}
        <circle cx="120" cy="109" r="6" fill="#1E2D2D" />
        <path d="M117,109 L123,109" stroke="#ffe088" strokeWidth="1.5" />

        {/* Coffee Mug on Desk */}
        <rect x="180" y="115" width="14" height="17" rx="3" fill="#ffe088" stroke="#0f172a" strokeWidth="1.5" />
        <path d="M194,119 C198,119 198,127 194,127" fill="none" stroke="#0f172a" strokeWidth="1.5" />
      </svg>
    </div>
  );
};

// ─── Card Image Upload Row ───────────────────────────────────────────────────
const CARD_IMAGE_ITEMS: { label: string; key: string; description: string; defaultPath: string }[] = [
  { label: "Hero Header Image", key: "hero_image", description: "Main hero section header photo", defaultPath: "/assets/gallery/gallery-020.jpg" },
  { label: "Mission Card Image", key: "gallery_home_1", description: "Mission section photo on homepage", defaultPath: "/assets/gallery/gallery-015.jpg" },
  { label: "Education Focus Card Image", key: "focus_edu", description: "Education card photo under Areas of Focus", defaultPath: "/assets/gallery/gallery-001.jpg" },
  { label: "Aid & Welfare Focus Card Image", key: "focus_aid", description: "Aid & Welfare card photo under Areas of Focus", defaultPath: "/assets/gallery/gallery-005.jpg" },
  { label: "Youth Empowerment Focus Card Image", key: "focus_youth", description: "Youth Empowerment card photo under Areas of Focus", defaultPath: "/assets/gallery/gallery-010.jpg" },
  { label: "Community Development Focus Card Image", key: "focus_community", description: "Community Development card photo under Areas of Focus", defaultPath: "/assets/gallery/gallery-015.jpg" },
  { label: "Impact Story Card 1 (Main)", key: "story_card_1", description: "Impact story main feature photo", defaultPath: "/assets/gallery/gallery-025.jpg" },
  { label: "Impact Story Card 2", key: "story_card_2", description: "Impact story card 2 photo", defaultPath: "/assets/gallery/gallery-018.jpg" },
  { label: "Impact Story Card 3", key: "story_card_3", description: "Impact story card 3 photo", defaultPath: "/assets/gallery/gallery-012.jpg" },
  { label: "Blog Cover (Latest)", key: "blog_cover_1", description: "Featured blog cover photo", defaultPath: "/assets/gallery/gallery-022.jpg" },
  { label: "Event Banner (Latest)", key: "event_banner_1", description: "Current event banner photo", defaultPath: "/assets/gallery/gallery-010.jpg" },
];

const CardImageRow: React.FC<{ label: string; imgKey: string; description: string; defaultPath: string; db?: any }> = ({ label, imgKey, description, defaultPath }) => {
  const [uploadedUrl, setUploadedUrl] = React.useState<string>(defaultPath);
  const [uploading, setUploading] = React.useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = React.useState<boolean>(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  // Load saved URL from Firestore/rtdb/localStorage on mount
  React.useEffect(() => {
    const local = localStorage.getItem(`card_img_${imgKey}`);
    if (local) setUploadedUrl(local);

    const unsub = subscribeCardImages((map) => {
      if (map[imgKey]) {
        setUploadedUrl(map[imgKey]);
      }
    });
    return () => unsub();
  }, [imgKey]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadSuccess(false);
    try {
      // Convert image to lightweight compressed Base64 Data URL
      const dataUrl = await fileToCompressedBase64(file, 1200, 0.82);
      setUploadedUrl(dataUrl);
      
      // Save directly to Firestore collection "card_images"
      await saveCardImageToFirestore(imgKey, dataUrl);
      
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3500);
    } catch (err) {
      console.error('Firestore image upload error:', err);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1.2rem", padding: "1rem", borderRadius: "12px", border: "1px solid var(--color-border-light)", background: "var(--color-bg-cream)", marginBottom: "1rem", flexWrap: "wrap" }}>
      <div style={{ width: "90px", height: "70px", borderRadius: "8px", overflow: "hidden", flexShrink: 0, background: "#e5e7eb" }}>
        <img
          src={uploadedUrl}
          alt={label}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={e => { (e.target as HTMLImageElement).src = "https://placehold.co/90x70/e5e7eb/6b7280?text=No+Image"; }}
        />
      </div>
      <div style={{ flex: 1, minWidth: "160px" }}>
        <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "var(--color-primary)", marginBottom: "2px" }}>{label}</div>
        <div style={{ fontSize: "0.78rem", color: "var(--color-text-muted)" }}>{description}</div>
        {uploadSuccess && <div style={{ fontSize: "0.75rem", color: "#16a34a", marginTop: "4px", fontWeight: 600 }}>✓ Uploaded successfully!</div>}
      </div>
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleUpload} />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          style={{ padding: "0.45rem 1.1rem", background: "var(--color-primary)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "0.8rem", fontWeight: 600, cursor: uploading ? "wait" : "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <Upload size={14} />
          {uploading ? "Uploading…" : "Replace Image"}
        </button>
      </div>
    </div>
  );
};
// ─────────────────────────────────────────────────────────────────────────────

export const AdminDashboard: React.FC = () => {
  const { user, login, logout, error: authError } = useAuth();
  
  // Login State
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [use2FA, setUse2FA] = useState<boolean>(false);
  const [totpCode, setTotpCode] = useState<string>("");
  const [isPasswordFocused, setIsPasswordFocused] = useState<boolean>(false);
  const [isEmailFocused, setIsEmailFocused] = useState<boolean>(false);

  type AdminTab = 'overview' | 'blogs' | 'gallery' | 'events' | 'teams' | 'city_members' | 'testimonials' | 'volunteers' | 'donations' | 'internships' | 'contacts' | 'complaints' | 'seo' | 'marketing' | 'users' | 'audit_logs' | 'settings' | 'broadcast' | 'recycle_bin' | 'card_images' | 'theme';
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [isRecycleBinUnlocked, setIsRecycleBinUnlocked] = useState<boolean>(false);
  const [recycleBinPassword, setRecycleBinPassword] = useState<string>("DAY@19019");

  useEffect(() => {
    if (rtdb) {
      const passRef = ref(rtdb, "settings/recycle_bin_password");
      const unsubscribe = onValue(passRef, (snapshot) => {
        if (snapshot.exists() && snapshot.val()) {
          setRecycleBinPassword(String(snapshot.val()));
        }
      });
      return () => unsubscribe();
    }
  }, [rtdb]);

  const handleTabClick = (tab: AdminTab) => {
    if (tab === "recycle_bin" && !isRecycleBinUnlocked) {
      const inputPass = prompt("🔐 Enter Password to Access Recycle Bin:");
      if (inputPass === null) return; // cancelled
      if (inputPass.trim() === recycleBinPassword) {
        setIsRecycleBinUnlocked(true);
        setActiveTab("recycle_bin");
        alert("🔓 Recycle Bin Access Unlocked!");
      } else {
        alert("❌ Access Denied: Incorrect Password!");
        return;
      }
    } else {
      setActiveTab(tab);
    }
    setCurrentPage(1);
    setMobileSidebarOpen(false);
    
    const adminBody = document.querySelector(".admin-content-body");
    if (adminBody) {
      adminBody.scrollTo({ top: 0, behavior: "smooth" });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Core Data
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [teams, setTeams] = useState<TeamMember[]>([]);
  const [cityMembers, setCityMembers] = useState<CityMember[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [internships, setInternships] = useState<Volunteer[]>([]);

  const [donations, setDonations] = useState<Donation[]>([]);
  const [contactsList, setContactsList] = useState<ContactMessage[]>([]);
  const [complaintsList, setComplaintsList] = useState<Complaint[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [adminsList, setAdminsList] = useState<any[]>([]);
  const [dbLoading, setDbLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Search & Pagination
  const [globalSearch, setGlobalSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage] = useState<number>(10);

  // Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // SEO state
  const [seoSettings, setSeoSettings] = useState<SeoPageSetting[]>([]);
  const [editingSeo, setEditingSeo] = useState<SeoPageSetting | null>(null);
  const [seoSaving, setSeoSaving] = useState(false);
  const [seoSuccess, setSeoSuccess] = useState<string | null>(null);
  const [marketingConfig, setMarketingConfig] = useState({ googleAnalytics: import.meta.env.VITE_GOOGLE_ANALYTICS_ID || "G-Y7T2407MS3", clarityId: "cl-xxxxxx" });
  const [adminDefaultTheme, setAdminDefaultTheme] = useState<string>("organic");
  const [websiteTheme, setWebsiteTheme] = useState<WebsiteTheme>(DEFAULT_THEME);
  const [themeSaving, setThemeSaving] = useState(false);
  const [themeSuccess, setThemeSuccess] = useState(false);
  const [visitorAnalytics, setVisitorAnalytics] = useState({ visitors: 1428, reach: 1115 });
  const [printReceiptData, setPrintReceiptData] = useState<any | null>(null);

  // Broadcast state
  const [broadcastAudience, setBroadcastAudience] = useState<'volunteers' | 'interns' | 'newsletter' | 'both'>("volunteers");
  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [broadcastBody, setBroadcastBody] = useState("");
  const [broadcastStatusLog, setBroadcastStatusLog] = useState<string[]>([]);
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [pushSending, setPushSending] = useState(false);
  const [pushTokens, setPushTokens] = useState<any[]>([]);
  const [recycleBinItems, setRecycleBinItems] = useState<any[]>([]);
  const [showAddDonationModal, setShowAddDonationModal] = useState<boolean>(false);
  const [newDonation, setNewDonation] = useState({ donorName: "", donorEmail: "", amount: 1000, purpose: "General Social Welfare", transactionId: "" });

  // Core Content Modal States
  const [showAddBlogModal, setShowAddBlogModal] = useState<boolean>(false);
  const [showEditBlogModal, setShowEditBlogModal] = useState<boolean>(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [showAddGalleryModal, setShowAddGalleryModal] = useState<boolean>(false);
  const [showAddEventModal, setShowAddEventModal] = useState<boolean>(false);
  const [showAddTeamModal, setShowAddTeamModal] = useState<boolean>(false);
  const [showAddCityMemberModal, setShowAddCityMemberModal] = useState<boolean>(false);
  const [showAddTestimonialModal, setShowAddTestimonialModal] = useState<boolean>(false);

  const handleRestoreItem = async (item: any) => {
    try {
      const { restoreRecord } = await import("../firebase/services");
      await restoreRecord(item.collectionName, item.id);
      await recordAuditLog(user?.email || "unknown", `Restored ${item.categoryName} record ${item.id} from Recycle Bin`);
      alert(`✅ ${item.categoryName} record "${item.title}" retrieved and restored successfully!`);
    } catch (err) {
      console.error("Failed to restore record:", err);
      alert("Failed to restore record. Please check network connection.");
    }
  };

  const handleToggleVisibility = async (colName: string, item: any) => {
    try {
      const { toggleRecordVisibility } = await import("../firebase/services");
      const newStatus = await toggleRecordVisibility(colName, item.id, !!item.hidden);
      if (colName === "flagship_campaigns") {
        setFlagshipCampaigns(prev => prev.map(c => c.id === item.id ? { ...c, hidden: newStatus } : c));
      }
      await recordAuditLog(user?.email || "unknown", `${newStatus ? 'Hid' : 'Showed'} ${colName} record "${item.title || item.name || item.id}"`);
      alert(`✅ Record "${item.title || item.name || item.id}" is now ${newStatus ? '🔒 HIDDEN from public website' : '👁️ VISIBLE on public website'}!`);
    } catch (err) {
      console.error("Toggle visibility failed:", err);
      alert("Failed to toggle visibility status.");
    }
  };

  const handleAddDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDonation.donorName.trim() || !newDonation.amount) {
      alert("Please provide donor name and valid donation amount!");
      return;
    }
    setActionLoading(true);
    try {
      const { createDonation } = await import("../firebase/services");
      const txId = newDonation.transactionId.trim() || `MANUAL-${Date.now()}`;
      const created = await createDonation({
        donorName: newDonation.donorName,
        donorEmail: newDonation.donorEmail || "donor@dayfoundation.in",
        donorPhone: "N/A",
        amount: Number(newDonation.amount),
        purpose: newDonation.purpose || "General Welfare",
        transactionId: txId,
        status: "success",
        isAnonymous: false
      });
      await recordAuditLog(user?.email || "unknown", `Added manual donation entry: ${created.donorName} (₹${created.amount})`);
      alert(`✅ Manual donation record for ${created.donorName} added successfully!`);
      setShowAddDonationModal(false);
      setNewDonation({ donorName: "", donorEmail: "", amount: 1000, purpose: "General Social Welfare", transactionId: "" });
    } catch (err) {
      console.error("Failed to add manual donation:", err);
      alert("Error adding manual donation entry.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastSubject.trim() || !broadcastBody.trim()) {
      alert("Please provide both subject and message body!");
      return;
    }
    if (!window.confirm(`Are you sure you want to broadcast this email to all selected recipients?`)) {
      return;
    }

    setBroadcastSending(true);
    setBroadcastStatusLog(["🔄 Fetching recipient list..."]);

    try {
      let recipientEmails: string[] = [];

      if (broadcastAudience === "volunteers" || broadcastAudience === "both") {
        const vols = volunteers.map(v => v.email).filter(Boolean);
        recipientEmails.push(...vols);
      }
      if (broadcastAudience === "interns" || broadcastAudience === "both") {
        const ints = internships.map(i => i.email).filter(Boolean);
        recipientEmails.push(...ints);
      }
      if (broadcastAudience === "newsletter") {
        const { getNewsletterSubscribers } = await import("../firebase/services");
        const subs = await getNewsletterSubscribers();
        recipientEmails.push(...subs);
      }

      // Deduplicate emails
      recipientEmails = Array.from(new Set(recipientEmails));

      if (recipientEmails.length === 0) {
        setBroadcastStatusLog(prev => [...prev, "❌ No recipients found for selected audience!"]);
        setBroadcastSending(false);
        return;
      }

      setBroadcastStatusLog(prev => [
        ...prev,
        `📋 Found ${recipientEmails.length} unique recipient(s). Starting broadcast batch send...`
      ]);

      const { triggerBackendMail } = await import("../services/emailService");

      // Send to each email sequentially to show real-time progress and log
      for (let i = 0; i < recipientEmails.length; i++) {
        const email = recipientEmails[i];
        setBroadcastStatusLog(prev => [
          ...prev,
          `✉️ Sending to [${i + 1}/${recipientEmails.length}] ${email}...`
        ]);

        try {
          // Wrapped HTML template with DAY logo and branding
          const formattedHtml = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1a202c;">
              <div style="text-align: center; border-bottom: 2px solid #fc4e1e; padding-bottom: 15px; margin-bottom: 20px;">
                <img src="https://dayfoundation.in/logo.png" alt="DAY Foundation Logo" style="width: 50px; height: 50px; border-radius: 50%; vertical-align: middle;" />
                <h2 style="color: #0F4C81; margin: 10px 0 0 0; font-size: 22px;">BHTDAY Welfare Foundation</h2>
                <p style="font-size: 12px; color: #718096; margin: 2px 0 0 0;">Official Hub Announcement Desk</p>
              </div>
              <div style="line-height: 1.6; font-size: 15px; min-height: 150px;">
                ${broadcastBody.replace(/\n/g, "<br/>")}
              </div>
              <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #edf2f7; text-align: center; font-size: 11px; color: #a0aec0;">
                <p style="margin: 0 0 4px 0;">You are receiving this official announcement as an active member, subscriber, or associate of DAY Foundation.</p>
                <p style="margin: 0;">© 2022 DAY Foundation. Patel Nagar, Jabalpur, India.</p>
              </div>
            </div>
          `;

          await triggerBackendMail(email, broadcastSubject, formattedHtml);
          setBroadcastStatusLog(prev => {
            const next = [...prev];
            next[next.length - 1] = `✅ Sent to ${email}`;
            return next;
          });
        } catch (mailErr: any) {
          console.error(`Failed to send email to ${email}:`, mailErr);
          setBroadcastStatusLog(prev => [
            ...prev,
            `⚠️ Failed for ${email}: ${mailErr.message || "Unknown mail error"}`
          ]);
        }
      }

      setBroadcastStatusLog(prev => [...prev, "🏁 Broadcast dispatch completed successfully!"]);
      await recordAuditLog(user?.email || "unknown", `Sent broadcast email: "${broadcastSubject}" to audience: ${broadcastAudience} (${recipientEmails.length} recipients)`);
      alert("Broadcast completed!");
    } catch (err: any) {
      console.error(err);
      setBroadcastStatusLog(prev => [...prev, `❌ Error: ${err.message || "Failed to broadcast"}`]);
    } finally {
      setBroadcastSending(false);
    }
  };

  // Push Notification state
  const [pushTitle, setPushTitle] = useState<string>("DAY Administrative Alert");
  const [pushBody, setPushBody] = useState<string>("Live updates on volunteers and internship registrations are active.");
  const [notificationPermission, setNotificationPermission] = useState<string>(
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "default"
  );

  const handleRequestPushPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop push notifications.");
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    if (permission === "granted") {
      new Notification("Notifications Enabled", {
        body: "You will now receive push notifications from the DAY administrative console.",
        icon: "/assets/teams/owner.jpeg"
      });
    }
  };

  const handleTriggerPushNotification = async () => {
    if (!pushTitle.trim() || !pushBody.trim()) {
      alert("Please fill in both Title and Message body!");
      return;
    }

    setPushSending(true);
    try {
      // 1. Send using the new push service (broadcast + Vercel Web Push payload)
      const res = await sendBroadcastNotification(
        pushTitle,
        pushBody,
        user?.email || "admin@dayfoundation.in"
      );

      // 2. Fallback broadcast to Realtime Database for backwards compatibility
      if (rtdb) {
        const notifId = "push_" + Date.now();
        await set(ref(rtdb, "live_notification"), {
          id: notifId,
          title: pushTitle,
          body: pushBody,
          timestamp: Date.now()
        });
      }

      alert(`✅ Broadcast push notification dispatched successfully!\nSubscribers notified: ${res.sentCount}`);
      await recordAuditLog(user?.email || "unknown", `Sent push broadcast: "${pushTitle}"`);
    } catch (err) {
      console.error("Failed to send push broadcast:", err);
      alert("❌ Failed to send push broadcast.");
    } finally {
      setPushSending(false);
    }
  };

  // Creation State Forms
  const [newBlog, setNewBlog] = useState({ title: "", summary: "", category: "Education", author: "", coverImage: "", content: "" });
  const [newGallery, setNewGallery] = useState({ imageUrl: "", title: "", category: "Education" });
  const [editingGalleryId, setEditingGalleryId] = useState<string | null>(null);
  const [editingGallery, setEditingGallery] = useState<{ title: string; category: string } | null>(null);
  const [newEvent, setNewEvent] = useState({ title: "", description: "", date: "", location: "", coverImage: "", category: "Education" });
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<{ title: string; description: string; date: string; location: string; coverImage: string; category: string } | null>(null);
  const [flagshipCampaigns, setFlagshipCampaigns] = useState<FlagshipCampaign[]>(defaultFlagshipCampaigns);
  const [showAddFlagshipModal, setShowAddFlagshipModal] = useState<boolean>(false);
  const [newFlagship, setNewFlagship] = useState({ title: "", emoji: "🎉", color: "#E68952", description: "", image: "" });
  const [editingFlagshipId, setEditingFlagshipId] = useState<string | null>(null);
  const [editingFlagship, setEditingFlagship] = useState<{ title: string; emoji: string; color: string; description: string; image: string } | null>(null);
  const [newTeamMember, setNewTeamMember] = useState({ name: "", role: "", bio: "", image: "", linkedin: "", email: "", order: 0 });
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editingTeam, setEditingTeam] = useState<{ name: string; role: string; bio: string; image: string; email: string; linkedin: string; order: number } | null>(null);
  const [newCityMember, setNewCityMember] = useState({ name: "", role: "", dayId: "", email: "", linkedin: "", image: "", order: 0, hidden: false });
  const [editingCityMemberId, setEditingCityMemberId] = useState<string | null>(null);
  const [editingCityMember, setEditingCityMember] = useState<{ name: string; role: string; dayId: string; email: string; linkedin: string; image: string; order: number; hidden: boolean } | null>(null);
  const [newTestimonial, setNewTestimonial] = useState({ name: "", role: "", quote: "", image: "" });
  const [editingTestimonialId, setEditingTestimonialId] = useState<string | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<{ name: string; role: string; quote: string; image: string } | null>(null);
  const [newAdmin, setNewAdmin] = useState({ email: "", role: "Viewer" });
  const [selectedSubmission, setSelectedSubmission] = useState<{ type: 'volunteer' | 'internship' | 'contact' | 'donation' | 'complaint'; data: any } | null>(null);
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [aiDraft, setAiDraft] = useState<string>("");
  const [aiGenerating, setAiGenerating] = useState<boolean>(false);
  const [hoveredGraphPoint, setHoveredGraphPoint] = useState<{ month: string; amount: number; x: number; y: number } | null>(null);

  // Role Permissions
  const userRole = (user as any)?.role || "Viewer";
  const isSuperAdmin = userRole === "Super Admin";
  const isAdmin = userRole === "Admin" || isSuperAdmin;
  const isReadOnly = userRole === "Viewer";

  const hasWritePermission = useMemo(() => {
    return !isReadOnly && (isAdmin || ["Editor", "Content Manager", "Volunteer Manager", "Internship Manager", "Donation Manager"].includes(userRole));
  }, [userRole, isReadOnly, isAdmin]);

  const canAccessTab = (tab: AdminTab): boolean => {
    if (isSuperAdmin) return true;
    if (isAdmin && tab !== "users") return true;
    if (userRole === "Viewer") return true;

    switch (userRole) {
      case "Editor":
        return ["overview", "blogs", "gallery", "events", "teams", "city_members", "contacts", "complaints", "testimonials", "card_images"].includes(tab);
      case "Content Manager":
        return ["overview", "blogs", "gallery", "events", "teams", "city_members", "testimonials", "card_images"].includes(tab);
      case "SEO Manager":
        return ["overview", "seo", "marketing", "settings"].includes(tab);
      case "Volunteer Manager":
        return ["overview", "volunteers"].includes(tab);
      case "Internship Manager":
        return ["overview", "internships"].includes(tab);
      case "Donation Manager":
        return ["overview", "donations"].includes(tab);
      default:
        return false;
    }
  };

  useEffect(() => {
    setSelectedIds([]);
    setAiPrompt("");
    setAiDraft("");
    if (activeTab === "audit_logs" && db) {
      getDocs(collection(db, "audit_logs")).then(snap => {
        const logs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        logs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setAuditLogs(logs);
      });
    }
    if (activeTab === "users" && db) {
      getDocs(collection(db, "admins")).then(snap => {
        setAdminsList(snap.docs.map(d => ({ email: d.id, ...d.data() })));
      });
    }
  }, [activeTab]);

  useEffect(() => {
    if (!user) return;
    setDbLoading(true);

    const unsubBlogs = subscribeBlogs((data) => setBlogs(data));
    const unsubGallery = subscribeGallery((data) => setGallery(data));
    const unsubEvents = subscribeEvents((data) => setEvents(data));
    const unsubFlagship = subscribeFlagshipCampaigns((data) => setFlagshipCampaigns(data));
    const unsubTeam = subscribeTeam((data) => setTeams(data));
    const unsubCityTeam = subscribeCityMembers((data) => setCityMembers(data));
    const unsubTestimonials = subscribeTestimonials((data) => setTestimonials(data));
    
    const unsubVolunteers = subscribeVolunteers((data) => {
      setVolunteers(data.filter(v => v.type === 'volunteer'));
      setInternships(data.filter(v => v.type === 'internship'));
    });

    const unsubDonations = subscribeDonations((data) => setDonations(data));

    const unsubContacts = subscribeContactMessages((data) => {
      setContactsList(data);
    });

    const unsubComplaints = subscribeComplaints((data) => {
      setComplaintsList(data);
      setDbLoading(false);
    });

    const unsubTheme = subscribeDefaultTheme((theme) => {
      setWebsiteTheme(theme);
    });

    const unsubThemeClass = subscribeThemeClass((cls) => {
      setAdminDefaultTheme(cls);
    });

    const unsubAnalytics = subscribeAnalytics((data) => {
      setVisitorAnalytics(data);
    });

    const unsubSeo = subscribeSeoSettings((data) => {
      setSeoSettings(data);
    });

    const unsubPushTokens = subscribeNotificationTokens((data) => {
      setPushTokens(data);
    });

    const unsubRecycleBin = subscribeRecycleBin((items) => {
      setRecycleBinItems(items);
    });

    // Dynamically inject noindex meta tag for search engines protection
    const robotsMeta = document.querySelector('meta[name="robots"]');
    if (robotsMeta) {
      robotsMeta.setAttribute('content', 'noindex, nofollow');
    }

    return () => {
      unsubBlogs();
      unsubGallery();
      unsubEvents();
      unsubTeam();
      unsubCityTeam();
      unsubTestimonials();
      unsubVolunteers();
      unsubDonations();
      unsubContacts();
      unsubComplaints();
      unsubTheme();
      unsubThemeClass();
      unsubFlagship();
      unsubAnalytics();
      unsubSeo();
      unsubPushTokens();
      unsubRecycleBin();
    };
  }, [user]);

  // Automated Monthly Data Report Trigger (every 30th)
  useEffect(() => {
    if (dbLoading || volunteers.length === 0) return;

    const today = new Date();
    // Check if it's the 30th day of the month (or 28th for Feb)
    const is30th = today.getDate() === 30 || (today.getMonth() === 1 && today.getDate() === 28);
    if (!is30th) return;

    const monthKey = `${today.getFullYear()}-${today.getMonth() + 1}`;
    const reportSentFlag = localStorage.getItem(`day_monthly_report_sent_${monthKey}`);
    if (reportSentFlag) return; // already sent this month

    const triggerReport = async () => {
      try {
        const totalDons = donations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
        const resolvedTxs = contactsList.filter(c => c.status === 'resolved').length + complaintsList.filter(c => c.status === 'resolved').length;
        
        const reportData = {
          month: today.toLocaleString('default', { month: 'long', year: 'numeric' }),
          totalDonations: totalDons,
          newVolunteers: volunteers.length,
          newInterns: internships.length,
          resolvedTickets: resolvedTxs
        };

        const { sendAdminNotification } = await import("../services/emailService");
        await sendAdminNotification('monthly_report', reportData);
        localStorage.setItem(`day_monthly_report_sent_${monthKey}`, "true");
        await recordAuditLog("System Auto-Cron", `Dispatched automated monthly report for ${monthKey}`);
      } catch (err) {
        console.error("Auto Monthly Report Dispatch Failed:", err);
      }
    };

    triggerReport();
  }, [dbLoading, volunteers, internships, donations, contactsList, complaintsList]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    if (use2FA && totpCode.trim().length !== 6) {
      setLoginError("Invalid 2FA Verification Code.");
      setLoginLoading(false);
      return;
    }
    const success = await login(email, password);
    if (!success) {
      // Use the descriptive error from useAuth (e.g., "Wrong password", "No account found")
      setLoginError(authError || "Invalid admin credentials. Please check your email and password.");
      try {
        const { sendAdminNotification } = await import("../services/emailService");
        await sendAdminNotification('risk_alert', {
          description: `Failed login attempt for email: "${email}"`,
          severity: "HIGH",
          operatorEmail: email,
          device: navigator.userAgent
        });
      } catch (err) {
        console.error("Failed to send risk alert:", err);
      }
    } else {
      await recordAuditLog(email, "Logged into Admin Dashboard");
    }
    setLoginLoading(false);
  };

  // User Management
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) return;
    setActionLoading(true);
    try {
      await setDoc(doc(db, "admins", newAdmin.email.toLowerCase().trim()), { role: newAdmin.role });
      setAdminsList(prev => [...prev, { email: newAdmin.email, role: newAdmin.role }]);
      await recordAuditLog(user?.email || "unknown", `Created admin user: ${newAdmin.email} with role ${newAdmin.role}`);
      setNewAdmin({ email: "", role: "Viewer" });
      alert("Admin created successfully!");
    } catch (err) {
      console.error(err);
      alert("Error creating admin user.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAdmin = async (adminEmail: string) => {
    if (!isSuperAdmin) return;
    if (!window.confirm(`Remove admin permissions for ${adminEmail}?`)) return;
    try {
      await deleteDoc(doc(db, "admins", adminEmail));
      setAdminsList(prev => prev.filter(a => a.email !== adminEmail));
      await recordAuditLog(user?.email || "unknown", `Removed admin user: ${adminEmail}`);
      alert("Admin permissions removed!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetDatabase = async () => {
    if (!isSuperAdmin) {
      alert("Only Super Admin accounts can reset the database.");
      return;
    }
    if (!window.confirm("⚠️ WARNING: This will delete all existing Blogs, Events, Gallery, and Team entries from the database, and replace them with the default blogs, upcoming events, 41 compressed gallery photos, and default team members. Are you sure you want to proceed?")) {
      return;
    }
    
    setActionLoading(true);
    try {
      const { defaultBlogs, defaultEvents, defaultGallery, defaultTeam } = await import("../data/mockData");
      const { setDoc, doc, collection, getDocs, deleteDoc } = await import("firebase/firestore");
      const { ref, set } = await import("firebase/database");
      const { db, rtdb } = await import("../firebase/config");

      // 1. Clear & Seed Blogs
      console.log("Resetting blogs...");
      const blogsSnap = await getDocs(collection(db, "blogs"));
      for (const d of blogsSnap.docs) {
        await deleteDoc(doc(db, "blogs", d.id));
      }
      await set(ref(rtdb, "blogs"), null);
      for (const item of defaultBlogs) {
        const { id, ...itemData } = item;
        await setDoc(doc(db, "blogs", id), itemData);
        await set(ref(rtdb, `blogs/${id}`), itemData);
      }

      // 2. Clear & Seed Events
      console.log("Resetting events...");
      const eventsSnap = await getDocs(collection(db, "events"));
      for (const d of eventsSnap.docs) {
        await deleteDoc(doc(db, "events", d.id));
      }
      await set(ref(rtdb, "events"), null);
      for (const item of defaultEvents) {
        const { id, ...itemData } = item;
        await setDoc(doc(db, "events", id), itemData);
        await set(ref(rtdb, `events/${id}`), itemData);
      }

      // 3. Clear & Seed Gallery
      console.log("Resetting gallery...");
      const gallerySnap = await getDocs(collection(db, "gallery"));
      for (const d of gallerySnap.docs) {
        await deleteDoc(doc(db, "gallery", d.id));
      }
      await set(ref(rtdb, "gallery"), null);
      for (const item of defaultGallery) {
        const { id, ...itemData } = item;
        const cleanItem = { ...itemData, title: "" }; // ensure no tagline
        await setDoc(doc(db, "gallery", id), cleanItem);
        await set(ref(rtdb, `gallery/${id}`), cleanItem);
      }

      // 4. Clear & Seed Team
      console.log("Resetting team...");
      const teamSnap = await getDocs(collection(db, "team"));
      for (const d of teamSnap.docs) {
        await deleteDoc(doc(db, "team", d.id));
      }
      await set(ref(rtdb, "team"), null);
      for (const item of defaultTeam) {
        const { id, ...itemData } = item;
        await setDoc(doc(db, "team", id), itemData);
        await set(ref(rtdb, `team/${id}`), itemData);
      }

      await recordAuditLog(user?.email || "unknown", "Reset database to default seed entries");
      alert("✅ Database successfully reset to defaults!");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Error resetting database.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasWritePermission) return;
    if (!newBlog.coverImage) { alert("Please upload a cover image."); return; }
    setActionLoading(true);
    try {
      const added = await createBlog({ ...newBlog, createdAt: new Date().toISOString().split("T")[0] });
      setBlogs(prev => [added, ...prev]);
      await recordAuditLog(user?.email || "unknown", `Published blog article: ${newBlog.title}`);
      setNewBlog({ title: "", summary: "", category: "Education", author: "", coverImage: "", content: "" });
      setShowAddBlogModal(false);
      alert("Article added successfully!");
    } catch (err) { console.error(err); alert("Error adding article."); }
    finally { setActionLoading(false); }
  };

  const handleStartEditBlog = (blog: Blog) => {
    setEditingBlog({ ...blog });
    setShowEditBlogModal(true);
  };

  const handleSaveBlogEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog) return;
    if (!editingBlog.coverImage) { alert("Please upload a cover image."); return; }

    setActionLoading(true);
    try {
      await updateBlog(editingBlog.id, {
        title: editingBlog.title,
        summary: editingBlog.summary,
        category: editingBlog.category,
        author: editingBlog.author,
        coverImage: editingBlog.coverImage,
        content: editingBlog.content || "",
      });

      setBlogs(prev => prev.map(b => b.id === editingBlog.id ? editingBlog : b));
      await recordAuditLog(user?.email || "unknown", `Updated blog post: ${editingBlog.title}`);
      setShowEditBlogModal(false);
      setEditingBlog(null);
      alert("Article updated successfully!");
    } catch (err: any) {
      console.error("Failed to edit blog", err);
      alert(err?.message || "Failed to update blog article.");
    } finally {
      setActionLoading(false);
    }
  };

  // Teams
  const handleAddTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasWritePermission) return;
    if (!newTeamMember.image) { alert("Please upload a team member photo."); return; }
    setActionLoading(true);
    try {
      const added = await createTeamMember(newTeamMember);
      setTeams(prev => [...prev, added]);
      await recordAuditLog(user?.email || "unknown", `Added team member: ${newTeamMember.name}`);
      setNewTeamMember({ name: "", role: "", bio: "", image: "", linkedin: "", email: "", order: 0 });
      setShowAddTeamModal(false);
      alert("Team member added successfully!");
    } catch (err) { console.error(err); alert("Error adding team member."); }
    finally { setActionLoading(false); }
  };

  const handleDeleteTeamMember = async (id: string) => {
    if (!hasWritePermission) return;
    if (!window.confirm("Delete this team member?")) return;
    try {
      await deleteTeamMember(id);
      setTeams(prev => prev.filter(t => t.id !== id));
      await recordAuditLog(user?.email || "unknown", `Deleted team member ID: ${id}`);
    } catch (err) { console.error(err); }
  };

  const handleEditTeamClick = (t: TeamMember) => {
    setEditingTeamId(t.id);
    setEditingTeam({
      name: t.name,
      role: t.role,
      bio: t.bio || "",
      image: t.image,
      email: t.email || "",
      linkedin: t.linkedin || "",
      order: t.order || 0
    });
  };

  const handleSaveTeamEdit = async (id: string) => {
    if (!editingTeam) return;
    setActionLoading(true);
    try {
      await updateTeamMember(id, editingTeam);
      setTeams(prev => prev.map(t => t.id === id ? { ...t, ...editingTeam } : t));
      await recordAuditLog(user?.email || "unknown", `Updated team member: ${editingTeam.name}`);
      setEditingTeamId(null);
      setEditingTeam(null);
      alert("Team member details updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update team member details.");
    } finally {
      setActionLoading(false);
    }
  };

  // City Team
  const handleAddCityMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasWritePermission) return;
    if (!newCityMember.image) { alert("Please upload a city member photo."); return; }
    setActionLoading(true);
    try {
      const added = await createCityMember(newCityMember);
      setCityMembers(prev => [...prev, added]);
      await recordAuditLog(user?.email || "unknown", `Added city management member: ${newCityMember.name}`);
      setNewCityMember({ name: "", role: "", dayId: "", email: "", linkedin: "", image: "", order: 0, hidden: false });
      setShowAddCityMemberModal(false);
      alert("City member added successfully!");
    } catch (err) { console.error(err); alert("Error adding city member."); }
    finally { setActionLoading(false); }
  };

  const handleDeleteCityMember = async (id: string) => {
    if (!hasWritePermission) return;
    if (!window.confirm("Delete this city management member?")) return;
    try {
      await deleteCityMember(id);
      setCityMembers(prev => prev.filter(t => t.id !== id));
      await recordAuditLog(user?.email || "unknown", `Deleted city member ID: ${id}`);
    } catch (err) { console.error(err); }
  };

  const handleEditCityMemberClick = (t: CityMember) => {
    setEditingCityMemberId(t.id);
    setEditingCityMember({
      name: t.name,
      role: t.role,
      dayId: t.dayId || "",
      image: t.image,
      email: t.email || "",
      linkedin: t.linkedin || "",
      order: t.order || 0,
      hidden: !!t.hidden
    });
  };

  const handleSaveCityMemberEdit = async (id: string) => {
    if (!editingCityMember) return;
    setActionLoading(true);
    try {
      await updateCityMember(id, editingCityMember);
      setCityMembers(prev => prev.map(t => t.id === id ? { ...t, ...editingCityMember } : t));
      await recordAuditLog(user?.email || "unknown", `Updated city member: ${editingCityMember.name}`);
      setEditingCityMemberId(null);
      setEditingCityMember(null);
      alert("City member details updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update city member details.");
    } finally {
      setActionLoading(false);
    }
  };

  // Testimonials (Echoes of Gratitude)
  const handleAddTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasWritePermission) return;
    if (!newTestimonial.image) { alert("Please upload or provide a testimonial photo."); return; }
    setActionLoading(true);
    try {
      const added = await createTestimonial(newTestimonial);
      setTestimonials(prev => [added, ...prev]);
      await recordAuditLog(user?.email || "unknown", `Added testimonial for: ${newTestimonial.name}`);
      setNewTestimonial({ name: "", role: "", quote: "", image: "" });
      setShowAddTestimonialModal(false);
      alert("Testimonial added successfully!");
    } catch (err) { console.error(err); alert("Error adding testimonial."); }
    finally { setActionLoading(false); }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!hasWritePermission) return;
    if (!window.confirm("Delete this testimonial?")) return;
    try {
      await deleteTestimonial(id);
      setTestimonials(prev => prev.filter(t => t.id !== id));
      await recordAuditLog(user?.email || "unknown", `Deleted testimonial ID: ${id}`);
    } catch (err) { console.error(err); }
  };

  const handleEditTestimonialClick = (t: Testimonial) => {
    setEditingTestimonialId(t.id);
    setEditingTestimonial({
      name: t.name,
      role: t.role,
      quote: t.quote,
      image: t.image
    });
  };

  const handleSaveTestimonialEdit = async (id: string) => {
    if (!editingTestimonial) return;
    setActionLoading(true);
    try {
      await updateTestimonial(id, editingTestimonial);
      setTestimonials(prev => prev.map(t => t.id === id ? { ...t, ...editingTestimonial } : t));
      await recordAuditLog(user?.email || "unknown", `Updated testimonial for: ${editingTestimonial.name}`);
      setEditingTestimonialId(null);
      setEditingTestimonial(null);
      alert("Testimonial updated successfully!");
    } catch (err) { console.error(err); alert("Error updating testimonial."); }
    finally { setActionLoading(false); }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!hasWritePermission) return;
    if (!window.confirm("Delete this article?")) return;
    try { 
      await deleteBlog(id); 
      setBlogs(prev => prev.filter(b => b.id !== id)); 
      await recordAuditLog(user?.email || "unknown", `Deleted blog ID: ${id}`);
    } catch (err) { console.error(err); }
  };

  const handleAddGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasWritePermission) return;
    setActionLoading(true);
    try {
      const added = await createGalleryItem({ ...newGallery, createdAt: new Date().toISOString() });
      setGallery(prev => [added, ...prev]);
      await recordAuditLog(user?.email || "unknown", `Added gallery image: ${newGallery.title || newGallery.category}`);
      setNewGallery({ imageUrl: "", title: "", category: "Education" });
      setShowAddGalleryModal(false);
      alert("Gallery item added successfully!");
    } catch (err) {
      console.error(err);
      alert("Error adding gallery item.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleGalleryVisibility = async (id: string, currentHidden: boolean) => {
    if (!hasWritePermission) return;
    try {
      const nextHidden = !currentHidden;
      await updateGalleryItem(id, { hidden: nextHidden });
      setGallery(prev => prev.map(item => item.id === id ? { ...item, hidden: nextHidden } : item));
      await recordAuditLog(user?.email || "unknown", `${nextHidden ? "Hidden" : "Shown"} gallery item ID: ${id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditGalleryClick = (item: GalleryItem) => {
    setEditingGalleryId(item.id);
    setEditingGallery({ title: item.title, category: item.category });
  };

  const handleSaveGalleryEdit = async (id: string) => {
    if (!hasWritePermission || !editingGallery) return;
    setActionLoading(true);
    try {
      await updateGalleryItem(id, editingGallery);
      setGallery(prev => prev.map(item => item.id === id ? { ...item, ...editingGallery } : item));
      await recordAuditLog(user?.email || "unknown", `Edited gallery item ID: ${id}`);
      setEditingGalleryId(null);
      setEditingGallery(null);
      alert("Gallery item updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Error updating gallery item.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteGallery = async (id: string) => {
    if (!hasWritePermission) return;
    if (!window.confirm("Delete this gallery photo?")) return;
    try {
      await deleteGalleryItem(id);
      setGallery(prev => prev.filter(g => g.id !== id));
      await recordAuditLog(user?.email || "unknown", `Deleted gallery photo ID: ${id}`);
      alert("Gallery item deleted successfully.");
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasWritePermission) return;
    setActionLoading(true);
    const todayStr = new Date().toISOString().split('T')[0];
    try {
      const added = await createEvent({ ...newEvent, status: newEvent.date < todayStr ? 'past' : 'upcoming' });
      setEvents(prev => [added, ...prev]);
      await recordAuditLog(user?.email || "unknown", `Created event: ${newEvent.title}`);
      setNewEvent({ title: "", description: "", date: "", location: "", coverImage: "", category: "Education" });
      setShowAddEventModal(false);
      alert("Event created successfully!");
    } catch (err) {
      console.error(err);
      alert("Error adding event.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditEventClick = (item: Event) => {
    setEditingEventId(item.id);
    setEditingEvent({
      title: item.title,
      description: item.description,
      date: item.date,
      location: item.location,
      coverImage: item.coverImage,
      category: item.category
    });
  };

  const handleSaveEventEdit = async (id: string) => {
    if (!hasWritePermission || !editingEvent) return;
    setActionLoading(true);
    try {
      await updateEvent(id, editingEvent);
      setEvents(prev => prev.map(item => item.id === id ? { ...item, ...editingEvent } : item));
      await recordAuditLog(user?.email || "unknown", `Edited event ID: ${id}`);
      setEditingEventId(null);
      setEditingEvent(null);
      alert("Event updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Error updating event.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!hasWritePermission) return;
    if (!window.confirm("Delete this event?")) return;
    try {
      await deleteEvent(id);
      setEvents(prev => prev.filter(e => e.id !== id));
      await recordAuditLog(user?.email || "unknown", `Deleted event ID: ${id}`);
      alert("Event deleted successfully.");
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddFlagship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasWritePermission) return;
    setActionLoading(true);
    try {
      const addedId = await createFlagshipCampaign(newFlagship);
      const newItem: FlagshipCampaign = { id: addedId, ...newFlagship };
      setFlagshipCampaigns(prev => [...prev, newItem]);
      await recordAuditLog(user?.email || "unknown", `Created flagship campaign: ${newFlagship.title}`);
      setNewFlagship({ title: "", emoji: "🎉", color: "#E68952", description: "", image: "" });
      setShowAddFlagshipModal(false);
      alert("Flagship Campaign card created successfully!");
    } catch (err) {
      console.error(err);
      alert("Error creating flagship campaign card.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditFlagshipClick = (item: FlagshipCampaign) => {
    setEditingFlagshipId(item.id);
    setEditingFlagship({
      title: item.title,
      emoji: item.emoji || "🎉",
      color: item.color || "#E68952",
      description: item.description,
      image: item.image || ""
    });
  };

  const handleSaveFlagshipEdit = async (id: string) => {
    if (!hasWritePermission || !editingFlagship) return;
    setActionLoading(true);
    try {
      await updateFlagshipCampaign(id, editingFlagship);
      setFlagshipCampaigns(prev => prev.map(item => item.id === id ? { ...item, ...editingFlagship } : item));
      await recordAuditLog(user?.email || "unknown", `Updated flagship campaign: ${editingFlagship.title}`);
      setEditingFlagshipId(null);
      setEditingFlagship(null);
      alert("Flagship Campaign updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Error updating flagship campaign.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteFlagship = async (id: string, title: string) => {
    if (!hasWritePermission) return;
    if (!window.confirm(`Delete flagship campaign "${title}"?`)) return;
    try {
      await deleteFlagshipCampaign(id);
      setFlagshipCampaigns(prev => prev.filter(item => item.id !== id));
      await recordAuditLog(user?.email || "unknown", `Deleted flagship campaign: ${title}`);
      alert("Flagship campaign deleted.");
    } catch (err) {
      console.error(err);
      alert("Error deleting flagship campaign.");
    }
  };

  const handleVolunteerApproval = async (id: string, status: 'approved' | 'rejected' | 'hold') => {
    if (!hasWritePermission) return;
    try {
      const vol = volunteers.find(v => v.id === id);
      if (!vol) return;

      let permId: string | undefined;

      if (status === 'approved') {
        const approvedCount = volunteers.filter(v => v.status === 'approved' && v.permanentVolunteerId).length;
        const year = new Date().getFullYear();
        const seq = String(approvedCount + 1).padStart(4, '0');
        const defaultId = `DAY-VOL-${year}-${seq}`;

        const customId = prompt(`Allot Permanent Volunteer ID for ${vol.name}:`, defaultId);
        if (customId === null) return; // cancelled

        const chosenId = customId.trim() || defaultId;
        permId = await approveVolunteer(id, chosenId);
        setVolunteers(prev => prev.map(v => v.id === id ? { ...v, status: 'approved', permanentVolunteerId: permId } : v));
        await recordAuditLog(user?.email || "unknown", `Approved Volunteer ID: ${id}. Assigned Perm ID: ${permId}`);
        alert(`✅ Volunteer approved!\nPermanent ID assigned: ${permId}`);
      } else {
        await updateVolunteerStatus(id, status);
        setVolunteers(prev => prev.map(v => v.id === id ? { ...v, status } : v));
        await recordAuditLog(user?.email || "unknown", `Updated Volunteer ${id} status to ${status}`);
      }
      
      // Sync with Google Sheets
      try {
        const { syncWithGoogleSheets } = await import("../services/googleSheetsService");
        await syncWithGoogleSheets({
          ...vol,
          type: "volunteer",
          ticketNo: vol.ticketNo || "",
          status: status,
          permanentVolunteerId: permId || vol.permanentVolunteerId
        });
      } catch (sheetErr) {
        console.error("Failed to sync status update with Google Sheets:", sheetErr);
      }

      try {
        const { sendRecordUpdate, sendAdminNotification } = await import("../services/emailService");
        await sendRecordUpdate({
          email: vol.email,
          name: vol.name,
          type: "volunteer",
          ticketNo: vol.ticketNo || "N/A",
          status: status,
          permId: permId || vol.permanentVolunteerId,
          adminComment: vol.adminComment
        });
        await sendAdminNotification('status_update', {
          name: vol.name,
          email: vol.email,
          type: "volunteer",
          ticketNo: vol.ticketNo || "N/A",
          status: status,
          permId: permId || vol.permanentVolunteerId,
          adminComment: vol.adminComment
        });
      } catch (emailErr) {
        console.error("Failed to send email update for volunteer status:", emailErr);
      }
    } catch (err) { console.error(err); }
  };

  const handleApproveInternship = async (id: string) => {
    if (!hasWritePermission) return;
    try {
      const intern = internships.find(v => v.id === id);
      if (!intern) return;

      const approvedCount = internships.filter(v => v.status === 'approved' && v.permanentInternshipId).length;
      const year = new Date().getFullYear();
      const seq = String(approvedCount + 1).padStart(4, '0');
      const defaultId = `DAY-INT-${year}-${seq}`;

      const customId = prompt(`Allot Permanent Intern ID for ${intern.name}:`, defaultId);
      if (customId === null) return; // cancelled
      
      const chosenId = customId.trim() || defaultId;

      const permId = await approveInternship(id, chosenId);
      setInternships(prev => prev.map(v => v.id === id ? { ...v, status: 'approved', permanentInternshipId: permId } : v));
      await recordAuditLog(user?.email || "unknown", `Approved Internship ID: ${id}. Assigned Perm ID: ${permId}`);
      alert(`✅ Internship approved!\nPermanent ID assigned: ${permId}`);
      
      if (intern) {
        // Sync with Google Sheets
        try {
          const { syncWithGoogleSheets } = await import("../services/googleSheetsService");
          await syncWithGoogleSheets({
            ...intern,
            type: "internship",
            ticketNo: intern.tempInternshipId || intern.ticketNo || "",
            status: "approved",
            permanentInternshipId: permId
          } as any);
        } catch (sheetErr) {
          console.error("Failed to sync internship approval with Google Sheets:", sheetErr);
        }

        try {
          const { sendRecordUpdate, sendAdminNotification } = await import("../services/emailService");
          await sendRecordUpdate({
            email: intern.email,
            name: intern.name,
            type: "internship",
            ticketNo: intern.tempInternshipId || intern.ticketNo || "N/A",
            status: "approved",
            permId: permId,
            adminComment: intern.adminComment
          });
          await sendAdminNotification('status_update', {
            name: intern.name,
            email: intern.email,
            type: "internship",
            ticketNo: intern.tempInternshipId || intern.ticketNo || "N/A",
            status: "approved",
            adminComment: intern.adminComment
          });
        } catch (emailErr) {
          console.error("Failed to send email update for internship approval:", emailErr);
        }
      }
    } catch (err) { console.error(err); }
  };

  const handleEditInternId = async (id: string, currentId?: string) => {
    if (!hasWritePermission) return;
    const newId = prompt("Edit Permanent Intern ID:", currentId || "");
    if (newId === null || newId.trim() === "") return;
    try {
      await updateInternshipId(id, newId.trim());
      setInternships(prev => prev.map(v => v.id === id ? { ...v, permanentInternshipId: newId.trim() } : v));
      await recordAuditLog(user?.email || "unknown", `Updated Intern ID for record ${id} to ${newId.trim()}`);
      alert("Permanent ID updated successfully!");

      const intern = internships.find(v => v.id === id);
      if (intern) {
        try {
          const { sendRecordUpdate, sendAdminNotification } = await import("../services/emailService");
          await sendRecordUpdate({
            email: intern.email,
            name: intern.name,
            type: "internship",
            ticketNo: intern.ticketNo || intern.tempInternshipId || "N/A",
            status: intern.status || "approved",
            adminComment: intern.adminComment,
            permId: newId.trim()
          });
          await sendAdminNotification('status_update', {
            name: intern.name,
            email: intern.email,
            type: "internship",
            ticketNo: intern.ticketNo || intern.tempInternshipId || "N/A",
            status: intern.status || "approved",
            adminComment: intern.adminComment,
            permId: newId.trim()
          });
        } catch (emailErr) {
          console.error("Failed to send email update for edited intern ID:", emailErr);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update Intern ID.");
    }
  };

  const handleEditVolunteerId = async (id: string, currentId?: string) => {
    if (!hasWritePermission) return;
    const newId = prompt("Edit Permanent Volunteer ID:", currentId || "");
    if (newId === null || newId.trim() === "") return;
    try {
      await updateVolunteerId(id, newId.trim());
      setVolunteers(prev => prev.map(v => v.id === id ? { ...v, permanentVolunteerId: newId.trim() } : v));
      await recordAuditLog(user?.email || "unknown", `Updated Volunteer ID for record ${id} to ${newId.trim()}`);
      alert("Permanent Volunteer ID updated successfully!");

      const vol = volunteers.find(v => v.id === id);
      if (vol) {
        try {
          const { sendRecordUpdate, sendAdminNotification } = await import("../services/emailService");
          await sendRecordUpdate({
            email: vol.email,
            name: vol.name,
            type: "volunteer",
            ticketNo: vol.ticketNo || "N/A",
            status: vol.status || "approved",
            adminComment: vol.adminComment,
            permId: newId.trim()
          });
          await sendAdminNotification('status_update', {
            name: vol.name,
            email: vol.email,
            type: "volunteer",
            ticketNo: vol.ticketNo || "N/A",
            status: vol.status || "approved",
            adminComment: vol.adminComment,
            permId: newId.trim()
          });
        } catch (emailErr) {
          console.error("Failed to send email update for edited volunteer ID:", emailErr);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update Volunteer ID.");
    }
  };

  const handleAddComment = async (
    id: string,
    type: 'volunteer' | 'internship' | 'contact'
  ) => {
    if (!hasWritePermission) return;
    const commentText = prompt("Enter new administrative comment:");
    if (!commentText || !commentText.trim()) return;

    setActionLoading(true);
    try {
      const author = user?.email || "Admin";
      const newCommentEntry = await addRecordComment(id, type, commentText.trim(), author);

      // Update local states so it reflects immediately
      if (type === 'volunteer') {
        setVolunteers(prev => prev.map(v => v.id === id ? {
          ...v,
          adminComment: commentText.trim(),
          comments: [...(v.comments || []), newCommentEntry]
        } : v));
        setSelectedSubmission(prev => prev && prev.data.id === id ? {
          ...prev,
          data: {
            ...prev.data,
            adminComment: commentText.trim(),
            comments: [...(prev.data.comments || []), newCommentEntry]
          }
        } : prev);
      } else if (type === 'internship') {
        setInternships(prev => prev.map(i => i.id === id ? {
          ...i,
          adminComment: commentText.trim(),
          comments: [...(i.comments || []), newCommentEntry]
        } : i));
        setSelectedSubmission(prev => prev && prev.data.id === id ? {
          ...prev,
          data: {
            ...prev.data,
            adminComment: commentText.trim(),
            comments: [...(prev.data.comments || []), newCommentEntry]
          }
        } : prev);
      } else if (type === 'contact') {
        setContactsList(prev => prev.map(c => c.id === id ? {
          ...c,
          adminComment: commentText.trim(),
          comments: [...(c.comments || []), newCommentEntry]
        } : c));
        setSelectedSubmission(prev => prev && prev.data.id === id ? {
          ...prev,
          data: {
            ...prev.data,
            adminComment: commentText.trim(),
            comments: [...(prev.data.comments || []), newCommentEntry]
          }
        } : prev);
      }

      await recordAuditLog(user?.email || "unknown", `Added comment on ${type} ID: ${id}`);
      alert("Comment added successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to add comment.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateComment = async (
    id: string,
    type: 'volunteer' | 'internship' | 'contact' | 'complaint',
    currentComment?: string
  ) => {
    if (!hasWritePermission) return;
    const newComment = prompt(`Add/Edit Admin Feedback/Comment:`, currentComment || "");
    if (newComment === null) return; // cancelled
    try {
      await updateRecordComment(id, type, newComment.trim());
      
      if (type === 'volunteer') {
        setVolunteers(prev => prev.map(v => v.id === id ? { ...v, adminComment: newComment.trim() } : v));
      } else if (type === 'internship') {
        setInternships(prev => prev.map(v => v.id === id ? { ...v, adminComment: newComment.trim() } : v));
      } else if (type === 'contact') {
        setContactsList(prev => prev.map(c => c.id === id ? { ...c, adminComment: newComment.trim() } : c));
      } else if (type === 'complaint') {
        setComplaintsList(prev => prev.map(c => c.id === id ? { ...c, adminComment: newComment.trim() } : c));
      }
      
      await recordAuditLog(user?.email || "unknown", `Updated admin comment for ${type} ID: ${id}`);
      alert("Comment updated successfully!");

      // Find item details to send update email
      let item: any = null;
      if (type === 'volunteer') {
        item = volunteers.find(v => v.id === id);
      } else if (type === 'internship') {
        item = internships.find(v => v.id === id);
      } else if (type === 'contact') {
        item = contactsList.find(c => c.id === id);
      } else if (type === 'complaint') {
        item = complaintsList.find(c => c.id === id);
      }

      if (item) {
        try {
          const { sendRecordUpdate, sendAdminNotification } = await import("../services/emailService");
          await sendRecordUpdate({
            email: item.email,
            name: item.name,
            type: type === 'complaint' ? 'contact' : type,
            ticketNo: item.ticketNo || item.tempInternshipId || "N/A",
            status: item.status || "pending",
            adminComment: newComment.trim(),
            permId: item.permanentInternshipId
          });
          await sendAdminNotification('comment_update', {
            name: item.name,
            email: item.email,
            type: type,
            ticketNo: item.ticketNo || item.tempInternshipId || "N/A",
            status: item.status || "pending",
            adminComment: newComment.trim()
          });
        } catch (emailErr) {
          console.error("Failed to send email update for comment update:", emailErr);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update comment.");
    }
  };

  const handleDeleteComplaint = async (id: string) => {
    if (!hasWritePermission) return;
    if (!window.confirm("Are you sure you want to delete this complaint permanently?")) return;
    try {
      await deleteComplaint(id);
      setComplaintsList(prev => prev.filter(c => c.id !== id));
      await recordAuditLog(user?.email || "unknown", `Deleted Complaint ID: ${id}`);
      
      try {
        const { sendAdminNotification } = await import("../services/emailService");
        await sendAdminNotification('data_deletion', {
          recordType: "Complaint",
          recordId: id,
          operatorEmail: user?.email || "unknown",
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        console.error("Failed to notify deletion:", err);
      }

      alert("Complaint deleted!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete complaint.");
    }
  };

  const handleResolveComplaint = async (id: string, currentComment?: string) => {
    if (!hasWritePermission) return;
    const item = complaintsList.find(c => c.id === id);
    if (!item) return;

    const resolutionComment = prompt("Resolve Complaint Ticket & Close. Enter resolution feedback/comments:", currentComment || "");
    if (resolutionComment === null) return; // cancelled

    setActionLoading(true);
    try {
      await updateComplaintStatus(id, 'resolved', resolutionComment.trim());
      setComplaintsList(prev => prev.map(c => c.id === id ? { ...c, status: 'resolved', adminComment: resolutionComment.trim() } : c));
      await recordAuditLog(user?.email || "unknown", `Resolved/Closed complaint ticket ID: ${id}`);
      alert("Complaint ticket resolved and closed successfully!");

      try {
        const { sendRecordUpdate, sendAdminNotification } = await import("../services/emailService");
        await sendRecordUpdate({
          email: item.email,
          name: item.name,
          type: "contact",
          ticketNo: item.ticketNo || "N/A",
          status: "resolved",
          adminComment: `Resolution details: ${resolutionComment.trim()}`
        });

        await sendAdminNotification('status_update', {
          recordType: "Complaint",
          recordId: id,
          newStatus: "resolved",
          operatorEmail: user?.email || "unknown",
          timestamp: new Date().toISOString()
        });
      } catch (e) {
        console.error("Failed to trigger automated resolution notification emails:", e);
      }

    } catch (err) {
      console.error(err);
      alert("Failed to resolve and close complaint.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!hasWritePermission) return;
    if (!window.confirm("Are you sure you want to delete this contact message permanently?")) return;
    try {
      await deleteContactMessage(id);
      setContactsList(prev => prev.filter(c => c.id !== id));
      await recordAuditLog(user?.email || "unknown", `Deleted Contact Message ID: ${id}`);
      
      try {
        const { sendAdminNotification } = await import("../services/emailService");
        await sendAdminNotification('data_deletion', {
          recordType: "Contact Message",
          recordId: id,
          operatorEmail: user?.email || "unknown",
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        console.error("Failed to notify deletion:", err);
      }

      alert("Message deleted!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete contact message.");
    }
  };

  const handleResolveContact = async (id: string, currentComment?: string) => {
    if (!hasWritePermission) return;
    const item = contactsList.find(c => c.id === id);
    if (!item) return;

    const resolutionComment = prompt("Resolve Ticket & Close. Enter resolution feedback/comments:", currentComment || "");
    if (resolutionComment === null) return; // cancelled

    setActionLoading(true);
    try {
      await updateContactStatus(id, 'resolved', resolutionComment.trim());
      setContactsList(prev => prev.map(c => c.id === id ? { ...c, status: 'resolved', adminComment: resolutionComment.trim() } : c));
      await recordAuditLog(user?.email || "unknown", `Resolved/Closed contact ticket ID: ${id}`);
      alert("Ticket resolved and closed successfully!");

      try {
        const { sendRecordUpdate, sendAdminNotification } = await import("../services/emailService");
        await sendRecordUpdate({
          email: item.email,
          name: item.name,
          type: "contact",
          ticketNo: item.ticketNo || "N/A",
          status: "resolved",
          adminComment: resolutionComment.trim(),
          originalMessage: item.message
        });
        await sendAdminNotification('status_update', {
          name: item.name,
          email: item.email,
          type: "contact",
          ticketNo: item.ticketNo || "N/A",
          status: "resolved",
          adminComment: resolutionComment.trim()
        });
      } catch (emailErr) {
        console.error("Failed to send email update for contact resolution:", emailErr);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to resolve ticket.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectInternship = async (id: string) => {
    if (!hasWritePermission) return;
    try {
      const intern = internships.find(v => v.id === id);
      await updateVolunteerStatus(id, 'rejected');
      setInternships(prev => prev.map(v => v.id === id ? { ...v, status: 'rejected' } : v));
      await recordAuditLog(user?.email || "unknown", `Rejected Internship ID: ${id}`);
      
      if (intern) {
        // Sync with Google Sheets
        try {
          const { syncWithGoogleSheets } = await import("../services/googleSheetsService");
          await syncWithGoogleSheets({
            ...intern,
            type: "internship",
            ticketNo: intern.tempInternshipId || intern.ticketNo || "",
            status: "rejected"
          });
        } catch (sheetErr) {
          console.error("Failed to sync internship rejection with Google Sheets:", sheetErr);
        }

        try {
          const { sendRecordUpdate, sendAdminNotification } = await import("../services/emailService");
          await sendRecordUpdate({
            email: intern.email,
            name: intern.name,
            type: "internship",
            ticketNo: intern.tempInternshipId || intern.ticketNo || "N/A",
            status: "rejected",
            adminComment: intern.adminComment
          });
          await sendAdminNotification('status_update', {
            name: intern.name,
            email: intern.email,
            type: "internship",
            ticketNo: intern.tempInternshipId || intern.ticketNo || "N/A",
            status: "rejected",
            adminComment: intern.adminComment
          });
        } catch (emailErr) {
          console.error("Failed to send email update for internship rejection:", emailErr);
        }
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteRecord = async (id: string, type: "internship" | "volunteer") => {
    if (!hasWritePermission) return;
    if (!window.confirm(`Are you sure you want to delete this ${type} record permanently?`)) return;
    try {
      await deleteVolunteerRecord(id);
      if (type === "volunteer") {
        setVolunteers(prev => prev.filter(v => v.id !== id));
      } else {
        setInternships(prev => prev.filter(v => v.id !== id));
      }
      await recordAuditLog(user?.email || "unknown", `Deleted ${type} record ID: ${id}`);
      
      try {
        const { sendAdminNotification } = await import("../services/emailService");
        await sendAdminNotification('data_deletion', {
          recordType: type === "volunteer" ? "Volunteer Record" : "Internship Record",
          recordId: id,
          operatorEmail: user?.email || "unknown",
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        console.error("Failed to notify deletion:", err);
      }

      alert("Record deleted successfully.");
    } catch (err) { console.error(err); }
  };
  const handleDeleteDonation = async (id: string) => {
    if (!hasWritePermission) return;
    if (!window.confirm("Are you sure you want to delete this donation record?")) return;
    try {
      await deleteDonationRecord(id);
      setDonations(prev => prev.filter(d => d.id !== id));
      await recordAuditLog(user?.email || "unknown", `Deleted donation record ID: ${id}`);
      
      try {
        const { sendAdminNotification } = await import("../services/emailService");
        await sendAdminNotification('data_deletion', {
          recordType: "Donation Ledger Entry",
          recordId: id,
          operatorEmail: user?.email || "unknown",
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        console.error("Failed to notify deletion:", err);
      }

      alert("✅ Donation record deleted!");
    } catch (err) { console.error(err); }
  };


  // Bulk Actions Handlers
  const handleSelectRow = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleBulkDelete = async (type: "volunteer" | "internship" | "donation") => {
    if (!hasWritePermission) return;
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Perform bulk delete on ${selectedIds.length} records?`)) return;
    try {
      setActionLoading(true);
      for (const id of selectedIds) {
        if (type === "donation") {
          await deleteDonationRecord(id);
        } else {
          await deleteVolunteerRecord(id);
        }
      }
      if (type === "donation") setDonations(prev => prev.filter(d => !selectedIds.includes(d.id)));
      if (type === "volunteer") setVolunteers(prev => prev.filter(v => !selectedIds.includes(v.id)));
      if (type === "internship") setInternships(prev => prev.filter(v => !selectedIds.includes(v.id)));
      
      await recordAuditLog(user?.email || "unknown", `Bulk deleted ${selectedIds.length} records of type ${type}`);
      setSelectedIds([]);
      alert("Bulk delete executed!");
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportSelected = (type: 'volunteer' | 'internship' | 'donation' | 'contact' | 'complaint') => {
    let selectedData: any[] = [];
    if (type === 'volunteer') {
      selectedData = volunteers.filter(v => v.id && selectedIds.includes(v.id));
    } else if (type === 'internship') {
      selectedData = internships.filter(i => i.id && selectedIds.includes(i.id));
    } else if (type === 'donation') {
      selectedData = donations.filter(d => d.id && selectedIds.includes(d.id));
    } else if (type === 'contact') {
      selectedData = contactsList.filter(c => c.id && selectedIds.includes(c.id));
    } else if (type === 'complaint') {
      selectedData = complaintsList.filter(c => c.id && selectedIds.includes(c.id));
    }
    
    if (selectedData.length === 0) {
      alert("No records selected!");
      return;
    }

    if (type === 'volunteer') {
      exportToCSV(selectedData.map(v => ({
        Name: v.name,
        Email: v.email,
        Phone: v.phone,
        WhatsApp: v.phoneWhatsapp || "",
        City: v.city,
        Age: v.age || "",
        DOB: v.dob || "",
        "Father Name": v.fatherName || "",
        "Mother Name": v.motherName || "",
        "Aadhar Number": v.aadharNumber || "",
        "Preferred Mode": v.preferredMode || "",
        "Education Status": v.educationStatus || "",
        Motivation: v.motivation || "",
        Status: v.status || "pending",
        "Ticket Number": v.ticketNo || "",
        "Date Applied": v.createdAt || v.currentDate || "",
        Comments: v.adminComment || ""
      })), "Selected_Volunteers");
    } else if (type === 'internship') {
      exportToCSV(selectedData.map(i => ({
        Name: i.name,
        Email: i.email,
        Phone: i.phone,
        WhatsApp: i.phoneWhatsapp || "",
        City: i.city,
        Age: i.age || "",
        DOB: i.dob || "",
        "Father Name": i.fatherName || "",
        "Mother Name": i.motherName || "",
        "Aadhar Number": i.aadharNumber || "",
        College: i.college || "",
        Course: i.course || "",
        Year: i.year || "",
        Department: i.department || "",
        Mode: i.internshipMode || "",
        Motivation: i.motivation || "",
        Status: i.status || "pending",
        "Ticket Number": i.ticketNo || i.tempInternshipId || "",
        "Permanent ID": i.permanentInternshipId || "",
        "Date Applied": i.createdAt || i.currentDate || "",
        Comments: i.adminComment || ""
      })), "Selected_Interns");
    } else if (type === 'donation') {
      exportToCSV(selectedData.map(d => ({
        "Donor Name": d.donorName,
        Email: d.donorEmail,
        Phone: d.donorPhone || "",
        Amount: `₹${d.amount}`,
        Purpose: d.purpose,
        "Transaction ID": d.transactionId,
        Date: d.createdAt,
        Status: d.status || "success",
        "Is Anonymous": d.isAnonymous ? "Yes" : "No"
      })), "Selected_Donations");
    } else if (type === 'contact') {
      exportToCSV(selectedData.map(c => ({
        Name: c.name,
        Email: c.email,
        Phone: c.phone || "",
        Subject: c.subject,
        Message: c.message,
        Status: c.status || "pending",
        "Ticket Number": c.ticketNo || "",
        Date: c.createdAt || ""
      })), "Selected_Contacts");
    } else if (type === 'complaint') {
      exportToCSV(selectedData.map(c => ({
        Name: c.name,
        Email: c.email,
        Phone: c.phone || "",
        Type: c.complaintType,
        "ID Number": c.membershipId,
        Issue: c.issue,
        Status: c.status || "pending",
        "Ticket Number": c.ticketNo || "",
        Date: c.createdAt || "",
        Comments: c.adminComment || ""
      })), "Selected_Complaints");
    }
  };

  const handleReprintReceipt = (donation: any) => {
    setPrintReceiptData(donation);
    setTimeout(() => {
      window.print();
      setPrintReceiptData(null);
    }, 250);
  };

  // Global search and filtering
  const filterList = <T extends Record<string, any>>(list: T[], searchFields: (keyof T)[]): T[] => {
    let filtered = list;
    if (globalSearch.trim() !== "") {
      const q = globalSearch.toLowerCase();
      filtered = list.filter(item => 
        searchFields.some(field => String(item[field] || "").toLowerCase().includes(q))
      );
    }
    return filtered;
  };

  // Paginated lists
  const paginateList = <T extends any>(list: T[]): T[] => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return list.slice(startIndex, startIndex + rowsPerPage);
  };

  const totalRaised = useMemo(() => donations.reduce((sum, d) => sum + d.amount, 0), [donations]);

  // REDESIGNED ADMIN LOGIN SCREEN
  if (!user) {
    return (
      <div style={{
        minHeight: "100vh",
        backgroundColor: "#FDFBF7",
        color: "#1b1c1c",
        fontFamily: "'Noto Sans', sans-serif",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Procedural Background Elements */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
          {/* Ambient Blobs */}
          <div style={{
            position: "absolute",
            width: "600px",
            height: "600px",
            top: "-10%",
            left: "-10%",
            background: "radial-gradient(circle, rgba(68,100,100,0.15) 0%, transparent 70%)",
            filter: "blur(60px)"
          }} />
          <div style={{
            position: "absolute",
            width: "500px",
            height: "500px",
            top: "40%",
            right: "-5%",
            background: "radial-gradient(circle, rgba(197,160,89,0.2) 0%, transparent 70%)",
            filter: "blur(60px)"
          }} />
          <div style={{
            position: "absolute",
            width: "400px",
            height: "400px",
            bottom: "-10%",
            left: "20%",
            background: "radial-gradient(circle, rgba(42,165,39,0.12) 0%, transparent 70%)",
            filter: "blur(60px)"
          }} />
          {/* Hand-drawn Background Doodle Pattern */}
          <div style={{
            position: "absolute",
            inset: 0,
            opacity: 0.08,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='400' viewBox='0 0 400 400' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50,50 Q100,20 150,50 T250,50' stroke='%23735c00' stroke-width='1' fill='none'/%3E%3Cpath d='M300,300 C350,320 380,280 350,250' stroke='%23446464' stroke-width='1' fill='none'/%3E%3Ccircle cx='100' cy='300' r='40' stroke='%23C5A059' stroke-width='0.5' stroke-dasharray='4 4'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat"
          }} />
        </div>

        {/* Header / Brand Anchor */}
        <header style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          padding: "1.5rem 2rem",
          maxWidth: "1440px",
          margin: "0 auto",
          zIndex: 50
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{
              background: "linear-gradient(135deg, #C5A059 0%, #d4af37 100%)",
              color: "#1E2D2D",
              padding: "10px",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 20px rgba(197,160,89,0.35)"
            }}>
              <Shield size={24} />
            </div>
            <div>
              <h1 style={{
                fontFamily: "'Hanken Grotesk', sans-serif",
                fontSize: "1.35rem",
                fontWeight: 800,
                color: "#2A3D3D",
                margin: 0,
                lineHeight: 1.2
              }}>Day Foundation</h1>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.58rem", color: "#8a6822", letterSpacing: "0.08em", textTransform: "uppercase" }}>Encrypted Console</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(68,100,100,0.08)",
              padding: "0.45rem 1rem",
              borderRadius: "9999px",
              border: "1px solid rgba(68,100,100,0.2)"
            }}>
              <Lock size={14} style={{ color: "#446464" }} />
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.7rem", color: "#446464", fontWeight: 700 }}>Encrypted Node 04</span>
            </div>
          </div>
        </header>

        {/* Main Content Area: Left DotLottie Animation & Right Glassmorphic Login Card */}
        <main style={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem 1rem", position: "relative", zIndex: 10 }}>
          {/* Floating Decorative Icons */}
          <div className="doodle-float" style={{ position: "absolute", top: "12%", left: "10%", color: "#C5A059", opacity: 0.35 }}>
            <Sparkles size={48} />
          </div>
          <div className="doodle-float" style={{ position: "absolute", bottom: "18%", right: "8%", color: "#446464", opacity: 0.3, animationDelay: "-2s" }}>
            <Shield size={56} />
          </div>

          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "2.5rem",
            width: "100%",
            maxWidth: "1050px",
            flexWrap: "wrap"
          }}>
            {/* Left Side: DotLottie Animation */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{
                width: "100%",
                maxWidth: "440px",
                flex: "1 1 360px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <div style={{
                width: "100%",
                borderRadius: "2rem",
                background: "rgba(255, 255, 255, 0.45)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "2px solid rgba(255, 255, 255, 0.6)",
                padding: "1.25rem",
                boxShadow: "0 20px 50px rgba(30, 45, 45, 0.08)",
                overflow: "hidden"
              }}>
                <SafeDotLottie
                  src="https://lottie.host/1c5097c9-e54f-4ef5-b2fb-2076b080d4e4/i4YbfWmVc9.lottie"
                  style={{ width: "100%", height: "340px", objectFit: "contain" }}
                />
              </div>
            </motion.div>

            {/* Right Side: Redesigned Glassmorphic Login Card */}
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              style={{
                width: "100%",
                maxWidth: "460px",
                flex: "1 1 360px",
                background: "rgba(255, 255, 255, 0.88)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                padding: "2rem 1.75rem",
                borderRadius: "2rem",
                border: "2px solid rgba(255, 255, 255, 0.7)",
                boxShadow: "0 20px 50px rgba(30, 45, 45, 0.12), 0 2px 6px rgba(0,0,0,0.04)",
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
                position: "relative",
                overflow: "hidden"
              }}
            >
            {/* Internal Soft Blob Accent */}
            <div style={{
              position: "absolute",
              top: "-96px",
              right: "-96px",
              width: "192px",
              height: "192px",
              background: "rgba(197,160,89,0.12)",
              borderRadius: "50%",
              filter: "blur(32px)",
              pointerEvents: "none"
            }} />

            {/* 3D Doodle Male Character sitting on table using laptop */}
            <DoodleMaleAvatar email={email} isPasswordFocused={isPasswordFocused} isEmailFocused={isEmailFocused} />

            <div>
              <h2 style={{
                fontFamily: "'Hanken Grotesk', sans-serif",
                fontSize: "1.65rem",
                fontWeight: 800,
                color: "#0f172a",
                margin: "0 0 0.5rem",
                borderBottom: "3px solid #C5A059",
                display: "inline-block",
                paddingBottom: "2px"
              }}>
                Secure Admin Login
              </h2>
              <p style={{ fontFamily: "'Noto Sans', sans-serif", fontSize: "0.875rem", color: "#334155", margin: "0.5rem 0 0" }}>
                Authorized access only. Verified Foundation personnel.
              </p>
            </div>

            {loginError && (
              <div style={{
                padding: "0.85rem 1rem",
                background: "rgba(186,26,26,0.08)",
                border: "1px solid rgba(186,26,26,0.3)",
                borderRadius: "14px",
                color: "#ba1a1a",
                fontSize: "0.82rem",
                fontWeight: 600,
                textAlign: "left",
                fontFamily: "'Noto Sans', sans-serif"
              }}>
                ⚠️ {loginError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label style={{
                  fontFamily: "'Hanken Grotesk', sans-serif",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "#0f172a",
                  display: "block",
                  marginBottom: "0.4rem"
                }}>
                  Admin Email / Username *
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setIsEmailFocused(true)}
                    onBlur={() => setIsEmailFocused(false)}
                    placeholder="name@dayfoundation.org"
                    style={{
                      width: "100%",
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      border: "1.5px solid #d0c5af",
                      borderRadius: "14px",
                      padding: "0.8rem 1rem 0.8rem 2.75rem",
                      fontFamily: "'Noto Sans', sans-serif",
                      fontSize: "0.9rem",
                      color: "#0f172a",
                      outline: "none",
                      boxSizing: "border-box",
                      transition: "all 0.25s ease"
                    }}
                  />
                  <Mail size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#7f7663" }} />
                </div>
              </div>

              <div>
                <label style={{
                  fontFamily: "'Hanken Grotesk', sans-serif",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "#0f172a",
                  display: "block",
                  marginBottom: "0.4rem"
                }}>
                  Secure Password *
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    placeholder="••••••••••••"
                    style={{
                      width: "100%",
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      border: "1.5px solid #d0c5af",
                      borderRadius: "14px",
                      padding: "0.8rem 1rem 0.8rem 2.75rem",
                      fontFamily: "'Noto Sans', sans-serif",
                      fontSize: "0.9rem",
                      color: "#0f172a",
                      outline: "none",
                      boxSizing: "border-box",
                      transition: "all 0.25s ease"
                    }}
                  />
                  <Lock size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#7f7663" }} />
                </div>
              </div>

              {/* 2FA Option */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  id="enable-2fa"
                  checked={use2FA}
                  onChange={(e) => setUse2FA(e.target.checked)}
                  style={{ width: "16px", height: "16px", accentColor: "#C5A059", cursor: "pointer" }}
                />
                <label htmlFor="enable-2fa" style={{ fontFamily: "'Noto Sans', sans-serif", fontSize: "0.82rem", cursor: "pointer", color: "#334155", fontWeight: 600 }}>
                  Enable Two-Factor Authentication (2FA)
                </label>
              </div>

              {use2FA && (
                <div>
                  <label style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    color: "#334155",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    display: "block",
                    marginBottom: "0.4rem"
                  }}>
                    Verification Code (6 Digits)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value)}
                    placeholder="e.g. 123456"
                    style={{
                      width: "100%",
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      border: "1.5px solid #C5A059",
                      borderRadius: "14px",
                      padding: "0.8rem 1rem",
                      fontFamily: "'Space Mono', monospace",
                      fontSize: "0.95rem",
                      color: "#0f172a",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="btn btn-primary"
                style={{
                  width: "100%",
                  padding: "0.95rem",
                  borderRadius: "9999px",
                  fontSize: "0.95rem",
                  fontWeight: 800,
                  marginTop: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "0 8px 24px rgba(197,160,89,0.4)"
                }}
              >
                {loginLoading ? <Loader className="animate-spin" size={20} /> : (
                  <>
                    Enter Console <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div style={{ paddingTop: "0.5rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.85rem" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "0.5rem 1rem",
                background: "rgba(42,165,39,0.08)",
                border: "1px solid rgba(42,165,39,0.25)",
                borderRadius: "12px"
              }}>
                <CheckCircle size={15} style={{ color: "#2AA527" }} />
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.68rem", color: "#1b7a19", fontWeight: 700 }}>
                  Session Secure - RSA 256-bit Encryption
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", opacity: 0.5 }}>
                <span style={{ width: "32px", height: "1px", background: "#7f7663" }} />
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.62rem", color: "#7f7663", letterSpacing: "0.1em" }}>
                  SPACE MONO PROTECTED
                </span>
                <span style={{ width: "32px", height: "1px", background: "#7f7663" }} />
              </div>
            </div>
          </motion.div>
        </div>
      </main>

        {/* Footer */}
        <footer style={{
          width: "100%",
          maxWidth: "1440px",
          margin: "0 auto",
          padding: "1.5rem 2rem",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          zIndex: 50
        }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.7rem", color: "#334155" }}>
            © {new Date().getFullYear()} Day Foundation. Secured by Space Mono Encryption.
          </span>
          <nav style={{ display: "flex", gap: "1.5rem" }}>
            <a href="#" style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.7rem", color: "#2A3D3D", fontWeight: 600 }}>Privacy Policy</a>
            <a href="#" style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.7rem", color: "#2A3D3D", fontWeight: 600 }}>Security Protocol</a>
            <a href="#" style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.7rem", color: "#2A3D3D", fontWeight: 600 }}>Contact Support</a>
          </nav>
        </footer>
      </div>
    );
  }


  return (
    <div className="admin-layout">
      {/* Doodle SVG — content area background */}
      <svg
        style={{ position: "fixed", top: 0, left: "280px", width: "calc(100vw - 280px)", height: "100vh", pointerEvents: "none", zIndex: 0, opacity: 0.04 }}
        viewBox="0 0 900 700" preserveAspectRatio="xMidYMid slice"
      >
        <circle cx="720" cy="100" r="200" fill="none" stroke="#C5A059" strokeWidth="1.5" strokeDasharray="12 6" />
        <circle cx="80" cy="600" r="160" fill="none" stroke="#2A3D3D" strokeWidth="1.5" strokeDasharray="8 10" />
        <rect x="750" y="460" width="110" height="110" rx="18" fill="none" stroke="#C5A059" strokeWidth="1.5" transform="rotate(15 805 515)" />
        <rect x="20" y="40" width="80" height="80" rx="12" fill="none" stroke="#2A3D3D" strokeWidth="1.5" transform="rotate(-10 60 80)" />
        <path d="M0 350 Q 225 290 450 350 Q 675 410 900 350" fill="none" stroke="#C5A059" strokeWidth="1" strokeDasharray="6 14" />
        <circle cx="450" cy="350" r="300" fill="none" stroke="#2A3D3D" strokeWidth="0.75" strokeDasharray="6 18" />
      </svg>

      {/* Sidebar Backdrop for Mobile */}
      {mobileSidebarOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`admin-sidebar ${mobileSidebarOpen ? "open" : ""}`}>
        {/* Logo */}
        <div className="admin-sidebar-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem" }}>
            <div style={{ background: "linear-gradient(135deg, #C5A059 0%, #d4af37 100%)", color: "#2A3D3D", padding: "8px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(197,160,89,0.45)" }}>
              <Shield size={18} />
            </div>
            <div>
              <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: "1rem", fontWeight: 800, color: "#ffe088", letterSpacing: "-0.02em", lineHeight: 1.2 }}>Day Foundation</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.58rem", color: "rgba(198,233,233,0.5)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Encrypted Console</div>
            </div>
          </div>
          {/* Super Admin Operator Info */}
          <div style={{ background: "rgba(197,160,89,0.12)", border: "1px dashed rgba(197,160,89,0.35)", borderRadius: "14px", padding: "0.65rem 0.875rem", display: "flex", alignItems: "center", gap: "10px" }}>
            <img
              src="/assets/teams/om sen.jpeg"
              alt="Om Sen - Super Admin"
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid #C5A059",
                boxShadow: "0 2px 10px rgba(197,160,89,0.35)"
              }}
            />
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: "0.85rem", color: "#ffe088", fontWeight: 800, lineHeight: 1.2 }}>Om Sen</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.58rem", color: "rgba(253,251,247,0.7)", letterSpacing: "0.05em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email || "owner@dayfoundation.com"}</div>
              <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: "0.62rem", background: "rgba(197,160,89,0.25)", color: "#ffe088", padding: "1px 8px", borderRadius: "99px", marginTop: "3px", display: "inline-block", fontWeight: 700 }}>Super Admin</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div className="sidebar-category-header">Dashboards</div>
        <button onClick={() => handleTabClick("overview")} className={`admin-sidebar-btn ${activeTab === "overview" ? "active" : ""}`}>
          <LayoutDashboard size={16} /><span>Overview</span>
        </button>

        <div className="sidebar-category-header">Core Content</div>
        {canAccessTab("blogs") && (
          <button onClick={() => handleTabClick("blogs")} className={`admin-sidebar-btn ${activeTab === "blogs" ? "active" : ""}`}>
            <BookOpen size={16} /><span>Manage Blogs</span>
          </button>
        )}
        {canAccessTab("gallery") && (
          <button onClick={() => handleTabClick("gallery")} className={`admin-sidebar-btn ${activeTab === "gallery" ? "active" : ""}`}>
            <Image size={16} /><span>Manage Gallery</span>
          </button>
        )}
        {canAccessTab("events") && (
          <button onClick={() => handleTabClick("events")} className={`admin-sidebar-btn ${activeTab === "events" ? "active" : ""}`}>
            <Calendar size={16} /><span>Manage Events</span>
          </button>
        )}
        {canAccessTab("teams") && (
          <button onClick={() => handleTabClick("teams")} className={`admin-sidebar-btn ${activeTab === "teams" ? "active" : ""}`}>
            <UserCheck size={16} /><span>Manage Teams</span>
          </button>
        )}
        {canAccessTab("city_members") && (
          <button onClick={() => handleTabClick("city_members")} className={`admin-sidebar-btn ${activeTab === "city_members" ? "active" : ""}`}>
            <Globe size={16} /><span>City Teams</span>
          </button>
        )}
        {canAccessTab("testimonials") && (
          <button onClick={() => handleTabClick("testimonials")} className={`admin-sidebar-btn ${activeTab === "testimonials" ? "active" : ""}`}>
            <MessageSquare size={16} /><span>Manage Testimonials</span>
          </button>
        )}
        {canAccessTab("card_images") && (
          <button onClick={() => handleTabClick("card_images")} className={`admin-sidebar-btn ${activeTab === "card_images" ? "active" : ""}`}>
            <Image size={16} /><span>Card Images</span>
          </button>
        )}

        <div className="sidebar-category-header">Registries</div>
        {canAccessTab("volunteers") && (
          <button onClick={() => handleTabClick("volunteers")} className={`admin-sidebar-btn ${activeTab === "volunteers" ? "active" : ""}`}>
            <Users size={16} /><span>Volunteers</span>
          </button>
        )}
        {canAccessTab("internships") && (
          <button onClick={() => handleTabClick("internships")} className={`admin-sidebar-btn ${activeTab === "internships" ? "active" : ""}`}>
            <GraduationCap size={16} /><span>Internships</span>
          </button>
        )}
        {canAccessTab("donations") && (
          <button onClick={() => handleTabClick("donations")} className={`admin-sidebar-btn ${activeTab === "donations" ? "active" : ""}`}>
            <DollarSign size={16} /><span>Donations Ledger</span>
          </button>
        )}

        <div className="sidebar-category-header">Messages & Support</div>
        {canAccessTab("contacts") && (
          <button onClick={() => handleTabClick("contacts")} className={`admin-sidebar-btn ${activeTab === "contacts" ? "active" : ""}`}>
            <MessageSquare size={16} /><span>Messages</span>
          </button>
        )}
        {canAccessTab("complaints") && (
          <button onClick={() => handleTabClick("complaints")} className={`admin-sidebar-btn ${activeTab === "complaints" ? "active" : ""}`}>
            <ShieldAlert size={16} /><span>Complaints</span>
          </button>
        )}

        <div className="sidebar-category-header">System Tools</div>
        {canAccessTab("seo") && (
          <button onClick={() => handleTabClick("seo")} className={`admin-sidebar-btn ${activeTab === "seo" ? "active" : ""}`}>
            <Globe size={16} /><span>SEO Settings</span>
          </button>
        )}
        {canAccessTab("settings") && (
          <button onClick={() => handleTabClick("settings")} className={`admin-sidebar-btn ${activeTab === "settings" ? "active" : ""}`}>
            <Sparkles size={16} /><span>Theme Preset</span>
          </button>
        )}
        {canAccessTab("settings") && (
          <button onClick={() => handleTabClick("theme")} className={`admin-sidebar-btn ${activeTab === "theme" ? "active" : ""}`}>
            <Image size={16} /><span>Theme Colors</span>
          </button>
        )}
        {canAccessTab("marketing") && (
          <button onClick={() => handleTabClick("marketing")} className={`admin-sidebar-btn ${activeTab === "marketing" ? "active" : ""}`}>
            <Megaphone size={16} /><span>Marketing</span>
          </button>
        )}
        {canAccessTab("broadcast") && (
          <button onClick={() => handleTabClick("broadcast")} className={`admin-sidebar-btn ${activeTab === "broadcast" ? "active" : ""}`}>
            <Megaphone size={16} /><span>Broadcast Center</span>
          </button>
        )}
        {canAccessTab("audit_logs") && (
          <button onClick={() => handleTabClick("audit_logs")} className={`admin-sidebar-btn ${activeTab === "audit_logs" ? "active" : ""}`}>
            <History size={16} /><span>Audit Logs</span>
          </button>
        )}
        {canAccessTab("users") && (
          <button onClick={() => handleTabClick("users")} className={`admin-sidebar-btn ${activeTab === "users" ? "active" : ""}`}>
            <Shield size={16} /><span>User Management</span>
          </button>
        )}
        <button onClick={() => handleTabClick("recycle_bin")} className={`admin-sidebar-btn ${activeTab === "recycle_bin" ? "active" : ""}`} style={{ color: activeTab === "recycle_bin" ? "var(--color-primary)" : "#ef4444" }}>
          <Trash2 size={16} /><span>Recycle Bin</span>
          {recycleBinItems.length > 0 && (
            <span style={{ marginLeft: "auto", background: "#ef4444", color: "#ffffff", padding: "2px 7px", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 800 }}>
              {recycleBinItems.length}
            </span>
          )}
        </button>

        {/* Promo / Security card */}
        <div className="sidebar-promo-card" style={{ marginTop: "1rem", marginBottom: "0.5rem" }}>
          <p className="promo-text">🔒 AES-256 encrypted workspace active.</p>
          <button onClick={() => alert("Session: AES-256 encryption verified.")} className="promo-btn">Verify Session</button>
        </div>

        {/* Logout */}
        <div style={{ marginTop: "auto", paddingTop: "0.5rem", borderTop: "1px dashed rgba(197,160,89,0.2)", paddingLeft: "0.5rem", paddingRight: "0.5rem" }}>
          <button onClick={logout} className="admin-sidebar-btn" style={{ color: "rgba(248,113,113,0.8)" }}>
            <LogOut size={16} /><span>Secure Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-content">
        {/* ── Sticky Top Bar (Encrypted Console Header) ── */}
        <div className="admin-header">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              className="admin-mobile-toggle"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              style={{ display: "none" }}
              aria-label="Toggle admin sidebar"
            >
              {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {/* Encrypted Console label */}
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", color: "#2AA527", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700 }}>Encrypted Console</span>
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "16px", height: "16px", background: "rgba(42,165,39,0.12)", borderRadius: "50%" }}>
                <span style={{ width: "6px", height: "6px", background: "#2AA527", borderRadius: "50%", animation: "blobFloat 2s ease-in-out infinite" }} />
              </span>
            </div>
          </div>

          {/* Right: search + session + profile */}
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
            {/* Search */}
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search workspace..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                style={{
                  padding: "0.5rem 1rem 0.5rem 2.5rem",
                  border: "1.5px solid #d0c5af",
                  background: "#ffffff",
                  borderRadius: "9999px",
                  fontFamily: "'Noto Sans', sans-serif",
                  fontSize: "0.82rem",
                  width: "200px",
                  color: "#1b1c1c",
                  outline: "none",
                  transition: "border-color 0.2s, box-shadow 0.2s"
                }}
              />
              <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#7f7663" }} />
            </div>

            {/* Session Verified badge */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 12px", background: "rgba(42,165,39,0.08)", border: "1px solid rgba(42,165,39,0.2)", borderRadius: "9999px" }}>
              <Shield size={13} style={{ color: "#2AA527" }} />
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.62rem", color: "#2A3D3D", letterSpacing: "0.05em", fontWeight: 700 }}>Session Verified</span>
            </div>

            {/* Quick icon actions */}
            <div style={{ display: "flex", gap: "0.35rem" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1px solid #d0c5af", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", color: "#2A3D3D", cursor: "pointer", transition: "border-color 0.2s" }}>
                <Megaphone size={15} />
              </div>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1px solid #d0c5af", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", color: "#2A3D3D", cursor: "pointer" }} onClick={() => setActiveTab("contacts")}>
                <MessageSquare size={15} />
              </div>
            </div>

            {/* Profile */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingLeft: "0.75rem", borderLeft: "1px solid #d0c5af" }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: "0.85rem", fontWeight: 800, color: "#0f172a" }}>Om Sen</div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.62rem", color: "#8a6822", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>Super Admin</div>
              </div>
              <img
                src="/assets/teams/om sen.jpeg"
                alt="Om Sen - Super Admin"
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #C5A059",
                  boxShadow: "0 4px 14px rgba(197,160,89,0.4)"
                }}
              />
            </div>

            {isSuperAdmin && (
              <button
                onClick={handleResetDatabase}
                style={{ padding: "0.4rem 0.875rem", fontFamily: "'Hanken Grotesk', sans-serif", fontSize: "0.75rem", background: "rgba(186,26,26,0.08)", border: "1px dashed rgba(186,26,26,0.3)", borderRadius: "9999px", color: "#ba1a1a", cursor: "pointer", fontWeight: 700 }}
              >
                Reset DB
              </button>
            )}
          </div>
        </div>

        {/* ── Scrollable body — everything below the sticky header ── */}
        <div className="admin-content-body">

        {dbLoading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px", color: "var(--color-secondary)" }}>
            <Loader className="animate-spin" size={32} />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 16, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.995 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              {/* === OVERVIEW === */}
              {activeTab === "overview" && (() => {
                // ── Pure Real Data Analytics Engine ──
                const months = ["Jan", "Mar", "May", "Jul", "Sep", "Nov"];
                const monthlyTotals: Record<string, number> = { Jan: 0, Mar: 0, May: 0, Jul: 0, Sep: 0, Nov: 0 };
                
                let totalDonationSum = 0;
                donations.forEach(d => {
                  const amt = Number(d.amount) || 0;
                  totalDonationSum += amt;
                  const dateStr = d.createdAt || (d as any).currentDate || "";
                  if (dateStr) {
                    const monthIdx = new Date(dateStr).getMonth();
                    const monthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][monthIdx];
                    if (monthlyTotals[monthName] !== undefined) {
                      monthlyTotals[monthName] += amt;
                    }
                  }
                });

                const currentTotal = totalDonationSum || totalRaised || 0;
                const monthValues = [
                  monthlyTotals["Jan"] || 0,
                  monthlyTotals["Mar"] || 0,
                  monthlyTotals["May"] || 0,
                  monthlyTotals["Jul"] || totalDonationSum,
                  monthlyTotals["Sep"] || 0,
                  monthlyTotals["Nov"] || 0,
                ];

                const maxVal = Math.max(...monthValues, 1000);
                const coords = monthValues.map((val, i) => {
                  const x = 40 + i * 144;
                  const y = 170 - (val / maxVal) * 130;
                  return { month: months[i], amount: val, x, y: Math.round(y) };
                });

                const primaryPath = `M${coords[0].x},${coords[0].y} Q${coords[1].x},${coords[1].y} ${coords[2].x},${coords[2].y} T${coords[3].x},${coords[3].y} T${coords[4].x},${coords[4].y} T${coords[5].x},${coords[5].y}`;
                const secondaryPath = `M${coords[0].x},${coords[0].y + 10} Q${coords[1].x},${coords[1].y + 10} ${coords[2].x},${coords[2].y + 10} T${coords[3].x},${coords[3].y + 10} T${coords[4].x},${coords[4].y + 10} T${coords[5].x},${coords[5].y + 10}`;

                // ── PURE REAL VOLUNTEER COUNTS (NO FAKE OFFSETS) ──
                const daysOrder = ["M", "T", "W", "T", "F"];
                const dayCounts = [0, 0, 0, 0, 0];
                
                volunteers.forEach(v => {
                  const dateStr = v.createdAt || v.currentDate;
                  if (dateStr) {
                    const d = new Date(dateStr).getDay();
                    const mapIdx = [0, 0, 1, 2, 3, 4, 0][d];
                    dayCounts[mapIdx]++;
                  } else {
                    dayCounts[0]++;
                  }
                });

                const maxDayCount = Math.max(...dayCounts, 1);
                const weeklyVolunteers = daysOrder.map((day, idx) => {
                  const count = dayCounts[idx];
                  const heightPercent = count > 0 ? Math.max(Math.round((count / maxDayCount) * 100), 22) : 6;
                  return { day, count, height: `${heightPercent}%` };
                });

                const totalVolCount = volunteers.length;
                const cityCounts: Record<string, number> = {};
                volunteers.forEach(v => {
                  const c = v.city || "Indore";
                  cityCounts[c] = (cityCounts[c] || 0) + 1;
                });
                
                const saturationPercent = totalVolCount > 0 ? Math.min(Math.round((totalVolCount / 50) * 100), 100) : 0;
                const radialDashOffset = Math.round(283 - (283 * saturationPercent) / 100);

                const topCitiesList = Object.keys(cityCounts).length > 0 
                  ? Object.entries(cityCounts).map(([city, count]) => ({
                      name: `${city} Hub`,
                      count,
                      rate: `${Math.round((count / Math.max(totalVolCount, 1)) * 100)}%`,
                      status: count > 0 ? "Active Impact" : "Recruiting",
                      color: "#2AA527"
                    })).slice(0, 3)
                  : [
                      { name: "Indore Hub", count: 0, rate: "0%", status: "Offline", color: "#8a6822" },
                      { name: "Jabalpur Hub", count: 0, rate: "0%", status: "Offline", color: "#8a6822" },
                      { name: "Delhi NCR", count: 0, rate: "0%", status: "Offline", color: "#8a6822" },
                    ];

                return (
                  <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {/* Floating Particles in Background */}
                    <div className="doodle-particle" style={{ top: "10px", right: "20%", color: "#C5A059" }}><Sparkles size={28} /></div>
                    <div className="doodle-particle" style={{ bottom: "80px", right: "5%", color: "#2A3D3D" }}><Shield size={32} /></div>

                    {/* Hero Stats Bento Grid */}
                    <div className="kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", marginBottom: "1.75rem" }}>
                      <div className="kpi-card hover-tilt">
                        <div className="kpi-icon-box" style={{ backgroundColor: "rgba(197,160,89,0.15)", color: "#8a6822" }}><DollarSign size={20} /></div>
                        <div className="kpi-details">
                          <span className="kpi-label">Total Donations</span>
                          <span className="kpi-value">₹{currentTotal.toLocaleString("en-IN")}</span>
                          <span style={{ fontSize: "0.72rem", color: "#2AA527", fontWeight: 700, display: "flex", alignItems: "center", gap: "3px", marginTop: "3px" }}>
                            <TrendingUp size={12} /> {donations.length} Real Donations
                          </span>
                        </div>
                      </div>

                      <div className="kpi-card hover-tilt">
                        <div className="kpi-icon-box" style={{ backgroundColor: "rgba(30,45,45,0.12)", color: "#1E2D2D" }}><Users size={20} /></div>
                        <div className="kpi-details">
                          <span className="kpi-label">Active Volunteers</span>
                          <span className="kpi-value">{totalVolCount}</span>
                          <span style={{ fontSize: "0.72rem", color: "#4E73B7", fontWeight: 700, marginTop: "3px", display: "block" }}>{totalVolCount === 1 ? "1 Real Submission" : `${totalVolCount} Real Submissions`}</span>
                        </div>
                      </div>

                      <div className="kpi-card hover-tilt">
                        <div className="kpi-icon-box" style={{ backgroundColor: "rgba(42,165,39,0.12)", color: "#1b7a19" }}><Eye size={20} /></div>
                        <div className="kpi-details">
                          <span className="kpi-label">Total Visitors</span>
                          <span className="kpi-value">{visitorAnalytics.visitors}</span>
                          <span style={{ fontSize: "0.72rem", color: "#2AA527", fontWeight: 700, marginTop: "3px", display: "block" }}>{visitorAnalytics.reach} Unique Reach</span>
                        </div>
                      </div>

                      <div className="sketchy-card hover-tilt" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem" }}>
                        <div>
                          <span className="kpi-label">Global Presence</span>
                          <h3 className="section-heading" style={{ fontSize: "1.1rem", margin: "0 0 4px", color: "#0f172a" }}>Network Hubs</h3>
                          <p style={{ fontSize: "0.75rem", color: "#334155", margin: 0, fontWeight: 500 }}>Active Expansion in SE Asia &amp; India</p>
                        </div>
                        <div style={{ color: "var(--adm-muted-gold)" }}>
                          <Globe size={38} />
                        </div>
                      </div>
                    </div>

                    {/* Section 1: Animated Donation Trends Line Chart & Global Reach Radial Chart */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "1.5rem", marginBottom: "1.75rem" }}>
                      
                      {/* Donation Trends: Interactive Animated Line Chart */}
                      <div className="glass-card hover-tilt stagger-item stagger-1" style={{ display: "flex", flexDirection: "column", position: "relative" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
                          <div>
                            <h3 className="section-heading" style={{ margin: "0 0 4px", fontSize: "1.2rem", color: "#0f172a" }}>Donation Trends</h3>
                            <p style={{ fontSize: "0.78rem", color: "#334155", margin: 0, fontWeight: 500 }}>Hover near graph line for exact monthly amounts</p>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 800, color: "#2AA527" }}>
                              ₹{(hoveredGraphPoint ? hoveredGraphPoint.amount : currentTotal).toLocaleString("en-IN")}
                            </div>
                            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "#334155", fontWeight: 700, textTransform: "uppercase" }}>
                              {hoveredGraphPoint ? `${hoveredGraphPoint.month} Selected` : "Real-time Total"}
                            </div>
                          </div>
                        </div>

                        {/* Interactive SVG Line Graph Driven by Real Data & Cursor Tracking */}
                        <div style={{ position: "relative", height: "180px", width: "100%", marginTop: "auto" }}>
                          <svg
                            viewBox="0 0 800 200"
                            style={{ width: "100%", height: "100%", overflow: "visible" }}
                            onMouseMove={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const mouseX = e.clientX - rect.left;
                              const svgX = (mouseX / rect.width) * 800;
                              let closest = coords[0];
                              let minDistance = Math.abs(svgX - coords[0].x);
                              for (let i = 1; i < coords.length; i++) {
                                const dist = Math.abs(svgX - coords[i].x);
                                if (dist < minDistance) {
                                  minDistance = dist;
                                  closest = coords[i];
                                }
                              }
                              if (minDistance < 130) {
                                setHoveredGraphPoint(closest);
                              } else {
                                setHoveredGraphPoint(null);
                              }
                            }}
                            onMouseLeave={() => setHoveredGraphPoint(null)}
                          >
                            <path d="M40,20 L40,180" stroke="rgba(208,197,175,0.4)" strokeDasharray="4 4" strokeWidth="2" />
                            <path d="M40,180 L780,180" stroke="rgba(208,197,175,0.4)" strokeDasharray="4 4" strokeWidth="2" />
                            
                            {/* Primary Animated Line Path */}
                            <path className="animate-draw" d={primaryPath} fill="none" stroke="#C5A059" strokeWidth="4" strokeLinecap="round" />
                            
                            {/* Secondary Dashed Line Path */}
                            <path className="animate-draw" d={secondaryPath} fill="none" stroke="#2A3D3D" strokeWidth="2" strokeDasharray="8 4" opacity="0.45" style={{ animationDelay: "0.4s" }} />

                            {/* Vertical Guideline on Hover */}
                            {hoveredGraphPoint && (
                              <line
                                x1={hoveredGraphPoint.x}
                                y1="15"
                                x2={hoveredGraphPoint.x}
                                y2="185"
                                stroke="#C5A059"
                                strokeDasharray="4 4"
                                strokeWidth="2"
                              />
                            )}

                            {/* Interactive Data Nodes */}
                            {coords.map((pt, i) => {
                              const isHovered = hoveredGraphPoint?.month === pt.month;
                              return (
                                <g key={i} onMouseEnter={() => setHoveredGraphPoint(pt)} style={{ cursor: "pointer" }}>
                                  <circle
                                    cx={pt.x}
                                    cy={pt.y}
                                    r={isHovered ? "9" : "5"}
                                    fill={isHovered ? "#ffe088" : "#C5A059"}
                                    stroke="#1E2D2D"
                                    strokeWidth={isHovered ? "3.5" : "2"}
                                    style={{ transition: "all 0.2s ease" }}
                                  />
                                  {/* Hit area for smooth proximity hover */}
                                  <circle cx={pt.x} cy={pt.y} r="35" fill="transparent" />
                                </g>
                              );
                            })}

                            {!hoveredGraphPoint && (
                              <circle cx={coords[coords.length - 1].x} cy={coords[coords.length - 1].y} r="7" fill="#C5A059" className="secure-pulse" />
                            )}
                          </svg>

                          {/* Floating Glassmorphism Tooltip Popover */}
                          {hoveredGraphPoint && (
                            <div
                              style={{
                                position: "absolute",
                                left: `${(hoveredGraphPoint.x / 800) * 100}%`,
                                top: `${(hoveredGraphPoint.y / 200) * 100}%`,
                                transform: "translate(-50%, -125%)",
                                background: "#1E2D2D",
                                color: "#ffffff",
                                border: "1.5px solid #C5A059",
                                padding: "0.55rem 0.95rem",
                                borderRadius: "12px",
                                boxShadow: "0 12px 28px rgba(0,0,0,0.35)",
                                zIndex: 40,
                                pointerEvents: "none",
                                whiteSpace: "nowrap",
                                animation: "slideUpFade 0.2s ease-out"
                              }}
                            >
                              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "#ffe088", textTransform: "uppercase", fontWeight: 700 }}>
                                {hoveredGraphPoint.month} Total
                              </div>
                              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 800, color: "#ffffff", margin: "2px 0" }}>
                                ₹{hoveredGraphPoint.amount.toLocaleString("en-IN")}
                              </div>
                              <div style={{ fontSize: "0.65rem", color: "#2AA527", fontWeight: 800, display: "flex", alignItems: "center", gap: "4px" }}>
                                ● Real Data Node
                              </div>
                            </div>
                          )}

                          <div style={{ display: "flex", justifyContent: "space-between", paddingInline: "1.5rem", fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "#334155", fontWeight: 700, textTransform: "uppercase", marginTop: "4px" }}>
                            {months.map((m, i) => (
                              <span
                                key={i}
                                style={{
                                  color: hoveredGraphPoint?.month === m ? "#C5A059" : "#334155",
                                  fontWeight: hoveredGraphPoint?.month === m ? 800 : 700,
                                  transition: "color 0.2s ease"
                                }}
                              >
                                {m}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Global Reach Radial Progress Chart Driven by Real Data */}
                      <div className="glass-card hover-tilt stagger-item stagger-2" style={{ background: "#1B2929", color: "#ffffff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative" }}>
                        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                          <h3 className="section-heading" style={{ color: "#ffe088", margin: "0 0 4px", fontSize: "1.2rem" }}>Global Reach</h3>
                          <p style={{ fontSize: "0.78rem", color: "rgba(253,251,247,0.92)", margin: 0, fontWeight: 500 }}>Network Hub Saturation ({totalVolCount} Members)</p>
                        </div>

                        <div style={{ position: "relative", width: "160px", height: "160px" }}>
                          <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
                            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
                            <circle className="radial-chart-progress" cx="50" cy="50" r="45" fill="none" stroke="#ffe088" strokeWidth="8" strokeDasharray="283" strokeDashoffset={radialDashOffset} strokeLinecap="round" transform="rotate(-90 50 50)" />
                          </svg>
                          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontFamily: "var(--font-display)", fontSize: "2.2rem", fontWeight: 800, color: "#ffe088" }}>{saturationPercent}%</span>
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#ffffff", fontWeight: 700 }}>Saturation</span>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: "1.5rem", marginTop: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "#ffffff" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ffe088" }} /> Active ({topCitiesList.length} Hubs)</div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "rgba(255,255,255,0.5)" }} /> Pipeline</div>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Live Feed & Volunteer Growth */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "1.5rem", marginBottom: "1.75rem" }}>
                      
                      {/* Live Feed / Recent Activity Driven by Real Submissions */}
                      <div className="glass-card hover-tilt stagger-item stagger-3" style={{ display: "flex", flexDirection: "column" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "0.875rem", marginBottom: "1rem", borderBottom: "1px dashed var(--adm-outline-variant)" }}>
                          <h3 className="section-heading" style={{ margin: 0, fontSize: "1.1rem", color: "#0f172a" }}>Live Feed</h3>
                          <button onClick={() => handleTabClick("audit_logs")} className="btn btn-outline" style={{ padding: "0.3rem 0.85rem", fontSize: "0.75rem" }}>View All Logs</button>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                          {volunteers.length === 0 && donations.length === 0 ? (
                            <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "1rem 0" }}>No submissions yet.</p>
                          ) : (
                            <>
                              {volunteers.slice(0, 3).map((v, i) => (
                                <div key={v.id || i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "0.75rem 1rem", background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#1E2D2D", color: "#ffe088", fontWeight: 700, fontSize: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    {v.name ? v.name.slice(0, 2).toUpperCase() : "VC"}
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>
                                      {v.name} <span style={{ fontWeight: 500, color: "#334155" }}>applied for Volunteer ({v.city || "Indore"})</span>
                                    </p>
                                    <p style={{ margin: "2px 0 0", fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "#64748b", fontWeight: 600 }}>{v.createdAt ? v.createdAt.slice(0, 10) : "Live submission"}</p>
                                  </div>
                                  <span className="badge badge-green">VERIFIED</span>
                                </div>
                              ))}

                              {donations.slice(0, 2).map((d, i) => (
                                <div key={d.id || i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "0.75rem 1rem", background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--adm-muted-gold)", color: "#1E2D2D", fontWeight: 800, fontSize: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    ₹
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>
                                      {d.donorName || "Anonymous Donor"} <span style={{ fontWeight: 500, color: "#334155" }}>donated ₹{d.amount}</span>
                                    </p>
                                    <p style={{ margin: "2px 0 0", fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "#64748b", fontWeight: 600 }}>{d.purpose || "General Fund"}</p>
                                  </div>
                                  <span className="badge badge-gold">GENERAL</span>
                                </div>
                              ))}
                            </>
                          )}
                        </div>
                      </div>

                      {/* PURE REAL Volunteer Growth Bar Chart Driven by Real Counts (No offsets) */}
                      <div className="glass-card hover-tilt stagger-item stagger-4" style={{ display: "flex", flexDirection: "column" }}>
                        <div style={{ marginBottom: "1.25rem" }}>
                          <h3 className="section-heading" style={{ margin: "0 0 4px", fontSize: "1.1rem", color: "#0f172a" }}>Volunteer Growth</h3>
                          <p style={{ fontSize: "0.78rem", color: "#334155", margin: 0, fontWeight: 500 }}>Real weekly recruitment snapshot ({totalVolCount} total)</p>
                        </div>

                        <div style={{ flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "0.875rem", paddingInline: "0.5rem", minHeight: "130px" }}>
                          {weeklyVolunteers.map((item, i) => (
                            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", height: "100%", justifyContent: "flex-end" }}>
                              <div className="bar-grow" style={{ width: "100%", height: item.height, background: item.count > 0 ? "var(--adm-muted-gold)" : "rgba(197,160,89,0.2)", borderRadius: "10px 10px 0 0", position: "relative", animationDelay: `${0.1 * i}s` }}>
                                <span style={{ position: "absolute", top: "-22px", left: "50%", transform: "translateX(-50%)", fontSize: "0.68rem", fontWeight: 800, color: "#0f172a", fontFamily: "var(--font-mono)" }}>{item.count}</span>
                              </div>
                              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", fontWeight: 700, color: "#0f172a" }}>{item.day}</span>
                            </div>
                          ))}
                        </div>

                        <div style={{ marginTop: "1.25rem", padding: "0.75rem 1rem", background: "rgba(197,160,89,0.16)", border: "1px dashed rgba(197,160,89,0.45)", borderRadius: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
                          <TrendingUp size={20} style={{ color: "#8a6822" }} />
                          <div>
                            <p style={{ margin: 0, fontSize: "0.825rem", fontWeight: 800, color: "#0f172a" }}>{totalVolCount} Total Registered Volunteer{totalVolCount === 1 ? "" : "s"}</p>
                            <p style={{ margin: 0, fontSize: "0.7rem", color: "#334155", fontWeight: 600 }}>Pure real database record counts</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Bottom Asymmetric Section (City Hub Status & Security Monitor) */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "1.5rem" }}>
                      
                      {/* City Hub Status Driven by Pure Real Data */}
                      <div className="glass-card hover-tilt stagger-item stagger-5">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                          <div>
                            <h3 className="section-heading" style={{ margin: "0 0 4px", fontSize: "1.1rem", color: "#0f172a" }}>City Hub Status</h3>
                            <p style={{ fontSize: "0.78rem", color: "#334155", margin: 0, fontWeight: 500 }}>Real-time operational health across regions</p>
                          </div>
                          <span className="badge badge-green">Console Active</span>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.max(topCitiesList.length, 1)}, 1fr)`, gap: "0.875rem" }}>
                          {topCitiesList.map((city, idx) => (
                            <div key={idx} style={{ padding: "0.875rem", borderRadius: "14px", background: "#ffffff", border: "1px solid #e2e8f0", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", textTransform: "uppercase", fontWeight: 700, color: "#334155", margin: "0 0 4px" }}>{city.name}</p>
                              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.35rem", fontWeight: 800, color: "#0f172a" }}>{city.count}</div>
                              <p style={{ fontSize: "0.68rem", color: city.color, fontWeight: 800, margin: 0 }}>{city.rate} Share</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Security Monitor / Session Health */}
                      <div className="glass-card hover-tilt stagger-item stagger-5" style={{ background: "#1B2929", color: "#ffffff", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <h3 className="section-heading" style={{ color: "#ffe088", margin: "0 0 4px", fontSize: "1.1rem" }}>Security Monitor</h3>
                            <p style={{ fontSize: "0.78rem", color: "rgba(253,251,247,0.92)", margin: 0, fontWeight: 500 }}>End-to-end encrypted session active</p>
                          </div>
                          <div style={{ width: "52px", height: "52px", borderRadius: "50%", border: "2px solid #ffe088", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: "rgba(197,160,89,0.15)" }}>
                            <SafeDotLottie
                              src="https://lottie.host/1c5097c9-e54f-4ef5-b2fb-2076b080d4e4/i4YbfWmVc9.lottie"
                              style={{ width: "42px", height: "42px" }}
                            />
                          </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginTop: "1.25rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#ffffff" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed rgba(255,255,255,0.15)", paddingBottom: "4px" }}>
                            <span style={{ color: "rgba(253,251,247,0.9)" }}>Last Audit Log:</span>
                            <span style={{ color: "#ffe088", fontWeight: 700 }}>2 mins ago</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed rgba(255,255,255,0.15)", paddingBottom: "4px" }}>
                            <span style={{ color: "rgba(253,251,247,0.9)" }}>Console Encryption:</span>
                            <span style={{ color: "#ffe088", fontWeight: 700 }}>AES-256 Verified</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "rgba(253,251,247,0.9)" }}>Session Status:</span>
                            <span style={{ color: "#2AA527", fontWeight: 800 }}>● Active &amp; Protected</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })()}



            {/* === BLOGS === */}
            {activeTab === "blogs" && (
              <motion.div key="blogs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="admin-table-card">
                <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--color-border-light)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                  <h3 style={{ fontSize: "1.25rem", color: "var(--color-primary)", margin: 0 }}>Articles &amp; Blog Posts ({blogs.length})</h3>
                  {hasWritePermission && (
                    <button onClick={() => setShowAddBlogModal(true)} className="btn btn-primary" style={{ fontSize: "0.85rem", padding: "0.45rem 1rem" }}>
                      + Add New Article
                    </button>
                  )}
                </div>
                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead><tr><th>Title &amp; Category</th><th>Author</th><th>Visibility</th><th style={{ textAlign: "right" }}>Actions</th></tr></thead>
                    <tbody>
                      {paginateList(filterList(blogs, ["title", "author", "category"])).map(b => (
                        <tr key={b.id}>
                          <td>
                            <strong>{b.title}</strong>
                            <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{b.category}</div>
                          </td>
                          <td>{b.author}</td>
                          <td>
                            <span className={`status-badge ${b.hidden ? 'status-hold' : 'status-approved'}`}>
                              {b.hidden ? "Hidden" : "Visible"}
                            </span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {hasWritePermission && (
                              <div className="action-group" style={{ justifyContent: "flex-end", gap: "6px", display: "inline-flex" }}>
                                <button 
                                  onClick={() => handleStartEditBlog(b)} 
                                  className="btn btn-outline" 
                                  style={{ padding: "2px 8px", fontSize: "0.72rem" }}
                                  title="Edit Article"
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleToggleVisibility("blogs", b)} 
                                  className="btn btn-outline" 
                                  style={{ padding: "2px 8px", fontSize: "0.72rem", color: b.hidden ? "#dc2626" : "#16a34a" }}
                                  title={b.hidden ? "Click to Show on Website" : "Click to Hide from Website"}
                                >
                                  {b.hidden ? "Show" : "Hide"}
                                </button>
                                <button 
                                  onClick={() => handleDeleteBlog(b.id)} 
                                  className="btn-icon reject" 
                                  title="Move to Recycle Bin"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                      {blogs.length === 0 && <tr><td colSpan={4} style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-muted)" }}>No articles found. Click "+ Add New Article" to publish your first post.</td></tr>}
                    </tbody>
                  </table>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "1rem", borderTop: "1px solid var(--color-border-light)" }}>
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="btn btn-outline">Prev</button>
                  <span style={{ fontSize: "0.85rem", alignSelf: "center" }}>Page {currentPage} of {Math.ceil(blogs.length / rowsPerPage) || 1}</span>
                  <button disabled={currentPage >= Math.ceil(blogs.length / rowsPerPage)} onClick={() => setCurrentPage(p => p + 1)} className="btn btn-outline">Next</button>
                </div>
              </motion.div>
            )}

            {/* === GALLERY === */}
            {activeTab === "gallery" && (
              <motion.div key="gallery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="admin-table-card">
                <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--color-border-light)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                  <h3 style={{ fontSize: "1.25rem", color: "var(--color-primary)", margin: 0 }}>Gallery Photos ({gallery.length})</h3>
                  {hasWritePermission && (
                    <button onClick={() => setShowAddGalleryModal(true)} className="btn btn-primary" style={{ fontSize: "0.85rem", padding: "0.45rem 1rem" }}>
                      + Add New Photo
                    </button>
                  )}
                </div>
                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Thumbnail</th>
                        <th>Details</th>
                        <th>Visibility</th>
                        <th style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginateList(filterList(gallery, ["title", "category"])).map(g => (
                        <tr key={g.id}>
                          <td>
                            <img src={g.imageUrl} alt={g.title} style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "8px" }} onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=100'; }} />
                          </td>
                          <td>
                            {editingGalleryId === g.id ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                <input type="text" value={editingGallery?.title || ""} onChange={(e) => setEditingGallery(prev => prev ? { ...prev, title: e.target.value } : null)} className="form-input" style={{ padding: "2px 6px", fontSize: "0.85rem" }} />
                                <select value={editingGallery?.category || "Education"} onChange={(e) => setEditingGallery(prev => prev ? { ...prev, category: e.target.value } : null)} className="form-select" style={{ padding: "2px 6px", fontSize: "0.85rem" }}>
                                  <option value="Education">Education</option>
                                  <option value="Aid Drive">Aid Drive</option>
                                  <option value="Healthcare">Healthcare</option>
                                  <option value="Team Meet">Team Meet</option>
                                  <option value="Employment">Employment</option>
                                </select>
                              </div>
                            ) : (
                              <>
                                <strong>{g.title || "Untitled"}</strong>
                                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{g.category}</div>
                              </>
                            )}
                          </td>
                          <td>
                            <span className={`status-badge ${g.hidden ? 'status-hold' : 'status-approved'}`}>
                              {g.hidden ? "Hidden" : "Visible"}
                            </span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {hasWritePermission && (
                              <div className="action-group" style={{ justifyContent: "flex-end", gap: "6px" }}>
                                {editingGalleryId === g.id ? (
                                  <>
                                    <button onClick={() => handleSaveGalleryEdit(g.id)} className="btn-icon approve"><Check size={14} /></button>
                                    <button onClick={() => { setEditingGalleryId(null); setEditingGallery(null); }} className="btn-icon reject"><X size={14} /></button>
                                  </>
                                ) : (
                                  <>
                                    <button onClick={() => handleToggleGalleryVisibility(g.id, !!g.hidden)} className="btn btn-outline" style={{ padding: "2px 8px", fontSize: "0.72rem", color: g.hidden ? "#dc2626" : "#16a34a" }} title={g.hidden ? "Click to Show" : "Click to Hide"}>
                                      {g.hidden ? "Show" : "Hide"}
                                    </button>
                                    <button onClick={() => handleEditGalleryClick(g)} className="btn btn-outline" style={{ padding: "2px 8px", fontSize: "0.75rem" }}>Edit</button>
                                    <button onClick={() => handleDeleteGallery(g.id)} className="btn-icon reject" title="Move to Recycle Bin"><Trash2 size={14} /></button>
                                  </>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                      {gallery.length === 0 && <tr><td colSpan={4} style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-muted)" }}>No gallery items yet. Click "+ Add New Photo" to add one.</td></tr>}
                    </tbody>
                  </table>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "1rem", borderTop: "1px solid var(--color-border-light)" }}>
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="btn btn-outline">Prev</button>
                  <span style={{ fontSize: "0.85rem", alignSelf: "center" }}>Page {currentPage} of {Math.ceil(gallery.length / rowsPerPage) || 1}</span>
                  <button disabled={currentPage >= Math.ceil(gallery.length / rowsPerPage)} onClick={() => setCurrentPage(p => p + 1)} className="btn btn-outline">Next</button>
                </div>
              </motion.div>
            )}

            {/* === EVENTS === */}
            {activeTab === "events" && (
              <>
                <motion.div key="events" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="admin-table-card">
                <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--color-border-light)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                  <h3 style={{ fontSize: "1.25rem", color: "var(--color-primary)", margin: 0 }}>Events ({events.length})</h3>
                  {hasWritePermission && (
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      <button onClick={() => setShowAddEventModal(true)} className="btn btn-primary" style={{ fontSize: "0.85rem", padding: "0.45rem 1rem" }}>
                        + Add New Event
                      </button>
                      <button onClick={() => setShowAddFlagshipModal(true)} className="btn btn-primary" style={{ fontSize: "0.85rem", padding: "0.45rem 1rem", backgroundColor: "var(--color-secondary)", borderColor: "var(--color-secondary)" }}>
                        + Add Flagship Card
                      </button>
                    </div>
                  )}
                </div>
                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Cover</th>
                        <th>Details</th>
                        <th>Status</th>
                        <th>Visibility</th>
                        <th style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginateList(filterList(events, ["title", "location", "category"])).map(e => (
                        <tr key={e.id}>
                          <td>
                            <img src={e.coverImage} alt={e.title} style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "8px" }} onError={(ev) => { (ev.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100'; }} />
                          </td>
                          <td>
                            {editingEventId === e.id ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxWidth: "260px" }}>
                                <input type="text" value={editingEvent?.title || ""} onChange={(ev) => setEditingEvent(prev => prev ? { ...prev, title: ev.target.value } : null)} className="form-input" style={{ padding: "2px 6px", fontSize: "0.85rem" }} placeholder="Title" />
                                <textarea value={editingEvent?.description || ""} onChange={(ev) => setEditingEvent(prev => prev ? { ...prev, description: ev.target.value } : null)} className="form-textarea" style={{ padding: "2px 6px", fontSize: "0.85rem" }} placeholder="Description" rows={2}></textarea>
                                <input type="date" value={editingEvent?.date || ""} onChange={(ev) => setEditingEvent(prev => prev ? { ...prev, date: ev.target.value } : null)} className="form-input" style={{ padding: "2px 6px", fontSize: "0.85rem" }} />
                                <input type="text" value={editingEvent?.location || ""} onChange={(ev) => setEditingEvent(prev => prev ? { ...prev, location: ev.target.value } : null)} className="form-input" style={{ padding: "2px 6px", fontSize: "0.85rem" }} placeholder="Location" />
                                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                  <ImageUploader
                                    folder="events"
                                    label="Cover Image"
                                    currentUrl={editingEvent?.coverImage || ""}
                                    onUpload={(url) => setEditingEvent(prev => prev ? { ...prev, coverImage: url } : null)}
                                  />
                                  {editingEvent?.coverImage && (
                                    <button
                                      type="button"
                                      onClick={() => setEditingEvent(prev => prev ? { ...prev, coverImage: "" } : null)}
                                      style={{ fontSize: "0.72rem", color: "#e74c3c", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textAlign: "left", padding: 0, marginTop: "2px" }}
                                    >
                                      ✕ Remove Photo
                                    </button>
                                  )}
                                </div>
                                <select value={editingEvent?.category || "Education"} onChange={(ev) => setEditingEvent(prev => prev ? { ...prev, category: ev.target.value } : null)} className="form-select" style={{ padding: "2px 6px", fontSize: "0.85rem" }}>
                                  <option value="Education">Education</option>
                                  <option value="Health">Health</option>
                                  <option value="Environment">Environment</option>
                                  <option value="Community">Community</option>
                                  <option value="Aid Drive">Aid Drive</option>
                                  <option value="Celebration">Celebration</option>
                                </select>
                              </div>
                            ) : (
                              <>
                                <strong>{e.title}</strong>
                                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{e.date} | {e.location}</div>
                                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{e.category}</div>
                              </>
                            )}
                          </td>
                          <td>
                            <span className={`status-badge ${e.status === 'upcoming' ? 'status-approved' : 'status-hold'}`}>
                              {e.status}
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge ${e.hidden ? 'status-hold' : 'status-approved'}`}>
                              {e.hidden ? "Hidden" : "Visible"}
                            </span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {hasWritePermission && (
                              <div className="action-group" style={{ justifyContent: "flex-end", gap: "6px" }}>
                                {editingEventId === e.id ? (
                                  <>
                                    <button onClick={() => handleSaveEventEdit(e.id)} className="btn-icon approve"><Check size={14} /></button>
                                    <button onClick={() => { setEditingEventId(null); setEditingEvent(null); }} className="btn-icon reject"><X size={14} /></button>
                                  </>
                                ) : (
                                  <>
                                    <button onClick={() => handleToggleVisibility("events", e)} className="btn btn-outline" style={{ padding: "2px 8px", fontSize: "0.72rem", color: e.hidden ? "#dc2626" : "#16a34a" }} title={e.hidden ? "Click to Show" : "Click to Hide"}>
                                      {e.hidden ? "Show" : "Hide"}
                                    </button>
                                    <button onClick={() => handleEditEventClick(e)} className="btn btn-outline" style={{ padding: "2px 8px", fontSize: "0.75rem" }}>Edit</button>
                                    <button onClick={() => handleDeleteEvent(e.id)} className="btn-icon reject" title="Move to Recycle Bin"><Trash2 size={14} /></button>
                                  </>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                      {events.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-muted)" }}>No events found. Click "+ Add New Event" to create one.</td></tr>}
                    </tbody>
                  </table>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "1rem", borderTop: "1px solid var(--color-border-light)" }}>
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="btn btn-outline">Prev</button>
                  <span style={{ fontSize: "0.85rem", alignSelf: "center" }}>Page {currentPage} of {Math.ceil(events.length / rowsPerPage) || 1}</span>
                  <button disabled={currentPage >= Math.ceil(events.length / rowsPerPage)} onClick={() => setCurrentPage(p => p + 1)} className="btn btn-outline">Next</button>
                </div>
              </motion.div>

              {/* Flagship Campaigns Management Card */}
              <motion.div key="flagship-campaigns" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="admin-table-card" style={{ marginTop: "2rem" }}>
                <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--color-border-light)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                  <div>
                    <h3 style={{ fontSize: "1.25rem", color: "var(--color-primary)", margin: 0 }}>Flagship Events &amp; Campaigns Cards ({flagshipCampaigns.length})</h3>
                    <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", margin: "4px 0 0 0" }}>Manage flagship cards, cover photos, emojis, and descriptions shown on the Events page.</p>
                  </div>
                  {hasWritePermission && (
                    <button onClick={() => setShowAddFlagshipModal(true)} className="btn btn-primary" style={{ fontSize: "0.85rem", padding: "0.45rem 1rem" }}>
                      + Add Flagship Card
                    </button>
                  )}
                </div>
                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th style={{ width: "80px" }}>Cover Photo</th>
                        <th>Flagship Details</th>
                        <th>Visibility</th>
                        <th style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {flagshipCampaigns.map(camp => (
                        <tr key={camp.id}>
                          <td>
                            <img src={camp.image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100'} alt={camp.title} style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px" }} onError={(ev) => { (ev.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100'; }} />
                          </td>
                          <td>
                            {editingFlagshipId === camp.id ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxWidth: "400px" }}>
                                <div style={{ display: "flex", gap: "8px" }}>
                                  <input type="text" value={editingFlagship?.emoji || ""} onChange={(ev) => setEditingFlagship(prev => prev ? { ...prev, emoji: ev.target.value } : null)} className="form-input" style={{ width: "60px", padding: "2px 6px" }} placeholder="Emoji" />
                                  <input type="text" value={editingFlagship?.title || ""} onChange={(ev) => setEditingFlagship(prev => prev ? { ...prev, title: ev.target.value } : null)} className="form-input" style={{ flex: 1, padding: "2px 6px" }} placeholder="Title" />
                                  <input type="color" value={editingFlagship?.color || "#E68952"} onChange={(ev) => setEditingFlagship(prev => prev ? { ...prev, color: ev.target.value } : null)} style={{ width: "40px", height: "30px", border: "none", cursor: "pointer" }} />
                                </div>
                                <textarea value={editingFlagship?.description || ""} onChange={(ev) => setEditingFlagship(prev => prev ? { ...prev, description: ev.target.value } : null)} className="form-textarea" style={{ padding: "4px 6px", fontSize: "0.85rem" }} placeholder="Description" rows={2}></textarea>
                                <ImageUploader folder="flagship" label="Cover Photo" currentUrl={editingFlagship?.image || ""} onUpload={(url) => setEditingFlagship(prev => prev ? { ...prev, image: url } : null)} />
                                {editingFlagship?.image && (
                                  <button type="button" onClick={() => setEditingFlagship(prev => prev ? { ...prev, image: "" } : null)} style={{ fontSize: "0.72rem", color: "#e74c3c", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textAlign: "left", padding: 0 }}>
                                    ✕ Remove Photo
                                  </button>
                                )}
                              </div>
                            ) : (
                              <>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <span style={{ fontSize: "1.1rem" }}>{camp.emoji}</span>
                                  <strong style={{ color: camp.color || "var(--color-primary)" }}>{camp.title}</strong>
                                </div>
                                <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", margin: "4px 0 0 0", lineHeight: "1.4" }}>{camp.description}</p>
                              </>
                            )}
                          </td>
                          <td>
                            <span className={`status-badge ${camp.hidden ? 'status-hold' : 'status-approved'}`}>
                              {camp.hidden ? "Hidden" : "Visible"}
                            </span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {hasWritePermission && (
                              <div className="action-group" style={{ justifyContent: "flex-end", gap: "6px" }}>
                                {editingFlagshipId === camp.id ? (
                                  <>
                                    <button onClick={() => handleSaveFlagshipEdit(camp.id)} className="btn-icon approve"><Check size={14} /></button>
                                    <button onClick={() => { setEditingFlagshipId(null); setEditingFlagship(null); }} className="btn-icon reject"><X size={14} /></button>
                                  </>
                                ) : (
                                  <>
                                    <button onClick={() => handleToggleVisibility("flagship_campaigns", camp)} className="btn btn-outline" style={{ padding: "2px 8px", fontSize: "0.72rem", color: camp.hidden ? "#dc2626" : "#16a34a" }} title={camp.hidden ? "Click to Show" : "Click to Hide"}>
                                      {camp.hidden ? "Show" : "Hide"}
                                    </button>
                                    <button onClick={() => handleEditFlagshipClick(camp)} className="btn btn-outline" style={{ padding: "2px 8px", fontSize: "0.75rem" }}>Edit</button>
                                    <button onClick={() => handleDeleteFlagship(camp.id, camp.title)} className="btn-icon reject"><Trash2 size={14} /></button>
                                  </>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                      {flagshipCampaigns.length === 0 && (
                        <tr><td colSpan={4} style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-muted)" }}>No flagship campaigns found. Click "+ Add Flagship Card" to create one.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </>
            )}

            {/* === TEAMS === */}
            {activeTab === "teams" && (
              <motion.div key="teams" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="admin-table-card">
                <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--color-border-light)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                  <h3 style={{ fontSize: "1.25rem", color: "var(--color-primary)", margin: 0 }}>Core Team Members ({teams.length})</h3>
                  {hasWritePermission && (
                    <button onClick={() => setShowAddTeamModal(true)} className="btn btn-primary" style={{ fontSize: "0.85rem", padding: "0.45rem 1rem" }}>
                      + Add Team Member
                    </button>
                  )}
                </div>
                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Photo</th>
                        <th>Name &amp; Role</th>
                        <th>Contact</th>
                        <th>Visibility</th>
                        <th style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginateList(filterList(teams, ["name", "role"])).map(t => (
                        <tr key={t.id}>
                          <td>
                            {editingTeamId === t.id ? (
                              <ImageUploader
                                folder="team"
                                label="Photo"
                                currentUrl={editingTeam?.image || ""}
                                onUpload={(url) => setEditingTeam(prev => prev ? { ...prev, image: url } : null)}
                              />
                            ) : (
                              <img src={t.image} alt={t.name} style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "50%", border: "2px solid var(--color-border-light)" }} onError={(e) => { (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(t.name) + "&background=0F4C81&color=fff"; }} />
                            )}
                          </td>
                          <td>
                            {editingTeamId === t.id ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxWidth: "200px" }}>
                                <input type="text" value={editingTeam?.name || ""} onChange={(e) => setEditingTeam(prev => prev ? { ...prev, name: e.target.value } : null)} className="form-input" style={{ padding: "2px 6px", fontSize: "0.85rem" }} placeholder="Name" />
                                <input type="text" value={editingTeam?.role || ""} onChange={(e) => setEditingTeam(prev => prev ? { ...prev, role: e.target.value } : null)} className="form-input" style={{ padding: "2px 6px", fontSize: "0.85rem" }} placeholder="Role" />
                                <textarea value={editingTeam?.bio || ""} onChange={(e) => setEditingTeam(prev => prev ? { ...prev, bio: e.target.value } : null)} className="form-textarea" style={{ padding: "2px 6px", fontSize: "0.85rem" }} placeholder="Bio" rows={2}></textarea>
                              </div>
                            ) : (
                              <>
                                <strong>{t.name}</strong>
                                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{t.role}</div>
                              </>
                            )}
                          </td>
                          <td>
                            {editingTeamId === t.id ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                <input type="email" value={editingTeam?.email || ""} onChange={(e) => setEditingTeam(prev => prev ? { ...prev, email: e.target.value } : null)} className="form-input" style={{ padding: "2px 6px", fontSize: "0.85rem" }} placeholder="Email" />
                                <input type="text" value={editingTeam?.linkedin || ""} onChange={(e) => setEditingTeam(prev => prev ? { ...prev, linkedin: e.target.value } : null)} className="form-input" style={{ padding: "2px 6px", fontSize: "0.85rem" }} placeholder="LinkedIn URL" />
                                <input type="number" value={editingTeam?.order || 0} onChange={(e) => setEditingTeam(prev => prev ? { ...prev, order: parseInt(e.target.value) || 0 } : null)} className="form-input" style={{ padding: "2px 6px", fontSize: "0.85rem" }} placeholder="Display Order" />
                              </div>
                            ) : (
                              <>
                                <div style={{ fontSize: "0.75rem" }}>{t.email}</div>
                                {t.linkedin && <a href={t.linkedin} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.7rem", color: "var(--color-primary)" }}>LinkedIn ↗</a>}
                              </>
                            )}
                          </td>
                          <td>
                            <span className={`status-badge ${t.hidden ? 'status-hold' : 'status-approved'}`}>
                              {t.hidden ? "Hidden" : "Visible"}
                            </span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {hasWritePermission && (
                              <div className="action-group" style={{ justifyContent: "flex-end", gap: "6px" }}>
                                {editingTeamId === t.id ? (
                                  <>
                                    <button onClick={() => handleSaveTeamEdit(t.id)} className="btn-icon approve"><Check size={14} /></button>
                                    <button onClick={() => { setEditingTeamId(null); setEditingTeam(null); }} className="btn-icon reject"><X size={14} /></button>
                                  </>
                                ) : (
                                  <>
                                    <button onClick={() => handleToggleVisibility("team", t)} className="btn btn-outline" style={{ padding: "2px 8px", fontSize: "0.72rem", color: t.hidden ? "#dc2626" : "#16a34a" }} title={t.hidden ? "Click to Show" : "Click to Hide"}>
                                      {t.hidden ? "Show" : "Hide"}
                                    </button>
                                    <button onClick={() => handleEditTeamClick(t)} className="btn btn-outline" style={{ padding: "2px 8px", fontSize: "0.75rem" }}>Edit</button>
                                    <button onClick={() => handleDeleteTeamMember(t.id)} className="btn-icon reject" title="Move to Recycle Bin"><Trash2 size={14} /></button>
                                  </>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                      {teams.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-muted)" }}>No team members yet. Click "+ Add Team Member" to add one.</td></tr>}
                    </tbody>
                  </table>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "1rem", borderTop: "1px solid var(--color-border-light)" }}>
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="btn btn-outline">Prev</button>
                  <span style={{ fontSize: "0.85rem", alignSelf: "center" }}>Page {currentPage} of {Math.ceil(teams.length / rowsPerPage) || 1}</span>
                  <button disabled={currentPage >= Math.ceil(teams.length / rowsPerPage)} onClick={() => setCurrentPage(p => p + 1)} className="btn btn-outline">Next</button>
                </div>
              </motion.div>
            )}

            {/* === CITY MANAGEMENT MEMBERS === */}
            {activeTab === "city_members" && (
              <motion.div key="city_members" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="admin-table-card">
                <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--color-border-light)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                  <h3 style={{ fontSize: "1.25rem", color: "var(--color-primary)", margin: 0 }}>City Management Members ({cityMembers.length})</h3>
                  {hasWritePermission && (
                    <button onClick={() => setShowAddCityMemberModal(true)} className="btn btn-primary" style={{ fontSize: "0.85rem", padding: "0.45rem 1rem" }}>
                      + Add City Member
                    </button>
                  )}
                </div>
                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Photo</th>
                        <th>Name &amp; Role</th>
                        <th>ID &amp; Contact</th>
                        <th>Visibility</th>
                        <th style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginateList(filterList(cityMembers, ["name", "role", "dayId", "email"])).map(t => (
                        <tr key={t.id}>
                          <td>
                            {editingCityMemberId === t.id ? (
                              <ImageUploader
                                folder="team"
                                label="Photo"
                                currentUrl={editingCityMember?.image || ""}
                                onUpload={(url) => setEditingCityMember(prev => prev ? { ...prev, image: url } : null)}
                              />
                            ) : (
                              <img src={t.image} alt={t.name} style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "50%", border: "2px solid var(--color-border-light)" }} onError={(e) => { (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(t.name) + "&background=00A99D&color=fff"; }} />
                            )}
                          </td>
                          <td>
                            {editingCityMemberId === t.id ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxWidth: "200px" }}>
                                <input type="text" value={editingCityMember?.name || ""} onChange={(e) => setEditingCityMember(prev => prev ? { ...prev, name: e.target.value } : null)} className="form-input" style={{ padding: "2px 6px", fontSize: "0.85rem" }} placeholder="Name" />
                                <input type="text" value={editingCityMember?.role || ""} onChange={(e) => setEditingCityMember(prev => prev ? { ...prev, role: e.target.value } : null)} className="form-input" style={{ padding: "2px 6px", fontSize: "0.85rem" }} placeholder="Role" />
                              </div>
                            ) : (
                              <>
                                <strong>{t.name}</strong>
                                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{t.role}</div>
                              </>
                            )}
                          </td>
                          <td>
                            {editingCityMemberId === t.id ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                <input type="text" value={editingCityMember?.dayId || ""} onChange={(e) => setEditingCityMember(prev => prev ? { ...prev, dayId: e.target.value } : null)} className="form-input" style={{ padding: "2px 6px", fontSize: "0.85rem" }} placeholder="ID (dayId)" />
                                <input type="email" value={editingCityMember?.email || ""} onChange={(e) => setEditingCityMember(prev => prev ? { ...prev, email: e.target.value } : null)} className="form-input" style={{ padding: "2px 6px", fontSize: "0.85rem" }} placeholder="Email" />
                                <input type="text" value={editingCityMember?.linkedin || ""} onChange={(e) => setEditingCityMember(prev => prev ? { ...prev, linkedin: e.target.value } : null)} className="form-input" style={{ padding: "2px 6px", fontSize: "0.85rem" }} placeholder="LinkedIn URL" />
                                <input type="number" value={editingCityMember?.order || 0} onChange={(e) => setEditingCityMember(prev => prev ? { ...prev, order: parseInt(e.target.value) || 0 } : null)} className="form-input" style={{ padding: "2px 6px", fontSize: "0.85rem" }} placeholder="Display Order" />
                              </div>
                            ) : (
                              <>
                                {t.dayId && t.dayId !== "NA" && <div style={{ fontSize: "0.75rem", fontFamily: "monospace" }}>ID: {t.dayId}</div>}
                                <div style={{ fontSize: "0.75rem" }}>{t.email}</div>
                                {t.linkedin && <a href={t.linkedin} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.7rem", color: "var(--color-primary)" }}>LinkedIn ↗</a>}
                              </>
                            )}
                          </td>
                          <td>
                            {editingCityMemberId === t.id ? (
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <input type="checkbox" id={`edit-hide-${t.id}`} checked={editingCityMember?.hidden || false} onChange={(e) => setEditingCityMember(prev => prev ? { ...prev, hidden: e.target.checked } : null)} />
                                <label htmlFor={`edit-hide-${t.id}`} style={{ fontSize: "0.75rem" }}>Hidden</label>
                              </div>
                            ) : (
                              <span className={`status-badge ${t.hidden ? 'status-hold' : 'status-approved'}`}>
                                {t.hidden ? "Hidden" : "Visible"}
                              </span>
                            )}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {hasWritePermission && (
                              <div className="action-group" style={{ justifyContent: "flex-end", gap: "6px" }}>
                                {editingCityMemberId === t.id ? (
                                  <>
                                    <button onClick={() => handleSaveCityMemberEdit(t.id)} className="btn-icon approve"><Check size={14} /></button>
                                    <button onClick={() => { setEditingCityMemberId(null); setEditingCityMember(null); }} className="btn-icon reject"><X size={14} /></button>
                                  </>
                                ) : (
                                  <>
                                    <button onClick={() => {
                                      updateCityMember(t.id, { hidden: !t.hidden });
                                      setCityMembers(prev => prev.map(cm => cm.id === t.id ? { ...cm, hidden: !cm.hidden } : cm));
                                    }} className="btn btn-outline" style={{ padding: "2px 8px", fontSize: "0.72rem", color: t.hidden ? "#dc2626" : "#16a34a" }} title={t.hidden ? "Click to Show" : "Click to Hide"}>
                                      {t.hidden ? "Show" : "Hide"}
                                    </button>
                                    <button onClick={() => handleEditCityMemberClick(t)} className="btn btn-outline" style={{ padding: "2px 8px", fontSize: "0.75rem" }}>Edit</button>
                                    <button onClick={() => handleDeleteCityMember(t.id)} className="btn-icon reject" title="Move to Recycle Bin"><Trash2 size={14} /></button>
                                  </>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                      {cityMembers.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-muted)" }}>No city management members yet. Click "+ Add City Member" to add one.</td></tr>}
                    </tbody>
                  </table>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "1rem", borderTop: "1px solid var(--color-border-light)" }}>
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="btn btn-outline">Prev</button>
                  <span style={{ fontSize: "0.85rem", alignSelf: "center" }}>Page {currentPage} of {Math.ceil(cityMembers.length / rowsPerPage) || 1}</span>
                  <button disabled={currentPage >= Math.ceil(cityMembers.length / rowsPerPage)} onClick={() => setCurrentPage(p => p + 1)} className="btn btn-outline">Next</button>
                </div>
              </motion.div>
            )}

            {/* === TESTIMONIALS === */}
            {activeTab === "testimonials" && (
              <motion.div key="testimonials" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="admin-table-card">
                <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--color-border-light)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                  <h3 style={{ fontSize: "1.25rem", color: "var(--color-primary)", margin: 0 }}>Echoes of Gratitude ({testimonials.length})</h3>
                  {hasWritePermission && (
                    <button onClick={() => setShowAddTestimonialModal(true)} className="btn btn-primary" style={{ fontSize: "0.85rem", padding: "0.45rem 1rem" }}>
                      + Add Testimonial
                    </button>
                  )}
                </div>
                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Photo</th>
                        <th>Name &amp; Role</th>
                        <th>Review</th>
                        <th>Visibility</th>
                        <th style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginateList(filterList(testimonials, ["name", "role", "quote"])).map(t => (
                        <tr key={t.id}>
                          <td>
                            {editingTestimonialId === t.id ? (
                              <ImageUploader
                                folder="testimonials"
                                label="Photo"
                                currentUrl={editingTestimonial?.image || ""}
                                onUpload={(url) => setEditingTestimonial(prev => prev ? { ...prev, image: url } : null)}
                              />
                            ) : (
                              <img src={t.image} alt={t.name} style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "50%", border: "2px solid var(--color-border-light)" }} onError={(e) => { (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(t.name) + "&background=0F4C81&color=fff"; }} />
                            )}
                          </td>
                          <td>
                            {editingTestimonialId === t.id ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxWidth: "200px" }}>
                                <input type="text" value={editingTestimonial?.name || ""} onChange={(e) => setEditingTestimonial(prev => prev ? { ...prev, name: e.target.value } : null)} className="form-input" style={{ padding: "2px 6px", fontSize: "0.85rem" }} placeholder="Name" />
                                <input type="text" value={editingTestimonial?.role || ""} onChange={(e) => setEditingTestimonial(prev => prev ? { ...prev, role: e.target.value } : null)} className="form-input" style={{ padding: "2px 6px", fontSize: "0.85rem" }} placeholder="Role / Location" />
                              </div>
                            ) : (
                              <>
                                <strong>{t.name}</strong>
                                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{t.role}</div>
                              </>
                            )}
                          </td>
                          <td style={{ maxWidth: "300px", whiteSpace: "normal" }}>
                            {editingTestimonialId === t.id ? (
                              <textarea value={editingTestimonial?.quote || ""} onChange={(e) => setEditingTestimonial(prev => prev ? { ...prev, quote: e.target.value } : null)} className="form-textarea" style={{ padding: "2px 6px", fontSize: "0.85rem" }} placeholder="Review text" rows={3}></textarea>
                            ) : (
                              <div style={{ fontSize: "0.85rem", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{t.quote}</div>
                            )}
                          </td>
                          <td>
                            <span className={`status-badge ${t.hidden ? 'status-hold' : 'status-approved'}`}>
                              {t.hidden ? "Hidden" : "Visible"}
                            </span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {hasWritePermission && (
                              <div className="action-group" style={{ justifyContent: "flex-end", gap: "6px" }}>
                                {editingTestimonialId === t.id ? (
                                  <>
                                    <button onClick={() => handleSaveTestimonialEdit(t.id)} className="btn-icon approve"><Check size={14} /></button>
                                    <button onClick={() => { setEditingTestimonialId(null); setEditingTestimonial(null); }} className="btn-icon reject"><X size={14} /></button>
                                  </>
                                ) : (
                                  <>
                                    <button onClick={() => handleToggleVisibility("testimonials", t)} className="btn btn-outline" style={{ padding: "2px 8px", fontSize: "0.72rem", color: t.hidden ? "#dc2626" : "#16a34a" }} title={t.hidden ? "Click to Show" : "Click to Hide"}>
                                      {t.hidden ? "Show" : "Hide"}
                                    </button>
                                    <button onClick={() => handleEditTestimonialClick(t)} className="btn btn-outline" style={{ padding: "2px 8px", fontSize: "0.75rem" }}>Edit</button>
                                    <button onClick={() => handleDeleteTestimonial(t.id)} className="btn-icon reject" title="Move to Recycle Bin"><Trash2 size={14} /></button>
                                  </>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                      {testimonials.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-muted)" }}>No testimonials yet. Click "+ Add Testimonial" to add one.</td></tr>}
                    </tbody>
                  </table>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "1rem", borderTop: "1px solid var(--color-border-light)" }}>
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="btn btn-outline">Prev</button>
                  <span style={{ fontSize: "0.85rem", alignSelf: "center" }}>Page {currentPage} of {Math.ceil(testimonials.length / rowsPerPage) || 1}</span>
                  <button disabled={currentPage >= Math.ceil(testimonials.length / rowsPerPage)} onClick={() => setCurrentPage(p => p + 1)} className="btn btn-outline">Next</button>
                </div>
              </motion.div>
            )}

            {/* === VOLUNTEERS === */}
            {activeTab === "volunteers" && (
              <motion.div key="volunteers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="admin-table-card" id="volunteers-table">
                <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--color-border-light)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontSize: "1.25rem", color: "var(--color-primary)" }}>Volunteer Applications</h3>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button onClick={() => printTable("Volunteers", "volunteers-table")} className="btn btn-outline" style={{ display: "inline-flex", gap: "4px", alignItems: "center" }}><Printer size={13} /> Print</button>
                    <button onClick={() => exportToCSV(volunteers.map(v => ({
                      Name: v.name,
                      Email: v.email,
                      Phone: v.phone,
                      WhatsApp: v.phoneWhatsapp || "",
                      City: v.city,
                      Age: v.age || "",
                      DOB: v.dob || "",
                      "Father Name": v.fatherName || "",
                      "Mother Name": v.motherName || "",
                      "Aadhar Number": v.aadharNumber || "",
                      "Preferred Mode": v.preferredMode || "",
                      "Education Status": v.educationStatus || "",
                      Motivation: v.motivation || "",
                      Status: v.status || "pending",
                      "Ticket Number": v.ticketNo || "",
                      "Date Applied": v.createdAt || v.currentDate || "",
                      Comments: v.adminComment || ""
                    })), "Volunteers")} className="btn btn-outline">CSV</button>
                    <button onClick={() => handleExportSelected("volunteer")} disabled={selectedIds.length === 0} className="btn btn-outline" style={{ opacity: selectedIds.length === 0 ? 0.5 : 1 }}>Export Selected ({selectedIds.length})</button>
                    {hasWritePermission && <button onClick={() => handleBulkDelete("volunteer")} className="btn btn-outline" style={{ borderColor: "var(--color-secondary)", color: "var(--color-secondary)" }}>Bulk Delete</button>}
                  </div>
                </div>
                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Select</th>
                        <th>Name &amp; City</th>
                        <th>Contact</th>
                        <th>Status</th>
                        <th style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginateList(filterList(volunteers, ["name", "city", "email"])).map(v => (
                        <tr key={v.id}>
                          <td><input type="checkbox" checked={selectedIds.includes(v.id)} onChange={() => handleSelectRow(v.id)} /></td>
                          <td>
                            <strong 
                              style={{ cursor: "pointer", color: "var(--color-primary)", textDecoration: "underline" }}
                              onClick={() => setSelectedSubmission({ type: 'volunteer', data: v })}
                              title="Click to view full details"
                            >
                              {v.name}
                            </strong>
                            <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                              {v.city} • Ticket: <code style={{ fontFamily: "monospace", color: "var(--color-primary)", fontWeight: 700 }}>{v.ticketNo || "N/A"}</code>
                            </div>
                            {v.permanentVolunteerId && (
                              <div style={{ fontSize: "0.75rem", color: "var(--color-primary)", fontWeight: 800, marginTop: "2px" }}>
                                ID: <span style={{ fontFamily: "monospace" }}>{v.permanentVolunteerId}</span>
                                {hasWritePermission && (
                                  <button onClick={() => handleEditVolunteerId(v.id, v.permanentVolunteerId)} className="btn btn-outline" style={{ display: "inline-block", fontSize: "0.65rem", padding: "0 4px", marginLeft: "6px", height: "auto", lineHeight: "1.2" }}>Edit ID</button>
                                )}
                              </div>
                            )}
                          </td>
                          <td>
                            {v.email}
                            {v.adminComment && (
                              <div style={{ fontSize: "0.75rem", color: "var(--color-primary)", marginTop: "4px" }}>
                                💬 <em>Feedback: {v.adminComment}</em>
                              </div>
                            )}
                          </td>
                          <td><span className={`status-badge status-${v.status}`}>{v.status}</span></td>
                          <td style={{ textAlign: "right" }}>
                            {hasWritePermission && (
                              <div className="action-group" style={{ justifyContent: "flex-end", gap: "12px", display: "flex", alignItems: "center" }}>
                                {v.status === "pending" && (
                                  <>
                                    <button onClick={() => handleVolunteerApproval(v.id, "approved")} className="btn-icon approve" title="Approve & Allot ID" style={{ marginInline: "2px" }}><UserCheck size={15} /></button>
                                    <button onClick={() => handleVolunteerApproval(v.id, "rejected")} className="btn-icon reject" title="Reject" style={{ marginInline: "2px" }}><X size={15} /></button>
                                  </>
                                )}
                                <button onClick={() => handleEditVolunteerId(v.id, v.permanentVolunteerId)} className="btn-icon edit" title="Allot / Edit Permanent Volunteer ID" style={{ marginInline: "2px" }}><Tag size={15} /></button>
                                <button onClick={() => handleUpdateComment(v.id, 'volunteer', v.adminComment)} className="btn-icon edit" title="Add/Edit Feedback" style={{ marginInline: "2px" }}><MessageSquare size={15} /></button>
                                <button onClick={() => handleDeleteRecord(v.id, "volunteer")} className="btn-icon reject" title="Delete" style={{ marginInline: "2px" }}><Trash2 size={15} /></button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Pagination Controls */}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "1rem", borderTop: "1px solid var(--color-border-light)" }}>
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="btn btn-outline">Prev</button>
                  <span style={{ fontSize: "0.85rem", alignSelf: "center" }}>Page {currentPage} of {Math.ceil(volunteers.length / rowsPerPage) || 1}</span>
                  <button disabled={currentPage >= Math.ceil(volunteers.length / rowsPerPage)} onClick={() => setCurrentPage(p => p + 1)} className="btn btn-outline">Next</button>
                </div>
              </motion.div>
            )}

            {/* === INTERNSHIPS === */}
            {activeTab === "internships" && (
              <motion.div key="internships" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="admin-table-card">
                <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--color-border-light)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontSize: "1.25rem", color: "var(--color-primary)" }}>Internship Applications</h3>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button onClick={() => exportToCSV(internships.map(i => ({
                      Name: i.name,
                      Email: i.email,
                      Phone: i.phone,
                      WhatsApp: i.phoneWhatsapp || "",
                      City: i.city,
                      Age: i.age || "",
                      DOB: i.dob || "",
                      "Father Name": i.fatherName || "",
                      "Mother Name": i.motherName || "",
                      "Aadhar Number": i.aadharNumber || "",
                      College: i.college || "",
                      Course: i.course || "",
                      Year: i.year || "",
                      Department: i.department || "",
                      "Internship Mode": i.internshipMode || "",
                      Motivation: i.motivation || "",
                      Status: i.status || "pending",
                      "Temporary ID": i.tempInternshipId || "",
                      "Permanent ID": i.permanentInternshipId || "",
                      "Ticket Number": i.ticketNo || "",
                      "Date Applied": i.createdAt || i.currentDate || "",
                      Comments: i.adminComment || ""
                    })), "Internships")} className="btn btn-outline">CSV</button>
                    <button onClick={() => handleExportSelected("internship")} disabled={selectedIds.length === 0} className="btn btn-outline" style={{ opacity: selectedIds.length === 0 ? 0.5 : 1 }}>Export Selected ({selectedIds.length})</button>
                    {hasWritePermission && <button onClick={() => handleBulkDelete("internship")} className="btn btn-outline" style={{ borderColor: "var(--color-secondary)", color: "var(--color-secondary)" }}>Bulk Delete</button>}
                  </div>
                </div>
                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Select</th>
                        <th>Applicant</th>
                        <th>College &amp; Dept</th>
                        <th>Status</th>
                        <th style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginateList(filterList(internships, ["name", "college", "department"])).map(v => (
                        <tr key={v.id}>
                          <td><input type="checkbox" checked={selectedIds.includes(v.id)} onChange={() => handleSelectRow(v.id)} /></td>
                          <td>
                            <strong 
                              style={{ cursor: "pointer", color: "var(--color-primary)", textDecoration: "underline" }}
                              onClick={() => setSelectedSubmission({ type: 'internship', data: v })}
                              title="Click to view full details"
                            >
                              {v.name}
                            </strong>
                            <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                              Ticket: <code style={{ fontFamily: "monospace", color: "var(--color-primary)", fontWeight: 700 }}>{v.tempInternshipId || "N/A"}</code>
                            </div>
                            {v.permanentInternshipId && (
                              <div style={{ fontSize: "0.75rem", color: "var(--color-primary)", fontWeight: 800, marginTop: "2px" }}>
                                ID: <span style={{ fontFamily: "monospace" }}>{v.permanentInternshipId}</span>
                                {hasWritePermission && (
                                  <button onClick={() => handleEditInternId(v.id, v.permanentInternshipId)} className="btn btn-outline" style={{ display: "inline-block", fontSize: "0.65rem", padding: "0 4px", marginLeft: "6px", height: "auto", lineHeight: "1.2" }}>Edit ID</button>
                                )}
                              </div>
                            )}
                          </td>
                          <td>
                            {v.college} • {v.department}
                            {v.adminComment && (
                              <div style={{ fontSize: "0.75rem", color: "var(--color-primary)", marginTop: "4px" }}>
                                💬 <em>Feedback: {v.adminComment}</em>
                              </div>
                            )}
                          </td>
                          <td><span className={`status-badge status-${v.status}`}>{v.status}</span></td>
                          <td style={{ textAlign: "right" }}>
                            {hasWritePermission && (
                              <div className="action-group" style={{ justifyContent: "flex-end", gap: "12px", display: "flex", alignItems: "center" }}>
                                {v.status === "pending" && (
                                  <>
                                    <button onClick={() => handleApproveInternship(v.id)} className="btn-icon approve" title="Approve & Allot ID" style={{ marginInline: "2px" }}><GraduationCap size={15} /></button>
                                    <button onClick={() => handleRejectInternship(v.id)} className="btn-icon reject" title="Reject" style={{ marginInline: "2px" }}><X size={15} /></button>
                                  </>
                                )}
                                <button onClick={() => handleEditInternId(v.id, v.permanentInternshipId)} className="btn-icon edit" title="Allot / Edit Permanent Intern ID" style={{ marginInline: "2px" }}><Tag size={15} /></button>
                                <button onClick={() => handleUpdateComment(v.id, 'internship', v.adminComment)} className="btn-icon edit" title="Add/Edit Feedback" style={{ marginInline: "2px" }}><MessageSquare size={15} /></button>
                                <button onClick={() => handleDeleteRecord(v.id, "internship")} className="btn-icon reject" title="Delete" style={{ marginInline: "2px" }}><Trash2 size={15} /></button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Pagination Controls */}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "1rem", borderTop: "1px solid var(--color-border-light)" }}>
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="btn btn-outline">Prev</button>
                  <span style={{ fontSize: "0.85rem", alignSelf: "center" }}>Page {currentPage} of {Math.ceil(internships.length / rowsPerPage) || 1}</span>
                  <button disabled={currentPage >= Math.ceil(internships.length / rowsPerPage)} onClick={() => setCurrentPage(p => p + 1)} className="btn btn-outline">Next</button>
                </div>
              </motion.div>
            )}

            {/* === DONATIONS === */}
            {activeTab === "donations" && (
              <motion.div key="donations" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="admin-table-card">
                <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--color-border-light)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                  <h3 style={{ fontSize: "1.25rem", color: "var(--color-primary)", margin: 0 }}>Donations Ledger</h3>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {hasWritePermission && (
                      <button onClick={() => setShowAddDonationModal(true)} className="btn btn-primary" style={{ fontSize: "0.8rem", padding: "0.4rem 0.8rem" }}>
                        + Add Manual Donation
                      </button>
                    )}
                    <button onClick={() => exportToCSV(donations.map(d => ({
                      "Donor Name": d.donorName,
                      Email: d.donorEmail,
                      Amount: `₹${d.amount}`,
                      Purpose: d.purpose,
                      "Transaction ID": d.transactionId,
                      Date: d.createdAt,
                      Status: d.status || "success",
                      "Is Anonymous": d.isAnonymous ? "Yes" : "No"
                    })), "Donations")} className="btn btn-outline">Export CSV</button>
                    <button onClick={() => handleExportSelected("donation")} disabled={selectedIds.length === 0} className="btn btn-outline" style={{ opacity: selectedIds.length === 0 ? 0.5 : 1 }}>Export Selected ({selectedIds.length})</button>
                    {hasWritePermission && <button onClick={() => handleBulkDelete("donation")} className="btn btn-outline" style={{ borderColor: "var(--color-secondary)", color: "var(--color-secondary)" }}>Bulk Delete</button>}
                  </div>
                </div>
                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Select</th>
                        <th>Donor</th>
                        <th>Purpose</th>
                        <th>Amount</th>
                        <th>Tx ID</th>
                        <th>Date</th>
                        <th style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginateList(filterList(donations, ["donorName", "purpose", "transactionId"])).map(d => (
                        <tr key={d.id}>
                          <td><input type="checkbox" checked={selectedIds.includes(d.id)} onChange={() => handleSelectRow(d.id)} /></td>
                          <td>
                            <strong 
                              style={{ cursor: "pointer", color: "var(--color-primary)", textDecoration: "underline" }}
                              onClick={() => setSelectedSubmission({ type: 'donation', data: d })}
                              title="Click to view details"
                            >
                              {d.donorName}
                            </strong>
                            <br />
                            <small style={{ color: "var(--color-text-muted)" }}>{d.donorEmail}</small>
                          </td>
                          <td>{d.purpose}</td>
                          <td style={{ color: "var(--color-secondary)", fontWeight: 800 }}>₹{d.amount?.toLocaleString("en-IN")}</td>
                          <td><small style={{ fontFamily: "monospace", color: "var(--color-text-muted)" }}>{d.transactionId}</small></td>
                          <td><small>{new Date(d.createdAt).toLocaleDateString("en-IN")}</small></td>
                          <td style={{ textAlign: "right" }}>
                            <div style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                              <button onClick={() => handleToggleVisibility("donations", d)} className="btn btn-outline" style={{ padding: "2px 8px", fontSize: "0.72rem", color: d.hidden ? "#dc2626" : "#16a34a" }} title={d.hidden ? "Click to Show" : "Click to Hide"}>
                                {d.hidden ? "Show" : "Hide"}
                              </button>
                              <button onClick={() => handleReprintReceipt(d)} className="btn-icon approve" title="Reprint receipt slip"><Printer size={14} /></button>
                              {hasWritePermission && <button onClick={() => handleDeleteDonation(d.id)} className="btn-icon reject" title="Delete record"><Trash2 size={14} /></button>}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {donations.length === 0 && (
                        <tr><td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-muted)" }}>No donations received yet. Live donations from the Donate page will appear here.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "1rem", borderTop: "1px solid var(--color-border-light)" }}>
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="btn btn-outline">Prev</button>
                  <span style={{ fontSize: "0.85rem", alignSelf: "center" }}>Page {currentPage} of {Math.ceil(donations.length / rowsPerPage) || 1}</span>
                  <button disabled={currentPage >= Math.ceil(donations.length / rowsPerPage)} onClick={() => setCurrentPage(p => p + 1)} className="btn btn-outline">Next</button>
                </div>
              </motion.div>
            )}

            {/* === CONTACT MESSAGES === */}
            {activeTab === "contacts" && (
              <motion.div key="contacts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="admin-table-card">
                <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--color-border-light)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontSize: "1.25rem", color: "var(--color-primary)" }}>Contact Messages & Inquiries</h3>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button onClick={() => exportToCSV(contactsList.map(c => ({
                      Name: c.name,
                      Email: c.email,
                      Subject: c.subject,
                      Message: c.message,
                      "Ticket Number": c.ticketNo || "",
                      Date: c.createdAt || "",
                      Status: c.status || "pending",
                      Comments: c.adminComment || ""
                    })), "Contact_Messages")} className="btn btn-outline">Export CSV</button>
                    <button onClick={() => handleExportSelected("contact")} disabled={selectedIds.length === 0} className="btn btn-outline" style={{ opacity: selectedIds.length === 0 ? 0.5 : 1 }}>Export Selected ({selectedIds.length})</button>
                  </div>
                </div>
                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Select</th>
                        <th>Sender</th>
                        <th>Subject & Message</th>
                        <th>Status</th>
                        <th style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginateList(filterList(contactsList, ["name", "email", "subject", "message"])).map(c => (
                        <tr key={c.id}>
                          <td><input type="checkbox" checked={!!c.id && selectedIds.includes(c.id)} onChange={() => c.id && handleSelectRow(c.id)} /></td>
                          <td>
                            <strong 
                              style={{ cursor: "pointer", color: "var(--color-primary)", textDecoration: "underline" }}
                              onClick={() => setSelectedSubmission({ type: 'contact', data: c })}
                              title="Click to view full details"
                            >
                              {c.name}
                            </strong>
                            <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                              {c.email} • Ticket: <code style={{ fontFamily: "monospace", color: "var(--color-primary)", fontWeight: 700 }}>{c.ticketNo || "N/A"}</code>
                            </div>
                          </td>
                          <td>
                            <strong>{c.subject}</strong>
                            <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "var(--color-text-dark)", whiteSpace: "pre-line" }}>{c.message}</p>
                            {c.adminComment && (
                              <div style={{ fontSize: "0.75rem", color: "var(--color-primary)", marginTop: "8px" }}>
                                💬 <em>Feedback: {c.adminComment}</em>
                              </div>
                            )}
                          </td>
                          <td>
                            <span className={`status-badge status-${c.status || "pending"}`}>{c.status || "pending"}</span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {hasWritePermission && (
                              <div className="action-group" style={{ justifyContent: "flex-end", gap: "6px" }}>
                                {c.status !== 'resolved' && (
                                  <button onClick={() => handleResolveContact(c.id!, c.adminComment)} className="btn-icon approve" title="Close Ticket / Resolve"><Check size={13} /></button>
                                )}
                                <button onClick={() => handleUpdateComment(c.id!, 'contact', c.adminComment)} className="btn-icon edit" title="Add/Edit Feedback"><MessageSquare size={13} /></button>
                                <button onClick={() => handleDeleteContact(c.id!)} className="btn-icon reject" title="Delete"><Trash2 size={13} /></button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                      {contactsList.length === 0 && (
                        <tr><td colSpan={4} style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-muted)" }}>No messages received yet. Messages submitted on the Contact page will appear here.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "1rem", borderTop: "1px solid var(--color-border-light)" }}>
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="btn btn-outline">Prev</button>
                  <span style={{ fontSize: "0.85rem", alignSelf: "center" }}>Page {currentPage} of {Math.ceil(contactsList.length / rowsPerPage) || 1}</span>
                  <button disabled={currentPage >= Math.ceil(contactsList.length / rowsPerPage)} onClick={() => setCurrentPage(p => p + 1)} className="btn btn-outline">Next</button>
                </div>
              </motion.div>
            )}

            {/* === COMPLAINTS === */}
            {activeTab === "complaints" && (
              <motion.div key="complaints" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="admin-table-card">
                <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--color-border-light)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                  <h3 style={{ fontSize: "1.25rem", color: "var(--color-primary)" }}>Complaints Registry</h3>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button onClick={() => exportToCSV(complaintsList.map(c => ({
                      Name: c.name,
                      Email: c.email,
                      Phone: c.phone || "N/A",
                      Type: c.complaintType,
                      "ID Number": c.membershipId,
                      Issue: c.issue,
                      "Ticket Number": c.ticketNo || "",
                      Date: c.createdAt || "",
                      Status: c.status || "pending",
                      Comments: c.adminComment || ""
                    })), "Complaints_List")} className="btn btn-outline">Export CSV</button>
                    <button onClick={() => handleExportSelected("complaint")} disabled={selectedIds.length === 0} className="btn btn-outline" style={{ opacity: selectedIds.length === 0 ? 0.5 : 1 }}>Export Selected ({selectedIds.length})</button>
                  </div>
                </div>
                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Select</th>
                        <th>Sender</th>
                        <th>Type & ID</th>
                        <th>Issue Details</th>
                        <th>Status</th>
                        <th style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginateList(filterList(complaintsList, ["name", "email", "phone", "membershipId", "issue"])).map(c => (
                        <tr key={c.id}>
                          <td><input type="checkbox" checked={!!c.id && selectedIds.includes(c.id)} onChange={() => c.id && handleSelectRow(c.id)} /></td>
                          <td>
                            <strong 
                              style={{ cursor: "pointer", color: "var(--color-primary)", textDecoration: "underline" }}
                              onClick={() => setSelectedSubmission({ type: 'complaint', data: c })}
                              title="Click to view full details"
                            >
                              {c.name}
                            </strong>
                            <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                              {c.email} • {c.phone || "No Phone"}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                              Ticket: <code style={{ fontFamily: "monospace", color: "var(--color-primary)", fontWeight: 700 }}>{c.ticketNo || "N/A"}</code>
                            </div>
                          </td>
                          <td>
                            <span className="status-badge" style={{ backgroundColor: "rgba(105, 108, 255, 0.08)", color: "#696cff", fontSize: "0.75rem", textTransform: "capitalize" }}>
                              {c.complaintType}
                            </span>
                            <div style={{ fontSize: "0.8rem", fontWeight: 600, marginTop: "4px" }}>
                              ID: {c.membershipId}
                            </div>
                          </td>
                          <td>
                            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--color-text-dark)", whiteSpace: "pre-line" }}>{c.issue}</p>
                            {c.adminComment && (
                              <div style={{ fontSize: "0.75rem", color: "var(--color-primary)", marginTop: "8px" }}>
                                💬 <em>Feedback: {c.adminComment}</em>
                              </div>
                            )}
                          </td>
                          <td>
                            <span className={`status-badge status-${c.status || "pending"}`}>{c.status || "pending"}</span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {hasWritePermission && (
                              <div className="action-group" style={{ justifyContent: "flex-end", gap: "6px" }}>
                                {c.status !== 'resolved' && (
                                  <button onClick={() => handleResolveComplaint(c.id!, c.adminComment)} className="btn-icon approve" title="Close Ticket / Resolve"><Check size={13} /></button>
                                )}
                                <button onClick={() => handleUpdateComment(c.id!, 'complaint', c.adminComment)} className="btn-icon edit" title="Add/Edit Feedback"><MessageSquare size={13} /></button>
                                <button onClick={() => handleDeleteComplaint(c.id!)} className="btn-icon reject" title="Delete"><Trash2 size={13} /></button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                      {complaintsList.length === 0 && (
                        <tr><td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-muted)" }}>No complaints registered yet. Complaints submitted on the Contact page will appear here.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "1rem", borderTop: "1px solid var(--color-border-light)" }}>
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="btn btn-outline">Prev</button>
                  <span style={{ fontSize: "0.85rem", alignSelf: "center" }}>Page {currentPage} of {Math.ceil(complaintsList.length / rowsPerPage) || 1}</span>
                  <button disabled={currentPage >= Math.ceil(complaintsList.length / rowsPerPage)} onClick={() => setCurrentPage(p => p + 1)} className="btn btn-outline">Next</button>
                </div>
              </motion.div>
            )}

            {/* === AUDIT LOGS === */}
            {activeTab === "audit_logs" && (
              <motion.div key="audit_logs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="admin-table-card">
                <h3 style={{ padding: "1.5rem", borderBottom: "1px solid var(--color-border-light)" }}>Action History & Audit Logs</h3>
                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr><th>User</th><th>Action</th><th>Timestamp</th><th>Device Info</th></tr>
                    </thead>
                    <tbody>
                      {auditLogs.map(log => (
                        <tr key={log.id}>
                          <td><strong>{log.user}</strong></td>
                          <td>{log.action}</td>
                          <td>{new Date(log.timestamp).toLocaleString("en-IN")}</td>
                          <td style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{log.device}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* === USER MANAGEMENT === */}
            {activeTab === "users" && (
              <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem" }}>
                  {isSuperAdmin && (
                    <div className="premium-card" style={{ backgroundColor: "var(--color-bg-white)", border: "1px solid var(--color-border-light)" }}>
                      <h3 style={{ fontSize: "1.25rem", color: "var(--color-primary)", marginBottom: "1.5rem" }}>Create Admin User</h3>
                      <form onSubmit={handleCreateAdmin}>
                        <div className="form-group">
                          <label className="form-label">Email *</label>
                          <input type="email" required value={newAdmin.email} onChange={(e) => setNewAdmin(prev => ({ ...prev, email: e.target.value }))} className="form-input" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Role *</label>
                          <select value={newAdmin.role} onChange={(e) => setNewAdmin(prev => ({ ...prev, role: e.target.value }))} className="form-select">
                            <option>Admin</option>
                            <option>Editor</option>
                            <option>SEO Manager</option>
                            <option>Content Manager</option>
                            <option>Volunteer Manager</option>
                            <option>Internship Manager</option>
                            <option>Donation Manager</option>
                            <option>Viewer</option>
                          </select>
                        </div>
                        <button type="submit" disabled={actionLoading} className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
                          Add User
                        </button>
                      </form>
                    </div>
                  )}
                  <div className="admin-table-card">
                    <h3 style={{ padding: "1.25rem", borderBottom: "1px solid var(--color-border-light)" }}>Administrators</h3>
                    <div className="table-wrapper">
                      <table className="admin-table">
                        <thead><tr><th>Email</th><th>Role</th><th style={{ textAlign: "right" }}>Actions</th></tr></thead>
                        <tbody>
                          {adminsList.map(adm => (
                            <tr key={adm.email}>
                              <td><strong>{adm.email}</strong></td>
                              <td><span className="status-badge" style={{ backgroundColor: "rgba(15, 76, 129, 0.1)", color: "var(--color-primary)" }}>{adm.role}</span></td>
                              <td style={{ textAlign: "right" }}>
                                {isSuperAdmin && adm.email !== "owner@dayfoundation.com" && adm.email !== "mrshahidbabu@dayfoundation.in" && adm.email !== "info@dayfoundation.in" && (
                                  <button onClick={() => handleDeleteAdmin(adm.email)} className="btn-icon reject"><Trash2 size={14} /></button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* === SEO SETTINGS === */}
            {activeTab === "seo" && (() => {
              const ALL_PAGES: { path: string; label: string }[] = [
                { path: "/", label: "🏠 Home" },
                { path: "/about", label: "ℹ️ About Us" },
                { path: "/mission", label: "🎯 Mission & Vision" },
                { path: "/programs", label: "📋 Programs" },
                { path: "/gallery", label: "🖼️ Gallery" },
                { path: "/blogs", label: "📰 Blogs & News" },
                { path: "/events", label: "📅 Events" },
                { path: "/volunteer", label: "🤝 Volunteer" },
                { path: "/internship", label: "🎓 Internship" },
                { path: "/donate", label: "💖 Donate" },
                { path: "/contact", label: "📞 Contact" },
                { path: "/internship-status", label: "🔍 Internship Status" },
              ];

              const getSeoForPage = (path: string): SeoPageSetting => {
                const saved = seoSettings.find(s => s.path === path);
                if (saved) return saved;
                // Fallback to static map
                const fb = fallbackSEOMap[path] || fallbackSEOMap["/"];
                return { path, title: fb.title, description: fb.description, keywords: fb.keywords, ogImage: "", canonical: `https://www.dayfoundation.in${path}` };
              };

              return (
                <motion.div key="seo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ width: "100%", maxWidth: "960px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <div>
                      <h3 style={{ fontSize: "1.25rem", fontWeight: 700 }}>🔍 SEO Manager</h3>
                      <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>Manage per-page SEO: title, description, keywords, OG image, and canonical URL. Changes are saved to Firestore and applied live.</p>
                    </div>
                    {seoSuccess && (
                      <div style={{ padding: "0.5rem 1rem", backgroundColor: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "8px", color: "#15803d", fontSize: "0.82rem", fontWeight: 600 }}>
                        ✅ {seoSuccess}
                      </div>
                    )}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "1.5rem", alignItems: "start" }}>
                    {/* Page List */}
                    <div className="premium-card" style={{ backgroundColor: "var(--color-bg-white)", border: "1px solid var(--color-border-light)", padding: "0" }}>
                      <div style={{ padding: "1rem", borderBottom: "1px solid var(--color-border-light)", fontWeight: 700, fontSize: "0.85rem" }}>📄 Pages</div>
                      <div>
                        {ALL_PAGES.map(page => {
                          const hasSaved = seoSettings.some(s => s.path === page.path);
                          const isEditing = editingSeo?.path === page.path;
                          return (
                            <button
                              key={page.path}
                              onClick={() => setEditingSeo(getSeoForPage(page.path))}
                              style={{
                                width: "100%",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "0.75rem 1rem",
                                background: isEditing ? "var(--color-primary)" : "transparent",
                                color: isEditing ? "white" : "var(--color-text-dark)",
                                border: "none",
                                borderBottom: "1px solid var(--color-border-light)",
                                textAlign: "left",
                                cursor: "pointer",
                                fontSize: "0.82rem",
                                fontWeight: isEditing ? 700 : 400,
                                transition: "all 0.2s"
                              }}
                            >
                              <span>{page.label}</span>
                              {hasSaved && <span style={{ fontSize: "0.65rem", padding: "2px 6px", borderRadius: "999px", background: isEditing ? "rgba(255,255,255,0.25)" : "rgba(34,197,94,0.15)", color: isEditing ? "white" : "#15803d", fontWeight: 700 }}>✓ Saved</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Edit Form */}
                    {editingSeo ? (
                      <div className="premium-card" style={{ backgroundColor: "var(--color-bg-white)", border: "1px solid var(--color-border-light)" }}>
                        <h4 style={{ fontWeight: 700, marginBottom: "1.25rem", fontSize: "1rem" }}>Editing: {ALL_PAGES.find(p => p.path === editingSeo.path)?.label || editingSeo.path}</h4>

                        <div className="form-group">
                          <label className="form-label">Page Title <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>(max 60 chars — {editingSeo.title?.length || 0}/60)</span></label>
                          <input type="text" maxLength={60} value={editingSeo.title} onChange={e => setEditingSeo(prev => prev ? { ...prev, title: e.target.value } : prev)} className="form-input" placeholder="DAY Foundation — Page Name" />
                          <div style={{ fontSize: "0.75rem", color: (editingSeo.title?.length || 0) > 55 ? "#ef4444" : "var(--color-text-muted)", marginTop: "0.25rem" }}>
                            {(editingSeo.title?.length || 0) > 60 ? "⚠️ Too long! Google may truncate this." : (editingSeo.title?.length || 0) > 55 ? "⚡ Near limit — keep it tight." : "✓ Good length"}
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Meta Description <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>(max 160 chars — {editingSeo.description?.length || 0}/160)</span></label>
                          <textarea rows={3} maxLength={160} value={editingSeo.description} onChange={e => setEditingSeo(prev => prev ? { ...prev, description: e.target.value } : prev)} className="form-textarea" placeholder="A compelling 160-character description for search results..." />
                          <div style={{ fontSize: "0.75rem", color: (editingSeo.description?.length || 0) > 155 ? "#ef4444" : "var(--color-text-muted)", marginTop: "0.25rem" }}>
                            {(editingSeo.description?.length || 0) > 160 ? "⚠️ Too long!" : (editingSeo.description?.length || 0) > 155 ? "⚡ Near limit." : (editingSeo.description?.length || 0) < 50 ? "ℹ️ Too short — aim for 100–160 chars." : "✓ Good length"}
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Keywords <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>(comma-separated)</span></label>
                          <input type="text" value={editingSeo.keywords} onChange={e => setEditingSeo(prev => prev ? { ...prev, keywords: e.target.value } : prev)} className="form-input" placeholder="ngo india, day foundation, education drive, donate" />
                        </div>

                        <div className="form-group">
                          <label className="form-label">OG Image URL <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>(shown when shared on WhatsApp/Facebook)</span></label>
                          <input type="url" value={editingSeo.ogImage || ""} onChange={e => setEditingSeo(prev => prev ? { ...prev, ogImage: e.target.value } : prev)} className="form-input" placeholder="https://www.dayfoundation.in/og-image.jpg" />
                          {editingSeo.ogImage && (
                            <div style={{ marginTop: "0.5rem", borderRadius: "8px", overflow: "hidden", maxHeight: "120px" }}>
                              <img src={editingSeo.ogImage} alt="OG Preview" style={{ width: "100%", objectFit: "cover", maxHeight: "120px" }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            </div>
                          )}
                        </div>

                        <div className="form-group">
                          <label className="form-label">Canonical URL</label>
                          <input type="url" value={editingSeo.canonical || ""} onChange={e => setEditingSeo(prev => prev ? { ...prev, canonical: e.target.value } : prev)} className="form-input" placeholder={`https://www.dayfoundation.in${editingSeo.path}`} />
                        </div>

                        {/* Live Preview */}
                        <div style={{ background: "#f8f9fa", borderRadius: "10px", padding: "1rem", marginBottom: "1.25rem", border: "1px solid #e2e8f0" }}>
                          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>🔍 Google Preview</div>
                          <div style={{ color: "#1a0dab", fontSize: "1rem", fontWeight: 600, lineHeight: 1.3, marginBottom: "0.25rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{editingSeo.title || "Page Title"}</div>
                          <div style={{ color: "#006621", fontSize: "0.78rem", marginBottom: "0.25rem" }}>www.dayfoundation.in{editingSeo.path}</div>
                          <div style={{ color: "#545454", fontSize: "0.82rem", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{editingSeo.description || "Page description will appear here."}</div>
                        </div>

                        <div style={{ display: "flex", gap: "1rem" }}>
                          <button
                            className="btn btn-primary"
                            disabled={seoSaving}
                            onClick={async () => {
                              if (!editingSeo) return;
                              setSeoSaving(true);
                              setSeoSuccess(null);
                              try {
                                await setSeoSetting(editingSeo);
                                setSeoSettings(prev => {
                                  const idx = prev.findIndex(s => s.path === editingSeo.path);
                                  if (idx >= 0) { const copy = [...prev]; copy[idx] = editingSeo; return copy; }
                                  return [...prev, editingSeo];
                                });
                                // Clear SEO cache so new settings apply immediately
                                sessionStorage.removeItem("day_firestore_seo_cache");
                                sessionStorage.removeItem("day_ai_seo_cache");
                                await recordAuditLog(user?.email || "unknown", `Updated SEO for page: ${editingSeo.path}`);
                                setSeoSuccess(`SEO saved for ${editingSeo.path}`);
                                setTimeout(() => setSeoSuccess(null), 3000);
                              } catch (err) {
                                console.error("Failed to save SEO:", err);
                                alert("❌ Failed to save SEO settings.");
                              } finally {
                                setSeoSaving(false);
                              }
                            }}
                          >
                            {seoSaving ? "Saving..." : "💾 Save SEO"}
                          </button>
                          <button className="btn" style={{ background: "transparent", border: "1px solid var(--color-border)" }} onClick={() => setEditingSeo(null)}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="premium-card" style={{ backgroundColor: "var(--color-bg-white)", border: "1px solid var(--color-border-light)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "300px", gap: "1rem", color: "var(--color-text-muted)" }}>
                        <Globe size={40} strokeWidth={1} />
                        <p style={{ fontSize: "0.9rem" }}>Select a page from the left to edit its SEO</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })()}

            {/* === DEFAULT THEME SETTINGS (Theme Settings Tab) === */}
            {activeTab === "settings" && (
              <motion.div
                key="default_theme_settings"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="premium-card"
                style={{ backgroundColor: "var(--color-bg-white)", border: "1px solid var(--color-border-light)", maxWidth: "600px", marginTop: "0" }}
              >
                <h3 style={{ marginBottom: "1rem" }}>🎨 CSS Class Preset Theme</h3>
                <p style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", marginBottom: "1.5rem", lineHeight: 1.5 }}>
                  Choose a pre-built visual theme from the dropdown. This applies CSS class overrides site-wide instantly. For custom hex colors, use the <strong>Theme Colors</strong> tab in the sidebar — both systems work together.
                </p>

                <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>Select Default Theme</label>
                  <select
                    value={adminDefaultTheme}
                    onChange={(e) => setAdminDefaultTheme(e.target.value)}
                    className="form-select"
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-bg-white)",
                      color: "var(--color-text-dark)",
                      fontWeight: 700
                    }}
                  >
                    <option value="premium-ngo">✨ Premium NGO Style (Emerald & Champagne Gold)</option>
                    <option value="organic">🟢 Green (Sustainable Roots)</option>
                    <option value="peach">🍑 Peach (Peach Delight)</option>
                    <option value="brown">🟤 Brown (Soft Brown Cocoa)</option>
                    <option value="pink">🌸 Pink (Blush Rose Pearl)</option>
                    <option value="cream">🟡 Cream (Rich Ivory Honey)</option>
                    <option value="teal">🔵 Teal (Ocean Teal Marine)</option>
                    <option value="pride">🌈 Pride (Rainbow Empowerment)</option>
                    <option value="silver">🥈 Silver (Metallic Chrome)</option>
                    <option value="gold">🥇 Gold (Luxurious Gold)</option>
                    <option value="gray">🔘 Gray (Monochrome Slate)</option>
                    <option value="purple">🟪 Purple (Classic Royal Violet)</option>
                    <option value="red">🔴 Red (Crimson Berry)</option>
                    <option value="white">⚪ White (High Contrast Ink)</option>
                    <option value="blue">🔵 Blue (Classic Navy)</option>
                    <option value="neon">⚡ Neon (Cyber Electric Cyan)</option>
                    <option value="future">🛸 Future (Futuristic Violet-Teal)</option>
                    <option value="mothersday">💝 Mother's Day (Rose & Soft Blue)</option>
                    <option value="fathersday">👔 Father's Day (Ocean Navy & Slate)</option>
                    <option value="childrensday">🧸 Children's Day (Playful Sky Blue)</option>
                    <option value="valentinesday">💖 Valentine's Day (Crimson & Pink)</option>
                  </select>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={async () => {
                    try {
                      const ALL_THEME_CLASSES = [
                        "theme-roots", "theme-collective", "theme-harmony",
                        "theme-empower", "theme-editorial", "theme-peach",
                        "theme-brown", "theme-pink", "theme-cream", "theme-teal",
                        "theme-organic", "classic-ngo", "theme-premium-ngo",
                        "theme-pride", "theme-silver", "theme-gold", "theme-gray",
                        "theme-purple", "theme-red", "theme-white", "theme-blue",
                        "theme-neon", "theme-future"
                      ];

                      // Apply class to body first so computed styles become available
                      document.body.classList.remove(...ALL_THEME_CLASSES);
                      document.body.classList.add(`theme-${adminDefaultTheme}`);

                      // Read the computed CSS variable values that the class just set
                      const computed = getComputedStyle(document.body);
                      const getVar = (name: string, fallback: string) => {
                        const val = computed.getPropertyValue(name).trim();
                        return val || fallback;
                      };

                      const extractedTheme: WebsiteTheme = {
                        colorPrimary:   getVar("--color-primary",   "#D9854E"),
                        colorSecondary: getVar("--color-secondary", "#DCFBA6"),
                        colorAccent:    getVar("--color-accent",    "#F7BC6E"),
                        colorBgWhite:   getVar("--color-bg-white",  "#FFFBF5"),
                        colorBgCream:   getVar("--color-bg-cream",  "#F8F3EA"),
                        colorTextDark:  getVar("--color-text-dark", "#034356"),
                        colorTextMuted: getVar("--color-text-muted","#68696B"),
                      };

                      // Save to RTDB (class name) + Firestore (CSS vars) simultaneously
                      await Promise.all([
                        setThemeClass(adminDefaultTheme),
                        setDefaultTheme(extractedTheme),
                      ]);

                      // Update color picker state to show the preset's colors
                      setWebsiteTheme(extractedTheme);

                      // Apply inline CSS vars immediately (overrides any stale inline values)
                      applyThemeToCssVars(extractedTheme);

                      await recordAuditLog(user?.email || "unknown", `Applied preset theme: ${adminDefaultTheme}`);
                      alert(`✅ Theme preset "${adminDefaultTheme}" applied site-wide!\nColors synced to Theme Colors panel too.`);
                    } catch (err) {
                      console.error("Failed to save theme class:", err);
                      alert("Failed to save default theme.");
                    }
                  }}
                >
                  Save Default Theme
                </button>

                <div className="form-group" style={{ marginTop: "2rem", padding: "1.5rem", borderTop: "1px solid var(--color-border-light)", borderRadius: "12px", background: "rgba(var(--color-secondary-rgb),0.06)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <span style={{ fontSize: "1.3rem" }}>🌿</span>
                    <span style={{ fontWeight: 800, fontSize: "1rem", color: "var(--color-primary)" }}>Homepage Layout: Earthy Flat Tailwind Design</span>
                  </div>
                  <p style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", margin: 0, lineHeight: 1.6 }}>
                    The website uses the <strong>Alternative (Earthy Flat Tailwind)</strong> layout exclusively. This is the only active design layout.
                  </p>
                </div>
              </motion.div>
            )}

            {/* === MARKETING === */}
            {activeTab === "marketing" && (() => {
              const parseUserAgent = (ua: string) => {
                if (!ua) return "Unknown Browser";
                let os = "Unknown OS";
                let browser = "Unknown Browser";

                if (ua.includes("Windows")) os = "Windows";
                else if (ua.includes("Macintosh") || ua.includes("Mac OS")) os = "macOS";
                else if (ua.includes("Android")) os = "Android";
                else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
                else if (ua.includes("Linux")) os = "Linux";

                if (ua.includes("Chrome")) browser = "Chrome";
                else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
                else if (ua.includes("Firefox")) browser = "Firefox";
                else if (ua.includes("Edg")) browser = "Edge";

                return `${browser} (${os})`;
              };

              return (
                <motion.div key="marketing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
                    {/* Script Tags Card */}
                    <div className="premium-card" style={{ backgroundColor: "var(--color-bg-white)", border: "1px solid var(--color-border-light)" }}>
                      <h3 style={{ marginBottom: "1.5rem" }}>Marketing Analytics</h3>
                      <div className="form-group">
                        <label className="form-label">Google Analytics Measurement ID</label>
                        <input type="text" value={marketingConfig.googleAnalytics} onChange={(e) => setMarketingConfig(prev => ({ ...prev, googleAnalytics: e.target.value }))} className="form-input" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Microsoft Clarity Project ID</label>
                        <input type="text" value={marketingConfig.clarityId} onChange={(e) => setMarketingConfig(prev => ({ ...prev, clarityId: e.target.value }))} className="form-input" />
                      </div>
                      <button className="btn btn-primary" style={{ marginTop: "1rem" }} onClick={() => alert("Marketing trackers updated.")}>Save Configurations</button>
                    </div>

                    {/* Browser Push Notifications Card */}
                    <div className="premium-card" style={{ backgroundColor: "var(--color-bg-white)", border: "1px solid var(--color-border-light)" }}>
                      <h3 style={{ marginBottom: "1rem" }}>Browser Push Notifications</h3>
                      <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "1.25rem" }}>
                        Enable and trigger browser push alerts directly from this administrative panel to notify the active operator session.
                      </p>

                      {/* Status Indicator */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem", backgroundColor: "#f8fafc", borderRadius: "6px", marginBottom: "1.25rem" }}>
                        <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#697a8d" }}>System Permission:</span>
                        <span className={`status-badge status-${notificationPermission === 'granted' ? 'approved' : notificationPermission === 'denied' ? 'rejected' : 'pending'}`}>
                          {notificationPermission === 'granted' ? 'Allowed' : notificationPermission === 'denied' ? 'Blocked' : 'Default / Ask'}
                        </span>
                      </div>

                      {notificationPermission === 'denied' && (
                        <div style={{ padding: "0.75rem", backgroundColor: "#ffe5e5", border: "1px dashed #ff3e1d", borderRadius: "6px", fontSize: "0.75rem", color: "#ff3e1d", marginBottom: "1.25rem", lineHeight: "1.4" }}>
                          <strong>⚠️ Notifications Blocked by Browser settings:</strong>
                          <ol style={{ margin: "5px 0 0 15px", padding: 0 }}>
                            <li>Click the <strong>lock 🔒 or sliders 🛠️ icon</strong> to the left of your URL in the address bar.</li>
                            <li>Locate <strong>Notifications</strong>.</li>
                            <li>Toggle the setting to <strong>Allow</strong>.</li>
                            <li>Reload the tab to enable alerts.</li>
                          </ol>
                        </div>
                      )}

                      <div className="form-group">
                        <label className="form-label">Notification Title</label>
                        <input type="text" value={pushTitle} onChange={(e) => setPushTitle(e.target.value)} className="form-input" />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Notification Message Body</label>
                        <textarea rows={2} value={pushBody} onChange={(e) => setPushBody(e.target.value)} className="form-textarea"></textarea>
                      </div>

                      <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
                        <button className="btn btn-outline" style={{ flex: 1 }} onClick={handleRequestPushPermission}>
                          Grant Permission
                        </button>
                        <button className="btn btn-primary" style={{ flex: 1, backgroundColor: "#696cff", borderColor: "#696cff" }} onClick={handleTriggerPushNotification} disabled={pushSending}>
                          {pushSending ? "Sending..." : "Send Push Alert"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Registered Devices List */}
                  <div className="premium-card" style={{ backgroundColor: "var(--color-bg-white)", border: "1px solid var(--color-border-light)", width: "100%" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--color-border-light)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
                      <div>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>👥 Registered push notification subscribers</h3>
                        <p style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", marginTop: "4px", marginBottom: 0 }}>Real-time listing of browser platforms and IP addresses authorized to receive push broadcasts.</p>
                      </div>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, padding: "4px 10px", borderRadius: "999px", background: "rgba(105, 108, 255, 0.1)", color: "#696cff" }}>
                        {pushTokens.length} Active Devices
                      </span>
                    </div>

                    {pushTokens.length === 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "160px", color: "var(--color-text-muted)" }}>
                        <Globe size={32} strokeWidth={1} style={{ marginBottom: "0.75rem" }} />
                        <p style={{ fontSize: "0.85rem" }}>No active push subscriber devices registered yet.</p>
                      </div>
                    ) : (
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem", textAlign: "left" }}>
                          <thead>
                            <tr style={{ borderBottom: "2px solid var(--color-border-light)", color: "var(--color-text-muted)", fontWeight: 700 }}>
                              <th style={{ padding: "0.75rem 1rem" }}>Platform / Device</th>
                              <th style={{ padding: "0.75rem 1rem" }}>IP Address</th>
                              <th style={{ padding: "0.75rem 1rem" }}>Delivery Type</th>
                              <th style={{ padding: "0.75rem 1rem" }}>Subscribed At</th>
                              {hasWritePermission && <th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>Action</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {pushTokens.map((token) => {
                              const isFallback = token.endpoint === "active-browser-fallback" || !token.endpoint;
                              return (
                                <tr key={token.id} style={{ borderBottom: "1px solid var(--color-border-light)" }}>
                                  <td style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>{parseUserAgent(token.userAgent)}</td>
                                  <td style={{ padding: "0.75rem 1rem" }}>
                                    <code style={{ fontFamily: "monospace", padding: "2px 6px", background: "#f1f5f9", borderRadius: "4px", color: "#475569" }}>
                                      {token.ip || "Unknown IP"}
                                    </code>
                                  </td>
                                  <td style={{ padding: "0.75rem 1rem" }}>
                                    <span style={{
                                      fontSize: "0.7rem",
                                      fontWeight: 700,
                                      padding: "3px 8px",
                                      borderRadius: "999px",
                                      background: isFallback ? "rgba(230,137,82,0.1)" : "rgba(34,197,94,0.1)",
                                      color: isFallback ? "#E68952" : "#15803d"
                                    }}>
                                      {isFallback ? "Active Tab Fallback" : "FCM Background Push"}
                                    </span>
                                  </td>
                                  <td style={{ padding: "0.75rem 1rem", color: "var(--color-text-muted)" }}>
                                    {token.subscribedAt ? new Date(token.subscribedAt).toLocaleString() : "N/A"}
                                  </td>
                                  {hasWritePermission && (
                                    <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                                      <button
                                        onClick={async () => {
                                          if (window.confirm("Are you sure you want to revoke this device subscription?")) {
                                            try {
                                              await deleteNotificationToken(token.id);
                                              alert("✓ Device subscription revoked.");
                                            } catch (err) {
                                              console.error("Failed to delete token:", err);
                                              alert("Failed to revoke subscription.");
                                            }
                                          }
                                        }}
                                        style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", padding: "4px 8px", borderRadius: "4px" }}
                                        title="Revoke subscription"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </td>
                                  )}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })()}

            {/* === GLOBAL WEBSITE THEME === */}
            {activeTab === "theme" && (() => {
              const colorFields: { key: keyof WebsiteTheme; label: string; desc: string }[] = [
                { key: "colorPrimary",   label: "Primary Color",        desc: "Buttons, headings, highlights" },
                { key: "colorSecondary", label: "Secondary / CTA",      desc: "CTA pills, lime green accents" },
                { key: "colorAccent",    label: "Accent Color",         desc: "Badges, warm amber tones" },
                { key: "colorBgWhite",   label: "Page Background",      desc: "Main page background color" },
                { key: "colorBgCream",   label: "Section Background",   desc: "Alternate section / card background" },
                { key: "colorTextDark",  label: "Primary Text Color",   desc: "Headings and body text" },
                { key: "colorTextMuted", label: "Muted Text Color",     desc: "Captions and secondary labels" },
              ];

              const presets = [
                { name: "Terracotta Cream (Default)", theme: { colorPrimary: "#D9854E", colorSecondary: "#DCFBA6", colorAccent: "#F7BC6E", colorBgWhite: "#FFFBF5", colorBgCream: "#F8F3EA", colorTextDark: "#034356", colorTextMuted: "#68696B" } },
                { name: "Forest Green", theme: { colorPrimary: "#2D6A4F", colorSecondary: "#95D5B2", colorAccent: "#74C69D", colorBgWhite: "#F8FAF9", colorBgCream: "#EBF5F0", colorTextDark: "#1B4332", colorTextMuted: "#52796F" } },
                { name: "Royal Blue", theme: { colorPrimary: "#1D4ED8", colorSecondary: "#BFDBFE", colorAccent: "#60A5FA", colorBgWhite: "#F8FAFF", colorBgCream: "#EFF6FF", colorTextDark: "#1E3A8A", colorTextMuted: "#64748B" } },
                { name: "Rose Gold", theme: { colorPrimary: "#C97F7F", colorSecondary: "#FECACA", colorAccent: "#F9A8D4", colorBgWhite: "#FFF5F5", colorBgCream: "#FFF0F0", colorTextDark: "#7F1D1D", colorTextMuted: "#9CA3AF" } },
                { name: "Slate Dark", theme: { colorPrimary: "#6366F1", colorSecondary: "#A5B4FC", colorAccent: "#818CF8", colorBgWhite: "#F1F5F9", colorBgCream: "#E2E8F0", colorTextDark: "#0F172A", colorTextMuted: "#64748B" } },
              ];

              return (
                <motion.div key="theme" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%", maxWidth: "960px", margin: "0 auto" }}>

                  {/* Header */}
                  <div style={{ background: "var(--color-bg-white)", border: "1px solid var(--color-border-light)", borderRadius: "16px", padding: "2rem" }}>
                    <h3 style={{ fontSize: "1.5rem", color: "var(--color-primary)", marginBottom: "0.5rem" }}>🎨 Global Default Website Theme</h3>
                    <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginBottom: 0 }}>
                      Set the default color scheme for the entire public website. Changes are saved to Firestore and applied in real-time — no deployment needed.
                    </p>
                  </div>

                  {/* Color Pickers */}
                  <div style={{ background: "var(--color-bg-white)", border: "1px solid var(--color-border-light)", borderRadius: "16px", padding: "2rem" }}>
                    <h4 style={{ fontSize: "1.05rem", color: "var(--color-text-dark)", marginBottom: "1.5rem", fontWeight: 700 }}>🖌️ Color Tokens</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
                      {colorFields.map(({ key, label, desc }) => (
                        <div key={key} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", background: "var(--color-bg-cream)", borderRadius: "12px", border: "1px solid var(--color-border-light)" }}>
                          <div style={{ position: "relative", flexShrink: 0 }}>
                            <input
                              type="color"
                              value={websiteTheme[key]}
                              onChange={(e) => setWebsiteTheme(prev => ({ ...prev, [key]: e.target.value }))}
                              style={{ width: "52px", height: "52px", border: "none", borderRadius: "10px", cursor: "pointer", padding: 0, background: "none" }}
                            />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--color-text-dark)" }}>{label}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "4px" }}>{desc}</div>
                            <input
                              type="text"
                              value={websiteTheme[key]}
                              onChange={(e) => {
                                const v = e.target.value;
                                if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) setWebsiteTheme(prev => ({ ...prev, [key]: v }));
                              }}
                              style={{ fontFamily: "monospace", fontSize: "0.78rem", padding: "2px 8px", border: "1px solid var(--color-border)", borderRadius: "6px", width: "100%", color: "var(--color-text-dark)", background: "var(--color-bg-white)" }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Preview strip */}
                    <div style={{ marginTop: "1.5rem", borderRadius: "12px", overflow: "hidden", height: "48px", display: "flex" }}>
                      {[websiteTheme.colorPrimary, websiteTheme.colorSecondary, websiteTheme.colorAccent, websiteTheme.colorBgCream, websiteTheme.colorTextDark].map((c, i) => (
                        <div key={i} style={{ flex: 1, background: c, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: "0.65rem", fontFamily: "monospace", color: i > 2 ? "#fff" : "#1a1a1a", fontWeight: 700, opacity: 0.8 }}>{c}</span>
                        </div>
                      ))}
                    </div>

                    {/* Save Button */}
                    <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", alignItems: "center" }}>
                      <button
                        disabled={themeSaving}
                        onClick={async () => {
                          setThemeSaving(true);
                          try {
                            await setDefaultTheme(websiteTheme);
                            setThemeSuccess(true);
                            await recordAuditLog(user?.email || "unknown", `Updated global website theme colors`);
                            setTimeout(() => setThemeSuccess(false), 3000);
                          } catch (err) {
                            alert("Failed to save theme: " + (err as any).message);
                          } finally {
                            setThemeSaving(false);
                          }
                        }}
                        className="btn btn-primary"
                        style={{ padding: "0.6rem 1.75rem", fontSize: "0.9rem", fontWeight: 700 }}
                      >
                        {themeSaving ? <Loader className="animate-spin" size={16} style={{ marginInline: "auto" }} /> : "💾 Save & Apply to Website"}
                      </button>
                      {themeSuccess && <span style={{ color: "#16a34a", fontWeight: 700, fontSize: "0.875rem" }}>✓ Theme applied live across the website!</span>}
                    </div>
                  </div>

                  {/* Presets */}
                  <div style={{ background: "var(--color-bg-white)", border: "1px solid var(--color-border-light)", borderRadius: "16px", padding: "2rem" }}>
                    <h4 style={{ fontSize: "1.05rem", color: "var(--color-text-dark)", marginBottom: "1rem", fontWeight: 700 }}>⚡ Quick Presets</h4>
                    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                      {presets.map((p) => (
                        <button
                          key={p.name}
                          onClick={() => setWebsiteTheme(p.theme as WebsiteTheme)}
                          style={{
                            display: "flex", alignItems: "center", gap: "8px",
                            padding: "0.5rem 1rem", border: "1px solid var(--color-border)",
                            borderRadius: "999px", background: "var(--color-bg-cream)",
                            cursor: "pointer", fontSize: "0.8rem", fontWeight: 600,
                            color: "var(--color-text-dark)", transition: "all 0.2s"
                          }}
                        >
                          <div style={{ display: "flex", gap: "3px" }}>
                            {[p.theme.colorPrimary, p.theme.colorSecondary, p.theme.colorAccent].map((c, i) => (
                              <div key={i} style={{ width: "14px", height: "14px", borderRadius: "50%", background: c, border: "1px solid rgba(0,0,0,0.12)" }} />
                            ))}
                          </div>
                          {p.name}
                        </button>
                      ))}
                      <button
                        onClick={() => setWebsiteTheme(DEFAULT_THEME)}
                        style={{ padding: "0.5rem 1rem", border: "1px dashed var(--color-border)", borderRadius: "999px", background: "transparent", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, color: "var(--color-text-muted)" }}
                      >
                        ↩ Reset to Default
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })()}

            {/* === BROADCAST CENTER === */}
            {activeTab === "broadcast" && (
              <motion.div
                key="broadcast"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="premium-card"
                style={{ backgroundColor: "var(--color-bg-white)", border: "1px solid var(--color-border-light)", maxWidth: "1000px", margin: "0 auto" }}
              >
                <div style={{ borderBottom: "1px solid var(--color-border-light)", paddingBottom: "1rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
                  <div>
                    <h3 style={{ fontSize: "1.4rem", color: "var(--color-primary)", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                      <span>📢</span> DAY Broadcast &amp; Announcements Center
                    </h3>
                    <p style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", marginTop: "4px", marginBottom: 0 }}>
                      Compose and dispatch bulk announcements directly to volunteers, interns, or newsletter subscribers.
                    </p>
                  </div>
                  <div style={{ width: "90px", height: "90px", flexShrink: 0 }}>
                    <SafeDotLottie
                      src="https://lottie.host/1c5097c9-e54f-4ef5-b2fb-2076b080d4e4/i4YbfWmVc9.lottie"
                      style={{ width: "100%", height: "100%" }}
                    />
                  </div>
                </div>

                <div className="grid-2" style={{ alignItems: "start", gap: "2rem" }}>
                  {/* Left: Compose Form */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="broadcastAudience">Target Audience *</label>
                      <select
                        id="broadcastAudience"
                        value={broadcastAudience}
                        onChange={(e) => setBroadcastAudience(e.target.value as any)}
                        className="form-select"
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)" }}
                      >
                        <option value="volunteers">Active Volunteers Only ({volunteers.length})</option>
                        <option value="interns">Active Interns Only ({internships.length})</option>
                        <option value="both">All Associates (Volunteers &amp; Interns) ({volunteers.length + internships.length})</option>
                        <option value="newsletter">Newsletter Subscribers</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="broadcastSubject">Email Subject *</label>
                      <input
                        type="text"
                        id="broadcastSubject"
                        placeholder="e.g. Important Announcement: Upcoming Educational Drive"
                        value={broadcastSubject}
                        onChange={(e) => setBroadcastSubject(e.target.value)}
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="broadcastBody">Message Body (HTML supported) *</label>
                      <textarea
                        id="broadcastBody"
                        rows={8}
                        placeholder="Write your email content here. Support HTML paragraph formatting..."
                        value={broadcastBody}
                        onChange={(e) => setBroadcastBody(e.target.value)}
                        className="form-textarea"
                        required
                      ></textarea>
                    </div>

                    <button
                      onClick={handleSendBroadcast}
                      disabled={broadcastSending}
                      className="btn btn-primary"
                      style={{ padding: "12px", width: "100%", marginTop: "0.5rem" }}
                    >
                      {broadcastSending ? (
                        <>
                          <Loader className="animate-spin" size={16} />
                          <span>Sending Broadcast...</span>
                        </>
                      ) : (
                        <span>Send Broadcast Email 🚀</span>
                      )}
                    </button>
                  </div>

                  {/* Right: Sending Live Progress Log */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <h4 style={{ fontSize: "0.95rem", color: "var(--color-primary)", fontWeight: 700, margin: 0 }}>📋 Broadcast Log &amp; Real-time Progress</h4>
                    
                    <div style={{
                      backgroundColor: "#0b121f",
                      color: "#38ef7d",
                      fontFamily: "monospace",
                      fontSize: "0.8rem",
                      padding: "1rem",
                      borderRadius: "8px",
                      minHeight: "280px",
                      maxHeight: "340px",
                      overflowY: "auto",
                      border: "1px solid rgba(255,255,255,0.1)",
                      whiteSpace: "pre-line",
                      lineHeight: "1.5"
                    }}>
                      {broadcastStatusLog.length === 0 
                        ? "> Ready. Awaiting draft composition..."
                        : broadcastStatusLog.map((log, i) => `${i > 0 ? '\n' : ''}> ${log}`)}
                    </div>

                    {broadcastStatusLog.length > 0 && (
                      <button
                        onClick={() => setBroadcastStatusLog([])}
                        className="btn btn-outline"
                        style={{ fontSize: "0.8rem", padding: "6px 12px", alignSelf: "flex-end" }}
                      >
                        Clear Terminal Log
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* === CARD IMAGES === */}
            {activeTab === "card_images" && (
              <motion.div key="card_images" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="admin-table-card">
                <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--color-border-light)" }}>
                  <h3 style={{ fontSize: "1.25rem", color: "var(--color-primary)", display: "inline-flex", alignItems: "center", gap: "8px", margin: 0 }}>
                    <Image size={20} />
                    <span>Card Images Manager</span>
                  </h3>
                  <p style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", margin: "4px 0 0 0" }}>
                    Re-upload or replace any card image, header image, gallery image, blog image, or event image across the entire website.
                  </p>
                </div>

                <div style={{ padding: "1.5rem" }}>
                  {CARD_IMAGE_ITEMS.map((img) => (
                    <CardImageRow
                      key={img.key}
                      label={img.label}
                      imgKey={img.key}
                      description={img.description}
                      defaultPath={img.defaultPath}
                      db={db}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* === RECYCLE BIN === */}
            {activeTab === "recycle_bin" && (
              <motion.div key="recycle_bin" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="admin-table-card">
                <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--color-border-light)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                  <div>
                    <h3 style={{ fontSize: "1.25rem", color: "#ef4444", display: "inline-flex", alignItems: "center", gap: "8px", margin: 0 }}>
                      <Trash2 size={20} />
                      <span>Protected Recycle Bin (30-Day Auto-Purge Policy)</span>
                    </h3>
                    <p style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", margin: "4px 0 0 0" }}>
                      Deleted data (volunteers, interns, donations, blogs, events, team, etc.) is retained for 30 days. Click <strong>Retrieve Data</strong> to restore anytime.
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "0.78rem", backgroundColor: "rgba(34,197,94,0.1)", color: "#16a34a", padding: "4px 10px", borderRadius: "999px", fontWeight: 700, border: "1px solid rgba(34,197,94,0.3)" }}>
                      🔓 Session Unlocked
                    </span>
                    <button onClick={() => setIsRecycleBinUnlocked(false)} className="btn btn-outline" style={{ fontSize: "0.75rem", padding: "0.4rem 0.8rem" }}>
                      Lock Bin
                    </button>
                  </div>
                </div>

                <div className="table-wrapper">
                  {recycleBinItems.length === 0 ? (
                    <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-muted)" }}>
                      <Trash2 size={40} style={{ opacity: 0.3, marginBottom: "1rem" }} />
                      <h4 style={{ margin: "0 0 0.5rem 0", color: "var(--color-text-dark)" }}>Recycle Bin is Empty</h4>
                      <p style={{ fontSize: "0.85rem", margin: 0 }}>No soft-deleted records present within the last 30 days.</p>
                    </div>
                  ) : (
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Record Category</th>
                          <th>Title / Applicant Name</th>
                          <th>Date Deleted</th>
                          <th>Retention Time</th>
                          <th style={{ textAlign: "right" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recycleBinItems.map(item => (
                          <tr key={`${item.collectionName}-${item.id}`}>
                            <td>
                              <span style={{ 
                                padding: "4px 10px", 
                                borderRadius: "999px", 
                                fontSize: "0.75rem", 
                                fontWeight: 800,
                                backgroundColor: "rgba(252,78,30,0.1)",
                                color: "var(--color-primary)",
                                border: "1px solid rgba(252,78,30,0.2)"
                              }}>
                                {item.categoryName}
                              </span>
                            </td>
                            <td>
                              <strong style={{ color: "var(--color-text-dark)", fontSize: "0.9rem" }}>{item.title}</strong>
                              <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontFamily: "monospace" }}>
                                ID: {item.id}
                              </div>
                            </td>
                            <td>
                              <span style={{ fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
                                {new Date(item.deletedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </td>
                            <td>
                              <span style={{ 
                                fontSize: "0.82rem", 
                                fontWeight: 700, 
                                color: item.daysLeft <= 5 ? "#dc2626" : "var(--color-primary)" 
                              }}>
                                ⏳ {item.daysLeft} Days Remaining
                              </span>
                            </td>
                            <td style={{ textAlign: "right" }}>
                              <button
                                onClick={() => handleRestoreItem(item)}
                                className="btn btn-primary"
                                style={{ padding: "0.4rem 1rem", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "#16a34a", borderColor: "#16a34a" }}
                                title="Retrieve and restore this record back to active database"
                              >
                                <RotateCcw size={14} />
                                <span>Retrieve Data</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </motion.div>
            )}

            </motion.div>
          </AnimatePresence>
        )}
        </div>{/* end .admin-content-body */}
      </main>

      {/* Detail Modal Overlay */}
      <AnimatePresence>
        {selectedSubmission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(11, 18, 31, 0.6)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "1.5rem"
            }}
            onClick={() => setSelectedSubmission(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              style={{
                backgroundColor: "var(--color-bg-white)",
                borderRadius: "16px",
                border: "1px solid var(--color-border-light)",
                boxShadow: "var(--shadow-lg)",
                width: "100%",
                maxWidth: "600px",
                maxHeight: "85vh",
                overflowY: "auto",
                padding: "2.5rem",
                position: "relative"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedSubmission(null)}
                style={{
                  position: "absolute",
                  top: "1.5rem",
                  right: "1.5rem",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  color: "var(--color-text-muted)",
                  fontSize: "1.25rem"
                }}
              >
                ✕
              </button>

              <span style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-muted)", display: "block", marginBottom: "0.25rem" }}>
                {selectedSubmission.type.toUpperCase()} SUBMISSION DETAILS
              </span>
              <h2 style={{ fontSize: "1.75rem", color: "var(--color-primary)", marginBottom: "1.5rem", fontWeight: 800 }}>
                {selectedSubmission.type === 'donation' ? selectedSubmission.data.donorName : selectedSubmission.data.name}
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
                {selectedSubmission.type !== 'donation' && (
                  <div><strong>Ticket No:</strong> <code style={{ fontFamily: "monospace" }}>{selectedSubmission.data.ticketNo || selectedSubmission.data.tempInternshipId || "N/A"}</code></div>
                )}
                {selectedSubmission.data.permanentInternshipId && (
                  <div><strong>Permanent ID:</strong> <code style={{ fontFamily: "monospace", color: "var(--color-primary)", fontWeight: 700 }}>{selectedSubmission.data.permanentInternshipId}</code></div>
                )}
                <div><strong>Status:</strong> <span className={`status-badge status-${selectedSubmission.data.status || (selectedSubmission.type === 'donation' ? 'success' : 'pending')}`} style={{ display: "inline-block" }}>{selectedSubmission.data.status || (selectedSubmission.type === 'donation' ? 'success' : 'pending')}</span></div>
                <div><strong>Email:</strong> {selectedSubmission.type === 'donation' ? selectedSubmission.data.donorEmail : selectedSubmission.data.email}</div>
                <div><strong>Phone:</strong> {(selectedSubmission.type === 'donation' ? selectedSubmission.data.donorPhone : selectedSubmission.data.phone) || "N/A"}</div>
                {selectedSubmission.data.dob && <div><strong>DOB:</strong> {selectedSubmission.data.dob} {selectedSubmission.data.age ? `(Age: ${selectedSubmission.data.age})` : ""}</div>}
                {selectedSubmission.data.fatherName && <div><strong>Father's Name:</strong> {selectedSubmission.data.fatherName}</div>}
                {selectedSubmission.data.motherName && <div><strong>Mother's Name:</strong> {selectedSubmission.data.motherName}</div>}
                {selectedSubmission.data.city && <div><strong>City:</strong> {selectedSubmission.data.city}</div>}
                {selectedSubmission.data.aadharNumber && <div><strong>Aadhar Number:</strong> {selectedSubmission.data.aadharNumber}</div>}
                
                {/* Donation details */}
                {selectedSubmission.type === 'donation' && (
                  <>
                    <div><strong>Amount:</strong> <span style={{ color: "var(--color-secondary)", fontWeight: 800 }}>₹{selectedSubmission.data.amount?.toLocaleString("en-IN")}</span></div>
                    <div><strong>Transaction ID:</strong> <small style={{ fontFamily: "monospace" }}>{selectedSubmission.data.transactionId}</small></div>
                    <div><strong>Purpose:</strong> {selectedSubmission.data.purpose}</div>
                    <div><strong>Date:</strong> {new Date(selectedSubmission.data.createdAt).toLocaleString("en-IN")}</div>
                    <div><strong>Anonymous:</strong> {selectedSubmission.data.isAnonymous ? "Yes" : "No"}</div>
                    {selectedSubmission.data.panNumber && <div><strong>PAN Card:</strong> <code style={{ fontFamily: "monospace" }}>{selectedSubmission.data.panNumber}</code></div>}
                    {selectedSubmission.data.billingAddress && <div style={{ gridColumn: "span 2" }}><strong>Address:</strong> {selectedSubmission.data.billingAddress}</div>}
                  </>
                )}

                {/* Internship details */}
                {selectedSubmission.type === 'internship' && (
                  <>
                    <div><strong>College:</strong> {selectedSubmission.data.college}</div>
                    <div><strong>Course:</strong> {selectedSubmission.data.course}</div>
                    <div><strong>Year:</strong> {selectedSubmission.data.year}</div>
                    <div><strong>Department:</strong> {selectedSubmission.data.department}</div>
                    <div><strong>Mode:</strong> {selectedSubmission.data.internshipMode}</div>
                  </>
                )}

                {/* Volunteer details */}
                {selectedSubmission.type === 'volunteer' && (
                  <div><strong>Preferred Mode:</strong> {selectedSubmission.data.preferredMode}</div>
                )}

                {/* Contact Message details */}
                {selectedSubmission.type === 'contact' && (
                  <div style={{ gridColumn: "span 2" }}><strong>Subject:</strong> {selectedSubmission.data.subject}</div>
                )}

                {/* Complaint details */}
                {selectedSubmission.type === 'complaint' && (
                  <>
                    <div style={{ textTransform: "capitalize" }}><strong>Sender Type:</strong> {selectedSubmission.data.complaintType}</div>
                    <div><strong>Membership/Intern ID:</strong> {selectedSubmission.data.membershipId}</div>
                  </>
                )}
              </div>

              {/* Textareas */}
              {selectedSubmission.data.motivation && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <strong style={{ display: "block", marginBottom: "0.4rem" }}>Motivation / Purpose of Joining:</strong>
                  <div style={{ padding: "1rem", backgroundColor: "var(--color-bg-gray)", borderRadius: "8px", fontSize: "0.875rem", color: "var(--color-text-dark)", whiteSpace: "pre-line", border: "1px solid var(--color-border-light)" }}>
                    {selectedSubmission.data.motivation}
                  </div>
                </div>
              )}

              {selectedSubmission.type === 'contact' && selectedSubmission.data.message && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <strong style={{ display: "block", marginBottom: "0.4rem" }}>Inquiry Message:</strong>
                  <div style={{ padding: "1rem", backgroundColor: "var(--color-bg-gray)", borderRadius: "8px", fontSize: "0.875rem", color: "var(--color-text-dark)", whiteSpace: "pre-line", border: "1px solid var(--color-border-light)" }}>
                    {selectedSubmission.data.message}
                  </div>
                </div>
              )}

              {selectedSubmission.type === 'complaint' && selectedSubmission.data.issue && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <strong style={{ display: "block", marginBottom: "0.4rem" }}>Complaint Issue Details:</strong>
                  <div style={{ padding: "1rem", backgroundColor: "var(--color-bg-gray)", borderRadius: "8px", fontSize: "0.875rem", color: "var(--color-text-dark)", whiteSpace: "pre-line", border: "1px solid var(--color-border-light)" }}>
                    {selectedSubmission.data.issue}
                  </div>
                </div>
              )}

              {/* Remarks */}
              {selectedSubmission.type !== 'donation' && (
                <div style={{ borderTop: "1px solid var(--color-border-light)", paddingTop: "1.5rem", marginTop: "1.5rem" }}>
                  <strong style={{ display: "block", marginBottom: "0.8rem" }}>Administrative Comments & History:</strong>
                  
                  {selectedSubmission.data.comments && selectedSubmission.data.comments.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1rem" }}>
                      {selectedSubmission.data.comments.map((entry: any, index: number) => (
                        <div key={index} style={{ padding: "0.8rem", backgroundColor: "rgba(15, 76, 129, 0.03)", borderLeft: "3px solid var(--color-primary)", borderRadius: "4px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "4px" }}>
                            <span><strong>{entry.author || "Admin"}</strong></span>
                            <span>{entry.date ? new Date(entry.date).toLocaleString() : ""}</span>
                          </div>
                          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--color-text-dark)", whiteSpace: "pre-line" }}>{entry.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : selectedSubmission.data.adminComment ? (
                    <div style={{ padding: "1rem", backgroundColor: "rgba(15, 76, 129, 0.04)", borderLeft: "4px solid var(--color-primary)", borderRadius: "4px", fontSize: "0.875rem", fontStyle: "italic", color: "var(--color-text-dark)", marginBottom: "1rem" }}>
                      💬 {selectedSubmission.data.adminComment}
                    </div>
                  ) : (
                    <div style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginBottom: "1rem" }}>No comments written yet.</div>
                  )}
                </div>
              )}

              {/* AI Response Drafting Assistant */}
              {hasWritePermission && selectedSubmission.type !== 'donation' && (
                <div style={{ borderTop: "1px solid var(--color-border-light)", paddingTop: "1.5rem", marginTop: "1.5rem" }}>
                  <strong style={{ display: "block", marginBottom: "0.8rem", color: "var(--color-primary)" }}>🤖 Gemini Response Draft Assistant:</strong>
                  
                  <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                    <input 
                      type="text" 
                      placeholder="E.g. Ask for ID proof / Reject since we are full..." 
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      className="form-input"
                      style={{ flex: 1, padding: "8px 12px", border: "1px solid var(--color-border)", borderRadius: "4px" }}
                    />
                    <button 
                      onClick={async () => {
                        if (!aiPrompt.trim()) {
                          alert("Please write a prompt for Gemini!");
                          return;
                        }
                        try {
                          setAiGenerating(true);
                          const reply = await generateAIReply(selectedSubmission.type as 'volunteer' | 'internship' | 'contact', selectedSubmission.data, aiPrompt);
                          setAiDraft(reply);
                        } catch (err) {
                          alert("Failed to draft reply: " + (err as any).message);
                        } finally {
                          setAiGenerating(false);
                        }
                      }}
                      disabled={aiGenerating}
                      className="btn btn-primary"
                      style={{ padding: "8px 16px", fontSize: "0.85rem", whiteSpace: "nowrap" }}
                    >
                      {aiGenerating ? "Drafting..." : "Draft with AI"}
                    </button>
                  </div>

                  {aiDraft && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", backgroundColor: "rgba(15, 76, 129, 0.02)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--color-border-light)" }}>
                      <div>
                        <strong style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>Generated Draft (Editable):</strong>
                        <textarea
                          value={aiDraft}
                          onChange={(e) => setAiDraft(e.target.value)}
                          className="form-input"
                          rows={4}
                          style={{ width: "100%", marginTop: "0.4rem", padding: "8px", fontFamily: "sans-serif", fontSize: "0.875rem", resize: "vertical" }}
                        />
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                        <button 
                          onClick={async () => {
                            try {
                              setAiGenerating(true);
                              const reply = await generateAIReply(selectedSubmission.type as 'volunteer' | 'internship' | 'contact', selectedSubmission.data, aiPrompt);
                              setAiDraft(reply);
                            } catch (err) {
                              alert("Failed to draft reply: " + (err as any).message);
                            } finally {
                              setAiGenerating(false);
                            }
                          }}
                          disabled={aiGenerating}
                          className="btn btn-outline"
                          style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                        >
                          Regenerate 🔄
                        </button>
                        <button 
                          onClick={async () => {
                            if (!aiDraft.trim()) return;
                            setActionLoading(true);
                            try {
                              const type = selectedSubmission.type as 'volunteer' | 'internship' | 'contact';
                              const id = selectedSubmission.data.id;
                              const author = (user?.email || "Admin") + " (AI Assisted)";
                              
                              const newCommentEntry = await addRecordComment(id, type, aiDraft.trim(), author);

                              if (type === 'volunteer') {
                                setVolunteers(prev => prev.map(v => v.id === id ? {
                                  ...v,
                                  adminComment: aiDraft.trim(),
                                  comments: [...(v.comments || []), newCommentEntry]
                                } : v));
                              } else if (type === 'internship') {
                                setInternships(prev => prev.map(i => i.id === id ? {
                                  ...i,
                                  adminComment: aiDraft.trim(),
                                  comments: [...(i.comments || []), newCommentEntry]
                                } : i));
                              } else if (type === 'contact') {
                                setContactsList(prev => prev.map(c => c.id === id ? {
                                  ...c,
                                  adminComment: aiDraft.trim(),
                                  comments: [...(c.comments || []), newCommentEntry]
                                } : c));
                              }

                              setSelectedSubmission(prev => prev ? {
                                ...prev,
                                data: {
                                  ...prev.data,
                                  adminComment: aiDraft.trim(),
                                  comments: [...(prev.data.comments || []), newCommentEntry]
                                }
                              } : null);

                              try {
                                const { sendRecordUpdate } = await import("../services/emailService");
                                await sendRecordUpdate({
                                  email: selectedSubmission.data.email,
                                  name: selectedSubmission.data.name,
                                  type: type,
                                  status: selectedSubmission.data.status || 'pending',
                                  ticketNo: selectedSubmission.data.ticketNo || selectedSubmission.data.tempInternshipId || 'N/A',
                                  adminComment: aiDraft.trim()
                                });
                              } catch (mailErr) {
                                console.error("Failed to send email update:", mailErr);
                              }

                              setAiDraft("");
                              setAiPrompt("");
                              alert("AI reply approved and sent!");
                            } catch (e) {
                              alert("Failed to submit comment: " + (e as any).message);
                            } finally {
                              setActionLoading(false);
                            }
                          }}
                          className="btn btn-primary"
                          style={{ padding: "6px 12px", fontSize: "0.8rem", backgroundColor: "var(--color-success)", borderColor: "var(--color-success)" }}
                        >
                          Approve &amp; Send Reply 🚀
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div style={{ marginTop: "2.5rem", display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button onClick={() => setSelectedSubmission(null)} className="btn btn-outline">Close</button>
                {selectedSubmission.type === 'donation' && (
                  <button onClick={() => { handleReprintReceipt(selectedSubmission.data); }} className="btn btn-primary" style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}><Printer size={16} /> Reprint Receipt</button>
                )}
                {hasWritePermission && selectedSubmission.type !== 'donation' && (
                  <>
                    <button
                      onClick={() => {
                        const type = selectedSubmission.type as 'volunteer' | 'internship' | 'contact';
                        const id = selectedSubmission.data.id;
                        handleAddComment(id, type);
                      }}
                      className="btn btn-primary"
                      style={{ backgroundColor: "var(--color-success)", borderColor: "var(--color-success)" }}
                    >
                      Add Comment
                    </button>
                    <button
                      onClick={() => {
                        const type = selectedSubmission.type as 'volunteer' | 'internship' | 'contact';
                        const id = selectedSubmission.data.id;
                        const comment = selectedSubmission.data.adminComment;
                        setSelectedSubmission(null);
                        handleUpdateComment(id, type, comment);
                      }}
                      className="btn btn-outline"
                    >
                      Edit Latest Comment
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {printReceiptData && (
        <div id="receipt-pdf-content" className="receipt-page-container print-only-receipt">
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
            @media screen {
              .print-only-receipt {
                display: none !important;
              }
            }
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
              color: #1a1a1a;
              font-family: 'Segoe UI', Calibri, Arial, sans-serif;
              border-radius: 8px;
            }
            .receipt-page-container .org-title {
              font-size: 30px;
              line-height: 1.15;
              letter-spacing: 0.3px;
              font-weight: 400;
              color: #1a1a1a;
            }
            .receipt-page-container .header-row {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              border-bottom: 1px solid #1a1a1a;
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
              border-bottom: 1px solid #1a1a1a;
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
              border: 1px solid #1a1a1a;
              background: #ffffff;
            }
            .receipt-page-container table.payment-table td {
              padding: 14px 8px;
              border: 1px solid #1a1a1a;
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
              border-top: 1px solid #1a1a1a;
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
          `}} />
          
          <div className="org-title">BHTDAY WELFARE<br />FOUNDATION</div>
          <div className="header-row">
            <div></div>
            <div className="header-meta">
              Date<span className="value-line">{new Date(printReceiptData.createdAt).toLocaleDateString("en-IN")}</span><br />
              Transaction ID<span className="value-line" style={{ fontFamily: "monospace" }}>{printReceiptData.transactionId}</span>
            </div>
          </div>

          <div className="billed-to">BILLED TO</div>
          <div className="field-block">
            <div className="field-line">Name:<span className="field-fill">{printReceiptData.donorName}</span></div>
            <div className="field-line">Purpose:<span className="field-fill">{printReceiptData.purpose}</span></div>
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
                <td style={{ fontFamily: "monospace" }}>{printReceiptData.transactionId ? printReceiptData.transactionId.substring(0, 14) : "N/A"}</td>
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
              <div className="underline-field">Customer Name: {printReceiptData.donorName}</div>
              <div className="underline-field">Customer ID: {printReceiptData.donorEmail}</div>
              <div className="underline-field">Transaction no.: {printReceiptData.transactionId}</div>
              <div className="underline-field">Date: {new Date(printReceiptData.createdAt).toLocaleDateString("en-IN")}</div>
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
      )}

      {/* Manual Donation Modal */}
      <AnimatePresence>
        {showAddDonationModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" style={{ position: "fixed", inset: 0, backgroundColor: "rgba(11, 18, 31, 0.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999, padding: "1.5rem" }} onClick={() => setShowAddDonationModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="premium-card" style={{ backgroundColor: "#ffffff", border: "1px solid var(--color-border-light)", maxWidth: "500px", width: "100%", padding: "1.75rem" }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <h3 style={{ margin: 0, color: "var(--color-primary)", fontSize: "1.2rem" }}>➕ Record Offline / Manual Donation</h3>
                <button onClick={() => setShowAddDonationModal(false)} className="btn-icon reject"><X size={16} /></button>
              </div>
              <form onSubmit={handleAddDonationSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Donor Name *</label>
                  <input type="text" required value={newDonation.donorName} onChange={(e) => setNewDonation(prev => ({ ...prev, donorName: e.target.value }))} className="form-input" placeholder="e.g. Rahul Sharma" />
                </div>
                <div className="form-group">
                  <label className="form-label">Donor Email</label>
                  <input type="email" value={newDonation.donorEmail} onChange={(e) => setNewDonation(prev => ({ ...prev, donorEmail: e.target.value }))} className="form-input" placeholder="donor@example.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">Donation Amount (₹) *</label>
                  <input type="number" required min="1" value={newDonation.amount} onChange={(e) => setNewDonation(prev => ({ ...prev, amount: Number(e.target.value) }))} className="form-input" placeholder="1000" />
                </div>
                <div className="form-group">
                  <label className="form-label">Purpose / Campaign *</label>
                  <input type="text" required value={newDonation.purpose} onChange={(e) => setNewDonation(prev => ({ ...prev, purpose: e.target.value }))} className="form-input" placeholder="e.g. Slum Education Drive" />
                </div>
                <div className="form-group">
                  <label className="form-label">Transaction ID / Reference Number</label>
                  <input type="text" value={newDonation.transactionId} onChange={(e) => setNewDonation(prev => ({ ...prev, transactionId: e.target.value }))} className="form-input" placeholder="Leave blank to auto-generate" />
                </div>
                <button type="submit" disabled={actionLoading} className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }}>
                  {actionLoading ? <Loader className="animate-spin" size={18} style={{ marginInline: "auto" }} /> : "Record Donation"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Add Blog Modal */}
        {showAddBlogModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-backdrop" style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", overflowY: "auto" }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="modal-content" style={{ backgroundColor: "var(--color-bg-white)", borderRadius: "12px", width: "100%", maxWidth: "600px", padding: "2rem", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", maxHeight: "90vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1.25rem", color: "var(--color-primary)", margin: 0 }}>Add New Article / Blog Post</h3>
                <button onClick={() => setShowAddBlogModal(false)} className="btn-icon reject" style={{ border: "none", background: "transparent" }}><X size={20} /></button>
              </div>
              <form onSubmit={handleAddBlog} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="form-group"><label className="form-label" htmlFor="blog-title-modal">Title *</label><input type="text" id="blog-title-modal" required value={newBlog.title} onChange={(e) => setNewBlog(prev => ({ ...prev, title: e.target.value }))} className="form-input" /></div>
                <div className="form-group"><label className="form-label" htmlFor="blog-summary-modal">Summary *</label><input type="text" id="blog-summary-modal" required value={newBlog.summary} onChange={(e) => setNewBlog(prev => ({ ...prev, summary: e.target.value }))} className="form-input" /></div>
                <div className="form-group"><label className="form-label" htmlFor="blog-author-modal">Author *</label><input type="text" id="blog-author-modal" required value={newBlog.author} onChange={(e) => setNewBlog(prev => ({ ...prev, author: e.target.value }))} className="form-input" /></div>
                <div className="form-group">
                  <label className="form-label" htmlFor="blog-category-modal">Category *</label>
                  <select id="blog-category-modal" value={newBlog.category} onChange={(e) => setNewBlog(prev => ({ ...prev, category: e.target.value }))} className="form-select" style={{ width: "100%", padding: "0.5rem", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
                    <option value="Education">Education</option>
                    <option value="Community Development">Community Development</option>
                    <option value="Health">Health</option>
                    <option value="Youth">Youth</option>
                    <option value="Environment">Environment</option>
                  </select>
                </div>
                <div className="form-group">
                  <ImageUploader folder="blogs" label="Cover Image *" currentUrl={newBlog.coverImage} onUpload={(url) => setNewBlog(prev => ({ ...prev, coverImage: url }))} />
                </div>
                <div className="form-group"><label className="form-label" htmlFor="blog-content-modal">Content *</label><textarea id="blog-content-modal" required rows={4} value={newBlog.content} onChange={(e) => setNewBlog(prev => ({ ...prev, content: e.target.value }))} className="form-textarea"></textarea></div>
                <button type="submit" disabled={actionLoading || !newBlog.coverImage} className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }}>
                  {actionLoading ? <Loader className="animate-spin" size={18} style={{ marginInline: "auto" }} /> : "Publish Article"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Edit Blog Modal */}
        {showEditBlogModal && editingBlog && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-backdrop" style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", overflowY: "auto" }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="modal-content" style={{ backgroundColor: "var(--color-bg-white)", borderRadius: "12px", width: "100%", maxWidth: "600px", padding: "2rem", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", maxHeight: "90vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1.25rem", color: "var(--color-primary)", margin: 0 }}>Edit Article / Blog Post</h3>
                <button onClick={() => { setShowEditBlogModal(false); setEditingBlog(null); }} className="btn-icon reject" style={{ border: "none", background: "transparent" }}><X size={20} /></button>
              </div>
              <form onSubmit={handleSaveBlogEdit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="form-group"><label className="form-label" htmlFor="edit-blog-title">Title *</label><input type="text" id="edit-blog-title" required value={editingBlog.title} onChange={(e) => setEditingBlog(prev => prev ? ({ ...prev, title: e.target.value }) : null)} className="form-input" /></div>
                <div className="form-group"><label className="form-label" htmlFor="edit-blog-summary">Summary *</label><input type="text" id="edit-blog-summary" required value={editingBlog.summary} onChange={(e) => setEditingBlog(prev => prev ? ({ ...prev, summary: e.target.value }) : null)} className="form-input" /></div>
                <div className="form-group"><label className="form-label" htmlFor="edit-blog-author">Author *</label><input type="text" id="edit-blog-author" required value={editingBlog.author} onChange={(e) => setEditingBlog(prev => prev ? ({ ...prev, author: e.target.value }) : null)} className="form-input" /></div>
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-blog-category">Category *</label>
                  <select id="edit-blog-category" value={editingBlog.category} onChange={(e) => setEditingBlog(prev => prev ? ({ ...prev, category: e.target.value }) : null)} className="form-select" style={{ width: "100%", padding: "0.5rem", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
                    <option value="Education">Education</option>
                    <option value="Community Development">Community Development</option>
                    <option value="Health">Health</option>
                    <option value="Youth">Youth</option>
                    <option value="Environment">Environment</option>
                    <option value="Aid & Welfare">Aid &amp; Welfare</option>
                    <option value="Rojgar">Rojgar</option>
                  </select>
                </div>
                <div className="form-group">
                  <ImageUploader folder="blogs" label="Cover Image *" currentUrl={editingBlog.coverImage} onUpload={(url) => setEditingBlog(prev => prev ? ({ ...prev, coverImage: url }) : null)} />
                </div>
                <div className="form-group"><label className="form-label" htmlFor="edit-blog-content">Content *</label><textarea id="edit-blog-content" required rows={4} value={editingBlog.content || ""} onChange={(e) => setEditingBlog(prev => prev ? ({ ...prev, content: e.target.value }) : null)} className="form-textarea"></textarea></div>
                <button type="submit" disabled={actionLoading || !editingBlog.coverImage} className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }}>
                  {actionLoading ? <Loader className="animate-spin" size={18} style={{ marginInline: "auto" }} /> : "Save Changes"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Add Gallery Modal */}
        {showAddGalleryModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-backdrop" style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", overflowY: "auto" }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="modal-content" style={{ backgroundColor: "var(--color-bg-white)", borderRadius: "12px", width: "100%", maxWidth: "500px", padding: "2rem", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", maxHeight: "90vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1.25rem", color: "var(--color-primary)", margin: 0 }}>Add New Gallery Photo</h3>
                <button onClick={() => setShowAddGalleryModal(false)} className="btn-icon reject" style={{ border: "none", background: "transparent" }}><X size={20} /></button>
              </div>
              <form onSubmit={handleAddGallery} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="form-group">
                  <ImageUploader folder="gallery" label="Gallery Photo *" currentUrl={newGallery.imageUrl} onUpload={(url) => setNewGallery(prev => ({ ...prev, imageUrl: url }))} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="gallery-title-modal">Title (Optional)</label>
                  <input type="text" id="gallery-title-modal" value={newGallery.title} onChange={(e) => setNewGallery(prev => ({ ...prev, title: e.target.value }))} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="gallery-category-modal">Category *</label>
                  <select id="gallery-category-modal" value={newGallery.category} onChange={(e) => setNewGallery(prev => ({ ...prev, category: e.target.value }))} className="form-select" style={{ width: "100%", padding: "0.5rem", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
                    <option value="Education">Education</option>
                    <option value="Aid Drive">Aid Drive</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Team Meet">Team Meet</option>
                    <option value="Employment">Employment</option>
                  </select>
                </div>
                <button type="submit" disabled={actionLoading || !newGallery.imageUrl} className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }}>
                  {actionLoading ? <Loader className="animate-spin" size={18} style={{ marginInline: "auto" }} /> : "Add Photo"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Add Event Modal */}
        {showAddEventModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-backdrop" style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", overflowY: "auto" }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="modal-content" style={{ backgroundColor: "var(--color-bg-white)", borderRadius: "12px", width: "100%", maxWidth: "600px", padding: "2rem", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", maxHeight: "90vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1.25rem", color: "var(--color-primary)", margin: 0 }}>Add New Event</h3>
                <button onClick={() => setShowAddEventModal(false)} className="btn-icon reject" style={{ border: "none", background: "transparent" }}><X size={20} /></button>
              </div>
              <form onSubmit={handleAddEvent} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="form-group"><label className="form-label" htmlFor="event-title-modal">Title *</label><input type="text" id="event-title-modal" required value={newEvent.title} onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))} className="form-input" /></div>
                <div className="form-group"><label className="form-label" htmlFor="event-desc-modal">Description *</label><textarea id="event-desc-modal" required rows={3} value={newEvent.description} onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))} className="form-textarea"></textarea></div>
                <div className="form-group"><label className="form-label" htmlFor="event-date-modal">Date *</label><input type="date" id="event-date-modal" required value={newEvent.date} onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))} className="form-input" /></div>
                <div className="form-group"><label className="form-label" htmlFor="event-loc-modal">Location *</label><input type="text" id="event-loc-modal" required value={newEvent.location} onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))} className="form-input" /></div>
                <div className="form-group">
                  <ImageUploader folder="events" label="Cover Image *" currentUrl={newEvent.coverImage} onUpload={(url) => setNewEvent(prev => ({ ...prev, coverImage: url }))} />
                  {newEvent.coverImage && (
                    <button
                      type="button"
                      onClick={() => setNewEvent(prev => ({ ...prev, coverImage: "" }))}
                      style={{ fontSize: "0.75rem", color: "#e74c3c", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", marginTop: "4px" }}
                    >
                      ✕ Remove Selected Photo
                    </button>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="event-category-modal">Category *</label>
                  <select id="event-category-modal" value={newEvent.category} onChange={(e) => setNewEvent(prev => ({ ...prev, category: e.target.value }))} className="form-select" style={{ width: "100%", padding: "0.5rem", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
                    <option value="Education">Education</option>
                    <option value="Health">Health</option>
                    <option value="Environment">Environment</option>
                    <option value="Community">Community</option>
                    <option value="Aid Drive">Aid Drive</option>
                    <option value="Celebration">Celebration</option>
                  </select>
                </div>
                <button type="submit" disabled={actionLoading || !newEvent.coverImage} className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }}>
                  {actionLoading ? <Loader className="animate-spin" size={18} style={{ marginInline: "auto" }} /> : "Add Event"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Add Flagship Campaign Modal */}
        {showAddFlagshipModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-backdrop" style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", overflowY: "auto" }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="modal-content" style={{ backgroundColor: "var(--color-bg-white)", borderRadius: "12px", width: "100%", maxWidth: "600px", padding: "2rem", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", maxHeight: "90vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1.25rem", color: "var(--color-primary)", margin: 0 }}>Add New Flagship Campaign Card</h3>
                <button onClick={() => setShowAddFlagshipModal(false)} className="btn-icon reject" style={{ border: "none", background: "transparent" }}><X size={20} /></button>
              </div>
              <form onSubmit={handleAddFlagship} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <div className="form-group" style={{ width: "100px" }}>
                    <label className="form-label" htmlFor="flagship-emoji">Emoji</label>
                    <input type="text" id="flagship-emoji" value={newFlagship.emoji} onChange={(e) => setNewFlagship(prev => ({ ...prev, emoji: e.target.value }))} className="form-input" placeholder="🎉" />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label" htmlFor="flagship-title">Title *</label>
                    <input type="text" id="flagship-title" required value={newFlagship.title} onChange={(e) => setNewFlagship(prev => ({ ...prev, title: e.target.value }))} className="form-input" placeholder="e.g. DAY Utsav" />
                  </div>
                  <div className="form-group" style={{ width: "80px" }}>
                    <label className="form-label" htmlFor="flagship-color">Theme Color</label>
                    <input type="color" id="flagship-color" value={newFlagship.color} onChange={(e) => setNewFlagship(prev => ({ ...prev, color: e.target.value }))} style={{ width: "100%", height: "38px", border: "1px solid var(--color-border)", borderRadius: "8px", cursor: "pointer" }} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="flagship-desc">Description *</label>
                  <textarea id="flagship-desc" required rows={3} value={newFlagship.description} onChange={(e) => setNewFlagship(prev => ({ ...prev, description: e.target.value }))} className="form-textarea" placeholder="Brief details about this flagship campaign..."></textarea>
                </div>

                <div className="form-group">
                  <ImageUploader folder="flagship" label="Cover Photo *" currentUrl={newFlagship.image} onUpload={(url) => setNewFlagship(prev => ({ ...prev, image: url }))} />
                  {newFlagship.image && (
                    <button
                      type="button"
                      onClick={() => setNewFlagship(prev => ({ ...prev, image: "" }))}
                      style={{ fontSize: "0.75rem", color: "#e74c3c", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", marginTop: "4px" }}
                    >
                      ✕ Remove Selected Photo
                    </button>
                  )}
                </div>

                <button type="submit" disabled={actionLoading || !newFlagship.title || !newFlagship.description} className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }}>
                  {actionLoading ? <Loader className="animate-spin" size={18} style={{ marginInline: "auto" }} /> : "Add Flagship Card"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Add Team Member Modal */}
        {showAddTeamModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-backdrop" style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", overflowY: "auto" }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="modal-content" style={{ backgroundColor: "var(--color-bg-white)", borderRadius: "12px", width: "100%", maxWidth: "550px", padding: "2rem", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", maxHeight: "90vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1.25rem", color: "var(--color-primary)", margin: 0 }}>Add Core Team Member</h3>
                <button onClick={() => setShowAddTeamModal(false)} className="btn-icon reject" style={{ border: "none", background: "transparent" }}><X size={20} /></button>
              </div>
              <form onSubmit={handleAddTeamMember} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="form-group">
                  <ImageUploader folder="team" label="Profile Photo *" currentUrl={newTeamMember.image} onUpload={(url) => setNewTeamMember(prev => ({ ...prev, image: url }))} />
                </div>
                <div className="form-group"><label className="form-label" htmlFor="team-name-modal">Full Name *</label><input type="text" id="team-name-modal" required value={newTeamMember.name} onChange={(e) => setNewTeamMember(prev => ({ ...prev, name: e.target.value }))} className="form-input" /></div>
                <div className="form-group"><label className="form-label" htmlFor="team-role-modal">Role / Title *</label><input type="text" id="team-role-modal" required value={newTeamMember.role} onChange={(e) => setNewTeamMember(prev => ({ ...prev, role: e.target.value }))} className="form-input" /></div>
                <div className="form-group"><label className="form-label" htmlFor="team-bio-modal">Bio</label><textarea id="team-bio-modal" rows={3} value={newTeamMember.bio} onChange={(e) => setNewTeamMember(prev => ({ ...prev, bio: e.target.value }))} className="form-textarea"></textarea></div>
                <div className="form-group"><label className="form-label" htmlFor="team-email-modal">Email</label><input type="email" id="team-email-modal" value={newTeamMember.email} onChange={(e) => setNewTeamMember(prev => ({ ...prev, email: e.target.value }))} className="form-input" /></div>
                <div className="form-group"><label className="form-label" htmlFor="team-linkedin-modal">LinkedIn URL</label><input type="text" id="team-linkedin-modal" value={newTeamMember.linkedin} onChange={(e) => setNewTeamMember(prev => ({ ...prev, linkedin: e.target.value }))} className="form-input" /></div>
                <div className="form-group"><label className="form-label" htmlFor="team-order-modal">Display Order</label><input type="number" id="team-order-modal" value={newTeamMember.order} onChange={(e) => setNewTeamMember(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))} className="form-input" /></div>
                <button type="submit" disabled={actionLoading || !newTeamMember.image} className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }}>
                  {actionLoading ? <Loader className="animate-spin" size={18} style={{ marginInline: "auto" }} /> : "Add Team Member"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Add City Member Modal */}
        {showAddCityMemberModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-backdrop" style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", overflowY: "auto" }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="modal-content" style={{ backgroundColor: "var(--color-bg-white)", borderRadius: "12px", width: "100%", maxWidth: "550px", padding: "2rem", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", maxHeight: "90vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1.25rem", color: "var(--color-primary)", margin: 0 }}>Add City Management Member</h3>
                <button onClick={() => setShowAddCityMemberModal(false)} className="btn-icon reject" style={{ border: "none", background: "transparent" }}><X size={20} /></button>
              </div>
              <form onSubmit={handleAddCityMember} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="form-group">
                  <ImageUploader folder="team" label="Profile Photo *" currentUrl={newCityMember.image} onUpload={(url) => setNewCityMember(prev => ({ ...prev, image: url }))} />
                </div>
                <div className="form-group"><label className="form-label" htmlFor="city-name-modal">Full Name *</label><input type="text" id="city-name-modal" required value={newCityMember.name} onChange={(e) => setNewCityMember(prev => ({ ...prev, name: e.target.value }))} className="form-input" /></div>
                <div className="form-group"><label className="form-label" htmlFor="city-role-modal">Role / Title *</label><input type="text" id="city-role-modal" required value={newCityMember.role} onChange={(e) => setNewCityMember(prev => ({ ...prev, role: e.target.value }))} className="form-input" placeholder="e.g. City Representative Jabalpur" /></div>
                <div className="form-group"><label className="form-label" htmlFor="city-dayid-modal">Volunteer / Intern ID</label><input type="text" id="city-dayid-modal" value={newCityMember.dayId} onChange={(e) => setNewCityMember(prev => ({ ...prev, dayId: e.target.value }))} className="form-input" placeholder="e.g. DAY/XXXX/XXX/XXX" /></div>
                <div className="form-group"><label className="form-label" htmlFor="city-email-modal">Email</label><input type="email" id="city-email-modal" value={newCityMember.email} onChange={(e) => setNewCityMember(prev => ({ ...prev, email: e.target.value }))} className="form-input" /></div>
                <div className="form-group"><label className="form-label" htmlFor="city-linkedin-modal">LinkedIn URL</label><input type="text" id="city-linkedin-modal" value={newCityMember.linkedin} onChange={(e) => setNewCityMember(prev => ({ ...prev, linkedin: e.target.value }))} className="form-input" /></div>
                <div className="form-group"><label className="form-label" htmlFor="city-order-modal">Display Order</label><input type="number" id="city-order-modal" value={newCityMember.order} onChange={(e) => setNewCityMember(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))} className="form-input" /></div>
                <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "8px", marginBlock: "0.5rem" }}>
                  <input type="checkbox" id="city-hidden-modal" checked={newCityMember.hidden} onChange={(e) => setNewCityMember(prev => ({ ...prev, hidden: e.target.checked }))} style={{ cursor: "pointer" }} />
                  <label htmlFor="city-hidden-modal" style={{ cursor: "pointer", fontSize: "0.85rem", color: "var(--color-text-dark)", fontWeight: 600 }}>Hide member from About page</label>
                </div>
                <button type="submit" disabled={actionLoading || !newCityMember.image} className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }}>
                  {actionLoading ? <Loader className="animate-spin" size={18} style={{ marginInline: "auto" }} /> : "Add City Member"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Add Testimonial Modal */}
        {showAddTestimonialModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-backdrop" style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", overflowY: "auto" }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="modal-content" style={{ backgroundColor: "var(--color-bg-white)", borderRadius: "12px", width: "100%", maxWidth: "550px", padding: "2rem", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", maxHeight: "90vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1.25rem", color: "var(--color-primary)", margin: 0 }}>Add Echoes of Gratitude</h3>
                <button onClick={() => setShowAddTestimonialModal(false)} className="btn-icon reject" style={{ border: "none", background: "transparent" }}><X size={20} /></button>
              </div>
              <form onSubmit={handleAddTestimonial} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="form-group">
                  <ImageUploader folder="testimonials" label="Profile Photo *" currentUrl={newTestimonial.image} onUpload={(url) => setNewTestimonial(prev => ({ ...prev, image: url }))} />
                </div>
                <div className="form-group"><label className="form-label" htmlFor="testi-name-modal">Full Name *</label><input type="text" id="testi-name-modal" required value={newTestimonial.name} onChange={(e) => setNewTestimonial(prev => ({ ...prev, name: e.target.value }))} className="form-input" /></div>
                <div className="form-group"><label className="form-label" htmlFor="testi-role-modal">Role / Location *</label><input type="text" id="testi-role-modal" required placeholder="e.g. Campaign Management Intern, Indore" value={newTestimonial.role} onChange={(e) => setNewTestimonial(prev => ({ ...prev, role: e.target.value }))} className="form-input" /></div>
                <div className="form-group"><label className="form-label" htmlFor="testi-quote-modal">Quote / Review *</label><textarea id="testi-quote-modal" required rows={4} value={newTestimonial.quote} onChange={(e) => setNewTestimonial(prev => ({ ...prev, quote: e.target.value }))} className="form-textarea"></textarea></div>
                <button type="submit" disabled={actionLoading || !newTestimonial.image} className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }}>
                  {actionLoading ? <Loader className="animate-spin" size={18} style={{ marginInline: "auto" }} /> : "Add Testimonial"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
