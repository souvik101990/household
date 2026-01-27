# Household Hub - Project Plan

## Overview

A self-hosted household management web app running locally on Mac Mini, backed by a private GitHub repo. Built with **Next.js 14+ (App Router)** for the frontend and API routes, with **SQLite** (via Drizzle ORM) for local persistence.

---

## Architecture

```
household-hub/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Dashboard / home
│   │   ├── food/               # Food & meal planning
│   │   ├── home/               # Home Assistant dashboards
│   │   ├── todos/              # TODO lists (Apple Notes sync)
│   │   ├── schedule/           # Schedule & calendar
│   │   └── movies/             # Movie watchlist
│   ├── components/             # Shared UI components
│   ├── lib/                    # Utilities, DB, API helpers
│   └── api/                    # Next.js API routes (backend)
├── data/                       # Local SQLite DB + uploaded images (gitignored)
├── drizzle/                    # DB migrations
├── public/                     # Static assets
├── .env.local                  # Secrets (gitignored)
├── package.json
└── next.config.js
```

**Key tech choices:**
- **Next.js 14+** - Full-stack React framework (UI + API in one project)
- **SQLite + Drizzle ORM** - Zero-config local database, no external DB needed
- **Tailwind CSS + shadcn/ui** - Fast, clean UI with pre-built components
- **Claude API (Vision)** - Pantry/fridge image analysis for inventory
- **Runs locally** on Mac Mini, accessible on home network

---

## Modules

### 1. Food Section (Pantry & Meal Planning)

**Features:**
- Display current pantry and fridge inventory in categorized lists
- Upload photos of pantry/fridge weekly
- Use Claude Vision API to analyze photos and extract inventory items
- Auto-detect added/removed items by comparing with previous inventory
- Generate weekly meal plans and dessert plans from current inventory
- Save meal plan history

**Data model:**
- `inventory_items` - name, category (pantry/fridge/freezer), quantity, added_date, expiry_estimate
- `inventory_snapshots` - image_path, analyzed_at, raw_response
- `meal_plans` - week_start, meals (JSON), generated_at

**API integrations:**
- Claude Vision API (image analysis + meal plan generation)

**Flow:**
1. User uploads fridge/pantry photos
2. Claude Vision extracts item list
3. Diff against current inventory, user confirms changes
4. Generate meal plan button → Claude creates plan from inventory
5. Display plan with recipes

---

### 2. Home Section (Home Assistant Dashboards)

**Features:**
- Embed specific Home Assistant dashboards via iframe
- Configurable list of dashboard URLs to display
- Quick-access tiles for common controls (lights, thermostat, etc.)
- Optional: Direct HA API calls for status cards (using HA MCP tools already connected)

**Implementation:**
- HA dashboards embedded via iframe with HA auth token
- Settings page to configure which dashboards to show
- Use Home Assistant Long-Lived Access Token for API access

**Config needed:**
- `HOMEASSISTANT_URL` - Your HA instance URL
- `HOMEASSISTANT_TOKEN` - Long-lived access token

---

### 3. TODO Lists (Apple Notes Sync)

**Features:**
- Display TODO lists synced from Apple Notes
- Two-way sync: changes in app reflect in Apple Notes and vice versa
- Categorize by list/folder
- Mark complete, add new items
- Periodic sync (pull from Apple Notes on page load or interval)

**Implementation approach:**
- Use the Apple Notes MCP integration (already connected) for read/write
- API route that calls MCP tools to list/read/update notes
- Local cache in SQLite for fast display, sync on demand
- "Sync Now" button + auto-sync every 15 minutes

**Data model:**
- `todo_items` - note_name, folder, content, synced_at, local_changes

---

### 4. Schedule (Apple Notes → Google Calendar)

**Features:**
- Parse schedule entries from Apple Notes (format: "date - action")
- Display schedule in calendar view
- Sync to Google Calendar for seamless mobile access
- Auto-detect new schedule entries and push to Google Calendar

