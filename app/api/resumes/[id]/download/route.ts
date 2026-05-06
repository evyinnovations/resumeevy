import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import jsPDF from "jspdf";
import {
  Document, Packer, Paragraph, TextRun,
  AlignmentType, BorderStyle,
  Table, TableRow, TableCell, WidthType,
  convertInchesToTwip,
} from "docx";

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Strip Unicode punctuation that PDF helvetica/Calibri renders as garbage.
function clean(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .replace(/[—–]/g, "-")
    .replace(/[‘’‚‛]/g, "'")
    .replace(/[“”„‟]/g, '"')
    .replace(/…/g, "...")
    .replace(/ /g, " ")
    .replace(/•/g, "-")
    .replace(/[‐-―]/g, "-");
}

// Normalize a token for keyword matching. Lower-case, alphanumeric only.
function normKw(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9+#.]/g, "");
}

function buildKeywordSet(keywords: string[]): Set<string> {
  const set = new Set<string>();
  for (const k of keywords) {
    const n = normKw(k);
    if (n.length >= 2) set.add(n);
  }
  return set;
}

function isKeywordToken(token: string, kwSet: Set<string>): boolean {
  const n = normKw(token);
  return n.length >= 2 && kwSet.has(n);
}

function safeJsonArr(s: string | null | undefined): string[] {
  if (!s) return [];
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const format = req.nextUrl.searchParams.get("format") || "pdf";

  const resume = await prisma.resume.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!resume) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const fileName = resume.title
      .replace(/[^a-z0-9\-_ ]/gi, "")
      .replace(/\s+/g, "-")
      .substring(0, 100) || "resume";

    // If this resume came from a tailor job, pull the JD keywords so we can
    // bold them in the rendered output.
    const tailorJob = await prisma.tailorJob.findFirst({
      where: { tailoredResumeId: resume.id },
      orderBy: { createdAt: "desc" },
    });
    const keywords: string[] = tailorJob
      ? [
          ...safeJsonArr(tailorJob.extractedSkills),
          ...safeJsonArr(tailorJob.missingKeywords),
        ]
      : [];

    // Parse JSON string fields from SQLite
    const parsedResume = {
      ...resume,
      personalInfo:   typeof resume.personalInfo   === "string" ? JSON.parse(resume.personalInfo)   : resume.personalInfo,
      experience:     typeof resume.experience      === "string" ? JSON.parse(resume.experience)      : (resume.experience      ?? []),
      education:      typeof resume.education       === "string" ? JSON.parse(resume.education)       : (resume.education       ?? []),
      skills:         typeof resume.skills          === "string" ? JSON.parse(resume.skills)          : (resume.skills          ?? []),
      projects:       typeof resume.projects        === "string" ? JSON.parse(resume.projects)        : (resume.projects        ?? []),
      certifications: typeof resume.certifications  === "string" ? JSON.parse(resume.certifications)  : (resume.certifications  ?? []),
    };

    if (format === "pdf") {
      const pdf = generatePDF(parsedResume, keywords);
      const pdfBytes = pdf.output("arraybuffer");

      await prisma.usageStats.upsert({
        where: { userId: session.user.id },
        update: { downloadsCount: { increment: 1 } },
        create: { userId: session.user.id, downloadsCount: 1 },
      });

      return new NextResponse(pdfBytes, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${fileName}.pdf"`,
        },
      });
    }

    if (format === "docx") {
      const docxBuffer = await generateDocx(parsedResume, keywords);
      const docxArrayBuffer = docxBuffer.buffer.slice(
        docxBuffer.byteOffset,
        docxBuffer.byteOffset + docxBuffer.byteLength
      );

      await prisma.usageStats.upsert({
        where: { userId: session.user.id },
        update: { downloadsCount: { increment: 1 } },
        create: { userId: session.user.id, downloadsCount: 1 },
      });

      return new NextResponse(docxArrayBuffer as ArrayBuffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="${fileName}.docx"`,
        },
      });
    }

    // Fallback: return resume data as JSON for client-side rendering
    return NextResponse.json({ resume, format });
  } catch (error) {
    console.error("Download error:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Download failed: ${msg}` }, { status: 500 });
  }
}

