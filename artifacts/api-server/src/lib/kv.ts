import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const KV_DIR = join(process.cwd(), ".local");
const KV_PATH = join(KV_DIR, "dev-kv.json");

function ensureDir() {
  if (!existsSync(KV_DIR)) mkdirSync(KV_DIR, { recursive: true });
}

function load(): Record<string, string> {
  ensureDir();
  if (!existsSync(KV_PATH)) return {};
  try {
    return JSON.parse(readFileSync(KV_PATH, "utf8")) as Record<string, string>;
  } catch {
    return {};
  }
}

function save(store: Record<string, string>) {
  ensureDir();
  writeFileSync(KV_PATH, JSON.stringify(store, null, 2), "utf8");
}

export const kv = {
  get(key: string): string | null {
    return load()[key] ?? null;
  },
  put(key: string, value: string): void {
    const store = load();
    store[key] = value;
    save(store);
  },
  delete(key: string): void {
    const store = load();
    delete store[key];
    save(store);
  },
  list(prefix: string): string[] {
    const store = load();
    return Object.keys(store).filter((k) => k.startsWith(prefix));
  },
};

export function getJson<T>(key: string, fallback: T): T {
  const raw = kv.get(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function putJson<T>(key: string, value: T): void {
  kv.put(key, JSON.stringify(value));
}
