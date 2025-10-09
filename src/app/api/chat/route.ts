import { createOpenAI } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { z } from "zod";
import { systemPrompt } from "./prompts";
import { createEvent } from "@/tools/events";

const API_KEY = process.env.CONO_API_KEY;
const MODEL = "qwen-3-alphaca";


const openai = createOpenAI({
  apiKey: API_KEY,
  baseURL: "https://api.arcanic.ai/v1",
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai(MODEL),
    system: systemPrompt,
    messages: messages,
    // toolCallStreaming: true,
    maxTokens: 1000,
    maxSteps: 5,
    tools: {
      getWeather: getWeatherTool,
      pingTbrain: pingTbrainTool,
      getCurrentTime,
      createEvent,
      getDateModel: getDateModelTool,
    },
  });

  return result.toDataStreamResponse();
}

// TODO: MOVE TOOLS TO ANOTHER FOLDER

const getWeatherTool = tool({
  description: "Lấy thông tin thời tiết của một thành phố",
  parameters: z.object({
    city: z.string(),
  }),
  execute: async ({ city }) => {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=92a075ffcafedbee72de3fb4eae09b38&units=metric`
    );
    const data = await res.json();
    return data;
  },
});

const pingTbrainTool = tool({
  description: "Ping message to user and return message. Just return message",
  parameters: z.object({
    message: z.string(),
  }),
});

const getCurrentTime = tool({
  description:
    "Returns the current real-world time in ISO 8601 format (e.g., 2025-05-14T10:30:00.000Z). Use this tool when the user wants to create a meeting.",
  parameters: z.object({
    message: z
      .string()
      .describe("Optional message or context triggering the time check."),
  }),
  execute: async () => {
    const now = new Date();
    return {
      time: now.toISOString(), // e.g., 2025-05-14T10:30:00.000Z
    };
  },
});

const getDateModelTool = tool({
  description:
    "Use this tool show popup when user want to book a meeting with Tbrain team ",
  parameters: z.object({
    message: z
      .string()
      .optional()
      .describe(
        "Optional message or context triggering the popup, e.g., 'Can I book a meeting', 'book a meeting'."
      ),
  }),
  execute: async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return {
      message: "Get Calendar popup successfully",
    };
  },
});
