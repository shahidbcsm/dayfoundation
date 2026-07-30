
export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string;
}

// Instant local fallback SEO mappings for SEO crawl efficiency
export const fallbackSEOMap: Record<string, SEOMetadata> = {
  "/": {
    title: "DAY Foundation - Empowering Communities, Educating Children",
    description: "DAY Foundation (BHTDAY Welfare Foundation) empowers underprivileged children through learning circles, provides health drives, and supports women & youth through Rojgar employment initiatives.",
    keywords: "day foundation, charity, child education, underprivileged children, learning circles, rojgar jobs, health camps, social welfare, non-profit ngo"
  },
  "/about": {
    title: "About Us - Our Story & Journey | DAY Foundation",
    description: "Discover the history, leadership, and mission of DAY Foundation. Learn about our commitment to breaking the cycle of poverty and creating social opportunities.",
    keywords: "about day foundation, ngo mission, charity founders, social impact, education drive, welfare foundation, community support"
  },
  "/mission": {
    title: "Our Mission, Vision & Core Values | DAY Foundation",
    description: "Read about our core pillars of compassion, transparency, and dedication. We aim to construct an inclusive society through education, healthcare, and livelihood support.",
    keywords: "ngo mission, vision, welfare values, philanthropy, social justice, child upliftment, sustainable development"
  },
  "/programs": {
    title: "Our Social Welfare Programs & Impact | DAY Foundation",
    description: "Explore our welfare programs: Learning Circles for children, Health & Sanitation drives, and Rojgar/livelihood training for community members.",
    keywords: "educational drive, vocational training, free healthcare camps, community programs, rojgar initiatives, day foundation impact"
  },
  "/gallery": {
    title: "Photo & Event Gallery - Our Visual Impact | DAY Foundation",
    description: "Browse photos and highlights from our weekly education circles, health camps, food distribution drives, and community events.",
    keywords: "welfare photos, charity gallery, educational drive images, volunteering photos, day foundation events"
  },
  "/blogs": {
    title: "Articles, Stories & News Updates | DAY Foundation",
    description: "Read stories from our volunteers, program updates, and articles on child education, community development, and social welfare.",
    keywords: "ngo blogs, charity articles, volunteer stories, social impact news, child education blog"
  },
  "/events": {
    title: "Upcoming Community Events & Drives | DAY Foundation",
    description: "Join our upcoming welfare programs, fundraising drives, and volunteer circles. Participate in making a difference in the lives of underprivileged children.",
    keywords: "community drives, charity events, volunteering opportunities, sunday learning circles, donate event"
  },
  "/volunteer": {
    title: "Become a Volunteer - Join Our Education Drive | DAY Foundation",
    description: "Register as a volunteer to teach underprivileged children, organize health camps, or support community development. Dedicate your Sundays to making a difference.",
    keywords: "volunteer register, teaching volunteer, ngo volunteer, sunday charity drive, student volunteer opportunities"
  },
  "/internship": {
    title: "Apply for Internship Program - Gain Experience | DAY Foundation",
    description: "Apply for our structured social internship. Gain experience in teaching, community service, social work, and non-profit administration while earning a certificate.",
    keywords: "student internship, social work intern, ngo certificate, volunteer internship, college credit internship"
  },
  "/donate": {
    title: "Support Our Mission - Donate & Fund Education | DAY Foundation",
    description: "Make a secure donation to help fund school supplies, healthcare checkups, and vocational tools for underprivileged families. Every donation creates an impact.",
    keywords: "donate charity, sponsor a child education, online donation, support ngo, tax exemption donation, welfare contribution"
  },
  "/contact": {
    title: "Contact Us - Reach Out to DAY Foundation",
    description: "Have questions or want to collaborate? Contact DAY Foundation. Send us a message, visit our office, or give us a call.",
    keywords: "contact ngo, charity phone number, day foundation address, support email, partner with ngo"
  },
  "/internship-status": {
    title: "Track Internship Application Status | DAY Foundation",
    description: "Enter your ticket number to track the live review status of your internship application with DAY Foundation.",
    keywords: "internship tracking, ticket status check, application status, track application"
  }
};

