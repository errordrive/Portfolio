import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";

export default function ChangePassword() {
  const [form, setForm] = useState({ current: "", newPw: "", confirm: "" });
  const [show, setShow] = useState({ current: false, newPw: false, confirm: false });
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  function showToast(type: "success" | "error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  }

  const mutation = useMutation({
    mutationFn: ({ current, newPw }: { current: string; newPw: string }) =>
      api.admin.password.change(current, newPw),
    onSuccess: () => {
      showToast("success", "Password changed successfully");
      setForm({ current: "", newPw: "", confirm: "" });
    },
    onError: (e: unknown) => showToast("error", e instanceof Error ? e.message : "Failed to change password"),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.newPw !== form.confirm) return showToast("error", "Passwords do not match");
    if (form.newPw.length < 6) return showToast("error", "New password must be at least 6 characters");
    mutation.mutate({ current: form.current, newPw: form.newPw });
  }

  type FieldKey = keyof typeof form;
  const fields: { key: FieldKey; label: string; showKey: keyof typeof show }[] = [
    { key: "current", label: "Current Password", showKey: "current" },
    { key: "newPw", label: "New Password", showKey: "newPw" },
    { key: "confirm", label: "Confirm New Password", showKey: "confirm" },
  ];

  return (
    <div className="max-w-sm">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${toast.type === "success" ? "bg-green-500/15 border-green-500/20 text-green-400" : "bg-red-500/15 border-red-500/20 text-red-400"}`}>
          {toast.type === "success" && <CheckCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass rounded-2xl border border-white/10 p-6 space-y-4">
        {fields.map(({ key, label, showKey }) => (
          <div key={key}>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">{label}</label>
            <div className="relative">
              <input
                type={show[showKey] ? "text" : "password"}
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full px-4 py-3 pr-11 rounded-xl bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShow(s => ({ ...s, [showKey]: !s[showKey] }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {show[showKey] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ))}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-60 mt-2"
        >
          <Lock className="w-4 h-4" />
          {mutation.isPending ? "Changing…" : "Change Password"}
        </button>
      </form>
    </div>
  );
}
