#!/usr/bin/env node
// tbrain-cms — MCP (stdio) server that gives the content agent a narrow window
// into the tbrain.ai blog: read posts, write/revise drafts, upload images,
// queue a draft for human review, store social copy.
//
// There is deliberately no publish tool. Publishing happens only when a human
// approves in /admin/approvals (and the DB rejects agent posts without one).
//
// Dependency-free: newline-delimited JSON-RPC 2.0 over stdin/stdout, per the
// MCP stdio transport. Env: TBRAIN_API_BASE, CONTENT_AGENT_TOKEN,
// TBRAIN_UPLOAD_ROOT (directory images may be uploaded from).

import { readFile, stat } from "node:fs/promises";
import { basename, resolve, sep } from "node:path";
import { createInterface } from "node:readline";

const API = (process.env.TBRAIN_API_BASE || "https://www.tbrain.ai").replace(/\/+$/, "");
const TOKEN = process.env.CONTENT_AGENT_TOKEN || "";
const UPLOAD_ROOT = resolve(process.env.TBRAIN_UPLOAD_ROOT || process.env.HERMES_HOME || "/opt/data");
const PROTOCOL = "2025-06-18";

const draftProps = {
  title: { type: "string", description: "Post title, 10-160 chars. Specific, no clickbait." },
  slug: { type: "string", description: "Optional URL slug; derived from title if omitted." },
  excerpt: { type: "string", description: "1-2 sentence summary shown on the blog index (<=400 chars)." },
  content_html: {
    type: "string",
    description:
      "Article body as HTML. Allowed: h2-h4, p, ul/ol/li, strong/em, a[href], img[src,alt], blockquote, code/pre, table. No h1 (the title is the h1), no inline styles or scripts.",
  },
  cover_image_url: { type: "string", description: "URL returned by upload_image, or an existing /images/... path." },
  category: { type: "string", description: "One category, e.g. 'Physical AI', 'Data Quality', 'RLHF & Evaluation'." },
  tags: { type: "array", items: { type: "string" }, description: "Up to 12 short tags." },
  author_name: { type: "string", description: "Byline. Leave empty unless a human author is confirmed." },
  seo_title: { type: "string", description: "50-60 chars (rejected above 60)." },
  seo_description: { type: "string", description: "Meta description, 120-155 chars (rejected above 160)." },
  agent_meta: {
    type: "object",
    description:
      "Research trail for the reviewer: {topic, angle, target_keyword, sources:[{url,title,publisher,accessed_at}], rubric:{accuracy,insight,structure,voice,seo,cta} (0-5), factcheck_flags:[string], notes, model}.",
  },
};

const TOOLS = [
  {
    name: "list_posts",
    description:
      "List blog posts (no bodies). Use before proposing topics to avoid repeats and to find internal links. status: published (default) | draft | all.",
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string", enum: ["published", "draft", "all"] },
        q: { type: "string", description: "Search title/excerpt." },
        limit: { type: "integer", minimum: 1, maximum: 300 },
      },
    },
  },
  {
    name: "get_post",
    description: "Fetch one post with body, research trail and its review history (reviewer notes on rejection).",
    inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
  },
  {
    name: "create_draft",
    description: "Create a new blog draft (status draft). Returns the post id and admin URL. Does not publish.",
    inputSchema: { type: "object", properties: draftProps, required: ["title", "content_html"] },
  },
  {
    name: "update_draft",
    description: "Revise an existing agent draft (only drafts the agent created, only while still a draft).",
    inputSchema: { type: "object", properties: { id: { type: "string" }, ...draftProps }, required: ["id"] },
  },
  {
    name: "upload_image",
    description: `Upload a local PNG/JPEG/WebP/GIF (<=8MB) from under ${UPLOAD_ROOT} and get a permanent URL for cover_image_url or <img src>.`,
    inputSchema: {
      type: "object",
      properties: { path: { type: "string", description: "Absolute file path." }, filename: { type: "string" } },
      required: ["path"],
    },
  },
  {
    name: "submit_for_review",
    description:
      "Queue a finished draft for human review. Returns review_url (send it to the reviewer), preview_url and edit_url. Idempotent.",
    inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
  },
  {
    name: "save_social_messages",
    description:
      "Store share copy for the post: linkedin (150-250 words, no link — it is appended), facebook (shorter), x (<=256 chars, link appended). Humans post it from the admin Share panel.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
        linkedin: { type: "string" },
        facebook: { type: "string" },
        x: { type: "string" },
      },
      required: ["id"],
    },
  },
];

