import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Task, TasksData } from "@/app/types";

const DATA_PATH = path.join(process.cwd(), "data", "tasks.json");

function readTasks(): TasksData {
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeTasks(data: TasksData) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const trash = searchParams.get("trash") === "true";
  const data = readTasks();

  const filtered = data.tasks.filter((t) =>
    trash ? t.deletedAt !== null : !t.deletedAt
  );

  return NextResponse.json({ tasks: filtered });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const data = readTasks();

  const newTask: Task = {
    id: crypto.randomUUID(),
    title: body.title || "Untitled",
    notes: body.notes || "",
    completed: false,
    priority: body.priority || false,
    dueDate: body.dueDate || null,
    createdAt: new Date().toISOString(),
    deletedAt: null,
  };

  data.tasks.push(newTask);
  writeTasks(data);
  return NextResponse.json(newTask, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const data = readTasks();

  const index = data.tasks.findIndex((t) => t.id === body.id);
  if (index === -1) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  data.tasks[index] = { ...data.tasks[index], ...body };
  writeTasks(data);
  return NextResponse.json(data.tasks[index]);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const permanent = searchParams.get("permanent") === "true";
  const data = readTasks();

  if (permanent) {
    data.tasks = data.tasks.filter((t) => t.id !== id);
  } else {
    const index = data.tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    data.tasks[index].deletedAt = new Date().toISOString();
  }

  writeTasks(data);
  return NextResponse.json({ success: true });
}
