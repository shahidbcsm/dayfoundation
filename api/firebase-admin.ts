import { getApps, initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';
import dotenv from 'dotenv';

dotenv.config();

// Attempt to parse service account from environment variables
// It should be stored as a stringified JSON in VITE_FIREBASE_SERVICE_ACCOUNT
let serviceAccount;
try {
  if (process.env.VITE_FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.VITE_FIREBASE_SERVICE_ACCOUNT);
  }
} catch (e) {
  console.error("Failed to parse Firebase Service Account from env:", e);
}

if (getApps().length === 0) {
  try {
    initializeApp({
      credential: serviceAccount ? cert(serviceAccount) : applicationDefault(),
      databaseURL: process.env.VITE_FIREBASE_DATABASE_URL || "https://day-foundation-default-rtdb.firebaseio.com"
    });
  } catch(e) {
    console.error("Firebase admin init failed:", e);
  }
}

export const adminDb = getApps().length ? getFirestore() : null;
export const adminAuth = getApps().length ? getAuth() : null;
export const adminStorage = getApps().length ? getStorage() : null;
