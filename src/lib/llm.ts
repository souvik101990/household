import Anthropic from "@anthropic-ai/sdk";

// ── Types ──

export interface InventoryItem {
  name: string;
  quantity: string;
  expiry_estimate: string;
}

export interface MealEntry {
  meal: string;
  ingredients: string[];
  notes?: string;
}

export interface MealDay {
  day: string;
  breakfast: MealEntry;
  lunch: MealEntry;
  dinner: MealEntry;
  dessert: MealEntry;
}

export interface MealPlan {
  days: MealDay[];
  grocery_list: string[];
}

// ── Provider detection ──

type Provider = "ollama" | "anthropic";

function getProvider(): Provider {
  if (process.env.LLM_PROVIDER === "anthropic") return "anthropic";
  if (process.env.LLM_PROVIDER === "ollama") return "ollama";
  // Auto-detect: prefer ollama if configured, fall back to anthropic
  if (process.env.OLLAMA_BASE_URL) return "ollama";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  throw new Error("No LLM provider configured. Set OLLAMA_BASE_URL or ANTHROPIC_API_KEY in .env.local");
}

function getOllamaConfig() {
  return {
    baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    textModel: process.env.OLLAMA_TEXT_MODEL || "qwen2.5:14b",
    visionModel: process.env.OLLAMA_VISION_MODEL || "llama3.2-vision",
  };
}

// ── Ollama API calls ──

async function ollamaChat(model: string, prompt: string, imageBase64?: string): Promise<string> {
  const { baseUrl } = getOllamaConfig();

  const body: Record<string, unknown> = {
    model,
    messages: [
      {
        role: "user",
        content: prompt,
        ...(imageBase64 ? { images: [imageBase64] } : {}),
      },
    ],
    stream: false,
  };

  const res = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Ollama error (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.message?.content || "";
}

// ── Anthropic API calls ──

let anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
    anthropicClient = new Anthropic({ apiKey });
  }
  return anthropicClient;
}

async function anthropicChat(prompt: string): Promise<string> {
  const client = getAnthropicClient();
  const response = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });
  return response.content[0].type === "text" ? response.content[0].text : "";
}

async function anthropicVision(prompt: string, imageBase64: string, mimeType: string): Promise<string> {
  const client = getAnthropicClient();
  const response = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
              data: imageBase64,
            },
          },
          { type: "text", text: prompt },
        ],
      },
    ],
  });
  return response.content[0].type === "text" ? response.content[0].text : "";
}

// ── Public API (provider-agnostic) ──

function parseJSON<T>(text: string, pattern: RegExp): T | null {
  try {
    const match = text.match(pattern);
    if (match) return JSON.parse(match[0]);
  } catch {
    console.error("Failed to parse LLM JSON response:", text.slice(0, 200));
  }
  return null;
}

export async function analyzeInventoryImage(
  imageBase64: string,
  mimeType: string,
  location: "pantry" | "fridge" | "freezer"
): Promise<{ items: InventoryItem[]; rawResponse: string }> {
  const prompt = `You are analyzing a photo of a ${location}. Identify all visible food items.

For each item, provide:
- name: the food item name
- quantity: estimated quantity (e.g., "1 bottle", "2 lbs", "half full", "3 cans")
- expiry_estimate: rough estimate of when it might expire (e.g., "3 days", "1 week", "2 months", "N/A" for non-perishables)

Respond ONLY with a JSON array. No other text. Example:
[
  {"name": "Milk", "quantity": "1 gallon, half full", "expiry_estimate": "5 days"},
  {"name": "Eggs", "quantity": "~8 eggs", "expiry_estimate": "2 weeks"}
]`;

  const provider = getProvider();
  let text: string;

  if (provider === "ollama") {
    const { visionModel } = getOllamaConfig();
    text = await ollamaChat(visionModel, prompt, imageBase64);
  } else {
    text = await anthropicVision(prompt, imageBase64, mimeType);
  }

  const items = parseJSON<InventoryItem[]>(text, /\[[\s\S]*\]/) || [];
  return { items, rawResponse: text };
}

export async function generateMealPlan(
  inventoryItems: { name: string; quantity: string; category: string }[]
): Promise<{ plan: MealPlan; rawResponse: string }> {
  const itemList = inventoryItems
    .map((i) => `- ${i.name} (${i.quantity}) [${i.category}]`)
    .join("\n");

  const prompt = `Based on the following food inventory, create a 7-day meal plan with breakfast, lunch, dinner, and one dessert per day. Use primarily items from the inventory. Note when grocery shopping is needed for missing ingredients.

INVENTORY:
${itemList}

Respond ONLY with JSON in this format:
{
  "days": [
    {
      "day": "Monday",
      "breakfast": {"meal": "...", "ingredients": ["..."], "notes": "..."},
      "lunch": {"meal": "...", "ingredients": ["..."], "notes": "..."},
      "dinner": {"meal": "...", "ingredients": ["..."], "notes": "..."},
      "dessert": {"meal": "...", "ingredients": ["..."], "notes": "..."}
    }
  ],
  "grocery_list": ["items not in inventory that are needed"]
}`;

  const provider = getProvider();
  let text: string;

  if (provider === "ollama") {
    const { textModel } = getOllamaConfig();
    text = await ollamaChat(textModel, prompt);
  } else {
    text = await anthropicChat(prompt);
  }

  const plan = parseJSON<MealPlan>(text, /\{[\s\S]*\}/) || { days: [], grocery_list: [] };
  return { plan, rawResponse: text };
}
