import { type NextRequest } from "next/server";
import { cookies } from "next/headers";
import Anthropic from "@anthropic-ai/sdk";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { resolveAIProvider } from "@/lib/ai/provider";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";

export const runtime = "nodejs";

const CHAT_COOKIE = "tb_chat_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const SYSTEM_PROMPT = `You are the Tbrain AI assistant on tbrain.ai. Be concise, professional, and helpful. Use markdown for formatting.

# About Tbrain
Tbrain is the data factory for robotics, agents, and post-training. We build production-grade AI training data with 48,000+ expert contributors across 17+ countries, covering 250+ projects.

# Data Products

## 1. Physical AI & Robotics Data
Ground-truth human motion data for training humanoid control policies, imitation learning, and sim-to-real transfer.
- **Data types**: Egocentric video, MOCAP (motion capture), hand pose (21+ joints, 3D), full-body skeletal tracking, IMU, force/torque, depth maps, object 6DoF pose, task annotations
- **Accuracy**: Standard (5mm) to sub-millimeter precision, validated against peer-reviewed benchmarks
- **Use cases**: Humanoid whole-body control, dexterous manipulation, household robotics, commercial/industrial operations, imitation learning, sim-to-real transfer
- **Page**: /data/physical-ai

## 2. Terminal Bench — AI Agent Evaluation
Multi-step reasoning benchmarks for evaluating AI terminal agents.
- 500+ tasks across Linux sysadmin, DevOps, Security, Database, Networking
- 4-layer validation: Spec check → Oracle test → LLM baseline (≤20% GPT-5 pass rate) → Expert review
- Harbor Framework standard, deterministic and reproducible
- **Page**: /data/terminal-bench

## 3. Custom Data Programs
RLHF preference data, SFT datasets, multi-modal annotation (text, image, video, audio).

# Platform
AI-native BPO platform with:
- Automated QC pipeline (AI pre-screens 60-70% of submissions)
- Real-time dashboards for customer visibility
- Multi-tenant workspace isolation with audit trails
- 4 specialized agentic workflows (QC, delivery, cloud sync, notifications)

# Leadership
- **Tam Le**: 15+ years at Google, Adobe, Asana, Turing. AI training data expert.
- **David Do**: 20 years managing 500+ engineers. Multi-million-dollar contracts.

# What makes Tbrain different from Scale/Labelbox/Appen?
- Deep domain expertise (PhDs, Olympiad medalists) vs. crowd workers
- Lab-grade hardware for Physical AI (MOCAP, depth sensors) vs. video-only estimation
- AI-native QC platform vs. manual review
- Focused on hard problems (robotics, agent evaluation) vs. general annotation

# Pricing & Engagement
- Custom quotes based on project scope
- Pilot programs available (start small, validate quality, then scale)
- Contact info@tbrain.ai or visit /contact for a quote

# Key Rules
- If asked to talk to a real person: provide email info@tbrain.ai and suggest the contact form at /contact
- Never make up specific pricing — say "pricing is custom, contact us for a quote"
- Keep responses concise (2-4 sentences typically)
- Use bullet points for lists
- Link to relevant pages when applicable`;

type Msg = { role: "user" | "assistant"; content: string };

/**
 * Resolve or create a chat_session row for this visitor. Returns the session
 * id, or null if persistence is unavailable (DB down, env unset). Callers
 * must treat persistence as best-effort — chat itself never blocks on it.
 */
async function getOrCreateSession(
  cookieValue: string | undefined,
  ip: string,
  userAgent: string | null
): Promise<string | null> {
  try {
    const db = supabaseAdmin();

    if (cookieValue) {
      const { data } = await db
        .from("chat_sessions")
        .select("id")
        .eq("id", cookieValue)
        .maybeSingle();
      if (data?.id) return data.id as string;
    }

    const { data, error } = await db
      .from("chat_sessions")
      .insert({
        visitor_id: cookieValue ?? null,
        ip,
        user_agent: userAgent,
        last_message_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (error) throw error;
    return data.id as string;
  } catch (err) {
    console.error("[chat] session resolve failed:", err);
    return null;
  }
}

async function persistMessage(sessionId: string, role: "user" | "assistant", content: string) {
  try {
    const db = supabaseAdmin();
    await db.from("chat_messages").insert({ session_id: sessionId, role, content });
    await db
      .from("chat_sessions")
      .update({
        last_message_at: new Date().toISOString(),
        message_count: await nextMessageCount(sessionId),
      })
      .eq("id", sessionId);
  } catch (err) {
    console.error("[chat] persist message failed:", err);
  }
}

async function nextMessageCount(sessionId: string): Promise<number> {
  try {
    const { count } = await supabaseAdmin()
      .from("chat_messages")
      .select("*", { count: "exact", head: true })
      .eq("session_id", sessionId);
    return count ?? 0;
  } catch {
    return 0;
  }
}

export async function POST(req: NextRequest) {
  // Rate limit
  const ip = getClientIp(req.headers);
  const rl = checkRateLimit(`chat:${ip}`, RATE_LIMITS.chat);
  if (!rl.allowed) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  let provider;
  try {
    provider = await resolveAIProvider();
  } catch {
    return Response.json({ error: "Chat not configured" }, { status: 503 });
  }

  let messages: Msg[] | undefined;
  try {
    ({ messages } = (await req.json()) as { messages?: Msg[] });
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "Messages required" }, { status: 400 });
  }

  if (messages.length > 50) {
    return Response.json({ error: "Session too long" }, { status: 429 });
  }

  // ── Persistence: resolve session, persist the new user message ───────────
  const cookieJar = await cookies();
  const existingCookie = cookieJar.get(CHAT_COOKIE)?.value;
  const userAgent = req.headers.get("user-agent");
  const sessionId = await getOrCreateSession(existingCookie, ip, userAgent);

  const lastUserMsg = messages[messages.length - 1];
  if (sessionId && lastUserMsg?.role === "user") {
    await persistMessage(sessionId, "user", lastUserMsg.content);
  }

  if (sessionId && sessionId !== existingCookie) {
    cookieJar.set({
      name: CHAT_COOKIE,
      value: sessionId,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });
  }

  const client = new Anthropic({
    apiKey: provider.apiKey,
    baseURL: provider.baseURL,
  });

  const stream = await client.messages.stream({
    model: provider.model,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  const encoder = new TextEncoder();
  let assistantBuffer = "";

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            assistantBuffer += event.delta.text;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ text: event.delta.text })}\n\n`
              )
            );
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err) {
        controller.error(err);
      } finally {
        if (sessionId && assistantBuffer) {
          // fire-and-forget; failure already logged inside persistMessage
          void persistMessage(sessionId, "assistant", assistantBuffer);
        }
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
