import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, setDoc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
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

console.log("Connecting to Firebase project:", firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const rtdb = getDatabase(app);

const defaultBlogs = [
  {
    title: "Empowering Underprivileged Children Through Learning Circles",
    summary: "Education is one of the most powerful tools for breaking the cycle of poverty and creating opportunities for a better future.",
    content: "Education is one of the most powerful tools for breaking the cycle of poverty and creating opportunities for a better future. At DAY Foundation, we conduct weekly education drives and learning circles that provide children with academic support, interactive activities, and a safe environment to learn and grow.\n\nOur approach goes beyond textbooks. We encourage creativity, critical thinking, communication, and confidence through engaging sessions led by dedicated volunteers. By making learning enjoyable and accessible, we aim to inspire children to dream bigger and achieve their full potential.\n\nEvery Sunday, our volunteers come together with one mission—to ensure that every child has the opportunity to learn, smile, and build a brighter future.",
    coverImage: "/assets/blogs/blog-1.png",
    author: "DAY Team",
    category: "Education",
    createdAt: "2026-06-01"
  },
  {
    title: "Creating Awareness for a Better Society",
    summary: "Social change begins with awareness. DAY Foundation regularly organizes online webinars, community campaigns, and awareness initiatives.",
    content: "Social change begins with awareness. DAY Foundation regularly organizes online webinars, community campaigns, and awareness initiatives on topics such as education, healthcare, mental health, inclusion, youth empowerment, and community development.\n\nOur objective is to provide reliable information, encourage meaningful discussions, and inspire positive action. By connecting experts, volunteers, and community members, we strive to build a society that is informed, compassionate, and inclusive.\n\nAwareness is not just about sharing knowledge—it is about empowering people to make better decisions for themselves and their communities.",
    coverImage: "/assets/blogs/blog-2.png",
    author: "DAY Team",
    category: "Awareness",
    createdAt: "2026-06-02"
  },
  {
    title: "Internship Program: Learn Through Social Impact",
    summary: "DAY Foundation offers both online and offline internship programs designed for students and young professionals who want practical experience.",
    content: "DAY Foundation offers both online and offline internship programs designed for students and young professionals who want practical experience in the social sector.\n\nOur internships are currently unpaid and focus on skill development, leadership, and community engagement rather than routine office work. Depending on the program, interns may work on:\n\n- Sponsorship research and outreach\n- Public relations and awareness campaigns\n- Crowdfunding initiatives\n- LinkedIn networking and professional outreach\n- Research and documentation\n- Community engagement activities\n- Offline social drives and event exposure\n\nUpon successful completion, interns receive certificates recognizing their contribution and learning experience. The program is designed to help participants build confidence, communication skills, teamwork, and a deeper understanding of social development.",
    coverImage: "/assets/blogs/blog-3.png",
    author: "DAY Team",
    category: "Internship",
    createdAt: "2026-06-03"
  },
  {
    title: "Our Work Structure and Management System",
    summary: "DAY Foundation believes that sustainable social impact requires a strong organizational structure and accountability.",
    content: "DAY Foundation believes that sustainable social impact requires a strong organizational structure and accountability.\n\nOur management follows a hierarchical system consisting of:\n\n- Central Management\n- City Leadership\n- City Management Teams\n- Internal Management Teams\n- Volunteers and Interns\n\nEach leadership position operates under defined responsibilities, tenure guidelines, and confidentiality standards to ensure professionalism, transparency, and efficient execution of projects.\n\nThis structured approach enables us to coordinate activities across multiple cities while maintaining quality, discipline, and effective teamwork.",
    coverImage: "/assets/blogs/blog-4.png",
    author: "DAY Team",
    category: "Structure",
    createdAt: "2026-06-04"
  },
  {
    title: "Our Future Initiatives",
    summary: "As DAY Foundation continues to grow, we are expanding our mission to address more dimensions of social development.",
    content: "As DAY Foundation continues to grow, we are expanding our mission to address more dimensions of social development.\n\nOur upcoming initiatives include:\n\n### DAY Rojgar\n\nAn employment and livelihood initiative focused on career guidance, skill development, internships, and connecting young people with opportunities that improve employability.\n\n### Mental Health Support\n\nAn online platform dedicated to promoting mental well-being through awareness sessions, educational resources, and accessible support initiatives aimed at reducing stigma and encouraging help-seeking behavior.\n\n### Expanding Community Impact\n\nWe also plan to strengthen our education programs, healthcare initiatives, community engagement events, and distribution drives while expanding our presence to more cities across India.\n\nOur vision is to create an ecosystem where education, healthcare, employment, and social inclusion work together to build stronger and more empowered communities.",
    coverImage: "/assets/blogs/blog-5.png",
    author: "DAY Team",
    category: "Future Initiatives",
    createdAt: "2026-06-05"
  }
];

const defaultEvents = [
  {
    title: "Slum School Digital Literacy Boot Camp",
    description: "An intensive weekend program introducing children to modern computers, basic office tools, and internet safety guidelines.",
    date: "2026-06-12",
    location: "Patel Nagar Community Hall, Jabalpur",
    coverImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800",
    category: "Education",
    status: "upcoming"
  },
  {
    title: "Indore Community Healthcare & Welfare Drive",
    description: "Collaborative healthcare camp featuring free vitals screening, wellness advice, and distribution of preventative health packs.",
    date: "2026-06-20",
    location: "Sukhliya Slum Area, Indore",
    coverImage: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800",
    category: "Healthcare",
    status: "upcoming"
  },
  {
    title: "Jabalpur Care and Aid Camp",
    description: "Distribution of hygiene kits, clothes, and learning materials to 300+ children living in remote clusters.",
    date: "2026-05-10",
    location: "Adhartal Slum Clusters, Jabalpur",
    coverImage: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800",
    category: "Welfare",
    status: "past"
  }
];

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
const defaultGallery = galleryFiles.map((file, idx) => ({
  imageUrl: `/assets/gallery/${file}`,
  title: `DAY Drive Activity #${idx + 1}`,
  category: categories[idx % categories.length],
  createdAt: "2026-06-16"
}));

const defaultVolunteers = [
  {
    name: "Aman Verma",
    email: "aman@gmail.com",
    phone: "9876543210",
    city: "Delhi",
    age: 21,
    motivation: "I want to apply my legal knowledge to help spread awareness of government schemes in backward areas.",
    status: "approved",
    createdAt: "2026-05-22T10:15:30Z"
  },
  {
    name: "Riya Gupta",
    email: "riya@gmail.com",
    phone: "8765432109",
    city: "Indore",
    age: 20,
    motivation: "Keen to spend my summer teaching English and primary math to kids at learning centers.",
    status: "pending",
    createdAt: "2026-05-24T14:22:45Z"
  }
];

const defaultDonations = [
  {
    donorName: "Vikram Malhotra",
    donorEmail: "vikram@gmail.com",
    donorPhone: "9988776655",
    amount: 5000,
    purpose: "Slum Children Digital Literacy",
    transactionId: "pay_MOCK12345678",
    status: "success",
    createdAt: "2026-05-24T09:12:00Z"
  },
  {
    donorName: "Sneha Reddy",
    donorEmail: "sneha@gmail.com",
    donorPhone: "7766554433",
    amount: 2500,
    purpose: "Project Rojgar Sewing Machines",
    transactionId: "pay_MOCK87654321",
    status: "success",
    createdAt: "2026-05-26T16:45:10Z"
  }
];

const defaultTeam = [
  {
    name: "Om Sen",
    role: "Founder & Executive Director",
    bio: "Co-founded and directs the administrative, financial, and strategic growth of the foundation since 2022. Establishes core governance standards.",
    image: "/assets/teams/om sen.jpeg",
    linkedin: "https://www.linkedin.com/in/om-sen-110531229",
    email: "Info.omsen@gmail.com",
    order: 1
  },
  {
    name: "Niharika Vasvani",
    role: "Head of Human Resources",
    bio: "Co-manages candidate screenings, volunteer tracking, and structures coordinates for on-ground youth chapters.",
    image: "/assets/teams/niharika.jpeg",
    linkedin: "https://www.linkedin.com/in/niharika-vasvani-1b8381274",
    email: "Hr@dayfoundation.in",
    order: 2
  },
  {
    name: "Aditi Tiwari",
    role: "Head of Development and Program",
    bio: "Designs and drives the curriculum for Slum School Learning Circles and structures Project Chetna health drives.",
    image: "/assets/teams/aditi.jpeg",
    linkedin: "https://www.linkedin.com/in/aditi-tiwari21",
    email: "Info@dayfoundation.in",
    order: 3
  },
  {
    name: "Khushali Takk",
    role: "Head of Finance and Hiring",
    bio: "Audits operational budgets, monitors donations, and handles strategic recruitment for the administrative teams.",
    image: "/assets/teams/kaushali tak.jpeg",
    linkedin: "https://www.linkedin.com/in/adv-khushali-tak-0aa291209",
    email: "support@dayfoundation.in",
    order: 4
  },
  {
    name: "Radhika Umre",
    role: "Head Of Social Media",
    bio: "Coordinates graphics, visuals, and outreach content across Instagram, LinkedIn, and Facebook to amplify social impact.",
    image: "/assets/teams/radhika.jpeg",
    linkedin: "https://www.linkedin.com/in/radhika-umre-219a1a231/",
    email: "connect@dayfoundation.in",
    order: 5
  },
  {
    name: "Shubhra Jain Garhawal",
    role: "Head of Legal and Communication",
    bio: "Directs legal compliance, communication strategy, and organizational policies to ensure transparent operations.",
    image: "/assets/teams/shubhra.jpeg",
    linkedin: "https://www.linkedin.com/in/shubhra-jain-garhawal-32993828a",
    email: "legal@dayfoundation.in",
    order: 6
  }
];

const defaultCityTeam = [
  {
    name: "Vinayak Khandelwal",
    role: "Management Coordinator Jabalpur",
    dayId: "1DAY/068178/JLR/143",
    email: "vinayakkhandelwal701@gmail.com",
    linkedin: "",
    image: "/assets/VOLUN/VINAYAK.jpeg",
    order: 1,
    hidden: false
  },
  {
    name: "Akshat Reja",
    role: "Management Coordinator Indore",
    dayId: "NA",
    email: "akshatreja@gmail.com",
    linkedin: "https://www.linkedin.com/in/akshat-reja-625250345",
    image: "/assets/VOLUN/akshat.jpeg",
    order: 2,
    hidden: false
  },
  {
    name: "Aanshi Chauhan",
    role: "City Representative Jabalpur",
    dayId: "DAY/068178/JLR/003",
    email: "aanshichouhan1@gmail.com",
    linkedin: "https://www.linkedin.com/in/aanshi-chouhan-4356a4280",
    image: "/assets/VOLUN/AANSHI.jpeg",
    order: 3,
    hidden: false
  },
  {
    name: "Adarsh Shrinivas",
    role: "City Representative Indore",
    dayId: "DAY/068178/IDR/341",
    email: "adarshshrivansh32@gmail.com",
    linkedin: "",
    image: "/assets/VOLUN/AADARSH.jpeg",
    order: 4,
    hidden: false
  },
  {
    name: "Himanshi",
    role: "City Representative Delhi",
    dayId: "NA",
    email: "himanshisingh1511@gmail.com",
    linkedin: "https://www.linkedin.com/in/himan-shi-80718a280",
    image: "/assets/VOLUN/HIMANSHI.jpeg",
    order: 5,
    hidden: false
  },
  {
    name: "Khushi Bhatia",
    role: "Co City Representative Indore",
    dayId: "DAY/068178/IDR/248",
    email: "khushibhatia2301@gmail.com",
    linkedin: "https://www.linkedin.com/in/khushi-bhatia-b50a33252",
    image: "/assets/VOLUN/KHUSHI.jpeg",
    order: 6,
    hidden: false
  },
  {
    name: "Aakarsh Jain",
    role: "Hiring Executive",
    dayId: "DAY/068178/JLR/169",
    email: "zeeaakarshjain1872@gmail.com",
    linkedin: "https://www.linkedin.com/in/aakarsh-jain-9a8346410",
    image: "/assets/VOLUN/AAKARSH.jpeg",
    order: 7,
    hidden: false
  }
];

const defaultTestimonials = [
  {
    name: "Teshu Namdev",
    role: "Campaign Management Intern, Indore",
    quote: "My internship with DAY Foundation was a deeply enriching and purpose-driven experience. Being part of initiatives like crowdfunding, project pitching, sponsorship research and campaign planning allowed me to witness how small, collective youth efforts can create a powerful, immediate social impact.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
    createdAt: new Date().toISOString()
  },
  {
    name: "Kushagra Jain",
    role: "Public Relations & Marketing Intern",
    quote: "My 15-day internship with DAY Foundation was an incredible learning experience. I researched Self-Help Groups and subsidized education, worked on Project Muskan — creating a custom crowdfunding pitch, video, and graphics — and explored PR. This significantly strengthened my on-ground skills.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    createdAt: new Date().toISOString()
  },
  {
    name: "Pooja Sindhu",
    role: "Legal Aid & Advocacy Intern, Jabalpur",
    quote: "As a law student, interning with DAY Foundation has been a truly meaningful experience. The internship gave me valuable exposure to grassroots-level initiatives focused on women empowerment, access to free education for children, and spreading awareness of government welfare schemes.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    createdAt: new Date().toISOString()
  },
  {
    name: "Moulshree Sahu",
    role: "Ex City Representative, Jabalpur",
    quote: "Being a part of DAY has been a truly life changing experience. It showed me that real change doesn't always come from big actions it often begins with small acts of kindness and people who genuinely care. Every experience... every conversation... and every community initiative taught me something valuable about compassion, responsibility, and the importance of giving back. More than the work itself, it was the people and the shared purpose that left a lasting impact on me. This journey has shaped the way I see the world, helping me grow with empathy, gratitude, and a constant desire to learn and contribute wherever I can.",
    image: "/assets/VOLUN/Moulshree Sahu.jpeg",
    createdAt: new Date().toISOString()
  }
];

async function seed() {
  try {
    const auth = getAuth(app);
    console.log("Authenticating admin...");
    try {
      await signInWithEmailAndPassword(auth, "owner@dayfoundation.com", "DAY@19019");
    } catch (e) {
      if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential') {
        console.log("Owner user not found or invalid credential, attempting to create...");
        try {
          await createUserWithEmailAndPassword(auth, "owner@dayfoundation.com", "DAY@19019");
        } catch (createErr) {
          console.log("Owner creation failed:", createErr.message);
        }
      } else {
        console.log("Owner login failed:", e.message);
      }
      
      // Fallback
      if (!auth.currentUser) {
        console.log("Attempting fallback login...");
        try {
          await signInWithEmailAndPassword(auth, "mrshahidbabu@dayfoundation.in", "Shahid@19019");
        } catch (fallbackErr) {
          if (fallbackErr.code === 'auth/user-not-found' || fallbackErr.code === 'auth/invalid-credential') {
            console.log("Fallback user not found or invalid credential, attempting to create...");
            try {
              await createUserWithEmailAndPassword(auth, "mrshahidbabu@dayfoundation.in", "Shahid@19019");
            } catch (createErr) {
              throw fallbackErr;
            }
          } else {
            throw fallbackErr;
          }
        }
      }
    }
    console.log("Authenticated successfully!");

    console.log("Clearing existing blog entries...");
    await set(ref(rtdb, "blogs"), null);
    const blogsSnapshot = await getDocs(collection(db, "blogs"));
    for (const d of blogsSnapshot.docs) {
      await deleteDoc(doc(db, "blogs", d.id));
    }
    console.log("Seeding blogs...");
    for (const blog of defaultBlogs) {
      const docRef = await addDoc(collection(db, "blogs"), blog);
      await set(ref(rtdb, `blogs/${docRef.id}`), { id: docRef.id, ...blog });
    }

    console.log("Clearing existing event entries...");
    await set(ref(rtdb, "events"), null);
    const eventsSnapshot = await getDocs(collection(db, "events"));
    for (const d of eventsSnapshot.docs) {
      await deleteDoc(doc(db, "events", d.id));
    }
    console.log("Seeding events...");
    for (const event of defaultEvents) {
      const docRef = await addDoc(collection(db, "events"), event);
      await set(ref(rtdb, `events/${docRef.id}`), { id: docRef.id, ...event });
    }

    console.log("Clearing existing gallery entries...");
    await set(ref(rtdb, "gallery"), null);
    const gallerySnapshot = await getDocs(collection(db, "gallery"));
    for (const d of gallerySnapshot.docs) {
      await deleteDoc(doc(db, "gallery", d.id));
    }
    console.log(`Seeding gallery with ${defaultGallery.length} local photos...`);
    for (const item of defaultGallery) {
      const docRef = await addDoc(collection(db, "gallery"), item);
      await set(ref(rtdb, `gallery/${docRef.id}`), { id: docRef.id, ...item });
    }

    console.log("Skipping volunteers seeding...");
    console.log("Clearing existing team entries...");
    await set(ref(rtdb, "team"), null);
    const querySnapshot = await getDocs(collection(db, "team"));
    for (const docSnapshot of querySnapshot.docs) {
      await deleteDoc(doc(db, "team", docSnapshot.id));
    }

    console.log("Seeding team...");
    for (const member of defaultTeam) {
      const docRef = await addDoc(collection(db, "team"), member);
      await set(ref(rtdb, `team/${docRef.id}`), { id: docRef.id, ...member });
    }

    console.log("Clearing existing city_team entries...");
    await set(ref(rtdb, "city_team"), null);
    const citySnapshot = await getDocs(collection(db, "city_team"));
    for (const docSnapshot of citySnapshot.docs) {
      await deleteDoc(doc(db, "city_team", docSnapshot.id));
    }
    console.log("Seeding city_team...");
    for (const member of defaultCityTeam) {
      const docRef = await addDoc(collection(db, "city_team"), member);
      await set(ref(rtdb, `city_team/${docRef.id}`), { id: docRef.id, ...member });
    }

    console.log("Clearing existing testimonials entries...");
    await set(ref(rtdb, "testimonials"), null);
    const testimonialsSnapshot = await getDocs(collection(db, "testimonials"));
    for (const docSnapshot of testimonialsSnapshot.docs) {
      await deleteDoc(doc(db, "testimonials", docSnapshot.id));
    }
    console.log("Seeding testimonials...");
    for (const testimonial of defaultTestimonials) {
      const docRef = await addDoc(collection(db, "testimonials"), testimonial);
      await set(ref(rtdb, `testimonials/${docRef.id}`), { id: docRef.id, ...testimonial });
    }

    console.log("Seeding admin accounts & security settings...");
    await set(ref(rtdb, "admins/owner@dayfoundation_com"), { role: "owner" });
    await set(ref(rtdb, "admins/mrshahidbabu@dayfoundation_in"), { role: "owner" });
    await set(ref(rtdb, "settings/recycle_bin_password"), "DAY@19019");

    try {
      await setDoc(doc(db, "admins", "owner@dayfoundation.com"), { role: "owner" });
      await setDoc(doc(db, "admins", "mrshahidbabu@dayfoundation.in"), { role: "owner" });
      await setDoc(doc(db, "settings", "recycle_bin"), { password: "DAY@19019" });
    } catch (fsErr) {
      console.log("Firestore admin/settings rule warning (RTDB updated):", fsErr.message);
    }

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
