import { Hono } from "hono";
import { handle } from "hono/cloudflare-pages";
import * as jose from "jose";
import bcrypt from "bcryptjs";

export interface Env {
  PORTFOLIO_KV: KVNamespace;
  JWT_SECRET: string;
}

type Bindings = Env;

const app = new Hono<{ Bindings: Bindings }>();

const PUBLIC_SETTING_KEYS = [
  "site_title",
  "site_description",
  "social_github",
  "social_linkedin",
  "social_twitter",
  "adsense_enabled",
  "adsense_publisher_id",
];

const CONTENT_SECTIONS = ["hero", "about", "skills", "experience", "projects", "contact"];

const BASE_URL = "https://nayem.me";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function err(msg: string, status = 400) {
  return json({ error: msg }, status);
}

async function getJwtSecret(secret: string): Promise<Uint8Array> {
  return new TextEncoder().encode(secret);
}

async function signToken(payload: Record<string, unknown>, secret: string): Promise<string> {
  const key = await getJwtSecret(secret);
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

async function verifyToken(token: string, secret: string): Promise<jose.JWTPayload | null> {
  try {
    const key = await getJwtSecret(secret);
    const { payload } = await jose.jwtVerify(token, key);
    return payload;
  } catch {
    return null;
  }
}

function getSecret(env: Bindings): string | null {
  const s = env.JWT_SECRET;
  if (!s || s.trim() === "") return null;
  return s;
}

async function requireAuth(c: { req: { header: (k: string) => string | undefined }; env: Bindings }, next: () => Promise<void>) {
  const secret = getSecret(c.env);
  if (!secret) return err("Server misconfiguration: JWT_SECRET not set", 500);
  const auth = c.req.header("Authorization");
  if (!auth?.startsWith("Bearer ")) return err("Unauthorized", 401);
  const token = auth.slice(7);
  const payload = await verifyToken(token, secret);
  if (!payload) return err("Unauthorized", 401);
  return next();
}

function kvGet<T>(kv: KVNamespace, key: string): Promise<T | null> {
  return kv.get(key, "json") as Promise<T | null>;
}

async function kvPut(kv: KVNamespace, key: string, value: unknown): Promise<void> {
  await kv.put(key, JSON.stringify(value));
}

function toISOStr(d?: Date | string): string {
  if (!d) return new Date().toISOString();
  return new Date(d).toISOString();
}

function nextId(current: string | null): number {
  return (parseInt(current ?? "0", 10) || 0) + 1;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toW3cDate(date: string): string {
  return new Date(date).toISOString().split("T")[0];
}

interface AdminUser { username: string; passwordHash: string; createdAt: string; }
interface BlogSummary { id: number; slug: string; title: string; excerpt: string; featuredImage: string; tags: string[]; published: boolean; createdAt: string; updatedAt: string; }
interface BlogPost extends BlogSummary { content: string; metaTitle: string; metaDescription: string; adsEnabled: boolean; adTop: boolean; adMiddle: boolean; adBottom: boolean; adScript: string; }
interface ContentSection { data: unknown; visible: boolean; updatedAt: string; }
interface Comment { id: number; postSlug: string; parentId: number | null; name: string; email: string; content: string; approved: boolean; createdAt: string; }
interface Message { id: number; name: string; email: string; subject: string; message: string; read: boolean; createdAt: string; }

app.get("/api/health", (c) => c.json({ ok: true }));

app.get("/api/settings", async (c) => {
  const kv = c.env.PORTFOLIO_KV;
  const result: Record<string, string> = {};
  await Promise.all(
    PUBLIC_SETTING_KEYS.map(async (key) => {
      const val = await kv.get(`setting:${key}`);
      if (val !== null) result[key] = val;
    })
  );
  return c.json(result);
});

app.get("/api/cv", async (c) => {
  const url = await c.env.PORTFOLIO_KV.get("cv:url") ?? "";
  return c.json({ url });
});

app.get("/api/content", async (c) => {
  const kv = c.env.PORTFOLIO_KV;
  const result: Record<string, ContentSection> = {};
  await Promise.all(
    CONTENT_SECTIONS.map(async (section) => {
      const data = await kvGet<ContentSection>(kv, `content:${section}`);
      if (data) result[section] = data;
    })
  );
  return c.json(result);
});

app.get("/api/content/:section", async (c) => {
  const section = c.req.param("section");
  const data = await kvGet<ContentSection>(c.env.PORTFOLIO_KV, `content:${section}`);
  if (!data) return err("Section not found", 404);
  return c.json(data);
});

app.get("/api/blog", async (c) => {
  const index = await kvGet<BlogSummary[]>(c.env.PORTFOLIO_KV, "blog:index") ?? [];
  const published = index.filter((p) => p.published).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return c.json(published);
});

app.get("/api/blog/:slug", async (c) => {
  const slug = c.req.param("slug");
  const post = await kvGet<BlogPost>(c.env.PORTFOLIO_KV, `blog:post:${slug}`);
  if (!post || !post.published) return err("Post not found", 404);
  return c.json(post);
});

app.post("/api/contact", async (c) => {
  const body = await c.req.json().catch(() => ({})) as Record<string, string>;
  const { name, email, subject, message } = body;
  if (!name?.trim() || !email?.trim() || !message?.trim()) return err("Name, email, and message are required");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return err("Invalid email address");
  const kv = c.env.PORTFOLIO_KV;
  const counterStr = await kv.get("messages:counter");
  const id = nextId(counterStr);
  const msg: Message = { id, name: name.trim(), email: email.trim(), subject: (subject ?? "").trim(), message: message.trim(), read: false, createdAt: new Date().toISOString() };
  const list = await kvGet<number[]>(kv, "messages:list") ?? [];
  await Promise.all([
    kvPut(kv, `message:${id}`, msg),
    kvPut(kv, "messages:list", [id, ...list]),
    kv.put("messages:counter", String(id)),
  ]);
  return c.json({ success: true, message: "Message sent successfully" }, 201);
});

app.get("/api/blog/:slug/comments", async (c) => {
  const slug = c.req.param("slug");
  const kv = c.env.PORTFOLIO_KV;
  const post = await kvGet<BlogPost>(kv, `blog:post:${slug}`);
  if (!post || !post.published) return err("Post not found", 404);
  const commentIds = await kvGet<number[]>(kv, `comments:${slug}:list`) ?? [];
  const comments = (await Promise.all(commentIds.map((id) => kvGet<Comment>(kv, `comment:${id}`)))).filter(Boolean) as Comment[];
  const approved = comments.filter((c) => c.approved);
  const withReactions = await Promise.all(
    approved.map(async (comment) => {
      const useful = parseInt(await kv.get(`reaction:${comment.id}:useful`) ?? "0", 10);
      const notUseful = parseInt(await kv.get(`reaction:${comment.id}:not_useful`) ?? "0", 10);
      return { ...comment, email: undefined, reactions: { useful, not_useful: notUseful } };
    })
  );
  const topLevel = withReactions
    .filter((c) => !c.parentId)
    .map((c) => ({
      ...c,
      replies: withReactions.filter((r) => r.parentId === c.id),
    }));
  return c.json(topLevel);
});

app.post("/api/blog/:slug/comments", async (c) => {
  const slug = c.req.param("slug");
  const kv = c.env.PORTFOLIO_KV;
  const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
  const { name, email, content, parentId } = body as { name: string; email: string; content: string; parentId?: number };
  if (!name?.trim() || !email?.trim() || !content?.trim()) return err("Name, email, and content are required");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(String(email))) return err("Invalid email address");
  const post = await kvGet<BlogPost>(kv, `blog:post:${slug}`);
  if (!post || !post.published) return err("Post not found", 404);
  let resolvedParentId: number | null = null;
  if (parentId !== undefined && parentId !== null) {
    const pid = parseInt(String(parentId), 10);
    if (isNaN(pid) || pid <= 0) return err("Invalid parentId");
    const parent = await kvGet<Comment>(kv, `comment:${pid}`);
    if (!parent) return err("Parent comment not found", 404);
    if (parent.postSlug !== slug) return err("Parent comment does not belong to this post");
    if (parent.parentId !== null) return err("Replies to replies are not allowed (max depth: 1)");
    resolvedParentId = pid;
  }
  const counterStr = await kv.get("comments:counter");
  const id = nextId(counterStr);
  const comment: Comment = { id, postSlug: slug, parentId: resolvedParentId, name: String(name).trim(), email: String(email).trim().toLowerCase(), content: String(content).trim(), approved: false, createdAt: new Date().toISOString() };
  const list = await kvGet<number[]>(kv, `comments:${slug}:list`) ?? [];
  await Promise.all([
    kvPut(kv, `comment:${id}`, comment),
    kvPut(kv, `comments:${slug}:list`, [...list, id]),
    kv.put("comments:counter", String(id)),
  ]);
  return c.json({ success: true, id, message: "Your comment is awaiting moderation." }, 201);
});

app.post("/api/comments/:id/react", async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  if (isNaN(id) || id <= 0) return err("Invalid comment id");
  const { type } = await c.req.json().catch(() => ({})) as { type: string };
  if (!["useful", "not_useful"].includes(type)) return err("Invalid reaction type");
  const kv = c.env.PORTFOLIO_KV;
  const comment = await kvGet<Comment>(kv, `comment:${id}`);
  if (!comment || !comment.approved) return err("Comment not found", 404);
  const key = `reaction:${id}:${type}`;
  const current = parseInt(await kv.get(key) ?? "0", 10);
  const newCount = current + 1;
  await kv.put(key, String(newCount));
  return c.json({ count: newCount });
});

