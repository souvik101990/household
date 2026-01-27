import { UtensilsCrossed } from "lucide-react";

export default function FoodPage() {
  return (
    <div>
      <div className="flex items-center gap-3">
        <UtensilsCrossed className="h-8 w-8 text-orange-600" />
        <h1 className="text-3xl font-bold">Food</h1>
      </div>
      <p className="mt-2 text-muted-foreground">
        Pantry & fridge inventory, meal and dessert planning.
      </p>
      <div className="mt-8 rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
        <p>Upload pantry and fridge photos to get started.</p>
        <p className="mt-1 text-sm">Coming in Phase 2</p>
      </div>
    </div>
  );
}
