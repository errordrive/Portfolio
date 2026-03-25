import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Save, Plus, Trash2, ChevronUp, ChevronDown, CheckCircle, Eye, EyeOff, Pencil, X } from "lucide-react";

const TABS = ["Hero", "About", "Skills", "Experience", "Projects"] as const;
type Tab = typeof TABS[number];

function Toast({ toast }: { toast: { type: "success" | "error"; msg: string } | null }) {
  if (!toast) return null;
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${toast.type === "success" ? "bg-green-500/15 border-green-500/20 text-green-400" : "bg-red-500/15 border-red-500/20 text-red-400"}`}>
      {toast.type === "success" && <CheckCircle className="w-4 h-4" />}
      {toast.msg}
    </div>
  );
}

function FieldInput({ label, value, onChange, textarea, rows = 3, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; textarea?: boolean; rows?: number; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">{label}</label>
      {textarea ? (
        <textarea rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all resize-none" />
      ) : (
        <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all" />
      )}
    </div>
  );
}

function VisibilityToggle({ visible, onChange }: { visible: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!visible)}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${visible ? "bg-green-500/15 border-green-500/20 text-green-400 hover:bg-green-500/20" : "border-border text-muted-foreground hover:text-foreground hover:bg-white/5"}`}>
      {visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
      {visible ? "Visible" : "Hidden"}
    </button>
  );
}

function SaveBtn({ onSave, isPending, label }: { onSave: () => void; isPending: boolean; label: string }) {
  return (
    <button onClick={onSave} disabled={isPending}
      className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-60">
      <Save className="w-4 h-4" />{isPending ? "Saving…" : label}
    </button>
  );
}

