import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { inventoryItems, mealPlans } from "@/lib/db/schema";
import { generateMealPlan } from "@/lib/llm";

export async function GET() {
  try {
    const plans = db
      .select()
      .from(mealPlans)
      .orderBy(mealPlans.generatedAt)
      .all();

    // Return most recent plan
    const latest = plans.length > 0 ? plans[plans.length - 1] : null;
    return NextResponse.json({
      plan: latest ? JSON.parse(latest.meals) : null,
      generatedAt: latest?.generatedAt,
      weekStart: latest?.weekStart,
    });
  } catch (error) {
    console.error("Meal plan fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch meal plan" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const items = db.select().from(inventoryItems).all();

    if (items.length === 0) {
      return NextResponse.json(
        { error: "No inventory items. Upload pantry/fridge photos first." },
        { status: 400 }
      );
    }

    const { plan, rawResponse } = await generateMealPlan(
      items.map((i) => ({
        name: i.name,
        quantity: i.quantity || "unknown",
        category: i.category,
      }))
    );

    // Save the plan
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    const weekStart = monday.toISOString().split("T")[0];

    const saved = db
      .insert(mealPlans)
      .values({
        weekStart,
        meals: JSON.stringify(plan),
      })
      .returning()
      .all()[0];

    return NextResponse.json({
      plan,
      generatedAt: saved.generatedAt,
      weekStart: saved.weekStart,
    });
  } catch (error) {
    console.error("Meal plan generation error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate meal plan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
