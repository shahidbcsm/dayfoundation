import { useState, useEffect } from "react";
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  query, 
  orderBy,
  setDoc,
  deleteDoc,
  arrayUnion,
  onSnapshot
} from "firebase/firestore";
import { db, isMockEnabled, rtdb, storage } from "./config";
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { ref, set, onValue, runTransaction } from "firebase/database";

// ==========================================
// IMAGE UPLOAD TO FIREBASE STORAGE
// ==========================================

/**
 * Uploads a File to Firebase Storage under the given folder.
 * @param file - The File object to upload
 * @param folder - Storage folder, e.g. "gallery", "blogs", "events", "team"
 * @param onProgress - Optional progress callback (0-100)
 * @returns download URL string
 */
export const uploadImageToStorage = (
  file: File,
  folder: string,
  onProgress?: (pct: number) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!storage) {
      // In mock mode, return local object URL
      const localUrl = URL.createObjectURL(file);
      resolve(localUrl);
      return;
    }
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${folder}/${timestamp}_${safeName}`;
    const fileRef = storageRef(storage, path);
    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        if (onProgress) onProgress(pct);
      },
      (error) => reject(error),
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        } catch (err) {
          reject(err);
        }
      }
    );
  });
};
import type { 
  Blog,
  Event, 
  GalleryItem, 
  Volunteer, 
  Donation,
  TeamMember,
  Testimonial,
  CityMember,
  FlagshipCampaign
} from "../data/mockData";
import {
  defaultBlogs,
  defaultEvents,
  defaultGallery,
  defaultVolunteers,
  defaultTeam,
  defaultTestimonials,
  defaultCityTeam,
  defaultFlagshipCampaigns
} from "../data/mockData";

// --- Seed LocalStorage Helper ---
const seedStorage = () => {
  const storedBlogs = localStorage.getItem("day_blogs");
  if (!storedBlogs) {
    localStorage.setItem("day_blogs", JSON.stringify(defaultBlogs));
  }
  if (!localStorage.getItem("day_events")) {
    localStorage.setItem("day_events", JSON.stringify(defaultEvents));
  }
  
  // Check if current stored gallery contains unsplash images or is old
  const storedGallery = localStorage.getItem("day_gallery");
  const isOldGallery = !storedGallery || storedGallery.includes("unsplash.com") || JSON.parse(storedGallery).length !== defaultGallery.length;
  if (isOldGallery) {
    localStorage.setItem("day_gallery", JSON.stringify(defaultGallery));
  }

  // Also clean old volunteers containing unsplash links or old definitions
  const storedVolunteers = localStorage.getItem("day_volunteers");
  const isOldVolunteers = !storedVolunteers || JSON.parse(storedVolunteers).length < defaultVolunteers.length;
  if (isOldVolunteers) {
    localStorage.setItem("day_volunteers", JSON.stringify(defaultVolunteers));
  }

  // Clear any old mock donation records — donations are live-only
  localStorage.removeItem("day_donations");


  const storedTeam = localStorage.getItem("day_team");
  if (!storedTeam || storedTeam.includes("Khushali Takk")) {
    localStorage.setItem("day_team", JSON.stringify(defaultTeam));
  }

  if (!localStorage.getItem("day_city_team")) {
    localStorage.setItem("day_city_team", JSON.stringify(defaultCityTeam));
  }

  if (!localStorage.getItem("day_testimonials")) {
    localStorage.setItem("day_testimonials", JSON.stringify(defaultTestimonials));
  }

  if (!localStorage.getItem("day_flagship_campaigns")) {
    localStorage.setItem("day_flagship_campaigns", JSON.stringify(defaultFlagshipCampaigns));
  }

  if (!localStorage.getItem("day_contacts")) {
    const defaultContacts = [
      {
        id: "msg-1",
        name: "Rahul Sharma",
        email: "rahul@gmail.com",
        subject: "Partnership Inquiry",
        message: "Hello team, we would love to sponsor one of your upcoming digital literacy camps in Jabalpur. Please get in touch.",
        createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
      },
      {
        id: "msg-2",
        name: "Priya Patel",
        email: "priya@gmail.com",
        subject: "Internship Query",
        message: "Is there any age restriction to apply for the 15-day social work internship? I am currently in my 1st year of college.",
        createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
      }
    ];
    localStorage.setItem("day_contacts", JSON.stringify(defaultContacts));
  }
};

if (isMockEnabled) {
  seedStorage();
}

// --- Simulating Loading delay helper for premium UX feel ---
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ==========================================
// 1. BLOGS SERVICE
// ==========================================

export const getBlogs = async (): Promise<Blog[]> => {
  if (isMockEnabled) {
    await delay(300);
    const data = localStorage.getItem("day_blogs");
    const list = data ? JSON.parse(data) : [];
    return list.filter((b: any) => !b.deleted);
  }
  
  const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as Blog))
    .filter(b => !b.deleted);
};

export const getBlogById = async (id: string): Promise<Blog | null> => {
  if (isMockEnabled) {
    await delay(200);
    const data = localStorage.getItem("day_blogs");
    const blogs: Blog[] = data ? JSON.parse(data) : [];
    return blogs.find(b => b.id === id && !b.deleted) || null;
  }

  const docRef = doc(db, "blogs", id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    if (data.deleted) return null;
    return { id: docSnap.id, ...data } as Blog;
  }
  return null;
};

export const createBlog = async (blog: Omit<Blog, "id">): Promise<Blog> => {
  if (isMockEnabled) {
    await delay(500);
    const data = localStorage.getItem("day_blogs");
    const blogs: Blog[] = data ? JSON.parse(data) : [];
    const newBlog: Blog = {
      ...blog,
      id: "blog-" + Date.now()
    };
    blogs.unshift(newBlog);
    localStorage.setItem("day_blogs", JSON.stringify(blogs));
    return newBlog;
  }

  const docRef = await addDoc(collection(db, "blogs"), blog);
  await set(ref(rtdb, `blogs/${docRef.id}`), blog);
  return { id: docRef.id, ...blog } as Blog;
};

export const deleteBlog = async (id: string): Promise<void> => {
  if (isMockEnabled) {
    await delay(400);
    const data = localStorage.getItem("day_blogs");
    const blogs: Blog[] = data ? JSON.parse(data) : [];
    const updated = blogs.map(b => b.id === id ? { ...b, deleted: true, deletedAt: new Date().toISOString() } as any : b);
    localStorage.setItem("day_blogs", JSON.stringify(updated));
    return;
  }

  const docRef = doc(db, "blogs", id);
  await updateDoc(docRef, { deleted: true, deletedAt: new Date().toISOString() });
  await set(ref(rtdb, `blogs/${id}/deleted`), true);
  await set(ref(rtdb, `blogs/${id}/deletedAt`), new Date().toISOString());
};

// ==========================================
// 2. EVENTS SERVICE
// ==========================================

export const getEvents = async (): Promise<Event[]> => {
  const todayStr = new Date().toISOString().split("T")[0];
  if (isMockEnabled) {
    await delay(300);
    const data = localStorage.getItem("day_events");
    const list: Event[] = data ? JSON.parse(data) : [];
    return list.map(e => e.date < todayStr ? { ...e, status: 'past' } : e);
  }

  const querySnapshot = await getDocs(collection(db, "events"));
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    const status = (data.date && data.date < todayStr) ? 'past' : data.status;
    return { id: doc.id, ...data, status } as Event;
  });
};

export const createEvent = async (event: Omit<Event, "id">): Promise<Event> => {
  if (isMockEnabled) {
    await delay(500);
    const data = localStorage.getItem("day_events");
    const events: Event[] = data ? JSON.parse(data) : [];
    const newEvent: Event = {
      ...event,
      id: "event-" + Date.now()
    };
    events.push(newEvent);
    localStorage.setItem("day_events", JSON.stringify(events));
    return newEvent;
  }

  const docRef = await addDoc(collection(db, "events"), event);
  await set(ref(rtdb, `events/${docRef.id}`), event);
  return { id: docRef.id, ...event } as Event;
};

export const deleteEvent = async (id: string): Promise<void> => {
  if (isMockEnabled) {
    await delay(400);
    const data = localStorage.getItem("day_events");
    const events: Event[] = data ? JSON.parse(data) : [];
    const updated = events.map(e => e.id === id ? { ...e, deleted: true, deletedAt: new Date().toISOString() } as any : e);
    localStorage.setItem("day_events", JSON.stringify(updated));
    return;
  }

  const docRef = doc(db, "events", id);
  await updateDoc(docRef, { deleted: true, deletedAt: new Date().toISOString() });
  await set(ref(rtdb, `events/${id}/deleted`), true);
  await set(ref(rtdb, `events/${id}/deletedAt`), new Date().toISOString());
};

export const updateEvent = async (id: string, updates: Partial<Omit<Event, "id">>): Promise<void> => {
  if (isMockEnabled) {
    await delay(300);
    const data = localStorage.getItem("day_events");
    const list: Event[] = data ? JSON.parse(data) : [];
    const updated = list.map(e => e.id === id ? { ...e, ...updates } : e);
    localStorage.setItem("day_events", JSON.stringify(updated));
    return;
  }

  const docRef = doc(db, "events", id);
  await updateDoc(docRef, updates);
  for (const [key, val] of Object.entries(updates)) {
    await set(ref(rtdb, `events/${id}/${key}`), val);
  }
};

// ==========================================
// 3. GALLERY SERVICE
// ==========================================

export const getGallery = async (): Promise<GalleryItem[]> => {
  if (isMockEnabled) {
    await delay(300);
    const data = localStorage.getItem("day_gallery");
    return data ? JSON.parse(data) : [];
  }

  const querySnapshot = await getDocs(collection(db, "gallery"));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryItem));
};

export const createGalleryItem = async (item: Omit<GalleryItem, "id">): Promise<GalleryItem> => {
  if (isMockEnabled) {
    await delay(400);
    const data = localStorage.getItem("day_gallery");
    const items: GalleryItem[] = data ? JSON.parse(data) : [];
    const newItem: GalleryItem = {
      ...item,
      id: "gal-" + Date.now()
    };
    items.unshift(newItem);
    localStorage.setItem("day_gallery", JSON.stringify(items));
    return newItem;
  }

  const docRef = await addDoc(collection(db, "gallery"), item);
  await set(ref(rtdb, `gallery/${docRef.id}`), item);
  return { id: docRef.id, ...item } as GalleryItem;
};

export const deleteGalleryItem = async (id: string): Promise<void> => {
  if (isMockEnabled) {
    await delay(300);
    const data = localStorage.getItem("day_gallery");
    const items: GalleryItem[] = data ? JSON.parse(data) : [];
    const updated = items.map(i => i.id === id ? { ...i, deleted: true, deletedAt: new Date().toISOString() } as any : i);
    localStorage.setItem("day_gallery", JSON.stringify(updated));
    return;
  }

  const docRef = doc(db, "gallery", id);
  await updateDoc(docRef, { deleted: true, deletedAt: new Date().toISOString() });
  await set(ref(rtdb, `gallery/${id}/deleted`), true);
  await set(ref(rtdb, `gallery/${id}/deletedAt`), new Date().toISOString());
};

export const updateGalleryItem = async (id: string, updates: Partial<Omit<GalleryItem, "id">>): Promise<void> => {
  if (isMockEnabled) {
    await delay(300);
    const data = localStorage.getItem("day_gallery");
    const items: GalleryItem[] = data ? JSON.parse(data) : [];
    const updated = items.map(i => i.id === id ? { ...i, ...updates } : i);
    localStorage.setItem("day_gallery", JSON.stringify(updated));
    return;
  }

  const docRef = doc(db, "gallery", id);
  await updateDoc(docRef, updates);
  for (const [key, val] of Object.entries(updates)) {
    await set(ref(rtdb, `gallery/${id}/${key}`), val);
  }
};

// ==========================================
// 4. VOLUNTEERS SERVICE
// ==========================================



// Helper: generate a ticket number
export const generateTicketNo = (prefix: 'VOL' | 'CON' | 'INT' | 'CMP'): string => {
  const date = new Date();
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-DAY-${datePart}-${rand}`;
};