/**
 * Calls Gemini AI to generate optimized SEO tags for the current pathname.
 */
export const generateAISEOMetadata = async (
  path: string,
  pageContentSnippet?: string
): Promise<SEOMetadata | null> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ VITE_GEMINI_API_KEY is not defined. Using static fallback SEO.");
    return null;
  }

  const cleanPath = path === "/" ? "Home Page" : path.replace("/", "Page: ");

  const prompt = `
You are an expert SEO Optimization Specialist. Your task is to generate the most search-engine-optimized HTML SEO metadata for the website of BHTDAY Welfare Foundation (commonly known as DAY Foundation).
The website pathname is: "${path}" (${cleanPath}).
${pageContentSnippet ? `Here is a text snippet/context from the current webpage: "${pageContentSnippet}"` : ""}

We want:
1. A highly optimized meta TITLE (max 60 characters). It should contain "DAY Foundation" or "BHTDAY Welfare Foundation" and page-specific keywords.
2. A compelling, high-CTR meta DESCRIPTION (max 160 characters).
3. A comma-separated string of relevant meta KEYWORDS.

Important:
- Focus on the NGO's pillars: weekly education drives/learning circles, Rojgar/employment initiatives, health camps, and community development.
- Keep the response strictly aligned with the context of the page.
- Do NOT use HR, onboarding, or selection language unless the page is for Volunteer or Internship.

You must respond ONLY with a valid, clean JSON object matching this structure (no markdown code blocks, no backticks, no other text):
{
  "title": "Your generated title here",
  "description": "Your generated description here",
  "keywords": "keyword1, keyword2, keyword3, keyword4"
}
`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    let textContent = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // Clean up any markdown blocks if the AI returned them
    textContent = textContent.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const parsed = JSON.parse(textContent) as SEOMetadata;
    if (parsed.title && parsed.description && parsed.keywords) {
      console.log(`✨ AI SEO Auto-Generated for ${path}:`, parsed);
      return parsed;
    }
    return null;
  } catch (err) {
    console.error("❌ Failed to auto-generate SEO metadata via Gemini AI:", err);
    return null;
  }
};

/**
 * Updates DOM head elements with the given SEO metadata.
 */
export const updateDOMSEO = (metadata: SEOMetadata) => {
  // 1. Update Document Title
  document.title = metadata.title;

  // 2. Update Meta Description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement("meta");
    metaDesc.setAttribute("name", "description");
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute("content", metadata.description);

  // 3. Update Meta Keywords
  let metaKeywords = document.querySelector('meta[name="keywords"]');
  if (!metaKeywords) {
    metaKeywords = document.createElement("meta");
    metaKeywords.setAttribute("name", "keywords");
    document.head.appendChild(metaKeywords);
  }
  metaKeywords.setAttribute("content", metadata.keywords);

  // 4. Update OpenGraph (OG) Title
  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (!ogTitle) {
    ogTitle = document.createElement("meta");
    ogTitle.setAttribute("property", "og:title");
    document.head.appendChild(ogTitle);
  }
  ogTitle.setAttribute("content", metadata.title);

  // 5. Update OpenGraph (OG) Description
  let ogDesc = document.querySelector('meta[property="og:description"]');
  if (!ogDesc) {
    ogDesc = document.createElement("meta");
    ogDesc.setAttribute("property", "og:description");
    document.head.appendChild(ogDesc);
  }
  ogDesc.setAttribute("content", metadata.description);

  // 6. Update Twitter Title
  let twitterTitle = document.querySelector('meta[name="twitter:title"]');
  if (!twitterTitle) {
    twitterTitle = document.createElement("meta");
    twitterTitle.setAttribute("name", "twitter:title");
    document.head.appendChild(twitterTitle);
  }
  twitterTitle.setAttribute("content", metadata.title);

  // 7. Update Twitter Description
  let twitterDesc = document.querySelector('meta[name="twitter:description"]');
  if (!twitterDesc) {
    twitterDesc = document.createElement("meta");
    twitterDesc.setAttribute("name", "twitter:description");
    document.head.appendChild(twitterDesc);
  }
  twitterDesc.setAttribute("content", metadata.description);
};
