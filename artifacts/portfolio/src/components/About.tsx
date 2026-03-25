import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Brain, Zap, Shield, Cpu } from "lucide-react";

const highlights = [
  { icon: Brain, title: "AI & Machine Learning", desc: "Building intelligent systems that learn, adapt, and solve real-world problems with cutting-edge LLMs and neural architectures.", color: "#f97316" },
  { icon: Shield, title: "Android Reverse Engineering", desc: "Deep expertise in APK analysis, Frida instrumentation, and bypassing security layers to understand how apps truly work.", color: "#8b5cf6" },
  { icon: Zap, title: "Vibe Coding", desc: "Shipping fast, clean, and beautiful code. I turn ideas into reality with speed and creativity — form meets function.", color: "#10b981" },
  { icon: Cpu, title: "Systems Thinking", desc: "I see the full picture — from low-level binary analysis to high-level architecture decisions that scale.", color: "#3b82f6" },
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
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="relative inline-block">
              {/* Decorative elements */}
              <div className="absolute -top-6 -left-6 w-24 h-24 border-2 border-primary/30 rounded-2xl" />
              <div className="absolute -bottom-6 -right-6 w-24 h-24 border-2 border-violet-500/30 rounded-2xl" />

              <div className="relative rounded-3xl overflow-hidden glass border border-border/50 shadow-2xl max-w-sm mx-auto lg:mx-0">
                <img
                  src="/photo2.png"
                  alt="Nayem — About"
                  className="w-full object-cover"
                  style={{ maxHeight: "500px", objectPosition: "top" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
              </div>

              {/* Floating card */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-4 top-1/3 glass rounded-2xl p-4 border border-primary/20 shadow-xl"
              >
                <div className="text-2xl font-black gradient-text">3+</div>
                <div className="text-xs text-muted-foreground mt-0.5">Years of<br />Deep Expertise</div>
              </motion.div>
            </div>
          </motion.div>

          {/* Content side */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <span className="text-primary text-sm font-semibold tracking-widest uppercase">About Me</span>
            <h2 className="mt-3 text-4xl lg:text-5xl font-black leading-tight mb-6">
              The mind behind
              <br />
              <span className="gradient-text">the machine</span>
            </h2>

            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              I'm <span className="text-foreground font-semibold">Nayem</span> — an AI engineer, reverse engineering specialist, and passionate developer who blends technical depth with creative execution.
            </p>

            <p className="text-muted-foreground leading-relaxed mb-8">
              My journey started with curiosity: <em>how does this really work?</em> That question led me deep into Android internals, binary analysis, and AI systems. Today, I build intelligent tools, reverse-engineer complex apps, and ship beautiful software at the speed of thought — what I call{" "}
              <span className="text-primary font-semibold">Vibe Coding</span>.
            </p>

            <p className="text-muted-foreground leading-relaxed mb-10">
              I believe the best code is invisible — it just works, elegantly and powerfully. Whether I'm training a custom LLM, bypassing APK security, or crafting a pixel-perfect UI, I bring the same obsessive attention to detail.
            </p>

            {/* Highlights grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {highlights.map((h, i) => (
                <motion.div
                  key={h.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                  className="glass rounded-xl p-4 border border-border/50 hover:border-primary/30 transition-colors group"
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
