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
      "Research trail for the reviewer: {topic, angle, target_keyword, sources:[{url,title,publisher,accessed_at}], rubric:{accuracy,framing,insight,structure,voice,visuals,seo,cta} (0-5), factcheck_flags:[string], notes, model}.",
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
  {
    name: "claim_request",
    description:
      "Take the next queued job (from the admin or from chat; types: draft = write a new post from brief/topic; revise = revise post_id per brief.notes; scout = propose topics). Returns {request, post, topic, requested_by}, or {request:null} when nothing is waiting. Always finish a claimed job with complete_request.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "complete_request",
    description:
      "Finish a claimed job. status done|failed. result: {post_id (draft/revise), message (1-2 sentences for the admin, English)}. For scout, save topics with save_topics first.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
        status: { type: "string", enum: ["done", "failed"] },
        result: { type: "object" },
      },
      required: ["id", "status"],
    },
  },
  {
    name: "queue_request",
    description:
      "Queue a background job when someone asks in chat. type: draft (write a post: topic_seq for a saved idea \"#12\" and/or brief.idea), revise (post_id + brief.notes; drafts only), scout (find new topics). brief: {idea, keyword, audience, notes, experience (what the requester has seen/done first-hand), post_type (news_hook|field_story|trend_pov|buyer_guide|proof), skip_outline (true only if they say to write straight away)}. requested_by_label: the requester's name. Returns jobs_ahead. The queue poll runs it within ~2 minutes; you report the result when it finishes. Use this instead of doing long work inside the chat.",
    inputSchema: {
      type: "object",
      properties: {
        type: { type: "string", enum: ["draft", "revise", "scout"] },
        topic_seq: { type: "integer", description: "Topic idea number (#12 -> 12)." },
        post_id: { type: "string" },
        brief: {
          type: "object",
          properties: {
            idea: { type: "string" },
            keyword: { type: "string" },
            audience: { type: "string" },
            notes: { type: "string" },
            experience: { type: "string" },
            post_type: { type: "string", enum: ["news_hook", "field_story", "trend_pov", "buyer_guide", "proof"] },
            skip_outline: { type: "boolean" },
          },
        },
        requested_by_label: { type: "string" },
      },
      required: ["type"],
    },
  },
  {
    name: "list_requests",
    description: "The 20 most recent agent jobs (queued/running/done/failed/cancelled) with brief, via and result. For /status.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "save_topics",
    description:
      "Save a topic shortlist so it shows in the admin and can be picked by number. topics: [{title, why_now, angle, keyword, audience, data_line, sources:[https urls], score (0-20), post_type (news_hook|field_story|trend_pov|buyer_guide|proof), funnel (top|middle|bottom)}] in the order you will present them; request_id when running a scout job. Returns [{seq, title}] — number topics in your message as #seq.",
    inputSchema: {
      type: "object",
      properties: {
        topics: { type: "array", items: { type: "object" } },
        request_id: { type: "string" },
      },
      required: ["topics"],
    },
  },
  {
    name: "list_topics",
    description: "List saved topic ideas. status: new (default) | queued | drafted | dismissed | all. Use to resolve \"#12\" or to show open ideas.",
    inputSchema: {
      type: "object",
      properties: { status: { type: "string" }, limit: { type: "integer", minimum: 1, maximum: 100 } },
    },
  },
  {
    name: "search_knowledge",
    description:
      "Search Tbrain's APPROVED knowledge base: kind story (field stories you may retell), fact (approved Tbrain facts), doc (uploaded documents, text excerpt), image (approved images with a description of what they show). Filter by kind, data_line, q. Only approved items exist here; cite the ids you use in agent_meta.knowledge_ids.",
    inputSchema: {
      type: "object",
      properties: {
        kind: { type: "string", enum: ["story", "fact", "doc", "image"] },
        q: { type: "string" },
        data_line: { type: "string" },
        limit: { type: "integer", minimum: 1, maximum: 100 },
      },
    },
  },
  {
    name: "get_knowledge",
    description: "Fetch one approved knowledge item in full (whole document text for docs).",
    inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
  },
  {
    name: "list_images",
    description:
      "The approved image library: [{id, image_url, title, image_description, data_line, tags}]. Pick inline images and covers ONLY from here, by what the description says the image shows.",
    inputSchema: { type: "object", properties: { data_line: { type: "string" }, q: { type: "string" } } },
  },
  {
    name: "submit_outline",
    description:
      "Phase 1 of a draft job: save the proposed outline and park the job for human approval (it leaves the queue until someone approves). outline: {post_type, title, reader, problem, takeaway, opening (the first two paragraphs as they will read), sections:[{h2 (a claim), point}], closing, cta, images:[{url, why}], knowledge_ids, sources, notes}. Do NOT call complete_request after this.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string", description: "Job id." }, outline: { type: "object" } },
      required: ["id", "outline"],
    },
  },
  {
    name: "review_outline",
    description:
      "Record a chat reviewer's decision on an outline waiting for approval: action approve | revise (notes required: what to change) | cancel. by: the reviewer's name. The job returns to the queue (approve → full draft; revise → new outline).",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
        action: { type: "string", enum: ["approve", "revise", "cancel"] },
        notes: { type: "string" },
        by: { type: "string" },
      },
      required: ["id", "action"],
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
    case "claim_request":
      return api("POST", "/api/agent/requests/claim", {});
    case "complete_request":
      return api("PATCH", `/api/agent/requests/${enc(args.id)}`, { status: args.status, result: args.result || {} });
    case "queue_request":
      return api("POST", "/api/agent/requests", args);
    case "list_requests":
      return api("GET", "/api/agent/requests");
    case "save_topics":
      return api("POST", "/api/agent/topics", args);
    case "list_topics": {
      const qs = new URLSearchParams();
      for (const k of ["status", "limit"]) if (args[k] !== undefined) qs.set(k, String(args[k]));
      return api("GET", `/api/agent/topics?${qs}`);
    }
    case "search_knowledge": {
      const qs = new URLSearchParams();
      for (const k of ["kind", "q", "data_line", "limit"]) if (args[k] !== undefined) qs.set(k, String(args[k]));
      return api("GET", `/api/agent/knowledge?${qs}`);
    }
    case "get_knowledge":
      return api("GET", `/api/agent/knowledge/${enc(args.id)}`);
    case "list_images": {
      const qs = new URLSearchParams({ kind: "image", limit: "100" });
      for (const k of ["q", "data_line"]) if (args[k] !== undefined) qs.set(k, String(args[k]));
      const out = await api("GET", `/api/agent/knowledge?${qs}`);
      return {
        images: (out.items || []).map(({ id, image_url, title, image_description, data_line, tags }) => ({
          id, image_url, title, image_description, data_line, tags,
        })),
      };
    }
    case "submit_outline":
      return api("POST", `/api/agent/requests/${enc(args.id)}/outline`, { outline: args.outline });
    case "review_outline":
      return api("POST", `/api/agent/requests/${enc(args.id)}/review`, {
        action: args.action, notes: args.notes, by: args.by,
      });
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
          serverInfo: { name: "tbrain-cms", version: "1.2.0" },
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