function generatePDF(resume: {
  title: string;
  personalInfo: unknown;
  summary?: string | null;
  experience: unknown;
  education: unknown;
  skills: unknown;
  projects: unknown;
  certifications?: unknown;
}, keywords: string[] = []) {
  const pdf = new jsPDF({ format: "letter", unit: "pt" });
  const info = resume.personalInfo as Record<string, string>;
  const margin = 48;
  const pageWidth = pdf.internal.pageSize.width;
  const contentWidth = pageWidth - margin * 2;
  const lineH = 11;
  const kwSet = buildKeywordSet(keywords);
  let y = margin;

  const checkPageBreak = (needed = 40) => {
    if (y + needed > pdf.internal.pageSize.height - margin) {
      pdf.addPage();
      y = margin;
    }
  };

  // Render text with per-token bold highlighting for keyword matches.
  // Handles word wrapping. Advances y. Returns nothing (mutates y).
  const drawHighlighted = (
    text: string,
    x: number,
    maxWidth: number,
    fontSize: number,
    baseColor: [number, number, number] = [50, 50, 50]
  ) => {
    const tokens = clean(text).split(/(\s+)/);
    pdf.setFontSize(fontSize);
    let cx = x;
    for (const tok of tokens) {
      if (!tok) continue;
      if (/^\s+$/.test(tok)) {
        pdf.setFont("helvetica", "normal");
        const w = pdf.getTextWidth(tok);
        if (cx + w > x + maxWidth) { y += lineH; cx = x; }
        else { cx += w; }
        continue;
      }
      const isKw = isKeywordToken(tok, kwSet);
      pdf.setFont("helvetica", isKw ? "bold" : "normal");
      if (isKw) pdf.setTextColor(26, 40, 193);
      else pdf.setTextColor(...baseColor);
      const w = pdf.getTextWidth(tok);
      if (cx + w > x + maxWidth) { y += lineH; cx = x; checkPageBreak(lineH); }
      pdf.text(tok, cx, y);
      cx += w;
    }
    pdf.setTextColor(...baseColor);
    y += lineH;
  };

  const sectionHeader = (title: string) => {
    checkPageBreak(30);
    y += 6;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(26, 40, 193); // brand blue
    pdf.text(clean(title).toUpperCase(), margin, y);
    y += 4;
    pdf.setDrawColor(26, 40, 193);
    pdf.setLineWidth(0.75);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 10;
    pdf.setTextColor(30, 30, 30);
  };

  // ─── Header ───────────────────────────────────────────────────────────────
  pdf.setFontSize(20);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(15, 23, 42);
  pdf.text(clean(info.name) || "Your Name", pageWidth / 2, y, { align: "center" });
  y += 20;

  if (info.title) {
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(26, 40, 193);
    pdf.text(clean(info.title), pageWidth / 2, y, { align: "center" });
    y += 16;
  }

  const contactParts = [info.email, info.phone, info.location, info.linkedin, info.github]
    .filter(Boolean).map(clean) as string[];
  if (contactParts.length > 0) {
    pdf.setFontSize(8.5);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(80, 80, 80);
    pdf.text(contactParts.join("   |   "), pageWidth / 2, y, { align: "center" });
    y += 14;
  }

  // Header divider
  pdf.setDrawColor(26, 40, 193);
  pdf.setLineWidth(1.5);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 12;

  // ─── Summary ──────────────────────────────────────────────────────────────
  if (resume.summary) {
    sectionHeader("Professional Summary");
    drawHighlighted(resume.summary, margin, contentWidth, 9);
    y += 4;
  }

  // ─── Skills (table) ───────────────────────────────────────────────────────
  const skills = (resume.skills as Array<{ category: string; items: string[] }>) || [];
  if (skills.length > 0) {
    sectionHeader("Skills");
    const catW = 130;                          // left column
    const itemW = contentWidth - catW;          // right column
    const cellPadX = 6;
    const cellPadY = 5;

    pdf.setDrawColor(216, 216, 240);            // soft brand line
    pdf.setLineWidth(0.5);

    for (const group of skills) {
      if (!group.items?.length) continue;
      const cat = clean(group.category);
      const itemsText = group.items.map(clean).join(", ");

      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      const itemLines = pdf.splitTextToSize(itemsText, itemW - cellPadX * 2);
      const rowH = Math.max(itemLines.length * lineH, lineH) + cellPadY * 2;
      checkPageBreak(rowH + 2);

      // Left cell — category (bold)
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(15, 23, 42);
      pdf.text(cat, margin + cellPadX, y + cellPadY + 8);

      // Right cell — items (highlight keywords inline)
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(50, 50, 50);
      let cy = y + cellPadY + 8;
      for (const line of itemLines) {
        // tokenize for keyword bold
        const tokens = line.split(/(,\s*)/);
        let cx = margin + catW + cellPadX;
        for (const tok of tokens) {
          if (!tok) continue;
          if (/^,\s*$/.test(tok)) {
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(50, 50, 50);
            pdf.text(tok, cx, cy);
            cx += pdf.getTextWidth(tok);
            continue;
          }
          const isKw = isKeywordToken(tok, kwSet);
          pdf.setFont("helvetica", isKw ? "bold" : "normal");
          pdf.setTextColor(...(isKw ? [26, 40, 193] as [number, number, number] : [50, 50, 50] as [number, number, number]));
          pdf.text(tok, cx, cy);
          cx += pdf.getTextWidth(tok);
        }
        cy += lineH;
      }

      // Borders
      pdf.setDrawColor(216, 216, 240);
      pdf.line(margin, y, margin + contentWidth, y);                    // top
      pdf.line(margin, y + rowH, margin + contentWidth, y + rowH);      // bottom
      pdf.line(margin, y, margin, y + rowH);                            // left
      pdf.line(margin + catW, y, margin + catW, y + rowH);              // mid
      pdf.line(margin + contentWidth, y, margin + contentWidth, y + rowH); // right

      y += rowH;
    }
    y += 6;
    pdf.setTextColor(50, 50, 50);
  }

  // ─── Projects ─────────────────────────────────────────────────────────────
  const projects = (resume.projects as Array<{
    name: string; description?: string; bullets?: string[]; tech?: string[]; url?: string;
  }>) || [];
  if (projects.length > 0) {
    sectionHeader("Projects");
    for (const proj of projects) {
      checkPageBreak(35);
      pdf.setFontSize(10); pdf.setFont("helvetica", "bold"); pdf.setTextColor(15, 23, 42);
      pdf.text(clean(proj.name), margin, y); y += 13;
      if (proj.description) {
        drawHighlighted(proj.description, margin, contentWidth, 9);
      }
      for (const b of (proj.bullets || [])) {
        if (!b?.trim()) continue;
        pdf.setFontSize(9); pdf.setFont("helvetica", "normal"); pdf.setTextColor(45, 45, 45);
        pdf.text("-", margin + 2, y);
        drawHighlighted(b, margin + 10, contentWidth - 10, 9, [45, 45, 45]);
      }
      if (proj.tech?.length) {
        pdf.setFont("helvetica", "italic"); pdf.setFontSize(8.5); pdf.setTextColor(100, 100, 100);
        pdf.text(`Tech: ${proj.tech.map(clean).join(", ")}`, margin, y); y += 12;
      }
      y += 4;
    }
  }

  // ─── Certifications ───────────────────────────────────────────────────────
  const certs = (resume.certifications as Array<{ name: string; issuer: string; date?: string }>) || [];
  if (certs.length > 0) {
    sectionHeader("Certifications");
    for (const cert of certs) {
      checkPageBreak(20);
      pdf.setFontSize(9); pdf.setFont("helvetica", "bold"); pdf.setTextColor(15, 23, 42);
      pdf.text(clean(cert.name), margin, y);
      pdf.setFont("helvetica", "normal"); pdf.setTextColor(80, 80, 80);
      pdf.text([clean(cert.issuer), clean(cert.date)].filter(Boolean).join("  -  "), pageWidth - margin, y, { align: "right" });
      y += 13;
    }
  }

  // ─── Experience ───────────────────────────────────────────────────────────
  const experience = (resume.experience as Array<{
    title: string; company: string; location?: string;
    startDate: string; endDate?: string; current?: boolean; bullets: string[];
  }>) || [];
  if (experience.length > 0) {
    sectionHeader("Professional Experience");
    for (const exp of experience) {
      checkPageBreak(45);
      pdf.setFontSize(10); pdf.setFont("helvetica", "bold"); pdf.setTextColor(15, 23, 42);
      pdf.text(clean(exp.title), margin, y);
      const period = exp.current ? `${clean(exp.startDate)} - Present` : `${clean(exp.startDate)} - ${clean(exp.endDate)}`;
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(8.5); pdf.setTextColor(100, 100, 100);
      pdf.text(period, pageWidth - margin, y, { align: "right" }); y += 13;
      pdf.setFont("helvetica", "italic"); pdf.setFontSize(9); pdf.setTextColor(70, 70, 70);
      pdf.text(`${clean(exp.company)}${exp.location ? ",  " + clean(exp.location) : ""}`, margin, y); y += 13;
      for (const b of (exp.bullets || [])) {
        if (!b?.trim()) continue;
        pdf.setFontSize(9); pdf.setFont("helvetica", "normal"); pdf.setTextColor(45, 45, 45);
        pdf.text("-", margin + 2, y);
        drawHighlighted(b, margin + 10, contentWidth - 10, 9, [45, 45, 45]);
      }
      y += 6;
    }
  }

  // ─── Education ────────────────────────────────────────────────────────────
  const education = (resume.education as Array<{
    school: string; degree: string; field?: string; startDate?: string; endDate?: string; gpa?: string;
  }>) || [];
  if (education.length > 0) {
    sectionHeader("Education");
    for (const edu of education) {
      checkPageBreak(35);
      pdf.setFontSize(10); pdf.setFont("helvetica", "bold"); pdf.setTextColor(15, 23, 42);
      pdf.text(`${clean(edu.degree)}${edu.field ? " in " + clean(edu.field) : ""}`, margin, y);
      if (edu.endDate) { pdf.setFont("helvetica", "normal"); pdf.setFontSize(8.5); pdf.setTextColor(100, 100, 100); pdf.text(clean(edu.endDate), pageWidth - margin, y, { align: "right" }); }
      y += 13;
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(9); pdf.setTextColor(70, 70, 70);
      pdf.text(clean(edu.school) + (edu.gpa ? `   GPA: ${clean(edu.gpa)}` : ""), margin, y); y += 14;
    }
  }

  return pdf;
}

