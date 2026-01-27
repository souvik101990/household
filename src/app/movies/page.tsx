import { Film } from "lucide-react";

export default function MoviesPage() {
  return (
    <div>
      <div className="flex items-center gap-3">
        <Film className="h-8 w-8 text-red-600" />
        <h1 className="text-3xl font-bold">Movies</h1>
      </div>
      <p className="mt-2 text-muted-foreground">
        Movies to watch and already watched.
      </p>
      <div className="mt-8 rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
        <p>Search and add movies to your watchlist.</p>
        <p className="mt-1 text-sm">Coming in Phase 6</p>
      </div>
    </div>
  );
}
