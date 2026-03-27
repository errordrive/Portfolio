import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { api, type BlogPost } from "@/lib/api";
import {
  ArrowLeft, Save, Eye, EyeOff,
  Bold, Italic, Heading1, Heading2, Heading3,
  List, ListOrdered, Code, Link2, ImageIcon, Quote,
  Undo2, Redo2, CheckCircle
} from "lucide-react";

const lowlight = createLowlight(common);

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function ToolbarBtn({ active, onClick, title, children }: { active?: boolean; onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      title={title}
      className={`p-1.5 rounded-lg text-sm transition-colors ${active ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground hover:bg-white/10"}`}
    >
      {children}
    </button>
  );
}

type PostForm = {
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  tags: string;
  metaTitle: string;
  metaDescription: string;
  published: boolean;
  adsEnabled: boolean;
  adTop: boolean;
  adMiddle: boolean;
  adBottom: boolean;
  adScript: string;
};

export default function BlogEditor() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const queryClient = useQueryClient();
  const isNew = !id;
  const postId = id ? Number(id) : null;

  const [form, setForm] = useState<PostForm>({
    title: "", slug: "", excerpt: "", featuredImage: "", tags: "",
    metaTitle: "", metaDescription: "", published: false,
    adsEnabled: false, adTop: false, adMiddle: false, adBottom: false, adScript: "",
  });
  const [autoSlug, setAutoSlug] = useState(isNew);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [editorReady, setEditorReady] = useState(false);

  const { data: posts = [], isLoading: postsLoading } = useQuery<BlogPost[]>({
    queryKey: ["admin-posts"],
    queryFn: () => api.admin.blog.list(),
    enabled: !isNew,
  });

  const post = posts.find(p => p.id === postId);
  const postLoaded = isNew || (!postsLoading && !!post);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockLowlight.configure({ lowlight }),
      Link.configure({ openOnClick: false }),
      Image,
      Placeholder.configure({ placeholder: "Write your post…" }),
    ],
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none min-h-[300px] px-4 py-4 focus:outline-none text-foreground text-sm leading-relaxed",
      },
    },
    onCreate: () => setEditorReady(true),
  });

  useEffect(() => {
    if (!post || !editor || !editorReady) return;
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      featuredImage: post.featuredImage || "",
      tags: (post.tags || []).join(", "),
      metaTitle: post.metaTitle || "",
      metaDescription: post.metaDescription || "",
      published: post.published,
      adsEnabled: post.adsEnabled || false,
      adTop: post.adTop || false,
      adMiddle: post.adMiddle || false,
      adBottom: post.adBottom || false,
      adScript: post.adScript || "",
    });
    if (post.content) editor.commands.setContent(post.content);
    setAutoSlug(false);
  }, [post?.id, editorReady]);

  function showToast(type: "success" | "error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  }

  const createMutation = useMutation({
    mutationFn: (payload: Partial<BlogPost>) => api.admin.blog.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      showToast("success", "Post created");
      setTimeout(() => navigate("/admin/blog"), 800);
    },
    onError: (e: unknown) => showToast("error", e instanceof Error ? e.message : "Failed to create"),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<BlogPost>) => api.admin.blog.update(postId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      showToast("success", "Post saved");
    },
    onError: (e: unknown) => showToast("error", e instanceof Error ? e.message : "Failed to save"),
  });

  function handleSave() {
    if (!form.title.trim()) return showToast("error", "Title is required");
    const payload = {
      ...form,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      content: editor?.getHTML() ?? "",
    };
    if (isNew) createMutation.mutate(payload);
    else updateMutation.mutate(payload);
  }

  function handleTitleChange(title: string) {
    setForm(f => ({ ...f, title, slug: autoSlug ? slugify(title) : f.slug }));
  }

  const setLink = useCallback(() => {
    const url = prompt("URL:");
    if (!url) return;
    editor?.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  const setImage = useCallback(() => {
    const url = prompt("Image URL:");
    if (!url) return;
    editor?.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  const saving = createMutation.isPending || updateMutation.isPending;

  if (!isNew && postsLoading) {
    return (
      <div className="max-w-4xl">
        <button onClick={() => navigate("/admin/blog")} className="flex items-center gap-2 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />Back
        </button>
        <div className="glass rounded-2xl border border-white/10 p-12 flex items-center justify-center">
          <div className="text-muted-foreground text-sm">Loading post…</div>
        </div>
      </div>
    );
  }

  if (!isNew && !postsLoading && !post) {
    return (
      <div className="max-w-4xl">
        <button onClick={() => navigate("/admin/blog")} className="flex items-center gap-2 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />Back
        </button>
        <div className="glass rounded-2xl border border-white/10 p-12 text-center">
          <div className="text-foreground font-semibold mb-2">Post not found</div>
          <div className="text-muted-foreground text-sm">The post you're looking for doesn't exist.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-5">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${toast.type === "success" ? "bg-green-500/15 border-green-500/20 text-green-400" : "bg-red-500/15 border-red-500/20 text-red-400"}`}>
          {toast.type === "success" && <CheckCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button onClick={() => navigate("/admin/blog")} className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0" />
        <button
          onClick={() => setForm(f => ({ ...f, published: !f.published }))}
          disabled={!postLoaded}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold border transition-colors disabled:opacity-50 shrink-0 ${form.published ? "bg-green-500/15 border-green-500/20 text-green-400 hover:bg-green-500/20" : "border-border text-muted-foreground hover:text-foreground hover:bg-white/5"}`}
        >
          {form.published ? <Eye className="w-4 h-4 shrink-0" /> : <EyeOff className="w-4 h-4 shrink-0" />}
          <span className="hidden sm:inline">{form.published ? "Published" : "Draft"}</span>
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !postLoaded}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-60 shrink-0"
        >
          <Save className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">{saving ? "Saving…" : "Save"}</span>
          <span className="sm:hidden sr-only">{saving ? "Saving" : "Save"}</span>
          <span className="sm:hidden" aria-hidden="true">{saving ? "…" : ""}</span>
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-5">
        <div className="space-y-4 order-2 lg:order-1">
          <input
            type="text"
            value={form.title}
            onChange={e => handleTitleChange(e.target.value)}
            placeholder="Post title…"
            className="w-full px-4 py-3 rounded-xl bg-card border border-white/10 text-foreground text-xl font-bold placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-all"
          />

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground shrink-0">Slug:</span>
            <input
              type="text"
              value={form.slug}
              onChange={e => { setAutoSlug(false); setForm(f => ({ ...f, slug: e.target.value })); }}
              className="flex-1 min-w-0 px-3 py-1.5 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>

          <div className="glass rounded-2xl border border-white/10 overflow-hidden">
            <div className="flex items-center gap-0.5 px-3 py-2 border-b border-white/10 flex-wrap">
              <ToolbarBtn active={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()} title="Bold"><Bold className="w-3.5 h-3.5" /></ToolbarBtn>
              <ToolbarBtn active={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()} title="Italic"><Italic className="w-3.5 h-3.5" /></ToolbarBtn>
              <div className="w-px h-4 bg-border mx-1" />
              <ToolbarBtn active={editor?.isActive("heading", { level: 1 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} title="H1"><Heading1 className="w-3.5 h-3.5" /></ToolbarBtn>
              <ToolbarBtn active={editor?.isActive("heading", { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} title="H2"><Heading2 className="w-3.5 h-3.5" /></ToolbarBtn>
              <ToolbarBtn active={editor?.isActive("heading", { level: 3 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} title="H3"><Heading3 className="w-3.5 h-3.5" /></ToolbarBtn>
              <div className="w-px h-4 bg-border mx-1" />
              <ToolbarBtn active={editor?.isActive("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()} title="Bullet List"><List className="w-3.5 h-3.5" /></ToolbarBtn>
              <ToolbarBtn active={editor?.isActive("orderedList")} onClick={() => editor?.chain().focus().toggleOrderedList().run()} title="Ordered List"><ListOrdered className="w-3.5 h-3.5" /></ToolbarBtn>
              <div className="w-px h-4 bg-border mx-1" />
              <ToolbarBtn active={editor?.isActive("blockquote")} onClick={() => editor?.chain().focus().toggleBlockquote().run()} title="Blockquote"><Quote className="w-3.5 h-3.5" /></ToolbarBtn>
              <ToolbarBtn active={editor?.isActive("codeBlock")} onClick={() => editor?.chain().focus().toggleCodeBlock().run()} title="Code Block"><Code className="w-3.5 h-3.5" /></ToolbarBtn>
              <ToolbarBtn active={editor?.isActive("link")} onClick={setLink} title="Link"><Link2 className="w-3.5 h-3.5" /></ToolbarBtn>
              <ToolbarBtn onClick={setImage} title="Image"><ImageIcon className="w-3.5 h-3.5" /></ToolbarBtn>
              <div className="w-px h-4 bg-border mx-1" />
              <ToolbarBtn onClick={() => editor?.chain().focus().undo().run()} title="Undo"><Undo2 className="w-3.5 h-3.5" /></ToolbarBtn>
              <ToolbarBtn onClick={() => editor?.chain().focus().redo().run()} title="Redo"><Redo2 className="w-3.5 h-3.5" /></ToolbarBtn>
            </div>
            <EditorContent editor={editor} />
          </div>
        </div>

        <div className="space-y-4 order-1 lg:order-2">
          <div className="glass rounded-2xl border border-white/10 p-4 space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Featured Image</h3>
            <input
              type="url"
              value={form.featuredImage}
              onChange={e => setForm(f => ({ ...f, featuredImage: e.target.value }))}
              placeholder="https://…"
              className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all"
            />
            {form.featuredImage && (
              <img src={form.featuredImage} alt="" className="w-full h-32 object-cover rounded-lg" onError={e => (e.currentTarget.style.display = "none")} />
            )}
          </div>

          <div className="glass rounded-2xl border border-white/10 p-4 space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Details</h3>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={form.tags}
                onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                placeholder="ai, coding, tools"
                className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Excerpt</label>
              <textarea
                rows={3}
                value={form.excerpt}
                onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                placeholder="Short summary…"
                className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all resize-none"
              />
            </div>
          </div>

          <div className="glass rounded-2xl border border-white/10 p-4 space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">SEO</h3>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Meta Title</label>
              <input
                type="text"
                value={form.metaTitle}
                onChange={e => setForm(f => ({ ...f, metaTitle: e.target.value }))}
                placeholder={form.title}
                className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Meta Description</label>
              <textarea
                rows={2}
                value={form.metaDescription}
                onChange={e => setForm(f => ({ ...f, metaDescription: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all resize-none"
              />
            </div>
          </div>

          <div className="glass rounded-2xl border border-white/10 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">AdSense</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.adsEnabled} onChange={e => setForm(f => ({ ...f, adsEnabled: e.target.checked }))} className="accent-primary" />
                <span className="text-xs text-foreground">Enable Ads</span>
              </label>
            </div>
            {form.adsEnabled && (
              <>
                <div className="flex gap-3 flex-wrap">
                  {(["adTop", "adMiddle", "adBottom"] as const).map(k => (
                    <label key={k} className="flex items-center gap-1.5 cursor-pointer text-xs text-muted-foreground">
                      <input type="checkbox" checked={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.checked }))} className="accent-primary" />
                      {k === "adTop" ? "Top" : k === "adMiddle" ? "Middle" : "Bottom"}
                    </label>
                  ))}
                </div>
                <textarea
                  rows={3}
                  value={form.adScript}
                  onChange={e => setForm(f => ({ ...f, adScript: e.target.value }))}
                  placeholder="<script …></script>"
                  className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-xs font-mono placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all resize-none"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
