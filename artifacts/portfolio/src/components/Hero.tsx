import { motion } from "framer-motion";
import { Download, ArrowRight, ChevronDown } from "lucide-react";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const roles = ["AI Expert", "Vibe Coder", "Android Reverse Engineer"];

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-violet-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

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
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Available for opportunities
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
                      background: i === 0 ? "rgba(249,115,22,0.15)" : i === 1 ? "rgba(139,92,246,0.15)" : "rgba(16,185,129,0.15)",
                      color: i === 0 ? "#f97316" : i === 1 ? "#8b5cf6" : "#10b981",
                      border: `1px solid ${i === 0 ? "rgba(249,115,22,0.3)" : i === 1 ? "rgba(139,92,246,0.3)" : "rgba(16,185,129,0.3)"}`,
                    }}
                  >
                    {role}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.p variants={item} className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl">
              I build intelligent systems, decode complex binaries, and craft experiences that push the boundary of what's possible.{" "}
              <span className="text-foreground font-medium">Code is my art — AI is my medium.</span>
            </motion.p>

            <motion.div variants={item} className="flex flex-wrap gap-4">
              <motion.a
                href="#projects"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
                }}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-sm neon-glow hover:bg-primary/90 transition-all"
              >
                View Work <ArrowRight className="w-4 h-4" />
              </motion.a>
              <motion.a
                href="mailto:nayem@nayem.me?subject=CV%20Request&body=Hi%20Nayem%2C%20I%27d%20like%20to%20request%20your%20CV."
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl glass text-foreground font-bold text-sm border border-border hover:border-primary/40 transition-all"
              >
                <Download className="w-4 h-4" /> Download CV
              </motion.a>
            </motion.div>

            {/* Stats */}
            <motion.div variants={item} className="mt-12 flex gap-8">
              {[
                { label: "Projects Built", value: "50+" },
                { label: "Apps Reversed", value: "200+" },
                { label: "AI Models", value: "30+" },
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
            initial={{ opacity: 0, scale: 0.85, x: 40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="order-1 lg:order-2 flex justify-center lg:justify-end"
          >
            <div className="relative">
              {/* Glow ring */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/40 to-violet-500/20 blur-2xl scale-110" />

              {/* Card */}
              <div className="relative w-72 sm:w-80 lg:w-96 rounded-3xl overflow-hidden glass border border-primary/20 shadow-2xl">
                <img
                  src="/photo1.png"
                  alt="Nayem — AI Expert & Developer"
                  className="w-full h-full object-cover object-top"
                  style={{ maxHeight: "480px", minHeight: "380px" }}
                />
                {/* Overlay gradient at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background/80 to-transparent" />
                {/* Badge */}
                <div className="absolute bottom-4 left-4 right-4 glass rounded-xl px-4 py-3 border border-primary/20">
                  <div className="text-sm font-bold text-foreground">Nayem</div>
                  <div className="text-xs text-primary mt-0.5">AI Expert · Vibe Coder · Reverse Engineer</div>
                </div>
              </div>

              {/* Floating badge */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 glass rounded-2xl px-3 py-2 border border-primary/30 shadow-lg"
              >
                <div className="text-xs font-bold text-primary">🤖 AI Expert</div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-4 -left-4 glass rounded-2xl px-3 py-2 border border-violet-500/30 shadow-lg"
              >
                <div className="text-xs font-bold text-violet-400">🔓 RE Expert</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-muted-foreground"
      >
        <span className="text-xs">Scroll</span>
        <ChevronDown className="w-4 h-4" />
      </motion.div>
    </section>
  );
}
