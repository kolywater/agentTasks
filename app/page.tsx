"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Task } from "@/app/types";
import TaskItem from "@/app/components/TaskItem";
import TaskGrid from "@/app/components/TaskGrid";
import AddTask from "@/app/components/AddTask";
import { usePullToRefresh } from "@/app/hooks/usePullToRefresh";

type View = "all" | "priority" | "scheduled" | "trash";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [trashedTasks, setTrashedTasks] = useState<Task[]>([]);
  const [view, setView] = useState<View>("priority");
  const [layoutMode, setLayoutMode] = useState<"list" | "grid">("list");
  const [mounted, setMounted] = useState(false);
  const lastMtime = useRef<number>(0);
  const editingCount = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const onEditStart = useCallback(() => { editingCount.current++; }, []);
  const onEditEnd = useCallback(() => { editingCount.current--; }, []);

  const fetchTasks = useCallback(async () => {
    const [res, trashRes] = await Promise.all([
      fetch("/api/tasks"),
      fetch("/api/tasks?trash=true"),
    ]);
    const data = await res.json();
    const trashData = await trashRes.json();
    setTasks(data.tasks);
    setTrashedTasks(trashData.tasks);
  }, []);

  const { pullDistance, isRefreshing } = usePullToRefresh(containerRef, fetchTasks);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("layoutMode");
    if (saved === "grid" || saved === "list") {
      setLayoutMode(saved);
    }
    fetchTasks();
  }, [fetchTasks]);

  // Poll for external file changes every 2 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/tasks/poll");
        if (!res.ok) return;
        const { mtime } = await res.json();
        if (lastMtime.current === 0) {
          // First poll — just store the mtime, data was already fetched on mount
          lastMtime.current = mtime;
          return;
        }
        if (mtime !== lastMtime.current) {
          lastMtime.current = mtime;
          if (editingCount.current > 0) return;
          fetchTasks();
        }
      } catch (e) {
        console.error("Poll failed:", e);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [fetchTasks]);

  if (!mounted) {
    return null;
  }

  async function addTask(title: string) {
    const taskData: { title: string; priority?: boolean } = { title };
    if (view === "priority") {
      taskData.priority = true;
    }
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    });
    fetchTasks();
  }

  async function updateTask(update: Partial<Task> & { id: string }) {
    await fetch("/api/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(update),
    });
    fetchTasks();
  }

  async function deleteTask(id: string) {
    await fetch(`/api/tasks?id=${id}`, { method: "DELETE" });
    fetchTasks();
  }

  async function restoreTask(id: string) {
    await fetch("/api/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, deletedAt: null }),
    });
    fetchTasks();
  }

  async function permanentlyDeleteTask(id: string) {
    await fetch(`/api/tasks?id=${id}&permanent=true`, { method: "DELETE" });
    fetchTasks();
  }

  const filteredTasks = tasks.filter((t) => {
    if (view === "priority") return t.priority && !t.completed;
    if (view === "scheduled") return t.dueDate && !t.completed;
    return true;
  });

  const incompleteTasks = filteredTasks.filter((t) => !t.completed);
  const completedTasks = filteredTasks.filter((t) => t.completed);

  const viewConfig = {
    all: { label: "All", color: "text-gray-900", count: tasks.filter((t) => !t.completed).length },
    priority: { label: "Priority", color: "text-orange-600", count: tasks.filter((t) => t.priority && !t.completed).length },
    scheduled: { label: "Scheduled", color: "text-blue-600", count: tasks.filter((t) => t.dueDate && !t.completed).length },
    trash: { label: "Trash", color: "text-red-600", count: trashedTasks.length },
  };

  function toggleLayoutMode() {
    const next = layoutMode === "list" ? "grid" : "list";
    setLayoutMode(next);
    localStorage.setItem("layoutMode", next);
  }

  const useGrid = view === "priority" && layoutMode === "grid";

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50">
      {/* Pull-to-refresh indicator */}
      <div
        className="flex justify-center items-center overflow-hidden transition-all duration-200 ease-out"
        style={{
          height: pullDistance > 0 ? `${pullDistance}px` : "0px",
          transition: pullDistance > 0 ? "none" : "height 0.3s ease-out",
        }}
      >
        <svg
          className={`w-6 h-6 text-gray-400 ${isRefreshing ? "animate-spin" : ""}`}
          style={{
            transform: isRefreshing ? undefined : `rotate(${Math.min(pullDistance / 60, 1) * 180}deg)`,
            opacity: Math.min(pullDistance / 30, 1),
            transition: pullDistance > 0 ? "none" : "opacity 0.3s ease-out",
          }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12a9 9 0 1 1-6.22-8.56" />
          <polyline points="21 3 21 9 15 9" />
        </svg>
      </div>
      <div className="max-w-xl mx-auto pt-12 pb-24 px-4">
        {/* View switcher */}
        <div className="flex items-center mb-8">
          <div className="flex gap-1">
            {(["priority", "scheduled", "all"] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-sm font-medium transition-all ${
                  view === v
                    ? "bg-white shadow-sm " + viewConfig[v].color
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {viewConfig[v].label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  view === v ? "bg-gray-100" : "bg-gray-200/50"
                }`}>
                  {viewConfig[v].count}
                </span>
              </button>
            ))}
          </div>
          {view === "priority" && (
            <button
              onClick={toggleLayoutMode}
              className="ml-2 p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/60 transition-all"
              title={layoutMode === "list" ? "Switch to grid" : "Switch to list"}
            >
              {layoutMode === "list" ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </svg>
              )}
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={() => setView("trash")}
            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-sm font-medium transition-all ${
              view === "trash"
                ? "bg-white shadow-sm " + viewConfig.trash.color
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {viewConfig.trash.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              view === "trash" ? "bg-gray-100" : "bg-gray-200/50"
            }`}>
              {viewConfig.trash.count}
            </span>
          </button>
        </div>

        {/* Title */}
        <h1 className={`text-2xl font-bold mb-4 ${viewConfig[view].color}`}>
          {viewConfig[view].label}
        </h1>

        {/* Task list */}
        {useGrid ? (
          <>
            {incompleteTasks.length === 0 && completedTasks.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm px-4 py-8 text-center text-gray-400 text-sm">
                No priority tasks. Flag a task to see it here.
              </div>
            )}

            {incompleteTasks.length > 0 && (
              <TaskGrid
                tasks={incompleteTasks}
                onUpdate={updateTask}
                onDelete={deleteTask}
                onEditStart={onEditStart}
                onEditEnd={onEditEnd}
              />
            )}

            <div className="mt-3 bg-white rounded-xl shadow-sm overflow-hidden">
              <AddTask onAdd={addTask} onEditStart={onEditStart} onEditEnd={onEditEnd} />
            </div>

            {completedTasks.length > 0 && (
              <div className="mt-3 bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-4 py-2 bg-gray-50 text-xs text-gray-400 font-medium uppercase tracking-wider">
                  Completed
                </div>
                {completedTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    view={view}
                    onUpdate={updateTask}
                    onDelete={deleteTask}
                    onEditStart={onEditStart}
                    onEditEnd={onEditEnd}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {view === "trash" ? (
            <>
              {trashedTasks.length === 0 && (
                <div className="px-4 py-8 text-center text-gray-400 text-sm">
                  Trash is empty.
                </div>
              )}
              {trashedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 px-4 py-3 border-b border-gray-100"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-400 line-through">
                      {task.title}
                    </p>
                    {task.notes && (
                      <p className="text-xs text-gray-300 mt-0.5 truncate">{task.notes}</p>
                    )}
                  </div>
                  <button
                    onClick={() => restoreTask(task.id)}
                    className="text-xs text-blue-500 hover:text-blue-700 font-medium"
                  >
                    Restore
                  </button>
                  <button
                    onClick={() => permanentlyDeleteTask(task.id)}
                    className="text-xs text-red-400 hover:text-red-600 font-medium"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </>
          ) : (
            <>
              {incompleteTasks.length === 0 && completedTasks.length === 0 && (
                <div className="px-4 py-8 text-center text-gray-400 text-sm">
                  {view === "priority" && "No priority tasks. Flag a task to see it here."}
                  {view === "scheduled" && "No scheduled tasks. Set a due date to see it here."}
                  {view === "all" && "No tasks yet. Add one below."}
                </div>
              )}

              {incompleteTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  view={view}
                  onUpdate={updateTask}
                  onDelete={deleteTask}
                  onEditStart={onEditStart}
                  onEditEnd={onEditEnd}
                />
              ))}

              <AddTask onAdd={addTask} onEditStart={onEditStart} onEditEnd={onEditEnd} />

              {completedTasks.length > 0 && (
                <>
                  <div className="px-4 py-2 bg-gray-50 text-xs text-gray-400 font-medium uppercase tracking-wider">
                    Completed
                  </div>
                  {completedTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      view={view}
                      onUpdate={updateTask}
                      onDelete={deleteTask}
                      onEditStart={onEditStart}
                      onEditEnd={onEditEnd}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
