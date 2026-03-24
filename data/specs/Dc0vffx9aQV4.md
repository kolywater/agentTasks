# Spec: Grid Tile View + Layout Toggle

## What and Why

Add an alternative "grid" layout for the **Priority view only** — a 2-column tile grid where each tile shows just the task **title** and **due date**. A toggle lets the user switch between the current list view and this new grid view. The preference persists across sessions.

## Layout Toggle

- Add a small toggle button (e.g., list icon / grid icon) in the top bar area of `page.tsx`, near the existing view switcher tabs.
- Two modes: `"list"` (current default) and `"grid"`.
- The toggle button is only visible when the Priority view is active. On all other views (Scheduled, All, Trash), the toggle is hidden and the list view is always used.
- Store the selected layout in `localStorage` under a key like `"layoutMode"`.
- Read on mount; default to `"list"` if not set.
- New state: `const [layoutMode, setLayoutMode] = useState<"list" | "grid">("list")` — hydrate from localStorage in a `useEffect` to avoid SSR mismatch.

## Grid View Component

- New component: `app/components/TaskGrid.tsx`.
- Receives the same task array and callbacks as the current list rendering does.
- **Flat list in the same order as the list view.** The grid is purely a visual re-layout — no reordering, no grouping. `incompleteTasks` feeds in, rendered left-to-right, top-to-bottom in a 2-column grid.
- Renders a CSS grid: `grid-cols-2` with a consistent gap (e.g., `gap-3`).
- Each tile is a rounded card (`rounded-xl bg-white shadow-sm p-4`) showing:
  - **Title** — truncated to 2 lines max (`line-clamp-2`).
  - **Due date** — formatted using the same relative-date logic as `TaskItem` ("Today", "Tomorrow", "Mar 24, 2026", etc.). Shown below the title in small muted text. If no due date, omit or show nothing.
- Tapping a tile opens the same inline edit flow. Simplest approach: tapping a tile navigates focus into an edit mode (could reuse `TaskItem` in a compact/tile variant, or open the existing edit UI in a small overlay/modal).
- Completed tasks render at reduced opacity, same as the list view.
- The completed-task checkbox circle should appear on the tile (top-left corner or similar) so users can still toggle completion.
- Priority flag badge: since this only applies to the Priority view, all tasks shown are already flagged — no need for a separate priority indicator on tiles.

## How It Integrates with Existing Views

- The layout toggle **only applies to the Priority view**. Scheduled, All, and Trash always render using the existing list layout.
- The same filter logic (`incompleteTasks`, `completedTasks`) feeds into either the list or grid renderer when on Priority.
- The `AddTask` input row remains below the grid, same as it does below the list.
- The "Completed" section divider + completed tasks appear below the grid in the same pattern (these can stay as a list even in grid mode, or also be tiled — keeping them as a list is simpler and fine).

## Interactions in Grid Mode

- **Tap tile** → open edit mode (either inline-expand the tile or show a small modal/popover with the same fields: title, notes, due date, recur days).
- **Complete toggle** → checkbox on the tile; calls `onUpdate` same as list.
- **Swipe actions** are not needed in grid mode (tiles aren't swipeable). Desktop hover actions (flag/delete) should still appear on hover.
- **Pull-to-refresh** continues to work the same way.

## Files Changed

| File | Change |
|------|--------|
| `app/page.tsx` | Add `layoutMode` state + localStorage persistence. Add toggle button in the header area (visible only on Priority view). Conditionally render `<TaskGrid>` or existing list markup when on Priority + grid mode. |
| `app/components/TaskGrid.tsx` | **New file.** Grid container + tile rendering. Accepts tasks array + same callbacks as TaskItem. |
| `app/components/TaskItem.tsx` | No changes needed unless we reuse it inside tiles. |

## Edge Cases

- Empty states (no tasks) should still show the same empty-state messages in grid mode.
- Very long titles should be clamped, not break the grid layout.
- On narrow screens (< ~360px), 2 columns may be tight — tiles should have a min-width or the grid should stay 2-col with smaller padding. Don't drop to 1 column; keep it 2xN as requested.
