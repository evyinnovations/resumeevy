import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import jsPDF from "jspdf";
import {
  Document, Packer, Paragraph, TextRun,
  AlignmentType, BorderStyle,
  convertInchesToTwip,
} from "docx";

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
      const pdf = generatePDF(parsedResume);
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
      const docxBuffer = await generateDocx(parsedResume);
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
}) {
  const pdf = new jsPDF({ format: "letter", unit: "pt" });
  const info = resume.personalInfo as Record<string, string>;
  const margin = 48;
  const pageWidth = pdf.internal.pageSize.width;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (needed = 40) => {
    if (y + needed > pdf.internal.pageSize.height - margin) {
      pdf.addPage();
      y = margin;
    }
  };

  const sectionHeader = (title: string) => {
    checkPageBreak(30);
    y += 6;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(26, 40, 193); // brand blue
    pdf.text(title.toUpperCase(), margin, y);
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
  pdf.text(info.name || "Your Name", pageWidth / 2, y, { align: "center" });
  y += 20;

  if (info.title) {
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(26, 40, 193);
    pdf.text(info.title, pageWidth / 2, y, { align: "center" });
    y += 16;
  }

  const contactParts = [info.email, info.phone, info.location, info.linkedin, info.github]
    .filter(Boolean) as string[];
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
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(50, 50, 50);
    const lines = pdf.splitTextToSize(resume.summary, contentWidth);
    checkPageBreak(lines.length * 11 + 8);
    pdf.text(lines, margin, y);
    y += lines.length * 11 + 8;
  }

  // ─── Skills ───────────────────────────────────────────────────────────────
  const skills = (resume.skills as Array<{ category: string; items: string[] }>) || [];
  if (skills.length > 0) {
    sectionHeader("Skills");
    for (const group of skills) {
      if (!group.items?.length) continue;
      checkPageBreak(14);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(15, 23, 42);
      const label = `${group.category}: `;
      const labelWidth = pdf.getTextWidth(label);
      pdf.text(label, margin, y);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(50, 50, 50);
      const itemLines = pdf.splitTextToSize(group.items.join(", "), contentWidth - labelWidth);
      pdf.text(itemLines[0], margin + labelWidth, y);
      for (let i = 1; i < itemLines.length; i++) { y += 11; pdf.text(itemLines[i], margin, y); }
      y += 12;
    }
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
      pdf.text(proj.name, margin, y); y += 13;
      if (proj.description) {
        pdf.setFont("helvetica", "normal"); pdf.setFontSize(9); pdf.setTextColor(50, 50, 50);
        const dLines = pdf.splitTextToSize(proj.description, contentWidth);
        checkPageBreak(dLines.length * 11); pdf.text(dLines, margin, y); y += dLines.length * 11;
      }
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(9); pdf.setTextColor(45, 45, 45);
      for (const b of (proj.bullets || [])) {
        if (!b?.trim()) continue;
        const bLines = pdf.splitTextToSize(`• ${b}`, contentWidth - 8);
        checkPageBreak(bLines.length * 11); pdf.text(bLines, margin + 6, y); y += bLines.length * 11;
      }
      if (proj.tech?.length) {
        pdf.setFont("helvetica", "italic"); pdf.setFontSize(8.5); pdf.setTextColor(100, 100, 100);
        pdf.text(`Tech: ${proj.tech.join(", ")}`, margin, y); y += 12;
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
      pdf.text(cert.name, margin, y);
      pdf.setFont("helvetica", "normal"); pdf.setTextColor(80, 80, 80);
      pdf.text([cert.issuer, cert.date].filter(Boolean).join("  ·  "), pageWidth - margin, y, { align: "right" });
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
      pdf.text(exp.title, margin, y);
      const period = exp.current ? `${exp.startDate} – Present` : `${exp.startDate} – ${exp.endDate || ""}`;
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(8.5); pdf.setTextColor(100, 100, 100);
      pdf.text(period, pageWidth - margin, y, { align: "right" }); y += 13;
      pdf.setFont("helvetica", "italic"); pdf.setFontSize(9); pdf.setTextColor(70, 70, 70);
      pdf.text(`${exp.company}${exp.location ? ",  " + exp.location : ""}`, margin, y); y += 13;
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(9); pdf.setTextColor(45, 45, 45);
      for (const b of (exp.bullets || [])) {
        if (!b?.trim()) continue;
        const bLines = pdf.splitTextToSize(`• ${b}`, contentWidth - 8);
        checkPageBreak(bLines.length * 11); pdf.text(bLines, margin + 6, y); y += bLines.length * 11;
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
      pdf.text(`${edu.degree}${edu.field ? " in " + edu.field : ""}`, margin, y);
      if (edu.endDate) { pdf.setFont("helvetica", "normal"); pdf.setFontSize(8.5); pdf.setTextColor(100, 100, 100); pdf.text(edu.endDate, pageWidth - margin, y, { align: "right" }); }
      y += 13;
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(9); pdf.setTextColor(70, 70, 70);
      pdf.text(edu.school + (edu.gpa ? `   GPA: ${edu.gpa}` : ""), margin, y); y += 14;
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
}): Promise<Buffer> {
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

  const BLUE = "1A28C1";
  const DARK = "0F172A";
  const GRAY = "64748B";
  const MID  = "334155";

  const sectionHeading = (text: string): Paragraph =>
    new Paragraph({
      children: [
        new TextRun({ text: text.toUpperCase(), bold: true, size: 22, color: BLUE, font: "Calibri" }),
      ],
      spacing: { before: 260, after: 60 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: "DBEAFE", space: 4 } },
    });

  const bulletPara = (text: string): Paragraph =>
    new Paragraph({
      children: [new TextRun({ text: `• ${text}`, size: 19, color: MID, font: "Calibri" })],
      indent: { left: convertInchesToTwip(0.2) },
      spacing: { after: 50 },
    });

  const children: Paragraph[] = [];

  // ── Header ────────────────────────────────────────────────────────────────
  children.push(
    new Paragraph({
      children: [new TextRun({ text: info.name || "Your Name", bold: true, size: 52, color: DARK, font: "Calibri" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
    })
  );

  if (info.title) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: info.title, size: 24, color: BLUE, font: "Calibri" })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
      })
    );
  }

  const contactParts = [info.email, info.phone, info.location, info.linkedin, info.github].filter(Boolean) as string[];
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
        children: [new TextRun({ text: resume.summary, size: 19, color: MID, font: "Calibri" })],
        spacing: { after: 120 },
      })
    );
  }

  // ── Skills ────────────────────────────────────────────────────────────────
  if (skills.length > 0) {
    children.push(sectionHeading("Skills"));
    for (const group of skills) {
      if (!group.items?.length) continue;
      children.push(new Paragraph({
        children: [
          new TextRun({ text: `${group.category}: `, bold: true, size: 20, color: DARK, font: "Calibri" }),
          new TextRun({ text: group.items.join(", "), size: 19, color: MID, font: "Calibri" }),
        ],
        spacing: { after: 60 },
      }));
    }
  }

  // ── Projects ─────────────────────────────────────────────────────────────
  if (projects.length > 0) {
    children.push(sectionHeading("Projects"));
    for (const proj of projects) {
      children.push(new Paragraph({
        children: [new TextRun({ text: proj.name, bold: true, size: 22, color: DARK, font: "Calibri" })],
        spacing: { before: 100, after: 30 },
      }));
      if (proj.description) {
        children.push(new Paragraph({
          children: [new TextRun({ text: proj.description, size: 19, color: MID, font: "Calibri" })],
          spacing: { after: 40 },
        }));
      }
      for (const b of (proj.bullets || [])) { if (b?.trim()) children.push(bulletPara(b)); }
      if (proj.tech?.length) {
        children.push(new Paragraph({
          children: [new TextRun({ text: `Tech: ${proj.tech.join(", ")}`, italics: true, size: 18, color: GRAY, font: "Calibri" })],
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
          new TextRun({ text: cert.name, bold: true, size: 20, color: DARK, font: "Calibri" }),
          new TextRun({ text: `   ${cert.issuer}${cert.date ? "  ·  " + cert.date : ""}`, size: 18, color: GRAY, font: "Calibri" }),
        ],
        spacing: { after: 60 },
      }));
    }
  }

  // ── Experience ────────────────────────────────────────────────────────────
  if (experience.length > 0) {
    children.push(sectionHeading("Professional Experience"));
    for (const exp of experience) {
      const period = exp.current ? `${exp.startDate} – Present` : `${exp.startDate} – ${exp.endDate || ""}`;
      children.push(new Paragraph({
        children: [
          new TextRun({ text: exp.title, bold: true, size: 22, color: DARK, font: "Calibri" }),
          new TextRun({ text: `   ${period}`, size: 18, color: GRAY, font: "Calibri" }),
        ],
        spacing: { before: 140, after: 30 },
      }));
      children.push(new Paragraph({
        children: [new TextRun({ text: `${exp.company}${exp.location ? ",  " + exp.location : ""}`, italics: true, size: 19, color: GRAY, font: "Calibri" })],
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
          new TextRun({ text: `${edu.degree}${edu.field ? " in " + edu.field : ""}`, bold: true, size: 22, color: DARK, font: "Calibri" }),
          new TextRun({ text: edu.endDate ? `   ${edu.endDate}` : "", size: 18, color: GRAY, font: "Calibri" }),
        ],
        spacing: { before: 100, after: 30 },
      }));
      children.push(new Paragraph({
        children: [
          new TextRun({ text: edu.school, size: 19, color: GRAY, font: "Calibri" }),
          ...(edu.gpa ? [new TextRun({ text: `   GPA: ${edu.gpa}`, size: 18, color: GRAY, font: "Calibri" })] : []),
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