// ----- Hero Tab -----
function HeroTab({ initialData, initialVisible, onToast }: { initialData: any; initialVisible: boolean; onToast: (t: "success" | "error", m: string) => void }) {
  const queryClient = useQueryClient();
  const [data, setData] = useState<any>(initialData);
  const [visible, setVisible] = useState(initialVisible);

  const mutation = useMutation({
    mutationFn: () => api.admin.content.update("hero", data, visible),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-content"] }); onToast("success", "Hero saved"); },
    onError: (e: unknown) => onToast("error", e instanceof Error ? e.message : "Failed to save"),
  });

  const update = (key: string, val: unknown) => setData((d: any) => ({ ...d, [key]: val }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <VisibilityToggle visible={visible} onChange={setVisible} />
        <SaveBtn onSave={() => mutation.mutate()} isPending={mutation.isPending} label="Save Hero" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <FieldInput label="Name" value={data.name ?? ""} onChange={v => update("name", v)} />
        <FieldInput label="Status Badge" value={data.statusBadge ?? ""} onChange={v => update("statusBadge", v)} />
        <FieldInput label="Tagline" value={data.tagline ?? ""} onChange={v => update("tagline", v)} />
      </div>
      <FieldInput label="Body Text" value={data.body ?? ""} onChange={v => update("body", v)} textarea rows={3} />
      <FieldInput label="Roles (one per line)" value={(data.roles ?? []).join("\n")} onChange={v => update("roles", v.split("\n").filter(Boolean))} textarea rows={3} />
      <div className="grid sm:grid-cols-2 gap-4">
        {(["ctaPrimary", "ctaSecondary"] as const).map(k => (
          <div key={k}>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">{k === "ctaPrimary" ? "CTA Primary" : "CTA Secondary"}</label>
            <div className="flex gap-2">
              <input type="text" value={data[k]?.label ?? ""} onChange={e => update(k, { ...data[k], label: e.target.value })} placeholder="Label" className="flex-1 px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 transition-all" />
              <input type="text" value={data[k]?.href ?? ""} onChange={e => update(k, { ...data[k], href: e.target.value })} placeholder="Link" className="flex-1 px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 transition-all" />
            </div>
          </div>
        ))}
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Stats</label>
          <button onClick={() => update("stats", [...(data.stats ?? []), { label: "", value: "" }])} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"><Plus className="w-3 h-3" />Add</button>
        </div>
        <div className="space-y-2">
          {(data.stats ?? []).map((stat: any, i: number) => (
            <div key={i} className="flex gap-2 items-center">
              <input type="text" value={stat.value} onChange={e => { const s = [...data.stats]; s[i] = { ...s[i], value: e.target.value }; update("stats", s); }} placeholder="20+" className="w-20 px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 transition-all" />
              <input type="text" value={stat.label} onChange={e => { const s = [...data.stats]; s[i] = { ...s[i], label: e.target.value }; update("stats", s); }} placeholder="Label" className="flex-1 px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 transition-all" />
              <button onClick={() => update("stats", data.stats.filter((_: any, j: number) => j !== i))} className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ----- About Tab -----
function AboutTab({ initialData, initialVisible, onToast }: { initialData: any; initialVisible: boolean; onToast: (t: "success" | "error", m: string) => void }) {
  const queryClient = useQueryClient();
  const [data, setData] = useState<any>(initialData);
  const [visible, setVisible] = useState(initialVisible);

  const mutation = useMutation({
    mutationFn: () => api.admin.content.update("about", data, visible),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-content"] }); onToast("success", "About saved"); },
    onError: (e: unknown) => onToast("error", e instanceof Error ? e.message : "Failed to save"),
  });

  const update = (key: string, val: unknown) => setData((d: any) => ({ ...d, [key]: val }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <VisibilityToggle visible={visible} onChange={setVisible} />
        <SaveBtn onSave={() => mutation.mutate()} isPending={mutation.isPending} label="Save About" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <FieldInput label="Heading" value={data.heading ?? ""} onChange={v => update("heading", v)} />
        <FieldInput label="Years Label" value={data.yearsLabel ?? ""} onChange={v => update("yearsLabel", v)} />
      </div>
      <FieldInput label="Bio paragraphs (one line = one paragraph)" value={(data.bio ?? []).join("\n")} onChange={v => update("bio", v.split("\n").filter(Boolean))} textarea rows={6} />
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Highlight Cards</label>
          <button onClick={() => update("highlights", [...(data.highlights ?? []), { title: "", desc: "", color: "#f97316" }])} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"><Plus className="w-3 h-3" />Add</button>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {(data.highlights ?? []).map((h: any, i: number) => (
            <div key={i} className="p-4 rounded-xl bg-muted border border-border space-y-2">
              <div className="flex items-center gap-2">
                <input type="text" value={h.title} onChange={e => { const arr = [...data.highlights]; arr[i] = { ...arr[i], title: e.target.value }; update("highlights", arr); }} placeholder="Title" className="flex-1 px-3 py-1.5 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 transition-all" />
                <input type="color" value={h.color} onChange={e => { const arr = [...data.highlights]; arr[i] = { ...arr[i], color: e.target.value }; update("highlights", arr); }} className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent" />
                <button onClick={() => update("highlights", data.highlights.filter((_: any, j: number) => j !== i))} className="p-1 text-muted-foreground hover:text-red-400 transition-colors"><Trash2 className="w-3 h-3" /></button>
              </div>
              <textarea rows={2} value={h.desc} onChange={e => { const arr = [...data.highlights]; arr[i] = { ...arr[i], desc: e.target.value }; update("highlights", arr); }} placeholder="Description" className="w-full px-3 py-1.5 rounded-lg bg-background border border-border text-foreground text-xs focus:outline-none focus:border-primary/50 transition-all resize-none" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ----- Skills Tab -----
function SkillsTab({ initialData, initialVisible, onToast }: { initialData: any; initialVisible: boolean; onToast: (t: "success" | "error", m: string) => void }) {
  const queryClient = useQueryClient();
  const [data, setData] = useState<any>(initialData);
  const [visible, setVisible] = useState(initialVisible);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const mutation = useMutation({
    mutationFn: () => api.admin.content.update("skills", data, visible),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-content"] }); onToast("success", "Skills saved"); },
    onError: (e: unknown) => onToast("error", e instanceof Error ? e.message : "Failed to save"),
  });

  const skills: any[] = data.skills ?? [];
  const updateSkills = (arr: any[]) => setData((d: any) => ({ ...d, skills: arr }));

  function moveSkill(i: number, dir: -1 | 1) {
    const arr = [...skills]; const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]]; updateSkills(arr);
  }

  function startEdit(i: number) {
    setEditIdx(i);
    setEditForm(i === -1 ? { name: "", icon: "🔧", level: 70, category: "Dev", desc: "" } : { ...skills[i] });
  }

  function saveEdit() {
    if (editIdx === -1) updateSkills([...skills, editForm]);
    else { const arr = [...skills]; arr[editIdx!] = editForm; updateSkills(arr); }
    setEditIdx(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <VisibilityToggle visible={visible} onChange={setVisible} />
        <div className="flex items-center gap-2">
          <button onClick={() => startEdit(-1)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-white/5 text-sm transition-colors"><Plus className="w-3.5 h-3.5" />Add Skill</button>
          <SaveBtn onSave={() => mutation.mutate()} isPending={mutation.isPending} label="Save Skills" />
        </div>
      </div>

      {editIdx !== null && (
        <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">{editIdx === -1 ? "Add Skill" : "Edit Skill"}</span>
            <button onClick={() => setEditIdx(null)} className="p-1 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[["icon", "Icon"], ["name", "Name"], ["category", "Category"]].map(([k, p]) => (
              <input key={k} value={editForm[k] ?? ""} onChange={e => setEditForm((f: any) => ({ ...f, [k]: e.target.value }))} placeholder={p} className="px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm w-full focus:outline-none focus:border-primary/50" />
            ))}
            <input type="number" min={0} max={100} value={editForm.level ?? 70} onChange={e => setEditForm((f: any) => ({ ...f, level: Number(e.target.value) }))} placeholder="Level" className="px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm w-full focus:outline-none focus:border-primary/50" />
          </div>
          <input value={editForm.desc ?? ""} onChange={e => setEditForm((f: any) => ({ ...f, desc: e.target.value }))} placeholder="Description" className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:border-primary/50" />
          <button onClick={saveEdit} className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors">Save</button>
        </div>
      )}

      <div className="glass rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/10">
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Skill</th>
            <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Category</th>
            <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Level</th>
            <th className="px-3 py-2.5" />
          </tr></thead>
          <tbody className="divide-y divide-white/5">
            {skills.map((skill: any, i: number) => (
              <tr key={i} className="hover:bg-white/3 transition-colors">
                <td className="px-4 py-3"><span className="mr-2">{skill.icon}</span><span className="font-medium text-foreground">{skill.name}</span></td>
                <td className="px-3 py-3 text-muted-foreground hidden sm:table-cell">{skill.category}</td>
                <td className="px-3 py-3 hidden sm:table-cell">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-[80px]"><div className="h-full bg-primary rounded-full" style={{ width: `${skill.level}%` }} /></div>
                    <span className="text-xs text-muted-foreground">{skill.level}%</span>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <button onClick={() => moveSkill(i, -1)} disabled={i === 0} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"><ChevronUp className="w-3.5 h-3.5" /></button>
                    <button onClick={() => moveSkill(i, 1)} disabled={i === skills.length - 1} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"><ChevronDown className="w-3.5 h-3.5" /></button>
                    <button onClick={() => startEdit(i)} className="p-1 text-muted-foreground hover:text-primary transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => updateSkills(skills.filter((_: any, j: number) => j !== i))} className="p-1 text-muted-foreground hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ----- Experience Tab -----
function ExperienceTab({ initialData, initialVisible, onToast }: { initialData: any; initialVisible: boolean; onToast: (t: "success" | "error", m: string) => void }) {
  const queryClient = useQueryClient();
  const [data, setData] = useState<any>(initialData);
  const [visible, setVisible] = useState(initialVisible);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const mutation = useMutation({
    mutationFn: () => api.admin.content.update("experience", data, visible),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-content"] }); onToast("success", "Experience saved"); },
    onError: (e: unknown) => onToast("error", e instanceof Error ? e.message : "Failed to save"),
  });

  const timeline: any[] = data.timeline ?? [];
  const update = (arr: any[]) => setData((d: any) => ({ ...d, timeline: arr }));

  function startEdit(i: number) {
    setEditIdx(i);
    setEditForm(i === -1 ? { year: "", title: "", org: "", desc: "", tags: "", color: "#f97316" } : { ...timeline[i], tags: (timeline[i].tags ?? []).join(", ") });
  }

  function saveEdit() {
    const item = { ...editForm, tags: String(editForm.tags).split(",").map((t: string) => t.trim()).filter(Boolean) };
    if (editIdx === -1) update([...timeline, item]);
    else { const arr = [...timeline]; arr[editIdx!] = item; update(arr); }
    setEditIdx(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <VisibilityToggle visible={visible} onChange={setVisible} />
        <div className="flex gap-2">
          <button onClick={() => startEdit(-1)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-white/5 text-sm transition-colors"><Plus className="w-3.5 h-3.5" />Add Entry</button>
          <SaveBtn onSave={() => mutation.mutate()} isPending={mutation.isPending} label="Save" />
        </div>
      </div>

      {editIdx !== null && (
        <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">{editIdx === -1 ? "Add Entry" : "Edit Entry"}</span>
            <button onClick={() => setEditIdx(null)} className="p-1 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {["year", "title", "org"].map(k => (
              <input key={k} value={editForm[k] ?? ""} onChange={e => setEditForm((f: any) => ({ ...f, [k]: e.target.value }))} placeholder={k.charAt(0).toUpperCase() + k.slice(1)} className="px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:border-primary/50" />
            ))}
          </div>
          <textarea rows={2} value={editForm.desc ?? ""} onChange={e => setEditForm((f: any) => ({ ...f, desc: e.target.value }))} placeholder="Description" className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 resize-none" />
          <div className="flex gap-3 items-center">
            <input value={typeof editForm.tags === "string" ? editForm.tags : (editForm.tags ?? []).join(", ")} onChange={e => setEditForm((f: any) => ({ ...f, tags: e.target.value }))} placeholder="Tags (comma-sep)" className="flex-1 px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:border-primary/50" />
            <input type="color" value={editForm.color ?? "#f97316"} onChange={e => setEditForm((f: any) => ({ ...f, color: e.target.value }))} className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent" />
          </div>
          <button onClick={saveEdit} className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors">Save</button>
        </div>
      )}

      <div className="space-y-3">
        {timeline.map((item: any, i: number) => (
          <div key={i} className="glass rounded-xl border border-white/10 p-4 flex items-start gap-4">
            <div style={{ background: item.color + "25", color: item.color }} className="px-2.5 py-1 rounded-lg text-xs font-bold shrink-0">{item.year}</div>
            <div className="flex-1 min-w-0"><div className="font-semibold text-foreground text-sm">{item.title}</div><div className="text-xs text-muted-foreground">{item.org}</div></div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => startEdit(i)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
              <button onClick={() => update(timeline.filter((_: any, j: number) => j !== i))} className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ----- Projects Tab -----
function ProjectsTab({ initialData, initialVisible, onToast }: { initialData: any; initialVisible: boolean; onToast: (t: "success" | "error", m: string) => void }) {
  const queryClient = useQueryClient();
  const [data, setData] = useState<any>(initialData);
  const [visible, setVisible] = useState(initialVisible);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const mutation = useMutation({
    mutationFn: () => api.admin.content.update("projects", data, visible),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-content"] }); onToast("success", "Projects saved"); },
    onError: (e: unknown) => onToast("error", e instanceof Error ? e.message : "Failed to save"),
  });

  const projects: any[] = data.projects ?? [];
  const update = (arr: any[]) => setData((d: any) => ({ ...d, projects: arr }));

  function startEdit(i: number) {
    setEditIdx(i);
    setEditForm(i === -1 ? { title: "", desc: "", tech: "", github: "", demo: "", featured: false } : { ...projects[i], tech: (projects[i].tech ?? []).join(", ") });
  }

  function saveEdit() {
    const item = { ...editForm, tech: String(editForm.tech).split(",").map((t: string) => t.trim()).filter(Boolean) };
    if (editIdx === -1) update([...projects, item]);
    else { const arr = [...projects]; arr[editIdx!] = item; update(arr); }
    setEditIdx(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <VisibilityToggle visible={visible} onChange={setVisible} />
        <div className="flex gap-2">
          <button onClick={() => startEdit(-1)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-white/5 text-sm transition-colors"><Plus className="w-3.5 h-3.5" />Add Project</button>
          <SaveBtn onSave={() => mutation.mutate()} isPending={mutation.isPending} label="Save" />
        </div>
      </div>

      {editIdx !== null && (
        <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">{editIdx === -1 ? "Add Project" : "Edit Project"}</span>
            <button onClick={() => setEditIdx(null)} className="p-1 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <input value={editForm.title ?? ""} onChange={e => setEditForm((f: any) => ({ ...f, title: e.target.value }))} placeholder="Title" className="px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:border-primary/50" />
            <input value={typeof editForm.tech === "string" ? editForm.tech : (editForm.tech ?? []).join(", ")} onChange={e => setEditForm((f: any) => ({ ...f, tech: e.target.value }))} placeholder="Tech (comma-sep)" className="px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:border-primary/50" />
            <input value={editForm.github ?? ""} onChange={e => setEditForm((f: any) => ({ ...f, github: e.target.value }))} placeholder="GitHub URL" className="px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:border-primary/50" />
            <input value={editForm.demo ?? ""} onChange={e => setEditForm((f: any) => ({ ...f, demo: e.target.value }))} placeholder="Demo URL" className="px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:border-primary/50" />
          </div>
          <textarea rows={3} value={editForm.desc ?? ""} onChange={e => setEditForm((f: any) => ({ ...f, desc: e.target.value }))} placeholder="Description" className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 resize-none" />
          <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
            <input type="checkbox" checked={editForm.featured ?? false} onChange={e => setEditForm((f: any) => ({ ...f, featured: e.target.checked }))} className="accent-primary" />
            Featured project
          </label>
          <button onClick={saveEdit} className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors">Save</button>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {projects.map((p: any, i: number) => (
          <div key={i} className="glass rounded-xl border border-white/10 p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <div className="font-semibold text-foreground text-sm">{p.title}</div>
                {p.featured && <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary">Featured</span>}
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => startEdit(i)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => update(projects.filter((_: any, j: number) => j !== i))} className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">{p.desc}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {(p.tech ?? []).map((t: string) => <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{t}</span>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ----- Main ContentManager -----
export default function ContentManager() {
  const [activeTab, setActiveTab] = useState<Tab>("Hero");
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const { data: content, isLoading } = useQuery({
    queryKey: ["admin-content"],
    queryFn: () => api.admin.content.getAll(),
  });

  function handleToast(type: "success" | "error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  }

  if (isLoading || !content) {
    return (
      <div className="max-w-4xl">
        <div className="flex gap-1 mb-6 bg-muted rounded-xl p-1 flex-wrap">
          {TABS.map(tab => <div key={tab} className="px-4 py-2 rounded-lg bg-muted h-9 w-20 animate-pulse" />)}
        </div>
        <div className="glass rounded-2xl border border-white/10 p-6 h-64 animate-pulse" />
      </div>
    );
  }

  const tabProps: Record<Tab, { initialData: any; initialVisible: boolean }> = {
    Hero: { initialData: content.hero?.data ?? {}, initialVisible: content.hero?.visible ?? true },
    About: { initialData: content.about?.data ?? {}, initialVisible: content.about?.visible ?? true },
    Skills: { initialData: content.skills?.data ?? {}, initialVisible: content.skills?.visible ?? true },
    Experience: { initialData: content.experience?.data ?? {}, initialVisible: content.experience?.visible ?? true },
    Projects: { initialData: content.projects?.data ?? {}, initialVisible: content.projects?.visible ?? true },
  };

  return (
    <div className="max-w-4xl">
      <Toast toast={toast} />
      <div className="flex gap-1 mb-6 bg-muted rounded-xl p-1 flex-wrap">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground"}`}>
            {tab}
          </button>
        ))}
      </div>
      <div className="glass rounded-2xl border border-white/10 p-6">
        {activeTab === "Hero" && <HeroTab key="hero" {...tabProps.Hero} onToast={handleToast} />}
        {activeTab === "About" && <AboutTab key="about" {...tabProps.About} onToast={handleToast} />}
        {activeTab === "Skills" && <SkillsTab key="skills" {...tabProps.Skills} onToast={handleToast} />}
        {activeTab === "Experience" && <ExperienceTab key="experience" {...tabProps.Experience} onToast={handleToast} />}
        {activeTab === "Projects" && <ProjectsTab key="projects" {...tabProps.Projects} onToast={handleToast} />}
      </div>
    </div>
  );
}