async function api(method, path, body) {
  if (!TOKEN) throw new Error("CONTENT_AGENT_TOKEN is not set");
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(60_000),
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text.slice(0, 500) };
  }
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}: ${JSON.stringify(data).slice(0, 1500)}`);
  return data;
}

const enc = encodeURIComponent;

async function callTool(name, args = {}) {
  switch (name) {
    case "list_posts": {
      const qs = new URLSearchParams();
      for (const k of ["status", "q", "limit"]) if (args[k] !== undefined) qs.set(k, String(args[k]));
      return api("GET", `/api/agent/posts?${qs}`);
    }
    case "get_post":
      return api("GET", `/api/agent/posts/${enc(args.id)}`);
    case "create_draft":
      return api("POST", "/api/agent/posts", args);
    case "update_draft": {
      const { id, ...patch } = args;
      return api("PATCH", `/api/agent/posts/${enc(id)}`, patch);
    }
    case "upload_image": {
      const full = resolve(String(args.path || ""));
      if (full !== UPLOAD_ROOT && !full.startsWith(UPLOAD_ROOT + sep)) {
        throw new Error(`path must be under ${UPLOAD_ROOT}`);
      }
      const info = await stat(full);
      if (!info.isFile() || info.size > 8 * 1024 * 1024) throw new Error("not a file or larger than 8MB");
      const data = await readFile(full);
      return api("POST", "/api/agent/assets", {
        filename: String(args.filename || basename(full)),
        data_base64: data.toString("base64"),
      });
    }
    case "submit_for_review":
      return api("POST", `/api/agent/posts/${enc(args.id)}/submit`, {});
    case "save_social_messages": {
      const { id, ...messages } = args;
      return api("PUT", `/api/agent/posts/${enc(id)}/social`, messages);
    }
    default:
      throw new Error(`unknown tool: ${name}`);
  }
}

function send(msg) {
  process.stdout.write(JSON.stringify(msg) + "\n");
}

async function handle(msg) {
  const { id, method, params } = msg;
  const isRequest = id !== undefined && id !== null;
  try {
    let result;
    switch (method) {
      case "initialize":
        result = {
          protocolVersion: params?.protocolVersion || PROTOCOL,
          capabilities: { tools: { listChanged: false } },
          serverInfo: { name: "tbrain-cms", version: "1.0.0" },
          instructions:
            "Blog CMS for tbrain.ai. Drafts only: you cannot publish. After create_draft + submit_for_review, send the review_url to the human reviewer.",
        };
        break;
      case "ping":
        result = {};
        break;
      case "tools/list":
        result = { tools: TOOLS };
        break;
      case "tools/call": {
        try {
          const out = await callTool(params?.name, params?.arguments || {});
          result = { content: [{ type: "text", text: JSON.stringify(out, null, 2) }] };
        } catch (err) {
          result = { content: [{ type: "text", text: String(err?.message || err) }], isError: true };
        }
        break;
      }
      default:
        if (!isRequest) return; // notifications (initialized, cancelled, ...)
        send({ jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } });
        return;
    }
    if (isRequest) send({ jsonrpc: "2.0", id, result });
  } catch (err) {
    if (isRequest) send({ jsonrpc: "2.0", id, error: { code: -32603, message: String(err?.message || err) } });
  }
}

const pending = new Set();
const rl = createInterface({ input: process.stdin });
rl.on("line", (line) => {
  if (!line.trim()) return;
  let msg;
  try {
    msg = JSON.parse(line);
  } catch {
    send({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } });
    return;
  }
  for (const m of Array.isArray(msg) ? msg : [msg]) {
    const p = handle(m).finally(() => pending.delete(p));
    pending.add(p);
  }
});
// Finish in-flight tool calls before exiting when the client closes stdin.
rl.on("close", () => Promise.allSettled([...pending]).then(() => process.exit(0)));
