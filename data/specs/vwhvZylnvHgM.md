# Spec: Human-readable due dates & gray label color

## File to change
- `app/components/TaskItem.tsx`

## Change 1: Human-readable due dates

Update the `formatDate` function to return relative labels when applicable:

- **"Today"** — if the due date matches today's date
- **"Tomorrow"** — if the due date is the day after today
- **"Yesterday"** — if the due date is the day before today
- **Fallback** — keep the existing format (`Mon DD, YYYY`) for all other dates

Compare dates using local date components (year, month, day) to avoid timezone issues. The stored `dueDate` already uses `T12:00:00` to mitigate off-by-one problems.

## Change 2: Past-due label color

On line 99, change `text-red-500` to `text-gray-500` so past-due dates render in gray instead of red.

The non-past-due color (`text-gray-400`) stays the same.
