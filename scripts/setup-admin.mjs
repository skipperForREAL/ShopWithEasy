#!/usr/bin/env node
/**
 * Create or update the store owner admin in Clerk + Postgres.
 *
 *   ADMIN_EMAIL='you@example.com' ADMIN_PASSWORD='secret' ADMIN_NAME='Name' node scripts/setup-admin.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient, Role } from "@prisma/client";

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
  for (const [k, v] of Object.entries(merged)) {
    if (process.env[k] === undefined) process.env[k] = v;
  }
  return merged;
}

async function clerkRequest(secret, method, pathname, body) {
  const res = await fetch(`https://api.clerk.com/v1${pathname}`, {
    method,
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const msg =
      typeof data === "object" && data?.errors?.[0]?.message
        ? data.errors[0].message
        : typeof data === "string"
          ? data
          : JSON.stringify(data);
    throw new Error(`Clerk ${method} ${pathname}: ${res.status} ${msg}`);
  }
  return data;
}

async function findClerkUserByEmail(secret, email) {
  const data = await clerkRequest(
    secret,
    "GET",
    `/users?email_address=${encodeURIComponent(email)}&limit=1`,
  );
  return data?.[0] ?? null;
}

async function ensureClerkAdmin(secret, { email, password, name }) {
  const existing = await findClerkUserByEmail(secret, email);
  const firstName = name.split(/\s+/)[0] || name;

  if (existing) {
    await clerkRequest(secret, "PATCH", `/users/${existing.id}`, {
      first_name: firstName,
      last_name: name.split(/\s+/).slice(1).join(" ") || undefined,
      password,
    });
    return existing.id;
  }

  const created = await clerkRequest(secret, "POST", "/users", {
    email_address: [email],
    password,
    first_name: firstName,
    last_name: name.split(/\s+/).slice(1).join(" ") || undefined,
    skip_password_checks: true,
    skip_password_requirement: false,
  });
  return created.id;
}

function upsertAdminClerkIds(envLocalPath, clerkId) {
  const lines = fs.readFileSync(envLocalPath, "utf8").split("\n");
  let found = false;
  const next = lines.map((line) => {
    if (!line.startsWith("ADMIN_CLERK_IDS=")) return line;
    found = true;
    const current = line.slice("ADMIN_CLERK_IDS=".length).trim();
    const ids = current ? current.split(",").map((s) => s.trim()).filter(Boolean) : [];
    if (!ids.includes(clerkId)) ids.push(clerkId);
    return `ADMIN_CLERK_IDS=${ids.join(",")}`;
  });
  if (!found) next.push(`ADMIN_CLERK_IDS=${clerkId}`);
  fs.writeFileSync(envLocalPath, next.join("\n"));
}

async function main() {
  loadEnv();

  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "Admin";
  const secret = process.env.CLERK_SECRET_KEY;

  if (!email || !password) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD.");
    process.exit(1);
  }
  if (!secret) {
    console.error("Missing CLERK_SECRET_KEY in .env.local");
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    console.error("Missing DATABASE_URL in .env.local");
    process.exit(1);
  }

  const clerkId = await ensureClerkAdmin(secret, { email, password, name });
  console.log(`Clerk user ready: ${clerkId}`);

  const envLocalPath = path.join(root, ".env.local");
  if (fs.existsSync(envLocalPath)) {
    upsertAdminClerkIds(envLocalPath, clerkId);
    console.log("Updated ADMIN_CLERK_IDS in .env.local");
  }

  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.upsert({
      where: { clerkId },
      create: {
        clerkId,
        email,
        name,
        role: Role.ADMIN,
      },
      update: {
        email,
        name,
        role: Role.ADMIN,
      },
    });
    console.log(`Database user: ${user.id} (${user.role})`);
  } finally {
    await prisma.$disconnect();
  }

  console.log("\nDone. Sign in at /sign-in with the configured email and password.");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
