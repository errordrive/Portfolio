import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Save, CheckCircle, Megaphone, Info } from "lucide-react";

function Toast({ toast }: { toast: { type: "success" | "error"; msg: string } | null }) {
  if (!toast) return null;
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${toast.type === "success" ? "bg-green-500/15 border-green-500/20 text-green-400" : "bg-red-500/15 border-red-500/20 text-red-400"}`}>
      {toast.type === "success" && <CheckCircle className="w-4 h-4" />}
      {toast.msg}
    </div>
  );
}

export default function AdSettings() {
  const queryClient = useQueryClient();
  const [globalEnabled, setGlobalEnabled] = useState(false);
  const [publisherId, setPublisherId] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const { data: settingsData, isLoading } = useQuery<Record<string, string>>({
    queryKey: ["admin-settings"],
    queryFn: () => api.admin.settings.get(),
  });

  useEffect(() => {
    if (settingsData) {
      setGlobalEnabled(settingsData["adsense_enabled"] === "true");
      setPublisherId(settingsData["adsense_publisher_id"] ?? "");
    }
  }, [settingsData]);

  function showToast(type: "success" | "error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  }

  const saveMutation = useMutation({
    mutationFn: (data: Record<string, string>) => api.admin.settings.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      queryClient.invalidateQueries({ queryKey: ["public-settings"] });
      showToast("success", "Ad settings saved");
    },
    onError: (e: unknown) => showToast("error", e instanceof Error ? e.message : "Failed to save"),
  });

  function handleSave() {
    saveMutation.mutate({
      adsense_enabled: globalEnabled ? "true" : "false",
      adsense_publisher_id: publisherId.trim(),
    });
  }

  if (isLoading) return <div className="text-muted-foreground text-sm">Loading…</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <Toast toast={toast} />

      <div className="glass rounded-2xl border border-white/10 p-6 space-y-6">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-primary" />
          Global Ad Controls
        </h3>

        <div className="flex items-center justify-between py-3 border-b border-white/5">
          <div>
            <div className="text-sm font-semibold text-foreground">Enable Ads Globally</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Master switch — disabling this hides all ads on every page regardless of per-post settings.
            </div>
          </div>
          <button
            onClick={() => setGlobalEnabled(v => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${globalEnabled ? "bg-primary" : "bg-muted"}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${globalEnabled ? "translate-x-6" : "translate-x-1"}`}
            />
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
            AdSense Publisher ID
          </label>
          <input
            type="text"
            value={publisherId}
            onChange={e => setPublisherId(e.target.value)}
            placeholder="ca-pub-XXXXXXXXXXXXXXXX"
            className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all font-mono"
          />
          <p className="text-xs text-muted-foreground mt-1.5">
            Found in your Google AdSense account → Account info → Publisher ID
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          {saveMutation.isPending ? "Saving…" : "Save Ad Settings"}
        </button>
      </div>

      <div className="glass rounded-2xl border border-white/10 p-6 space-y-4">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <Info className="w-4 h-4 text-primary" />
          How Ads Work
        </h3>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5 shrink-0">→</span>
            <span>Ads appear <strong className="text-foreground">only on blog post pages</strong> (/blog/*). They are never shown on the homepage, about section, or portfolio pages.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5 shrink-0">→</span>
            <span>Per-post ad placement (top / middle / bottom slots, ad script) is controlled in the <strong className="text-foreground">Blog Editor</strong> sidebar when editing each post.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5 shrink-0">→</span>
            <span>The <strong className="text-foreground">Global toggle above overrides all per-post settings</strong>. When global ads are off, no ads render regardless of individual post configuration.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5 shrink-0">→</span>
            <span>Paste your full AdSense ad unit HTML (the <code className="text-primary bg-primary/10 px-1 rounded text-xs">&lt;ins&gt;</code> snippet or custom script) into the <em>Ad Script</em> field of each blog post for it to render.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
