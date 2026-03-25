import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Save, Upload, CheckCircle } from "lucide-react";

const SETTING_FIELDS = [
  { key: "site_title", label: "Site Title", placeholder: "Nayem • Vibe Coder" },
  { key: "meta_description", label: "SEO Meta Description", placeholder: "Your site description…", textarea: true },
  { key: "github_url", label: "GitHub URL", placeholder: "https://github.com/yourname" },
  { key: "linkedin_url", label: "LinkedIn URL", placeholder: "https://linkedin.com/in/yourname" },
  { key: "twitter_url", label: "Twitter / X URL", placeholder: "https://x.com/yourname" },
  { key: "adsense_script", label: "AdSense Global Script (optional)", placeholder: "<script …></script>", textarea: true },
];

function Toast({ toast }: { toast: { type: "success" | "error"; msg: string } | null }) {
  if (!toast) return null;
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${toast.type === "success" ? "bg-green-500/15 border-green-500/20 text-green-400" : "bg-red-500/15 border-red-500/20 text-red-400"}`}>
      {toast.type === "success" && <CheckCircle className="w-4 h-4" />}
      {toast.msg}
    </div>
  );
}

export default function Settings() {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [cvUrl, setCvUrl] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const { data: settingsData, isLoading: settingsLoading } = useQuery<Record<string, string>>({
    queryKey: ["admin-settings"],
    queryFn: () => api.admin.settings.get(),
  });

  const { data: cvData, isLoading: cvLoading } = useQuery<{ url: string }>({
    queryKey: ["admin-cv"],
    queryFn: () => api.admin.settings.getCv(),
  });

  useEffect(() => { if (settingsData) setSettings(settingsData); }, [settingsData]);
  useEffect(() => { if (cvData) setCvUrl(cvData.url || ""); }, [cvData]);

  function showToast(type: "success" | "error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  }

  const saveMutation = useMutation({
    mutationFn: (data: Record<string, string>) => api.admin.settings.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      showToast("success", "Settings saved");
    },
    onError: (e: unknown) => showToast("error", e instanceof Error ? e.message : "Failed to save"),
  });

  const cvMutation = useMutation({
    mutationFn: (url: string) => api.admin.settings.updateCv(url),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cv"] });
      showToast("success", "CV URL updated");
    },
    onError: (e: unknown) => showToast("error", e instanceof Error ? e.message : "Failed to update CV"),
  });

  if (settingsLoading || cvLoading) return <div className="text-muted-foreground text-sm">Loading…</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <Toast toast={toast} />

      <div className="glass rounded-2xl border border-white/10 p-6 space-y-5">
        <h3 className="font-bold text-foreground">Site Settings</h3>

        {SETTING_FIELDS.map(({ key, label, placeholder, textarea }) => (
          <div key={key}>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">{label}</label>
            {textarea ? (
              <textarea
                rows={3}
                value={settings[key] ?? ""}
                onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all resize-none"
              />
            ) : (
              <input
                type="text"
                value={settings[key] ?? ""}
                onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
              />
            )}
          </div>
        ))}

        <button
          onClick={() => saveMutation.mutate(settings)}
          disabled={saveMutation.isPending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          {saveMutation.isPending ? "Saving…" : "Save Settings"}
        </button>
      </div>

      <div className="glass rounded-2xl border border-white/10 p-6 space-y-4">
        <h3 className="font-bold text-foreground">CV / Resume</h3>
        <p className="text-xs text-muted-foreground">Paste a direct download URL for your CV (Google Drive, Dropbox, etc.)</p>
        <input
          type="url"
          value={cvUrl}
          onChange={e => setCvUrl(e.target.value)}
          placeholder="https://drive.google.com/uc?export=download&id=…"
          className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
        />
        <button
          onClick={() => cvMutation.mutate(cvUrl)}
          disabled={cvMutation.isPending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          <Upload className="w-4 h-4" />
          {cvMutation.isPending ? "Updating…" : "Update CV URL"}
        </button>
      </div>
    </div>
  );
}
