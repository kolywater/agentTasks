# Spec: Disable mobile zoom on input focus

## Problem

On mobile (especially iOS Safari), tapping any field in a todo item causes the browser to auto-zoom into the text field. This is disorienting and annoying — the user has to pinch-to-zoom back out every time they tap to edit.

## Root Cause

Mobile Safari auto-zooms any input/textarea with a computed font-size below 16px. The app's inputs all use Tailwind's `text-sm` (14px) or `text-xs` (12px), which triggers this behavior.

**Affected inputs:**

- **TaskItem.tsx** (editing mode):
  - Title input: `text-sm` (14px)
  - Notes input: `text-xs` (12px)
  - Date input: `text-xs` (12px)
- **AddTask.tsx**:
  - "Add a task..." input: `text-sm` (14px)

## Fix

**Approach: Bump input font sizes to 16px on mobile.**

Use `text-base` (16px) as the font size for all input fields. This is the cleanest fix — it prevents the zoom at the source without disabling user zoom globally (which hurts accessibility).

### Changes

1. **`app/components/TaskItem.tsx`** — In the editing block (lines 66–88), change the three `<input>` elements:
   - Title input (line 69): replace `text-sm` with `text-base`
   - Notes input (line 77): replace `text-xs` with `text-base`
   - Date input (line 83): replace `text-xs` with `text-base`

2. **`app/components/AddTask.tsx`** — Change the "Add a task..." input (line 30):
   - Replace `text-sm` with `text-base`

### What NOT to do

- Do **not** add `maximum-scale=1` or `user-scalable=no` to the viewport meta tag. That disables all pinch-to-zoom, which is an accessibility violation.
- Do not change font sizes on non-input display text — only the `<input>` elements need this.
