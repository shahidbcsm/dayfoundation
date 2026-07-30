import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc } from "firebase/firestore";
import { getDatabase, ref, get, set } from "firebase/database";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

const oldConfig = {
  apiKey: "AIzaSyDM7XSR76uaLY3r2BTihaVyWZebDQ0x1sQ",
  authDomain: "day-foundation-33200-v2.firebaseapp.com",
  projectId: "day-foundation-33200-v2",
  storageBucket: "day-foundation-33200-v2.firebasestorage.app",
  messagingSenderId: "682485003418",
  appId: "1:682485003418:web:1a3e61c8b704e2e540db23",
  databaseURL: "https://day-foundation-33200-v2-default-rtdb.firebaseio.com"
};

const newConfig = {
  apiKey: "AIzaSyBBAZpzc53bbI9t3P28p7MGoIhjbdXC2mg",
  authDomain: "day-foundation.firebaseapp.com",
  projectId: "day-foundation",
  storageBucket: "day-foundation.firebasestorage.app",
  messagingSenderId: "256724038101",
  appId: "1:256724038101:web:866b168c6a4c5831f5cd5c",
  databaseURL: "https://day-foundation-default-rtdb.firebaseio.com"
};

console.log("Initializing Firebase apps...");
const oldApp = initializeApp(oldConfig, "oldApp");
const newApp = initializeApp(newConfig, "newApp");

const oldDb = getFirestore(oldApp);
const newDb = getFirestore(newApp);

const oldRtdb = getDatabase(oldApp);
const newRtdb = getDatabase(newApp);

const oldAuth = getAuth(oldApp);
const newAuth = getAuth(newApp);

const collections = [
  "blogs",
  "events",
  "gallery",
  "volunteers",
  "donations",
  "contacts",
  "team",
  "city_team",
  "complaints",
  "testimonials",
  "newsletter"
];

async function authenticate() {
  console.log("\n--- Authenticating Admin Users ---");
  const email = "owner@dayfoundation.com";
  const pass = "DAY@19019";
  
  // Authenticate Old App
  try {
    await signInWithEmailAndPassword(oldAuth, email, pass);
    console.log("Successfully authenticated on OLD project.");
  } catch (error) {
    console.error("Warning: Failed to authenticate on OLD project:", error.message);
  }

  // Authenticate New App
  try {
    await signInWithEmailAndPassword(newAuth, email, pass);
    console.log("Successfully authenticated on NEW project.");
  } catch (error) {
    if (error.code === "auth/user-not-found" || error.code === "auth/invalid-credential" || error.message.includes("credential")) {
      console.log("Admin user not found on NEW project. Creating user...");
      try {
        await createUserWithEmailAndPassword(newAuth, email, pass);
        console.log("Successfully created admin user on NEW project.");
      } catch (createErr) {
        console.error("Critical: Failed to create admin user on NEW project:", createErr.message);
      }
    } else {
      console.error("Critical: Failed to sign in on NEW project:", error.message);
    }
  }
}

async function migrateFirestore() {
  console.log("\n--- Starting Firestore Migration ---");
  for (const colName of collections) {
    try {
      console.log(`Migrating collection: ${colName}...`);
      const oldColRef = collection(oldDb, colName);
      const snapshot = await getDocs(oldColRef);
      console.log(`Found ${snapshot.size} documents in ${colName}.`);
      
      let count = 0;
      for (const oldDoc of snapshot.docs) {
        const data = oldDoc.data();
        const newDocRef = doc(newDb, colName, oldDoc.id);
        await setDoc(newDocRef, data);
        count++;
      }
      console.log(`Successfully migrated ${count}/${snapshot.size} documents for ${colName}.`);
    } catch (error) {
      console.error(`Error migrating collection ${colName}:`, error.message);
    }
  }
}

async function migrateRTDB() {
  console.log("\n--- Starting Realtime Database Migration ---");
  const paths = [
    "settings/default_design_layout",
    "settings/default_theme",
    "analytics/visitors",
    "analytics/reach"
  ];
  for (const path of paths) {
    try {
      console.log(`Migrating RTDB path: ${path}...`);
      const oldRef = ref(oldRtdb, path);
      const snapshot = await get(oldRef);
      if (snapshot.exists()) {
        const val = snapshot.val();
        console.log(`Value for ${path} is:`, val);
        const newRef = ref(newRtdb, path);
        await set(newRef, val);
        console.log(`Migrated ${path} successfully.`);
      } else {
        console.log(`No data found at old RTDB path ${path}.`);
      }
    } catch (error) {
      console.error(`Error migrating RTDB path ${path}:`, error.message);
    }
  }
}

async function run() {
  await authenticate();
  await migrateFirestore();
  await migrateRTDB();
  console.log("\nMigration completed successfully!");
  process.exit(0);
}

run();
