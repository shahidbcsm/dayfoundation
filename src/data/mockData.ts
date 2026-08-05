
export interface Blog {
  id: string;
  title: string;
  summary: string;
  content: string;
  coverImage: string;
  author: string;
  category: string;
  createdAt: string;
  deleted?: boolean;
  deletedAt?: string;
  hidden?: boolean;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  coverImage: string;
  category: string;
  status: 'upcoming' | 'past';
  deleted?: boolean;
  deletedAt?: string;
  hidden?: boolean;
}

export interface FlagshipCampaign {
  id: string;
  title: string;
  emoji: string;
  color: string;
  description: string;
  image?: string;
  deleted?: boolean;
  deletedAt?: string;
  hidden?: boolean;
}

export interface GalleryItem {
  id: string;
  imageUrl: string;
  title: string;
  category: string;
  createdAt: string;
  deleted?: boolean;
  deletedAt?: string;
  hidden?: boolean;
}

export interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  age: number;
  motivation: string;
  status: 'pending' | 'approved' | 'rejected' | 'hold';
  createdAt: string;
  // new fields
  type?: 'volunteer' | 'internship';
  college?: string;
  course?: string;
  year?: string;
  department?: string;
  phoneWhatsapp?: string;
  dob?: string;
  fatherName?: string;
  motherName?: string;
  aadharNumber?: string;
  currentDate?: string;
  preferredMode?: string;
  internshipMode?: string;
  educationStatus?: string;
  // Two-stage internship & volunteer ID system
  tempInternshipId?: string;       // Auto-assigned on submission: TEMP-DAY-YYYYMMDD-XXXX
  permanentInternshipId?: string;  // Admin-assigned on approval: DAY-INT-YYYY-NNNN
  permanentVolunteerId?: string;   // Admin-assigned on approval: DAY-VOL-YYYY-NNNN
  ticketNo?: string;
  adminComment?: string;
  comments?: any[];
  deleted?: boolean;
  deletedAt?: string;
  hidden?: boolean;
}

export interface Donation {
  id: string;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  amount: number;
  purpose: string;
  transactionId: string;
  status: 'success' | 'pending';
  createdAt: string;
  city?: string;
  internName?: string;
  internId?: string;
  donorType?: string;
  billingAddress?: string;
  message?: string;
  isAnonymous?: boolean;
  deleted?: boolean;
  deletedAt?: string;
  hidden?: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  image: string;
  createdAt?: string;
  deleted?: boolean;
  deletedAt?: string;
  hidden?: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  linkedin: string;
  email: string;
  order?: number;
  deleted?: boolean;
  deletedAt?: string;
  hidden?: boolean;
}





