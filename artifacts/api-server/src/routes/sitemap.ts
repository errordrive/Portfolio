import { Router, type Request, type Response } from "express";
import { getJson } from "../lib/kv.js";

const router = Router();
const BASE_URL = "https://nayem.me";

const STATIC_PAGES = [
  { loc: "/", changefreq: "weekly", priority: "1.0" },
  { loc: "/blog", changefreq: "daily", priority: "0.9" },
  { loc: "/privacy-policy", changefreq: "yearly", priority: "0.3" },
  { loc: "/terms", changefreq: "yearly", priority: "0.3" },
];

function escapeXml(str: string) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function toW3cDate(date: string) {
  return new Date(date).toISOString().split("T")[0];
}

router.get("/sitemap.xml", (_req: Request, res: Response) => {
  try {
    const posts = getJson<{ slug: string; updatedAt?: string; createdAt: string }[]>("blog:index", []);
    const urls: string[] = [
      ...STATIC_PAGES.map(p =>
        `  <url><loc>${BASE_URL}${p.loc}</loc><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`
      ),
      ...posts.map(p =>
        `  <url><loc>${BASE_URL}/blog/${escapeXml(p.slug)}</loc><lastmod>${toW3cDate(p.updatedAt || p.createdAt)}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`
      ),
    ];
    res.setHeader("Content-Type", "application/xml");
    res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`);
  } catch {
    res.status(500).send("<?xml version=\"1.0\"?><urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\"/>");
  }
});

export default router;
