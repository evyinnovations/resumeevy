import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSectionSuggestion } from "@/lib/openai";
import { z } from "zod";

const schema = z.object({
  section: z.string().min(1).max(50),
  content: z.string().min(1).max(10000),
  context: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  try {
    const { section, content, context } = parsed.data;
    const suggestions = await getSectionSuggestion(section, content, context);
    return NextResponse.json({ suggestions, suggestion: suggestions[0] });
  } catch (error) {
    console.error("AI suggest error:", error);
    return NextResponse.json({ error: "AI suggestion failed" }, { status: 500 });
  }
}
