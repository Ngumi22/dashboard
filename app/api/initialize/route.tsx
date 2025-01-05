import { initialize } from "@/lib/main";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await initialize();
    return NextResponse.json(
      { message: "Initialization complete" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Initialization error:", error);
    return NextResponse.json(
      { error: "Initialization failed" },
      { status: 500 }
    );
  }
}
