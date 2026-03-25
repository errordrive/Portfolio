const API_BASE = "/api";

function getToken(): string | null {
  return localStorage.getItem("cms_token");
}

export function setToken(token: string) {
  localStorage.setItem("cms_token", token);
}

export function clearToken() {
  localStorage.removeItem("cms_token");
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearToken();
    window.location.href = "/admin/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

// Auth
export const api = {
  auth: {
    login: (username: string, password: string) =>
      request<{ token: string; username: string }>("/admin/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      }),
    me: () => request<{ userId: number; username: string }>("/admin/me"),
  },

  // Public
  content: {
    getAll: () => request<PublicContent>("/content"),
    getSection: (section: string) =>
      request<ContentSection<unknown>>(`/content/${section}`),
  },

  settings: {
    getPublic: () => request<Record<string, string>>("/settings"),
    getCv: () => request<{ url: string }>("/cv"),
  },

  blog: {
    list: () => request<BlogPost[]>("/blog"),
    getBySlug: (slug: string) => request<BlogPost>(`/blog/${slug}`),
  },

  // Admin
  admin: {
    content: {
      getAll: () => request<AllContent>("/admin/content"),
      update: (section: string, data: unknown, visible?: boolean) =>
        request("/admin/content/" + section, {
          method: "PUT",
          body: JSON.stringify({ data, visible }),
        }),
    },

    blog: {
      list: () => request<BlogPost[]>("/admin/blog"),
      create: (post: Partial<BlogPost>) =>
        request<BlogPost>("/admin/blog", {
          method: "POST",
          body: JSON.stringify(post),
        }),
      update: (id: number, post: Partial<BlogPost>) =>
        request<BlogPost>(`/admin/blog/${id}`, {
          method: "PUT",
          body: JSON.stringify(post),
        }),
      delete: (id: number) =>
        request(`/admin/blog/${id}`, { method: "DELETE" }),
    },

    messages: {
      list: () => request<Message[]>("/admin/messages"),
      toggleRead: (id: number) =>
        request<Message>(`/admin/messages/${id}`, { method: "PATCH" }),
      delete: (id: number) =>
        request(`/admin/messages/${id}`, { method: "DELETE" }),
    },

    settings: {
      get: () => request<Record<string, string>>("/admin/settings"),
      update: (data: Record<string, string>) =>
        request("/admin/settings", {
          method: "PUT",
          body: JSON.stringify(data),
        }),
      getCv: () => request<{ url: string }>("/admin/cv"),
      updateCv: (url: string) =>
        request("/admin/cv", {
          method: "POST",
          body: JSON.stringify({ url }),
        }),
    },

    password: {
      change: (currentPassword: string, newPassword: string) =>
        request("/admin/password", {
          method: "PUT",
          body: JSON.stringify({ currentPassword, newPassword }),
        }),
    },
  },
};

// ─────────────────────────────── Blog ────────────────────────────────────────

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  published: boolean;
  adsEnabled: boolean;
  adTop: boolean;
  adMiddle: boolean;
  adBottom: boolean;
  adScript: string;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────── Messages ─────────────────────────────────────

export interface Message {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// ─────────────────────────────── Content data shapes ─────────────────────────

export interface CtaButton {
  label: string;
  href: string;
}

export interface StatItem {
  label: string;
  value: string;
}

export interface HeroData {
  name: string;
  statusBadge: string;
  tagline: string;
  body: string;
  roles: string[];
  ctaPrimary: CtaButton;
  ctaSecondary: CtaButton;
  stats: StatItem[];
}

export interface Highlight {
  title: string;
  desc: string;
  color: string;
}

export interface AboutData {
  heading: string;
  yearsLabel: string;
  bio: string[];
  highlights: Highlight[];
}

export interface Skill {
  name: string;
  icon: string;
  level: number;
  category: string;
  desc: string;
}

export interface SkillsData {
  skills: Skill[];
}

export interface TimelineEntry {
  year: string;
  title: string;
  org: string;
  desc: string;
  tags: string[];
  color: string;
}

export interface ExperienceData {
  timeline: TimelineEntry[];
}

export interface Project {
  title: string;
  desc: string;
  tech: string[];
  github: string;
  demo: string;
  featured: boolean;
}

export interface ProjectsData {
  projects: Project[];
}

// ─────────────────────────────── Content section wrappers ────────────────────

export interface ContentSection<T> {
  data: T;
  visible: boolean;
  updatedAt?: string;
}

/** Shape returned by GET /admin/content */
export interface AllContent {
  hero?: ContentSection<HeroData>;
  about?: ContentSection<AboutData>;
  skills?: ContentSection<SkillsData>;
  experience?: ContentSection<ExperienceData>;
  projects?: ContentSection<ProjectsData>;
}

/** Shape returned by GET /content (public, partial overlap) */
export type PublicContent = Partial<AllContent>;
