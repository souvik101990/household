import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// ── Food Section ──

export const inventoryItems = sqliteTable("inventory_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  category: text("category").notNull(), // pantry, fridge, freezer
  quantity: text("quantity"), // "2 lbs", "1 carton", etc.
  addedAt: text("added_at").notNull().default("(datetime('now'))"),
  expiryEstimate: text("expiry_estimate"),
  notes: text("notes"),
});

export const inventorySnapshots = sqliteTable("inventory_snapshots", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  imagePath: text("image_path").notNull(),
  location: text("location").notNull(), // pantry, fridge, freezer
  analyzedAt: text("analyzed_at").notNull().default("(datetime('now'))"),
  rawResponse: text("raw_response"),
});

export const mealPlans = sqliteTable("meal_plans", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  weekStart: text("week_start").notNull(),
  meals: text("meals").notNull(), // JSON string
  generatedAt: text("generated_at").notNull().default("(datetime('now'))"),
});

// ── TODO Section ──

export const todoItems = sqliteTable("todo_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  noteName: text("note_name").notNull(),
  folder: text("folder"),
  content: text("content").notNull(),
  completed: integer("completed").notNull().default(0),
  syncedAt: text("synced_at").notNull().default("(datetime('now'))"),
});

// ── Schedule Section ──

export const scheduleEntries = sqliteTable("schedule_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sourceNote: text("source_note"),
  date: text("date").notNull(),
  action: text("action").notNull(),
  gcalEventId: text("gcal_event_id"),
  syncedAt: text("synced_at"),
});

// ── Movies Section ──

export const movies = sqliteTable("movies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tmdbId: integer("tmdb_id"),
  imdbId: text("imdb_id"),
  title: text("title").notNull(),
  year: integer("year"),
  posterUrl: text("poster_url"),
  synopsis: text("synopsis"),
  status: text("status").notNull().default("watchlist"), // watchlist, watched
  rating: real("rating"),
  addedAt: text("added_at").notNull().default("(datetime('now'))"),
  watchedAt: text("watched_at"),
});
