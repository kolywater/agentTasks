<!-- generated-at: 853c6c4253e9fd6e4e14cda83cf9f83b66ea3220 -->
<!-- generated-at: 2026-03-23 -->
# Feature Map

| Feature | UI Component | API Route | Data / Logic |
|---|---|---|---|
| **View: Priority** | `app/page.tsx` — `view === "priority"` (default) | `GET /api/tasks` | Client filters `priority === true && !completed` |
| **View: All tasks** | `app/page.tsx` — `view === "all"` | `GET /api/tasks` | Returns tasks where `deletedAt === null` |
| **View: Scheduled** | `app/page.tsx` — `view === "scheduled"` | `GET /api/tasks` | Client filters `dueDate !== null && !completed` |
| **View: Trash** | `app/page.tsx` — `view === "trash"` branch | `GET /api/tasks?trash=true` | Returns tasks where `deletedAt !== null` |
| **View badge counts** | `app/page.tsx` — `viewConfig` object | — | Client-side counts from fetched task arrays |
| **Add task** | `app/components/AddTask.tsx` — `handleSubmit` | `POST /api/tasks` | `crypto.randomUUID()` id; auto-sets `priority: true` if in Priority view |
| **Complete / uncomplete task** | `app/components/TaskItem.tsx` — circle checkbox button | `PUT /api/tasks` | Merges `{ completed: !current }` onto task |
| **Edit task** (title, notes, due date, recurDays) | `app/components/TaskItem.tsx` — tap row → `editing` state → `handleSave` | `PUT /api/tasks` | Merges updated fields; `dueDate` input fixed to `T12:00:00` ISO string |
| **Toggle priority (desktop)** | `app/components/TaskItem.tsx` — hover flag button | `PUT /api/tasks` | Merges `{ priority: !current }` |
| **Toggle priority (mobile)** | `app/components/TaskItem.tsx` — swipe-left → "Flag"/"Unflag" | `PUT /api/tasks` | Same as desktop via `useSwipe` reveal |
| **Priority indicator badge** | `app/components/TaskItem.tsx` lines 179-183 — orange flag icon | — | Rendered only in `scheduled`/`all` views when `task.priority === true` |
| **Soft-delete task (desktop)** | `app/components/TaskItem.tsx` — hover trash icon | `DELETE /api/tasks?id={id}` | Sets `deletedAt = new Date().toISOString()` |
| **Soft-delete task (mobile)** | `app/components/TaskItem.tsx` — swipe-left → "Delete" | `DELETE /api/tasks?id={id}` | Same as desktop |
| **Restore from trash** | `app/page.tsx` — Restore button in trash view | `PUT /api/tasks` with `{ id, deletedAt: null }` | Clears `deletedAt` field |
| **Permanently delete** | `app/page.tsx` — Delete button in trash view | `DELETE /api/tasks?id={id}&permanent=true` | Splices task from array entirely |
| **Swipe-to-reveal actions** | `app/components/TaskItem.tsx` + `app/hooks/useSwipe.ts` | — | Touch events; translates row −140px; snaps at 50px threshold; one row open at a time via `closeCurrentRow` module singleton |
| **Pull-to-refresh** | `app/page.tsx` + `app/hooks/usePullToRefresh.ts` | — | Pull ≥60px from scroll-top triggers `fetchTasks`; direction-aware (blocks if swiping horizontally) |
| **Poll for external changes** | `app/page.tsx` — 2s `setInterval` + `lastMtime` ref | `GET /api/tasks/poll` | Returns `{ mtime }` of `data/tasks.json`; skips refresh while `editingCount > 0` |
| **Recurring tasks** | `app/components/TaskItem.tsx` — `recurDays` input in edit mode; `↻ Every Nd` label in view | `PUT /api/tasks` | On complete with `recurDays > 0`, API spawns new task: `dueDate = today + recurDays`, `recurSource = completed id` |
| **Past-due indicator** | `app/components/TaskItem.tsx` — `isPastDue` → darker date text (`text-gray-500`) | — | Client-side: `new Date(dueDate) < new Date()` |
| **Relative date labels** | `app/components/TaskItem.tsx` — `formatDate()` | — | Shows "Today", "Tomorrow", "Yesterday" for ±1 day; otherwise `MMM D, YYYY` |
| **Completed tasks section** | `app/page.tsx` — "Completed" divider + filtered list | — | Client splits `filteredTasks` into `incompleteTasks` / `completedTasks`; completed rendered at 50% opacity |
| **Reorder tasks** | _(agent/API only — no drag UI)_ | `PUT /api/tasks/reorder` with `{ orderedIds: string[] }` | `app/api/tasks/reorder/route.ts` — rebuilds array by ID order; unmentioned IDs appended |
