import { db } from "@workspace/db";
import {
  adminUsers,
  siteSettings,
  contentSections,
  cvFile,
} from "@workspace/db";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";

const DEFAULT_HERO = {
  name: "Nayem",
  tagline: "Hi, I'm Nayem",
  body: "I get ideas off the ground fast — using AI as my superpower. I don't just write code, I vibe with it. Building cool stuff, exploring Android internals, and letting AI do the heavy lifting.",
  roles: ["Vibe Coder", "AI-Powered Builder", "Android RE Explorer"],
  stats: [
    { label: "Projects Shipped", value: "20+" },
    { label: "AI Tools I Use", value: "15+" },
    { label: "Apps Explored", value: "50+" },
  ],
  ctaPrimary: { label: "View Work", href: "#projects" },
  ctaSecondary: { label: "Download CV", href: "#cv" },
  statusBadge: "Open to collaborate",
};

const DEFAULT_ABOUT = {
  heading: "Just a guy who vibes with code",
  bio: [
    "I'm Nayem — a self-taught builder who figured out that you don't need to be an expert to ship great things. You just need the right tools and the right mindset.",
    "My thing is Vibe Coding — using AI tools like ChatGPT, Claude, and Cursor to move fast and build things that actually work. I'm not training models or writing papers. I'm getting ideas out of my head and into the world.",
    "On the side, I've been exploring Android reverse engineering — digging into APKs, understanding how apps work, bypassing simple protections for fun and learning. It's more of a hobby that became a skill.",
  ],
  yearsLabel: "2+ Years of Building Stuff",
  highlights: [
    { title: "AI as My Superpower", desc: "I don't fight AI — I ride it. Using tools like ChatGPT, Claude, and Cursor to build faster and smarter than ever before.", color: "#f97316" },
    { title: "Android RE Explorer", desc: "I enjoy poking around Android apps — understanding how things work under the hood, bypassing basic protections, and learning from what I find.", color: "#8b5cf6" },
    { title: "Vibe Coding", desc: "My style: start with the vibe, let AI handle the boilerplate, and ship something that actually works. Fast, fun, and real.", color: "#10b981" },
    { title: "Builder Mindset", desc: "I care about getting things out the door. Done is better than perfect — but I still make it look good.", color: "#3b82f6" },
  ],
};

const DEFAULT_SKILLS = {
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
};

const DEFAULT_EXPERIENCE = {
  timeline: [
    { year: "2025–Now", title: "Full-time Vibe Coder", org: "Self / Freelance", desc: "Shipping projects using AI tools every day. ChatGPT, Claude, Cursor — these are my team. Building things I find useful, learning by doing.", tags: ["AI Tools", "React", "Cursor", "Ship Fast"], color: "#f97316" },
    { year: "2024", title: "Discovered Vibe Coding", org: "Self-directed", desc: "Found out you don't need to be a 10x engineer to build great things — you just need to use AI smartly. This changed everything for me.", tags: ["ChatGPT", "Claude", "Prompt Engineering"], color: "#8b5cf6" },
    { year: "2024", title: "Started Android RE", org: "Hobby & Learning", desc: "Got curious about how Android apps work under the hood. Started using JADX and basic Frida to explore APKs. Still learning, still enjoying it.", tags: ["JADX", "Frida", "Android", "APKTool"], color: "#10b981" },
    { year: "2023", title: "First Real Project Shipped", org: "Personal", desc: "Built and deployed my first working web app. It wasn't pretty, but it worked. That feeling of shipping something real got me hooked.", tags: ["HTML", "CSS", "JavaScript", "First Ship"], color: "#3b82f6" },
    { year: "2022", title: "Started the Journey", org: "Beginner", desc: "Wrote my first lines of Python. Fell in love with the idea that you can build literally anything with code. Still chasing that feeling.", tags: ["Python", "Basics", "YouTube Tutorials"], color: "#f97316" },
  ],
};

