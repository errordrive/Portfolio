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
  if (kv.get("_seeded") !== null) return;

  putJson("blog:index", []);
  kv.put("blog:counter", "0");
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

  kv.put("_seeded", "1");
}
