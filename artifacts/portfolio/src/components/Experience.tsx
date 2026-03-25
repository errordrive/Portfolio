import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const timeline = [
  {
    year: "2026",
    title: "Senior AI Engineer",
    org: "Independent / Freelance",
    desc: "Building production AI systems — LLM-powered agents, RAG pipelines, and custom fine-tuned models for global clients.",
    tags: ["LLMs", "RAG", "Python", "LangChain"],
    color: "#f97316",
  },
  {
    year: "2025",
    title: "Android RE Specialist",
    org: "Security Research",
    desc: "Deep-dived into Android internals. Developed automated APK analysis tools, SSL pinning bypass frameworks, and documented critical app vulnerabilities.",
    tags: ["Frida", "APKTool", "JADX", "Android"],
    color: "#8b5cf6",
  },
  {
    year: "2024",
    title: "Full-Stack Developer",
    org: "Various Startups",
    desc: "Built and shipped multiple SaaS products. Led frontend architecture decisions and designed scalable backend APIs using modern stacks.",
    tags: ["React", "Node.js", "TypeScript", "PostgreSQL"],
    color: "#10b981",
  },
  {
    year: "2023",
    title: "AI / ML Explorer",
    org: "Self-directed Learning",
    desc: "Began deep learning journey — studying transformers, training models, experimenting with generative AI and prompt engineering at scale.",
    tags: ["PyTorch", "HuggingFace", "Python", "AI Research"],
    color: "#f97316",
  },
  {
    year: "2022",
    title: "Started Coding Journey",
    org: "Computer Science Student",
    desc: "Wrote first lines of code. Fell in love with programming, Linux, and the limitless possibilities of software. Never looked back.",
    tags: ["Python", "Linux", "Web Basics"],
    color: "#3b82f6",
  },
];

export default function Experience() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="experience" className="relative py-24 lg:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent" />

      <div ref={ref} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-semibold tracking-widest uppercase">Journey</span>
          <h2 className="mt-3 text-4xl lg:text-5xl font-black">
            My <span className="gradient-text">Story</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            A timeline of growth, exploration, and relentless pursuit of mastery across AI, security, and software engineering.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative max-w-3xl mx-auto">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-border/50 to-transparent" />

          <div className="space-y-8">
            {timeline.map((entry, i) => (
              <motion.div
                key={entry.year + entry.title}
                initial={{ opacity: 0, x: -30 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="relative pl-20"
              >
                {/* Dot */}
                <div
                  className="absolute left-[26px] top-5 w-5 h-5 rounded-full border-2 border-background flex items-center justify-center"
                  style={{ background: entry.color, boxShadow: `0 0 12px ${entry.color}60` }}
                >
                  <div className="w-2 h-2 rounded-full bg-white/80" />
                </div>

                {/* Year badge */}
                <div
                  className="absolute left-[-2px] top-3 text-xs font-black px-2 py-0.5 rounded-md"
                  style={{ color: entry.color, background: entry.color + "15", border: `1px solid ${entry.color}30` }}
                >
                  {entry.year}
                </div>

                {/* Card */}
                <div className="glass rounded-2xl p-5 border border-border/50 hover:border-primary/30 transition-colors">
                  <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
                    <div>
                      <h3 className="font-black text-foreground">{entry.title}</h3>
                      <div className="text-sm text-muted-foreground mt-0.5">{entry.org}</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{entry.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {entry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2.5 py-0.5 rounded-md"
                        style={{ background: entry.color + "15", color: entry.color, border: `1px solid ${entry.color}30` }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
