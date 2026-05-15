#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const migrations = process.argv.slice(2);
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_DB_URL;

if (!databaseUrl) {
  console.error("Missing DATABASE_URL, POSTGRES_URL, or SUPABASE_DB_URL in .env.local.");
  console.error("Example: DATABASE_URL=postgresql://postgres:password@host:5432/postgres?sslmode=require");
  process.exit(1);
}

const files = migrations.length > 0 ? migrations : ["supabase/migrations/018_about_sections.sql", "supabase/migrations/020_about_hero_settings.sql"];

for (const file of files) {
  if (!existsSync(file)) {
    console.error(`Migration not found: ${file}`);
    process.exit(1);
  }
}

const psql = findCommand("psql");
const docker = findCommand("docker");

for (const file of files) {
  console.log(`Applying ${file}`);
  const result = psql ? runLocalPsql(psql, file, databaseUrl) : runDockerPsql(docker, file, databaseUrl);
  if (result.status !== 0) {
    console.error(result.stderr || result.stdout || `Migration failed: ${file}`);
    process.exit(result.status ?? 1);
  }
  if (result.stdout) process.stdout.write(result.stdout);
}

console.log("Migrations applied.");

function runLocalPsql(command, file, url) {
  return spawnSync(command, ["--set", "ON_ERROR_STOP=1", url, "-f", file], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function runDockerPsql(command, file, url) {
  if (!command) {
    console.error("Neither psql nor docker is available. Install one of them to run migrations.");
    process.exit(1);
  }

  const sql = readFileSync(file, "utf8");
  return spawnSync(command, ["run", "--rm", "-i", "postgres:16-alpine", "psql", "--set", "ON_ERROR_STOP=1", url], {
    input: sql,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  });
}

function findCommand(command) {
  const result = spawnSync("sh", ["-lc", `command -v ${command}`], { encoding: "utf8" });
  return result.status === 0 ? result.stdout.trim() : "";
}
