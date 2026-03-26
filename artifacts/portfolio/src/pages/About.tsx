import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Bot, Smartphone, Zap, Rocket, Github, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const VP = { once: true, amount: 0.05 } as const;

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>About Nayem Hossain – AI Expert &amp; Developer</title>
        <meta name="description" content="Learn about Nayem Hossain — a self-taught Vibe Coder, AI expert, and Android Reverse Engineering explorer from Bangladesh." />
        <meta property="og:title" content="About Nayem Hossain – AI Expert &amp; Developer" />
        <meta property="og:description" content="Self-taught builder who uses AI as a superpower. Vibe Coder, Android RE Explorer, based in Bangladesh." />
        <meta property="og:url" content="https://nayem.me/about" />
        <link rel="canonical" href="https://nayem.me/about" />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-16">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Portfolio
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid lg:grid-cols-2 gap-10 items-start"
          >
            <div>
              <div className="relative inline-block w-full max-w-xs mx-auto lg:mx-0">
                <div className="relative rounded-2xl overflow-hidden glass border border-border/50 shadow-2xl aspect-[3/4]">
                  <img
                    src="/photo2.png"
                    alt="Nayem Hossain"
                    className="w-full h-full object-cover object-top"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
                </div>
              </div>
            </div>

            <div>
              <span className="text-primary text-sm font-semibold tracking-widest uppercase">About Me</span>
              <h1 className="mt-3 text-3xl md:text-4xl font-black leading-tight mb-6">
                About <span className="gradient-text">Nayem Hossain</span>
              </h1>

              <div className="space-y-4 mb-8">
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  I'm Nayem Hossain — a self-taught builder from Bangladesh who figured out that you don't need to be an expert to ship great things. You just need the right tools and the right mindset.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  My thing is <strong className="text-foreground">Vibe Coding</strong> — using AI tools like ChatGPT, Claude, and Cursor to move fast and build things that actually work. I'm not training models or writing papers. I'm getting ideas out of my head and into the world.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  On the side, I've been exploring <strong className="text-foreground">Android reverse engineering</strong> — digging into APKs, understanding how apps work under the hood, bypassing simple protections for fun and learning. It's more of a hobby that became a skill.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  I believe AI is the great equalizer — it lets anyone with curiosity and drive build things that used to require an entire team. That's the future I'm building toward, one project at a time.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {[
                  { icon: Bot, title: "AI as My Superpower", desc: "Using ChatGPT, Claude, and Cursor daily to build faster and smarter.", color: "#f97316" },
                  { icon: Smartphone, title: "Android RE Explorer", desc: "APK analysis, JADX, basic Frida — learning by exploring.", color: "#8b5cf6" },
                  { icon: Zap, title: "Vibe Coding", desc: "Start with the vibe, ship something real. Fast and fun.", color: "#10b981" },
                  { icon: Rocket, title: "Builder Mindset", desc: "Done is better than perfect — but I still make it look good.", color: "#3b82f6" },
                ].map(({ icon: Icon, title, desc, color }, i) => (
                  <motion.div
                    key={title}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
                    className="glass rounded-xl p-4 border border-border/50 hover:border-primary/30 transition-colors"
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                      style={{ background: color + "20" }}
                    >
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                    <div className="text-sm font-bold text-foreground mb-1">{title}</div>
                    <div className="text-xs text-muted-foreground leading-relaxed">{desc}</div>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href="https://github.com/errordrive"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass border border-border/60 text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                >
                  <Github className="w-4 h-4" /> GitHub
                </a>
                <Link
                  to="/#contact"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors"
                >
                  Get in Touch
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
