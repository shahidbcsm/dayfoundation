import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
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
    let value = match[2] || "";
    if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
      value = value.replace(/\\n/gm, "\n");
    }
    env[key] = value.replace(/(^['"]|['"]$)/g, "").trim();
  }
});

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  databaseURL: "https://dayfoundation-ea9df-default-rtdb.firebaseio.com"
};

console.log("Connecting to Firebase:", firebaseConfig.projectId);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const rtdb = getDatabase(app);
const auth = getAuth(app);

// Auth
console.log("Authenticating...");
try {
  await signInWithEmailAndPassword(auth, "owner@dayfoundation.com", "DAY@19019");
} catch (e) {
  await signInWithEmailAndPassword(auth, "mrshahidbabu@dayfoundation.in", "Shahid@19019");
}
console.log("Authenticated as:", auth.currentUser?.email);

// 40 new gallery photos only
const galleryFiles = [
  "gallery-001.jpg","gallery-002.jpg","gallery-003.jpg","gallery-004.jpg",
  "gallery-005.jpg","gallery-006.jpg","gallery-007.jpg","gallery-008.jpg",
  "gallery-009.jpg","gallery-010.jpg","gallery-011.jpg","gallery-012.jpg",
  "gallery-013.jpg","gallery-014.jpg","gallery-015.jpg","gallery-016.jpg",
  "gallery-017.jpg","gallery-018.jpg","gallery-019.jpg","gallery-020.jpg",
  "gallery-021.jpg","gallery-022.jpg","gallery-023.jpg","gallery-024.jpg",
  "gallery-025.jpg","gallery-026.jpg","gallery-027.jpg","gallery-028.jpg",
  "gallery-029.jpg","gallery-030.jpg","gallery-031.jpg","gallery-032.jpg",
  "gallery-033.jpg","gallery-034.jpg","gallery-035.jpg","gallery-036.jpg",
  "gallery-037.jpg","gallery-038.jpg","gallery-039.jpg","gallery-040.jpg"
];
const categories = ["Education", "Aid Drive", "Healthcare", "Team Meet", "Employment"];

// STEP 1: Delete ALL Firestore gallery docs
console.log("\n[1/3] Deleting ALL Firestore gallery documents...");
const snap = await getDocs(collection(db, "gallery"));
console.log(`    Found ${snap.size} documents to delete.`);
for (const d of snap.docs) {
  await deleteDoc(doc(db, "gallery", d.id));
  process.stdout.write(".");
}
console.log(`\n    Deleted ${snap.size} documents.`);

// STEP 2: Wipe RTDB gallery node completely
console.log("[2/3] Wiping RTDB gallery node...");
await set(ref(rtdb, "gallery"), null);
console.log("    RTDB cleared.");

// STEP 3: Re-seed with 40 new photos only
console.log(`[3/3] Seeding ${galleryFiles.length} new photos...`);
for (let i = 0; i < galleryFiles.length; i++) {
  const item = {
    imageUrl: `/assets/gallery/${galleryFiles[i]}`,
    title: `DAY Foundation Activity #${i + 1}`,
    category: categories[i % categories.length],
    createdAt: "2026-06-15",
    hidden: false,
    deleted: false
  };
  const docRef = await addDoc(collection(db, "gallery"), item);
  await set(ref(rtdb, `gallery/${docRef.id}`), { id: docRef.id, ...item });
  process.stdout.write(".");
}

console.log(`\n\n✅ Done! Firebase gallery now has ONLY ${galleryFiles.length} new photos.`);
console.log("   All old photos have been permanently removed.");
process.exit(0);
