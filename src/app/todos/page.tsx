import { CheckSquare } from "lucide-react";

export default function TodosPage() {
  return (
    <div>
      <div className="flex items-center gap-3">
        <CheckSquare className="h-8 w-8 text-green-600" />
        <h1 className="text-3xl font-bold">TODOs</h1>
      </div>
      <p className="mt-2 text-muted-foreground">
        Task lists synced with Apple Notes.
      </p>
      <div className="mt-8 rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
        <p>Sync your Apple Notes TODO lists here.</p>
        <p className="mt-1 text-sm">Coming in Phase 3</p>
      </div>
    </div>
  );
}
