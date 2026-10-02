import Anthropic from "@anthropic-ai/sdk";
import { noteWorkingProvider, resolveAIProviderCandidates } from "./provider";

/**
 * One-shot, non-streaming completion that walks every configured credential
 * (a spent GLM key only fails at request time), like the chat route does.
 */
export async function completeText(opts: {
  system: string;
  prompt: string;
  maxTokens?: number;
}): Promise<string> {
  const candidates = await resolveAIProviderCandidates();
  let lastErr: unknown = null;

  for (const provider of candidates) {
    const client = new Anthropic({ apiKey: provider.apiKey, baseURL: provider.baseURL, timeout: 60_000 });
    try {
      const res = await client.messages.create({
        model: provider.model,
        max_tokens: opts.maxTokens ?? 1500,
        system: opts.system,
        messages: [{ role: "user", content: opts.prompt }],
        ...(provider.disableThinking ? { thinking: { type: "disabled" as const } } : {}),
      });
      const text = res.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("")
        .trim();
      if (!text) throw new Error("empty completion");
      noteWorkingProvider(provider);
      return text;
    } catch (err) {
      lastErr = err;
      console.warn("[ai] provider candidate failed, trying next:", String(err).slice(0, 200));
    }
  }
  throw new Error(`every AI provider failed: ${String(lastErr).slice(0, 200)}`);
}
