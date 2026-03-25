import { lazy, Suspense, useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Experience from "./components/Experience";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import BlogList from "./pages/BlogList";
import BlogDetail from "./pages/BlogDetail";

const AdminApp = lazy(() => import("./pages/admin/AdminApp"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1 },
  },
});

type Theme = "dark" | "light";

function getInitialTheme(): Theme {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("theme") as Theme | null;
    if (saved) return saved;
  }
  return "dark";
}

function BlogListPage() {
  return <BlogList />;
}

function BlogDetailPage() {
  return <BlogDetail />;
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
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route
            path="/admin/*"
            element={
              <Suspense fallback={<AdminFallback />}>
                <AdminApp />
              </Suspense>
            }
          />
          <Route path="/blog/:slug" element={<BlogDetailPage />} />
          <Route path="/blog" element={<BlogListPage />} />
          <Route path="*" element={<Portfolio theme={theme} toggleTheme={toggleTheme} />} />
        </Routes>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
