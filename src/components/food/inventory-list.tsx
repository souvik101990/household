"use client";

import { useState } from "react";
import { Trash2, RefreshCw, Package, Refrigerator, Snowflake } from "lucide-react";

interface InventoryItemRow {
  id: number;
  name: string;
  category: string;
  quantity: string | null;
  addedAt: string;
  expiryEstimate: string | null;
}

interface InventoryListProps {
  items: InventoryItemRow[];
  onRefresh: () => void;
}

const categoryIcons: Record<string, React.ElementType> = {
  pantry: Package,
  fridge: Refrigerator,
  freezer: Snowflake,
};

const categoryColors: Record<string, string> = {
  pantry: "bg-amber-50 text-amber-700 border-amber-200",
  fridge: "bg-blue-50 text-blue-700 border-blue-200",
  freezer: "bg-cyan-50 text-cyan-700 border-cyan-200",
};

export function InventoryList({ items, onRefresh }: InventoryListProps) {
  const [filter, setFilter] = useState<string>("all");

  const filteredItems =
    filter === "all" ? items : items.filter((i) => i.category === filter);

  const categories = ["all", "pantry", "fridge", "freezer"];
  const categoryCounts = categories.reduce(
    (acc, cat) => {
      acc[cat] =
        cat === "all"
          ? items.length
          : items.filter((i) => i.category === cat).length;
      return acc;
    },
    {} as Record<string, number>
  );

  const handleDelete = async (id: number) => {
    await fetch(`/api/food/inventory?id=${id}`, { method: "DELETE" });
    onRefresh();
  };

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
        <Package className="mx-auto h-12 w-12 opacity-50" />
        <p className="mt-3">No items in inventory yet.</p>
        <p className="text-sm">Upload a photo of your pantry or fridge to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                filter === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {cat} ({categoryCounts[cat]})
            </button>
          ))}
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-accent"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="grid gap-2">
        {filteredItems.map((item) => {
          const Icon = categoryIcons[item.category] || Package;
          const colorClass = categoryColors[item.category] || "";
          return (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg border ${colorClass}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <span className="font-medium">{item.name}</span>
                {item.quantity && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    {item.quantity}
                  </span>
                )}
              </div>
              {item.expiryEstimate && (
                <span className="text-xs text-muted-foreground">
                  Exp: {item.expiryEstimate}
                </span>
              )}
              <button
                onClick={() => handleDelete(item.id)}
                className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