// Helper: generate a sequential permanent internship ID
const generatePermanentId = (existingInternships: Volunteer[]): string => {
  const year = new Date().getFullYear();
  const approvedCount = existingInternships.filter(
    v => v.type === 'internship' && v.permanentInternshipId
  ).length;
  const seq = String(approvedCount + 1).padStart(4, '0');
  return `DAY-INT-${year}-${seq}`;
};

export const getVolunteers = async (): Promise<Volunteer[]> => {
  if (isMockEnabled) {
    await delay(400);
    const data = localStorage.getItem("day_volunteers");
    return data ? JSON.parse(data) : [];
  }

  const querySnapshot = await getDocs(collection(db, "volunteers"));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Volunteer));
};

// Returns ONLY internship applications
export const getInternships = async (): Promise<Volunteer[]> => {
  const all = await getVolunteers();
  return all.filter(v => v.type === 'internship');
};

// Public lookup by temp ID
export const getInternshipByTempId = async (tempId: string): Promise<Volunteer | null> => {
  const interns = await getInternships();
  return interns.find(v => v.tempInternshipId === tempId) || null;
};

export const createVolunteer = async (volunteer: Omit<Volunteer, "id" | "status" | "createdAt">): Promise<Volunteer> => {
  const isInternship = volunteer.type === 'internship';
  const tNo = generateTicketNo(isInternship ? 'INT' : 'VOL');

  const fullVolunteer = {
    ...volunteer,
    status: "pending" as const,
    createdAt: new Date().toISOString(),
    ticketNo: tNo,
    adminComment: "",
    ...(isInternship ? { tempInternshipId: tNo } : {})
  };

  if (isMockEnabled) {
    await delay(600);
    const data = localStorage.getItem("day_volunteers");
    const volunteers: Volunteer[] = data ? JSON.parse(data) : [];
    const newVol: Volunteer = {
      ...fullVolunteer,
      id: "vol-" + Date.now()
    };
    volunteers.unshift(newVol);
    localStorage.setItem("day_volunteers", JSON.stringify(volunteers));
    return newVol;
  }

  const docRef = await addDoc(collection(db, "volunteers"), fullVolunteer);
  await set(ref(rtdb, `volunteers/${docRef.id}`), fullVolunteer);
  return { id: docRef.id, ...fullVolunteer } as Volunteer;
};

export const updateVolunteerStatus = async (id: string, status: 'approved' | 'rejected' | 'pending' | 'hold'): Promise<void> => {
  if (isMockEnabled) {
    await delay(300);
    const data = localStorage.getItem("day_volunteers");
    const volunteers: Volunteer[] = data ? JSON.parse(data) : [];
    const index = volunteers.findIndex(v => v.id === id);
    if (index !== -1) {
      volunteers[index].status = status;
      localStorage.setItem("day_volunteers", JSON.stringify(volunteers));
    }
    return;
  }

  const docRef = doc(db, "volunteers", id);
  await updateDoc(docRef, { status });
  await set(ref(rtdb, `volunteers/${id}/status`), status);
};

// Approve an internship: sets status = approved AND assigns permanent ID
export const approveInternship = async (id: string, customId?: string): Promise<string> => {
  if (isMockEnabled) {
    await delay(400);
    const data = localStorage.getItem("day_volunteers");
    const volunteers: Volunteer[] = data ? JSON.parse(data) : [];
    const permId = customId || generatePermanentId(volunteers);
    const index = volunteers.findIndex(v => v.id === id);
    if (index !== -1) {
      volunteers[index].status = 'approved';
      volunteers[index].permanentInternshipId = permId;
      localStorage.setItem("day_volunteers", JSON.stringify(volunteers));
    }
    return permId;
  }

  const allVols = await getVolunteers();
  const permId = customId || generatePermanentId(allVols);
  const docRef = doc(db, "volunteers", id);
  await updateDoc(docRef, { status: 'approved', permanentInternshipId: permId });
  await set(ref(rtdb, `volunteers/${id}/status`), 'approved');
  await set(ref(rtdb, `volunteers/${id}/permanentInternshipId`), permId);
  return permId;
};

// Allow editing permanent internship ID directly
export const updateInternshipId = async (id: string, permanentInternshipId: string): Promise<void> => {
  if (isMockEnabled) {
    await delay(300);
    const data = localStorage.getItem("day_volunteers");
    const volunteers: Volunteer[] = data ? JSON.parse(data) : [];
    const index = volunteers.findIndex(v => v.id === id);
    if (index !== -1) {
      volunteers[index].permanentInternshipId = permanentInternshipId;
      localStorage.setItem("day_volunteers", JSON.stringify(volunteers));
    }
    return;
  }

  const docRef = doc(db, "volunteers", id);
  await updateDoc(docRef, { permanentInternshipId });
  await set(ref(rtdb, `volunteers/${id}/permanentInternshipId`), permanentInternshipId);
};

