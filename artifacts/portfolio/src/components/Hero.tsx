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

interface HeroProps {
  data?: HeroData;
  visible?: boolean;
}

export default function Hero({ data: dataProp, visible: visibleProp }: HeroProps = {}) {
  const { data: content, isLoading } = useContent();
  const { cvUrl } = useSiteSettings();

  if (isLoading && !content && !dataProp) return <SkeletonHero />;

  const section = content?.hero;
  const isVisible = visibleProp !== undefined ? visibleProp : section?.visible;
  if (isVisible === false) return null;

  const d: HeroData = dataProp ?? section?.data ?? DEFAULT_HERO;
  const roles = d.roles?.length ? d.roles : DEFAULT_ROLES;

  const validCvUrl = cvUrl && !cvUrl.includes("example.com") ? cvUrl : null;

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[280px] h-[280px] bg-violet-500/4 rounded-full blur-[80px] pointer-events-none" />

      {/* Image — absolutely anchored to top-right corner, desktop only */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        className="hidden sm:block absolute top-16 right-4 sm:right-6 lg:right-10"
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/30 to-violet-500/15 blur-xl" />

          <div className="relative w-36 sm:w-44 lg:w-56 aspect-[3/4] rounded-2xl overflow-hidden glass border border-primary/20 shadow-2xl">
            <img
              src="/photo1.png"
              alt={`${d.name} — Vibe Coder`}
              className="w-full h-full object-cover object-top"
              loading="eager"
            />
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background/80 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 glass rounded-xl px-3 py-2 border border-primary/20">
              <div className="text-xs font-bold text-foreground">{d.name}</div>
              <div className="text-[10px] text-primary mt-0.5 leading-tight">Vibe Coder · AI User · Android RE</div>
            </div>
          </div>

          <div className="absolute -top-3 -right-3 glass rounded-xl px-2.5 py-1.5 border border-violet-500/30 shadow-lg">
            <div className="text-[10px] font-bold text-violet-400">✨ Vibe Coder</div>
          </div>

          <div className="absolute -bottom-3 -left-3 glass rounded-xl px-2.5 py-1.5 border border-primary/30 shadow-lg">
            <div className="text-[10px] font-bold text-primary">🤖 AI-Powered</div>
          </div>
        </div>
      </motion.div>

      {/* Text content — left side */}
      <div className="relative max-w-6xl mx-auto px-4 md:px-6 pt-20 pb-12 w-full">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="sm:max-w-[320px] md:max-w-[460px] lg:max-w-xl xl:max-w-2xl"
        >
          <motion.div variants={item} className="mb-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm font-medium text-primary border border-primary/20">
              <span className="w-2 h-2 rounded-full bg-primary" />
              {d.statusBadge || "Open to collaborate"}
            </span>
          </motion.div>

          <motion.h1 variants={item} className="text-3xl md:text-4xl lg:text-5xl font-black leading-[1.05] tracking-tight mb-4">
            <span className="text-foreground">Hi, I'm </span>
            <span className="gradient-text neon-text-glow">{d.name}</span>
          </motion.h1>

          {d.tagline && (
            <motion.p variants={item} className="text-sm sm:text-lg font-semibold text-foreground/80 mb-4 max-w-lg">
              {d.tagline}
            </motion.p>
          )}

          <motion.div variants={item} className="mb-5">
            <div className="flex flex-wrap gap-2 mb-4">
              {roles.map((role, i) => {
                const c = ROLE_COLORS[i % ROLE_COLORS.length];
                return (
                  <span
                    key={role}
                    className="px-3 py-1 rounded-md text-xs font-semibold"
                    style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}
                  >
                    {role}
                  </span>
                );
              })}
            </div>
          </motion.div>

          <motion.p variants={item} className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-7 max-w-lg">
            {d.body}
          </motion.p>

          <motion.div variants={item} className="flex flex-wrap gap-3">
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
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-bold text-sm neon-glow hover:bg-primary/90 transition-colors"
            >
              {d.ctaPrimary.label || "View Work"} <ArrowRight className="w-4 h-4" />
            </motion.a>
            {validCvUrl && (
              <motion.a
                href={validCvUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl glass text-foreground font-bold text-sm border border-border hover:border-primary/40 transition-colors"
              >
                <Download className="w-4 h-4" /> {d.ctaSecondary.label || "Download CV"}
              </motion.a>
            )}
          </motion.div>

          <motion.div variants={item} className="mt-8 lg:mt-10 grid grid-cols-3 gap-3 sm:gap-8 max-w-xs sm:max-w-sm">
            {(d.stats?.length ? d.stats : DEFAULT_HERO.stats).map((stat) => (
              <div key={stat.label}>
                <div className="text-lg sm:text-xl font-black gradient-text">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5 leading-tight">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Mobile-only compact image — stacked naturally below stats */}
          <motion.div variants={item} className="block sm:hidden mt-8">
            <div className="relative mx-auto w-44">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/30 to-violet-500/15 blur-xl" />
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden glass border border-primary/20 shadow-2xl">
                <img
                  src="/photo1.png"
                  alt={`${d.name} — Vibe Coder`}
                  className="w-full h-full object-cover object-top"
                  loading="eager"
                />
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background/80 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2 glass rounded-lg px-2.5 py-1.5 border border-primary/20">
                  <div className="text-xs font-bold text-foreground">{d.name}</div>
                  <div className="text-[10px] text-primary mt-0.5 leading-tight">Vibe Coder · AI User · Android RE</div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-muted-foreground animate-bounce-slow pointer-events-none">
        <span className="text-xs">Scroll</span>
        <ChevronDown className="w-4 h-4" />
      </div>
    </section>
  );
}
