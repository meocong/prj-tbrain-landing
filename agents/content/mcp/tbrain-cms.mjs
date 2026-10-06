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

import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
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
  cover_image_url: { type: "string", description: "PNG/JPEG URL returned by upload_image (licensed source figure) or a library image_url. Never an SVG chart." },
  category: { type: "string", description: "One category, e.g. 'Physical AI', 'Data Quality', 'RLHF & Evaluation'." },
  tags: { type: "array", items: { type: "string" }, description: "Up to 12 short tags." },
  author_name: { type: "string", description: "Byline. Leave empty unless a human author is confirmed." },
  seo_title: { type: "string", description: "50-60 chars (rejected above 60)." },
  seo_description: { type: "string", description: "Meta description, 120-155 chars (rejected above 160)." },
  agent_meta: {
    type: "object",
    description:
      "Research trail for the reviewer: {post_type, topic, reader, takeaway, target_keyword, knowledge_ids, images:[{url, why, kind: source_figure|chart|library, credit, license, source_url}], sources:[{url,title,publisher,accessed_at}], scorecard:{total, items}, reader_pass, factcheck_flags:[string], notes, model}.",
  },
};

const TOOLS = [
  {
    name: "list_posts",
    description:
      "List blog posts (no bodies), each with post_type and visuals (kinds/forms used). Use before proposing topics or writing, to avoid repeats and to rotate types and visual forms, and to find internal links. status: published (default) | draft | all (newest edits first).",
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
      properties: {
        path: { type: "string", description: "Absolute file path." },
        filename: { type: "string" },
        crop: {
          type: "object",
          description: "Optional crop as fractions of the image: {x, y, w, h} (0-1). Use it to keep only the panel you discuss; figures list their panels left-to-right / top-to-bottom.",
          properties: { x: { type: "number" }, y: { type: "number" }, w: { type: "number" }, h: { type: "number" } },
        },
      },
      required: ["path"],
    },
  },
  {
    name: "source_license",
    description:
      "Check whether figures from a paper may be reused. Give an arXiv id or URL. Returns {license, license_url, reusable, credit_hint, html_url, pdf_url}. reusable is true only for CC BY, CC BY-SA and CC0; arXiv's default licence and any NC/ND licence are NOT reusable: redraw the data with render_chart instead and credit the source as 'Data: …'.",
    inputSchema: { type: "object", properties: { arxiv: { type: "string" } }, required: ["arxiv"] },
  },
  {
    name: "fetch_source_image",
    description: `Download a figure/image from an https URL (<=8MB, PNG/JPEG/WebP/GIF) into ${UPLOAD_ROOT}/figures/; then upload_image it (with crop to the panel you discuss). Only for sources whose licence allows reuse (source_license, a CC/Apache/MIT notice on the page, or a press kit). Returns {path, bytes, type}.`,
    inputSchema: {
      type: "object",
      properties: { url: { type: "string" }, filename: { type: "string", description: "Short name, e.g. 'egodex-fig2'." } },
      required: ["url"],
    },
  },
  {
    name: "render_chart",
    description:
      "Draw an original visual in the Tbrain style. Returns {url (SVG for inline <img>), png_url (for cover_image_url / social)}. spec.type: " +
      "bar {data:[{label,value,highlight?}] 2-12, unit?, sort?} · " +
      "line {x_labels:[..] 2-24, series:[{name, values:[number|null]}] 1-4, unit?, y_min?} · " +
      "scatter {x_label, y_label, x_unit?, y_unit?, log_x?, points:[{label,x,y,highlight?}] 2-12} · " +
      "share {categories:[..] 2-5, rows:[{label, values:[..]}] 1-6} (100% split, e.g. a data mix) · " +
      "stat {stats:[{value:'829 h', label, highlight?}] 1-4} (hero numbers) · " +
      "matrix {columns:[..] 2-6, rows:[{label, cells:['yes'|'no'|'partial'|short text], highlight?}] 2-10} (who has what) · " +
      "timeline {events:[{date,label,highlight?}] 2-8} · " +
      "flow {steps:[{label, note?, highlight?}] 2-6} · " +
      "quadrant {x_axis:{low,high}, y_axis:{low,high}, quadrant_labels?:[tl,tr,bl,br], items:[{label,x:0-1,y:0-1,highlight?}] 1-10} · " +
      "cover {title, eyebrow? ('Deep dive · Teleop'), subtitle?, stat?:{value,label}} (1200x630 PNG cover card) · " +
      "annotate {image_url (a /api/asset/cms/… PNG/JPEG you uploaded), source (credit + licence), title?, markers:[{kind: dot|box|arrow, x, y (0-1 of the image), w?, h? (box), label}] 1-6} (numbered call-outs on a licensed figure; only when you have verified positions with the vision tool). " +
      "Charts: title = the claim the chart proves (<=90 chars), subtitle? = what is measured, source = where the numbers come from. Highlight the one item the paragraph is about.",
    inputSchema: {
      type: "object",
      properties: { spec: { type: "object" }, filename: { type: "string" } },
      required: ["spec"],
    },
  },
  {
    name: "hf_hub_query",
    description:
      "Original analysis on the public Hugging Face Hub (for by_the_numbers posts). Lists datasets matching {search?, filter? (a tag such as 'LeRobot' or 'task_categories:robotics'), author?, sort: downloads|likes|createdAt|lastModified, limit<=1000} and returns {query, accessed_at, n, top:[…30], aggregates:{license, author, created_month, …}}. With lerobot_info:true it also reads meta/info.json of the top <=80 (by sort) LeRobot datasets and adds robot_type, fps, episodes, frames, hours, cameras per dataset plus their totals, medians and distributions. Cite the query and access date in the post.",
    inputSchema: {
      type: "object",
      properties: {
        search: { type: "string" },
        filter: { type: "string" },
        author: { type: "string" },
        sort: { type: "string", enum: ["downloads", "likes", "createdAt", "lastModified"] },
        limit: { type: "number" },
        lerobot_info: { type: "boolean" },
        info_limit: { type: "number", description: "How many datasets to read meta/info.json for (<=80, default 40)." },
      },
    },
  },
  {
    name: "arxiv_count",
    description:
      "Count arXiv papers per year for a search (arXiv API syntax, e.g. 'abs:\"egocentric\" AND abs:\"manipulation\" AND cat:cs.RO'). {query, from_year, to_year (<=8 years)} -> {counts:{year:n}, query, accessed_at}. Slow on purpose (arXiv asks for 3s between calls).",
    inputSchema: {
      type: "object",
      properties: { query: { type: "string" }, from_year: { type: "number" }, to_year: { type: "number" } },
      required: ["query", "from_year", "to_year"],
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
            post_type: { type: "string", enum: ["news_hook", "field_story", "trend_pov", "buyer_guide", "proof", "deep_dive", "synthesis", "by_the_numbers"] },
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

const LICENSES = [
  [/creativecommons\.org\/publicdomain\/zero/i, "CC0 1.0", true],
  [/creativecommons\.org\/licenses\/by-nc-nd\/([\d.]+)/i, "CC BY-NC-ND", false],
  [/creativecommons\.org\/licenses\/by-nc-sa\/([\d.]+)/i, "CC BY-NC-SA", false],
  [/creativecommons\.org\/licenses\/by-nc\/([\d.]+)/i, "CC BY-NC", false],
  [/creativecommons\.org\/licenses\/by-nd\/([\d.]+)/i, "CC BY-ND", false],
  [/creativecommons\.org\/licenses\/by-sa\/([\d.]+)/i, "CC BY-SA", true],
  [/creativecommons\.org\/licenses\/by\/([\d.]+)/i, "CC BY", true],
  [/arxiv\.org\/licenses\/nonexclusive-distrib/i, "arXiv non-exclusive (default)", false],
];

async function sourceLicense(ref) {
  const m = ref.match(/(\d{4}\.\d{4,5})(v\d+)?/) || ref.match(/([a-z-]+(?:\.[A-Z]{2})?\/\d{7})/);
  if (!m) throw new Error("give an arXiv id like 2505.11709 or an arxiv.org URL");
  const id = m[1];
  const res = await fetch(`https://arxiv.org/abs/${id}`, { signal: AbortSignal.timeout(20_000) });
  if (!res.ok) throw new Error(`arxiv.org/abs/${id} -> ${res.status}`);
  const html = (await readCapped(res, 5 * 1024 * 1024)).toString("utf8");
  const licBlock = (html.match(/<div class="abs-license">[\s\S]{0,600}?<\/div>/i) || [html])[0];
  let license = "unknown";
  let reusable = false;
  let license_url = null;
  for (const [re, name, ok] of LICENSES) {
    const hit = licBlock.match(re);
    if (hit) {
      license = hit[1] ? `${name} ${hit[1]}` : name;
      reusable = ok;
      license_url = (licBlock.match(/href="([^"]+)"/i) || [])[1] || null;
      break;
    }
  }
  const title = (html.match(/<meta name="citation_title" content="([^"]+)"/i) || [])[1] || null;
  const authors = [...html.matchAll(/<meta name="citation_author" content="([^"]+)"/gi)].map((a) => a[1]);
  const date = (html.match(/<meta name="citation_date" content="([^"]+)"/i) || [])[1] || "";
  const first = authors[0] ? authors[0].split(",")[0].trim() : "Authors";
  const year = (date.match(/\d{4}/) || [""])[0];
  const figures = reusable ? await arxivFigures(id).catch(() => []) : [];
  return {
    id,
    title,
    license,
    license_url,
    reusable,
    credit_hint: `${first}${authors.length > 1 ? " et al." : ""}, ${year} (arXiv:${id}), ${license}`,
    html_url: `https://arxiv.org/html/${id}`,
    pdf_url: `https://arxiv.org/pdf/${id}`,
    figures,
    note: reusable
      ? "Reuse allowed with credit. Pick from figures (or html_url), fetch_source_image it, crop to the panel you discuss, caption it with what to notice + the credit."
      : "Do not reproduce figures. Redraw the numbers you need with render_chart and credit 'Data: <credit>', or describe and link the figure.",
  };
}

// Figures from the arXiv HTML rendering: [{url, caption}] (raster only).
async function arxivFigures(id) {
  const res = await fetch(`https://arxiv.org/html/${id}`, { redirect: "follow", signal: AbortSignal.timeout(20_000) });
  if (!res.ok || !res.url.startsWith("https://arxiv.org/")) return [];
  const base = res.url.endsWith("/") ? res.url : res.url.replace(/[^/]*$/, "");
  const html = (await readCapped(res, 15 * 1024 * 1024)).toString("utf8");
  const out = [];
  for (const fig of html.matchAll(/<figure[^>]*>([\s\S]*?)<\/figure>/gi)) {
    const src = (fig[1].match(/<img[^>]+src="([^"]+\.(?:png|jpe?g|gif|webp))"/i) || [])[1];
    if (!src) continue;
    const cap = (fig[1].match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i) || [])[1] || "";
    const caption = cap.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 240);
    const url = new URL(src, base.startsWith("https://arxiv.org/html/") ? "https://arxiv.org/html/" : base).toString();
    if (!out.some((f) => f.url === url)) out.push({ url, caption });
    if (out.length >= 15) break;
  }
  return out;
}