// Approve a volunteer: sets status = approved AND assigns customized permanent volunteer ID
export const approveVolunteer = async (id: string, customId?: string): Promise<string> => {
  const defaultId = `DAY-VOL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const permId = customId || defaultId;
  
  if (isMockEnabled) {
    await delay(400);
    const data = localStorage.getItem("day_volunteers");
    const volunteers: Volunteer[] = data ? JSON.parse(data) : [];
    const index = volunteers.findIndex(v => v.id === id);
    if (index !== -1) {
      volunteers[index].status = 'approved';
      volunteers[index].permanentVolunteerId = permId;
      localStorage.setItem("day_volunteers", JSON.stringify(volunteers));
    }
    return permId;
  }

  const docRef = doc(db, "volunteers", id);
  await updateDoc(docRef, { status: 'approved', permanentVolunteerId: permId });
  await set(ref(rtdb, `volunteers/${id}/status`), 'approved');
  await set(ref(rtdb, `volunteers/${id}/permanentVolunteerId`), permId);
  return permId;
};

// Allow editing permanent volunteer ID directly
export const updateVolunteerId = async (id: string, permanentVolunteerId: string): Promise<void> => {
  if (isMockEnabled) {
    await delay(300);
    const data = localStorage.getItem("day_volunteers");
    const volunteers: Volunteer[] = data ? JSON.parse(data) : [];
    const index = volunteers.findIndex(v => v.id === id);
    if (index !== -1) {
      volunteers[index].permanentVolunteerId = permanentVolunteerId;
      localStorage.setItem("day_volunteers", JSON.stringify(volunteers));
    }
    return;
  }

  const docRef = doc(db, "volunteers", id);
  await updateDoc(docRef, { permanentVolunteerId });
  await set(ref(rtdb, `volunteers/${id}/permanentVolunteerId`), permanentVolunteerId);
};

// Delete volunteer or internship registration record
export const deleteVolunteerRecord = async (id: string): Promise<void> => {
  if (isMockEnabled) {
    await delay(300);
    const data = localStorage.getItem("day_volunteers");
    const volunteers: Volunteer[] = data ? JSON.parse(data) : [];
    const updated = volunteers.map(v => v.id === id ? { ...v, deleted: true, deletedAt: new Date().toISOString() } as any : v);
    localStorage.setItem("day_volunteers", JSON.stringify(updated));
    return;
  }

  const docRef = doc(db, "volunteers", id);
  await updateDoc(docRef, { deleted: true, deletedAt: new Date().toISOString() });
  await set(ref(rtdb, `volunteers/${id}/deleted`), true);
  await set(ref(rtdb, `volunteers/${id}/deletedAt`), new Date().toISOString());
};

// Delete donation ledger record
export const deleteDonationRecord = async (id: string): Promise<void> => {
  if (isMockEnabled) {
    await delay(300);
    const data = localStorage.getItem("day_donations");
    const donations: Donation[] = data ? JSON.parse(data) : [];
    const updated = donations.map(d => d.id === id ? { ...d, deleted: true, deletedAt: new Date().toISOString() } as any : d);
    localStorage.setItem("day_donations", JSON.stringify(updated));
    return;
  }

  const docRef = doc(db, "donations", id);
  await updateDoc(docRef, { deleted: true, deletedAt: new Date().toISOString() });
  await set(ref(rtdb, `donations/${id}/deleted`), true);
  await set(ref(rtdb, `donations/${id}/deletedAt`), new Date().toISOString());
};

// ==========================================
// 5. DONATIONS SERVICE
// ==========================================

export const getDonations = async (): Promise<Donation[]> => {
  if (isMockEnabled) {
    await delay(400);
    const data = localStorage.getItem("day_donations");
    return data ? JSON.parse(data) : [];
  }

  const querySnapshot = await getDocs(collection(db, "donations"));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Donation));
};

export const createDonation = async (donation: Omit<Donation, "id" | "createdAt">): Promise<Donation> => {
  const fullDonation = {
    ...donation,
    createdAt: new Date().toISOString()
  };

  if (isMockEnabled) {
    await delay(600);
    const data = localStorage.getItem("day_donations");
    const donations: Donation[] = data ? JSON.parse(data) : [];
    const newDon: Donation = {
      ...fullDonation,
      id: "don-" + Date.now()
    };
    donations.unshift(newDon);
    localStorage.setItem("day_donations", JSON.stringify(donations));
    return newDon;
  }

  const docRef = await addDoc(collection(db, "donations"), fullDonation);
  await set(ref(rtdb, `donations/${docRef.id}`), fullDonation);
  return { id: docRef.id, ...fullDonation } as Donation;
};

// ==========================================
// 6. REAL-TIME SUBSCRIPTIONS (Firebase Realtime Database)
// ==========================================

export const subscribeBlogs = (callback: (blogs: Blog[]) => void) => {
  if (isMockEnabled) {
    const handler = () => {
      const data = localStorage.getItem("day_blogs");
      const list = data ? JSON.parse(data) : [];
      callback(list.filter((b: any) => !b.deleted));
    };
    window.addEventListener("storage", handler);
    const interval = setInterval(handler, 1000);
    handler();
    return () => {
      window.removeEventListener("storage", handler);
      clearInterval(interval);
    };
  }

  const blogsRef = ref(rtdb, "blogs");
  let seeding = false;
  return onValue(blogsRef, async (snapshot) => {
    const val = snapshot.val();
    if (!val) {
      if (!seeding) {
        seeding = true;
        console.log("Firebase Blogs is empty. Auto-seeding default blogs...");
        try {
          for (const item of defaultBlogs) {
            const { id, ...itemData } = item;
            await setDoc(doc(db, "blogs", id), itemData);
            await set(ref(rtdb, `blogs/${id}`), itemData);
          }
        } catch (err) {
          console.error("Auto-seeding blogs failed:", err);
        } finally {
          seeding = false;
        }
      }
      callback([]);
      return;
    }
    const data = Object.entries(val)
      .map(([id, item]: [string, any]) => ({ id, ...item }))
      .filter((b: any) => !b.deleted);
    data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(data);
  });
};

export const subscribeEvents = (callback: (events: Event[]) => void) => {
  const todayStr = new Date().toISOString().split("T")[0];
  if (isMockEnabled) {
    const handler = () => {
      const data = localStorage.getItem("day_events");
      const list = data ? JSON.parse(data) : [];
      callback(
        list
          .filter((e: any) => !e.deleted)
          .map((e: any) => (e.date < todayStr ? { ...e, status: "past" } : e))
      );
    };
    window.addEventListener("storage", handler);
    const interval = setInterval(handler, 1000);
    handler();
    return () => {
      window.removeEventListener("storage", handler);
      clearInterval(interval);
    };
  }

  const eventsRef = ref(rtdb, "events");
  let seeding = false;
  return onValue(eventsRef, async (snapshot) => {
    const val = snapshot.val();
    if (!val) {
      if (!seeding) {
        seeding = true;
        console.log("Firebase Events is empty. Auto-seeding default events...");
        try {
          for (const item of defaultEvents) {
            const { id, ...itemData } = item;
            await setDoc(doc(db, "events", id), itemData);
            await set(ref(rtdb, `events/${id}`), itemData);
          }
        } catch (err) {
          console.error("Auto-seeding events failed:", err);
        } finally {
          seeding = false;
        }
      }
      callback([]);
      return;
    }
    const data = Object.entries(val)
      .map(([id, item]: [string, any]) => {
        const status = (item.date && item.date < todayStr) ? 'past' : item.status;
        return { id, ...item, status };
      })
      .filter((e: any) => !e.deleted);
    data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    callback(data);
  });
};

export const subscribeFlagshipCampaigns = (callback: (items: FlagshipCampaign[]) => void) => {
  if (isMockEnabled) {
    const handler = () => {
      const data = localStorage.getItem("day_flagship_campaigns");
      const list = data ? JSON.parse(data) : defaultFlagshipCampaigns;
      callback(list.filter((c: any) => !c.deleted));
    };
    window.addEventListener("storage", handler);
    const interval = setInterval(handler, 1000);
    handler();
    return () => {
      window.removeEventListener("storage", handler);
      clearInterval(interval);
    };
  }

  const flagshipRef = ref(rtdb, "flagship_campaigns");
  let seeding = false;
  return onValue(flagshipRef, async (snapshot) => {
    const val = snapshot.val();
    if (!val) {
      if (!seeding) {
        seeding = true;
        console.log("Firebase Flagship Campaigns is empty. Auto-seeding default campaigns...");
        try {
          for (const item of defaultFlagshipCampaigns) {
            const { id, ...itemData } = item;
            await setDoc(doc(db, "flagship_campaigns", id), itemData);
            await set(ref(rtdb, `flagship_campaigns/${id}`), itemData);
          }
        } catch (err) {
          console.error("Auto-seeding flagship campaigns failed:", err);
        } finally {
          seeding = false;
        }
      }
      callback(defaultFlagshipCampaigns);
      return;
    }

    const list: FlagshipCampaign[] = Object.keys(val)
      .map((key) => ({ id: key, ...val[key] }))
      .filter((item) => !item.deleted);
    callback(list);
  });
};

export const createFlagshipCampaign = async (item: Omit<FlagshipCampaign, "id">): Promise<string> => {
  const newId = `flagship-${Date.now()}`;
  if (isMockEnabled) {
    const data = localStorage.getItem("day_flagship_campaigns");
    const list = data ? JSON.parse(data) : [...defaultFlagshipCampaigns];
    const newItem = { id: newId, ...item };
    list.push(newItem);
    localStorage.setItem("day_flagship_campaigns", JSON.stringify(list));
    window.dispatchEvent(new Event("storage"));
    return newId;
  }

  await setDoc(doc(db, "flagship_campaigns", newId), item);
  await set(ref(rtdb, `flagship_campaigns/${newId}`), item);
  return newId;
};

export const updateFlagshipCampaign = async (id: string, updates: Partial<FlagshipCampaign>): Promise<void> => {
  if (isMockEnabled) {
    const data = localStorage.getItem("day_flagship_campaigns");
    let list = data ? JSON.parse(data) : [...defaultFlagshipCampaigns];
    list = list.map((item: any) => (item.id === id ? { ...item, ...updates } : item));
    localStorage.setItem("day_flagship_campaigns", JSON.stringify(list));
    window.dispatchEvent(new Event("storage"));
    return;
  }

  await updateDoc(doc(db, "flagship_campaigns", id), updates);
  await set(ref(rtdb, `flagship_campaigns/${id}`), updates);
};

export const deleteFlagshipCampaign = async (id: string): Promise<void> => {
  return updateFlagshipCampaign(id, { deleted: true, deletedAt: new Date().toISOString() });
};

export const subscribeGallery = (callback: (gallery: GalleryItem[]) => void) => {
  if (isMockEnabled) {
    const handler = () => {
      const data = localStorage.getItem("day_gallery");
      const list = data ? JSON.parse(data) : [];
      callback(list.filter((g: any) => !g.deleted));
    };
    window.addEventListener("storage", handler);
    const interval = setInterval(handler, 1000);
    handler();
    return () => {
      window.removeEventListener("storage", handler);
      clearInterval(interval);
    };
  }

  const galleryRef = ref(rtdb, "gallery");
  return onValue(galleryRef, (snapshot) => {
    const val = snapshot.val();
    if (!val) {
      callback([]);
      return;
    }
    const data = Object.entries(val)
      .map(([id, item]: [string, any]) => ({ id, ...item }))
      .filter((g: any) => !g.deleted);
    callback(data);
  });
};

export const subscribeVolunteers = (callback: (volunteers: Volunteer[]) => void) => {
  if (isMockEnabled) {
    const handler = () => {
      const data = localStorage.getItem("day_volunteers");
      const list = data ? JSON.parse(data) : [];
      callback(list.filter((v: any) => !v.deleted));
    };
    window.addEventListener("storage", handler);
    const interval = setInterval(handler, 1000);
    handler();
    return () => {
      window.removeEventListener("storage", handler);
      clearInterval(interval);
    };
  }

  const volunteersRef = ref(rtdb, "volunteers");
  return onValue(volunteersRef, (snapshot) => {
    const val = snapshot.val();
    if (!val) {
      callback([]);
      return;
    }
    const data = Object.entries(val)
      .map(([id, item]: [string, any]) => ({ id, ...item }))
      .filter((v: any) => !v.deleted);
    data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(data);
  });
};

export const subscribeDonations = (callback: (donations: Donation[]) => void) => {
  if (isMockEnabled) {
    const handler = () => {
      const data = localStorage.getItem("day_donations");
      const list = data ? JSON.parse(data) : [];
      callback(list.filter((d: any) => !d.deleted));
    };
    window.addEventListener("storage", handler);
    const interval = setInterval(handler, 1000);
    handler();
    return () => {
      window.removeEventListener("storage", handler);
      clearInterval(interval);
    };
  }

  const donationsRef = ref(rtdb, "donations");
  return onValue(donationsRef, (snapshot) => {
    const val = snapshot.val();
    if (!val) {
      callback([]);
      return;
    }
    const data = Object.entries(val)
      .map(([id, item]: [string, any]) => ({ id, ...item }))
      .filter((d: any) => !d.deleted);
    data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(data);
  });
};

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt?: string;
  ticketNo?: string;
  status?: 'pending' | 'reviewed' | 'resolved';
  adminComment?: string;
  comments?: any[];
}

export const createContactMessage = async (msg: Omit<ContactMessage, "id" | "createdAt">, prefix: 'CON' | 'CMP' = 'CON'): Promise<ContactMessage> => {
  const tNo = generateTicketNo(prefix);
  const fullMsg = {
    ...msg,
    createdAt: new Date().toISOString(),
    ticketNo: tNo,
    status: 'pending' as const,
    adminComment: ""
  };

  if (isMockEnabled) {
    await delay(500);
    const data = localStorage.getItem("day_contacts");
    const contacts: ContactMessage[] = data ? JSON.parse(data) : [];
    const newMsg: ContactMessage = {
      ...fullMsg,
      id: "msg-" + Date.now()
    };
    contacts.unshift(newMsg);
    localStorage.setItem("day_contacts", JSON.stringify(contacts));
    return newMsg;
  }

  const docRef = await addDoc(collection(db, "contacts"), fullMsg);
  await set(ref(rtdb, `contacts/${docRef.id}`), fullMsg);
  return { id: docRef.id, ...fullMsg } as ContactMessage;
};

export const subscribeContactMessages = (callback: (messages: ContactMessage[]) => void) => {
  if (isMockEnabled) {
    const handler = () => {
      const data = localStorage.getItem("day_contacts");
      const list = data ? JSON.parse(data) : [];
      callback(list.filter((c: any) => !c.deleted));
    };
    window.addEventListener("storage", handler);
    const interval = setInterval(handler, 1000);
    handler();
    return () => {
      window.removeEventListener("storage", handler);
      clearInterval(interval);
    };
  }

  const contactsRef = ref(rtdb, "contacts");
  return onValue(contactsRef, (snapshot) => {
    const val = snapshot.val();
    if (!val) {
      callback([]);
      return;
    }
    const data = Object.entries(val)
      .map(([id, item]: [string, any]) => ({ id, ...item }))
      .filter((c: any) => !c.deleted);
    data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(data);
  });
};

export const deleteContactMessage = async (id: string): Promise<void> => {
  if (isMockEnabled) {
    await delay(300);
    const data = localStorage.getItem("day_contacts");
    const contacts: ContactMessage[] = data ? JSON.parse(data) : [];
    const updated = contacts.map(c => c.id === id ? { ...c, deleted: true, deletedAt: new Date().toISOString() } as any : c);
    localStorage.setItem("day_contacts", JSON.stringify(updated));
    return;
  }

  const docRef = doc(db, "contacts", id);
  await updateDoc(docRef, { deleted: true, deletedAt: new Date().toISOString() });
  await set(ref(rtdb, `contacts/${id}/deleted`), true);
  await set(ref(rtdb, `contacts/${id}/deletedAt`), new Date().toISOString());
};

// ==========================================
// 8. TEAM MEMBERS SERVICE
// ==========================================

export const createTeamMember = async (member: Omit<TeamMember, "id">): Promise<TeamMember> => {
  if (isMockEnabled) {
    await delay(500);
    const data = localStorage.getItem("day_team");
    const team: TeamMember[] = data ? JSON.parse(data) : [];
    const newMember: TeamMember = {
      ...member,
      id: "team-" + Date.now()
    };
    team.push(newMember);
    localStorage.setItem("day_team", JSON.stringify(team));
    return newMember;
  }

  const docRef = await addDoc(collection(db, "team"), member);
  await set(ref(rtdb, `team/${docRef.id}`), { id: docRef.id, ...member });
  return { id: docRef.id, ...member } as TeamMember;
};

export const updateTeamMember = async (id: string, updates: Partial<Omit<TeamMember, "id">>): Promise<void> => {
  if (isMockEnabled) {
    await delay(400);
    const data = localStorage.getItem("day_team");
    const team: TeamMember[] = data ? JSON.parse(data) : [];
    const updated = team.map(m => m.id === id ? { ...m, ...updates } : m);
    localStorage.setItem("day_team", JSON.stringify(updated));
    return;
  }

  const docRef = doc(db, "team", id);
  await updateDoc(docRef, updates);
  for (const [key, val] of Object.entries(updates)) {
    await set(ref(rtdb, `team/${id}/${key}`), val);
  }
};

export const deleteTeamMember = async (id: string): Promise<void> => {
  if (isMockEnabled) {
    await delay(400);
    const data = localStorage.getItem("day_team");
    const team: TeamMember[] = data ? JSON.parse(data) : [];
    const updated = team.map(m => m.id === id ? { ...m, deleted: true, deletedAt: new Date().toISOString() } as any : m);
    localStorage.setItem("day_team", JSON.stringify(updated));
    return;
  }

  const docRef = doc(db, "team", id);
  await updateDoc(docRef, { deleted: true, deletedAt: new Date().toISOString() });
  await set(ref(rtdb, `team/${id}/deleted`), true);
  await set(ref(rtdb, `team/${id}/deletedAt`), new Date().toISOString());
};

export const subscribeTeam = (callback: (team: TeamMember[]) => void) => {
  if (isMockEnabled) {
    const handler = () => {
      const data = localStorage.getItem("day_team");
      const list: TeamMember[] = data ? JSON.parse(data) : [];
      const active = list
        .map((m: any) => ({
          ...m,
          name: m.name === "Khushali Takk" ? "Khushali Tak" : m.name
        }))
        .filter((m: any) => !m.deleted);
      active.sort((a, b) => (a.order || 0) - (b.order || 0));
      callback(active);
    };
    window.addEventListener("storage", handler);
    const interval = setInterval(handler, 1000);
    handler();
    return () => {
      window.removeEventListener("storage", handler);
      clearInterval(interval);
    };
  }

  const teamRef = ref(rtdb, "team");
  let seeding = false;
  return onValue(teamRef, async (snapshot) => {
    const val = snapshot.val();
    if (!val) {
      if (!seeding) {
        seeding = true;
        console.log("Firebase Team is empty. Auto-seeding default team...");
        try {
          for (const item of defaultTeam) {
            const { id, ...itemData } = item;
            await setDoc(doc(db, "team", id), itemData);
            await set(ref(rtdb, `team/${id}`), itemData);
          }
        } catch (err) {
          console.error("Auto-seeding team failed:", err);
        } finally {
          seeding = false;
        }
      }
      callback([]);
      return;
    }
    const data = Object.entries(val)
      .map(([id, item]: [string, any]) => ({
        id,
        ...item,
        name: item.name === "Khushali Takk" ? "Khushali Tak" : item.name
      }))
      .filter((m: any) => !m.deleted);
    data.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
    callback(data);
  });
};

export const createCityMember = async (member: Omit<CityMember, "id">): Promise<CityMember> => {
  if (isMockEnabled) {
    await delay(500);
    const data = localStorage.getItem("day_city_team");
    const list: CityMember[] = data ? JSON.parse(data) : [];
    const newMember: CityMember = {
      ...member,
      id: "city-" + Date.now()
    };
    list.push(newMember);
    localStorage.setItem("day_city_team", JSON.stringify(list));
    return newMember;
  }

  const docRef = await addDoc(collection(db, "city_team"), member);
  await set(ref(rtdb, `city_team/${docRef.id}`), { id: docRef.id, ...member });
  return { id: docRef.id, ...member } as CityMember;
};

export const updateCityMember = async (id: string, updates: Partial<Omit<CityMember, "id">>): Promise<void> => {
  if (isMockEnabled) {
    await delay(400);
    const data = localStorage.getItem("day_city_team");
    const list: CityMember[] = data ? JSON.parse(data) : [];
    const updated = list.map(m => m.id === id ? { ...m, ...updates } : m);
    localStorage.setItem("day_city_team", JSON.stringify(updated));
    return;
  }

  const docRef = doc(db, "city_team", id);
  await updateDoc(docRef, updates);
  for (const [key, val] of Object.entries(updates)) {
    await set(ref(rtdb, `city_team/${id}/${key}`), val);
  }
};

export const deleteCityMember = async (id: string): Promise<void> => {
  if (isMockEnabled) {
    await delay(400);
    const data = localStorage.getItem("day_city_team");
    const list: CityMember[] = data ? JSON.parse(data) : [];
    const updated = list.map(m => m.id === id ? { ...m, deleted: true, deletedAt: new Date().toISOString() } as any : m);
    localStorage.setItem("day_city_team", JSON.stringify(updated));
    return;
  }

  const docRef = doc(db, "city_team", id);
  await updateDoc(docRef, { deleted: true, deletedAt: new Date().toISOString() });
  await set(ref(rtdb, `city_team/${id}/deleted`), true);
  await set(ref(rtdb, `city_team/${id}/deletedAt`), new Date().toISOString());
};

export const subscribeCityMembers = (callback: (team: CityMember[]) => void) => {
  if (isMockEnabled) {
    const handler = () => {
      const data = localStorage.getItem("day_city_team");
      const list: CityMember[] = data ? JSON.parse(data) : [];
      const active = list.filter((m: any) => !m.deleted);
      active.sort((a, b) => (a.order || 0) - (b.order || 0));
      callback(active);
    };
    window.addEventListener("storage", handler);
    const interval = setInterval(handler, 1000);
    handler();
    return () => {
      window.removeEventListener("storage", handler);
      clearInterval(interval);
    };
  }

  const teamRef = ref(rtdb, "city_team");
  let seeding = false;
  return onValue(teamRef, async (snapshot) => {
    const val = snapshot.val();
    if (!val) {
      if (!seeding) {
        seeding = true;
        console.log("Firebase City Team is empty. Auto-seeding default city team...");
        try {
          for (const item of defaultCityTeam) {
            const { id, ...itemData } = item;
            await setDoc(doc(db, "city_team", id), itemData);
            await set(ref(rtdb, `city_team/${id}`), itemData);
          }
        } catch (err) {
          console.error("Auto-seeding city team failed:", err);
        } finally {
          seeding = false;
        }
      }
      callback([]);
      return;
    }
    const data = Object.entries(val)
      .map(([id, item]: [string, any]) => ({ id, ...item }))
      .filter((m: any) => !m.deleted);
    data.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
    callback(data);
  });
};

export interface CommentEntry {
  text: string;
  date: string;
  author: string;
}

export const addRecordComment = async (
  id: string,
  type: 'volunteer' | 'internship' | 'contact' | 'complaint',
  commentText: string,
  author: string = "Admin"
): Promise<CommentEntry> => {
  const collectionName = type === 'contact' ? 'contacts' : type === 'complaint' ? 'complaints' : 'volunteers';
  const newComment: CommentEntry = {
    text: commentText,
    date: new Date().toISOString(),
    author: author
  };

  if (isMockEnabled) {
    await delay(100);
    const storageKey = type === 'contact' ? 'day_contacts' : type === 'complaint' ? 'day_complaints' : 'day_volunteers';
    const data = localStorage.getItem(storageKey);
    const list = data ? JSON.parse(data) : [];
    const index = list.findIndex((item: any) => item.id === id);
    if (index !== -1) {
      if (!list[index].comments) list[index].comments = [];
      list[index].comments.push(newComment);
      list[index].adminComment = commentText;
      localStorage.setItem(storageKey, JSON.stringify(list));
    }
    return newComment;
  }

  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, {
    comments: arrayUnion(newComment),
    adminComment: commentText
  });

  const safeDateKey = newComment.date.replace(/[\.\#\$\[\]]/g, "_");
  await set(ref(rtdb, `${collectionName}/${id}/comments/${safeDateKey}`), newComment);
  await set(ref(rtdb, `${collectionName}/${id}/adminComment`), commentText);

  return newComment;
};

export const updateRecordComment = async (
  id: string,
  type: 'volunteer' | 'internship' | 'contact' | 'complaint',
  comment: string
): Promise<void> => {
  await addRecordComment(id, type, comment);
};

export const updateContactStatus = async (
  id: string,
  status: 'pending' | 'reviewed' | 'resolved',
  comment: string
): Promise<void> => {
  await addRecordComment(id, 'contact', comment);
  
  if (isMockEnabled) {
    await delay(100);
    const data = localStorage.getItem("day_contacts");
    const list = data ? JSON.parse(data) : [];
    const index = list.findIndex((item: any) => item.id === id);
    if (index !== -1) {
      list[index].status = status;
      localStorage.setItem("day_contacts", JSON.stringify(list));
    }
    return;
  }

  const docRef = doc(db, "contacts", id);
  await updateDoc(docRef, { status });
  await set(ref(rtdb, `contacts/${id}/status`), status);
};

export interface Complaint {
  id?: string;
  name: string;
  email: string;
  phone: string;
  complaintType: string;
  membershipId: string;
  issue: string;
  createdAt?: string;
  ticketNo?: string;
  status?: 'pending' | 'reviewed' | 'resolved';
  adminComment?: string;
  comments?: any[];
}

export const createComplaint = async (complaint: Omit<Complaint, "id" | "createdAt">): Promise<Complaint> => {
  const tNo = generateTicketNo('CMP');
  const fullComplaint = {
    ...complaint,
    createdAt: new Date().toISOString(),
    ticketNo: tNo,
    status: 'pending' as const,
    adminComment: ""
  };

  if (isMockEnabled) {
    await delay(500);
    const data = localStorage.getItem("day_complaints");
    const complaints: Complaint[] = data ? JSON.parse(data) : [];
    const newComplaint: Complaint = {
      ...fullComplaint,
      id: "cmp-" + Date.now()
    };
    complaints.unshift(newComplaint);
    localStorage.setItem("day_complaints", JSON.stringify(complaints));
    return newComplaint;
  }

  const docRef = await addDoc(collection(db, "complaints"), fullComplaint);
  await set(ref(rtdb, `complaints/${docRef.id}`), fullComplaint);
  return { id: docRef.id, ...fullComplaint } as Complaint;
};

export const subscribeComplaints = (callback: (complaints: Complaint[]) => void) => {
  if (isMockEnabled) {
    const handler = () => {
      const data = localStorage.getItem("day_complaints");
      const list = data ? JSON.parse(data) : [];
      callback(list.filter((c: any) => !c.deleted));
    };
    window.addEventListener("storage", handler);
    const interval = setInterval(handler, 1000);
    handler();
    return () => {
      window.removeEventListener("storage", handler);
      clearInterval(interval);
    };
  }

  const complaintsRef = ref(rtdb, "complaints");
  return onValue(complaintsRef, (snapshot) => {
    const val = snapshot.val();
    if (!val) {
      callback([]);
      return;
    }
    const data = Object.entries(val)
      .map(([id, item]: [string, any]) => ({ id, ...item }))
      .filter((c: any) => !c.deleted);
    data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(data);
  });
};

export const deleteComplaint = async (id: string): Promise<void> => {
  if (isMockEnabled) {
    await delay(300);
    const data = localStorage.getItem("day_complaints");
    const complaints: Complaint[] = data ? JSON.parse(data) : [];
    const updated = complaints.map(c => c.id === id ? { ...c, deleted: true, deletedAt: new Date().toISOString() } as any : c);
    localStorage.setItem("day_complaints", JSON.stringify(updated));
    return;
  }

  const docRef = doc(db, "complaints", id);
  await updateDoc(docRef, { deleted: true, deletedAt: new Date().toISOString() });
  await set(ref(rtdb, `complaints/${id}/deleted`), true);
  await set(ref(rtdb, `complaints/${id}/deletedAt`), new Date().toISOString());
};

export const updateComplaintStatus = async (
  id: string,
  status: 'pending' | 'reviewed' | 'resolved',
  comment: string
): Promise<void> => {
  await addRecordComment(id, 'complaint', comment);
  
  if (isMockEnabled) {
    await delay(100);
    const data = localStorage.getItem("day_complaints");
    const list = data ? JSON.parse(data) : [];
    const index = list.findIndex((item: any) => item.id === id);
    if (index !== -1) {
      list[index].status = status;
      localStorage.setItem("day_complaints", JSON.stringify(list));
    }
    return;
  }

  const docRef = doc(db, "complaints", id);
  await updateDoc(docRef, { status });
  await set(ref(rtdb, `complaints/${id}/status`), status);
};

export const getComplaints = async (): Promise<Complaint[]> => {
  if (isMockEnabled) {
    const data = localStorage.getItem("day_complaints");
    return data ? JSON.parse(data) : [];
  }
  const querySnapshot = await getDocs(collection(db, "complaints"));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Complaint));
};

export const getContactMessages = async (): Promise<ContactMessage[]> => {
  if (isMockEnabled) {
    const data = localStorage.getItem("day_contacts");
    return data ? JSON.parse(data) : [];
  }
  const querySnapshot = await getDocs(collection(db, "contacts"));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContactMessage));
};

export const lookupByTicketNo = async (
  ticketNo: string
): Promise<{ type: 'volunteer' | 'internship' | 'contact' | 'complaint'; data: any } | null> => {
  const cleanTicket = ticketNo.trim().toUpperCase();
  
  // Search in volunteers
  const volunteers = await getVolunteers();
  const foundVol = volunteers.find(
    v => (v.ticketNo && v.ticketNo.toUpperCase() === cleanTicket) || 
         (v.tempInternshipId && v.tempInternshipId.toUpperCase() === cleanTicket)
  );
  if (foundVol) {
    return {
      type: foundVol.type === 'internship' ? 'internship' : 'volunteer',
      data: foundVol
    };
  }

  // Search in contacts
  const contacts = await getContactMessages();
  const foundContact = contacts.find(
    c => c.ticketNo && c.ticketNo.toUpperCase() === cleanTicket
  );
  if (foundContact) {
    return {
      type: 'contact',
      data: foundContact
    };
  }

  // Search in complaints
  const complaints = await getComplaints();
  const foundComplaint = complaints.find(
    c => c.ticketNo && c.ticketNo.toUpperCase() === cleanTicket
  );
  if (foundComplaint) {
    return {
      type: 'complaint',
      data: foundComplaint
    };
  }

  return null;
};

export const lookupDonation = async (
  donorName: string,
  extraQuery: string
): Promise<Donation[]> => {
  const cleanName = donorName.trim().toLowerCase();
  const cleanExtra = extraQuery.trim().toLowerCase();
  if (!cleanName && !cleanExtra) return [];

  const list = await getDonations();
  
  return list.filter(d => {
    const nameMatch = cleanName ? (
      (d.donorName && d.donorName.toLowerCase().includes(cleanName)) ||
      (d.donorEmail && d.donorEmail.toLowerCase().includes(cleanName))
    ) : true;

    const extraMatch = cleanExtra ? (
      (d.transactionId && d.transactionId.toLowerCase().includes(cleanExtra)) ||
      (d.id && d.id.toLowerCase().includes(cleanExtra)) ||
      (d.donorPhone && d.donorPhone.toLowerCase().includes(cleanExtra)) ||
      (d.donorEmail && d.donorEmail.toLowerCase().includes(cleanExtra)) ||
      (d.donorName && d.donorName.toLowerCase().includes(cleanExtra))
    ) : true;

    if (cleanName && cleanExtra) {
      return nameMatch && extraMatch;
    }
    return cleanName ? nameMatch : extraMatch;
  });
};



/* ─── Global Default Design Layout (classic / alternative) ─── */
export const subscribeDefaultDesignLayout = (callback: (layout: string) => void) => {
  if (isMockEnabled || !rtdb) {
    // Fallback to localStorage if Firebase is not available
    const layout = localStorage.getItem("day_default_design_layout") || "classic";
    callback(layout);
    return () => {};
  }

  const layoutRef = ref(rtdb, "settings/default_design_layout");
  return onValue(layoutRef, (snapshot) => {
    const val = snapshot.val();
    callback(val || "classic");
  });
};

export const setDefaultDesignLayout = async (layout: string): Promise<void> => {
  if (isMockEnabled || !rtdb) {
    localStorage.setItem("day_default_design_layout", layout);
    window.dispatchEvent(new Event("storage"));
    return;
  }
  await set(ref(rtdb, "settings/default_design_layout"), layout);
};

/* ─── Realtime Analytics (Visitors & Reach) ─── */
export const incrementVisitorCount = async (): Promise<void> => {
  if (isMockEnabled || !rtdb) {
    const visits = Number(localStorage.getItem("day_mock_visits") || "1428");
    localStorage.setItem("day_mock_visits", String(visits + 1));
    return;
  }
  try {
    const visitsRef = ref(rtdb, "analytics/visitors");
    const reachRef = ref(rtdb, "analytics/reach");
    
    // Increment visitor counter
    await runTransaction(visitsRef, (currentValue) => {
      return (currentValue || 0) + 1;
    });
    
    // Increment unique reach counter (simulated with 60% of total hits or runTransaction)
    await runTransaction(reachRef, (currentValue) => {
      return (currentValue || 0) + (Math.random() > 0.4 ? 1 : 0);
    });
  } catch (err) {
    console.error("Failed to increment visitor analytics:", err);
  }
};

export const subscribeAnalytics = (callback: (data: { visitors: number; reach: number }) => void) => {
  if (isMockEnabled) {
    const handler = () => {
      const visitors = Number(localStorage.getItem("day_mock_visits") || "1428");
      callback({ visitors, reach: Math.floor(visitors * 0.78) });
    };
    window.addEventListener("storage", handler);
    handler();
    return () => window.removeEventListener("storage", handler);
  }
  
  const analyticsRef = ref(rtdb, "analytics");
  return onValue(analyticsRef, (snapshot) => {
    const val = snapshot.val();
    callback({
      visitors: val?.visitors || 1428,
      reach: val?.reach || 1115
    });
  });
};

// ==========================================
// 9. TESTIMONIALS SERVICE
// ==========================================

export const getTestimonials = async (): Promise<Testimonial[]> => {
  if (isMockEnabled) {
    await delay(300);
    const data = localStorage.getItem("day_testimonials");
    const list = data ? JSON.parse(data) : [];
    return list.filter((t: any) => !t.deleted);
  }
  
  const querySnapshot = await getDocs(collection(db, "testimonials"));
  return querySnapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as Testimonial))
    .filter(t => !t.deleted);
};

export const createTestimonial = async (testimonial: Omit<Testimonial, "id" | "createdAt">): Promise<Testimonial> => {
  const fullTestimonial = {
    ...testimonial,
    createdAt: new Date().toISOString()
  };

  if (isMockEnabled) {
    await delay(500);
    const data = localStorage.getItem("day_testimonials");
    const list: Testimonial[] = data ? JSON.parse(data) : [];
    const newTestimonial: Testimonial = {
      ...fullTestimonial,
      id: "testi-" + Date.now()
    };
    list.unshift(newTestimonial);
    localStorage.setItem("day_testimonials", JSON.stringify(list));
    return newTestimonial;
  }

  const docRef = await addDoc(collection(db, "testimonials"), fullTestimonial);
  await set(ref(rtdb, `testimonials/${docRef.id}`), { id: docRef.id, ...fullTestimonial });
  return { id: docRef.id, ...fullTestimonial } as Testimonial;
};

export const updateTestimonial = async (id: string, updates: Partial<Omit<Testimonial, "id">>): Promise<void> => {
  if (isMockEnabled) {
    await delay(400);
    const data = localStorage.getItem("day_testimonials");
    const list: Testimonial[] = data ? JSON.parse(data) : [];
    const updated = list.map(t => t.id === id ? { ...t, ...updates } : t);
    localStorage.setItem("day_testimonials", JSON.stringify(updated));
    return;
  }

  const docRef = doc(db, "testimonials", id);
  await updateDoc(docRef, updates);
  for (const [key, val] of Object.entries(updates)) {
    await set(ref(rtdb, `testimonials/${id}/${key}`), val);
  }
};

export const deleteTestimonial = async (id: string): Promise<void> => {
  if (isMockEnabled) {
    await delay(400);
    const data = localStorage.getItem("day_testimonials");
    const list: Testimonial[] = data ? JSON.parse(data) : [];
    const updated = list.map(t => t.id === id ? { ...t, deleted: true, deletedAt: new Date().toISOString() } as any : t);
    localStorage.setItem("day_testimonials", JSON.stringify(updated));
    return;
  }

  const docRef = doc(db, "testimonials", id);
  await updateDoc(docRef, { deleted: true, deletedAt: new Date().toISOString() });
  await set(ref(rtdb, `testimonials/${id}/deleted`), true);
  await set(ref(rtdb, `testimonials/${id}/deletedAt`), new Date().toISOString());
};

export const subscribeTestimonials = (callback: (testimonials: Testimonial[]) => void) => {
  if (isMockEnabled) {
    const handler = () => {
      const data = localStorage.getItem("day_testimonials");
      const list: Testimonial[] = data ? JSON.parse(data) : [];
      callback(list.filter((t: any) => !t.deleted));
    };
    window.addEventListener("storage", handler);
    const interval = setInterval(handler, 1000);
    handler();
    return () => {
      window.removeEventListener("storage", handler);
      clearInterval(interval);
    };
  }

  const testimonialsRef = ref(rtdb, "testimonials");
  let seeding = false;
  return onValue(testimonialsRef, async (snapshot) => {
    const val = snapshot.val();
    if (!val) {
      if (!seeding) {
        seeding = true;
        console.log("Firebase Testimonials is empty. Auto-seeding default testimonials...");
        try {
          for (const item of defaultTestimonials) {
            const { id, ...itemData } = item;
            await setDoc(doc(db, "testimonials", id), itemData);
            await set(ref(rtdb, `testimonials/${id}`), itemData);
          }
        } catch (err) {
          console.error("Auto-seeding testimonials failed:", err);
        } finally {
          seeding = false;
        }
      }
      callback([]);
      return;
    }
    const data = Object.entries(val)
      .map(([id, item]: [string, any]) => ({ id, ...item }))
      .filter((t: any) => !t.deleted);
    callback(data);
  });
};

export const subscribeNewsletter = async (email: string): Promise<void> => {
  const cleanEmail = email.toLowerCase().trim();
  const dateStr = new Date().toISOString();

  if (isMockEnabled) {
    await delay(300);
    const data = localStorage.getItem("day_newsletter");
    const list: any[] = data ? JSON.parse(data) : [];
    if (list.some(x => x.email === cleanEmail)) {
      throw new Error("Already subscribed!");
    }
    list.push({ email: cleanEmail, createdAt: dateStr });
    localStorage.setItem("day_newsletter", JSON.stringify(list));
    return;
  }

  // Check if subscriber already exists in Firestore
  const docRef = doc(db, "newsletter", cleanEmail);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    throw new Error("Already subscribed!");
  }

  const payload = { email: cleanEmail, createdAt: dateStr };
  await setDoc(docRef, payload);
  await set(ref(rtdb, `newsletter/${cleanEmail.replace(/\./g, '_')}`), payload);
};

export interface NewsletterSubscriber {
  id?: string;
  email: string;
  createdAt: string;
}

export const subscribeNewsletterList = (callback: (subscribers: NewsletterSubscriber[]) => void) => {
  if (isMockEnabled) {
    const data = localStorage.getItem("day_newsletter");
    const list: NewsletterSubscriber[] = data ? JSON.parse(data) : [
      { id: "sub_1", email: "support@dayfoundation.in", createdAt: new Date().toISOString() },
      { id: "sub_2", email: "volunteer.lead@dayfoundation.in", createdAt: new Date().toISOString() }
    ];
    if (!data) localStorage.setItem("day_newsletter", JSON.stringify(list));
    callback(list);
    return () => {};
  }

  const newsRef = ref(rtdb, "newsletter");
  return onValue(newsRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const val = snapshot.val();
    const data = Object.entries(val).map(([key, item]: [string, any]) => ({
      id: key,
      email: item.email || key.replace(/_/g, '.'),
      createdAt: item.createdAt || new Date().toISOString()
    }));
    callback(data);
  });
};

export const deleteNewsletterSubscriber = async (email: string): Promise<void> => {
  const cleanEmail = email.toLowerCase().trim();
  if (isMockEnabled) {
    const data = localStorage.getItem("day_newsletter");
    const list: any[] = data ? JSON.parse(data) : [];
    const filtered = list.filter(x => x.email !== cleanEmail);
    localStorage.setItem("day_newsletter", JSON.stringify(filtered));
    return;
  }

  const docRef = doc(db, "newsletter", cleanEmail);
  await deleteDoc(docRef);
  await set(ref(rtdb, `newsletter/${cleanEmail.replace(/\./g, '_')}`), null);
};

export const getNewsletterSubscribers = async (): Promise<string[]> => {
  if (isMockEnabled) {
    const data = localStorage.getItem("day_newsletter");
    const list = data ? JSON.parse(data) : [];
    return list.map((x: any) => x.email);
  }

  const snap = await getDocs(collection(db, "newsletter"));
  return snap.docs.map(d => d.data().email);
};

// ==========================================
// 10. SEO SETTINGS SERVICE
// ==========================================

export interface SeoPageSetting {
  path: string;           // e.g. "/" | "/about" | "/donate"
  title: string;
  description: string;
  keywords: string;
  ogImage?: string;       // full URL to OG image
  canonical?: string;     // canonical URL override
  updatedAt?: string;
}

export const getSeoSettings = async (): Promise<SeoPageSetting[]> => {
  if (isMockEnabled || !db) {
    const data = localStorage.getItem("day_seo_settings");
    return data ? JSON.parse(data) : [];
  }
  const snap = await getDocs(collection(db, "seo_settings"));
  return snap.docs.map(d => {
    const data = d.data() as Omit<SeoPageSetting, "path">;
    const path = d.data().path || (d.id === "page-home" ? "/" : "/" + d.id.replace("page-", ""));
    return { path, ...data } as SeoPageSetting;
  });
};

export const setSeoSetting = async (setting: SeoPageSetting): Promise<void> => {
  const cleanPathName = setting.path.replace(/\//g, "").trim() || "home";
  const docId = `page-${cleanPathName}`;
  const payload = { ...setting, updatedAt: new Date().toISOString() };
  if (isMockEnabled || !db) {
    const data = localStorage.getItem("day_seo_settings");
    const list: SeoPageSetting[] = data ? JSON.parse(data) : [];
    const idx = list.findIndex(s => s.path === setting.path);
    if (idx >= 0) list[idx] = payload; else list.push(payload);
    localStorage.setItem("day_seo_settings", JSON.stringify(list));
    window.dispatchEvent(new Event("storage"));
    return;
  }
  await setDoc(doc(db, "seo_settings", docId), payload);
};

export const subscribeSeoSettings = (callback: (settings: SeoPageSetting[]) => void) => {
  if (isMockEnabled || !db) {
    const handler = () => {
      const data = localStorage.getItem("day_seo_settings");
      callback(data ? JSON.parse(data) : []);
    };
    window.addEventListener("storage", handler);
    handler();
    return () => window.removeEventListener("storage", handler);
  }
  const colRef = collection(db, "seo_settings");
  return onSnapshot(colRef, (snap) => {
    const settings = snap.docs.map(d => {
      const data = d.data() as Omit<SeoPageSetting, "path">;
      const path = d.data().path || (d.id === "page-home" ? "/" : "/" + d.id.replace("page-", ""));
      return { path, ...data } as SeoPageSetting;
    });
    callback(settings);
  });
};
// ==========================================
// 11. RECYCLE BIN & RESTORATION SERVICE
// ==========================================

export interface RecycleBinItem {
  id: string;
  collectionName: string;
  categoryName: string; // e.g. "Volunteer", "Internship", "Donation", "Blog", "Event", etc.
  title: string;
  deletedAt: string;
  expiresAt: string; // 30 days from deletedAt
  data: any;
}

export const restoreRecord = async (collectionName: string, id: string): Promise<void> => {
  if (isMockEnabled || !db) {
    await delay(300);
    const key = `day_${collectionName}`;
    const data = localStorage.getItem(key);
    if (data) {
      const items: any[] = JSON.parse(data);
      const updated = items.map(item => item.id === id ? { ...item, deleted: false, deletedAt: null } : item);
      localStorage.setItem(key, JSON.stringify(updated));
    }
    return;
  }

  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, { deleted: false, deletedAt: null });
  await set(ref(rtdb, `${collectionName}/${id}/deleted`), false);
  await set(ref(rtdb, `${collectionName}/${id}/deletedAt`), null);
};

export const subscribeRecycleBin = (callback: (items: (RecycleBinItem & { daysLeft: number })[]) => void) => {
  if (isMockEnabled || !rtdb) {
    const handler = () => {
      const collections = [
        { key: "day_volunteers", col: "volunteers", category: "Volunteer", titleField: "name" },
        { key: "day_donations", col: "donations", category: "Donation", titleField: "donorName" },
        { key: "day_blogs", col: "blogs", category: "Blog", titleField: "title" },
        { key: "day_events", col: "events", category: "Event", titleField: "title" },
        { key: "day_gallery", col: "gallery", category: "Gallery Item", titleField: "title" },
        { key: "day_team", col: "team", category: "Team Member", titleField: "name" },
        { key: "day_city_members", col: "city_team", category: "City Team Member", titleField: "name" },
        { key: "day_testimonials", col: "testimonials", category: "Testimonial", titleField: "name" },
        { key: "day_contacts", col: "contacts", category: "Contact Message", titleField: "name" },
        { key: "day_complaints", col: "complaints", category: "Complaint", titleField: "name" },
      ];
      const now = new Date().getTime();
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      const allDeleted: any[] = [];

      collections.forEach(({ key, col, category, titleField }) => {
        const raw = localStorage.getItem(key);
        if (raw) {
          const list: any[] = JSON.parse(raw);
          list.forEach(item => {
            if (item.deleted && item.deletedAt) {
              const diff = now - new Date(item.deletedAt).getTime();
              if (diff <= thirtyDaysMs) {
                const daysLeft = Math.max(0, 30 - Math.floor(diff / (1000 * 60 * 60 * 24)));
                const resolvedCat = category === "Volunteer" && item.type === 'internship' ? "Internship" : category;
                allDeleted.push({
                  id: item.id,
                  collectionName: col,
                  categoryName: resolvedCat,
                  title: item[titleField] || item.name || item.title || item.subject || item.donorName || "Untitled Record",
                  deletedAt: item.deletedAt,
                  expiresAt: new Date(new Date(item.deletedAt).getTime() + thirtyDaysMs).toISOString(),
                  data: item,
                  daysLeft
                });
              }
            }
          });
        }
      });
      allDeleted.sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());
      callback(allDeleted);
    };
    window.addEventListener("storage", handler);
    const interval = setInterval(handler, 1000);
    handler();
    return () => {
      window.removeEventListener("storage", handler);
      clearInterval(interval);
    };
  }

  const nodes = [
    { path: "volunteers", col: "volunteers", category: "Volunteer", titleField: "name" },
    { path: "donations", col: "donations", category: "Donation", titleField: "donorName" },
    { path: "contacts", col: "contacts", category: "Contact Message", titleField: "name" },
    { path: "blogs", col: "blogs", category: "Blog", titleField: "title" },
    { path: "events", col: "events", category: "Event", titleField: "title" },
    { path: "gallery", col: "gallery", category: "Gallery Item", titleField: "title" },
    { path: "team", col: "team", category: "Team Member", titleField: "name" },
    { path: "city_team", col: "city_team", category: "City Team Member", titleField: "name" },
    { path: "testimonials", col: "testimonials", category: "Testimonial", titleField: "name" },
    { path: "complaints", col: "complaints", category: "Complaint", titleField: "name" },
  ];

  const currentDeletedMap: { [key: string]: any } = {};

  const unsubscribes = nodes.map(node => {
    const rtdbRef = ref(rtdb, node.path);
    return onValue(rtdbRef, (snapshot) => {
      const val = snapshot.val();
      const now = new Date().getTime();
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

      Object.keys(currentDeletedMap).forEach(k => {
        if (k.startsWith(`${node.col}_`)) delete currentDeletedMap[k];
      });

      if (val) {
        Object.entries(val).forEach(([id, item]: [string, any]) => {
          if (item.deleted && item.deletedAt) {
            const diff = now - new Date(item.deletedAt).getTime();
            if (diff <= thirtyDaysMs) {
              const daysLeft = Math.max(0, 30 - Math.floor(diff / (1000 * 60 * 60 * 24)));
              const resolvedCat = node.category === "Volunteer" && item.type === 'internship' ? "Internship" : node.category;
              
              currentDeletedMap[`${node.col}_${id}`] = {
                id,
                collectionName: node.col,
                categoryName: resolvedCat,
                title: item[node.titleField] || item.name || item.title || item.subject || item.donorName || "Untitled Record",
                deletedAt: item.deletedAt,
                expiresAt: new Date(new Date(item.deletedAt).getTime() + thirtyDaysMs).toISOString(),
                data: item,
                daysLeft
              };
            }
          }
        });
      }

      const list = Object.values(currentDeletedMap);
      list.sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());
      callback(list);
    });
  });

  return () => {
    unsubscribes.forEach(unsub => unsub());
  };
};

// ==========================================
// 12. UNIVERSAL EDIT & VISIBILITY TOGGLE HELPERS
// ==========================================

export const toggleRecordVisibility = async (collectionName: string, id: string, currentHiddenStatus: boolean): Promise<boolean> => {
  const newStatus = !currentHiddenStatus;
  if (isMockEnabled || !db) {
    await delay(200);
    const key = `day_${collectionName}`;
    const data = localStorage.getItem(key);
    if (data) {
      const items: any[] = JSON.parse(data);
      const updated = items.map(item => item.id === id ? { ...item, hidden: newStatus } : item);
      localStorage.setItem(key, JSON.stringify(updated));
    }
    return newStatus;
  }

  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, { hidden: newStatus });
  await set(ref(rtdb, `${collectionName}/${id}/hidden`), newStatus);
  return newStatus;
};

export const updateBlog = async (id: string, updates: Partial<Omit<Blog, "id">>): Promise<void> => {
  if (isMockEnabled || !db) {
    await delay(300);
    const data = localStorage.getItem("day_blogs");
    const blogs: Blog[] = data ? JSON.parse(data) : [];
    const updated = blogs.map(b => b.id === id ? { ...b, ...updates } : b);
    localStorage.setItem("day_blogs", JSON.stringify(updated));
    return;
  }

  const docRef = doc(db, "blogs", id);
  await updateDoc(docRef, updates);
  for (const [key, val] of Object.entries(updates)) {
    await set(ref(rtdb, `blogs/${id}/${key}`), val);
  }
};

export const updateDonationRecord = async (id: string, updates: Partial<Omit<Donation, "id">>): Promise<void> => {
  if (isMockEnabled || !db) {
    await delay(300);
    const data = localStorage.getItem("day_donations");
    const donations: Donation[] = data ? JSON.parse(data) : [];
    const updated = donations.map(d => d.id === id ? { ...d, ...updates } : d);
    localStorage.setItem("day_donations", JSON.stringify(updated));
    return;
  }

  const docRef = doc(db, "donations", id);
  await updateDoc(docRef, updates);
  for (const [key, val] of Object.entries(updates)) {
    await set(ref(rtdb, `donations/${id}/${key}`), val);
  }
};

export const fileToCompressedBase64 = (file: File, maxWidth = 1200, quality = 0.82): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (file.size <= 200 * 1024) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

export const saveCardImageToFirestore = async (imgKey: string, url: string): Promise<void> => {
  localStorage.setItem(`card_img_${imgKey}`, url);

  if (db) {
    try {
      const docRef = doc(db, "card_images", imgKey);
      await setDoc(docRef, { url, updatedAt: Date.now() }, { merge: true });
    } catch (err) {
      console.warn("Firestore card_images save warn:", err);
    }
  }

  if (rtdb) {
    try {
      const rtdbRef = ref(rtdb, `card_images/${imgKey}`);
      await set(rtdbRef, url);
    } catch (err) {
      console.warn("RTDB card_images save warn:", err);
    }
  }
};

export const subscribeCardImages = (callback: (imagesMap: Record<string, string>) => void): (() => void) => {
  const localMap: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("card_img_")) {
      const imgKey = key.replace("card_img_", "");
      localMap[imgKey] = localStorage.getItem(key) || "";
    }
  }
  if (Object.keys(localMap).length > 0) {
    callback(localMap);
  }

  if (!db) {
    return () => {};
  }

  const colRef = collection(db, "card_images");
  return onSnapshot(colRef, (snapshot) => {
    const map: Record<string, string> = { ...localMap };
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data && data.url) {
        map[docSnap.id] = data.url;
        localStorage.setItem(`card_img_${docSnap.id}`, data.url);
      }
    });
    callback(map);
  }, (err) => {
    console.warn("Firestore subscribeCardImages warn:", err);
  });
};

export const useCardImages = () => {
  const [imagesMap, setImagesMap] = useState<Record<string, string>>(() => {
    const localMap: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("card_img_")) {
        const imgKey = key.replace("card_img_", "");
        localMap[imgKey] = localStorage.getItem(key) || "";
      }
    }
    return localMap;
  });

  useEffect(() => {
    const unsub = subscribeCardImages((map) => {
      setImagesMap(map);
    });
    return () => unsub();
  }, []);

  const getCardImg = (key: string, defaultPath: string): string => {
    return imagesMap[key] || defaultPath;
  };

  return { imagesMap, getCardImg };
};

