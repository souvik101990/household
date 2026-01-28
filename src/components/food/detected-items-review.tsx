"use client";

import { useState } from "react";
import { Check, X, Plus, Loader2 } from "lucide-react";
import type { InventoryItem } from "@/lib/anthropic";

interface DetectedItemsReviewProps {
  items: InventoryItem[];
  location: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DetectedItemsReview({
  items: initialItems,
  location,
  onConfirm,
  onCancel,
}: DetectedItemsReviewProps) {
  const [items, setItems] = useState(
    initialItems.map((item, i) => ({ ...item, selected: true, id: i }))
  );
  const [saving, setSaving] = useState(false);
  const [newItemName, setNewItemName] = useState("");

  const toggleItem = (id: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const addItem = () => {
    if (!newItemName.trim()) return;
    setItems((prev) => [
      ...prev,
      {
        name: newItemName.trim(),
        quantity: "1",
        expiry_estimate: "N/A",
        selected: true,
        id: Date.now(),
      },
    ]);
    setNewItemName("");
  };

  const handleConfirm = async () => {
    setSaving(true);
    const selectedItems = items.filter((i) => i.selected);

    try {
      const res = await fetch("/api/food/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: selectedItems, location }),
      });

      if (!res.ok) throw new Error("Failed to save");
      onConfirm();
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-lg font-semibold">
        Detected {items.length} items in your{" "}
        <span className="capitalize">{location}</span>
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Review and confirm the items to add to your inventory.
      </p>

      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
              item.selected
                ? "border-primary/30 bg-primary/5"
                : "border-border opacity-50"
            }`}
          >
            <div
              className={`flex h-5 w-5 items-center justify-center rounded border ${
                item.selected
                  ? "border-primary bg-primary text-white"
                  : "border-border"
              }`}
            >
              {item.selected && <Check className="h-3 w-3" />}
            </div>
            <div className="flex-1">
              <span className="font-medium">{item.name}</span>
              <span className="ml-2 text-sm text-muted-foreground">
                ({item.quantity})
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              Expires: {item.expiry_estimate}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addItem()}
          placeholder="Add missing item..."
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          onClick={addItem}
          className="flex items-center gap-1 rounded-lg bg-secondary px-3 py-2 text-sm hover:bg-accent"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={handleConfirm}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          Confirm {items.filter((i) => i.selected).length} items
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
      </div>
    </div>
  );
}
