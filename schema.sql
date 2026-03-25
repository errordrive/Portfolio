-- D1-compatible schema for Cloudflare migration
-- Run with: wrangler d1 execute portfolio-cms --file=schema.sql

CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')) NOT NULL
);

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TEXT DEFAULT (datetime('now')) NOT NULL
);

CREATE TABLE IF NOT EXISTS content_sections (
  section TEXT PRIMARY KEY,
  data TEXT NOT NULL DEFAULT '{}',
  visible INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT DEFAULT (datetime('now')) NOT NULL
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL DEFAULT '',
  excerpt TEXT NOT NULL DEFAULT '',
  featured_image TEXT NOT NULL DEFAULT '',
  tags TEXT NOT NULL DEFAULT '[]',
  meta_title TEXT NOT NULL DEFAULT '',
  meta_description TEXT NOT NULL DEFAULT '',
  published INTEGER NOT NULL DEFAULT 0,
  ads_enabled INTEGER NOT NULL DEFAULT 0,
  ad_top INTEGER NOT NULL DEFAULT 0,
  ad_middle INTEGER NOT NULL DEFAULT 0,
  ad_bottom INTEGER NOT NULL DEFAULT 0,
  ad_script TEXT NOT NULL DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')) NOT NULL,
  updated_at TEXT DEFAULT (datetime('now')) NOT NULL
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')) NOT NULL
);

CREATE TABLE IF NOT EXISTS cv_file (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT NOT NULL DEFAULT '',
  updated_at TEXT DEFAULT (datetime('now')) NOT NULL
);
