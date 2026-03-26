# Cloudflare Pages Deployment Guide

This portfolio runs on **Cloudflare Pages** (frontend) + **Cloudflare Pages Functions** (API) + **Cloudflare KV** (database).

---

## 1. Create the KV Namespace

In Cloudflare dashboard → **Workers & Pages → KV**:

1. Click **Create namespace**
2. Name it `PORTFOLIO_KV`
3. Note the **Namespace ID**

---

## 2. Connect GitHub to Cloudflare Pages

1. Go to **Workers & Pages → Create → Pages**
2. Connect your GitHub account → select `errordrive/Portfolio`
3. Configure the build:

| Setting | Value |
|---|---|
| **Framework preset** | None |
| **Build command** | `pnpm --filter @workspace/portfolio run build` |
| **Build output directory** | `artifacts/portfolio/dist/public` |
| **Root directory** | `/` (repo root) |

4. Click **Save and Deploy**

---

## 3. Add Environment Variables

In your Pages project → **Settings → Environment variables**, add:

| Variable | Value |
|---|---|
| `JWT_SECRET` | A long random string (use a password generator) |

> Generate a strong secret: `openssl rand -base64 32`

---

## 4. Bind the KV Namespace

In **Settings → Functions → KV namespace bindings**:

| Variable name | KV namespace |
|---|---|
| `PORTFOLIO_KV` | Select `PORTFOLIO_KV` (the one you created in step 1) |

Click **Save** and trigger a new deployment.

---

## 5. Seed the KV Database

After deployment, seed the initial data (admin user, default settings, content):

```bash
# Install wrangler globally
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Generate the seed file
node scripts/seed-kv.js > seed-kv.json

# Push seed data to KV (replace with your real namespace ID)
wrangler kv:bulk put --namespace-id=YOUR_KV_NAMESPACE_ID seed-kv.json

# Clean up
rm seed-kv.json
```

The seed creates:
- **Admin user**: username `admin`, password `admin123` — **change this immediately after first login!**
- Default site settings (title, social links, etc.)
- Default content sections (hero, about, skills, projects, experience, contact)
- Empty blog, messages, and comments lists

---

## 6. First Login

1. Visit `https://your-pages-domain.pages.dev/admin`
2. Login with `admin` / `admin123`
3. Go to **Settings → Change Password** immediately
4. Fill in your site content via the **Content** section

---

## Local Development

The Express.js server at `artifacts/api-server` still works for local development on Replit. Pages Functions only activate on Cloudflare.

```bash
# Start local dev server
pnpm --filter @workspace/portfolio run dev   # Frontend (Vite + proxy to Express)
pnpm --filter @workspace/api-server run dev  # Backend (Express + PostgreSQL)
```

---

## Custom Domain (nayem.me)

In **Pages → Custom domains**:
1. Add `nayem.me`
2. Follow the DNS instructions (add a CNAME at your domain registrar)
3. SSL is automatic

---

## wrangler.toml (local Functions testing)

Update `artifacts/portfolio/wrangler.toml` with your real KV namespace IDs:

```toml
[[kv_namespaces]]
binding = "PORTFOLIO_KV"
id = "YOUR_PRODUCTION_KV_NAMESPACE_ID"
preview_id = "YOUR_PREVIEW_KV_NAMESPACE_ID"
```

Then run locally:
```bash
cd artifacts/portfolio
npx wrangler pages dev dist/public --kv PORTFOLIO_KV
```
