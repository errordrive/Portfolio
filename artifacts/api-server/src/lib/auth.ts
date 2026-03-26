import { createHmac, timingSafeEqual, createHash } from "node:crypto";
import { getJson, putJson } from "./kv.js";
import type { Request, Response, NextFunction } from "express";

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function getSecret(): string {
  return process.env["ADMIN_PASSWORD"]?.trim() || "admin123";
}

export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export function verifyPassword(password: string, hash: string): boolean {
  const computed = hashPassword(password);
  try {
    return timingSafeEqual(Buffer.from(computed, "hex"), Buffer.from(hash, "hex"));
  } catch {
    return false;
  }
}

export function checkAdminPassword(password: string): boolean {
  const storedHash = getJson<string | null>("admin_password_hash", null);
  if (storedHash) return verifyPassword(password, storedHash);
  return password === getSecret();
}

export function changeAdminPassword(newPassword: string): void {
  putJson("admin_password_hash", hashPassword(newPassword));
}

function getTokenSecret(): string {
  const storedHash = getJson<string | null>("admin_password_hash", null);
  return storedHash || getSecret();
}

export function createToken(): string {
  const secret = getTokenSecret();
  const exp = Date.now() + TOKEN_TTL_MS;
  const payload = Buffer.from(JSON.stringify({ exp })).toString("base64url");
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyToken(token: string): boolean {
  const secret = getTokenSecret();
  if (!secret || !token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expectedSig = createHmac("sha256", secret).update(payload).digest("hex");
  try {
    if (!timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expectedSig, "hex"))) return false;
  } catch {
    return false;
  }
  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { exp: number };
    return typeof exp === "number" && exp > Date.now();
  } catch {
    return false;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers["authorization"] ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!verifyToken(token)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
