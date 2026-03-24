<!-- generated-at: 853c6c4253e9fd6e4e14cda83cf9f83b66ea3220 -->
<!-- generated-at: 2026-03-23 -->
# CODEBASE.md

## Stack
- **Framework:** Next.js 16 (App Router), React 19, TypeScript 5
- **Styling:** Tailwind CSS v4 (`@import "tailwindcss"` in globals.css)
- **Runtime:** Node.js — no database, flat-file JSON storage, sync fs reads/writes

## Key Paths

| Path | Purpose |
|------|---------|
| `app/page.tsx` | Root page (`"use client"`) — all state, view switching, polling (2s via `/api/tasks/poll`), pull-to-refresh |
| `app/layout.tsx` | Root layout — sets title/metadata, imports globals.css |
| `app/globals.css` | Single line: `@import "tailwindcss"` |
| `app/types.ts` | `Task` and `TasksData` interfaces |
| `app/components/TaskItem.tsx` | Task row — inline edit (title/notes/dueDate/recurDays), complete toggle, swipe-to-reveal (Flag/Delete), desktop hover actions, priority badge, recurrence display |
| `app/components/AddTask.tsx` | Inline form to create task (title only); calls `onEditStart`/`onEditEnd` on focus/blur |
| `app/hooks/useSwipe.ts` | Touch swipe hook — translates row -140px; snaps open if dragged >50px; module-level `closeCurrentRow` singleton ensures one open row at a time |
| `app/hooks/usePullToRefresh.ts` | Pull-to-refresh — triggers `fetchTasks` at ≥60px pull from scroll-top; direction-aware, dampened, blocks during swipe |
| `app/api/tasks/route.ts` | REST CRUD: `GET` / `POST` / `PUT` / `DELETE`; PUT spawns recurring task on completion if `recurDays > 0` |
| `app/api/tasks/reorder/route.ts` | `PUT` only — reorders `data/tasks.json` array by `orderedIds[]`; unmentioned IDs appended at end |
| `app/api/tasks/poll/route.ts` | `GET` only — returns `{ mtime: number }` of `data/tasks.json` for change detection |
| `data/tasks.json` | **Persistent store** — flat JSON array of all tasks |
| `data/specs/` | Agent spec files `{taskId}.md`; written at `plan` stage, deleted after build |
| `next.config.ts` | Default Next.js config (no custom settings) |
| `tsconfig.json` | `@/` alias → project root |
| `README.md` | Agent-facing API quick-reference and task schema |

## Data Layout

### `data/tasks.json`
```json
{
  "tasks": [
    {
      "id": "uuid-v4",
      "title": "string",
      "notes": "string",
      "completed": false,
      "priority": false,
      "dueDate": "ISO8601 | null",
      "recurDays": "number | null",      // recurrence interval in days; null = one-off
      "recurSource": "string | null",    // id of completed task that spawned this; null = manual
      "createdAt": "ISO8601",
      "deletedAt": "ISO8601 | null"      // null = active; set = soft-deleted (trash)
    }
  ]
}
```

- **Soft delete:** `deletedAt` set; filtered from active views but kept in array
- **Permanent delete:** spliced from array (`DELETE ?permanent=true`)
- **Ordering:** preserved by array position; `reorder` API reorders in-place
- **Recurrence:** on `PUT` with `completed: true` + `recurDays > 0`, a new task is appended with `dueDate = today + recurDays`, `recurSource = completed task id`

## Build / Run Commands

```bash
npm run dev      # Next.js dev server → http://localhost:3000
npm run build    # Production build
npm run start    # Serve production build
```

No test suite configured. No eslint config.

## Conventions

- **All components are `"use client"`** — no RSC usage outside layout
- **State lives in `page.tsx`**; components receive data and callbacks as props
- **API mutations** always call `fetchTasks()` after — no optimistic updates
- **Path alias:** `@/` → project root (e.g., `@/app/types`)
- **IDs:** `crypto.randomUUID()` for new tasks; legacy tasks may have numeric string IDs
- **Dates:** stored as ISO 8601; `dueDate` time fixed to `T12:00:00` on input to avoid timezone off-by-one
- **Edit lock:** `editingCount` ref in `page.tsx` incremented/decremented via `onEditStart`/`onEditEnd`; poll skips `fetchTasks` while count > 0
- **Swipe snap threshold:** 50px horizontal drag to register as intentional swipe; direction lock on first 5px of movement
- **No auth, no env vars, no external services**
- **Agent access:** edit `data/tasks.json` directly, or call the HTTP API. See `README.md` for full reference.
