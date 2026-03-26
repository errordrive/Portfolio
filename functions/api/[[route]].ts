// Cloudflare Pages Function — Zero npm dependencies.
// Uses only Web Crypto API (native to all CF Workers) + @cloudflare/workers-types.
// NO hono, NO jose, NO external packages needed.

export interface Env {
  PORTFOLIO_KV: KVNamespace;
  ADMIN_PASSWORD?: string;
}

function getSecret(env: Env): string {
  return env.ADMIN_PASSWORD?.trim() || "admin123";
}

// ── JWT via Web Crypto API (native, zero deps) ────────────────────────────────

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function b64url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function b64urlDecode(s: string): Uint8Array {
  const b = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b.length % 4 === 0 ? "" : "=".repeat(4 - (b.length % 4));
  return Uint8Array.from(atob(b + pad), (c) => c.charCodeAt(0));
}

async function signJwt(
  payload: Record<string, unknown>,
  secret: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(
    new TextEncoder().encode(JSON.stringify({ alg: "HS256", typ: "JWT" }))
  );
  const body = b64url(
    new TextEncoder().encode(
      JSON.stringify({ ...payload, iat: now, exp: now + 7 * 86400 })
    )
  );
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${header}.${body}`)
  );
  return `${header}.${body}.${b64url(sig)}`;
}

async function verifyJwt(
  token: string,
  secret: string
): Promise<Record<string, unknown> | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const key = await hmacKey(secret);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      b64urlDecode(parts[2]),
      new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
    );
    if (!valid) return null;
    const payload = JSON.parse(
      new TextDecoder().decode(b64urlDecode(parts[1]))
    ) as Record<string, unknown>;
    if ((payload.exp as number) < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

// ── Response helpers ──────────────────────────────────────────────────────────

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function err(msg: string, status = 400): Response {
  return json({ error: msg }, status);
}

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

function withCors(res: Response): Response {
  const h = new Headers(res.headers);
  for (const [k, v] of Object.entries(corsHeaders())) h.set(k, v);
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
}

async function getBearer(
  req: Request,
  env: Env
): Promise<Record<string, unknown> | null> {
  const auth = req.headers.get("Authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return null;
  return verifyJwt(auth.slice(7), getSecret(env));
}

// ── KV helpers ────────────────────────────────────────────────────────────────

async function kvGet<T>(kv: KVNamespace, key: string): Promise<T | null> {
  const v = await kv.get(key);
  if (v === null) return null;
  try {
    return JSON.parse(v) as T;
  } catch {
    return null;
  }
}

async function kvPut(kv: KVNamespace, key: string, value: unknown): Promise<void> {
  await kv.put(key, JSON.stringify(value));
}

// ── Backward-compatible KV helpers (support legacy key formats) ───────────────

async function kvGetBlogPost(kv: KVNamespace, slug: string): Promise<unknown | null> {
  return (
    (await kvGet<unknown>(kv, `blog:${slug}`)) ??
    (await kvGet<unknown>(kv, `blog:post:${slug}`))
  );
}

async function kvGetCommentList(kv: KVNamespace, slug: string): Promise<number[] | null> {
  return (
    (await kvGet<number[]>(kv, `comments:${slug}`)) ??
    (await kvGet<number[]>(kv, `comments:${slug}:list`))
  );
}

// ── Type helpers ──────────────────────────────────────────────────────────────

interface BlogSummary {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  featuredImage: string;
  tags: unknown[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BlogPost extends BlogSummary {
  content: string;
  metaTitle: string;
  metaDescription: string;
  adsEnabled: boolean;
  adTop: boolean;
  adMiddle: boolean;
  adBottom: boolean;
  adScript: string;
}

interface ContentSection {
  data: unknown;
  visible: boolean;
  updatedAt: string;
}

interface Comment {
  id: number;
  postSlug: string;
  parentId: number | null;
  name: string;
  email: string;
  content: string;
  approved: boolean;
  createdAt: string;
}

interface Message {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// ── Route constants ───────────────────────────────────────────────────────────

const PUBLIC_SETTING_KEYS = [
  "site_title",
  "site_description",
  "social_github",
  "social_linkedin",
  "social_twitter",
  "adsense_enabled",
  "adsense_publisher_id",
];

const ALL_SETTING_KEYS = [...PUBLIC_SETTING_KEYS, "cv_url"];

const DEFAULT_CONTENT_SECTIONS = [
  "hero",
  "about",
  "skills",
  "experience",
  "projects",
  "contact",
];

// ── Main handler ──────────────────────────────────────────────────────────────

async function handle(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method.toUpperCase();

  // OPTIONS preflight
  if (method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  // ── Public: GET /api/health ───────────────────────────────────────────────
  if (method === "GET" && path === "/api/health") {
    return json({ ok: true, ts: new Date().toISOString() });
  }

  // ── Public: POST /api/admin/login ─────────────────────────────────────────
  if (method === "POST" && path === "/api/admin/login") {
    let body: { username?: string; password?: string } = {};
    try {
      body = await request.json();
    } catch {
      return err("Invalid JSON body");
    }
    const { username = "", password = "" } = body;
    if (username !== "admin" || password !== getSecret(env)) {
      return err("Invalid username or password", 401);
    }
    const token = await signJwt(
      { sub: "admin", username: "admin" },
      getSecret(env)
    );
    return json({ token, username: "admin" });
  }

  // ── Public: GET /api/settings ─────────────────────────────────────────────
  if (method === "GET" && path === "/api/settings") {
    const kv = env.PORTFOLIO_KV;
    const result: Record<string, string> = {};
    await Promise.all(
      PUBLIC_SETTING_KEYS.map(async (k) => {
        const v = await kv.get(`setting:${k}`);
        if (v !== null) result[k] = v;
      })
    );
    return json(result);
  }

  // ── Public: GET /api/cv ───────────────────────────────────────────────────
  if (method === "GET" && path === "/api/cv") {
    const u = (await env.PORTFOLIO_KV.get("cv:url")) ?? "";
    return json({ url: u });
  }

  // ── Public: GET /api/content ──────────────────────────────────────────────
  if (method === "GET" && path === "/api/content") {
    const kv = env.PORTFOLIO_KV;
    const sections =
      (await kvGet<string[]>(kv, "content:index")) ?? DEFAULT_CONTENT_SECTIONS;
    const result: Record<string, ContentSection> = {};
    await Promise.all(
      sections.map(async (s) => {
        const data = await kvGet<ContentSection>(kv, `content:${s}`);
        if (data) result[s] = data;
      })
    );
    return json(result);
  }

  // ── Public: GET /api/content/:section ────────────────────────────────────
  const contentMatch = path.match(/^\/api\/content\/([^/]+)$/);
  if (method === "GET" && contentMatch) {
    const data = await kvGet<ContentSection>(
      env.PORTFOLIO_KV,
      `content:${contentMatch[1]}`
    );
    if (!data) return err("Section not found", 404);
    return json(data);
  }

  // ── Public: GET /api/blog ─────────────────────────────────────────────────
  if (method === "GET" && path === "/api/blog") {
    const index =
      (await kvGet<BlogSummary[]>(env.PORTFOLIO_KV, "blog:index")) ?? [];
    const published = index
      .filter((p) => p.published)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    return json(published);
  }

  // ── Public: GET /api/blog/:slug ───────────────────────────────────────────
  const blogSlugMatch = path.match(/^\/api\/blog\/([^/]+)$/);
  if (method === "GET" && blogSlugMatch) {
    const data = await kvGetBlogPost(env.PORTFOLIO_KV, blogSlugMatch[1]) as BlogPost | null;
    if (!data || !data.published) return err("Post not found", 404);
    return json(data);
  }

  // ── Public: GET /api/blog/:slug/comments ─────────────────────────────────
  const commentsGetMatch = path.match(/^\/api\/blog\/([^/]+)\/comments$/);
  if (method === "GET" && commentsGetMatch) {
    const slug = commentsGetMatch[1];
    const kv = env.PORTFOLIO_KV;
    const list = (await kvGetCommentList(kv, slug)) ?? [];
    type StoredComment = Comment & { postSlug?: string; email?: string; reactions?: Record<string, number> };
    const allApproved = (
      await Promise.all(list.map((id) => kvGet<StoredComment>(kv, `comment:${id}`)))
    ).filter((c): c is StoredComment => c !== null && c.approved);
    // Look up blog index to resolve postId from slug
    const blogIndex = (await kvGet<BlogSummary[]>(kv, "blog:index")) ?? [];
    const slugToId: Record<string, number> = {};
    blogIndex.forEach((p) => { slugToId[p.slug] = p.id; });
    // Build public-safe shape (no email, with reactions + postId)
    type PublicComment = Omit<Comment, "email"> & { replies: PublicComment[] };
    const shaped: PublicComment[] = allApproved.map(({ email: _e, postSlug, reactions, ...rest }) => ({
      ...rest,
      postId: rest.postId ?? (postSlug ? (slugToId[postSlug] ?? 0) : 0),
      reactions: reactions ?? { useful: 0, not_useful: 0 },
      replies: [] as PublicComment[],
    }));
    // Build reply tree: nest children under parent
    const topLevel: PublicComment[] = [];
    const byId: Record<number, PublicComment> = {};
    shaped.forEach((c) => { byId[c.id] = c; });
    shaped.forEach((c) => {
      if (c.parentId && byId[c.parentId]) {
        byId[c.parentId].replies.push(c);
      } else {
        topLevel.push(c);
      }
    });
    return json(topLevel);
  }

  // ── Public: POST /api/blog/:slug/comments ────────────────────────────────
  const commentsPostMatch = path.match(/^\/api\/blog\/([^/]+)\/comments$/);
  if (method === "POST" && commentsPostMatch) {
    const slug = commentsPostMatch[1];
    let body: {
      name?: string;
      email?: string;
      content?: string;
      parentId?: number;
    } = {};
    try {
      body = await request.json();
    } catch {
      return err("Invalid JSON body");
    }
    if (!body.name || !body.email || !body.content) {
      return err("Missing required fields: name, email, content");
    }
    const kv = env.PORTFOLIO_KV;
    const raw = await kv.get("comments:counter");
    const id = (parseInt(raw ?? "0", 10) || 0) + 1;
    const comment: Comment = {
      id,
      postSlug: slug,
      parentId: body.parentId ?? null,
      name: body.name,
      email: body.email,
      content: body.content,
      approved: false,
      createdAt: new Date().toISOString(),
    };
    const list = (await kvGetCommentList(kv, slug)) ?? [];
    await Promise.all([
      kvPut(kv, `comment:${id}`, comment),
      kvPut(kv, `comments:${slug}`, [...list, id]),
      kv.put("comments:counter", String(id)),
    ]);
    return json({ success: true, id, message: "Comment submitted for review" }, 201);
  }

  // ── Public: POST /api/contact ─────────────────────────────────────────────
  if (method === "POST" && path === "/api/contact") {
    let body: {
      name?: string;
      email?: string;
      subject?: string;
      message?: string;
    } = {};
    try {
      body = await request.json();
    } catch {
      return err("Invalid JSON body");
    }
    if (!body.name || !body.email || !body.message) {
      return err("Missing required fields: name, email, message");
    }
    const kv = env.PORTFOLIO_KV;
    const raw = await kv.get("messages:counter");
    const id = (parseInt(raw ?? "0", 10) || 0) + 1;
    const msg: Message = {
      id,
      name: body.name,
      email: body.email,
      subject: body.subject ?? "",
      message: body.message,
      read: false,
      createdAt: new Date().toISOString(),
    };
    const list = (await kvGet<number[]>(kv, "messages:list")) ?? [];
    await Promise.all([
      kvPut(kv, `message:${id}`, msg),
      kvPut(kv, "messages:list", [...list, id]),
      kv.put("messages:counter", String(id)),
    ]);
    return json({ success: true, message: "Message sent successfully" });
  }

  // ── POST /api/comments/:id/react ──────────────────────────────────────────
  const reactMatch = path.match(/^\/api\/comments\/(\d+)\/react$/);
  if (method === "POST" && reactMatch) {
    const id = parseInt(reactMatch[1], 10);
    let body: { type?: string } = {};
    try {
      body = await request.json();
    } catch { /* ok */ }
    const kv = env.PORTFOLIO_KV;
    const comment = await kvGet<Comment & { reactions?: Record<string, number> }>(kv, `comment:${id}`);
    if (!comment) return err("Comment not found", 404);
    const reactions = comment.reactions ?? { useful: 0, not_useful: 0 };
    if (body.type === "useful") reactions.useful = (reactions.useful ?? 0) + 1;
    else if (body.type === "not_useful") reactions.not_useful = (reactions.not_useful ?? 0) + 1;
    await kvPut(kv, `comment:${id}`, { ...comment, reactions });
    return json({ count: reactions[body.type ?? "useful"] ?? 0 });
  }

  // ── Public: GET /api/sitemap ─────────────────────────────────────────────
  // Note: /sitemap.xml is served as a static file; /api/sitemap is the dynamic version.
  if (method === "GET" && path === "/api/sitemap") {
    const kv = env.PORTFOLIO_KV;
    const index = (await kvGet<BlogSummary[]>(kv, "blog:index")) ?? [];
    const published = index.filter((p) => p.published);
    const baseUrl = "https://nayem.me";
    const esc = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    const staticPaths = ["/", "/blog", "/admin/login"];
    const staticUrls = staticPaths
      .map((p2) => `  <url><loc>${esc(baseUrl + p2)}</loc><changefreq>weekly</changefreq><priority>${p2 === "/" ? "1.0" : "0.8"}</priority></url>`)
      .join("\n");
    const blogUrls = published
      .map((p2) => `  <url><loc>${esc(`${baseUrl}/blog/${p2.slug}`)}</loc><lastmod>${new Date(p2.updatedAt).toISOString().split("T")[0]}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`)
      .join("\n");
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${staticUrls}\n${blogUrls}\n</urlset>`;
    return new Response(xml, {
      status: 200,
      headers: { "Content-Type": "application/xml; charset=utf-8" },
    });
  }

  // ── Admin routes (JWT required) ───────────────────────────────────────────
  if (path.startsWith("/api/admin/") && path !== "/api/admin/login") {
    const claims = await getBearer(request, env);
    if (!claims) return err("Unauthorized", 401);

    const adminPath = path.slice("/api/admin".length);

    // GET /api/admin/me
    if (method === "GET" && adminPath === "/me") {
      return json({ userId: 1, username: "admin" });
    }

    // GET /api/admin/settings
    if (method === "GET" && adminPath === "/settings") {
      const kv = env.PORTFOLIO_KV;
      const result: Record<string, string> = {};
      await Promise.all(
        ALL_SETTING_KEYS.map(async (k) => {
          const v = await kv.get(`setting:${k}`);
          if (v !== null) result[k] = v;
        })
      );
      return json(result);
    }

    // PUT /api/admin/settings
    if (method === "PUT" && adminPath === "/settings") {
      let body: Record<string, string> = {};
      try {
        body = await request.json();
      } catch {
        return err("Invalid JSON body");
      }
      const kv = env.PORTFOLIO_KV;
      await Promise.all(
        Object.entries(body).map(([k, v]) => kv.put(`setting:${k}`, String(v)))
      );
      return json({ success: true });
    }

    // GET /api/admin/cv
    if (method === "GET" && adminPath === "/cv") {
      const u = (await env.PORTFOLIO_KV.get("cv:url")) ?? "";
      return json({ url: u });
    }

    // POST /api/admin/cv
    if (method === "POST" && adminPath === "/cv") {
      let body: { url?: string } = {};
      try {
        body = await request.json();
      } catch { /* ok */ }
      await env.PORTFOLIO_KV.put("cv:url", body?.url ?? "");
      return json({ success: true });
    }

    // GET /api/admin/content
    if (method === "GET" && adminPath === "/content") {
      const kv = env.PORTFOLIO_KV;
      const sections =
        (await kvGet<string[]>(kv, "content:index")) ?? DEFAULT_CONTENT_SECTIONS;
      const result: Record<string, ContentSection> = {};
      await Promise.all(
        sections.map(async (s) => {
          const data = await kvGet<ContentSection>(kv, `content:${s}`);
          if (data) result[s] = data;
        })
      );
      return json(result);
    }

    // PUT /api/admin/content/:section
    const contentAdminMatch = adminPath.match(/^\/content\/([^/]+)$/);
    if (method === "PUT" && contentAdminMatch) {
      const section = contentAdminMatch[1];
      let body: { data?: unknown; visible?: boolean } = {};
      try {
        body = await request.json();
      } catch {
        return err("Invalid JSON body");
      }
      const kv = env.PORTFOLIO_KV;
      const existing = (await kvGet<ContentSection>(kv, `content:${section}`)) ?? {
        data: {},
        visible: true,
        updatedAt: "",
      };
      const updated: ContentSection = {
        data: body.data !== undefined ? body.data : existing.data,
        visible: body.visible !== undefined ? body.visible : existing.visible,
        updatedAt: new Date().toISOString(),
      };
      await kvPut(kv, `content:${section}`, updated);
      return json(updated);
    }

    // GET /api/admin/blog
    if (method === "GET" && adminPath === "/blog") {
      const index =
        (await kvGet<BlogSummary[]>(env.PORTFOLIO_KV, "blog:index")) ?? [];
      return json(
        index.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
    }

    // POST /api/admin/blog
    if (method === "POST" && adminPath === "/blog") {
      let body: Partial<BlogPost> = {};
      try {
        body = await request.json();
      } catch {
        return err("Invalid JSON body");
      }
      const kv = env.PORTFOLIO_KV;
      const raw = await kv.get("blog:counter");
      const id = (parseInt(raw ?? "0", 10) || 0) + 1;
      const slug =
        (body.slug as string) ||
        (body.title ?? "post")
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")
          .slice(0, 80);
      const now = new Date().toISOString();
      const post: BlogPost = {
        id,
        slug,
        title: body.title ?? "",
        content: body.content ?? "",
        excerpt: body.excerpt ?? "",
        featuredImage: body.featuredImage ?? "",
        tags: body.tags ?? [],
        metaTitle: body.metaTitle ?? "",
        metaDescription: body.metaDescription ?? "",
        published: body.published ?? false,
        adsEnabled: body.adsEnabled ?? false,
        adTop: body.adTop ?? false,
        adMiddle: body.adMiddle ?? false,
        adBottom: body.adBottom ?? false,
        adScript: body.adScript ?? "",
        createdAt: now,
        updatedAt: now,
      };
      const index = (await kvGet<BlogSummary[]>(kv, "blog:index")) ?? [];
      const { content: _c, metaTitle: _mt, metaDescription: _md, adsEnabled: _ae, adTop: _at, adMiddle: _am, adBottom: _ab, adScript: _as, ...summary } = post;
      await Promise.all([
        kvPut(kv, `blog:${slug}`, post),
        kvPut(kv, "blog:index", [...index, summary]),
        kv.put("blog:counter", String(id)),
      ]);
      return json(post, 201);
    }

    // PUT /api/admin/blog/:id
    const blogIdMatch = adminPath.match(/^\/blog\/(\d+)$/);
    if (method === "PUT" && blogIdMatch) {
      const id = parseInt(blogIdMatch[1], 10);
      let body: Partial<BlogPost> = {};
      try {
        body = await request.json();
      } catch {
        return err("Invalid JSON body");
      }
      const kv = env.PORTFOLIO_KV;
      const index = (await kvGet<BlogSummary[]>(kv, "blog:index")) ?? [];
      const existing = index.find((p) => p.id === id);
      if (!existing) return err("Post not found", 404);
      const full = await kvGetBlogPost(kv, existing.slug) as BlogPost | null;
      if (!full) return err("Post not found", 404);
      const updated: BlogPost = { ...full, ...body, id, updatedAt: new Date().toISOString() };
      const newIndex = index.map((p) =>
        p.id === id
          ? {
              ...p,
              slug: updated.slug,
              title: updated.title,
              excerpt: updated.excerpt,
              featuredImage: updated.featuredImage,
              tags: updated.tags,
              published: updated.published,
              updatedAt: updated.updatedAt,
            }
          : p
      );
      const targetSlug = updated.slug || existing.slug;
      const ops: Promise<unknown>[] = [
        kvPut(kv, `blog:${targetSlug}`, updated),
        kvPut(kv, "blog:index", newIndex),
      ];
      if (targetSlug !== existing.slug) ops.push(kv.delete(`blog:${existing.slug}`));
      await Promise.all(ops);
      return json(updated);
    }

    // DELETE /api/admin/blog/:id
    if (method === "DELETE" && blogIdMatch) {
      const id = parseInt(blogIdMatch[1], 10);
      const kv = env.PORTFOLIO_KV;
      const index = (await kvGet<BlogSummary[]>(kv, "blog:index")) ?? [];
      const post = index.find((p) => p.id === id);
      if (!post) return err("Post not found", 404);
      await Promise.all([
        kv.delete(`blog:${post.slug}`),
        kvPut(kv, "blog:index", index.filter((p) => p.id !== id)),
      ]);
      return json({ success: true });
    }

    // GET /api/admin/messages
    if (method === "GET" && adminPath === "/messages") {
      const kv = env.PORTFOLIO_KV;
      const list = (await kvGet<number[]>(kv, "messages:list")) ?? [];
      const msgs = (
        await Promise.all(list.map((id) => kvGet<Message>(kv, `message:${id}`)))
      ).filter((m): m is Message => m !== null);
      return json(
        msgs.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
    }

    // PATCH /api/admin/messages/:id
    const msgIdMatch = adminPath.match(/^\/messages\/(\d+)$/);
    if (method === "PATCH" && msgIdMatch) {
      const id = parseInt(msgIdMatch[1], 10);
      const kv = env.PORTFOLIO_KV;
      const msg = await kvGet<Message>(kv, `message:${id}`);
      if (!msg) return err("Message not found", 404);
      const updated = { ...msg, read: !msg.read };
      await kvPut(kv, `message:${id}`, updated);
      return json(updated);
    }

    // DELETE /api/admin/messages/:id
    if (method === "DELETE" && msgIdMatch) {
      const id = parseInt(msgIdMatch[1], 10);
      const kv = env.PORTFOLIO_KV;
      const msg = await kvGet<unknown>(kv, `message:${id}`);
      if (!msg) return err("Message not found", 404);
      const list = (await kvGet<number[]>(kv, "messages:list")) ?? [];
      await Promise.all([
        kv.delete(`message:${id}`),
        kvPut(kv, "messages:list", list.filter((i) => i !== id)),
      ]);
      return json({ success: true });
    }

    // GET /api/admin/comments
    if (method === "GET" && adminPath === "/comments") {
      const kv = env.PORTFOLIO_KV;
      const keys = await kv.list({ prefix: "comment:" });
      type StoredComment = Comment & { postSlug?: string; email?: string; reactions?: Record<string, number> };
      const comments = (
        await Promise.all(keys.keys.map((k) => kvGet<StoredComment>(kv, k.name)))
      ).filter((c): c is StoredComment => c !== null);
      // Enrich with postTitle and postSlug from blog index
      const blogIdx = (await kvGet<BlogSummary[]>(kv, "blog:index")) ?? [];
      const idToPost: Record<number, BlogSummary> = {};
      const slugToPost: Record<string, BlogSummary> = {};
      blogIdx.forEach((p) => { idToPost[p.id] = p; slugToPost[p.slug] = p; });
      const enriched = comments
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map((c) => {
          const post = (c.postId ? idToPost[c.postId] : undefined) ?? (c.postSlug ? slugToPost[c.postSlug] : undefined);
          return {
            ...c,
            postId: c.postId ?? post?.id ?? 0,
            postTitle: post?.title ?? null,
            postSlug: c.postSlug ?? post?.slug ?? null,
          };
        });
      return json(enriched);
    }

    // PATCH /api/admin/comments/:id
    const commentIdMatch = adminPath.match(/^\/comments\/(\d+)$/);
    if (method === "PATCH" && commentIdMatch) {
      const id = parseInt(commentIdMatch[1], 10);
      let body: { approved?: boolean } = {};
      try {
        body = await request.json();
      } catch { /* ok */ }
      const kv = env.PORTFOLIO_KV;
      const comment = await kvGet<Comment>(kv, `comment:${id}`);
      if (!comment) return err("Comment not found", 404);
      const updated = { ...comment, approved: body.approved ?? comment.approved };
      await kvPut(kv, `comment:${id}`, updated);
      return json(updated);
    }

    // DELETE /api/admin/comments/:id
    if (method === "DELETE" && commentIdMatch) {
      const id = parseInt(commentIdMatch[1], 10);
      const kv = env.PORTFOLIO_KV;
      const comment = await kvGet<Comment>(kv, `comment:${id}`);
      if (!comment) return err("Comment not found", 404);
      const list =
        (await kvGet<number[]>(kv, `comments:${comment.postSlug}`)) ?? [];
      await Promise.all([
        kv.delete(`comment:${id}`),
        kvPut(
          kv,
          `comments:${comment.postSlug}`,
          list.filter((i) => i !== id)
        ),
      ]);
      return json({ success: true });
    }

    // PUT /api/admin/password — not supported via API
    if (method === "PUT" && adminPath === "/password") {
      return json(
        {
          success: false,
          message:
            "To change your password, set the ADMIN_PASSWORD environment variable in Cloudflare Pages → Settings → Environment Variables, then redeploy.",
        },
        400
      );
    }

    return err("Admin route not found", 404);
  }

  return err("Not found", 404);
}

// ── Cloudflare Pages Functions export ─────────────────────────────────────────

export const onRequest: PagesFunction<Env> = async (context) => {
  const res = await handle(context.request, context.env);
  return withCors(res);
};