app.get("/api/sitemap.xml", async (c) => {
  const index = await kvGet<BlogSummary[]>(c.env.PORTFOLIO_KV, "blog:index") ?? [];
  const published = index.filter((p) => p.published);
  const staticPages = [
    { loc: "/", changefreq: "weekly", priority: "1.0" },
    { loc: "/blog", changefreq: "daily", priority: "0.9" },
    { loc: "/privacy-policy", changefreq: "yearly", priority: "0.3" },
    { loc: "/terms", changefreq: "yearly", priority: "0.3" },
  ];
  const staticEntries = staticPages.map((p) => `  <url>\n    <loc>${escapeXml(BASE_URL + p.loc)}</loc>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`).join("\n");
  const postEntries = published.map((p) => `  <url>\n    <loc>${escapeXml(`${BASE_URL}/blog/${p.slug}`)}</loc>\n    <lastmod>${toW3cDate(p.updatedAt)}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${staticEntries}\n${postEntries}\n</urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
});

app.post("/api/admin/login", async (c) => {
  const secret = getSecret(c.env);
  if (!secret) return err("Server misconfiguration: JWT_SECRET not set", 500);
  const { username, password } = await c.req.json().catch(() => ({})) as { username: string; password: string };
  if (!username || !password) return err("Username and password required");
  const user = await kvGet<AdminUser>(c.env.PORTFOLIO_KV, "admin:user");
  if (!user) return err("Invalid credentials", 401);
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid || user.username !== username) return err("Invalid credentials", 401);
  const token = await signToken({ username: user.username }, secret);
  return c.json({ token, username: user.username });
});

app.get("/api/admin/me", async (c) => {
  const secret = getSecret(c.env);
  if (!secret) return err("Server misconfiguration: JWT_SECRET not set", 500);
  const auth = c.req.header("Authorization");
  if (!auth?.startsWith("Bearer ")) return err("Unauthorized", 401);
  const payload = await verifyToken(auth.slice(7), secret);
  if (!payload) return err("Unauthorized", 401);
  return c.json({ userId: 1, username: payload.username });
});

const adminApp = new Hono<{ Bindings: Bindings }>();
adminApp.use("*", async (c, next) => {
  const secret = getSecret(c.env);
  if (!secret) return err("Server misconfiguration: JWT_SECRET not set", 500);
  const auth = c.req.header("Authorization");
  if (!auth?.startsWith("Bearer ")) return err("Unauthorized", 401);
  const payload = await verifyToken(auth.slice(7), secret);
  if (!payload) return err("Unauthorized", 401);
  return next();
});

adminApp.get("/settings", async (c) => {
  const kv = c.env.PORTFOLIO_KV;
  const allKeys = [...PUBLIC_SETTING_KEYS, "adsense_script", "meta_description", "github_url", "linkedin_url", "twitter_url"];
  const result: Record<string, string> = {};
  await Promise.all(allKeys.map(async (key) => {
    const val = await kv.get(`setting:${key}`);
    if (val !== null) result[key] = val;
  }));
  return c.json(result);
});

adminApp.put("/settings", async (c) => {
  const body = await c.req.json().catch(() => ({})) as Record<string, string>;
  if (typeof body !== "object" || Array.isArray(body)) return err("Expected object");
  const kv = c.env.PORTFOLIO_KV;
  await Promise.all(Object.entries(body).map(([key, value]) => kv.put(`setting:${key}`, String(value))));
  return c.json({ success: true });
});

adminApp.get("/cv", async (c) => {
  const url = await c.env.PORTFOLIO_KV.get("cv:url") ?? "";
  return c.json({ url });
});

adminApp.post("/cv", async (c) => {
  const { url } = await c.req.json().catch(() => ({})) as { url: string };
  await c.env.PORTFOLIO_KV.put("cv:url", url ?? "");
  return c.json({ success: true });
});

adminApp.get("/content", async (c) => {
  const kv = c.env.PORTFOLIO_KV;
  const result: Record<string, ContentSection> = {};
  await Promise.all(CONTENT_SECTIONS.map(async (section) => {
    const data = await kvGet<ContentSection>(kv, `content:${section}`);
    if (data) result[section] = data;
  }));
  return c.json(result);
});

adminApp.put("/content/:section", async (c) => {
  const section = c.req.param("section");
  const { data, visible } = await c.req.json().catch(() => ({})) as { data: unknown; visible?: boolean };
  const existing = await kvGet<ContentSection>(c.env.PORTFOLIO_KV, `content:${section}`) ?? { data: {}, visible: true, updatedAt: new Date().toISOString() };
  const updated: ContentSection = { data: data ?? existing.data, visible: visible ?? existing.visible, updatedAt: new Date().toISOString() };
  await kvPut(c.env.PORTFOLIO_KV, `content:${section}`, updated);
  return c.json(updated);
});

adminApp.get("/blog", async (c) => {
  const index = await kvGet<BlogPost[]>(c.env.PORTFOLIO_KV, "blog:index") ?? [];
  return c.json(index.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
});

adminApp.post("/blog", async (c) => {
  const body = await c.req.json().catch(() => ({})) as Partial<BlogPost>;
  if (!body.title?.trim() || !body.slug?.trim()) return err("Title and slug are required");
  const kv = c.env.PORTFOLIO_KV;
  const existing = await kvGet<BlogPost>(kv, `blog:post:${body.slug}`);
  if (existing) return err("Slug already exists", 409);
  const counterStr = await kv.get("blog:counter");
  const id = nextId(counterStr);
  const now = new Date().toISOString();
  const post: BlogPost = {
    id, slug: body.slug.trim(), title: body.title.trim(),
    content: body.content ?? "", excerpt: body.excerpt ?? "",
    featuredImage: body.featuredImage ?? "", tags: body.tags ?? [],
    metaTitle: body.metaTitle ?? "", metaDescription: body.metaDescription ?? "",
    published: body.published ?? false,
    adsEnabled: body.adsEnabled ?? false, adTop: body.adTop ?? false,
    adMiddle: body.adMiddle ?? false, adBottom: body.adBottom ?? false,
    adScript: body.adScript ?? "",
    createdAt: now, updatedAt: now,
  };
  const index = await kvGet<BlogPost[]>(kv, "blog:index") ?? [];
  await Promise.all([
    kvPut(kv, `blog:post:${post.slug}`, post),
    kv.put(`blog:id:${id}`, post.slug),
    kv.put("blog:counter", String(id)),
    kvPut(kv, "blog:index", [...index, post]),
  ]);
  return c.json(post, 201);
});

adminApp.put("/blog/:id", async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  if (isNaN(id)) return err("Invalid id");
  const kv = c.env.PORTFOLIO_KV;
  const slug = await kv.get(`blog:id:${id}`);
  if (!slug) return err("Post not found", 404);
  const existing = await kvGet<BlogPost>(kv, `blog:post:${slug}`);
  if (!existing) return err("Post not found", 404);
  const body = await c.req.json().catch(() => ({})) as Partial<BlogPost>;
  if (body.slug && body.slug !== existing.slug) {
    const collision = await kvGet<BlogPost>(kv, `blog:post:${body.slug}`);
    if (collision) return err("Slug already in use by another post", 409);
  }
  const updated: BlogPost = {
    ...existing,
    ...(body.title !== undefined && { title: body.title }),
    ...(body.slug !== undefined && { slug: body.slug }),
    ...(body.content !== undefined && { content: body.content }),
    ...(body.excerpt !== undefined && { excerpt: body.excerpt }),
    ...(body.featuredImage !== undefined && { featuredImage: body.featuredImage }),
    ...(body.tags !== undefined && { tags: body.tags }),
    ...(body.metaTitle !== undefined && { metaTitle: body.metaTitle }),
    ...(body.metaDescription !== undefined && { metaDescription: body.metaDescription }),
    ...(body.published !== undefined && { published: body.published }),
    ...(body.adsEnabled !== undefined && { adsEnabled: body.adsEnabled }),
    ...(body.adTop !== undefined && { adTop: body.adTop }),
    ...(body.adMiddle !== undefined && { adMiddle: body.adMiddle }),
    ...(body.adBottom !== undefined && { adBottom: body.adBottom }),
    ...(body.adScript !== undefined && { adScript: body.adScript }),
    updatedAt: new Date().toISOString(),
  };
  const index = await kvGet<BlogPost[]>(kv, "blog:index") ?? [];
  const newIndex = index.map((p) => (p.id === id ? updated : p));
  const ops: Promise<void>[] = [kvPut(kv, "blog:index", newIndex), kvPut(kv, `blog:post:${updated.slug}`, updated)];
  if (body.slug && body.slug !== existing.slug) {
    ops.push(kv.put(`blog:id:${id}`, updated.slug) as unknown as Promise<void>);
    ops.push(kv.delete(`blog:post:${existing.slug}`) as unknown as Promise<void>);
  }
  await Promise.all(ops);
  return c.json(updated);
});

adminApp.delete("/blog/:id", async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  if (isNaN(id)) return err("Invalid id");
  const kv = c.env.PORTFOLIO_KV;
  const slug = await kv.get(`blog:id:${id}`);
  if (!slug) return err("Post not found", 404);
  const index = await kvGet<BlogPost[]>(kv, "blog:index") ?? [];
  await Promise.all([
    kv.delete(`blog:post:${slug}`),
    kv.delete(`blog:id:${id}`),
    kvPut(kv, "blog:index", index.filter((p) => p.id !== id)),
  ]);
  return c.json({ success: true });
});

adminApp.get("/comments", async (c) => {
  const kv = c.env.PORTFOLIO_KV;
  const index = await kvGet<BlogPost[]>(kv, "blog:index") ?? [];
  const allComments: (Comment & { postTitle: string | null; postSlug: string | null })[] = [];
  await Promise.all(
    index.map(async (post) => {
      const commentIds = await kvGet<number[]>(kv, `comments:${post.slug}:list`) ?? [];
      const comments = await Promise.all(commentIds.map((id) => kvGet<Comment>(kv, `comment:${id}`)));
      for (const c of comments) {
        if (c) allComments.push({ ...c, postTitle: post.title, postSlug: post.slug });
      }
    })
  );
  allComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return c.json(allComments);
});

adminApp.patch("/comments/:id", async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  if (isNaN(id)) return err("Invalid id");
  const { approved } = await c.req.json().catch(() => ({})) as { approved: boolean };
  if (typeof approved !== "boolean") return err("approved must be a boolean");
  const kv = c.env.PORTFOLIO_KV;
  const comment = await kvGet<Comment>(kv, `comment:${id}`);
  if (!comment) return err("Comment not found", 404);
  const updated = { ...comment, approved };
  await kvPut(kv, `comment:${id}`, updated);
  return c.json(updated);
});

adminApp.delete("/comments/:id", async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  if (isNaN(id)) return err("Invalid id");
  const kv = c.env.PORTFOLIO_KV;
  const comment = await kvGet<Comment>(kv, `comment:${id}`);
  if (!comment) return err("Comment not found", 404);
  const list = await kvGet<number[]>(kv, `comments:${comment.postSlug}:list`) ?? [];
  await Promise.all([
    kv.delete(`comment:${id}`),
    kvPut(kv, `comments:${comment.postSlug}:list`, list.filter((i) => i !== id)),
  ]);
  return c.json({ success: true });
});

adminApp.get("/messages", async (c) => {
  const kv = c.env.PORTFOLIO_KV;
  const list = await kvGet<number[]>(kv, "messages:list") ?? [];
  const messages = (await Promise.all(list.map((id) => kvGet<Message>(kv, `message:${id}`)))).filter(Boolean) as Message[];
  return c.json(messages);
});

adminApp.patch("/messages/:id", async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  if (isNaN(id)) return err("Invalid id");
  const kv = c.env.PORTFOLIO_KV;
  const msg = await kvGet<Message>(kv, `message:${id}`);
  if (!msg) return err("Message not found", 404);
  const updated = { ...msg, read: !msg.read };
  await kvPut(kv, `message:${id}`, updated);
  return c.json(updated);
});

adminApp.delete("/messages/:id", async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  if (isNaN(id)) return err("Invalid id");
  const kv = c.env.PORTFOLIO_KV;
  const msg = await kvGet<Message>(kv, `message:${id}`);
  if (!msg) return err("Message not found", 404);
  const list = await kvGet<number[]>(kv, "messages:list") ?? [];
  await Promise.all([
    kv.delete(`message:${id}`),
    kvPut(kv, "messages:list", list.filter((i) => i !== id)),
  ]);
  return c.json({ success: true });
});

adminApp.put("/password", async (c) => {
  const { currentPassword, newPassword } = await c.req.json().catch(() => ({})) as { currentPassword: string; newPassword: string };
  if (!currentPassword || !newPassword) return err("Both current and new password required");
  if (newPassword.length < 6) return err("New password must be at least 6 characters");
  const kv = c.env.PORTFOLIO_KV;
  const user = await kvGet<AdminUser>(kv, "admin:user");
  if (!user) return err("User not found", 404);
  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) return err("Current password is incorrect", 401);
  const newHash = await bcrypt.hash(newPassword, 10);
  await kvPut(kv, "admin:user", { ...user, passwordHash: newHash });
  return c.json({ success: true });
});

app.route("/api/admin", adminApp);

app.notFound(() => err("Not found", 404));

export const onRequest = handle(app);