export const defaultBlogs: Blog[] = [
  {
    id: "blog-1",
    title: "Empowering Underprivileged Children Through Learning Circles",
    summary: "Education is one of the most powerful tools for breaking the cycle of poverty and creating opportunities for a better future.",
    content: `Education is one of the most powerful tools for breaking the cycle of poverty and creating opportunities for a better future. At DAY Foundation, we conduct weekly education drives and learning circles that provide children with academic support, interactive activities, and a safe environment to learn and grow.

Our approach goes beyond textbooks. We encourage creativity, critical thinking, communication, and confidence through engaging sessions led by dedicated volunteers. By making learning enjoyable and accessible, we aim to inspire children to dream bigger and achieve their full potential.

Every Sunday, our volunteers come together with one mission—to ensure that every child has the opportunity to learn, smile, and build a brighter future.`,
    coverImage: "/assets/blogs/blog-1.png",
    author: "DAY Team",
    category: "Education",
    createdAt: "2026-06-01"
  },
  {
    id: "blog-2",
    title: "Creating Awareness for a Better Society",
    summary: "Social change begins with awareness. DAY Foundation regularly organizes online webinars, community campaigns, and awareness initiatives.",
    content: `Social change begins with awareness. DAY Foundation regularly organizes online webinars, community campaigns, and awareness initiatives on topics such as education, healthcare, mental health, inclusion, youth empowerment, and community development.

Our objective is to provide reliable information, encourage meaningful discussions, and inspire positive action. By connecting experts, volunteers, and community members, we strive to build a society that is informed, compassionate, and inclusive.

Awareness is not just about sharing knowledge—it is about empowering people to make better decisions for themselves and their communities.`,
    coverImage: "/assets/blogs/blog-2.png",
    author: "DAY Team",
    category: "Awareness",
    createdAt: "2026-06-02"
  },
  {
    id: "blog-3",
    title: "Internship Program: Learn Through Social Impact",
    summary: "DAY Foundation offers both online and offline internship programs designed for students and young professionals who want practical experience in the social sector.",
    content: `DAY Foundation offers both online and offline internship programs designed for students and young professionals who want practical experience in the social sector.

Our internships are currently unpaid and focus on skill development, leadership, and community engagement rather than routine office work. Depending on the program, interns may work on:

- Sponsorship research and outreach
- Public relations and awareness campaigns
- Crowdfunding initiatives
- LinkedIn networking and professional outreach
- Research and documentation
- Community engagement activities
- Offline social drives and event exposure

Upon successful completion, interns receive certificates recognizing their contribution and learning experience. The program is designed to help participants build confidence, communication skills, teamwork, and a deeper understanding of social development.`,
    coverImage: "/assets/blogs/blog-3.png",
    author: "DAY Team",
    category: "Internship",
    createdAt: "2026-06-03"
  },
  {
    id: "blog-4",
    title: "Our Work Structure and Management System",
    summary: "DAY Foundation believes that sustainable social impact requires a strong organizational structure and accountability.",
    content: `DAY Foundation believes that sustainable social impact requires a strong organizational structure and accountability.

Our management follows a hierarchical system consisting of:

- Central Management
- City Leadership
- City Management Teams
- Internal Management Teams
- Volunteers and Interns

Each leadership position operates under defined responsibilities, tenure guidelines, and confidentiality standards to ensure professionalism, transparency, and efficient execution of projects.

This structured approach enables us to coordinate activities across multiple cities while maintaining quality, discipline, and effective teamwork.`,
    coverImage: "/assets/blogs/blog-4.png",
    author: "DAY Team",
    category: "Structure",
    createdAt: "2026-06-04"
  },
  {
    id: "blog-5",
    title: "Our Future Initiatives",
    summary: "As DAY Foundation continues to grow, we are expanding our mission to address more dimensions of social development.",
    content: `As DAY Foundation continues to grow, we are expanding our mission to address more dimensions of social development.

Our upcoming initiatives include:

### DAY Rojgar
An employment and livelihood initiative focused on career guidance, skill development, internships, and connecting young people with opportunities that improve employability.

### Mental Health Support
An online platform dedicated to promoting mental well-being through awareness sessions, educational resources, and accessible support initiatives aimed at reducing stigma and encouraging help-seeking behavior.

### Expanding Community Impact
We also plan to strengthen our education programs, healthcare initiatives, community engagement events, and distribution drives while expanding our presence to more cities across India.

Our vision is to create an ecosystem where education, healthcare, employment, and social inclusion work together to build stronger and more empowered communities.`,
    coverImage: "/assets/blogs/blog-5.png",
    author: "DAY Team",
    category: "Future Initiatives",
    createdAt: "2026-06-05"
  }
];

export const defaultEvents: Event[] = [
  {
    id: "event-1",
    title: "Slum School Digital Literacy Boot Camp",
    description: "An intensive weekend program introducing children to modern computers, basic office tools, and internet safety guidelines.",
    date: "2026-06-12",
    location: "Patel Nagar Community Hall, Jabalpur",
    coverImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800",
    category: "Education",
    status: "upcoming"
  },
  {
    id: "event-2",
    title: "Indore Community Healthcare & Welfare Drive",
    description: "Collaborative healthcare camp featuring free vitals screening, wellness advice, and distribution of preventative health packs.",
    date: "2026-06-20",
    location: "Sukhliya Slum Area, Indore",
    coverImage: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800",
    category: "Healthcare",
    status: "upcoming"
  },
  {
    id: "event-3",
    title: "Jabalpur Care and Aid Camp",
    description: "Distribution of hygiene kits, clothes, and learning materials to 300+ children living in remote clusters.",
    date: "2026-05-10",
    location: "Adhartal Slum Clusters, Jabalpur",
    coverImage: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800",
    category: "Welfare",
    status: "past"
  }
];

