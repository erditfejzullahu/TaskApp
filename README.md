# TaskApp (TaskNow)

A **bare React Native** task management app with an **offline-first** architecture. Tasks are stored locally in **MMKV**, synced to **Supabase** when online, and managed through a feature-based TypeScript codebase with memoized UI, debounced search, and optimistic local updates.

---

## Table of Contents

- [Features](#features)
- [Screens & Interactions](#screens--interactions)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Supabase Setup](#supabase-setup)
- [Running the App](#running-the-app)
- [Project Structure](#project-structure)
- [Data Model](#data-model)
- [Offline-First & Sync](#offline-first--sync)
- [Search & Filter](#search--filter)
- [State Management](#state-management)
- [Icons & Native Dependencies](#icons--native-dependencies)
- [Path Aliases & Config](#path-aliases--config)
- [Troubleshooting](#troubleshooting)
- [Scripts](#scripts)
- [Production Notes](#production-notes)
- [License](#license)

---

## Features

- **Task CRUD** — create, read, update, and soft-delete tasks
- **Completion toggle** — inline checkbox on each task row
- **Task detail modal** — tap a task card to view full details
- **Action menu** — three-dot menu with edit, toggle complete, and delete; swipe down from the handle to dismiss
- **Search & filter** — debounced title search plus All / Active / Completed tabs
- **Offline-first** — full CRUD works without network; changes persist in MMKV
- **Cloud sync** — unsynced tasks push to Supabase when connectivity returns
- **Sync UI** — header indicator with pending count, sync status modal, success/error toasts
- **Sync badges** — each task shows **Synced** (green) or **Local** (amber)
- **Form validation** — `react-hook-form` + Zod v3 schemas
- **Performance** — memoized list items, Zustand selectors, React Query for server state, client preview while fetching

---

## Screens & Interactions

| Screen | Route | Description |
|--------|-------|-------------|
| Tasks | `Tasks` | Main list with search, filters, pull-to-refresh (online only) |
| Create Task | `CreateTask` | Form to add a new task |
| Edit Task | `UpdateTask` | Form to edit an existing task (`taskId` param) |

**Task row interactions**

| Gesture | Action |
|---------|--------|
| Tap card body | Open task detail modal |
| Tap checkbox | Toggle complete / active |
| Tap three-dot menu | Open bottom action sheet |
| Swipe down on action sheet handle | Dismiss menu with animation |

**Header actions**

| Control | Action |
|---------|--------|
| Sync indicator | Open sync status modal; shows offline / pending state |
| **+ New** | Navigate to create task screen |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        React Native UI                       │
│  Screens → Components → Hooks (useTasks, useSync, etc.)     │
└──────────────────────────┬──────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
   ┌──────────┐    ┌─────────────┐   ┌──────────────┐
   │ Zustand  │    │ React Query │   │ react-hook-  │
   │  stores  │    │ (server)    │   │ form + Zod   │
   └────┬─────┘    └──────┬──────┘   └──────────────┘
        │                 │
        ▼                 ▼
   ┌──────────┐    ┌─────────────┐
   │   MMKV   │    │  Supabase   │
   │ (local)  │◄──►│ (PostgreSQL)│
   └──────────┘    └─────────────┘
        ▲                 ▲
        │                 │
   taskStorage      taskService / syncService
```

**Data flow summary**

1. **Launch** — MMKV hydrates tasks into Zustand (`taskStore.hydrate`).
2. **Mutations** — CRUD writes to Zustand + MMKV immediately with `synced: false`.
3. **Online fetch** — React Query pulls remote tasks; `mergeRemoteWithLocal` reconciles with local unsynced changes.
4. **Sync** — `performSync` upserts or soft-deletes pending tasks, marks successes, removes synced deletes, invalidates queries.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React Native 0.86 (bare, no Expo) |
| Language | TypeScript 5.x |
| UI state | Zustand |
| Server state | TanStack React Query v5 |
| Backend | Supabase (PostgreSQL + REST) |
| Local storage | react-native-mmkv (via nitro-modules) |
| Network detection | @react-native-community/netinfo |
| Navigation | React Navigation 7 (native stack) |
| Forms | react-hook-form + Zod v3 |
| Icons | react-native-vector-icons (Ionicons) |
| Gestures / animation | react-native-gesture-handler, react-native-reanimated |
| Env config | react-native-dotenv |

---

## Prerequisites

| Requirement | Version / Notes |
|-------------|-----------------|
| Node.js | ≥ 22.11 |
| npm | Comes with Node |
| Android Studio | For Android builds + emulator/device |
| Xcode | macOS only, for iOS builds |
| JDK | Required by Android Gradle (RN 0.86 template) |
| Supabase account | Free tier is sufficient |

---

## Quick Start

```bash
# 1. Clone and install
git clone <repo-url>
cd TaskApp
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your Supabase URL and anon key

# 3. Set up Supabase (see Supabase Setup below)

# 4. iOS pods (macOS only)
cd ios && pod install && cd ..

# 5. Start Metro
npm start

# 6. Run on device/emulator (separate terminal)
npm run android
# or
npm run ios
```

---

## Environment Variables

Copy the example file and fill in your Supabase credentials:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Project URL from Supabase → Settings → API |
| `SUPABASE_ANON_KEY` | Yes | `anon` / public key from the same page |

Example `.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
```

Env values are loaded via `react-native-dotenv` and read in `src/config/env.ts`. **Restart Metro with cache reset after changing `.env`:**

```bash
npm start -- --reset-cache
```

If Supabase is not configured, the app still runs in **local-only mode** — CRUD works offline but cloud sync and server-side search are disabled.

---

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run the script in [`supabase/schema.sql`](./supabase/schema.sql).
3. Copy **Project URL** and **anon public key** from **Project Settings → API** into `.env`.
4. Restart Metro.

### Schema overview

The `tasks` table mirrors the local `Task` model (snake_case in Postgres):

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | Client-generated UUID (see [ID strategy](#client-generated-ids)) |
| `title` | `text` | Required |
| `description` | `text` | Defaults to `''` |
| `completed` | `boolean` | Defaults to `false` |
| `created_at` | `timestamptz` | Set by client on create |
| `updated_at` | `timestamptz` | Updated on every change |
| `deleted` | `boolean` | Soft delete flag |

> **Security:** The bundled RLS policies allow **public read/write** for local development. Replace them with authenticated policies before any production deployment.

---

## Running the App

### Start Metro bundler

```bash
npm start
```

Clear cache when env or native deps change:

```bash
npm start -- --reset-cache
```

### Android

```bash
npm run android
```

Ensure `android/local.properties` points to your SDK (not committed — create locally if missing):

```properties
sdk.dir=/path/to/Android/Sdk
```

**Wireless debugging:** Metro must be running and the device must reach port 8081:

```bash
adb reverse tcp:8081 tcp:8081
```

### iOS (macOS only)

```bash
cd ios && pod install && cd ..
npm run ios
```

---

## Project Structure

```
TaskApp/
├── android/                 # Android native project
├── ios/                     # iOS native project
├── supabase/
│   └── schema.sql           # Database schema + RLS policies
├── src/
│   ├── components/
│   │   ├── common/          # Button, Modal, SearchInput, AppIcon, sync UI, etc.
│   │   └── tasks/           # TaskItem, TaskList, TaskForm, modals, SyncBadge
│   ├── config/
│   │   └── env.ts           # Supabase env helpers
│   ├── hooks/
│   │   ├── useAppBootstrap.ts
│   │   ├── useDebounce.ts
│   │   ├── useFilteredTasks.ts
│   │   ├── useNetworkStatus.ts
│   │   ├── useSync.ts
│   │   ├── useTaskMutations.ts
│   │   └── useTasks.ts
│   ├── navigation/
│   │   └── AppNavigator.tsx # Native stack: Tasks, CreateTask, UpdateTask
│   ├── screens/
│   │   ├── TasksScreen.tsx
│   │   ├── CreateTaskScreen.tsx
│   │   └── UpdateTaskScreen.tsx
│   ├── services/
│   │   ├── supabase.ts      # Supabase client singleton
│   │   ├── taskService.ts   # Fetch, upsert, soft-delete
│   │   ├── syncService.ts   # Push unsynced tasks
│   │   └── syncOrchestrator.ts
│   ├── storage/
│   │   ├── mmkv.ts
│   │   ├── taskStorage.ts   # Persist task array
│   │   └── supabaseStorage.ts
│   ├── store/
│   │   ├── taskStore.ts     # Zustand — tasks CRUD + hydrate
│   │   └── syncStore.ts     # Sync modal + toast UI state
│   ├── theme/               # colors, spacing, typography
│   ├── types/               # Task, navigation, sync types
│   └── utils/               # date, id, mappers, filters, validation
├── App.tsx                  # Root providers (Query, SafeArea, Navigation)
├── index.js                 # Entry — polyfills + gesture handler
├── babel.config.js          # dotenv, path alias, reanimated plugin
├── .env.example
└── package.json
```

---

## Data Model

### Local `Task` type

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | UUID v4, generated on device |
| `title` | `string` | 1–120 characters |
| `description` | `string` | Up to 500 characters |
| `completed` | `boolean` | Completion status |
| `createdAt` | `string` | ISO 8601 timestamp |
| `updatedAt` | `string` | ISO 8601 timestamp |
| `synced` | `boolean` | `false` until successfully pushed to Supabase |
| `deleted` | `boolean` | Soft delete; removed locally after sync |

### Client-generated IDs

Task IDs are created locally with `uuid` (`src/utils/id.ts`), not by Supabase defaults. This is required for **offline-first** behavior:

- Tasks can be created, edited, and deleted with **no network**
- Navigation to edit screens works immediately (`UpdateTask` needs a stable `taskId`)
- Sync uses `upsert` with `onConflict: 'id'` — the same UUID exists locally and remotely

---

## Offline-First & Sync

### Local persistence

- All tasks live in **MMKV** via `taskStorage`
- Zustand `taskStore` is the single source of truth in memory
- Every mutation sets `synced: false` and writes to MMKV

### When online

1. React Query fetches all tasks (`useSync` → `taskService.fetchAll`)
2. Remote rows merge with local unsynced changes (`mergeRemoteWithLocal`)
3. After CRUD mutations, `performSync` pushes pending tasks
4. Reconnecting from offline triggers an automatic sync
5. Pull-to-refresh on the task list refetches remote data (online only)

### Sync operations

| Local state | Supabase action |
|-------------|-----------------|
| New / updated task (`deleted: false`) | `upsert` |
| Soft-deleted task (`deleted: true`) | `update deleted = true`, then remove locally |

### Sync UI

- **Header indicator** — pulses when offline or tasks are pending sync
- **Sync modal** — per-task status (pending / syncing / success / error)
- **Toast** — success or partial-failure message after sync

---

## Search & Filter

| Mode | Behavior |
|------|----------|
| **Offline** | Client-side filter via `applyClientTaskFilters` |
| **Online** | Server-side query via `taskService.fetchFiltered` (`.ilike` on title, `.eq` on completed) |

While a server request is in flight, the UI shows a **local preview** to avoid empty-state flashes. Unsynced local tasks are merged into server results. React Query uses `keepPreviousData` and debounced inputs (350 ms search, 200 ms filter).

---

## State Management

| Store / layer | Responsibility |
|---------------|----------------|
| `taskStore` (Zustand) | Task array, CRUD, hydrate, merge, sync flags |
| `syncStore` (Zustand) | Sync modal visibility, sync item list, toast |
| React Query | Remote fetch, filtered queries, mutation side-effects |
| MMKV | Durable local persistence |

Hooks wire screens to stores:

- `useTasks` — visible tasks + unsynced count
- `useTaskMutations` — create / update / delete / toggle with sync
- `useSync` — fetch, refetch, auto-sync on reconnect
- `useFilteredTasks` — debounced search + filter pipeline
- `useAppBootstrap` — initial load gate for Tasks screen

---

## Icons & Native Dependencies

Icons use **Ionicons** through a shared `AppIcon` wrapper (`src/components/common/AppIcon.tsx`).

Native modules that require a **full rebuild** after install or upgrade:

- `react-native-vector-icons` — font assets (Android `fonts.gradle`, iOS `UIAppFonts`)
- `react-native-mmkv` / `react-native-nitro-modules`
- `react-native-reanimated` / `react-native-worklets`

After adding or updating these, rebuild:

```bash
npm run android
# or
npm run ios
```

Entry polyfills in `index.js`:

```js
import 'react-native-url-polyfill/auto';  // Supabase URL support
import 'react-native-get-random-values'; // uuid
import 'react-native-gesture-handler';
import 'react-native-reanimated';
```

---

## Path Aliases & Config

Import from `src/` using the `@/` alias:

```ts
import { useTasks } from '@/hooks/useTasks';
```

Configured in `babel.config.js` (`module-resolver`) and `tsconfig.json` (`paths`).

**Zod version:** pinned to v3 (`zod@3.24.2`) — Zod v4+ causes Metro bundler issues with this setup.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Metro "Unable to load script" | Start Metro; run `adb reverse tcp:8081 tcp:8081` for USB/wireless Android |
| Icons show as squares / missing | Rebuild native app after installing vector-icons |
| Env changes not applied | `npm start -- --reset-cache` |
| Android SDK not found | Create `android/local.properties` with `sdk.dir=...` |
| Supabase `protocol` error | Ensure `react-native-url-polyfill/auto` is imported in `index.js` |
| Zod / Metro bundler error | Use Zod v3, not v4+ |
| Infinite re-render loops | Avoid duplicate `useSync()` calls; use stable Zustand selectors |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Metro bundler |
| `npm start -- --reset-cache` | Start Metro with cleared cache |
| `npm run android` | Build and run on Android |
| `npm run ios` | Build and run on iOS |
| `npm run lint` | Run ESLint |
| `npm test` | Run Jest tests |

---

## Production Notes

Before shipping to production:

1. **Replace public RLS policies** with authenticated user-scoped policies in Supabase.
2. **Enable Supabase Auth** if multi-user support is needed.
3. **Do not commit** `.env` with real keys — use CI secrets or EAS/env injection.
4. **Generate release keystores** for Android and configure signing in Gradle.
5. Review sync conflict strategy — current merge is last-write-wins by `updatedAt`.

---

## License

Private — for local development and demonstration.
