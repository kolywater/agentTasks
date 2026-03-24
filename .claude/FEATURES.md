<!-- generated-at: 853c6c4253e9fd6e4e14cda83cf9f83b66ea3220 -->
<!-- generated-at: 2026-03-23 -->
# Feature Map

| Feature | UI Component | API Route | Data / Logic |
|---|---|---|---|
| **View: All tasks** | `app/page.tsx` — `view === "all"` filter | `GET /api/tasks` | Returns tasks where `deletedAt === null` |
| **View: Priority** | `app/page.tsx` — `view === "priority"` filter (default) | `GET /api/tasks` | Client filters `priority === true && !completed` |
| **View: Scheduled** | `app/page.tsx` — `view === "scheduled"` filter | `GET /api/tasks` | Client filters `dueDate !== null && !completed` |
| **View: Trash** | `app/page.tsx` — `view === "trash"` branch | `GET /api/tasks?trash=true` | Returns tasks where `deletedAt !== null` |
| **Add task** | `app/components/AddTask.tsx` — `handleSubmit` | `POST /api/tasks` | Creates task with `crypto.randomUUID()`, appends to array; auto-sets `priority: true` if in Priority view |
| **Complete / uncomplete task** | `app/components/TaskItem.tsx` — checkbox button | `PUT /api/tasks` | Merges `{ completed: !current }` onto task |
| **Edit task (title, notes, due date)** | `app/components/TaskItem.tsx` — tap row → `editing` state → `handleSave` | `PUT /api/tasks` | Merges updated fields onto task |
| **Toggle priority (desktop)** | `app/components/TaskItem.tsx` — hover flag button | `PUT /api/tasks` | Merges `{ priority: !current }` onto task |
| **Toggle priority (mobile)** | `app/components/TaskItem.tsx` — swipe left → "Flag"/"Unflag" button | `PUT /api/tasks` | Same as desktop via `useSwipe` reveal |
| **Soft-delete task (desktop)** | `app/components/TaskItem.tsx` — hover trash icon | `DELETE /api/tasks?id={id}` | Sets `deletedAt = new Date().toISOString()` |
| **Soft-delete task (mobile)** | `app/components/TaskItem.tsx` — swipe left → "Delete" button | `DELETE /api/tasks?id={id}` | Same as desktop via `useSwipe` reveal |
| **Swipe-to-reveal actions** | `app/components/TaskItem.tsx` + `app/hooks/useSwipe.ts` | — | Touch events; translates row −140px; one-row-at-a-time via module singleton `closeCurrentRow` |
| **Pull-to-refresh** | `app/page.tsx` + `app/hooks/usePullToRefresh.ts` | — | Pull ≥60px from scroll-top triggers `fetchTasks`; direction-aware, dampened, blocks while refreshing |
| **Restore from trash** | `app/page.tsx` — Restore button in trash view | `PUT /api/tasks` with `{ id, deletedAt: null }` | Clears `deletedAt` field |
| **Permanently delete** | `app/page.tsx` — Delete button in trash view | `DELETE /api/tasks?id={id}&permanent=true` | Splices task out of array |
| **Reorder tasks** | _(API / agent only — no drag UI)_ | `PUT /api/tasks/reorder` with `{ orderedIds }` | `app/api/tasks/reorder/route.ts` — rebuilds array by ID order |
| **Poll for changes** | `app/page.tsx` — 2s `setInterval` using `lastMtime` ref | `GET /api/tasks/poll` | Returns `{ mtime: number }` of `data/tasks.json`; skips refresh if a task is being edited |
| **Past-due indicator** | `app/components/TaskItem.tsx` — `isPastDue` → grey date text | — | Client-side: `new Date(dueDate) < new Date()` |
| **View badge counts** | `app/page.tsx` — `viewConfig` object | — | Client-side counts derived from fetched task arrays |
| **Recurring tasks** | `app/components/TaskItem.tsx` — `recurDays` input in edit mode, repeat indicator in view | `PUT /api/tasks` | On completion of task with `recurDays > 0`, spawns new task with due date = today + N days; tracks origin via `recurSource` |