export const defaultFlagshipCampaigns: FlagshipCampaign[] = [
  {
    id: "flagship-1",
    title: "DAY Utsav",
    emoji: "🎉",
    color: "#E68952",
    description: "Our annual flagship celebration that brings together volunteers, children, partners, and supporters to celebrate our journey, recognize contributions, and strengthen our commitment to social change.",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "flagship-2",
    title: "DAY Carnival",
    emoji: "🎡",
    color: "#834a68",
    description: "DAY Carnival is a fun-filled community event featuring games, cultural activities, interactive sessions, and entertainment for children and families.",
    image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "flagship-3",
    title: "Pride Month Campaign",
    emoji: "🌈",
    color: "#8854d0",
    description: "Through awareness programs and webinars, we celebrate diversity and promote equality, dignity, and inclusion for every individual.",
    image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "flagship-4",
    title: "Garba Ke Rang, DAY Ke Sang",
    emoji: "💃",
    color: "#eb3b5a",
    description: "A festive cultural celebration that blends the spirit of Garba with the mission of social service, bringing communities together through tradition, music, and volunteering.",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "flagship-5",
    title: "Diwali DAY Wali",
    emoji: "🪔",
    color: "#f7b731",
    description: "A special Diwali celebration where we share joy with children and families through educational activities, festive programs, gifts, and community bonding.",
    image: "https://images.unsplash.com/photo-1605007493699-af65834f8a00?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "flagship-6",
    title: "New Year Celebration",
    emoji: "🎊",
    color: "#20bf6b",
    description: "We welcome the New Year by celebrating with children, volunteers, and communities through joyful activities and motivational sessions.",
    image: "https://images.unsplash.com/photo-1467810563316-b51765279379?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "flagship-7",
    title: "Community Get-Together",
    emoji: "🤝",
    color: "#05c46b",
    description: "An opportunity for volunteers, supporters, and community members to connect, collaborate, exchange ideas, and strengthen the DAY Foundation family.",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "flagship-8",
    title: "Blood Donation Camp",
    emoji: "🩸",
    color: "#ff3f34",
    description: "Our blood donation camps encourage voluntary blood donation and raise awareness about its life-saving importance, supporting healthcare institutions.",
    image: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "flagship-9",
    title: "Monthly Healthcare Drive",
    emoji: "🏥",
    color: "#00d2d3",
    description: "Conducted regularly to promote preventive healthcare through health awareness, basic check-ups, and guidance for underserved communities.",
    image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "flagship-10",
    title: "Mental Health Webinar Series",
    emoji: "🧠",
    color: "#54a0ff",
    description: "Online sessions led by experts to promote mental well-being, reduce stigma, spread awareness, and encourage individuals to seek support.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800"
  }
];

