# Cloudflare Pages Deployment Guide

This portfolio runs on **Cloudflare Pages** (frontend + API functions) + **Cloudflare KV** (database).

---

## IMPORTANT: Fix the 405 Error

If you see "Request failed: 405" on the admin login page, your Cloudflare Pages project
is not finding the API functions. Fix it by updating these 3 settings in the dashboard:

**Workers & Pages → [your project] → Settings → Build & deployments**

| Setting | Change TO |
|---|---|
| **Root directory** | `artifacts/portfolio` |
| **Build output directory** | `dist/public` |
| **Build command** | `cd ../../ && pnpm install && pnpm --filter @workspace/portfolio run build` |

After saving, click **Retry deployment**. The 405 will be gone.

---

## 1. Connect Your KV Namespace

Your KV namespace ID is: `ee8c7e2e80794b879a4d9f74adcbb21f`

In your Pages project → **Settings → Functions → KV namespace bindings**:

| Variable name | KV namespace |
|---|---|
| `PORTFOLIO_KV` | Select your KV namespace (ID: ee8c7e2e80794b879a4d9f74adcbb21f) |

> The variable name MUST be `PORTFOLIO_KV` — this is what the API code uses.

---

## 2. Set Your Admin Password (Optional)

In your Pages project → **Settings → Environment variables**:

| Variable | Value |
|---|---|
| `ADMIN_PASSWORD` | Your desired admin password |

If you skip this, the default password `admin123` is used.

---

## 3. Build Settings Summary

After the fix above, your final Cloudflare Pages build settings should be:

| Setting | Value |
|---|---|
| **Root directory** | `artifacts/portfolio` |
| **Build command** | `cd ../../ && pnpm install && pnpm --filter @workspace/portfolio run build` |
| **Build output directory** | `dist/public` |

---

## 4. First Login

1. Visit `https://nayem.me/admin/login`
2. Enter `admin` / `admin123` (or whatever you set as `ADMIN_PASSWORD`)
3. Go to admin Settings if you want to update site content

---

## Local Development

```bash
pnpm --filter @workspace/portfolio run dev   # Frontend (Vite)
pnpm --filter @workspace/api-server run dev  # Backend (Express + PostgreSQL)
```
