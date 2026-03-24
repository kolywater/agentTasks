"use client";

import { useState } from "react";

interface AddTaskProps {
  onAdd: (title: string) => void;
  onEditStart?: () => void;
  onEditEnd?: () => void;
}

export default function AddTask({ onAdd, onEditStart, onEditEnd }: AddTaskProps) {
  const [title, setTitle] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim());
    setTitle("");
    onEditEnd?.();
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3 px-4 py-3">
      <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
        <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onFocus={onEditStart}
        onBlur={onEditEnd}
        placeholder="Add a task..."
        className="flex-1 text-base bg-transparent focus:outline-none placeholder-gray-400"
      />
    </form>
  );
}