export const defaultGallery: GalleryItem[] = [
  {
    id: "gal-1",
    imageUrl: "/assets/gallery/gallery-001.jpg",
    title: "",
    category: "Education",
    createdAt: "2026-05-10"
  },
  {
    id: "gal-2",
    imageUrl: "/assets/gallery/gallery-002.jpg",
    title: "",
    category: "Healthcare",
    createdAt: "2026-05-11"
  },
  {
    id: "gal-3",
    imageUrl: "/assets/gallery/gallery-003.jpg",
    title: "",
    category: "Aid Drive",
    createdAt: "2026-05-12"
  },
  {
    id: "gal-4",
    imageUrl: "/assets/gallery/gallery-004.jpg",
    title: "",
    category: "Employment",
    createdAt: "2026-05-13"
  },
  {
    id: "gal-5",
    imageUrl: "/assets/gallery/gallery-005.jpg",
    title: "",
    category: "Team Meet",
    createdAt: "2026-05-14"
  },
  {
    id: "gal-6",
    imageUrl: "/assets/gallery/gallery-006.jpg",
    title: "",
    category: "Education",
    createdAt: "2026-05-15"
  },
  {
    id: "gal-7",
    imageUrl: "/assets/gallery/gallery-007.jpg",
    title: "",
    category: "Healthcare",
    createdAt: "2026-05-16"
  },
  {
    id: "gal-8",
    imageUrl: "/assets/gallery/gallery-008.jpg",
    title: "",
    category: "Aid Drive",
    createdAt: "2026-05-17"
  },
  {
    id: "gal-9",
    imageUrl: "/assets/gallery/gallery-009.jpg",
    title: "",
    category: "Employment",
    createdAt: "2026-05-18"
  },
  {
    id: "gal-10",
    imageUrl: "/assets/gallery/gallery-010.jpg",
    title: "",
    category: "Team Meet",
    createdAt: "2026-05-19"
  },
  {
    id: "gal-11",
    imageUrl: "/assets/gallery/gallery-011.jpg",
    title: "",
    category: "Education",
    createdAt: "2026-05-20"
  },
  {
    id: "gal-12",
    imageUrl: "/assets/gallery/gallery-012.jpg",
    title: "",
    category: "Healthcare",
    createdAt: "2026-05-21"
  },
  {
    id: "gal-13",
    imageUrl: "/assets/gallery/gallery-013.jpg",
    title: "",
    category: "Aid Drive",
    createdAt: "2026-05-22"
  },
  {
    id: "gal-14",
    imageUrl: "/assets/gallery/gallery-014.jpg",
    title: "",
    category: "Employment",
    createdAt: "2026-05-23"
  },
  {
    id: "gal-15",
    imageUrl: "/assets/gallery/gallery-015.jpg",
    title: "",
    category: "Team Meet",
    createdAt: "2026-05-24"
  },
  {
    id: "gal-16",
    imageUrl: "/assets/gallery/gallery-016.jpg",
    title: "",
    category: "Education",
    createdAt: "2026-05-25"
  },
  {
    id: "gal-17",
    imageUrl: "/assets/gallery/gallery-017.jpg",
    title: "",
    category: "Healthcare",
    createdAt: "2026-05-26"
  },
  {
    id: "gal-18",
    imageUrl: "/assets/gallery/gallery-018.jpg",
    title: "",
    category: "Aid Drive",
    createdAt: "2026-05-27"
  },
  {
    id: "gal-19",
    imageUrl: "/assets/gallery/gallery-019.jpg",
    title: "",
    category: "Employment",
    createdAt: "2026-05-28"
  },
  {
    id: "gal-20",
    imageUrl: "/assets/gallery/gallery-020.jpg",
    title: "",
    category: "Team Meet",
    createdAt: "2026-05-29"
  },
  {
    id: "gal-21",
    imageUrl: "/assets/gallery/gallery-021.jpg",
    title: "",
    category: "Education",
    createdAt: "2026-05-10"
  },
  {
    id: "gal-22",
    imageUrl: "/assets/gallery/gallery-022.jpg",
    title: "",
    category: "Healthcare",
    createdAt: "2026-05-11"
  },
  {
    id: "gal-23",
    imageUrl: "/assets/gallery/gallery-023.jpg",
    title: "",
    category: "Aid Drive",
    createdAt: "2026-05-12"
  },
  {
    id: "gal-24",
    imageUrl: "/assets/gallery/gallery-024.jpg",
    title: "",
    category: "Employment",
    createdAt: "2026-05-13"
  },
  {
    id: "gal-25",
    imageUrl: "/assets/gallery/gallery-025.jpg",
    title: "",
    category: "Team Meet",
    createdAt: "2026-05-14"
  },
  {
    id: "gal-26",
    imageUrl: "/assets/gallery/gallery-026.jpg",
    title: "",
    category: "Education",
    createdAt: "2026-05-15"
  },
  {
    id: "gal-27",
    imageUrl: "/assets/gallery/gallery-027.jpg",
    title: "",
    category: "Healthcare",
    createdAt: "2026-05-16"
  },
  {
    id: "gal-28",
    imageUrl: "/assets/gallery/gallery-028.jpg",
    title: "",
    category: "Aid Drive",
    createdAt: "2026-05-17"
  },
  {
    id: "gal-29",
    imageUrl: "/assets/gallery/gallery-029.jpg",
    title: "",
    category: "Employment",
    createdAt: "2026-05-18"
  },
  {
    id: "gal-30",
    imageUrl: "/assets/gallery/gallery-030.jpg",
    title: "",
    category: "Team Meet",
    createdAt: "2026-05-19"
  },
  {
    id: "gal-31",
    imageUrl: "/assets/gallery/gallery-031.jpg",
    title: "",
    category: "Education",
    createdAt: "2026-05-20"
  },
  {
    id: "gal-32",
    imageUrl: "/assets/gallery/gallery-032.jpg",
    title: "",
    category: "Healthcare",
    createdAt: "2026-05-21"
  },
  {
    id: "gal-33",
    imageUrl: "/assets/gallery/gallery-033.jpg",
    title: "",
    category: "Aid Drive",
    createdAt: "2026-05-22"
  },
  {
    id: "gal-34",
    imageUrl: "/assets/gallery/gallery-034.jpg",
    title: "",
    category: "Employment",
    createdAt: "2026-05-23"
  },
  {
    id: "gal-35",
    imageUrl: "/assets/gallery/gallery-035.jpg",
    title: "",
    category: "Team Meet",
    createdAt: "2026-05-24"
  },
  {
    id: "gal-36",
    imageUrl: "/assets/gallery/gallery-036.jpg",
    title: "",
    category: "Education",
    createdAt: "2026-05-25"
  },
  {
    id: "gal-37",
    imageUrl: "/assets/gallery/gallery-037.jpg",
    title: "",
    category: "Healthcare",
    createdAt: "2026-05-26"
  },
  {
    id: "gal-38",
    imageUrl: "/assets/gallery/gallery-038.jpg",
    title: "",
    category: "Aid Drive",
    createdAt: "2026-05-27"
  },
  {
    id: "gal-39",
    imageUrl: "/assets/gallery/gallery-039.jpg",
    title: "",
    category: "Employment",
    createdAt: "2026-05-28"
  },
  {
    id: "gal-40",
    imageUrl: "/assets/gallery/gallery-040.jpg",
    title: "",
    category: "Team Meet",
    createdAt: "2026-05-29"
  },
  {
    id: "gal-41",
    imageUrl: "/assets/gallery/gallery-040.jpg",
    title: "",
    category: "Education",
    createdAt: "2026-05-10"
  }
];

