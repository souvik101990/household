import { Calendar } from "lucide-react";

export default function SchedulePage() {
  return (
    <div>
      <div className="flex items-center gap-3">
        <Calendar className="h-8 w-8 text-purple-600" />
        <h1 className="text-3xl font-bold">Schedule</h1>
      </div>
      <p className="mt-2 text-muted-foreground">
        Calendar view synced with Google Calendar.
      </p>
      <div className="mt-8 rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
        <p>Connect Google Calendar to sync your schedule.</p>
        <p className="mt-1 text-sm">Coming in Phase 5</p>
      </div>
    </div>
  );
}
