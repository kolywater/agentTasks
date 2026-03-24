<!-- pocket-projects:start -->
## Pocket Projects

You are running inside **Pocket Projects**, a task management dashboard. Your project ID is `ul8wU6d3CLk5` ("Agentic Tasks").

You can interact with the task database directly via sqlite3.

### Creating tasks

```bash
sqlite3 /Users/aiden/Software/pocketProjects/data/pocket-projects.db "INSERT INTO tasks (id, project_id, title, description, status, priority, sort_key, created_at, updated_at) VALUES (lower(hex(randomblob(6))), 'ul8wU6d3CLk5', 'Task title here', 'Optional description', 'intake', 'P2', unixepoch(), unixepoch(), unixepoch())"
```

- `id`: use `lower(hex(randomblob(6)))` to generate a 12-char hex ID
- `status`: always use `intake` for new tasks — the user will triage from the dashboard
- `priority`: `P1`, `P2`, or `P3`
- `category`: `feature`, `design`, `bug`, `in review`, or `brainstorm`

### Listing tasks

```bash
sqlite3 -json /Users/aiden/Software/pocketProjects/data/pocket-projects.db "SELECT id, title, status, priority, summary FROM tasks WHERE project_id = 'ul8wU6d3CLk5' ORDER BY sort_key DESC"
```

### Updating tasks

```bash
sqlite3 /Users/aiden/Software/pocketProjects/data/pocket-projects.db "UPDATE tasks SET status = 'plan', updated_at = unixepoch() WHERE id = 'TASK_ID'"
```

### Writing specs

- Spec files go in `/Users/aiden/Software/agentTasks/data/specs/{taskId}.md`
- Specs are written during the `plan` stage and deleted after a successful build
- A spec should describe what needs to change and why
- Read existing specs directly from disk

### Task lifecycle

`intake` → `plan` → `build` → `review` → `needs_approval` → `done` (also `archived`, `brainstorm`)

> **Note:** Direct DB changes won't trigger real-time updates in the dashboard UI. The user will need to refresh the page to see them.

## Orientation

See `.claude/CODEBASE.md` for architecture, key paths, and build commands.
See `.claude/FEATURES.md` for a feature-to-code mapping.

## Logging

- Log every significant action, decision, and error
- When debugging, check logs first

## General development closed loop

Do as much as you can on your own before asking for user help

- Make the change
- Build/restart if needed
- Check logs for build errors
- Run tests
- Verify tests worked by checking logs for errors, checking databases, etc.
- If the change isn't working, iterate in a loop
- If you get stuck, ask for help.
- Lint and fix
- Clean up any test data you create

## Web development closed loop

Make change → verify it compiles → test it yourself → iterate.

1. **Make the change**
2. **Verify it compiles** — check `.claude/logs` immediately
3. **Restart** if needed, verify the process is running
4. **Test it yourself** — curl APIs, read logs, check file contents
5. **Evaluate** — verify actual side effects, not just surface output
6. **Iterate** — if broken, diagnose from logs, fix, repeat
7. **Cleanup** - remove any test data you created

## Commits

- Small, focused commits — one logical change each
- Message explains *why*, not just *what*
- Run the linter before committing

<!-- pocket-projects:end -->