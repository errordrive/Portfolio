#!/usr/bin/env node
/**
 * KV Seed Script for Cloudflare Portfolio
 *
 * Generates a JSON file ready for: wrangler kv:bulk put --namespace-id=<ID> seed-kv.json
 *
 * Usage:
 *   node scripts/seed-kv.js > seed-kv.json
 *   wrangler kv:bulk put --namespace-id=YOUR_NAMESPACE_ID seed-kv.json
 *
 * Admin credentials (change after first login!):
 *   username: admin
 *   password: admin123
 */

import bcrypt from "bcryptjs";

const passwordHash = await bcrypt.hash("admin123", 10);
const now = new Date().toISOString();

const defaultHero = {
  name: "Nayem",
  statusBadge: "Open to Work",
  tagline: "Vibe Coder · AI User · Android RE Explorer",
  body: "I build things with AI, break Android apps for fun, and ship projects that actually work.",
  roles: ["Vibe Coder", "AI User", "Android RE Explorer"],
  ctaPrimary: { label: "View Projects", href: "#projects" },
  ctaSecondary: { label: "Contact Me", href: "#contact" },
  stats: [
    { label: "Projects", value: "10+" },
    { label: "AI Tools Used", value: "50+" },
    { label: "Apps Reversed", value: "20+" },
  ],
};

const defaultAbout = {
  heading: "About Me",
  yearsLabel: "Years of Coding",
  bio: [
    "I'm a passionate developer who uses AI tools to build faster and smarter.",
    "My interests span vibe coding, AI-assisted development, and Android reverse engineering.",
  ],
  highlights: [
    { title: "AI-First Workflow", desc: "I use cutting-edge AI tools to accelerate development", color: "orange" },
    { title: "Android RE", desc: "Exploring Android apps at the binary level", color: "blue" },
    { title: "Vibe Coder", desc: "Turning ideas into working projects with speed", color: "green" },
  ],
};

const defaultSkills = {
  skills: [
    { name: "React", icon: "⚛️", level: 85, category: "Frontend", desc: "Building dynamic UIs" },
    { name: "TypeScript", icon: "🔷", level: 80, category: "Language", desc: "Type-safe JavaScript" },
    { name: "AI Tools", icon: "🤖", level: 95, category: "AI", desc: "Claude, GPT, Gemini & more" },
    { name: "Android RE", icon: "🤖", level: 75, category: "Security", desc: "APK analysis & reverse engineering" },
    { name: "Node.js", icon: "🟢", level: 80, category: "Backend", desc: "Server-side JavaScript" },
  ],
};

const defaultExperience = {
  timeline: [
    {
      year: "2024",
      title: "Vibe Coder",
      org: "Self-Employed",
      desc: "Building projects with AI assistance and modern web technologies.",
      tags: ["React", "AI", "TypeScript"],
      color: "orange",
    },
  ],
};

const defaultProjects = {
  projects: [
    {
      title: "This Portfolio",
      desc: "A full-stack portfolio with CMS, blog, and Cloudflare KV storage.",
      tech: ["React", "Hono", "Cloudflare KV", "TailwindCSS"],
      github: "https://github.com/errordrive/Portfolio",
      demo: "https://nayem.me",
      featured: true,
    },
  ],
};

const defaultContact = {
  bio: "Feel free to reach out for collaborations or just a chat.",
  email: "hello@nayem.me",
  location: "Bangladesh",
  socials: [
    { platform: "github", label: "GitHub", href: "https://github.com/errordrive" },
    { platform: "twitter", label: "Twitter", href: "https://x.com/" },
  ],
};

const entries = [
  { key: "admin:user", value: JSON.stringify({ username: "admin", passwordHash, createdAt: now }) },

  { key: "setting:site_title", value: "Nayem — Vibe Coder" },
  { key: "setting:site_description", value: "Vibe Coder, AI User, and Android RE Explorer." },
  { key: "setting:social_github", value: "https://github.com/errordrive" },
  { key: "setting:social_linkedin", value: "" },
  { key: "setting:social_twitter", value: "" },
  { key: "setting:adsense_enabled", value: "false" },
  { key: "setting:adsense_publisher_id", value: "" },

  { key: "cv:url", value: "" },

  { key: "content:index", value: JSON.stringify(["hero", "about", "skills", "experience", "projects", "contact"]) },
  { key: "content:hero", value: JSON.stringify({ data: defaultHero, visible: true, updatedAt: now }) },
  { key: "content:about", value: JSON.stringify({ data: defaultAbout, visible: true, updatedAt: now }) },
  { key: "content:skills", value: JSON.stringify({ data: defaultSkills, visible: true, updatedAt: now }) },
  { key: "content:experience", value: JSON.stringify({ data: defaultExperience, visible: true, updatedAt: now }) },
  { key: "content:projects", value: JSON.stringify({ data: defaultProjects, visible: true, updatedAt: now }) },
  { key: "content:contact", value: JSON.stringify({ data: defaultContact, visible: true, updatedAt: now }) },

  { key: "blog:counter", value: "0" },
  { key: "blog:index", value: "[]" },

  { key: "messages:counter", value: "0" },
  { key: "messages:list", value: "[]" },

  { key: "comments:counter", value: "0" },
];

process.stdout.write(JSON.stringify(entries, null, 2));
process.stdout.write("\n");
