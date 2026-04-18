import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { parseResumeText, ResumeData } from "@/lib/openai";

export const runtime = "nodejs";
export const maxDuration = 60;

// ─── Basic fallback parser (no OpenAI needed) ─────────────────────────────────
function parseResumeBasic(text: string): ResumeData {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  // Email
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : "";

  // Phone
  const phoneMatch = text.match(/(\+?\d[\d\s\-().]{7,}\d)/);
  const phone = phoneMatch ? phoneMatch[1].trim() : "";

  // LinkedIn / GitHub
  const linkedinMatch = text.match(/linkedin\.com\/in\/([^\s,|]+)/i);
  const githubMatch = text.match(/github\.com\/([^\s,|]+)/i);

  // Name — first non-email, non-phone line that looks like a name (2+ words, title-cased)
  const nameLine = lines.find((l) => {
    if (l.toLowerCase().includes("resume") || l.includes("@") || l.match(/^\d/)) return false;
    const words = l.split(/\s+/);
    return words.length >= 2 && words.length <= 5 && words.every((w) => /^[A-Z]/.test(w));
  }) || lines[0] || "";

  // Title — line right after name that looks like a job title
  const nameIdx = lines.indexOf(nameLine);
  const possibleTitle = lines[nameIdx + 1] || "";
  const title = possibleTitle.length < 60 && !possibleTitle.includes("@") ? possibleTitle : "";

  // Location
  const locationMatch = text.match(/([A-Z][a-z]+(?:,\s*[A-Z]{2})?(?:,\s*[A-Z][a-z]+)?)/);
  const location = locationMatch ? locationMatch[1] : "";

  // Section splitter
  const sectionHeaders = /^(EXPERIENCE|WORK\s*EXPERIENCE|EMPLOYMENT|EDUCATION|SKILLS|TECHNICAL\s*SKILLS|PROJECTS|CERTIFICATIONS|SUMMARY|OBJECTIVE|PROFILE)/i;

  const sections: Record<string, string[]> = {};
  let currentSection = "header";
  sections[currentSection] = [];

  for (const line of lines) {
    if (sectionHeaders.test(line)) {
      currentSection = line.toLowerCase().replace(/\s+/g, "_");
      sections[currentSection] = [];
    } else {
      sections[currentSection] = [...(sections[currentSection] || []), line];
    }
  }

  // Experience — grab any lines that look like job entries
  const expLines = Object.entries(sections).find(([k]) => k.includes("experience") || k.includes("employment"))?.[1] || [];
  const experience: ResumeData["experience"] = [];
  let currentExp: ResumeData["experience"][0] | null = null;
  for (const line of expLines) {
    // Company/title line often has | or · or year range
    if (line.match(/\b(20\d\d|19\d\d)\b/) || line.match(/·|—|-\s/)) {
      if (currentExp) experience.push(currentExp);
      currentExp = {
        id: `exp-${experience.length + 1}`,
        company: line.split(/·|—|,|\|/)[0].trim(),
        title: line.split(/·|—|,|\|/)[1]?.trim() || "",
        location: "",
        startDate: "",
        endDate: "",
        current: line.toLowerCase().includes("present"),
        bullets: [],
      };
    } else if (currentExp && (line.startsWith("•") || line.startsWith("-") || line.startsWith("▪"))) {
      currentExp.bullets.push(line.replace(/^[•\-▪]\s*/, ""));
    } else if (currentExp && line.length > 20) {
      currentExp.bullets.push(line);
    }
  }
  if (currentExp) experience.push(currentExp);

  // Education
  const eduLines = Object.entries(sections).find(([k]) => k.includes("education"))?.[1] || [];
  const education: ResumeData["education"] = eduLines.length > 0
    ? [{
        id: "edu-1",
        school: eduLines[0] || "",
        degree: eduLines[1] || "",
        field: eduLines[2] || "",
        startDate: "",
        endDate: "",
        gpa: "",
      }]
    : [];

  // Skills — join all skill section lines
  const skillLines = Object.entries(sections).find(([k]) => k.includes("skill"))?.[1] || [];
  const allSkills = skillLines.join(" ").split(/[,;·|•]+/).map((s) => s.trim()).filter((s) => s.length > 1 && s.length < 30);
  const skills: ResumeData["skills"] = allSkills.length > 0
    ? [{ id: "skill-1", category: "Skills", items: allSkills.slice(0, 20) }]
    : [];

  // Summary
  const summaryLines = Object.entries(sections).find(([k]) => k.includes("summary") || k.includes("objective") || k.includes("profile"))?.[1] || [];
  const summary = summaryLines.join(" ").slice(0, 500);

  return {
    personalInfo: {
      name: nameLine,
      email,
      phone,
      location,
      linkedin: linkedinMatch ? `linkedin.com/in/${linkedinMatch[1]}` : "",
      github: githubMatch ? `github.com/${githubMatch[1]}` : "",
      website: "",
      title,
    },
    summary,
    experience,
    education,
    skills,
    projects: [],
    certifications: [],
  };
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "Only PDF and Word files are allowed" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 10MB." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate magic bytes (client-supplied file.type is spoofable)
    const isPdf = buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46; // %PDF
    const isDocx = buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04; // PK ZIP
    if (!isPdf && !isDocx) {
      return NextResponse.json({ error: "Invalid file format. Only PDF and Word documents are allowed." }, { status: 400 });
    }

    // ── Step 1: Extract text from file ────────────────────────────────────────
    let text = "";
    try {
      if (file.type === "application/pdf") {
        const pdfParse = (await import("pdf-parse")).default;
        const pdfData = await pdfParse(buffer);
        text = pdfData.text;
      } else {
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ buffer });
        text = result.value;
      }
    } catch (parseErr) {
      console.error("Text extraction error:", parseErr);
      return NextResponse.json({ error: "Could not read the file. Make sure it is a valid PDF or Word document." }, { status: 400 });
    }

    if (!text || text.trim().length < 50) {
      return NextResponse.json({ error: "The file appears to be empty or has no readable text." }, { status: 400 });
    }

    // ── Step 2: Parse resume data (AI if available, else basic) ───────────────
    let parsedResume: ResumeData;
    const hasGemini = !!process.env.GEMINI_API_KEY?.trim();

    if (hasGemini) {
      try {
        parsedResume = await parseResumeText(text);
      } catch (aiErr) {
        console.warn("AI parsing failed, falling back to basic parser:", aiErr);
        parsedResume = parseResumeBasic(text);
      }
    } else {
      console.log("No GEMINI_API_KEY — using basic resume parser");
      parsedResume = parseResumeBasic(text);
    }

    // ── Step 3: Upload file to R2 (optional — skip if not configured) ─────────
    let fileUrl: string | null = null;
    const hasR2 = !!(
      process.env.R2_ACCOUNT_ID?.trim() &&
      process.env.R2_ACCESS_KEY_ID?.trim() &&
      process.env.R2_SECRET_ACCESS_KEY?.trim() &&
      process.env.R2_BUCKET_NAME?.trim()
    );

    if (hasR2) {
      try {
        const { uploadFile, FileKeys } = await import("@/lib/r2");
        const safeFileName = file.name
          .replace(/[^a-zA-Z0-9._-]/g, "_")
          .replace(/\.{2,}/g, "_")
          .substring(0, 200);
        const key = FileKeys.resumeUpload(session.user.id, safeFileName);
        fileUrl = await uploadFile(key, buffer, file.type);
      } catch (r2Err) {
        console.warn("R2 upload failed (continuing without file URL):", r2Err);
      }
    }

    // ── Step 4: Save resume to database ───────────────────────────────────────
    const resume = await prisma.resume.create({
      data: {
        userId: session.user.id,
        title: parsedResume.personalInfo.name
          ? `${parsedResume.personalInfo.name}'s Resume`
          : file.name.replace(/\.(pdf|docx)$/i, ""),
        fileUrl,
        isOriginal: true,
        personalInfo: JSON.stringify(parsedResume.personalInfo),
        summary: parsedResume.summary || null,
        experience: JSON.stringify(parsedResume.experience),
        education: JSON.stringify(parsedResume.education),
        skills: JSON.stringify(parsedResume.skills),
        projects: JSON.stringify(parsedResume.projects),
        certifications: JSON.stringify(parsedResume.certifications),
      },
    });

    // Update usage stats
    await prisma.usageStats.upsert({
      where: { userId: session.user.id },
      update: { resumesCreated: { increment: 1 } },
      create: { userId: session.user.id, resumesCreated: 1 },
    });

    return NextResponse.json({
      resumeId: resume.id,
      resume,
      parsedWith: hasGemini ? "ai" : "basic",
      message: "Resume uploaded successfully",
    });
  } catch (error) {
    console.error("Upload error:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Upload failed: ${msg}` },
      { status: 500 }
    );
  }
}
