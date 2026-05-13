#!/usr/bin/env node

import { copyFileSync, existsSync } from "node:fs";

const source = ".env.supabase.local";
const target = ".env.local";

if (!existsSync(source)) {
  console.error(`Missing ${source}. Copy .env.supabase.example to ${source} and fill Supabase official values first.`);
  process.exit(1);
}

copyFileSync(source, target);
console.log(`Copied ${source} -> ${target}`);
