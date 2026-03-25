import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Send, Github, Linkedin, Twitter, MessageCircle, Mail, MapPin, ExternalLink, CheckCircle, AlertCircle } from "lucide-react";
import { api } from "../lib/api";
import { useContent } from "../hooks/useContent";
import SkeletonSection from "./SkeletonSection";
import type { ContactData } from "../lib/api";

const ICON_MAP: Record<string, typeof Github> = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  telegram: MessageCircle,
};

const DEFAULT_SOCIALS = [
  { platform: "github", label: "GitHub", href: "https://github.com" },
  { platform: "linkedin", label: "LinkedIn", href: "https://linkedin.com" },
  { platform: "twitter", label: "Twitter/X", href: "https://twitter.com" },
  { platform: "telegram", label: "Telegram", href: "https://t.me" },
];

const DEFAULT_CONTACT: ContactData = {
  bio: "Whether you need an AI solution, want to reverse engineer something, or just want to vibe-code together — I'm just a message away.",
  email: "nayem@nayem.me",
  location: "Bangladesh 🇧🇩",
  socials: DEFAULT_SOCIALS,
};

type FormStatus = "idle" | "sending" | "success" | "error";

interface ContactProps {
  data?: ContactData;
  visible?: boolean;
}

export default function Contact({ data: dataProp, visible: visibleProp }: ContactProps = {}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.05 });
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const { data: content, isLoading: contentLoading } = useContent();

  if (contentLoading && !content && !dataProp && visibleProp === undefined) {
    return <SkeletonSection height="400px" />;
  }

  const section = content?.contact;
  const isVisible = visibleProp !== undefined ? visibleProp : section?.visible;
  if (isVisible === false) return null;

  const d: ContactData = dataProp ?? section?.data ?? DEFAULT_CONTACT;
  const email = d.email ?? DEFAULT_CONTACT.email ?? "nayem@nayem.me";
  const location = d.location ?? DEFAULT_CONTACT.location;
  const bio = d.bio ?? DEFAULT_CONTACT.bio;
  const socials = d.socials?.length ? d.socials : (DEFAULT_CONTACT.socials ?? DEFAULT_SOCIALS);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    try {
      await api.contact.submit({
        name: formData.name,
        email: formData.email,
        subject: `Portfolio Contact from ${formData.name}`,
        message: formData.message,
      });
      setStatus("success");
      setFormData({ name: "", email: "", message: "" });
      setTimeout(() => setStatus("idle"), 5000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setErrorMsg(msg);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  return (
    <section id="contact" className="relative py-24 lg:py-32">
      <div className="absolute inset-0 grid-bg opacity-15" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/8 rounded-full blur-3xl" />

      <div ref={ref} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-semibold tracking-widest uppercase">Contact</span>
          <h2 className="mt-3 text-4xl lg:text-5xl font-black">
            Let's <span className="gradient-text">Connect</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Have a project in mind, want to collaborate, or just want to say hi? My inbox is always open.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="glass rounded-2xl p-8 border border-border/50 h-full">
              <h3 className="text-2xl font-black mb-2">Get in Touch</h3>
              <p className="text-muted-foreground mb-8 leading-relaxed">{bio}</p>

              <div className="space-y-4 mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Email</div>
                    <a href={`mailto:${email}`} className="text-sm font-semibold hover:text-primary transition-colors">
                      {email}
                    </a>
                  </div>
                </div>
                {location && (
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-violet-400" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Location</div>
                      <div className="text-sm font-semibold">{location}</div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Find Me Online</div>
                <div className="grid grid-cols-2 gap-3">
                  {socials.map((s, i) => {
                    const IconComponent = ICON_MAP[s.platform] ?? ExternalLink;
                    return (
                      <motion.a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 10 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                        whileHover={{ scale: 1.04, y: -2 }}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl glass border border-border/50 hover:border-primary/30 transition-all group"
                      >
                        <IconComponent className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{s.label}</span>
                        <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 text-primary transition-opacity" />
                      </motion.a>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 border border-border/50 space-y-5">
              <div>
                <label className="text-sm font-semibold text-foreground block mb-2">Your Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  disabled={status === "sending"}
                  className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all disabled:opacity-60"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground block mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  disabled={status === "sending"}
                  className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all disabled:opacity-60"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground block mb-2">Message</label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell me about your project or idea..."
                  disabled={status === "sending"}
                  className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all resize-none disabled:opacity-60"
                />
              </div>

              {status === "success" && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  Message sent! I'll get back to you soon.
                </div>
              )}
              {status === "error" && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {errorMsg || "Something went wrong. Please try again."}
                </div>
              )}

              <motion.button
                type="submit"
                disabled={status === "sending" || status === "success"}
                whileHover={status === "idle" ? { scale: 1.02, y: -1 } : {}}
                whileTap={status === "idle" ? { scale: 0.98 } : {}}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-sm neon-glow hover:bg-primary/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status === "sending" && (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending…
                  </span>
                )}
                {status === "success" && <><CheckCircle className="w-4 h-4" /> Sent!</>}
                {(status === "idle" || status === "error") && <><Send className="w-4 h-4" /> Send Message</>}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
