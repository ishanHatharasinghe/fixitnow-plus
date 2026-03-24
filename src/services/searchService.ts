import { postService, type Post } from "./postService";
import { userService, type UserProfile } from "./userService";

export type SearchResultType = "post" | "provider" | "faq" | "page";

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
  // Add more from FAQ if needed
];

const NAV_PAGES = [
  { id: "page-browseplace", title: "Find Service", route: "/browseplace", description: "Browse available service providers and posts." },
  { id: "page-faq", title: "Help & FAQ", route: "/faq", description: "Frequently asked questions and support articles." },
  { id: "page-privacy", title: "Privacy Policy", route: "/privacy-policy", description: "Read our privacy policy and data usage." },
  { id: "page-home", title: "Home", route: "/", description: "Landing page and app introduction." },
];

function normalize(text?: string): string {
  if (!text) return "";
  return String(text).toLowerCase().trim();
}

function matchesQuery(text: string, queryTerms: string[]): boolean {
  const source = normalize(text);
  return queryTerms.every((term) => source.includes(term));
}

function makeSearchTerms(query: string): string[] {
  return normalize(query)
    .split(/\s+/)
    .filter(Boolean);
}

export const searchService = {
  async search(query: string, maxResults = 8): Promise<SearchResult[]> {
    const terms = makeSearchTerms(query);
    if (terms.length < 2) return [];

    const results: SearchResult[] = [];

    // 1) Posts
    try {
      const posts = await postService.searchPosts(query);
      posts.slice(0, 5).forEach((post) => {
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

    // 2) Providers
    try {
      const providers = await userService.getUsersByRole("service_provider");
      const matchedProviders = providers.filter((p) => {
        const haystack = [p.displayName, p.email, p.bio, (p.availableServices || []).join(" ")].join(" ");
        return matchesQuery(haystack, terms);
      });

      matchedProviders.slice(0, 5).forEach((provider) => {
        results.push({
          id: `provider-${provider.uid}`,
          type: "provider",
          title: provider.displayName || provider.email || "Service Provider",
          subtitle: provider.role,
          description: provider.bio || "",
          route: `/public-profile/${provider.uid}`,
          meta: provider.city || provider.country || "",
        });
      });
    } catch (err) {
      console.error("searchService: provider search failed", err);
    }

    // 3) FAQ
    const matchedFaqs = FAQ_ENTRIES.filter((faq) =>
      matchesQuery(`${faq.question} ${faq.answer} ${faq.category}`, terms)
    );

    matchedFaqs.slice(0, 3).forEach((faq) => {
      results.push({
        id: faq.id,
        type: "faq",
        title: faq.question,
        subtitle: faq.category,
        description: faq.answer,
        route: `/faq#${faq.id}`,
      });
    });

    // 4) Pages
    const matchedPages = NAV_PAGES.filter((page) =>
      matchesQuery(`${page.title} ${page.description}`, terms)
    );

    matchedPages.slice(0, 3).forEach((page) => {
      results.push({
        id: page.id,
        type: "page",
        title: page.title,
        subtitle: page.description,
        route: page.route,
      });
    });

    // De-duplicate by route and ID keeping ordering
    const unique = new Map<string, SearchResult>();
    for (const r of results) {
      if (!unique.has(r.id)) {
        unique.set(r.id, r);
      }
    }

    return Array.from(unique.values()).slice(0, maxResults);
  },
};
