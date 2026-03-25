import { type Variants, motion } from "framer-motion";
import { Download, ArrowRight, ChevronDown } from "lucide-react";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const roles = ["Vibe Coder", "AI-Powered Builder", "Android RE Explorer"];

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Static background — no animate-pulse, no blur-3xl */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/6 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Text content */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="order-2 lg:order-1"
          >
            <motion.div variants={item} className="mb-4">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm font-medium text-primary border border-primary/20">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Open to collaborate
              </span>
            </motion.div>

            <motion.h1 variants={item} className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-4">
              <span className="text-foreground">Hi, I'm </span>
              <span className="gradient-text neon-text-glow">Nayem</span>
            </motion.h1>

            <motion.div variants={item} className="mb-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {roles.map((role, i) => (
                  <span
                    key={role}
                    className="px-3 py-1 rounded-md text-sm font-semibold"
                    style={{
                      background: i === 0 ? "rgba(139,92,246,0.15)" : i === 1 ? "rgba(249,115,22,0.15)" : "rgba(16,185,129,0.15)",
                      color: i === 0 ? "#8b5cf6" : i === 1 ? "#f97316" : "#10b981",
                      border: `1px solid ${i === 0 ? "rgba(139,92,246,0.3)" : i === 1 ? "rgba(249,115,22,0.3)" : "rgba(16,185,129,0.3)"}`,
                    }}
                  >
                    {role}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.p variants={item} className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl">
              I get ideas off the ground fast — using AI as my superpower.{" "}
              <span className="text-foreground font-medium">I don't just write code, I vibe with it.</span>{" "}
              Building cool stuff, exploring Android internals, and letting AI do the heavy lifting.
            </motion.p>

            <motion.div variants={item} className="flex flex-wrap gap-4">
              <motion.a
                href="#projects"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-sm neon-glow hover:bg-primary/90 transition-colors"
              >
                View Work <ArrowRight className="w-4 h-4" />
              </motion.a>
              <motion.a
                href="mailto:nayem@nayem.me?subject=CV%20Request&body=Hi%20Nayem%2C%20I%27d%20like%20to%20request%20your%20CV."
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl glass text-foreground font-bold text-sm border border-border hover:border-primary/40 transition-colors"
              >
                <Download className="w-4 h-4" /> Download CV
              </motion.a>
            </motion.div>

            {/* Stats — honest numbers */}
            <motion.div variants={item} className="mt-12 flex gap-8">
              {[
                { label: "Projects Shipped", value: "20+" },
                { label: "AI Tools I Use", value: "15+" },
                { label: "Apps Explored", value: "50+" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-black gradient-text">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Photo */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="order-1 lg:order-2 flex justify-center lg:justify-end"
          >
            <div className="relative">
              {/* Static glow — no animation */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/30 to-violet-500/15 blur-xl" />

              {/* Card */}
              <div className="relative w-72 sm:w-80 lg:w-96 rounded-3xl overflow-hidden glass border border-primary/20 shadow-2xl">
                <img
                  src="/photo1.png"
                  alt="Nayem — Vibe Coder"
                  className="w-full object-cover object-top"
                  loading="eager"
                  style={{ maxHeight: "480px", minHeight: "380px" }}
                />
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background/80 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 glass rounded-xl px-4 py-3 border border-primary/20">
                  <div className="text-sm font-bold text-foreground">Nayem</div>
                  <div className="text-xs text-primary mt-0.5">Vibe Coder · AI User · Android RE Explorer</div>
                </div>
              </div>

              {/* Simple static badges — no infinite animation */}
              <div className="absolute -top-4 -right-4 glass rounded-2xl px-3 py-2 border border-violet-500/30 shadow-lg">
                <div className="text-xs font-bold text-violet-400">✨ Vibe Coder</div>
              </div>

              <div className="absolute -bottom-4 -left-4 glass rounded-2xl px-3 py-2 border border-primary/30 shadow-lg">
                <div className="text-xs font-bold text-primary">🤖 AI-Powered</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator — CSS animation, no Framer Motion loop */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-muted-foreground animate-bounce-slow">
        <span className="text-xs">Scroll</span>
        <ChevronDown className="w-4 h-4" />
      </div>
    </section>
  );
}