const DEFAULT_PROJECTS = {
  projects: [
    { title: "AI Study Buddy", desc: "Built an AI-powered study assistant using ChatGPT API. Ask it anything, get instant explanations, quizzes, and summaries. Made in a weekend with Cursor + React.", tags: ["React", "ChatGPT API", "Cursor", "Tailwind"], category: "AI", color: "#f97316", emoji: "📚", github: "#", demo: "#" },
    { title: "APK Explorer Tool", desc: "A personal tool I use to quickly decompile and explore Android APKs. Wraps JADX into a simple CLI with AI-generated summaries of what each class does.", tags: ["Python", "JADX", "AI", "Android"], category: "RE", color: "#8b5cf6", emoji: "🔍", github: "#", demo: "#" },
    { title: "Vibe Portfolio", desc: "My personal portfolio — designed and built entirely with AI assistance. From layout ideas to code, AI handled 90% of it. I directed the vibe.", tags: ["React", "Vite", "Framer Motion", "Claude"], category: "Dev", color: "#10b981", emoji: "🌐", github: "#", demo: "#" },
    { title: "Telegram AI Bot", desc: "A Telegram bot that connects to AI models to answer questions, summarize messages, and help with quick tasks. Built it for my own use, shared it with friends.", tags: ["Python", "Telegram API", "OpenAI", "Bot"], category: "AI", color: "#f97316", emoji: "🤖", github: "#", demo: "#" },
    { title: "Android Login Bypass", desc: "A personal learning project — reverse engineered a sample app's login flow using Frida and JADX to understand how authentication is implemented. For learning only.", tags: ["Frida", "JADX", "Android", "Learning"], category: "RE", color: "#8b5cf6", emoji: "🔐", github: "#", demo: "#" },
    { title: "AI Image Generator UI", desc: "A clean web UI for generating images with Stable Diffusion / DALL-E. Prompt history, style presets, and download. Built fast with AI pair programming.", tags: ["React", "OpenAI API", "Vite", "Cursor"], category: "Dev", color: "#10b981", emoji: "🎨", github: "#", demo: "#" },
  ],
};

const DEFAULT_SETTINGS = [
  { key: "site_title", value: "Nayem — Vibe Coder" },
  { key: "site_description", value: "Self-taught builder who uses AI smartly to ship things fast. Vibe Coder, AI user, Android RE explorer." },
  { key: "social_github", value: "https://github.com" },
  { key: "social_linkedin", value: "https://linkedin.com" },
  { key: "social_twitter", value: "" },
  { key: "adsense_publisher_id", value: "" },
  { key: "adsense_enabled", value: "false" },
];

export async function runMigrations() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS content_sections (
      section TEXT PRIMARY KEY,
      data JSONB NOT NULL DEFAULT '{}',
      visible BOOLEAN NOT NULL DEFAULT true,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS blog_posts (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      content TEXT NOT NULL DEFAULT '',
      excerpt TEXT NOT NULL DEFAULT '',
      featured_image TEXT NOT NULL DEFAULT '',
      tags TEXT[] NOT NULL DEFAULT '{}',
      meta_title TEXT NOT NULL DEFAULT '',
      meta_description TEXT NOT NULL DEFAULT '',
      published BOOLEAN NOT NULL DEFAULT false,
      ads_enabled BOOLEAN NOT NULL DEFAULT false,
      ad_top BOOLEAN NOT NULL DEFAULT false,
      ad_middle BOOLEAN NOT NULL DEFAULT false,
      ad_bottom BOOLEAN NOT NULL DEFAULT false,
      ad_script TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL DEFAULT '',
      message TEXT NOT NULL,
      read BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cv_file (
      id SERIAL PRIMARY KEY,
      url TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
  `);
}

export async function seedDatabase() {
  const existingAdmin = await db.select().from(adminUsers).limit(1);
  if (existingAdmin.length === 0) {
    const passwordHash = await bcrypt.hash("admin123", 10);
    await db.insert(adminUsers).values({ username: "admin", passwordHash });
  }

  for (const setting of DEFAULT_SETTINGS) {
    await db
      .insert(siteSettings)
      .values({ key: setting.key, value: setting.value })
      .onConflictDoNothing();
  }

  const sections = [
    { section: "hero", data: DEFAULT_HERO },
    { section: "about", data: DEFAULT_ABOUT },
    { section: "skills", data: DEFAULT_SKILLS },
    { section: "experience", data: DEFAULT_EXPERIENCE },
    { section: "projects", data: DEFAULT_PROJECTS },
  ];

  for (const s of sections) {
    await db
      .insert(contentSections)
      .values({ section: s.section, data: s.data, visible: true })
      .onConflictDoNothing();
  }

  const existingCv = await db.select().from(cvFile).limit(1);
  if (existingCv.length === 0) {
    await db.insert(cvFile).values({ url: "" });
  }
}
