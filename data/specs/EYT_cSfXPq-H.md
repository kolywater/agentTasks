# Spec: Swipe-to-reveal actions on mobile tasks

## Overview

Add swipe-left gesture on task rows (mobile only) to reveal Flag and Delete action buttons. Desktop behavior (hover buttons) is unchanged.

## Behavior

- **Swipe left** on a task row slides the row content to the left, revealing two action buttons behind it: **Flag** (orange) and **Delete** (red).
- **Flag** toggles the task's `priority` field (same as the existing flag button).
- **Delete** soft-deletes the task (same as the existing trash button).
- **Closing the actions:** tapping anywhere outside the revealed buttons, or swiping the row back to the right, closes it.
- **Single open:** only one task can have its actions revealed at a time — opening one closes any other.
- **Mobile only:** swipe gesture handling should only activate on touch devices. Desktop hover buttons remain as they are today.

## Touch gesture details

- Track `touchstart`, `touchmove`, `touchend` on the task row.
- Use a horizontal distance threshold (~50px) to distinguish intentional swipes from scrolls.
- If the vertical movement exceeds horizontal movement, do not trigger swipe (let the page scroll normally).
- Animate the row translation with CSS transforms for smooth 60fps movement.
- The row should follow the finger during the swipe, then snap open or closed on release.

## Revealed action buttons

- Two buttons sit behind the task row, right-aligned.
- **Flag button:** orange background, flag icon or "Flag" text. If the task is already flagged, visually indicate it (e.g., filled icon or "Unflag" label).
- **Delete button:** red background, trash icon or "Delete" text.
- Each button is a comfortable tap target (~60-70px wide minimum).

## Scope

- **Only** `TaskItem` component changes (plus any small wrapper/hook if needed for swipe logic).
- **No** backend or API changes.
- **No** changes to desktop hover behavior.
- Trash view rows do NOT get swipe actions (they already have Restore/Delete inline).