export const defaultVolunteers: Volunteer[] = [
  {
    id: "vol-1",
    name: "Aman Verma",
    email: "aman@gmail.com",
    phone: "9876543210",
    city: "Delhi",
    age: 21,
    motivation: "I want to apply my legal knowledge to help spread awareness of government schemes in backward areas.",
    status: "approved",
    createdAt: "2026-05-22T10:15:30Z",
    type: "volunteer"
  },
  {
    id: "vol-2",
    name: "Riya Gupta",
    email: "riya@gmail.com",
    phone: "8765432109",
    city: "Indore",
    age: 20,
    motivation: "Keen to spend my summer teaching English and primary math to kids at learning centers.",
    status: "pending",
    createdAt: "2026-05-24T14:22:45Z",
    type: "volunteer"
  },
  {
    id: "intern-1",
    name: "Kushagra Jain",
    email: "kushagra@gmail.com",
    phone: "9112233445",
    city: "Delhi",
    age: 22,
    motivation: "My 15-day internship with DAY Foundation was a meaningful learning experience. I researched SHGs and subsidised education, worked on Project Muskan.",
    status: "approved",
    createdAt: "2026-05-25T11:05:00Z",
    type: "internship",
    college: "Delhi University",
    course: "B.A. (Hons) Sociology",
    year: "3rd Year",
    department: "Public Relations"
  },
  {
    id: "intern-2",
    name: "Teshu Namdev",
    email: "teshu@gmail.com",
    phone: "8223344556",
    city: "Indore",
    age: 21,
    motivation: "Being part of crowdfunding, project pitching, and sponsorship research allowed me to witness how small efforts create a powerful social impact.",
    status: "approved",
    createdAt: "2026-05-26T16:12:00Z",
    type: "internship",
    college: "SGSITS Indore",
    course: "B.Tech Computer Science",
    year: "3rd Year",
    department: "Corporate Department"
  },
  {
    id: "intern-3",
    name: "Pooja Sindhu",
    email: "pooja.law@gmail.com",
    phone: "7334455667",
    city: "Jabalpur",
    age: 20,
    motivation: "As a law student, interning with DAY Foundation has been a truly meaningful experience. It gave me exposure to grassroots-level initiatives.",
    status: "approved",
    createdAt: "2026-05-27T09:30:00Z",
    type: "internship",
    college: "DNLU Jabalpur",
    course: "B.A. LL.B. (Hons)",
    year: "2nd Year",
    department: "Legal and Advisory"
  }
];

export const defaultDonations: Donation[] = [];




