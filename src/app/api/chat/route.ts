import { type NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are the Tbrain AI assistant embedded on the tbrain.ai website. You help visitors learn about Tbrain's services and data offerings.

About Tbrain:
- Tbrain is a full-service AI training data company specializing in high-quality datasets, RLHF (Reinforcement Learning from Human Feedback), SFT (Supervised Fine-Tuning), and AI evaluation services.
- We provide production-grade training data for building better AI models.
- Our team includes 48,000+ AI training experts across 17+ countries.
- We've processed 250+ AI training projects.

Key Services:
- Data Collection & Annotation (text, image, video, audio)
- RLHF & SFT data generation
- AI Model Evaluation & Benchmarking
- Custom dataset creation
- Quality assurance with multi-tier QC

Data Products:
- Terminal Bench: Evaluation environments for terminal-based AI agents with real coding tasks, expert solutions, and automated testing.

For pricing inquiries, direct users to contact info@tbrain.ai or use the contact form at /contact.
For data access requests, direct users to /data/terminal-bench/request-access.

Be concise, professional, and helpful. If you don't know something specific, say so and suggest they contact the team.`;

export async function POST(req: NextRequest) {
  // Rate limit
  const ip = getClientIp(req.headers);
  const rl = checkRateLimit(`chat:${ip}`, RATE_LIMITS.chat);
  if (!rl.allowed) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Chat not configured" }, { status: 503 });
  }

  const { messages, sessionId } = await req.json();

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "Messages required" }, { status: 400 });
  }

  // Rate limit: simple in-memory (for production, use Redis)
  // For now, just cap message count
  if (messages.length > 50) {
    return Response.json({ error: "Session too long" }, { status: 429 });
  }

  const client = new Anthropic({ apiKey });

  const stream = await client.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: messages.map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  });

  // Stream the response
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
            );
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err) {
        controller.error(err);
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
