import { adminDb } from './firebase-admin';
import { 
  defaultEvents, 
  defaultBlogs, 
  defaultGallery, 
  defaultVolunteers, 
  defaultTeam, 
  defaultTestimonials, 
  defaultCityTeam, 
  defaultFlagshipCampaigns 
} from "../src/data/mockData";

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { secret } = req.body;
  
  // Basic security to prevent accidental public seeding
  if (secret !== "DAY_ADMIN_SEED_SECRET") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!adminDb) {
    return res.status(500).json({ error: "Firebase Admin DB not initialized" });
  }

  try {
    const batch = adminDb.batch();

    // Helper to seed a collection
    const seedCollection = (collectionName: string, data: any[]) => {
      data.forEach((item) => {
        const docRef = adminDb.collection(collectionName).doc(item.id);
        batch.set(docRef, item);
      });
    };

    seedCollection("events", defaultEvents);
    seedCollection("blogs", defaultBlogs);
    seedCollection("gallery", defaultGallery);
    seedCollection("volunteers", defaultVolunteers);
    seedCollection("team", defaultTeam);
    seedCollection("testimonials", defaultTestimonials);
    seedCollection("cityTeam", defaultCityTeam);
    seedCollection("flagshipCampaigns", defaultFlagshipCampaigns);

    await batch.commit();

    return res.status(200).json({ success: true, message: "Database seeded successfully!" });
  } catch (error) {
    console.error("Seeding error:", error);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}
