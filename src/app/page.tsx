import Link from "next/link";
import {
  UtensilsCrossed,
  Home,
  CheckSquare,
  Calendar,
  Film,
} from "lucide-react";

const sections = [
  {
    href: "/food",
    label: "Food",
    icon: UtensilsCrossed,
    description: "Pantry & fridge inventory, meal planning",
    color: "bg-orange-50 text-orange-600 border-orange-200",
  },
  {
    href: "/home",
    label: "Home",
    icon: Home,
    description: "Home Assistant dashboards & controls",
    color: "bg-blue-50 text-blue-600 border-blue-200",
  },
  {
    href: "/todos",
    label: "TODOs",
    icon: CheckSquare,
    description: "Task lists synced with Apple Notes",
    color: "bg-green-50 text-green-600 border-green-200",
  },
  {
    href: "/schedule",
    label: "Schedule",
    icon: Calendar,
    description: "Calendar synced with Google Calendar",
    color: "bg-purple-50 text-purple-600 border-purple-200",
  },
  {
    href: "/movies",
    label: "Movies",
    icon: Film,
    description: "Watchlist & watched movies",
    color: "bg-red-50 text-red-600 border-red-200",
  },
];

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Household Hub</h1>
      <p className="mt-2 text-muted-foreground">
        All your home things in one place.
      </p>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className={`group rounded-xl border p-6 transition-shadow hover:shadow-md ${section.color}`}
          >
            <section.icon className="h-8 w-8" />
            <h2 className="mt-4 text-xl font-semibold">{section.label}</h2>
            <p className="mt-1 text-sm opacity-80">{section.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
