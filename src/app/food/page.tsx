"use client";

import { useState, useEffect, useCallback } from "react";
import { UtensilsCrossed } from "lucide-react";
import { ImageUpload } from "@/components/food/image-upload";
import { DetectedItemsReview } from "@/components/food/detected-items-review";
import { InventoryList } from "@/components/food/inventory-list";
import { MealPlanView } from "@/components/food/meal-plan-view";
import type { InventoryItem, MealPlan } from "@/lib/llm";

interface DBInventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: string | null;
  addedAt: string;
  expiryEstimate: string | null;
}

export default function FoodPage() {
  const [inventory, setInventory] = useState<DBInventoryItem[]>([]);
  const [detectedItems, setDetectedItems] = useState<InventoryItem[] | null>(null);
  const [detectedLocation, setDetectedLocation] = useState<string>("");
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [mealPlanGeneratedAt, setMealPlanGeneratedAt] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"inventory" | "meal-plan">("inventory");

  const fetchInventory = useCallback(async () => {
    try {
      const res = await fetch("/api/food/inventory");
      const data = await res.json();
      setInventory(data.items || []);
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
    }
  }, []);

  const fetchMealPlan = useCallback(async () => {
    try {
      const res = await fetch("/api/food/meal-plan");
      const data = await res.json();
      if (data.plan) {
        setMealPlan(data.plan);
        setMealPlanGeneratedAt(data.generatedAt);
      }
    } catch (err) {
      console.error("Failed to fetch meal plan:", err);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
    fetchMealPlan();
  }, [fetchInventory, fetchMealPlan]);

  const handleItemsDetected = (items: InventoryItem[], location: string) => {
    setDetectedItems(items);
    setDetectedLocation(location);
  };

  const handleConfirmItems = () => {
    setDetectedItems(null);
    setDetectedLocation("");
    fetchInventory();
  };

  const handleGenerateMealPlan = async () => {
    const res = await fetch("/api/food/meal-plan", { method: "POST" });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    setMealPlan(data.plan);
    setMealPlanGeneratedAt(data.generatedAt);
    setActiveTab("meal-plan");
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <UtensilsCrossed className="h-8 w-8 text-orange-600" />
          <h1 className="text-3xl font-bold">Food</h1>
        </div>
        <p className="mt-2 text-muted-foreground">
          Pantry & fridge inventory, meal and dessert planning.
        </p>
      </div>

      {/* Upload Section */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Update Inventory</h2>
        <ImageUpload onItemsDetected={handleItemsDetected} />
      </div>

      {/* Review detected items */}
      {detectedItems && (
        <DetectedItemsReview
          items={detectedItems}
          location={detectedLocation}
          onConfirm={handleConfirmItems}
          onCancel={() => setDetectedItems(null)}
        />
      )}

      {/* Tab switcher */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("inventory")}
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "inventory"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Inventory ({inventory.length})
        </button>
        <button
          onClick={() => setActiveTab("meal-plan")}
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "meal-plan"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Meal Plan
        </button>
      </div>

      {/* Content */}
      {activeTab === "inventory" ? (
        <InventoryList items={inventory} onRefresh={fetchInventory} />
      ) : (
        <MealPlanView
          plan={mealPlan}
          generatedAt={mealPlanGeneratedAt}
          onGenerate={handleGenerateMealPlan}
          hasInventory={inventory.length > 0}
        />
      )}
    </div>
  );
}
