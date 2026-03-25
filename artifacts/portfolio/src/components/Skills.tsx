import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const skills = [
  { name: "Vibe Coding", icon: "✨", level: 95, category: "Craft", desc: "Ship fast, iterate faster, stay in the flow" },
  { name: "AI Tool Usage", icon: "🤖", level: 92, category: "AI", desc: "ChatGPT, Claude, Cursor, Gemini & more" },
  { name: "Prompt Engineering", icon: "💬", level: 88, category: "AI", desc: "Getting AI to do exactly what you need" },
  { name: "Android RE Basics", icon: "🔓", level: 65, category: "RE", desc: "APK analysis, JADX, basic Frida usage" },
  { name: "Web Development", icon: "🌐", level: 75, category: "Dev", desc: "React, HTML/CSS, basic backend stuff" },
  { name: "Python Scripting", icon: "🐍", level: 70, category: "Dev", desc: "Automation, quick scripts, AI integrations" },
  { name: "Linux / Shell", icon: "🐧", level: 72, category: "Dev", desc: "Terminal comfort, basic bash scripting" },
  { name: "Builder Mindset", icon: "🚀", level: 98, category: "Craft", desc: "Ideas → shipped products, fast and fun" },
];

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  AI:    { bg: "rgba(249,115,22,0.12)",  text: "#f97316", border: "rgba(249,115,22,0.25)" },
  RE:    { bg: "rgba(139,92,246,0.12)",  text: "#8b5cf6", border: "rgba(139,92,246,0.25)" },
  Dev:   { bg: "rgba(16,185,129,0.12)",  text: "#10b981", border: "rgba(16,185,129,0.25)" },
  Craft: { bg: "rgba(59,130,246,0.12)",  text: "#3b82f6", border: "rgba(59,130,246,0.25)" },
};

export default function Skills() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="skills" className="relative py-24 lg:py-32 overflow-hidden">
      <div ref={ref} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="text-primary text-sm font-semibold tracking-widest uppercase">Skills</span>
          <h2 className="mt-3 text-4xl lg:text-5xl font-black">
            What I actually <span className="gradient-text">know</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Honest skills, honest levels. No fake expertise — just what I genuinely do and how comfortable I am doing it.
          </p>

          {/* Category legend */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {Object.entries(categoryColors).map(([cat, c]) => (
              <span
                key={cat}
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
              >
                {cat === "AI" ? "🤖 AI Tools" : cat === "RE" ? "🔓 Android RE" : cat === "Dev" ? "💻 Dev" : "✨ Craft"}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Skills grid — 2 cols on sm, 4 cols on lg for fewer render items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {skills.map((skill, i) => {
            const c = categoryColors[skill.category];
            return (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                whileHover={{ y: -3, transition: { duration: 0.15 } }}
                className="glass rounded-2xl p-5 border border-border/50 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{ background: c.bg, border: `1px solid ${c.border}` }}
                  >
                    {skill.icon}
                  </div>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-md"
                    style={{ background: c.bg, color: c.text }}
                  >
                    {skill.level}%
                  </span>
                </div>

                <div className="font-bold text-sm text-foreground mb-1">{skill.name}</div>
                <div className="text-xs text-muted-foreground mb-3 leading-relaxed">{skill.desc}</div>

                {/* Progress bar */}
                <div className="h-1.5 bg-border/50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={inView ? { width: `${skill.level}%` } : {}}
                    transition={{ duration: 0.8, delay: 0.3 + i * 0.05, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${c.text}, ${c.text}80)` }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
