import { useEffect, useState } from "react";
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

export default function Settings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [cvUrl, setCvUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cvSaving, setCvSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    Promise.all([api.admin.settings.get(), api.admin.settings.getCv()])
      .then(([s, cv]) => {
        setSettings(s);
        setCvUrl(cv.url || "");
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function showToast(type: "success" | "error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  }

  async function saveSettings() {
    setSaving(true);
    try {
      await api.admin.settings.update(settings);
      showToast("success", "Settings saved");
    } catch (e: unknown) {
      showToast("error", e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function saveCv() {
    setCvSaving(true);
    try {
      await api.admin.settings.updateCv(cvUrl);
      showToast("success", "CV URL updated");
    } catch (e: unknown) {
      showToast("error", e instanceof Error ? e.message : "Failed to update CV");
    } finally {
      setCvSaving(false);
    }
  }

  if (loading) return <div className="text-muted-foreground text-sm">Loading…</div>;

  return (
    <div className="max-w-2xl space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${toast.type === "success" ? "bg-green-500/15 border-green-500/20 text-green-400" : "bg-red-500/15 border-red-500/20 text-red-400"}`}>
          {toast.type === "success" && <CheckCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Site Settings */}
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
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving…" : "Save Settings"}
        </button>
      </div>

      {/* CV */}
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
          onClick={saveCv}
          disabled={cvSaving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          <Upload className="w-4 h-4" />
          {cvSaving ? "Updating…" : "Update CV URL"}
        </button>
      </div>
    </div>
  );
}
