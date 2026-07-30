import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { getDatabase, ref, remove } from "firebase/database";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env variables manually
const envPath = path.resolve(__dirname, "../../.env");
const envFile = fs.readFileSync(envPath, "utf8");
const env = {};
envFile.split(/\r?\n/).forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
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
  appId: env.VITE_FIREBASE_APP_ID
};

console.log("Connecting to Firebase project to clear submissions:", firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const rtdb = getDatabase(app);

const collectionsToClear = ["volunteers", "contacts", "donations"];

async function clearCollections() {
  for (const colName of collectionsToClear) {
    console.log(`Clearing collection: ${colName}...`);
    
    // Clear Firestore
    const querySnapshot = await getDocs(collection(db, colName));
    let count = 0;
    for (const document of querySnapshot.docs) {
      await deleteDoc(doc(db, colName, document.id));
      count++;
    }
    console.log(`Deleted ${count} documents from Firestore collection '${colName}'.`);

    // Clear Realtime Database
    try {
      await remove(ref(rtdb, colName));
      console.log(`Cleared path '${colName}' in Realtime Database.`);
    } catch (rtdbErr) {
      console.error(`Failed to clear path '${colName}' in Realtime Database:`, rtdbErr);
    }
  }
  console.log("Database clear completed successfully!");
  process.exit(0);
}

clearCollections().catch(err => {
  console.error("Error clearing database:", err);
  process.exit(1);
});