// ─── Word (.docx) Generation ─────────────────────────────────────────────────

async function generateDocx(resume: {
  title: string;
  personalInfo: unknown;
  summary?: string | null;
  experience: unknown;
  education: unknown;
  skills: unknown;
  projects: unknown;
  certifications?: unknown;
}, keywords: string[] = []): Promise<Buffer> {
  const kwSet = buildKeywordSet(keywords);
  const BLUE = "1A28C1";
  const DARK = "0F172A";
  const GRAY = "64748B";
  const MID  = "334155";

  // Build TextRuns from a string, bolding tokens that match a JD keyword.
  const highlightedRuns = (text: string, opts: { size?: number; color?: string; italics?: boolean } = {}): TextRun[] => {
    const size = opts.size ?? 19;
    const color = opts.color ?? MID;
    const tokens = clean(text).split(/(\s+|,)/);
    return tokens.filter(Boolean).map((tok) => {
      const isKw = isKeywordToken(tok, kwSet);
      return new TextRun({
        text: tok,
        bold: isKw,
        italics: opts.italics,
        size,
        color: isKw ? BLUE : color,
        font: "Calibri",
      });
    });
  };
  const info = resume.personalInfo as Record<string, string>;
  const experience = (resume.experience as Array<{
    title: string; company: string; location?: string;
    startDate: string; endDate?: string; current?: boolean; bullets: string[];
  }>) || [];
  const education = (resume.education as Array<{
    school: string; degree: string; field?: string;
    startDate?: string; endDate?: string; gpa?: string;
  }>) || [];
  const skills = (resume.skills as Array<{ category: string; items: string[] }>) || [];
  const projects = (resume.projects as Array<{
    name: string; description?: string; bullets?: string[]; tech?: string[];
  }>) || [];
  const certs = (resume.certifications as Array<{
    name: string; issuer: string; date?: string;
  }>) || [];

  const sectionHeading = (text: string): Paragraph =>
    new Paragraph({
      children: [
        new TextRun({ text: clean(text).toUpperCase(), bold: true, size: 22, color: BLUE, font: "Calibri" }),
      ],
      spacing: { before: 260, after: 60 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: "DBEAFE", space: 4 } },
    });

  const bulletPara = (text: string): Paragraph =>
    new Paragraph({
      children: [
        new TextRun({ text: "- ", size: 19, color: MID, font: "Calibri" }),
        ...highlightedRuns(text),
      ],
      indent: { left: convertInchesToTwip(0.2) },
      spacing: { after: 50 },
    });

  const children: (Paragraph | Table)[] = [];

  // ── Header ────────────────────────────────────────────────────────────────
  children.push(
    new Paragraph({
      children: [new TextRun({ text: clean(info.name) || "Your Name", bold: true, size: 52, color: DARK, font: "Calibri" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
    })
  );

  if (info.title) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: clean(info.title), size: 24, color: BLUE, font: "Calibri" })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
      })
    );
  }

  const contactParts = [info.email, info.phone, info.location, info.linkedin, info.github].filter(Boolean).map(clean) as string[];
  if (contactParts.length > 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: contactParts.join("   |   "), size: 18, color: GRAY, font: "Calibri" })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: BLUE, space: 8 } },
      })
    );
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  if (resume.summary) {
    children.push(sectionHeading("Professional Summary"));
    children.push(
      new Paragraph({
        children: highlightedRuns(resume.summary),
        spacing: { after: 120 },
      })
    );
  }

  // ── Skills (table) ────────────────────────────────────────────────────────
  if (skills.length > 0) {
    children.push(sectionHeading("Skills"));
    const cellBorder = { style: BorderStyle.SINGLE, size: 4, color: "D8D8F0" };
    const borders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };
    const skillRows: TableRow[] = skills
      .filter((g) => g.items?.length)
      .map((group) => new TableRow({
        children: [
          new TableCell({
            width: { size: 28, type: WidthType.PERCENTAGE },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            borders,
            children: [new Paragraph({
              children: [new TextRun({ text: clean(group.category), bold: true, size: 20, color: DARK, font: "Calibri" })],
            })],
          }),
          new TableCell({
            width: { size: 72, type: WidthType.PERCENTAGE },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            borders,
            children: [new Paragraph({
              children: highlightedRuns(group.items.join(", "), { size: 19, color: MID }),
            })],
          }),
        ],
      }));
    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: skillRows,
    }));
    children.push(new Paragraph({ children: [], spacing: { after: 60 } }));
  }

  // ── Projects ─────────────────────────────────────────────────────────────
  if (projects.length > 0) {
    children.push(sectionHeading("Projects"));
    for (const proj of projects) {
      children.push(new Paragraph({
        children: [new TextRun({ text: clean(proj.name), bold: true, size: 22, color: DARK, font: "Calibri" })],
        spacing: { before: 100, after: 30 },
      }));
      if (proj.description) {
        children.push(new Paragraph({
          children: highlightedRuns(proj.description),
          spacing: { after: 40 },
        }));
      }
      for (const b of (proj.bullets || [])) { if (b?.trim()) children.push(bulletPara(b)); }
      if (proj.tech?.length) {
        children.push(new Paragraph({
          children: [new TextRun({ text: `Tech: ${proj.tech.map(clean).join(", ")}`, italics: true, size: 18, color: GRAY, font: "Calibri" })],
          spacing: { after: 60 },
        }));
      }
    }
  }

  // ── Certifications ────────────────────────────────────────────────────────
  if (certs.length > 0) {
    children.push(sectionHeading("Certifications"));
    for (const cert of certs) {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: clean(cert.name), bold: true, size: 20, color: DARK, font: "Calibri" }),
          new TextRun({ text: `   ${clean(cert.issuer)}${cert.date ? "  -  " + clean(cert.date) : ""}`, size: 18, color: GRAY, font: "Calibri" }),
        ],
        spacing: { after: 60 },
      }));
    }
  }

  // ── Experience ────────────────────────────────────────────────────────────
  if (experience.length > 0) {
    children.push(sectionHeading("Professional Experience"));
    for (const exp of experience) {
      const period = exp.current ? `${clean(exp.startDate)} - Present` : `${clean(exp.startDate)} - ${clean(exp.endDate)}`;
      children.push(new Paragraph({
        children: [
          new TextRun({ text: clean(exp.title), bold: true, size: 22, color: DARK, font: "Calibri" }),
          new TextRun({ text: `   ${period}`, size: 18, color: GRAY, font: "Calibri" }),
        ],
        spacing: { before: 140, after: 30 },
      }));
      children.push(new Paragraph({
        children: [new TextRun({ text: `${clean(exp.company)}${exp.location ? ",  " + clean(exp.location) : ""}`, italics: true, size: 19, color: GRAY, font: "Calibri" })],
        spacing: { after: 60 },
      }));
      for (const b of (exp.bullets || [])) { if (b?.trim()) children.push(bulletPara(b)); }
    }
  }

  // ── Education ─────────────────────────────────────────────────────────────
  if (education.length > 0) {
    children.push(sectionHeading("Education"));
    for (const edu of education) {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: `${clean(edu.degree)}${edu.field ? " in " + clean(edu.field) : ""}`, bold: true, size: 22, color: DARK, font: "Calibri" }),
          new TextRun({ text: edu.endDate ? `   ${clean(edu.endDate)}` : "", size: 18, color: GRAY, font: "Calibri" }),
        ],
        spacing: { before: 100, after: 30 },
      }));
      children.push(new Paragraph({
        children: [
          new TextRun({ text: clean(edu.school), size: 19, color: GRAY, font: "Calibri" }),
          ...(edu.gpa ? [new TextRun({ text: `   GPA: ${clean(edu.gpa)}`, size: 18, color: GRAY, font: "Calibri" })] : []),
        ],
        spacing: { after: 80 },
      }));
    }
  }

  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: "Calibri", size: 20, color: MID } },
      },
    },
    sections: [{
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(0.75),
            bottom: convertInchesToTwip(0.75),
            left: convertInchesToTwip(0.9),
            right: convertInchesToTwip(0.9),
          },
        },
      },
      children,
    }],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}
