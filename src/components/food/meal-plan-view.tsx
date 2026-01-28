"use client";

import { useState } from "react";
import { Loader2, ChefHat, ShoppingCart, Sparkles } from "lucide-react";
import type { MealPlan, MealEntry } from "@/lib/anthropic";

interface MealPlanViewProps {
  plan: MealPlan | null;
  generatedAt: string | null;
  onGenerate: () => Promise<void>;
  hasInventory: boolean;
}

function MealCard({ label, meal }: { label: string; meal: MealEntry }) {
  const colors: Record<string, string> = {
    Breakfast: "border-l-amber-400",
    Lunch: "border-l-green-400",
    Dinner: "border-l-blue-400",
    Dessert: "border-l-pink-400",
  };

  return (
    <div
      className={`rounded-lg border border-border border-l-4 ${colors[label] || ""} bg-card p-3`}
    >
      <p className="text-xs font-semibold uppercase text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-medium">{meal.meal}</p>
      {meal.notes && (
        <p className="mt-1 text-xs text-muted-foreground">{meal.notes}</p>
      )}
    </div>
  );
}

export function MealPlanView({
  plan,
  generatedAt,
  onGenerate,
  hasInventory,
}: MealPlanViewProps) {
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await onGenerate();
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Meal Plan</h3>
          {generatedAt && (
            <p className="text-xs text-muted-foreground">
              Generated: {new Date(generatedAt).toLocaleDateString()}
            </p>
          )}
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating || !hasInventory}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {generating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {plan ? "Regenerate" : "Generate"} Meal Plan
        </button>
      </div>

      {!hasInventory && (
        <div className="rounded-xl border border-border bg-card p-6 text-center text-muted-foreground">
          <ChefHat className="mx-auto h-10 w-10 opacity-50" />
          <p className="mt-2">Add items to your inventory first.</p>
          <p className="text-sm">Upload pantry/fridge photos above.</p>
        </div>
      )}

      {plan && plan.days.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {plan.days.map((day) => (
              <div
                key={day.day}
                className="space-y-2 rounded-xl border border-border bg-card p-4"
              >
                <h4 className="font-semibold">{day.day}</h4>
                <MealCard label="Breakfast" meal={day.breakfast} />
                <MealCard label="Lunch" meal={day.lunch} />
                <MealCard label="Dinner" meal={day.dinner} />
                <MealCard label="Dessert" meal={day.dessert} />
              </div>
            ))}
          </div>

          {plan.grocery_list && plan.grocery_list.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">Grocery List</h4>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Items you'll need to buy
              </p>
              <ul className="mt-3 grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
                {plan.grocery_list.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
