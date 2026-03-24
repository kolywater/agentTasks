<!-- generated-at: f9ec5b5851312240d0e8e79ebfb4eff1c27ecf9c -->
<!-- generated-at: 2026-03-23 -->
# CODEBASE.md

## Stack
- **Framework:** Next.js 16 (App Router), React 19, TypeScript 5
- **Styling:** Tailwind CSS v4 (`@import "tailwindcss"` in globals.css)
- **Runtime:** Node.js (no database — flat-file JSON storage)

## Key Paths

| Path | Purpose |
|------|---------|
| `app/page.tsx` | Root page, client component — all state, filtering, view switching |
| `app/layout.tsx` | Root layout — sets title/metadata, loads globals.css |
| `app/globals.css` | Single line: `@import "tailwindcss"` |
| `app/types.ts` | Shared `Task` and `TasksData` interfaces |
| `app/components/TaskItem.tsx` | Task row — inline edit, complete toggle, swipe-to-reveal actions (Flag/Delete), desktop hover actions |
| `app/components/AddTask.tsx` | Inline form to create a new task (title only) |
| `app/hooks/useSwipe.ts` | Touch swipe hook — reveals 2×70px action buttons on left-swipe; one row open at a time (module-level singleton) |
| `app/api/tasks/route.ts` | REST CRUD — GET / POST / PUT / DELETE for tasks |
| `app/api/tasks/reorder/route.ts` | PUT only — reorders tasks array by `orderedIds[]` |
| `app/api/tasks/poll/route.ts` | GET only — returns `{ mtime: number }` of `data/tasks.json`; for change detection |
| `data/tasks.json` | **Persistent store** — all tasks in a flat JSON array |
| `next.config.ts` | Next.js config (default, no custom settings) |
| `tsconfig.json` | TypeScript config; `@/` path alias maps to project root |
| `README.md` | **Agent-facing** — API quick reference, task schema, agent rules |

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
      "recurDays": "number | null",       // recurrence interval in days; null = one-off
      "recurSource": "string | null",     // id of completed task that spawned this one; null = manual
      "createdAt": "ISO8601",
      "deletedAt": "ISO8601 | null"   // null = active, set = soft-deleted (trash)
    }
  ]
}
```

- **Soft delete:** `deletedAt` is set; task is filtered out of active views but kept in data
- **Permanent delete:** record is spliced from the array entirely
- **Ordering:** preserved by array position; `reorder` API reorders in-place
- **No migrations, no DB — all reads/writes use `fs.readFileSync` / `fs.writeFileSync` synchronously**

## Build / Run Commands

```bash
npm run dev      # Next.js dev server (http://localhost:3000)
npm run build    # Production build
npm run start    # Serve production build
```

No test suite configured.

## Conventions

- **All components are `"use client"`** — no RSC usage outside layout
- **State lives in `page.tsx`**; components receive data and callbacks as props
- **API mutations** always call `fetchTasks()` to re-sync state (no optimistic updates)
- **Path alias:** `@/` → project root (e.g., `@/app/types`)
- **IDs:** `crypto.randomUUID()` for new tasks; legacy tasks may have numeric string IDs
- **Dates:** stored as ISO 8601 strings; `dueDate` time is fixed to `T12:00:00` on input to avoid timezone off-by-one
- **Mobile actions:** swipe left on a task row to reveal Flag + Delete buttons (140px total, 2×70px); only one row can be open at a time via `closeCurrentRow` module singleton in `useSwipe.ts`
- **Desktop actions:** hover on a task row to show priority flag + delete icon buttons
- **No auth, no env vars, no external services**
- **Agent access:** edit `data/tasks.json` directly, or call the HTTP API. See `README.md` for full reference.
