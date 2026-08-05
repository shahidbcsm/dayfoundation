import dotenv from 'dotenv';
import { adminDb } from '../api/firebase-admin';
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

dotenv.config({ path: '.env.local' });
dotenv.config();

async function seed() {
  console.log("Seeding database...");
  if (!adminDb) {
    console.error("Firebase Admin not initialized!");
    return;
  }
  
  const batch = adminDb.batch();

  const seedCollection = (collectionName: string, data: any[]) => {
    console.log(`Seeding ${data.length} items to ${collectionName}...`);
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

  try {
    await batch.commit();
    console.log("Database seeded successfully!");
  } catch (err) {
    console.error("Error seeding database:", err);
  }
}

seed();
