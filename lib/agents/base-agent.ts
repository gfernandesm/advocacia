import Anthropic from "@anthropic-ai/sdk";
import type { Message } from "@/lib/types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function runAgent({
  systemPrompt,
  messages,
}: {
  systemPrompt: string;
  messages: Message[];
}): Promise<string> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: [
      {
        type: "text",
        text: systemPrompt,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  const block = response.content[0];
  return block.type === "text" ? block.text : "";
}
