"use client";

import { Task } from "@/app/types";
import { useState } from "react";

interface TaskItemProps {
  task: Task;
  onUpdate: (task: Partial<Task> & { id: string }) => void;
  onDelete: (id: string) => void;
}

export default function TaskItem({ task, onUpdate, onDelete }: TaskItemProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [notes, setNotes] = useState(task.notes);
  const [dueDate, setDueDate] = useState(task.dueDate || "");

  function handleSave() {
    onUpdate({
      id: task.id,
      title,
      notes,
      dueDate: dueDate || null,
    });
    setEditing(false);
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

  const isPastDue =
    task.dueDate && !task.completed && new Date(task.dueDate) < new Date();

  return (
    <div
      className={`group flex items-start gap-3 px-4 py-3 border-b border-gray-100 transition-colors ${
        task.completed ? "opacity-50" : ""
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={() => onUpdate({ id: task.id, completed: !task.completed })}
        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
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

      {/* Content */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="space-y-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-base font-medium bg-white border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes"
              className="w-full text-base bg-white border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={dueDate ? dueDate.split("T")[0] : ""}
              onChange={(e) => setDueDate(e.target.value ? new Date(e.target.value + "T12:00:00").toISOString() : "")}
              className="text-base bg-white border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <button onClick={handleSave} className="text-xs text-blue-600 font-medium">Save</button>
              <button onClick={() => setEditing(false)} className="text-xs text-gray-400">Cancel</button>
            </div>
          </div>
        ) : (
          <div onClick={() => setEditing(true)} className="cursor-pointer">
            <p className={`text-sm font-medium ${task.completed ? "line-through text-gray-400" : ""}`}>
              {task.title}
            </p>
            {task.notes && (
              <p className="text-xs text-gray-400 mt-0.5 truncate">{task.notes}</p>
            )}
            {task.dueDate && (
              <p className={`text-xs mt-0.5 ${isPastDue ? "text-gray-500" : "text-gray-400"}`}>
                {formatDate(task.dueDate)}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onUpdate({ id: task.id, priority: !task.priority })}
          className={`p-1 rounded transition-colors ${
            task.priority ? "text-orange-500" : "text-gray-300 hover:text-orange-400"
          }`}
          title="Toggle priority"
        >
          <svg className="w-4 h-4" fill={task.priority ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="p-1 text-gray-300 hover:text-red-500 rounded transition-colors"
          title="Delete"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
