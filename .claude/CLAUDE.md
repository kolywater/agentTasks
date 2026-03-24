<!-- pocket-projects:start -->
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