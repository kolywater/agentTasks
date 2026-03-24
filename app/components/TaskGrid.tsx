"use client";

import { Task } from "@/app/types";
import { useState } from "react";

interface TaskGridProps {
  tasks: Task[];
  onUpdate: (task: Partial<Task> & { id: string }) => void;
  onDelete: (id: string) => void;
  onEditStart?: () => void;
  onEditEnd?: () => void;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const dYear = d.getFullYear(), dMonth = d.getMonth(), dDay = d.getDate();
  const nYear = now.getFullYear(), nMonth = now.getMonth(), nDay = now.getDate();

  if (dYear === nYear && dMonth === nMonth && dDay === nDay) return "Today";

  const tomorrow = new Date(nYear, nMonth, nDay + 1);
  if (dYear === tomorrow.getFullYear() && dMonth === tomorrow.getMonth() && dDay === tomorrow.getDate()) return "Tomorrow";

  const yesterday = new Date(nYear, nMonth, nDay - 1);
  if (dYear === yesterday.getFullYear() && dMonth === yesterday.getMonth() && dDay === yesterday.getDate()) return "Yesterday";

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function GridTile({ task, onUpdate, onDelete, onEditStart, onEditEnd }: {
  task: Task;
  onUpdate: (task: Partial<Task> & { id: string }) => void;
  onDelete: (id: string) => void;
  onEditStart?: () => void;
  onEditEnd?: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [notes, setNotes] = useState(task.notes);
  const [dueDate, setDueDate] = useState(task.dueDate || "");
  const [recurDays, setRecurDays] = useState<string>(task.recurDays ? String(task.recurDays) : "");

  function startEditing() {
    setEditing(true);
    onEditStart?.();
  }

  function stopEditing() {
    setEditing(false);
    onEditEnd?.();
  }

  function handleSave() {
    const parsedRecurDays = recurDays ? parseInt(recurDays, 10) : null;
    onUpdate({
      id: task.id,
      title,
      notes,
      dueDate: dueDate || null,
      recurDays: parsedRecurDays && parsedRecurDays > 0 ? parsedRecurDays : null,
    });
    stopEditing();
  }

  const isPastDue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date();

  return (
    <div
      className={`relative rounded-xl bg-white shadow-sm p-4 group ${
        task.completed ? "opacity-50" : ""
      }`}
    >
      {/* Complete toggle + title row */}
      <div className="flex items-start gap-2.5">
        <button
          onClick={() => onUpdate({ id: task.id, completed: !task.completed })}
          className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
            task.completed
              ? "bg-blue-500 border-blue-500"
              : "border-gray-300 hover:border-blue-400"
          }`}
        >
          {task.completed && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {editing ? (
          <div className="flex-1 min-w-0 space-y-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm font-medium bg-white border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes"
              className="w-full text-sm bg-white border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={dueDate ? dueDate.split("T")[0] : ""}
              onChange={(e) => setDueDate(e.target.value ? new Date(e.target.value + "T12:00:00").toISOString() : "")}
              className="text-sm bg-white border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              min="1"
              value={recurDays}
              onChange={(e) => setRecurDays(e.target.value)}
              placeholder="Repeat every N days"
              className="w-full text-sm bg-white border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <button onClick={handleSave} className="text-xs text-blue-600 font-medium">Save</button>
              <button onClick={stopEditing} className="text-xs text-gray-400">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-w-0 cursor-pointer" onClick={startEditing}>
            <p className={`text-lg font-semibold line-clamp-2 ${task.completed ? "line-through text-gray-400" : ""}`}>
              {task.title}
            </p>
            {task.dueDate && (
              <p className={`text-xs mt-1.5 ${isPastDue ? "text-gray-500" : "text-gray-400"}`}>
                {formatDate(task.dueDate)}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Desktop hover actions */}
      {!editing && (
        <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onDelete(task.id)}
            className="p-1 text-gray-300 hover:text-red-500 rounded transition-colors"
            title="Delete"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export default function TaskGrid({ tasks, onUpdate, onDelete, onEditStart, onEditEnd }: TaskGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {tasks.map((task) => (
        <GridTile
          key={task.id}
          task={task}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onEditStart={onEditStart}
          onEditEnd={onEditEnd}
        />
      ))}
    </div>
  );
}
