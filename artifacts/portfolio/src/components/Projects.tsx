import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { ExternalLink, Github, ArrowRight } from "lucide-react";

const projects = [
  {
    title: "AI Study Buddy",
    desc: "Built an AI-powered study assistant using ChatGPT API. Ask it anything, get instant explanations, quizzes, and summaries. Made in a weekend with Cursor + React.",
    tags: ["React", "ChatGPT API", "Cursor", "Tailwind"],
    category: "AI",
    color: "#f97316",
    emoji: "📚",
    github: "#",
    demo: "#",
  },
  {
    title: "APK Explorer Tool",
    desc: "A personal tool I use to quickly decompile and explore Android APKs. Wraps JADX into a simple CLI with AI-generated summaries of what each class does.",
    tags: ["Python", "JADX", "AI", "Android"],
    category: "RE",
    color: "#8b5cf6",
    emoji: "🔍",
    github: "#",
    demo: "#",
  },
  {
    title: "Vibe Portfolio (This Site)",
    desc: "My personal portfolio — designed and built entirely with AI assistance. From layout ideas to code, AI handled 90% of it. I directed the vibe.",
    tags: ["React", "Vite", "Framer Motion", "Claude"],
    category: "Dev",
    color: "#10b981",
    emoji: "🌐",
    github: "#",
    demo: "#",
  },
  {
    title: "Telegram AI Bot",
    desc: "A Telegram bot that connects to AI models to answer questions, summarize messages, and help with quick tasks. Built it for my own use, shared it with friends.",
    tags: ["Python", "Telegram API", "OpenAI", "Bot"],
    category: "AI",
    color: "#f97316",
    emoji: "🤖",
    github: "#",
    demo: "#",
  },
  {
    title: "Android Login Bypass",
    desc: "A personal learning project — reverse engineered a sample app's login flow using Frida and JADX to understand how authentication is implemented. For learning only.",
    tags: ["Frida", "JADX", "Android", "Learning"],
    category: "RE",
    color: "#8b5cf6",
    emoji: "🔐",
    github: "#",
    demo: "#",
  },
  {
    title: "AI Image Generator UI",
    desc: "A clean web UI for generating images with Stable Diffusion / DALL-E. Prompt history, style presets, and download. Built fast with AI pair programming.",
    tags: ["React", "OpenAI API", "Vite", "Cursor"],
    category: "Dev",
    color: "#10b981",
    emoji: "🎨",
    github: "#",
    demo: "#",
  },
];

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  AI:  { bg: "rgba(249,115,22,0.12)", text: "#f97316", border: "rgba(249,115,22,0.25)" },
  RE:  { bg: "rgba(139,92,246,0.12)", text: "#8b5cf6", border: "rgba(139,92,246,0.25)" },
  Dev: { bg: "rgba(16,185,129,0.12)", text: "#10b981", border: "rgba(16,185,129,0.25)" },
};

export default function Projects() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="projects" className="relative py-24 lg:py-32">
      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="text-primary text-sm font-semibold tracking-widest uppercase">Portfolio</span>
          <h2 className="mt-3 text-4xl lg:text-5xl font-black">
            Things I've <span className="gradient-text">built</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Real projects I've shipped — mostly with heavy AI assistance. No pretending I wrote every line solo.
          </p>
        </motion.div>

        {/* Projects grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => {
            const c = categoryColors[project.category];
            return (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="glass rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 transition-colors group"
              >
                {/* Top strip */}
                <div
                  className="h-1 w-full"
                  style={{ background: `linear-gradient(90deg, ${project.color}, ${project.color}50)` }}
                />

                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                      style={{ background: c.bg, border: `1px solid ${c.border}` }}
                    >
                      {project.emoji}
                    </div>
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
                    >
                      {project.category === "AI" ? "AI-Built" : project.category === "RE" ? "RE Project" : "Dev"}
                    </span>
                  </div>

                  <h3 className="font-black text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                    {project.desc}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {project.tags.map((tag) => (
                      <span key={tag} className="text-xs px-2.5 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/50">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    <a href={project.github} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      <Github className="w-3.5 h-3.5" /> Code
                    </a>
                    <a href={project.demo} className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" /> Demo
                    </a>
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-12"
        >
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass border border-border/60 text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
          >
            <Github className="w-4 h-4" /> See more on GitHub
          </a>
        </motion.div>
      </div>
    </section>
  );
}
