import { postService, type Post } from "./postService";
import { userService, type UserProfile } from "./userService";

export type SearchResultType = "post" | "provider" | "faq" | "page" | "service" | "location";

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  description?: string;
  route: string;
  meta?: string;
}

const FAQ_ENTRIES = [
  { id: "faq-1", question: "What is FixItNow?", answer: "FixItNow is a digital marketplace connecting homeowners with skilled local workers.", category: "General" },
  { id: "faq-2", question: "Is it free to register?", answer: "Registration is free for customers and professionals.", category: "General" },
  { id: "faq-3", question: "How do I find an Emergency Service?", answer: "Use the search bar and toggle emergency callout availability.", category: "For Customers" },
  { id: "faq-4", question: "How do I create an Advertisement?", answer: "Go to your Profile Dashboard, click 'Add Post', and complete the form.", category: "For Professionals" },
  { id: "faq-5", question: "How do I reset my password?", answer: "Click Forgot Password & follow instructions in mail.", category: "General" },
];

const NAV_PAGES = [
  { id: "page-browseplace", title: "Find Service", route: "/browseplace", description: "Browse available service providers and posts." },
  { id: "page-faq", title: "Help & FAQ", route: "/faq", description: "Frequently asked questions and support articles." },
  { id: "page-privacy", title: "Privacy Policy", route: "/privacy-policy", description: "Read our privacy policy and data usage." },
  { id: "page-home", title: "Home", route: "/", description: "Landing page and app introduction." },
];

// Comprehensive list of service types for instant suggestions
const SERVICE_KEYWORDS = [
  "Plumbing", "Electrical Repairs", "Wiring", "Carpentry", "Woodwork",
  "Air Conditioning", "AC Repair", "Masonry", "Tile Laying", "House Painting",
  "Painting", "Roofing", "Ceiling Repairs", "Welding", "Ironworks",
  "Appliance Repair", "Cleaning", "Pest Control", "Garden Maintenance",
  "Tree Cutting", "Aluminum Fabrication", "Fitting", "Waterproofing",
  "CCTV", "Security Installation", "Moving", "Transport", "Movers",
  "Sofa Repair", "Upholstery", "Cushion Works", "Septic Tank", "Gully Service",
  "Glass Works", "Mirror Works", "Interlock", "Driveway Paving", "Paving"
];

// Popular locations for instant suggestions
const LOCATION_KEYWORDS = [
  "Colombo", "Kandy", "Galle", "Negombo", "Kurunegala", "Anuradhapura",
  "Jaffna", "Matara", "Trincomalee", "Batticaloa", "Ratnapura", "Badulla",
  "Nuwara Eliya", "Gampaha", "Kalutara", "Puttalam", "Matale", "Polonnaruwa"
];

// Landing page keywords for instant suggestions
const LANDING_KEYWORDS = [
  "Local service finder", "Find services near me", "Emergency service",
  "Professional services", "Skilled workers", "Home services",
  "Service providers", "Book a service", "Get a quote"
];

function normalize(text?: string): string {
  if (!text) return "";
  return String(text).toLowerCase().trim();
}

function matchesQuery(text: string, query: string): boolean {
  const source = normalize(text);
  const normalizedQuery = normalize(query);
  return source.includes(normalizedQuery);
}

function calculateRelevanceScore(text: string, query: string): number {
  const normalizedText = normalize(text);
  const normalizedQuery = normalize(query);
  if (normalizedText.startsWith(normalizedQuery)) return 3;
  if (normalizedText === normalizedQuery) return 2;
  if (normalizedText.includes(normalizedQuery)) return 1;
  return 0;
}

