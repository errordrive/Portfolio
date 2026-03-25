import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { ExternalLink, Github, ArrowRight } from "lucide-react";

const projects = [
  {
    title: "AI Chat Assistant",
    desc: "A production-grade LLM-powered chat assistant with RAG, memory, and multi-model support. Built for enterprise use with custom fine-tuning.",
    tags: ["Python", "LangChain", "OpenAI", "FastAPI", "React"],
    category: "AI",
    color: "#f97316",
    emoji: "🤖",
    github: "#",
    demo: "#",
  },
  {
    title: "APK Security Analyzer",
    desc: "Automated Android APK reverse engineering tool that performs static and dynamic analysis, detects obfuscation, and maps app behavior.",
    tags: ["Python", "Frida", "JADX", "APKTool", "Android"],
    category: "RE",
    color: "#8b5cf6",
    emoji: "🔍",
    github: "#",
    demo: "#",
  },
  {
    title: "Neural Code Review",
    desc: "An AI-powered code review system that identifies bugs, security vulnerabilities, and style issues using fine-tuned LLMs.",
    tags: ["Python", "PyTorch", "HuggingFace", "Docker"],
    category: "AI",
    color: "#f97316",
    emoji: "🧠",
    github: "#",
    demo: "#",
  },
  {
    title: "Android Hook Framework",
    desc: "A custom Frida-based hooking framework for Android runtime analysis, function tracing, and SSL pinning bypass automation.",
    tags: ["Frida", "JavaScript", "Android", "Python"],
    category: "RE",
    color: "#8b5cf6",
    emoji: "🪝",
    github: "#",
    demo: "#",
  },
  {
    title: "Dev Portfolio Generator",
    desc: "AI-powered portfolio website generator — input your details and get a beautiful, unique portfolio site in seconds.",
    tags: ["React", "TypeScript", "OpenAI", "Tailwind"],
    category: "Dev",
    color: "#10b981",
    emoji: "⚡",
    github: "#",
    demo: "#",
  },
  {
    title: "Vibe CLI",
    desc: "A developer productivity CLI tool powered by AI. Automates boilerplate generation, code refactoring, and documentation in seconds.",
    tags: ["Node.js", "TypeScript", "GPT-4", "Shell"],
    category: "Dev",
    color: "#10b981",
    emoji: "🛠️",
    github: "#",
    demo: "#",
  },
];

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  AI: { bg: "rgba(249,115,22,0.12)", text: "#f97316", border: "rgba(249,115,22,0.25)" },
  RE: { bg: "rgba(139,92,246,0.12)", text: "#8b5cf6", border: "rgba(139,92,246,0.25)" },
  Dev: { bg: "rgba(16,185,129,0.12)", text: "#10b981", border: "rgba(16,185,129,0.25)" },
};

export default function Projects() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="projects" className="relative py-24 lg:py-32">
      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-semibold tracking-widest uppercase">Portfolio</span>
          <h2 className="mt-3 text-4xl lg:text-5xl font-black">
            Featured <span className="gradient-text">Projects</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            A selection of projects that showcase my expertise across AI engineering, reverse engineering, and modern development.
          </p>
        </motion.div>

        {/* Projects grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => {
            const c = categoryColors[project.category];
            return (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className="glass rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 transition-all group relative"
              >
                {/* Top colored strip */}
                <div
                  className="h-1 w-full"
                  style={{ background: `linear-gradient(90deg, ${project.color}, ${project.color}60)` }}
                />

                {/* Card content */}
                <div className="p-6">
                  {/* Icon + Category */}
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
                      {project.category === "AI" ? "AI" : project.category === "RE" ? "Reverse Eng" : "Dev"}
                    </span>
                  </div>

                  {/* Title & desc */}
                  <h3 className="font-black text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                    {project.desc}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {project.tags.map((tag) => (
                      <span key={tag} className="text-xs px-2.5 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/50">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Links */}
                  <div className="flex items-center gap-3">
                    <a
                      href={project.github}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Github className="w-3.5 h-3.5" /> Code
                    </a>
                    <a
                      href={project.demo}
                      className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Live Demo
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

        {/* More projects CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-12"
        >
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass border border-border/60 text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
          >
            <Github className="w-4 h-4" /> View all projects on GitHub
          </a>
        </motion.div>
      </div>
    </section>
  );
}