export const defaultTeam: TeamMember[] = [
  {
    id: "team-1",
    name: "Om Sen",
    role: "Founder & Executive Director",
    bio: "Co-founded and directs the administrative, financial, and strategic growth of the foundation since 2022. Establishes core governance standards.",
    image: "/assets/teams/om sen.jpeg",
    linkedin: "https://www.linkedin.com/in/om-sen-110531229",
    email: "Info.omsen@gmail.com",
    order: 1
  },
  {
    id: "team-2",
    name: "Niharika Vasvani",
    role: "Head of Human Resources",
    bio: "Co-manages candidate screenings, volunteer tracking, and structures coordinates for on-ground youth chapters.",
    image: "/assets/teams/niharika.jpeg",
    linkedin: "https://www.linkedin.com/in/niharika-vasvani-1b8381274",
    email: "Hr@dayfoundation.in",
    order: 2
  },
  {
    id: "team-3",
    name: "Aditi Tiwari",
    role: "Head of Development and Program",
    bio: "Designs and drives the curriculum for Slum School Learning Circles and structures Project Chetna health drives.",
    image: "/assets/teams/aditi.jpeg",
    linkedin: "https://www.linkedin.com/in/aditi-tiwari21",
    email: "Info@dayfoundation.in",
    order: 3
  },
  {
    id: "team-4",
    name: "Khushali Tak",
    role: "Head of Finance and Hiring",
    bio: "Audits operational budgets, monitors donations, and handles strategic recruitment for the administrative teams.",
    image: "/assets/teams/kaushali tak.jpeg",
    linkedin: "https://www.linkedin.com/in/adv-khushali-tak-0aa291209",
    email: "support@dayfoundation.in",
    order: 4
  },
  {
    id: "team-5",
    name: "Radhika Umre",
    role: "Head Of Social Media",
    bio: "Coordinates graphics, visuals, and outreach content across Instagram, LinkedIn, and Facebook to amplify social impact.",
    image: "/assets/teams/radhika.jpeg",
    linkedin: "https://www.linkedin.com/in/radhika-umre-219a1a231/",
    email: "connect@dayfoundation.in",
    order: 5
  },
  {
    id: "team-6",
    name: "Shubhra Jain Garhawal",
    role: "Head of Legal and Communication",
    bio: "Directs legal compliance, communication strategy, and organizational policies to ensure transparent operations.",
    image: "/assets/teams/shubhra.jpeg",
    linkedin: "https://www.linkedin.com/in/shubhra-jain-garhawal-32993828a",
    email: "legal@dayfoundation.in",
    order: 6
  }
];

export const defaultTestimonials: Testimonial[] = [
  {
    id: "testi-1",
    name: "Teshu Namdev",
    role: "Campaign Management Intern, Indore",
    quote: "My internship with DAY Foundation was a deeply enriching and purpose-driven experience. Being part of initiatives like crowdfunding, project pitching, sponsorship research and campaign planning allowed me to witness how small, collective youth efforts can create a powerful, immediate social impact.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
    createdAt: new Date().toISOString()
  },
  {
    id: "testi-2",
    name: "Kushagra Jain",
    role: "Public Relations & Marketing Intern",
    quote: "My 15-day internship with DAY Foundation was an incredible learning experience. I researched Self-Help Groups and subsidized education, worked on Project Muskan — creating a custom crowdfunding pitch, video, and graphics — and explored PR. This significantly strengthened my on-ground skills.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    createdAt: new Date().toISOString()
  },
  {
    id: "testi-3",
    name: "Pooja Sindhu",
    role: "Legal Aid & Advocacy Intern, Jabalpur",
    quote: "As a law student, interning with DAY Foundation has been a truly meaningful experience. The internship gave me valuable exposure to grassroots-level initiatives focused on women empowerment, access to free education for children, and spreading awareness of government welfare schemes.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    createdAt: new Date().toISOString()
  },
  {
    id: "testi-4",
    name: "Moulshree Sahu",
    role: "Ex City Representative, Jabalpur",
    quote: "Being a part of DAY has been a truly life changing experience. It showed me that real change doesn't always come from big actions it often begins with small acts of kindness and people who genuinely care. Every experience... every conversation... and every community initiative taught me something valuable about compassion, responsibility, and the importance of giving back. More than the work itself, it was the people and the shared purpose that left a lasting impact on me. This journey has shaped the way I see the world, helping me grow with empathy, gratitude, and a constant desire to learn and contribute wherever I can.",
    image: "/assets/VOLUN/Moulshree Sahu.jpeg",
    createdAt: new Date().toISOString()
  }
];

export interface CityMember {
  id: string;
  name: string;
  role: string;
  dayId: string;
  email: string;
  linkedin: string;
  image: string;
  order: number;
  hidden?: boolean;
}

export const defaultCityTeam: CityMember[] = [
  {
    id: "city-1",
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
    id: "city-2",
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
    id: "city-3",
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
    id: "city-4",
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
    id: "city-5",
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
    id: "city-6",
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
    id: "city-7",
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

