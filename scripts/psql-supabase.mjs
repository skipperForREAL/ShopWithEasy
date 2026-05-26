#!/usr/bin/env node
/**
 * Open psql against Supabase using DIRECT_URL or DATABASE_URL from .env.local then .env
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function parseEnvFile(content) {
  /** @type {Record<string, string>} */
  const out = {};
  for (const raw of content.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function loadEnv() {
  /** @type {Record<string, string>} */
  const merged = {};
  for (const name of [".env.local", ".env"]) {
    const p = path.join(root, name);
    if (!fs.existsSync(p)) continue;
    Object.assign(merged, parseEnvFile(fs.readFileSync(p, "utf8")));
  }
  return merged;
}

function ensureSslMode(url) {
  if (/[?&]sslmode=/i.test(url)) return url;
  return url + (url.includes("?") ? "&" : "?") + "sslmode=require";
}

const env = loadEnv();
const raw = env.DIRECT_URL || env.DATABASE_URL;
if (!raw) {
  console.error("Missing DIRECT_URL or DATABASE_URL in .env.local");
  process.exit(1);
}

const connectionUri = ensureSslMode(raw);
const psqlArgs = [connectionUri, ...process.argv.slice(2)];

const child = spawn("psql", psqlArgs, {
  stdio: "inherit",
  cwd: root,
  shell: false,
  env: { ...process.env },
});

child.on("error", (err) => {
  console.error(err.message);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) process.exit(1);
  process.exit(code ?? 0);
});
