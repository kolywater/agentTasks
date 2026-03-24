<!-- generated-at: 7e2a329225f7d70f9739ff1ad680487beda6f955 -->
# Feature Map

| Feature | UI Component | API Route | Data / Logic |
|---|---|---|---|
| **View: All tasks** | `app/page.tsx` — `view === "all"` filter | `GET /api/tasks` | Returns tasks where `deletedAt === null` |
| **View: Priority** | `app/page.tsx` — `view === "priority"` filter | `GET /api/tasks` | Client filters `priority === true && !completed` |
| **View: Scheduled** | `app/page.tsx` — `view === "scheduled"` filter | `GET /api/tasks` | Client filters `dueDate !== null && !completed` |
| **View: Trash** | `app/page.tsx` — `view === "trash"` branch | `GET /api/tasks?trash=true` | Returns tasks where `deletedAt !== null` |
| **Add task** | `app/components/AddTask.tsx` — `handleSubmit` | `POST /api/tasks` | Creates task with `crypto.randomUUID()`, appends to array |
| **Complete / uncomplete task** | `app/components/TaskItem.tsx` — checkbox button | `PUT /api/tasks` | Merges `{ completed: !current }` onto task |
| **Edit task (title, notes, due date)** | `app/components/TaskItem.tsx` — `editing` state + `handleSave` | `PUT /api/tasks` | Merges updated fields onto task |
| **Toggle priority** | `app/components/TaskItem.tsx` — flag button | `PUT /api/tasks` | Merges `{ priority: !current }` onto task |
| **Soft-delete task** | `app/components/TaskItem.tsx` — trash button | `DELETE /api/tasks?id={id}` | Sets `deletedAt = new Date().toISOString()` |
| **Restore from trash** | `app/page.tsx` — Restore button in trash view | `PUT /api/tasks` with `{ id, deletedAt: null }` | Clears `deletedAt` field |
| **Permanently delete** | `app/page.tsx` — Delete button in trash view | `DELETE /api/tasks?id={id}&permanent=true` | Splices task out of array |
| **Reorder tasks** | _(API / agent only — no drag UI)_ | `PUT /api/tasks/reorder` with `{ orderedIds }` | `app/api/tasks/reorder/route.ts` — rebuilds array by ID order |
| **Past-due indicator** | `app/components/TaskItem.tsx` — `isPastDue` → red date text | — | Client-side: `new Date(dueDate) < new Date()` |
| **View badge counts** | `app/page.tsx` — `viewConfig` object | — | Client-side count derived from fetched task arrays |
