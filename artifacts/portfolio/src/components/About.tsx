import { motion } from "framer-motion";
import { Zap, Bot, Smartphone, Rocket, Star } from "lucide-react";
import { useContent } from "../hooks/useContent";
import SkeletonSection from "./SkeletonSection";
import type { AboutData, Highlight } from "../lib/api";

const ICON_SET = [Bot, Smartphone, Zap, Rocket, Star];

const DEFAULT_HIGHLIGHTS: Highlight[] = [
  { title: "AI as My Superpower", desc: "I don't fight AI — I ride it. Using tools like ChatGPT, Claude, and Cursor to build faster and smarter than ever before.", color: "#f97316" },
  { title: "Android RE Explorer", desc: "I enjoy poking around Android apps — understanding how things work under the hood, bypassing basic protections, and learning from what I find.", color: "#8b5cf6" },
  { title: "Vibe Coding", desc: "My style: start with the vibe, let AI handle the boilerplate, and ship something that actually works. Fast, fun, and real.", color: "#10b981" },
  { title: "Builder Mindset", desc: "I care about getting things out the door. Done is better than perfect — but I still make it look good.", color: "#3b82f6" },
];

const DEFAULT_ABOUT: AboutData = {
  heading: "Just a guy who vibes with code",
  yearsLabel: "2+",
  bio: [
    "I'm Nayem — a self-taught builder who figured out that you don't need to be an expert to ship great things. You just need the right tools and the right mindset.",
    "My thing is Vibe Coding — using AI tools like ChatGPT, Claude, and Cursor to move fast and build things that actually work. I'm not training models or writing papers. I'm getting ideas out of my head and into the world.",
    "On the side, I've been exploring Android reverse engineering — digging into APKs, understanding how apps work, bypassing simple protections for fun and learning. It's more of a hobby that became a skill.",
  ],
  highlights: DEFAULT_HIGHLIGHTS,
};

const VP = { once: true, amount: 0.05 } as const;

interface AboutProps {
  data?: AboutData;
  visible?: boolean;
}

export default function About({ data: dataProp, visible: visibleProp }: AboutProps = {}) {
  const { data: content, isLoading } = useContent();

  if (isLoading && !content && !dataProp) return <SkeletonSection height="500px" />;

  const section = content?.about;
  const isVisible = visibleProp !== undefined ? visibleProp : section?.visible;
  if (isVisible === false) return null;

  const d: AboutData = dataProp ?? section?.data ?? DEFAULT_ABOUT;
  const highlights = d.highlights?.length ? d.highlights : DEFAULT_HIGHLIGHTS;
  const bio = d.bio?.length ? d.bio : DEFAULT_ABOUT.bio;

  return (
    <section id="about" className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={VP}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="relative inline-block w-full max-w-xs mx-auto lg:mx-0">
              <div className="absolute -top-4 -left-4 w-16 h-16 border-2 border-primary/30 rounded-2xl" />
              <div className="absolute -bottom-4 -right-4 w-16 h-16 border-2 border-violet-500/30 rounded-2xl" />

              <div className="relative rounded-2xl overflow-hidden glass border border-border/50 shadow-2xl aspect-[3/4]">
                <img
                  src="/photo2.png"
                  alt="Nayem — About"
                  className="w-full h-full object-cover object-top"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
              </div>

              <div className="absolute -right-3 sm:-right-6 bottom-4 glass rounded-2xl p-3 border border-primary/20 shadow-xl">
                <div className="text-xl font-black gradient-text">{d.yearsLabel || "2+"}</div>
                <div className="text-xs text-muted-foreground mt-0.5 leading-tight">Years of<br />Building</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={VP}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="text-primary text-sm font-semibold tracking-widest uppercase">About Me</span>
            <h2 className="mt-3 text-2xl sm:text-3xl lg:text-5xl font-black leading-tight mb-6">
              <span className="gradient-text">{d.heading || DEFAULT_ABOUT.heading}</span>
            </h2>

            {bio.map((paragraph, i) => (
              <p key={i} className={`text-muted-foreground ${i === 0 ? "text-sm sm:text-base md:text-lg" : "text-sm sm:text-base"} leading-relaxed ${i < bio.length - 1 ? "mb-6" : "mb-10"}`}>
                {paragraph}
              </p>
            ))}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {highlights.map((h, i) => {
                const IconComponent = ICON_SET[i % ICON_SET.length];
                return (
                  <motion.div
                    key={h.title}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={VP}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className="glass rounded-xl p-4 border border-border/50 hover:border-primary/30 transition-colors"
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                      style={{ background: (h.color || "#f97316") + "20" }}
                    >
                      <IconComponent className="w-4 h-4" style={{ color: h.color || "#f97316" }} />
                    </div>
                    <div className="text-sm font-bold text-foreground mb-1">{h.title}</div>
                    <div className="text-xs text-muted-foreground leading-relaxed">{h.desc}</div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
