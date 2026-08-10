import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { fallbackSEOMap, generateAISEOMetadata, updateDOMSEO, type SEOMetadata } from "../services/seoService";
import { getSeoSettings } from "../firebase/services";

// Session storage cache key to keep SEO responses cached
const SEO_CACHE_KEY = "day_ai_seo_cache";
const FIRESTORE_SEO_CACHE_KEY = "day_firestore_seo_cache";

const getCachedSEO = (): Record<string, SEOMetadata> => {
  try {
    const data = sessionStorage.getItem(SEO_CACHE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

const setCachedSEO = (path: string, seo: SEOMetadata) => {
  try {
    const cache = getCachedSEO();
    cache[path] = seo;
    sessionStorage.setItem(SEO_CACHE_KEY, JSON.stringify(cache));
  } catch (err) {
    console.error("Failed to cache AI SEO results:", err);
  }
};

const getFirestoreSeoCache = (): Record<string, SEOMetadata> => {
  try {
    const data = sessionStorage.getItem(FIRESTORE_SEO_CACHE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

/**
 * Custom React hook that automatically handles and optimizes SEO metadata on every route change.
 * Priority order: 1. Admin-saved Firestore SEO → 2. Static fallback → 3. AI-generated
 */
export const useAutoSEO = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // 1. Immediately apply the static fallback for the current page path (fastest)
    const fallback = fallbackSEOMap[pathname] || fallbackSEOMap["/"];
    updateDOMSEO(fallback);

    // 2. Check if we have a cached Firestore SEO for this path
    const fsCache = getFirestoreSeoCache();
    if (fsCache[pathname]) {
      updateDOMSEO(fsCache[pathname]);
      return;
    }

    // 3. Check AI cache
    const aiCache = getCachedSEO();
    if (aiCache[pathname]) {
      updateDOMSEO(aiCache[pathname]);
      return;
    }

    let isMounted = true;

    // 4. Fetch admin-saved SEO from Firestore (highest priority — admin-defined)
    getSeoSettings()
      .then((settings) => {
        if (!isMounted) return;
        const pageSeo = settings.find(s => s.path === pathname);
        if (pageSeo && pageSeo.title) {
          const seo: SEOMetadata = {
            title: pageSeo.title,
            description: pageSeo.description,
            keywords: pageSeo.keywords,
          };
          updateDOMSEO(seo);
          // Also set OG image if provided
          if (pageSeo.ogImage) {
            const ogImg = document.querySelector('meta[property="og:image"]');
            const twitterImg = document.querySelector('meta[property="twitter:image"]');
            if (ogImg) ogImg.setAttribute("content", pageSeo.ogImage);
            if (twitterImg) twitterImg.setAttribute("content", pageSeo.ogImage);
          }
          // Set canonical if provided
          if (pageSeo.canonical) {
            let canonicalEl = document.querySelector('link[rel="canonical"]');
            if (!canonicalEl) {
              canonicalEl = document.createElement("link");
              canonicalEl.setAttribute("rel", "canonical");
              document.head.appendChild(canonicalEl);
            }
            canonicalEl.setAttribute("href", pageSeo.canonical);
          }
          // Cache Firestore result
          try {
            const newCache = getFirestoreSeoCache();
            newCache[pathname] = seo;
            sessionStorage.setItem(FIRESTORE_SEO_CACHE_KEY, JSON.stringify(newCache));
          } catch {
            // Ignore — sessionStorage may be unavailable (e.g. private browsing, quota exceeded)
          }
          return; // Done — Firestore SEO takes full priority
        }

        // 5. No Firestore SEO for this path — try AI generation
        let pageContext = "";
        const mainEl = document.querySelector("main") || document.querySelector(".viewport-container") || document.body;
        if (mainEl) {
          pageContext = mainEl.textContent?.slice(0, 400).replace(/\s+/g, " ").trim() || "";
        }

        generateAISEOMetadata(pathname, pageContext)
          .then((aiSEO) => {
            if (aiSEO && isMounted) {
              updateDOMSEO(aiSEO);
              setCachedSEO(pathname, aiSEO);
            }
          })
          .catch((err) => {
            console.error("AI SEO failed in hook effect:", err);
          });
      })
      .catch((err) => {
        console.error("Failed to fetch Firestore SEO:", err);
        // Fallback to AI generation
        let pageContext = "";
        const mainEl = document.querySelector("main") || document.querySelector(".viewport-container") || document.body;
        if (mainEl) {
          pageContext = mainEl.textContent?.slice(0, 400).replace(/\s+/g, " ").trim() || "";
        }
        generateAISEOMetadata(pathname, pageContext)
          .then((aiSEO) => {
            if (aiSEO && isMounted) {
              updateDOMSEO(aiSEO);
              setCachedSEO(pathname, aiSEO);
            }
          })
          .catch(() => {});
      });

    return () => {
      isMounted = false;
    };
  }, [pathname]);
};
