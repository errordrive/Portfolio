import { type Variants, motion } from "framer-motion";
import { Download, ArrowRight, ChevronDown } from "lucide-react";
import { useContent } from "../hooks/useContent";
import { useSiteSettings } from "../hooks/useSiteSettings";
import { SkeletonHero } from "./SkeletonSection";
import type { HeroData } from "../lib/api";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const DEFAULT_ROLES = ["Vibe Coder", "AI-Powered Builder", "Android RE Explorer"];

const DEFAULT_HERO: HeroData = {
  name: "Nayem",
  statusBadge: "Open to collaborate",
  tagline: "",
  body: "I get ideas off the ground fast — using AI as my superpower. I don't just write code, I vibe with it. Building cool stuff, exploring Android internals, and letting AI do the heavy lifting.",
  roles: DEFAULT_ROLES,
  ctaPrimary: { label: "View Work", href: "#projects" },
  ctaSecondary: { label: "Download CV", href: "" },
  stats: [
    { label: "Projects Shipped", value: "20+" },
    { label: "AI Tools I Use", value: "15+" },
    { label: "Apps Explored", value: "50+" },
  ],
};

const ROLE_COLORS = [
  { bg: "rgba(139,92,246,0.15)", color: "#8b5cf6", border: "rgba(139,92,246,0.3)" },
  { bg: "rgba(249,115,22,0.15)", color: "#f97316", border: "rgba(249,115,22,0.3)" },
  { bg: "rgba(16,185,129,0.15)", color: "#10b981", border: "rgba(16,185,129,0.3)" },
  { bg: "rgba(59,130,246,0.15)", color: "#3b82f6", border: "rgba(59,130,246,0.3)" },
];

export default function Hero() {
  const { data: content, isLoading } = useContent();
  const { cvUrl } = useSiteSettings();

  if (isLoading && !content) return <SkeletonHero />;

  const section = content?.hero;
  if (section?.visible === false) return null;

  const d: HeroData = section?.data ?? DEFAULT_HERO;
  const roles = d.roles?.length ? d.roles : DEFAULT_ROLES;

  const cvHref = cvUrl || d.ctaSecondary.href || "mailto:nayem@nayem.me?subject=CV%20Request";

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/6 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="order-2 lg:order-1"
          >
            <motion.div variants={item} className="mb-4">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm font-medium text-primary border border-primary/20">
                <span className="w-2 h-2 rounded-full bg-primary" />
                {d.statusBadge || "Open to collaborate"}
              </span>
            </motion.div>

            <motion.h1 variants={item} className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-4">
              <span className="text-foreground">Hi, I'm </span>
              <span className="gradient-text neon-text-glow">{d.name}</span>
            </motion.h1>

            <motion.div variants={item} className="mb-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {roles.map((role, i) => {
                  const c = ROLE_COLORS[i % ROLE_COLORS.length];
                  return (
                    <span
                      key={role}
                      className="px-3 py-1 rounded-md text-sm font-semibold"
                      style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}
                    >
                      {role}
                    </span>
                  );
                })}
              </div>
            </motion.div>

            <motion.p variants={item} className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl">
              {d.body}
            </motion.p>

            <motion.div variants={item} className="flex flex-wrap gap-4">
              <motion.a
                href={d.ctaPrimary.href || "#projects"}
                onClick={(e) => {
                  const href = d.ctaPrimary.href || "#projects";
                  if (href.startsWith("#")) {
                    e.preventDefault();
                    document.getElementById(href.replace("#", ""))?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-sm neon-glow hover:bg-primary/90 transition-colors"
              >
                {d.ctaPrimary.label || "View Work"} <ArrowRight className="w-4 h-4" />
              </motion.a>
              <motion.a
                href={cvHref}
                target={cvUrl ? "_blank" : undefined}
                rel={cvUrl ? "noopener noreferrer" : undefined}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl glass text-foreground font-bold text-sm border border-border hover:border-primary/40 transition-colors"
              >
                <Download className="w-4 h-4" /> {d.ctaSecondary.label || "Download CV"}
              </motion.a>
            </motion.div>

            <motion.div variants={item} className="mt-12 flex gap-8">
              {(d.stats?.length ? d.stats : DEFAULT_HERO.stats).map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-black gradient-text">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="order-1 lg:order-2 flex justify-center lg:justify-end"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/30 to-violet-500/15 blur-xl" />

              <div className="relative w-72 sm:w-80 lg:w-96 rounded-3xl overflow-hidden glass border border-primary/20 shadow-2xl">
                <img
                  src="/photo1.png"
                  alt={`${d.name} — Vibe Coder`}
                  className="w-full object-cover object-top"
                  loading="eager"
                  style={{ maxHeight: "480px", minHeight: "380px" }}
                />
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background/80 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 glass rounded-xl px-4 py-3 border border-primary/20">
                  <div className="text-sm font-bold text-foreground">{d.name}</div>
                  <div className="text-xs text-primary mt-0.5">Vibe Coder · AI User · Android RE Explorer</div>
                </div>
              </div>

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

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-muted-foreground animate-bounce-slow">
        <span className="text-xs">Scroll</span>
        <ChevronDown className="w-4 h-4" />
      </div>
    </section>
  );
}
