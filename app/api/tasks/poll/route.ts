import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "tasks.json");

export async function GET() {
  try {
    const stats = fs.statSync(DATA_PATH);
    return NextResponse.json(
      { mtime: stats.mtimeMs },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { error: "File not found" },
      { status: 404, headers: { "Cache-Control": "no-store" } }
    );
  }
}
