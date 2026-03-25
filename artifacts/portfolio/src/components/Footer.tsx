import { motion } from "framer-motion";
import { Code2, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative border-t border-border/40 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Code2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold gradient-text">nayem.me</span>
          </div>

          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            Built with <Heart className="w-3.5 h-3.5 text-primary" /> by Nayem · {new Date().getFullYear()}
          </p>

          <div className="text-sm text-muted-foreground">
            <span className="text-primary">AI Expert</span> · <span className="text-violet-400">RE Specialist</span> · <span className="text-emerald-400">Vibe Coder</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
