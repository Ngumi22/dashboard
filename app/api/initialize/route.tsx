// app/api/initialize/route.ts
import { NextResponse } from "next/server";
import { initialize } from "@/lib/MysqlDB/initialize";

export async function GET() {
  try {
    await initialize(); // Initialize the database and tables
    console.log("Database initialized via API route.");
    return NextResponse.json({ message: "Database initialized successfully." });
  } catch (error) {
    console.error("Database initialization failed:", error);
    return NextResponse.json(
      { error: "Failed to initialize the database." },
      { status: 500 }
    );
  }
}
