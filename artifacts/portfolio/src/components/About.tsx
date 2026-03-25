import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Zap, Bot, Smartphone, Rocket } from "lucide-react";

const highlights = [
  {
    icon: Bot,
    title: "AI as My Superpower",
    desc: "I don't fight AI — I ride it. Using tools like ChatGPT, Claude, and Cursor to build faster and smarter than ever before.",
    color: "#f97316",
  },
  {
    icon: Smartphone,
    title: "Android RE Explorer",
    desc: "I enjoy poking around Android apps — understanding how things work under the hood, bypassing basic protections, and learning from what I find.",
    color: "#8b5cf6",
  },
  {
    icon: Zap,
    title: "Vibe Coding",
    desc: "My style: start with the vibe, let AI handle the boilerplate, and ship something that actually works. Fast, fun, and real.",
    color: "#10b981",
  },
  {
    icon: Rocket,
    title: "Builder Mindset",
    desc: "I care about getting things out the door. Done is better than perfect — but I still make it look good.",
    color: "#3b82f6",
  },
];

export default function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="about" className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent" />

      <div ref={ref} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Photo side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="relative inline-block">
              {/* Decorative corners */}
              <div className="absolute -top-6 -left-6 w-24 h-24 border-2 border-primary/30 rounded-2xl" />
              <div className="absolute -bottom-6 -right-6 w-24 h-24 border-2 border-violet-500/30 rounded-2xl" />

              <div className="relative rounded-3xl overflow-hidden glass border border-border/50 shadow-2xl max-w-sm mx-auto lg:mx-0">
                <img
                  src="/photo2.png"
                  alt="Nayem — About"
                  className="w-full object-cover"
                  loading="lazy"
                  style={{ maxHeight: "500px", objectPosition: "top" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
              </div>

              {/* Static badge — no infinite animation */}
              <div className="absolute -right-4 top-1/3 glass rounded-2xl p-4 border border-primary/20 shadow-xl">
                <div className="text-2xl font-black gradient-text">2+</div>
                <div className="text-xs text-muted-foreground mt-0.5">Years of<br />Building Stuff</div>
              </div>
            </div>
          </motion.div>

          {/* Content side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="text-primary text-sm font-semibold tracking-widest uppercase">About Me</span>
            <h2 className="mt-3 text-4xl lg:text-5xl font-black leading-tight mb-6">
              Just a guy who
              <br />
              <span className="gradient-text">vibes with code</span>
            </h2>

            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              I'm <span className="text-foreground font-semibold">Nayem</span> — a self-taught builder who figured out that you don't need to be an expert to ship great things. You just need the right tools and the right mindset.
            </p>

            <p className="text-muted-foreground leading-relaxed mb-8">
              My thing is <span className="text-primary font-semibold">Vibe Coding</span> — using AI tools like ChatGPT, Claude, and Cursor to move fast and build things that actually work. I'm not training models or writing papers. I'm getting ideas out of my head and into the world.
            </p>

            <p className="text-muted-foreground leading-relaxed mb-10">
              On the side, I've been exploring Android reverse engineering — digging into APKs, understanding how apps work, bypassing simple protections for fun and learning. It's more of a hobby that became a skill.
            </p>

            {/* Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {highlights.map((h, i) => (
                <motion.div
                  key={h.title}
                  initial={{ opacity: 0, y: 15 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.25 + i * 0.08 }}
                  className="glass rounded-xl p-4 border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: h.color + "20" }}>
                    <h.icon className="w-4 h-4" style={{ color: h.color }} />
                  </div>
                  <div className="text-sm font-bold text-foreground mb-1">{h.title}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{h.desc}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
