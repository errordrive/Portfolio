import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const skills = [
  { name: "Artificial Intelligence", icon: "🤖", level: 95, category: "AI", desc: "LLMs, RAG, Fine-tuning, Agents" },
  { name: "Machine Learning", icon: "🧠", level: 90, category: "AI", desc: "PyTorch, TensorFlow, Scikit-learn" },
  { name: "Python", icon: "🐍", level: 95, category: "Dev", desc: "FastAPI, Django, async patterns" },
  { name: "Android RE", icon: "🔓", level: 93, category: "RE", desc: "APK analysis, decompilation" },
  { name: "Frida Framework", icon: "🪝", level: 88, category: "RE", desc: "Dynamic instrumentation, hooks" },
  { name: "APKTool / JADX", icon: "🛠️", level: 90, category: "RE", desc: "Static analysis, patching" },
  { name: "React / Next.js", icon: "⚛️", level: 88, category: "Dev", desc: "Modern frontend development" },
  { name: "TypeScript", icon: "📘", level: 85, category: "Dev", desc: "Type-safe full-stack apps" },
  { name: "Node.js", icon: "🟢", level: 85, category: "Dev", desc: "Express, APIs, microservices" },
  { name: "Prompt Engineering", icon: "✨", level: 97, category: "AI", desc: "System prompts, chains, agents" },
  { name: "Linux / Shell", icon: "🐧", level: 90, category: "Dev", desc: "Bash, automation, system admin" },
  { name: "Docker / DevOps", icon: "🐳", level: 78, category: "Dev", desc: "Containers, CI/CD pipelines" },
];

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  AI: { bg: "rgba(249,115,22,0.12)", text: "#f97316", border: "rgba(249,115,22,0.25)" },
  RE: { bg: "rgba(139,92,246,0.12)", text: "#8b5cf6", border: "rgba(139,92,246,0.25)" },
  Dev: { bg: "rgba(16,185,129,0.12)", text: "#10b981", border: "rgba(16,185,129,0.25)" },
};

export default function Skills() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="skills" className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20" />

      <div ref={ref} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-semibold tracking-widest uppercase">Skills</span>
          <h2 className="mt-3 text-4xl lg:text-5xl font-black">
            My <span className="gradient-text">Arsenal</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            A curated set of skills honed through real projects, deep research, and a relentless drive to master every tool I touch.
          </p>

          {/* Category legend */}
          <div className="flex justify-center gap-4 mt-6">
            {Object.entries(categoryColors).map(([cat, c]) => (
              <span
                key={cat}
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
              >
                {cat === "AI" ? "🤖 AI" : cat === "RE" ? "🔓 Reverse Eng" : "💻 Development"}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Skills grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {skills.map((skill, i) => {
            const c = categoryColors[skill.category];
            return (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="glass rounded-2xl p-5 border border-border/50 hover:border-primary/30 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                      style={{ background: c.bg, border: `1px solid ${c.border}` }}
                    >
                      {skill.icon}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-foreground">{skill.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{skill.desc}</div>
                    </div>
                  </div>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-md"
                    style={{ background: c.bg, color: c.text }}
                  >
                    {skill.level}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 bg-border/50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={inView ? { width: `${skill.level}%` } : {}}
                    transition={{ duration: 1, delay: 0.4 + i * 0.06, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${c.text}, ${c.text}99)` }}
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
