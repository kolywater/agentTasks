# Spec: Fix mobile viewport horizontal scrolling

## Problem
On mobile, the page is wider than the viewport, causing unwanted horizontal scrolling. The root cause is the navigation bar — the view switcher buttons have too much padding and spacing, pushing the row beyond the screen width on narrow devices.

## Solution
Reduce the padding and spacing on the nav bar buttons so they fit comfortably within a mobile viewport without overflowing.

## Changes

### `app/page.tsx`

1. **Reduce button padding** — Change the nav buttons from `px-4 py-2.5` to `px-2.5 py-2` (applies to both the view buttons on line ~99 and the trash button on line ~117).

2. **Tighten gap between buttons** — Change the button group container from `gap-2` to `gap-1` (line ~94).

3. **Tighten inner gap** — Change the `gap-2` between button label and count badge to `gap-1.5` (inside each button, lines ~99 and ~117).

No structural changes — the layout stays as a single flex row.
