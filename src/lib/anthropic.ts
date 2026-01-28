import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not set in environment variables");
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

export async function analyzeInventoryImage(
  imageBase64: string,
  mimeType: string,
  location: "pantry" | "fridge" | "freezer"
): Promise<{ items: InventoryItem[]; rawResponse: string }> {
  const anthropic = getAnthropicClient();

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
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
          {
            type: "text",
            text: `You are analyzing a photo of a ${location}. Identify all visible food items.

For each item, provide:
- name: the food item name
- quantity: estimated quantity (e.g., "1 bottle", "2 lbs", "half full", "3 cans")
- expiry_estimate: rough estimate of when it might expire (e.g., "3 days", "1 week", "2 months", "N/A" for non-perishables)

Respond ONLY with a JSON array. No other text. Example:
[
  {"name": "Milk", "quantity": "1 gallon, half full", "expiry_estimate": "5 days"},
  {"name": "Eggs", "quantity": "~8 eggs", "expiry_estimate": "2 weeks"}
]`,
          },
        ],
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";

  let items: InventoryItem[] = [];
  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      items = JSON.parse(jsonMatch[0]);
    }
  } catch {
    console.error("Failed to parse inventory response:", text);
  }

  return { items, rawResponse: text };
}

export interface InventoryItem {
  name: string;
  quantity: string;
  expiry_estimate: string;
}

export async function generateMealPlan(
  inventoryItems: { name: string; quantity: string; category: string }[]
): Promise<{ plan: MealPlan; rawResponse: string }> {
  const anthropic = getAnthropicClient();

  const itemList = inventoryItems
    .map((i) => `- ${i.name} (${i.quantity}) [${i.category}]`)
    .join("\n");

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `Based on the following food inventory, create a 7-day meal plan with breakfast, lunch, dinner, and one dessert per day. Use primarily items from the inventory. Note when grocery shopping is needed for missing ingredients.

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
}`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";

  let plan: MealPlan = { days: [], grocery_list: [] };
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      plan = JSON.parse(jsonMatch[0]);
    }
  } catch {
    console.error("Failed to parse meal plan response:", text);
  }

  return { plan, rawResponse: text };
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
