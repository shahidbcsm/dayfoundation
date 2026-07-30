import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { getDatabase, ref, set } from "firebase/database";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, "../../.env");
const envFile = fs.readFileSync(envPath, "utf8");
const env = {};
envFile.split(/\r?\n/).forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?$/);
  if (match) {
    const key = match[1];
    let value = (match[2] || "").trim().replace(/(^['"]|['"]$)/g, "");
    env[key] = value;
  }
});

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  databaseURL: env.VITE_FIREBASE_DATABASE_URL
};

console.log("Connecting to Firebase:", firebaseConfig.projectId);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);

// Authenticate as admin first
await signInWithEmailAndPassword(auth, "owner@dayfoundation.com", "DAY@19019");
console.log("Authenticated.");

// Delete all donation documents from Firestore
const donSnap = await getDocs(collection(db, "donations"));
let deleted = 0;
for (const d of donSnap.docs) {
  await deleteDoc(doc(db, "donations", d.id));
  deleted++;
}
console.log("Deleted " + deleted + " donation records from Firestore.");

// Clear donations node from Realtime Database
await set(ref(rtdb, "donations"), null);
console.log("Cleared donations from Realtime Database.");

process.exit(0);