export const searchService = {
  async search(query: string, maxResults = 8): Promise<SearchResult[]> {
    const normalizedQuery = normalize(query);
    if (normalizedQuery.length < 1) return [];

    const results: SearchResult[] = [];

    // 1) Local service keyword suggestions (instant, no API call)
    if (normalizedQuery.length >= 1) {
      const matchedServices = SERVICE_KEYWORDS
        .filter(service => matchesQuery(service, query))
        .sort((a, b) => calculateRelevanceScore(b, query) - calculateRelevanceScore(a, query))
        .slice(0, 4);

      matchedServices.forEach((service, index) => {
        results.push({
          id: `service-${index}-${service}`,
          type: "service",
          title: service,
          subtitle: "Service Type",
          description: `Find ${service.toLowerCase()} professionals near you`,
          route: `/browseplace?services=${encodeURIComponent(service)}`,
          meta: "Service Category",
        });
      });
    }

    // 2) Location suggestions (instant, no API call)
    if (normalizedQuery.length >= 2) {
      const matchedLocations = LOCATION_KEYWORDS
        .filter(location => matchesQuery(location, query))
        .sort((a, b) => calculateRelevanceScore(b, query) - calculateRelevanceScore(a, query))
        .slice(0, 3);

      matchedLocations.forEach((location, index) => {
        results.push({
          id: `location-${index}-${location}`,
          type: "location",
          title: location,
          subtitle: "Location",
          description: `Find service providers in ${location}`,
          route: `/browseplace?cities=${encodeURIComponent(location)}`,
          meta: "City/Area",
        });
      });
    }

    // 3) Landing page keywords (instant suggestions)
    if (normalizedQuery.length >= 2) {
      const matchedLanding = LANDING_KEYWORDS
        .filter(keyword => matchesQuery(keyword, query))
        .slice(0, 2);

      matchedLanding.forEach((keyword, index) => {
        results.push({
          id: `landing-${index}-${keyword}`,
          type: "page",
          title: keyword,
          subtitle: "Quick Access",
          description: `Explore ${keyword.toLowerCase()}`,
          route: `/browseplace?q=${encodeURIComponent(keyword)}`,
        });
      });
    }

    // 4) Posts from Firebase (if query is long enough)
    if (normalizedQuery.length >= 2) {
      try {
        const posts = await postService.searchPosts(query);
        posts.slice(0, 3).forEach((post) => {
          results.push({
            id: `post-${post.id}`,
            type: "post",
            title: post.title || "Untitled Post",
            subtitle: post.category,
            description: post.description || "",
            route: `/browseplace?q=${encodeURIComponent(post.title || "")}`,
            meta: `${post.location ?? ""}`,
          });
        });
      } catch (err) {
        console.error("searchService: post search failed", err);
      }
    }

    // 5) FAQ suggestions (instant)
    if (normalizedQuery.length >= 2) {
      const matchedFaqs = FAQ_ENTRIES.filter(faq =>
        matchesQuery(`${faq.question} ${faq.answer} ${faq.category}`, query)
      ).slice(0, 2);

      matchedFaqs.forEach((faq) => {
        results.push({
          id: faq.id,
          type: "faq",
          title: faq.question,
          subtitle: faq.category,
          description: faq.answer,
          route: `/faq#${faq.id}`,
        });
      });
    }

    // 6) Navigation pages (instant)
    if (normalizedQuery.length >= 2) {
      const matchedPages = NAV_PAGES.filter(page =>
        matchesQuery(`${page.title} ${page.description}`, query)
      ).slice(0, 2);

      matchedPages.forEach((page) => {
        results.push({
          id: page.id,
          type: "page",
          title: page.title,
          subtitle: page.description,
          route: page.route,
        });
      });
    }

    // De-duplicate by route and ID, keeping ordering by relevance
    const unique = new Map<string, SearchResult>();
    for (const r of results) {
      if (!unique.has(r.id)) {
        unique.set(r.id, r);
      }
    }

    return Array.from(unique.values()).slice(0, maxResults);
  },

  // New method for instant local-only suggestions (no Firebase)
  getLocalSuggestions(query: string, maxResults = 8): SearchResult[] {
    const normalizedQuery = normalize(query);
    if (normalizedQuery.length < 1) return [];

    const results: SearchResult[] = [];

    // Service keywords
    SERVICE_KEYWORDS
      .filter(service => matchesQuery(service, query))
      .sort((a, b) => calculateRelevanceScore(b, query) - calculateRelevanceScore(a, query))
      .slice(0, maxResults)
      .forEach((service, index) => {
        results.push({
          id: `service-${index}-${service}`,
          type: "service",
          title: service,
          subtitle: "Service Type",
          description: `Find ${service.toLowerCase()} professionals`,
          route: `/browseplace?services=${encodeURIComponent(service)}`,
          meta: "Service Category",
        });
      });

    // Location keywords
    if (normalizedQuery.length >= 2) {
      LOCATION_KEYWORDS
        .filter(location => matchesQuery(location, query))
        .sort((a, b) => calculateRelevanceScore(b, query) - calculateRelevanceScore(a, query))
        .slice(0, maxResults - results.length)
        .forEach((location, index) => {
          results.push({
            id: `location-${index}-${location}`,
            type: "location",
            title: location,
            subtitle: "Location",
            description: `Services in ${location}`,
            route: `/browseplace?cities=${encodeURIComponent(location)}`,
            meta: "City/Area",
          });
        });
    }

    // Landing page keywords
    LANDING_KEYWORDS
      .filter(keyword => matchesQuery(keyword, query))
      .slice(0, maxResults - results.length)
      .forEach((keyword, index) => {
        results.push({
          id: `landing-${index}-${keyword}`,
          type: "page",
          title: keyword,
          subtitle: "Quick Access",
          description: `Explore ${keyword.toLowerCase()}`,
          route: `/browseplace?q=${encodeURIComponent(keyword)}`,
        });
      });

    return results.slice(0, maxResults);
  }
};