import { lazy, Suspense, useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Experience from "./components/Experience";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

const AdminApp = lazy(() => import("./pages/admin/AdminApp"));

type Theme = "dark" | "light";

function getInitialTheme(): Theme {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("theme") as Theme | null;
    if (saved) return saved;
  }
  return "dark";
}

function Portfolio({ theme, toggleTheme }: { theme: Theme; toggleTheme: () => void }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <main>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

const AdminFallback = () => (
  <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-gray-400 text-sm">
    Loading admin panel…
  </div>
);

export default function App() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <Routes>
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<AdminFallback />}>
            <AdminApp />
          </Suspense>
        }
      />
      <Route path="*" element={<Portfolio theme={theme} toggleTheme={toggleTheme} />} />
    </Routes>
  );
}
