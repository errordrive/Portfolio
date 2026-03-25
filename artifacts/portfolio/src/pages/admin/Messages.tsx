import { useEffect, useState } from "react";
import { api, type Message } from "@/lib/api";
import { Trash2, ChevronDown, ChevronUp, Mail, MailOpen } from "lucide-react";

export default function Messages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [toggling, setToggling] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    api.admin.messages.list().then(setMessages).catch(console.error).finally(() => setLoading(false));
  }, []);

  async function toggleRead(msg: Message) {
    setToggling(msg.id);
    try {
      const updated = await api.admin.messages.toggleRead(msg.id);
      setMessages(ms => ms.map(m => m.id === msg.id ? updated : m));
    } catch (e) {
      alert("Failed to update message");
    } finally {
      setToggling(null);
    }
  }

  async function deleteMsg(msg: Message) {
    if (!confirm(`Delete message from ${msg.name}?`)) return;
    setDeleting(msg.id);
    try {
      await api.admin.messages.delete(msg.id);
      setMessages(ms => ms.filter(m => m.id !== msg.id));
    } catch (e) {
      alert("Failed to delete message");
    } finally {
      setDeleting(null);
    }
  }

  const unread = messages.filter(m => !m.read).length;

  return (
    <div className="max-w-4xl space-y-4">
      <p className="text-muted-foreground text-sm">
        {messages.length} message{messages.length !== 1 ? "s" : ""}
        {unread > 0 && <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/15 text-primary text-xs font-bold">{unread} unread</span>}
      </p>

      <div className="glass rounded-2xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Loading…</div>
        ) : messages.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">No messages yet</div>
        ) : (
          <div className="divide-y divide-white/5">
            {messages.map(msg => (
              <div key={msg.id}>
                <div
                  className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-white/3 transition-colors"
                  onClick={() => setExpanded(expanded === msg.id ? null : msg.id)}
                >
                  <div className={`w-2 h-2 rounded-full shrink-0 ${msg.read ? "bg-border" : "bg-primary"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">{msg.name}</span>
                      <span className="text-xs text-muted-foreground hidden sm:inline">{msg.email}</span>
                    </div>
                    <div className="text-sm text-muted-foreground truncate">{msg.subject || msg.message.slice(0, 60)}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                    {expanded === msg.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>

                {expanded === msg.id && (
                  <div className="px-5 pb-5 space-y-4 border-t border-white/5">
                    <div className="mt-4 p-4 rounded-xl bg-muted text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                      {msg.message}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <a href={`mailto:${msg.email}`} className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-white/20 transition-colors">
                        Reply via email
                      </a>
                      <button
                        onClick={() => toggleRead(msg)}
                        disabled={toggling === msg.id}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-white/20 transition-colors disabled:opacity-50"
                      >
                        {msg.read ? <Mail className="w-3 h-3" /> : <MailOpen className="w-3 h-3" />}
                        {msg.read ? "Mark unread" : "Mark read"}
                      </button>
                      <button
                        onClick={() => deleteMsg(msg)}
                        disabled={deleting === msg.id}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
