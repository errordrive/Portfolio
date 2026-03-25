import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, FileText, MessageSquare, Settings,
  Lock, LogOut, Menu, X, PenSquare, ChevronRight
} from "lucide-react";
import { clearToken } from "@/lib/api";

const nav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/content", label: "Content", icon: PenSquare },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/password", label: "Password", icon: Lock },
];

const pageTitles: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/content": "Content Manager",
  "/admin/blog": "Blog Posts",
  "/admin/blog/new": "New Post",
  "/admin/messages": "Messages",
  "/admin/settings": "Settings",
  "/admin/password": "Change Password",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const title = Object.entries(pageTitles).find(([k]) =>
    location === k || location.startsWith(k + "/")
  )?.[1] ?? "Admin";

  function handleLogout() {
    clearToken();
    navigate("/admin/login");
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-black text-sm">N</div>
        <div>
          <div className="text-sm font-bold text-foreground">Nayem CMS</div>
          <div className="text-xs text-muted-foreground">Admin Panel</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = location === href || (href !== "/admin/dashboard" && location.startsWith(href));
          return (
            <Link key={href} href={href}>
              <a
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
                {active && <ChevronRight className="w-3 h-3 ml-auto" />}
              </a>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all w-full"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 flex-col fixed inset-y-0 left-0 z-50 border-r border-white/10 bg-card">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-60 flex flex-col bg-card border-r border-white/10 z-10">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-40 flex items-center gap-4 px-6 h-14 border-b border-white/10 bg-background/80 backdrop-blur-md">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-bold text-foreground flex-1">{title}</h1>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-white/10 text-xs font-medium text-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Admin
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