async function getJson(url, max = 20 * 1024 * 1024) {
  const res = await fetchHttps(url, { headers: { "User-Agent": "TbrainContentAgent/1.0 (+https://www.tbrain.ai)" }, signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`${res.status} from ${new URL(url).host}`);
  return JSON.parse((await readCapped(res, max)).toString("utf8"));
}

function countBy(items, key) {
  const out = {};
  for (const it of items) {
    const k = key(it);
    if (k === undefined || k === null || k === "") continue;
    out[k] = (out[k] || 0) + 1;
  }
  return Object.fromEntries(Object.entries(out).sort((a, b) => b[1] - a[1]).slice(0, 25));
}

const median = (xs) => {
  const v = xs.filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
  if (!v.length) return null;
  const m = Math.floor(v.length / 2);
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
};

async function hfHubQuery(args) {
  const qs = new URLSearchParams();
  if (args.search) qs.set("search", String(args.search).slice(0, 100));
  if (args.filter) qs.set("filter", String(args.filter).slice(0, 100));
  if (args.author) qs.set("author", String(args.author).slice(0, 100));
  qs.set("sort", ["downloads", "likes", "createdAt", "lastModified"].includes(args.sort) ? args.sort : "downloads");
  qs.set("direction", "-1");
  qs.set("limit", String(Math.min(1000, Math.max(1, Number(args.limit) || 200))));
  qs.set("full", "true");
  const url = `https://huggingface.co/api/datasets?${qs}`;
  const raw = await getJson(url);
  const items = raw.map((d) => ({
    id: d.id,
    author: d.author,
    downloads: d.downloads,
    likes: d.likes,
    created: d.createdAt,
    license: (d.tags || []).find((t) => t.startsWith("license:"))?.slice(8) || d.cardData?.license || null,
    size: (d.tags || []).find((t) => t.startsWith("size_categories:"))?.slice(16) || null,
    gated: Boolean(d.gated),
  }));
  const out = {
    query: url,
    accessed_at: new Date().toISOString(),
    n: items.length,
    total_downloads: items.reduce((a, b) => a + (b.downloads || 0), 0),
    top: items.slice(0, 30),
    aggregates: {
      license: countBy(items, (i) => i.license || "none"),
      author: countBy(items, (i) => i.author),
      created_month: Object.fromEntries(Object.entries(countBy(items, (i) => (i.created || "").slice(0, 7))).sort()),
      size: countBy(items, (i) => i.size),
      gated: countBy(items, (i) => (i.gated ? "gated" : "open")),
    },
  };
  if (args.lerobot_info) {
    const take = items.slice(0, Math.min(80, Math.max(1, Number(args.info_limit) || 40)));
    const infos = [];
    for (let i = 0; i < take.length; i += 6) {
      const batch = await Promise.all(
        take.slice(i, i + 6).map(async (d) => {
          try {
            const info = await getJson(`https://huggingface.co/datasets/${d.id}/resolve/main/meta/info.json`, 2 * 1024 * 1024);
            const feats = info.features || {};
            const cameras = Object.entries(feats).filter(([, f]) => f && (f.dtype === "video" || f.dtype === "image")).length;
            const hours = info.total_frames && info.fps ? info.total_frames / info.fps / 3600 : null;
            return {
              id: d.id,
              robot_type: info.robot_type || null,
              fps: info.fps || null,
              episodes: info.total_episodes ?? null,
              frames: info.total_frames ?? null,
              hours: hours === null ? null : Math.round(hours * 10) / 10,
              tasks: info.total_tasks ?? null,
              cameras,
              codebase_version: info.codebase_version || null,
            };
          } catch {
            return { id: d.id, error: "no meta/info.json" };
          }
        }),
      );
      infos.push(...batch);
    }
    const ok = infos.filter((x) => !x.error);
    out.lerobot = {
      read: infos.length,
      with_info: ok.length,
      datasets: infos,
      totals: {
        episodes: ok.reduce((a, b) => a + (b.episodes || 0), 0),
        hours: Math.round(ok.reduce((a, b) => a + (b.hours || 0), 0) * 10) / 10,
      },
      medians: {
        episodes: median(ok.map((x) => x.episodes)),
        hours: median(ok.map((x) => x.hours)),
        fps: median(ok.map((x) => x.fps)),
        cameras: median(ok.map((x) => x.cameras)),
        episode_seconds: median(ok.map((x) => (x.frames && x.fps && x.episodes ? x.frames / x.fps / x.episodes : NaN))),
      },
      distributions: {
        robot_type: countBy(ok, (x) => x.robot_type || "unknown"),
        fps: countBy(ok, (x) => x.fps),
        cameras: countBy(ok, (x) => x.cameras),
        codebase_version: countBy(ok, (x) => x.codebase_version),
      },
    };
  }
  return out;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function arxivCount(args) {
  const from = Math.floor(Number(args.from_year));
  const to = Math.floor(Number(args.to_year));
  if (!from || !to || to < from || to - from > 7) throw new Error("from_year..to_year, at most 8 years");
  const q = String(args.query || "").slice(0, 300);
  if (!q) throw new Error("query required");
  const counts = {};
  for (let y = from; y <= to; y++) {
    const sq = `(${q}) AND submittedDate:[${y}01010000 TO ${y}12312359]`;
    const url = `https://export.arxiv.org/api/query?search_query=${encodeURIComponent(sq)}&max_results=1`;
    const res = await fetchHttps(url, { signal: AbortSignal.timeout(30_000) });
    const xml = (await readCapped(res, 1024 * 1024)).toString("utf8");
    const m = xml.match(/<opensearch:totalResults[^>]*>(\d+)</);
    counts[y] = m ? Number(m[1]) : null;
    if (y < to) await sleep(3100);
  }
  return { query: q, counts, accessed_at: new Date().toISOString(), note: "arXiv search counts by submission year; the current year is partial." };
}

function sniffImage(buf) {
  if (buf.length < 12) return null;
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "png";
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) return "gif";
  if (buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP") return "webp";
  return null;
}

const MAX_IMAGE = 8 * 1024 * 1024;

// Read a response body with a hard byte cap (Content-Length can lie or be absent).
async function readCapped(res, max) {
  const chunks = [];
  let total = 0;
  for await (const chunk of res.body) {
    total += chunk.length;
    if (total > max) {
      await res.body.cancel().catch(() => {});
      throw new Error(`larger than ${Math.round(max / 1024 / 1024)}MB`);
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

// Follow up to 5 redirects by hand, re-checking that every hop stays on https.
async function fetchHttps(url, init = {}) {
  let current = new URL(url);
  for (let hop = 0; hop < 6; hop++) {
    if (current.protocol !== "https:") throw new Error("https only");
    const res = await fetch(current, { ...init, redirect: "manual" });
    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      current = new URL(res.headers.get("location"), current);
      continue;
    }
    return res;
  }
  throw new Error("too many redirects");
}

async function fetchSourceImage(url, filename) {
  let u;
  try {
    u = new URL(url);
  } catch {
    throw new Error("not a URL");
  }
  const res = await fetchHttps(u, {
    headers: { "User-Agent": "TbrainContentAgent/1.0 (+https://www.tbrain.ai)" },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`${res.status} fetching ${u.host}`);
  if (Number(res.headers.get("content-length") || 0) > MAX_IMAGE) throw new Error("larger than 8MB");
  const buf = await readCapped(res, MAX_IMAGE);
  const type = sniffImage(buf);
  if (!type) throw new Error("not a PNG/JPEG/WebP/GIF (SVG and PDF figures: screenshot or redraw with render_chart)");
  const dir = resolve(UPLOAD_ROOT, "figures");
  await mkdir(dir, { recursive: true });
  const base = String(filename || basename(u.pathname) || "figure").replace(/\.[a-z0-9]+$/i, "").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 60);
  const path = resolve(dir, `${base}.${type}`);
  await writeFile(path, buf);
  return { path, bytes: buf.length, type, source_url: u.toString() };
}


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
        crop: args.crop,
      });
    }
    case "source_license":
      return sourceLicense(String(args.arxiv || ""));
    case "fetch_source_image":
      return fetchSourceImage(String(args.url || ""), args.filename);
    case "hf_hub_query":
      return hfHubQuery(args);
    case "arxiv_count":
      return arxivCount(args);
    case "render_chart":
      return api("POST", "/api/agent/charts", { spec: args.spec, filename: args.filename });
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
          serverInfo: { name: "tbrain-cms", version: "1.4.0" },
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
