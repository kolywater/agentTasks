# Tasks

A collaborative task manager between the user and an AI agent. The user sees tasks in a web UI. The agent manages tasks via the API or by editing the data file directly.

## Quick reference

- **Data file:** `data/tasks.json`
- **API base URL:** `http://localhost:3000`
- **Web UI:** `http://localhost:3000`

## Task schema

```json
{
  "id": "uuid",
  "title": "Task title",
  "notes": "Optional additional context",
  "completed": false,
  "priority": false,
  "dueDate": "2026-03-25T12:00:00.000Z",
  "recurDays": 7,
  "recurSource": null,
  "createdAt": "2026-03-22T00:00:00.000Z",
  "deletedAt": null
}
```

`recurDays` is the recurrence interval in days (`null` for one-off tasks). `recurSource` is the ID of the completed task that spawned this one (`null` if created manually).

All tasks live in `data/tasks.json` as `{ "tasks": [...] }`. You can edit this file directly.

## API quick reference

| Action | Method | Endpoint |
|---|---|---|
| List active tasks | `GET` | `/api/tasks` |
| List trashed tasks | `GET` | `/api/tasks?trash=true` |
| Create task | `POST` | `/api/tasks` |
| Update task | `PUT` | `/api/tasks` |
| Delete (move to trash) | `DELETE` | `/api/tasks?id={id}` |
| Restore from trash | `PUT` | `/api/tasks` with `{ "id": "...", "deletedAt": null }` |
| Permanently delete | `DELETE` | `/api/tasks?id={id}&permanent=true` |
| Reorder tasks | `PUT` | `/api/tasks/reorder` |

## API details

### Create a task
```
POST /api/tasks
Content-Type: application/json

{ "title": "Buy groceries", "notes": "Milk, eggs, bread", "priority": true, "dueDate": "2026-03-25T12:00:00.000Z", "recurDays": 7 }
```
Only `title` is required. `recurDays` is optional — set it to create a recurring task.

### Update a task
```
PUT /api/tasks
Content-Type: application/json

{ "id": "task-uuid", "priority": true, "dueDate": "2026-03-28T12:00:00.000Z" }
```
Include `id` and any fields to change. Setting `completed: true` on a task with `recurDays` will automatically create a new recurring copy with a future due date.

### Reorder tasks
```
PUT /api/tasks/reorder
Content-Type: application/json

{ "orderedIds": ["id-1", "id-2", "id-3"] }
```
Tasks not in the list are appended at the end.

## Views

- **All** — Every active task. The complete picture of everything on the user's plate.
- **Priority** — Tasks flagged as `priority: true`. Urgent or important items.
- **Scheduled** — Tasks with a `dueDate` set.
- **Trash** — Soft-deleted tasks (`deletedAt` is set). Can be restored or permanently removed.

A task can appear in multiple views (e.g., a priority task with a due date appears in All, Priority, and Scheduled).

## Agent rules

### Do
- Create tasks when the user mentions something that needs to happen or you identify action items.
- Set due dates when there's a known deadline or a reminder would help.
- Flag tasks as priority when they're urgent or the user says they matter.
- Remove priority when items are no longer urgent.
- Complete tasks when the user confirms something is done.
- Delete tasks that are no longer relevant (they go to trash, not permanently removed).
- Restore tasks from trash if they become relevant again.
- Reorder tasks to keep the most important things visible at the top.
- Set `recurDays` when the user mentions something that needs to happen regularly (e.g., "remind me every 3 days to water the plants").
- When completing a recurring task, know that a new one will be auto-created — don't create a duplicate manually.
- Use your judgment. Keep the list clean and useful.

### Don't
- Don't permanently delete tasks unless they are truly no longer needed.
- Don't remove tasks the user added without confirmation.
- Don't create duplicate tasks for the same action item.
- Don't manually create follow-up tasks for recurring items — the system handles it on completion.
