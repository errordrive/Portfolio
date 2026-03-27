import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  api,
  type HeroData, type AboutData, type SkillsData, type ExperienceData, type ProjectsData,
  type ContactData, type ContactSocialLink,
  type Skill, type TimelineEntry, type Project, type Highlight, type StatItem,
} from "@/lib/api";
import { Save, Plus, Trash2, ChevronUp, ChevronDown, CheckCircle, Eye, EyeOff, Pencil, X } from "lucide-react";

const TABS = ["Hero", "About", "Skills", "Experience", "Projects", "Contact"] as const;
type Tab = typeof TABS[number];

// ─── Shared helpers ───────────────────────────────────────────────────────────

function Toast({ toast }: { toast: { type: "success" | "error"; msg: string } | null }) {
  if (!toast) return null;
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${toast.type === "success" ? "bg-green-500/15 border-green-500/20 text-green-400" : "bg-red-500/15 border-red-500/20 text-red-400"}`}>
      {toast.type === "success" && <CheckCircle className="w-4 h-4" />}
      {toast.msg}
    </div>
  );
}

function Field({ label, value, onChange, textarea, rows = 3, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  textarea?: boolean; rows?: number; placeholder?: string;
}) {
  const cls = "w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all";
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">{label}</label>
      {textarea ? (
        <textarea rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={`${cls} resize-none`} />
      ) : (
        <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      )}
    </div>
  );
}

const INPUT_CLS = "px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 transition-all";

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

type TabToast = (type: "success" | "error", msg: string) => void;

// ─── Hero Tab ────────────────────────────────────────────────────────────────

function HeroTab({ initialData, initialVisible, onToast }: {
  initialData: HeroData; initialVisible: boolean; onToast: TabToast;
}) {
  const queryClient = useQueryClient();
  const [data, setData] = useState<HeroData>(initialData);
  const [visible, setVisible] = useState(initialVisible);

  const mutation = useMutation({
    mutationFn: () => api.admin.content.update("hero", data, visible),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-content"] }); onToast("success", "Hero saved"); },
    onError: (e: unknown) => onToast("error", e instanceof Error ? e.message : "Failed to save"),
  });

  const updateStat = (i: number, field: keyof StatItem, val: string) =>
    setData(d => {
      const stats = [...d.stats];
      stats[i] = { ...stats[i], [field]: val };
      return { ...d, stats };
    });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <VisibilityToggle visible={visible} onChange={setVisible} />
        <SaveBtn onSave={() => mutation.mutate()} isPending={mutation.isPending} label="Save Hero" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Name" value={data.name} onChange={v => setData(d => ({ ...d, name: v }))} />
        <Field label="Status Badge" value={data.statusBadge} onChange={v => setData(d => ({ ...d, statusBadge: v }))} />
        <Field label="Tagline" value={data.tagline} onChange={v => setData(d => ({ ...d, tagline: v }))} />
      </div>
      <Field label="Body Text" value={data.body} onChange={v => setData(d => ({ ...d, body: v }))} textarea rows={3} />
      <Field label="Roles (one per line)" value={data.roles.join("\n")} onChange={v => setData(d => ({ ...d, roles: v.split("\n").filter(Boolean) }))} textarea rows={3} />

      <div className="grid sm:grid-cols-2 gap-4">
        {(["ctaPrimary", "ctaSecondary"] as const).map(k => (
          <div key={k}>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">{k === "ctaPrimary" ? "CTA Primary" : "CTA Secondary"}</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input type="text" value={data[k]?.label ?? ""} placeholder="Label"
                onChange={e => setData(d => ({ ...d, [k]: { ...d[k], label: e.target.value } }))}
                className={`flex-1 ${INPUT_CLS}`} />
              <input type="text" value={data[k]?.href ?? ""} placeholder="Link"
                onChange={e => setData(d => ({ ...d, [k]: { ...d[k], href: e.target.value } }))}
                className={`flex-1 ${INPUT_CLS}`} />
            </div>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Stats</label>
          <button onClick={() => setData(d => ({ ...d, stats: [...d.stats, { label: "", value: "" }] }))}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors">
            <Plus className="w-3 h-3" />Add
          </button>
        </div>
        <div className="space-y-2">
          {data.stats.map((stat, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input type="text" value={stat.value} placeholder="20+" onChange={e => updateStat(i, "value", e.target.value)} className={`w-20 ${INPUT_CLS}`} />
              <input type="text" value={stat.label} placeholder="Label" onChange={e => updateStat(i, "label", e.target.value)} className={`flex-1 ${INPUT_CLS}`} />
              <button onClick={() => setData(d => ({ ...d, stats: d.stats.filter((_, j) => j !== i) }))} className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── About Tab ───────────────────────────────────────────────────────────────

function AboutTab({ initialData, initialVisible, onToast }: {
  initialData: AboutData; initialVisible: boolean; onToast: TabToast;
}) {
  const queryClient = useQueryClient();
  const [data, setData] = useState<AboutData>(initialData);
  const [visible, setVisible] = useState(initialVisible);

  const mutation = useMutation({
    mutationFn: () => api.admin.content.update("about", data, visible),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-content"] }); onToast("success", "About saved"); },
    onError: (e: unknown) => onToast("error", e instanceof Error ? e.message : "Failed to save"),
  });

  const updateHighlight = (i: number, field: keyof Highlight, val: string) =>
    setData(d => {
      const highlights = [...d.highlights];
      highlights[i] = { ...highlights[i], [field]: val };
      return { ...d, highlights };
    });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <VisibilityToggle visible={visible} onChange={setVisible} />
        <SaveBtn onSave={() => mutation.mutate()} isPending={mutation.isPending} label="Save About" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Heading" value={data.heading} onChange={v => setData(d => ({ ...d, heading: v }))} />
        <Field label="Years Label" value={data.yearsLabel} onChange={v => setData(d => ({ ...d, yearsLabel: v }))} />
      </div>
      <Field label="Bio paragraphs (one line = one paragraph)" value={data.bio.join("\n")} onChange={v => setData(d => ({ ...d, bio: v.split("\n").filter(Boolean) }))} textarea rows={6} />
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Highlight Cards</label>
          <button onClick={() => setData(d => ({ ...d, highlights: [...d.highlights, { title: "", desc: "", color: "#f97316" }] }))}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"><Plus className="w-3 h-3" />Add</button>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {data.highlights.map((h, i) => (
            <div key={i} className="p-4 rounded-xl bg-muted border border-border space-y-2">
              <div className="flex items-center gap-2">
                <input type="text" value={h.title} placeholder="Title" onChange={e => updateHighlight(i, "title", e.target.value)} className={`flex-1 ${INPUT_CLS}`} />
                <input type="color" value={h.color} onChange={e => updateHighlight(i, "color", e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent" />
                <button onClick={() => setData(d => ({ ...d, highlights: d.highlights.filter((_, j) => j !== i) }))} className="p-1 text-muted-foreground hover:text-red-400 transition-colors"><Trash2 className="w-3 h-3" /></button>
              </div>
              <textarea rows={2} value={h.desc} placeholder="Description" onChange={e => updateHighlight(i, "desc", e.target.value)} className="w-full px-3 py-1.5 rounded-lg bg-background border border-border text-foreground text-xs focus:outline-none focus:border-primary/50 transition-all resize-none" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Skills Tab ──────────────────────────────────────────────────────────────

const DEFAULT_SKILL: Skill = { name: "", icon: "🔧", level: 70, category: "Dev", desc: "" };

function SkillsTab({ initialData, initialVisible, onToast }: {
  initialData: SkillsData; initialVisible: boolean; onToast: TabToast;
}) {
  const queryClient = useQueryClient();
  const [data, setData] = useState<SkillsData>(initialData);
  const [visible, setVisible] = useState(initialVisible);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Skill>(DEFAULT_SKILL);

  const mutation = useMutation({
    mutationFn: () => api.admin.content.update("skills", data, visible),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-content"] }); onToast("success", "Skills saved"); },
    onError: (e: unknown) => onToast("error", e instanceof Error ? e.message : "Failed to save"),
  });

  const skills = data.skills;
  const setSkills = (arr: Skill[]) => setData(d => ({ ...d, skills: arr }));

  function moveSkill(i: number, dir: -1 | 1) {
    const arr = [...skills]; const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]]; setSkills(arr);
  }

  function startEdit(i: number) {
    setEditIdx(i);
    setEditForm(i === -1 ? DEFAULT_SKILL : { ...skills[i] });
  }

  function saveEdit() {
    if (editIdx === null) return;
    if (editIdx === -1) setSkills([...skills, editForm]);
    else { const arr = [...skills]; arr[editIdx] = editForm; setSkills(arr); }
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
            <input value={editForm.icon} onChange={e => setEditForm(f => ({ ...f, icon: e.target.value }))} placeholder="Icon" className={INPUT_CLS} />
            <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} placeholder="Name" className={INPUT_CLS} />
            <input value={editForm.category} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))} placeholder="Category" className={INPUT_CLS} />
            <input type="number" min={0} max={100} value={editForm.level} onChange={e => setEditForm(f => ({ ...f, level: Number(e.target.value) }))} placeholder="Level" className={INPUT_CLS} />
          </div>
          <input value={editForm.desc} onChange={e => setEditForm(f => ({ ...f, desc: e.target.value }))} placeholder="Description" className={`w-full ${INPUT_CLS}`} />
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
            {skills.map((skill, i) => (
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
                    <button onClick={() => setSkills(skills.filter((_, j) => j !== i))} className="p-1 text-muted-foreground hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
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

// ─── Experience Tab ──────────────────────────────────────────────────────────

interface TimelineEditForm {
  year: string;
  title: string;
  org: string;
  desc: string;
  tags: string;
  color: string;
}

const DEFAULT_ENTRY: TimelineEditForm = { year: "", title: "", org: "", desc: "", tags: "", color: "#f97316" };

function ExperienceTab({ initialData, initialVisible, onToast }: {
  initialData: ExperienceData; initialVisible: boolean; onToast: TabToast;
}) {
  const queryClient = useQueryClient();
  const [data, setData] = useState<ExperienceData>(initialData);
  const [visible, setVisible] = useState(initialVisible);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<TimelineEditForm>(DEFAULT_ENTRY);

  const mutation = useMutation({
    mutationFn: () => api.admin.content.update("experience", data, visible),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-content"] }); onToast("success", "Experience saved"); },
    onError: (e: unknown) => onToast("error", e instanceof Error ? e.message : "Failed to save"),
  });

  const timeline = data.timeline;
  const setTimeline = (arr: TimelineEntry[]) => setData(d => ({ ...d, timeline: arr }));

  function startEdit(i: number) {
    setEditIdx(i);
    if (i === -1) setEditForm(DEFAULT_ENTRY);
    else setEditForm({ ...timeline[i], tags: timeline[i].tags.join(", ") });
  }

  function saveEdit() {
    if (editIdx === null) return;
    const item: TimelineEntry = { ...editForm, tags: editForm.tags.split(",").map(t => t.trim()).filter(Boolean) };
    if (editIdx === -1) setTimeline([...timeline, item]);
    else { const arr = [...timeline]; arr[editIdx] = item; setTimeline(arr); }
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
            <input value={editForm.year} onChange={e => setEditForm(f => ({ ...f, year: e.target.value }))} placeholder="Year" className={INPUT_CLS} />
            <input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} placeholder="Title" className={INPUT_CLS} />
            <input value={editForm.org} onChange={e => setEditForm(f => ({ ...f, org: e.target.value }))} placeholder="Org" className={INPUT_CLS} />
          </div>
          <textarea rows={2} value={editForm.desc} onChange={e => setEditForm(f => ({ ...f, desc: e.target.value }))} placeholder="Description" className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 resize-none" />
          <div className="flex gap-3 items-center">
            <input value={editForm.tags} onChange={e => setEditForm(f => ({ ...f, tags: e.target.value }))} placeholder="Tags (comma-sep)" className={`flex-1 ${INPUT_CLS}`} />
            <input type="color" value={editForm.color} onChange={e => setEditForm(f => ({ ...f, color: e.target.value }))} className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent" />
          </div>
          <button onClick={saveEdit} className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors">Save</button>
        </div>
      )}

      <div className="space-y-3">
        {timeline.map((item, i) => (
          <div key={i} className="glass rounded-xl border border-white/10 p-4 flex items-start gap-4">
            <div style={{ background: item.color + "25", color: item.color }} className="px-2.5 py-1 rounded-lg text-xs font-bold shrink-0">{item.year}</div>
            <div className="flex-1 min-w-0"><div className="font-semibold text-foreground text-sm">{item.title}</div><div className="text-xs text-muted-foreground">{item.org}</div></div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => startEdit(i)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
              <button onClick={() => setTimeline(timeline.filter((_, j) => j !== i))} className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Projects Tab ────────────────────────────────────────────────────────────

interface ProjectEditForm {
  title: string;
  desc: string;
  tech: string;
  github: string;
  demo: string;
  featured: boolean;
}

const DEFAULT_PROJECT: ProjectEditForm = { title: "", desc: "", tech: "", github: "", demo: "", featured: false };

function ProjectsTab({ initialData, initialVisible, onToast }: {
  initialData: ProjectsData; initialVisible: boolean; onToast: TabToast;
}) {
  const queryClient = useQueryClient();
  const [data, setData] = useState<ProjectsData>(initialData);
  const [visible, setVisible] = useState(initialVisible);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<ProjectEditForm>(DEFAULT_PROJECT);

  const mutation = useMutation({
    mutationFn: () => api.admin.content.update("projects", data, visible),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-content"] }); onToast("success", "Projects saved"); },
    onError: (e: unknown) => onToast("error", e instanceof Error ? e.message : "Failed to save"),
  });

  const projects = data.projects;
  const setProjects = (arr: Project[]) => setData(d => ({ ...d, projects: arr }));

  function startEdit(i: number) {
    setEditIdx(i);
    if (i === -1) setEditForm(DEFAULT_PROJECT);
    else setEditForm({ ...projects[i], tech: projects[i].tech.join(", ") });
  }

  function saveEdit() {
    if (editIdx === null) return;
    const item: Project = { ...editForm, tech: editForm.tech.split(",").map(t => t.trim()).filter(Boolean) };
    if (editIdx === -1) setProjects([...projects, item]);
    else { const arr = [...projects]; arr[editIdx] = item; setProjects(arr); }
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
            <input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} placeholder="Title" className={INPUT_CLS} />
            <input value={editForm.tech} onChange={e => setEditForm(f => ({ ...f, tech: e.target.value }))} placeholder="Tech (comma-sep)" className={INPUT_CLS} />
            <input value={editForm.github} onChange={e => setEditForm(f => ({ ...f, github: e.target.value }))} placeholder="GitHub URL" className={INPUT_CLS} />
            <input value={editForm.demo} onChange={e => setEditForm(f => ({ ...f, demo: e.target.value }))} placeholder="Demo URL" className={INPUT_CLS} />
          </div>
          <textarea rows={3} value={editForm.desc} onChange={e => setEditForm(f => ({ ...f, desc: e.target.value }))} placeholder="Description" className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 resize-none" />
          <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
            <input type="checkbox" checked={editForm.featured} onChange={e => setEditForm(f => ({ ...f, featured: e.target.checked }))} className="accent-primary" />
            Featured project
          </label>
          <button onClick={saveEdit} className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors">Save</button>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {projects.map((p, i) => (
          <div key={i} className="glass rounded-xl border border-white/10 p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <div className="font-semibold text-foreground text-sm">{p.title}</div>
                {p.featured && <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary">Featured</span>}
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => startEdit(i)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => setProjects(projects.filter((_, j) => j !== i))} className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">{p.desc}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {(p.tech ?? []).map(t => <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{t}</span>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Contact Tab ─────────────────────────────────────────────────────────────

const DEFAULT_SOCIAL: ContactSocialLink = { platform: "github", label: "", href: "" };
const PLATFORM_OPTIONS = ["github", "linkedin", "twitter", "telegram", "youtube", "discord", "other"];

function ContactTab({ initialData, initialVisible, onToast }: {
  initialData: ContactData; initialVisible: boolean; onToast: TabToast;
}) {
  const queryClient = useQueryClient();
  const [data, setData] = useState<ContactData>(initialData);
  const [visible, setVisible] = useState(initialVisible);

  const mutation = useMutation({
    mutationFn: () => api.admin.content.update("contact", data, visible),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-content"] }); onToast("success", "Contact saved"); },
    onError: (e: unknown) => onToast("error", e instanceof Error ? e.message : "Failed to save"),
  });

  const socials = data.socials ?? [];
  const setSocials = (arr: ContactSocialLink[]) => setData(d => ({ ...d, socials: arr }));

  const updateSocial = (i: number, field: keyof ContactSocialLink, val: string) => {
    const arr = [...socials];
    arr[i] = { ...arr[i], [field]: val };
    setSocials(arr);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <VisibilityToggle visible={visible} onChange={setVisible} />
        <SaveBtn onSave={() => mutation.mutate()} isPending={mutation.isPending} label="Save Contact" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Email" value={data.email ?? ""} onChange={v => setData(d => ({ ...d, email: v }))} placeholder="nayem@nayem.me" />
        <Field label="Location" value={data.location ?? ""} onChange={v => setData(d => ({ ...d, location: v }))} placeholder="Bangladesh 🇧🇩" />
      </div>

      <Field
        label="Bio / Intro text"
        value={data.bio ?? ""}
        onChange={v => setData(d => ({ ...d, bio: v }))}
        textarea rows={3}
        placeholder="Whether you need an AI solution, want to vibe-code together..."
      />

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Social Links</label>
          <button
            onClick={() => setSocials([...socials, { ...DEFAULT_SOCIAL }])}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
          >
            <Plus className="w-3 h-3" /> Add Link
          </button>
        </div>
        <div className="space-y-2">
          {socials.map((s, i) => (
            <div key={i} className="rounded-xl bg-muted/50 border border-border p-3 space-y-2">
              <div className="flex gap-2 items-center">
                <select
                  value={s.platform}
                  onChange={e => updateSocial(i, "platform", e.target.value)}
                  className={`flex-1 ${INPUT_CLS}`}
                >
                  {PLATFORM_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <input
                  type="text"
                  value={s.label}
                  placeholder="Display name"
                  onChange={e => updateSocial(i, "label", e.target.value)}
                  className={`flex-1 ${INPUT_CLS}`}
                />
                <button
                  onClick={() => setSocials(socials.filter((_, j) => j !== i))}
                  className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <input
                type="text"
                value={s.href}
                placeholder="https://..."
                onChange={e => updateSocial(i, "href", e.target.value)}
                className={`w-full ${INPUT_CLS}`}
              />
            </div>
          ))}
          {socials.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No social links yet. Click "Add Link" to add one.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main ContentManager ─────────────────────────────────────────────────────

const DEFAULT_HERO: HeroData = { name: "", statusBadge: "", tagline: "", body: "", roles: [], ctaPrimary: { label: "", href: "" }, ctaSecondary: { label: "", href: "" }, stats: [] };
const DEFAULT_ABOUT: AboutData = { heading: "", yearsLabel: "", bio: [], highlights: [] };
const DEFAULT_SKILLS: SkillsData = { skills: [] };
const DEFAULT_EXPERIENCE: ExperienceData = { timeline: [] };
const DEFAULT_PROJECTS: ProjectsData = { projects: [] };
const DEFAULT_CONTACT: ContactData = { bio: "", email: "", location: "", socials: [] };

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
        <div className="flex gap-1 mb-4 bg-muted rounded-xl p-1 overflow-x-auto flex-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map(tab => <div key={tab} className="px-4 py-2 rounded-lg bg-background/50 h-9 w-24 shrink-0 animate-pulse" />)}
        </div>
        <div className="glass rounded-2xl border border-white/10 p-4 sm:p-6 h-64 animate-pulse" />
      </div>
    );
  }

  const hero = content.hero ?? { data: DEFAULT_HERO, visible: true };
  const about = content.about ?? { data: DEFAULT_ABOUT, visible: true };
  const skills = content.skills ?? { data: DEFAULT_SKILLS, visible: true };
  const experience = content.experience ?? { data: DEFAULT_EXPERIENCE, visible: true };
  const projects = content.projects ?? { data: DEFAULT_PROJECTS, visible: true };
  const contact = content.contact ?? { data: DEFAULT_CONTACT, visible: true };

  return (
    <div className="max-w-4xl">
      <Toast toast={toast} />
      <div className="flex gap-1 mb-4 bg-muted rounded-xl p-1 overflow-x-auto flex-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0 whitespace-nowrap ${activeTab === tab ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground"}`}>
            {tab}
          </button>
        ))}
      </div>
      <div className="glass rounded-2xl border border-white/10 p-4 sm:p-6">
        {activeTab === "Hero" && <HeroTab key="hero" initialData={hero.data} initialVisible={hero.visible} onToast={handleToast} />}
        {activeTab === "About" && <AboutTab key="about" initialData={about.data} initialVisible={about.visible} onToast={handleToast} />}
        {activeTab === "Skills" && <SkillsTab key="skills" initialData={skills.data} initialVisible={skills.visible} onToast={handleToast} />}
        {activeTab === "Experience" && <ExperienceTab key="experience" initialData={experience.data} initialVisible={experience.visible} onToast={handleToast} />}
        {activeTab === "Projects" && <ProjectsTab key="projects" initialData={projects.data} initialVisible={projects.visible} onToast={handleToast} />}
        {activeTab === "Contact" && <ContactTab key="contact" initialData={contact.data as ContactData} initialVisible={contact.visible} onToast={handleToast} />}
      </div>
    </div>
  );
}
