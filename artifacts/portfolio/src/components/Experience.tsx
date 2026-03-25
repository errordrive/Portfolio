import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const timeline = [
  {
    year: "2025–Now",
    title: "Full-time Vibe Coder",
    org: "Self / Freelance",
    desc: "Shipping projects using AI tools every day. ChatGPT, Claude, Cursor — these are my team. Building things I find useful, learning by doing.",
    tags: ["AI Tools", "React", "Cursor", "Ship Fast"],
    color: "#f97316",
  },
  {
    year: "2024",
    title: "Discovered Vibe Coding",
    org: "Self-directed",
    desc: "Found out you don't need to be a 10x engineer to build great things — you just need to use AI smartly. This changed everything for me.",
    tags: ["ChatGPT", "Claude", "Prompt Engineering"],
    color: "#8b5cf6",
  },
  {
    year: "2024",
    title: "Started Android RE",
    org: "Hobby & Learning",
    desc: "Got curious about how Android apps work under the hood. Started using JADX and basic Frida to explore APKs. Still learning, still enjoying it.",
    tags: ["JADX", "Frida", "Android", "APKTool"],
    color: "#10b981",
  },
  {
    year: "2023",
    title: "First Real Project Shipped",
    org: "Personal",
    desc: "Built and deployed my first working web app. It wasn't pretty, but it worked. That feeling of shipping something real got me hooked.",
    tags: ["HTML", "CSS", "JavaScript", "First Ship"],
    color: "#3b82f6",
  },
  {
    year: "2022",
    title: "Started the Journey",
    org: "Beginner",
    desc: "Wrote my first lines of Python. Fell in love with the idea that you can build literally anything with code. Still chasing that feeling.",
    tags: ["Python", "Basics", "YouTube Tutorials"],
    color: "#f97316",
  },
];

export default function Experience() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="experience" className="relative py-24 lg:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent" />

      <div ref={ref} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="text-primary text-sm font-semibold tracking-widest uppercase">Journey</span>
          <h2 className="mt-3 text-4xl lg:text-5xl font-black">
            How I got <span className="gradient-text">here</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            No fancy degrees or corporate titles — just a self-taught builder who figured things out along the way.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative max-w-3xl mx-auto">
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-border/40 to-transparent" />

          <div className="space-y-8">
            {timeline.map((entry, i) => (
              <motion.div
                key={entry.year + entry.title}
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative pl-20"
              >
                {/* Dot */}
                <div
                  className="absolute left-[26px] top-5 w-5 h-5 rounded-full border-2 border-background flex items-center justify-center"
                  style={{ background: entry.color, boxShadow: `0 0 10px ${entry.color}50` }}
                >
                  <div className="w-2 h-2 rounded-full bg-white/80" />
                </div>

                {/* Year */}
                <div
                  className="absolute left-[-8px] top-3 text-xs font-black px-2 py-0.5 rounded-md whitespace-nowrap"
                  style={{ color: entry.color, background: entry.color + "15", border: `1px solid ${entry.color}30` }}
                >
                  {entry.year}
                </div>

                {/* Card */}
                <div className="glass rounded-2xl p-5 border border-border/50 hover:border-primary/30 transition-colors">
                  <h3 className="font-black text-foreground">{entry.title}</h3>
                  <div className="text-sm text-muted-foreground mt-0.5 mb-3">{entry.org}</div>
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
