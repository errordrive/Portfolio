import { kv, getJson, putJson } from "./kv.js";

const DEFAULT_CONTENT_SECTIONS = ["hero", "about", "skills", "experience", "projects", "contact"];

const DEFAULT_SETTINGS: Record<string, string> = {
  site_title: "Nayem — Vibe Coder",
  site_description: "Self-taught builder who uses AI smartly to ship things fast. Vibe Coder, AI user, Android RE explorer.",
  social_github: "https://github.com/errordrive",
  social_linkedin: "",
  social_twitter: "",
  adsense_publisher_id: "",
  adsense_enabled: "false",
};

export function seedIfEmpty(): void {
  if (kv.get("_seeded_v2") !== null) return;

  const now = new Date().toISOString();

  const samplePosts = [
    {
      id: 1, slug: "what-is-vibe-coding",
      title: "What is Vibe Coding? My Take on AI-Powered Building",
      excerpt: "Vibe coding is not just a trend — it's a mindset shift. Here's how I use AI to ship ideas faster than ever before.",
      featuredImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
      tags: ["AI", "Vibe Coding", "Productivity"],
      published: true, createdAt: "2025-03-01T10:00:00.000Z", updatedAt: now,
      content: "<h2>Vibe Coding Changed Everything</h2><p>Vibe coding is the art of staying in flow while building software — using AI tools like ChatGPT, Claude, and Cursor to handle the boilerplate so you can focus on the idea.</p>",
      metaTitle: "What is Vibe Coding? | Nayem Hossain",
      metaDescription: "Vibe coding is a mindset shift for AI-powered building.",
      adsEnabled: false, adTop: false, adMiddle: false, adBottom: false, adScript: "",
    },
    {
      id: 2, slug: "android-reverse-engineering-beginners-guide",
      title: "Getting Started with Android Reverse Engineering",
      excerpt: "A beginner-friendly look at how to explore Android APKs using JADX, Frida, and a curious mindset.",
      featuredImage: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&q=80",
      tags: ["Android", "RE", "Security"],
      published: true, createdAt: "2025-03-10T10:00:00.000Z", updatedAt: now,
      content: "<h2>Why I Got Into Android RE</h2><p>Android reverse engineering started as curiosity for me. I wanted to understand how apps worked under the hood.</p>",
      metaTitle: "Android RE for Beginners | Nayem Hossain",
      metaDescription: "A beginner-friendly guide to Android reverse engineering.",
      adsEnabled: false, adTop: false, adMiddle: false, adBottom: false, adScript: "",
    },
    {
      id: 3, slug: "ai-tools-i-use-every-day",
      title: "The AI Tools I Actually Use Every Day",
      excerpt: "Not every AI tool is worth your time. Here's my curated list of the ones that actually make a difference in my workflow.",
      featuredImage: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80",
      tags: ["AI", "Tools", "Productivity"],
      published: true, createdAt: "2025-03-20T10:00:00.000Z", updatedAt: now,
      content: "<h2>My Daily AI Stack</h2><p>After trying dozens of AI tools, I've settled on a small set that I actually use every single day.</p>",
      metaTitle: "AI Tools I Use Every Day | Nayem Hossain",
      metaDescription: "Nayem's curated list of AI tools that make a real difference.",
      adsEnabled: false, adTop: false, adMiddle: false, adBottom: false, adScript: "",
    },
  ];

  const blogIndex = samplePosts.map(({ content: _c, metaTitle: _mt, metaDescription: _md, adsEnabled: _ae, adTop: _at, adMiddle: _am, adBottom: _ab, adScript: _as, ...summary }) => summary);

  putJson("blog:index", blogIndex);
  kv.put("blog:counter", String(samplePosts.length));
  for (const p of samplePosts) putJson(`blog:${p.slug}`, p);
  kv.put("messages:counter", "0");
  putJson("messages:list", []);
  kv.put("comments:counter", "0");
  putJson("content:index", DEFAULT_CONTENT_SECTIONS);
  kv.put("cv:url", "");

  for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) {
    kv.put(`setting:${k}`, v);
  }

  putJson("content:hero", {
    data: {
      name: "Nayem Hossain",
      statusBadge: "Open to collaborate",
      tagline: "Building with AI · Shipping things fast · Exploring Android",
      body: "I get ideas off the ground fast — using AI as my superpower. I don't just write code, I vibe with it. Building cool stuff, exploring Android internals, and letting AI do the heavy lifting.",
      roles: ["Vibe Coder", "AI-Powered Builder", "Android RE Explorer"],
      ctaPrimary: { label: "View Work", href: "#projects" },
      ctaSecondary: { label: "Download CV", href: "" },
      stats: [
        { label: "Projects Shipped", value: "20+" },
        { label: "AI Tools I Use", value: "15+" },
        { label: "Apps Explored", value: "50+" },
      ],
    },
    visible: true,
    updatedAt: new Date().toISOString(),
  });

  putJson("content:about", {
    data: {
      heading: "Just a guy who vibes with code",
      yearsLabel: "2+ Years of Building Stuff",
      bio: [
        "I'm Nayem — a self-taught builder who figured out that you don't need to be an expert to ship great things.",
        "My thing is Vibe Coding — using AI tools like ChatGPT, Claude, and Cursor to move fast and build things that actually work.",
        "On the side, I've been exploring Android reverse engineering — digging into APKs and understanding how apps work under the hood.",
      ],
      highlights: [
        { title: "AI as My Superpower", desc: "I don't fight AI — I ride it. Using tools like ChatGPT, Claude, and Cursor to build faster and smarter.", color: "#f97316" },
        { title: "Android RE Explorer", desc: "I enjoy poking around Android apps — understanding how things work under the hood and learning from what I find.", color: "#8b5cf6" },
        { title: "Vibe Coding", desc: "My style: start with the vibe, let AI handle the boilerplate, and ship something that actually works.", color: "#10b981" },
        { title: "Builder Mindset", desc: "Done is better than perfect — but I still make it look good.", color: "#3b82f6" },
      ],
    },
    visible: true,
    updatedAt: new Date().toISOString(),
  });

  putJson("content:skills", {
    data: {
      skills: [
        { name: "Vibe Coding", icon: "✨", level: 95, category: "Craft", desc: "Ship fast, iterate faster, stay in the flow" },
        { name: "AI Tool Usage", icon: "🤖", level: 92, category: "AI", desc: "ChatGPT, Claude, Cursor, Gemini & more" },
        { name: "Prompt Engineering", icon: "💬", level: 88, category: "AI", desc: "Getting AI to do exactly what you need" },
        { name: "Android RE Basics", icon: "🔓", level: 65, category: "RE", desc: "APK analysis, JADX, basic Frida usage" },
        { name: "Web Development", icon: "🌐", level: 75, category: "Dev", desc: "React, HTML/CSS, basic backend stuff" },
        { name: "Python Scripting", icon: "🐍", level: 70, category: "Dev", desc: "Automation, quick scripts, AI integrations" },
        { name: "Linux / Shell", icon: "🐧", level: 72, category: "Dev", desc: "Terminal comfort, basic bash scripting" },
        { name: "Builder Mindset", icon: "🚀", level: 98, category: "Craft", desc: "Ideas → shipped products, fast and fun" },
      ],
    },
    visible: true,
    updatedAt: new Date().toISOString(),
  });

  putJson("content:experience", {
    data: {
      timeline: [
        { year: "2025–Now", title: "Full-time Vibe Coder", org: "Self / Freelance", desc: "Shipping projects using AI tools every day. ChatGPT, Claude, Cursor — these are my team.", tags: ["AI Tools", "React", "Cursor"], color: "#f97316" },
        { year: "2024", title: "Discovered Vibe Coding", org: "Self-directed", desc: "Found out you don't need to be a 10x engineer to build great things — you just need to use AI smartly.", tags: ["ChatGPT", "Claude", "Prompt Engineering"], color: "#8b5cf6" },
        { year: "2024", title: "Started Android RE", org: "Hobby & Learning", desc: "Got curious about how Android apps work under the hood. Started using JADX and Frida to explore APKs.", tags: ["JADX", "Frida", "Android"], color: "#10b981" },
        { year: "2023", title: "First Real Project Shipped", org: "Personal", desc: "Built and deployed my first working web app. That feeling of shipping something real got me hooked.", tags: ["HTML", "CSS", "JavaScript"], color: "#3b82f6" },
      ],
    },
    visible: true,
    updatedAt: new Date().toISOString(),
  });

  putJson("content:projects", {
    data: {
      projects: [
        { title: "AI Study Buddy", desc: "An AI-powered study assistant using ChatGPT API. Made in a weekend with Cursor + React.", tech: ["React", "ChatGPT API", "Cursor"], github: "#", demo: "#", featured: true },
        { title: "APK Explorer Tool", desc: "A personal tool to quickly decompile and explore Android APKs, with AI-generated summaries.", tech: ["Python", "JADX", "AI"], github: "#", demo: "#", featured: true },
        { title: "Vibe Portfolio", desc: "My personal portfolio — designed and built entirely with AI assistance.", tech: ["React", "Vite", "Claude"], github: "#", demo: "#", featured: true },
      ],
    },
    visible: true,
    updatedAt: new Date().toISOString(),
  });

  putJson("content:contact", {
    data: {
      bio: "Whether you need an AI solution, want to reverse engineer something, or just want to vibe-code together — I'm just a message away.",
      email: "nayem@nayem.me",
      location: "Bangladesh 🇧🇩",
      socials: [
        { platform: "github", label: "GitHub", href: "https://github.com/errordrive" },
        { platform: "telegram", label: "Telegram", href: "https://t.me/nayem" },
      ],
    },
    visible: true,
    updatedAt: new Date().toISOString(),
  });

  kv.put("_seeded_v2", "1");
}
