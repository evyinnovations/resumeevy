import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";
export const maxDuration = 60;

const schema = z.object({
  type: z.enum(["follow_up", "thank_you", "cold_outreach", "offer_negotiation", "withdrawal"]),
  jobTitle: z.string().min(1).max(200),
  company: z.string().min(1).max(200),
  userName: z.string().min(1).max(100),
  context: z.string().max(500).optional(),
});

const TEMPLATES = {
  follow_up:         { label: "Follow-Up After Application",   days: "7–10 days after applying" },
  thank_you:         { label: "Thank You After Interview",      days: "Within 24 hours of interview" },
  cold_outreach:     { label: "Cold Outreach to Hiring Manager",days: "Before applying" },
  offer_negotiation: { label: "Salary Negotiation",            days: "After receiving offer" },
  withdrawal:        { label: "Withdraw Application",          days: "If you accept another offer" },
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.GEMINI_API_KEY?.trim()) {
    return NextResponse.json({ error: "Gemini API key not configured" }, { status: 503 });
  }

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const { type, jobTitle, company, userName, context } = parsed.data;
  const tmpl = TEMPLATES[type];

  const prompts: Record<typeof type, string> = {
    follow_up: `Write a professional follow-up email from ${userName} to ${company} after applying for ${jobTitle}.
Timing: ${tmpl.days}. Keep it brief (3–4 sentences), polite, and reiterate genuine interest.
${context ? `Additional context: ${context}` : ""}
Return JSON: {"subject": "...", "body": "..."}`,

    thank_you: `Write a genuine thank-you email from ${userName} to a hiring manager at ${company} after interviewing for ${jobTitle}.
Timing: ${tmpl.days}. 3–4 short paragraphs: thank them, mention one specific thing from the interview, reaffirm fit.
${context ? `Additional context: ${context}` : ""}
Return JSON: {"subject": "...", "body": "..."}`,

    cold_outreach: `Write a compelling cold outreach email from ${userName} to a hiring manager at ${company} about the ${jobTitle} role.
Goal: get a conversation, not a job. 3–5 sentences max. Lead with value, end with a soft ask.
${context ? `Additional context: ${context}` : ""}
Return JSON: {"subject": "...", "body": "..."}`,

    offer_negotiation: `Write a professional salary negotiation email from ${userName} to ${company} for the ${jobTitle} role.
Tone: grateful but confident. Request a higher number without burning the bridge.
${context ? `Additional context: ${context}` : ""}
Return JSON: {"subject": "...", "body": "..."}`,

    withdrawal: `Write a gracious application withdrawal email from ${userName} to ${company} for the ${jobTitle} role.
Keep it short and professional — leave the door open for the future.
${context ? `Additional context: ${context}` : ""}
Return JSON: {"subject": "...", "body": "..."}`,
  };

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });
    const result = await model.generateContent(prompts[type]);
    const text = result.response.text();

    // Strip code fences if present
    const jsonStr = text.match(/```(?:json)?\s*([\s\S]*?)```/)?.[1]?.trim() ?? text;
    const { subject, body } = JSON.parse(jsonStr);

    return NextResponse.json({ subject, body, label: tmpl.label, timing: tmpl.days });
  } catch (error) {
    console.error("Email template error:", error);
    return NextResponse.json({ error: "Failed to generate email template" }, { status: 500 });
  }
}
