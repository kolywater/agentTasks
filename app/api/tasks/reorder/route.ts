import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { TasksData } from "@/app/types";

const DATA_PATH = path.join(process.cwd(), "data", "tasks.json");

export async function PUT(req: NextRequest) {
  const { orderedIds }: { orderedIds: string[] } = await req.json();
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  const data: TasksData = JSON.parse(raw);

  const taskMap = new Map(data.tasks.map((t) => [t.id, t]));
  const reordered = orderedIds.map((id) => taskMap.get(id)!).filter(Boolean);

  // Append any tasks not in the ordered list (safety net)
  for (const t of data.tasks) {
    if (!orderedIds.includes(t.id)) reordered.push(t);
  }

  data.tasks = reordered;
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
  return NextResponse.json({ success: true });
}
