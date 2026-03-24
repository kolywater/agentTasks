"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Task } from "@/app/types";
import TaskItem from "@/app/components/TaskItem";
import AddTask from "@/app/components/AddTask";

type View = "all" | "priority" | "scheduled" | "trash";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [trashedTasks, setTrashedTasks] = useState<Task[]>([]);
  const [view, setView] = useState<View>("priority");
  const [mounted, setMounted] = useState(false);
  const lastMtime = useRef<number>(0);
  const editingCount = useRef<number>(0);

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

  useEffect(() => {
    setMounted(true);
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

  return (
    <div className="min-h-screen bg-gray-50">
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
      </div>
    </div>
  );
}