**Implementation:**
- Read schedule notes via Apple Notes MCP
- Parse date/action pairs with simple regex or LLM
- Google Calendar API (OAuth2) to create/update events
- Local schedule cache for calendar UI display

**Config needed:**
- Google Cloud project with Calendar API enabled
- OAuth2 credentials (client ID + secret)
- `GOOGLE_CALENDAR_ID` - target calendar ID

**Data model:**
- `schedule_entries` - source_note, date, action, gcal_event_id, synced_at

---

### 5. Movies (Watchlist & Watched)

**Features:**
- Display "To Watch" and "Already Watched" lists
- Search and add movies (via TMDB API - free)
- Rate watched movies
- Import from IMDB watchlist (CSV export or scraping)
- Movie details: poster, synopsis, rating, year

**Implementation:**
- TMDB API for movie search and metadata (free API key)
- IMDB watchlist import via CSV (IMDB allows exporting watchlists)
- Local persistence in SQLite
- Toggle between "to watch" and "watched" with rating

**Config needed:**
- `TMDB_API_KEY` - free API key from themoviedb.org

**Data model:**
- `movies` - tmdb_id, imdb_id, title, year, poster_url, synopsis, status (watchlist/watched), rating, added_at, watched_at

---

## Setup Steps

### Phase 0: Project Bootstrap
1. [ ] Install GitHub CLI (`brew install gh`) and authenticate
2. [ ] Create private GitHub repo `household-hub`
3. [ ] Initialize Next.js project with TypeScript, Tailwind, App Router
4. [ ] Install dependencies: shadcn/ui, drizzle-orm, better-sqlite3
5. [ ] Set up project structure, DB schema, and base layout
6. [ ] Create navigation sidebar with all 5 sections
7. [ ] Set up `.env.local` with placeholder keys
8. [ ] First commit and push

### Phase 1: Core UI Shell
- [ ] Dashboard page with section cards
- [ ] Responsive sidebar navigation
- [ ] Theme setup (light/dark toggle)
- [ ] Base layout components

### Phase 2: Food Section
- [ ] DB schema for inventory + meal plans
- [ ] Image upload UI
- [ ] Claude Vision API integration for image analysis
- [ ] Inventory display with categories
- [ ] Meal plan generation and display

### Phase 3: TODO Lists
- [ ] Apple Notes sync via MCP
- [ ] TODO list display UI
- [ ] Add/complete/delete items with sync-back
- [ ] Auto-sync interval

### Phase 4: Home Assistant
- [ ] HA iframe embedding
- [ ] Dashboard selector/settings
- [ ] Optional: status cards via HA API

### Phase 5: Schedule
- [ ] Apple Notes schedule parser
- [ ] Calendar view UI
- [ ] Google Calendar API OAuth setup
- [ ] Two-way sync

### Phase 6: Movies
- [ ] TMDB API integration
- [ ] Movie search and add
- [ ] Watchlist / watched toggle
- [ ] IMDB CSV import
- [ ] Ratings

---

## Environment Variables (.env.local)

```
# Claude API (for Vision / meal planning)
ANTHROPIC_API_KEY=

# Home Assistant
HOMEASSISTANT_URL=
HOMEASSISTANT_TOKEN=

# Google Calendar
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALENDAR_ID=

# TMDB (movies)
TMDB_API_KEY=

# App
DATABASE_PATH=./data/household.db
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Deployment (Local Mac Mini)

- Run as a background service via `pm2` or `launchd`
- Accessible on home network at `http://<mac-mini-ip>:3000`
- Optional: Tailscale or Cloudflare Tunnel for remote access
- SQLite DB + uploaded images stored in `data/` directory (gitignored)
- GitHub repo stores code only, no data/secrets

---

## Future Expansion Ideas
- Grocery list generation from meal plan
- Budget / expense tracking
- Family shared notes / announcements board
- Smart home automation triggers from the app
- Recipe database with favorites
- Household chores schedule / rotation
