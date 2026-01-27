import { Home } from "lucide-react";

export default function HomePage() {
  return (
    <div>
      <div className="flex items-center gap-3">
        <Home className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Home</h1>
      </div>
      <p className="mt-2 text-muted-foreground">
        Home Assistant dashboards & smart home controls.
      </p>
      <div className="mt-8 rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
        <p>Connect your Home Assistant instance to view dashboards.</p>
        <p className="mt-1 text-sm">Coming in Phase 4</p>
      </div>
    </div>
  );
}
