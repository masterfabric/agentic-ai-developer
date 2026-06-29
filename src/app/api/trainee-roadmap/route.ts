import { NextResponse } from "next/server";
import { getRoadmap, listPrograms } from "@/lib/roadmap";

// Reads `program` from the query string at request time.
export const dynamic = "force-dynamic";

/**
 * GET /api/trainee-roadmap
 *   → { programs: ProgramInfo[] }            (no `program` query)
 * GET /api/trainee-roadmap?program=flutter
 *   → { roadmap: ProgramRoadmap }
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const program = searchParams.get("program")?.trim();

  try {
    if (!program) {
      const programs = await listPrograms();
      return NextResponse.json({ programs });
    }
    const roadmap = await getRoadmap(program);
    return NextResponse.json({ roadmap });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
