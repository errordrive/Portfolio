import { useEffect, useState } from "react";
import { Link } from "wouter";
import { api, type BlogPost, type Message } from "@/lib/api";
import { FileText, MessageSquare, CheckCircle, Layers } from "lucide-react";

interface Stats {
  totalPosts: number;
  publishedPosts: number;
  unreadMessages: number;
  totalProjects: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [postsData, msgsData, contentData] = await Promise.all([
          api.admin.blog.list(),
          api.admin.messages.list(),
          api.admin.content.getAll(),
        ]);
        setPosts(postsData);
        setMessages(msgsData);
        const projects = (contentData?.projects?.data as any)?.projects ?? [];
        setStats({
          totalPosts: postsData.length,
          publishedPosts: postsData.filter(p => p.published).length,
          unreadMessages: msgsData.filter(m => !m.read).length,
          totalProjects: projects.length,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statCards = [
    { label: "Total Posts", value: stats?.totalPosts ?? "—", icon: FileText, color: "#f97316" },
    { label: "Published", value: stats?.publishedPosts ?? "—", icon: CheckCircle, color: "#10b981" },
    { label: "Unread Messages", value: stats?.unreadMessages ?? "—", icon: MessageSquare, color: "#8b5cf6" },
    { label: "Projects", value: stats?.totalProjects ?? "—", icon: Layers, color: "#3b82f6" },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass rounded-2xl p-5 border border-white/10 h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass rounded-2xl p-5 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: color + "20" }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
            </div>
            <div className="text-2xl font-black text-foreground">{value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Messages */}
        <div className="glass rounded-2xl border border-white/10 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <h3 className="font-bold text-sm text-foreground">Recent Messages</h3>
            <Link href="/admin/messages">
              <a className="text-xs text-primary hover:text-primary/80 transition-colors">View all</a>
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {messages.slice(0, 5).length === 0 ? (
              <div className="px-5 py-8 text-center text-muted-foreground text-sm">No messages yet</div>
            ) : messages.slice(0, 5).map(m => (
              <div key={m.id} className="flex items-start gap-3 px-5 py-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${m.read ? "bg-border" : "bg-primary"}`} />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-foreground truncate">{m.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{m.subject || m.message.slice(0, 50)}</div>
                </div>
                <div className="text-xs text-muted-foreground shrink-0 ml-auto">
                  {new Date(m.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Posts */}
        <div className="glass rounded-2xl border border-white/10 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <h3 className="font-bold text-sm text-foreground">Recent Blog Posts</h3>
            <Link href="/admin/blog">
              <a className="text-xs text-primary hover:text-primary/80 transition-colors">View all</a>
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {posts.slice(0, 5).length === 0 ? (
              <div className="px-5 py-8 text-center text-muted-foreground text-sm">No posts yet</div>
            ) : posts.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                <div className={`px-2 py-0.5 rounded-md text-xs font-bold ${p.published ? "bg-green-500/15 text-green-400" : "bg-muted text-muted-foreground"}`}>
                  {p.published ? "Live" : "Draft"}
                </div>
                <div className="text-sm text-foreground truncate flex-1">{p.title}</div>
                <Link href={`/admin/blog/${p.id}/edit`}>
                  <a className="text-xs text-primary shrink-0 hover:text-primary/80">Edit</a>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
