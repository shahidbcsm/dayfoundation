import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";
import { initializeAppCheck, ReCaptchaV3Provider, ReCaptchaEnterpriseProvider } from "firebase/app-check";

// Check if production credentials are present
export let isMockEnabled = false;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBBAZpzc53bbI9t3P28p7MGoIhjbdXC2mg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "day-foundation.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "day-foundation",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "day-foundation.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "256724038101",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:256724038101:web:866b168c6a4c5831f5cd5c",
  measurementId: import.meta.env.VITE_GOOGLE_ANALYTICS_ID || "G-0PYNYSEYZG",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://day-foundation-default-rtdb.firebaseio.com"
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let auth: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let storage: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let rtdb: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let app: any = null;

if (!isMockEnabled) {
  try {
    // Prevent double initialization — reuse existing app if already initialized
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
    rtdb = getDatabase(app);

    // Initialize App Check only if site key is configured
    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
    if (siteKey && siteKey.trim() !== "") {
      if (import.meta.env.DEV) {
        (self as typeof self & { FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean }).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
      }
      const providerType = import.meta.env.VITE_RECAPTCHA_PROVIDER || "v3";
      const provider = providerType === "enterprise"
        ? new ReCaptchaEnterpriseProvider(siteKey)
        : new ReCaptchaV3Provider(siteKey);

      initializeAppCheck(app, {
        provider,
        isTokenAutoRefreshEnabled: true
      });
    }
  } catch (error) {
    console.error("Firebase SDK failed to initialize:", error);
    isMockEnabled = true;
    db = null; auth = null; storage = null; rtdb = null;
  }
}

if (!isMockEnabled && (!db || !rtdb)) {
  isMockEnabled = true;
}

export { db, auth, storage, rtdb };
export default app;
