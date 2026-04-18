"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Palette, Lock, ArrowRight, Eye } from "lucide-react";
import { RESUME_TEMPLATES, ResumeTemplate } from "@/lib/templates";
import { cn } from "@/lib/utils";
import Link from "next/link";

const categories = ["all", "modern", "classic", "creative", "minimal", "executive", "tech"] as const;

// ─── Text line simulator (replaces unreadable tiny text) ─────────────────────
function Lines({ widths, color = "#cbd5e1", height = 4, gap = 3 }: {
  widths: number[];
  color?: string;
  height?: number;
  gap?: number;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap }}>
      {widths.map((w, i) => (
        <div key={i} style={{ width: `${w}%`, height, borderRadius: 99, backgroundColor: color }} />
      ))}
    </div>
  );
}

// ─── Resume Preview Layouts ───────────────────────────────────────────────────

function ResumePreview({ template }: { template: ResumeTemplate }) {
  const ac = template.accentColor;
  const id = template.id;
  const cat = template.category;

  // ── Dark Sidebar (modern-dark, creative-sidebar, creative-portfolio) ──────
  if (id === "modern-dark" || id === "creative-sidebar" || id === "creative-portfolio") {
    return (
      <div style={{ display: "flex", height: "100%", fontFamily: "system-ui, sans-serif" }}>
        {/* Sidebar */}
        <div style={{ width: "38%", backgroundColor: ac, padding: "14px 10px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.25)", margin: "0 auto 4px" }} />
          <div style={{ fontSize: 9, fontWeight: 700, color: "white", textAlign: "center" }}>Alex Johnson</div>
          <div style={{ fontSize: 7, color: "rgba(255,255,255,0.7)", textAlign: "center", marginBottom: 6 }}>Software Engineer</div>

          <div style={{ fontSize: 7, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>Skills</div>
          {[["React", 92], ["TypeScript", 88], ["Node.js", 82], ["Python", 76], ["AWS", 70]].map(([s, pct]) => (
            <div key={s} style={{ marginBottom: 3 }}>
              <div style={{ fontSize: 7, color: "rgba(255,255,255,0.85)", marginBottom: 2 }}>{s}</div>
              <div style={{ height: 3, borderRadius: 99, backgroundColor: "rgba(255,255,255,0.2)" }}>
                <div style={{ height: 3, borderRadius: 99, backgroundColor: "rgba(255,255,255,0.75)", width: `${pct}%` }} />
              </div>
            </div>
          ))}

          <div style={{ fontSize: 7, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: 1, textTransform: "uppercase", marginTop: 4, marginBottom: 2 }}>Education</div>
          <div style={{ fontSize: 7, color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>B.S. Computer Sci.</div>
          <div style={{ fontSize: 6, color: "rgba(255,255,255,0.55)" }}>MIT · 2019</div>
        </div>

        {/* Main */}
        <div style={{ flex: 1, padding: "14px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <div style={{ fontSize: 8, fontWeight: 700, color: ac, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>Experience</div>
            <div style={{ height: 1, backgroundColor: `${ac}30`, marginBottom: 6 }} />
            {[["Senior Engineer", "Google · 2021–Now"], ["Software Engineer", "Stripe · 2019–21"]].map(([title, co]) => (
              <div key={title} style={{ marginBottom: 7 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#1e293b" }}>{title}</div>
                <div style={{ fontSize: 7, color: ac, marginBottom: 3 }}>{co}</div>
                <Lines widths={[90, 75]} color="#e2e8f0" height={3} gap={2} />
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 8, fontWeight: 700, color: ac, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>Projects</div>
            <div style={{ height: 1, backgroundColor: `${ac}30`, marginBottom: 6 }} />
            <div style={{ fontSize: 8, fontWeight: 600, color: "#1e293b", marginBottom: 3 }}>Open Source · github</div>
            <Lines widths={[80, 60]} color="#e2e8f0" height={3} gap={2} />
          </div>
        </div>
      </div>
    );
  }

  // ── Gradient / Bold Header ────────────────────────────────────────────────
  if (id === "modern-bold" || id === "modern-gradient") {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "system-ui, sans-serif" }}>
        {/* Gradient header */}
        <div style={{ background: `linear-gradient(135deg, ${ac} 0%, ${ac}99 100%)`, padding: "16px 14px 14px" }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "white", marginBottom: 2 }}>Alex Johnson</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.85)", marginBottom: 6 }}>Senior Software Engineer</div>
          <div style={{ display: "flex", gap: 8 }}>
            {["alex@email.com", "San Francisco", "github.com/alex"].map((t) => (
              <div key={t} style={{ fontSize: 6, color: "rgba(255,255,255,0.65)", background: "rgba(255,255,255,0.15)", borderRadius: 4, padding: "1px 5px" }}>{t}</div>
            ))}
          </div>
        </div>

        {/* Body — two columns */}
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
          <div style={{ padding: "12px 10px 10px 14px", borderRight: `1px solid ${ac}20` }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: ac, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Experience</div>
            {[["Senior Engineer", "Google", "2021–Now"], ["Engineer II", "Stripe", "2019–21"]].map(([t, c, d]) => (
              <div key={t} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#0f172a" }}>{t}</div>
                <div style={{ fontSize: 7, color: ac, marginBottom: 3 }}>{c} · {d}</div>
                <Lines widths={[90, 72, 55]} color="#e2e8f0" height={3} gap={2} />
              </div>
            ))}
          </div>
          <div style={{ padding: "12px 14px 10px 10px" }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: ac, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Skills</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginBottom: 10 }}>
              {["React", "TypeScript", "Node", "AWS", "Python", "SQL"].map((s) => (
                <span key={s} style={{ fontSize: 7, padding: "2px 6px", borderRadius: 4, color: "white", backgroundColor: ac, fontWeight: 600 }}>{s}</span>
              ))}
            </div>
            <div style={{ fontSize: 8, fontWeight: 700, color: ac, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Education</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#0f172a" }}>B.S. Computer Science</div>
            <div style={{ fontSize: 7, color: "#64748b" }}>MIT · 2015–2019</div>
          </div>
        </div>
      </div>
    );
  }

  // ── Classic / Executive — single column ───────────────────────────────────
  if (cat === "classic" || cat === "executive") {
    const isExec = cat === "executive";
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "16px 16px 12px", fontFamily: isExec ? "Georgia, serif" : "Arial, sans-serif" }}>
        {/* Centered header */}
        <div style={{ textAlign: "center", borderBottom: `${isExec ? 2 : 1}px solid ${ac}`, paddingBottom: 8, marginBottom: 10 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", letterSpacing: isExec ? 2 : 0, textTransform: isExec ? "uppercase" : "none" }}>ALEX JOHNSON</div>
          <div style={{ fontSize: 8, color: ac, marginTop: 2 }}>Senior Software Engineer</div>
          <div style={{ fontSize: 7, color: "#94a3b8", marginTop: 3 }}>alex@email.com · +1 555 0100 · San Francisco, CA</div>
        </div>

        {[
          { label: "Summary", content: <Lines widths={[98, 92, 75]} color="#e2e8f0" height={3} gap={2} /> },
          {
            label: "Experience",
            content: (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[["Senior Engineer", "Google · Jan 2021 – Present"], ["Software Engineer", "Meta · Mar 2019 – Jan 2021"]].map(([t, c]) => (
                  <div key={t}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                      <span style={{ fontSize: 8, fontWeight: 700, color: "#1e293b" }}>{t}</span>
                    </div>
                    <div style={{ fontSize: 7, color: ac, marginBottom: 2 }}>{c}</div>
                    <Lines widths={[90, 70]} color="#e2e8f0" height={3} gap={2} />
                  </div>
                ))}
              </div>
            )
          },
          { label: "Skills", content: <div style={{ fontSize: 7, color: "#475569" }}>React · TypeScript · Node.js · Python · AWS · PostgreSQL · Docker</div> },
        ].map(({ label, content }) => (
          <div key={label} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: ac, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>{label}</div>
            <div style={{ height: 1, backgroundColor: ac, marginBottom: 5 }} />
            {content}
          </div>
        ))}
      </div>
    );
  }

  // ── Minimal ───────────────────────────────────────────────────────────────
  if (cat === "minimal") {
    const isSwiss = id === "minimal-swiss";
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "18px 16px 12px", backgroundColor: "white", fontFamily: "Inter, Arial, sans-serif" }}>
        {/* Header */}
        <div style={{
          borderLeft: isSwiss ? `4px solid ${ac}` : "none",
          borderBottom: isSwiss ? "none" : "1px solid #e2e8f0",
          paddingLeft: isSwiss ? 10 : 0,
          paddingBottom: isSwiss ? 0 : 10,
          marginBottom: 12,
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>Alex Johnson</div>
          <div style={{ fontSize: 8, color: "#64748b", marginTop: 2 }}>Senior Software Engineer</div>
          {isSwiss && <div style={{ fontSize: 7, color: "#94a3b8", marginTop: 3 }}>alex@email.com · San Francisco</div>}
        </div>

        {!isSwiss && <div style={{ fontSize: 7, color: "#94a3b8", marginBottom: 12 }}>alex@email.com · +1 555 0100 · San Francisco · github.com/alex</div>}

        {[
          { label: "Experience", content: (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                <span style={{ fontSize: 8, fontWeight: 600, color: "#1e293b" }}>Senior Engineer — Google</span>
                <span style={{ fontSize: 7, color: "#94a3b8" }}>2021–Now</span>
              </div>
              <Lines widths={[85, 70, 55]} color="#e2e8f0" height={3} gap={2} />
            </div>
          )},
          { label: "Education", content: <div style={{ fontSize: 8, color: "#475569" }}>B.S. Computer Science · MIT · 2019</div> },
          { label: "Skills", content: <div style={{ fontSize: 7, color: "#64748b" }}>React · TypeScript · Node.js · Python · AWS</div> },
        ].map(({ label, content }) => (
          <div key={label} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: isSwiss ? ac : "#0f172a", marginBottom: 3 }}>{label}</div>
            <div style={{ height: 1, backgroundColor: "#e2e8f0", marginBottom: 5 }} />
            {content}
          </div>
        ))}
      </div>
    );
  }

  // ── Tech ──────────────────────────────────────────────────────────────────
  if (cat === "tech") {
    const isDev = id === "tech-developer";
    const headerBg = isDev ? "#0d1117" : `${ac}12`;
    const textColor = isDev ? "#e6edf3" : "#0f172a";
    const mutedColor = isDev ? "#8b949e" : "#64748b";
    const accentText = isDev ? "#58a6ff" : ac;

    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: isDev ? "monospace" : "system-ui, sans-serif" }}>
        {/* Header */}
        <div style={{ backgroundColor: headerBg, padding: "14px 14px 12px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: isDev ? "white" : "#0f172a" }}>
            {isDev ? "alex_johnson.dev" : "Alex Johnson"}
          </div>
          <div style={{ fontSize: 8, color: accentText, marginTop: 2 }}>
            {isDev ? "$ senior-software-engineer" : "Senior Software Engineer"}
          </div>
          <div style={{ fontSize: 7, color: mutedColor, marginTop: 3 }}>
            {isDev ? "git: github.com/alex  ·  node: v20  ·  docker: ✓" : "alex@email.com · github.com/alex · San Francisco"}
          </div>
        </div>

        {/* Two columns */}
        <div style={{ flex: 1, display: "flex" }}>
          {/* Main */}
          <div style={{ flex: 1, padding: "12px 10px 10px 14px" }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: accentText, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
              {isDev ? "// experience" : "Experience"}
            </div>
            {[["Senior Engineer", "Google", "2021–Now"], ["Engineer", "Stripe", "2019–21"]].map(([t, c, d]) => (
              <div key={t} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: textColor }}>{t}</div>
                <div style={{ fontSize: 7, color: accentText, marginBottom: 3 }}>{c} · {d}</div>
                <Lines widths={[90, 70, 55]} color={isDev ? "#30363d" : "#e2e8f0"} height={3} gap={2} />
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div style={{ width: "38%", backgroundColor: isDev ? "#161b22" : `${ac}08`, padding: "12px 12px 10px 10px", borderLeft: `1px solid ${isDev ? "#30363d" : `${ac}20`}` }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: accentText, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
              {isDev ? "// stack" : "Skills"}
            </div>
            {["TypeScript", "React", "Node.js", "Python", "AWS", "Docker"].map((s) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                <div style={{ width: 5, height: 5, borderRadius: 2, backgroundColor: accentText, flexShrink: 0 }} />
                <span style={{ fontSize: 8, color: isDev ? "#c9d1d9" : "#475569" }}>{s}</span>
              </div>
            ))}
            <div style={{ fontSize: 8, fontWeight: 700, color: accentText, textTransform: "uppercase", letterSpacing: 1, marginTop: 8, marginBottom: 4 }}>
              {isDev ? "// edu" : "Education"}
            </div>
            <div style={{ fontSize: 8, fontWeight: 600, color: textColor }}>B.S. Comp. Sci.</div>
            <div style={{ fontSize: 7, color: mutedColor }}>MIT · 2019</div>
          </div>
        </div>
      </div>
    );
  }

  // ── Modern default — two-column with accent header ────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ backgroundColor: `${ac}12`, borderBottom: `3px solid ${ac}`, padding: "12px 14px 10px" }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>Alex Johnson</div>
        <div style={{ fontSize: 8, color: ac, fontWeight: 600, marginTop: 2 }}>Senior Software Engineer</div>
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          {["alex@email.com", "San Francisco", "github.com/alex"].map((t) => (
            <span key={t} style={{ fontSize: 6.5, color: "#94a3b8" }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Two columns */}
      <div style={{ flex: 1, display: "flex" }}>
        {/* Main */}
        <div style={{ flex: 1, padding: "12px 10px 10px 14px" }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: ac, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>Experience</div>
          <div style={{ height: 1, backgroundColor: `${ac}35`, marginBottom: 6 }} />
          {[["Senior Engineer", "Google", "2021–Now"], ["Engineer II", "Stripe", "2019–21"]].map(([t, c, d]) => (
            <div key={t} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: "#1e293b" }}>{t}</span>
                <span style={{ fontSize: 7, color: "#94a3b8" }}>{d}</span>
              </div>
              <div style={{ fontSize: 7, color: ac, marginBottom: 3 }}>{c}</div>
              <Lines widths={[92, 76, 60]} color="#e2e8f0" height={3} gap={2} />
            </div>
          ))}

          <div style={{ fontSize: 8, fontWeight: 700, color: ac, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3, marginTop: 4 }}>Projects</div>
          <div style={{ height: 1, backgroundColor: `${ac}35`, marginBottom: 5 }} />
          <div style={{ fontSize: 8, fontWeight: 600, color: "#1e293b", marginBottom: 3 }}>OSS Contrib · github.com/alex</div>
          <Lines widths={[85, 65]} color="#e2e8f0" height={3} gap={2} />
        </div>

        {/* Sidebar */}
        <div style={{ width: "35%", backgroundColor: `${ac}07`, borderLeft: `1px solid ${ac}20`, padding: "12px 12px 10px 10px" }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: ac, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Skills</div>
          {["React / Next.js", "TypeScript", "Node.js", "Python", "PostgreSQL", "AWS / GCP"].map((s) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 5 }}>
              <div style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: ac, flexShrink: 0 }} />
              <span style={{ fontSize: 7.5, color: "#475569" }}>{s}</span>
            </div>
          ))}

          <div style={{ fontSize: 8, fontWeight: 700, color: ac, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5, marginTop: 8 }}>Education</div>
          <div style={{ fontSize: 8, fontWeight: 600, color: "#1e293b" }}>B.S. Computer Science</div>
          <div style={{ fontSize: 7, color: "#64748b", marginTop: 1 }}>MIT · 2015–2019</div>
          <div style={{ fontSize: 7, color: "#94a3b8", marginTop: 1 }}>GPA: 3.9 / 4.0</div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TemplatesPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [previewTemplate, setPreviewTemplate] = useState<ResumeTemplate | null>(null);

  const filtered = activeCategory === "all"
    ? RESUME_TEMPLATES
    : RESUME_TEMPLATES.filter((t) => t.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-pink-400 flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            Resume Templates
          </h1>
          <p className="text-slate-500 mt-1 ml-14">{RESUME_TEMPLATES.length} ATS-friendly designs</p>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer capitalize",
              activeCategory === cat
                ? "bg-brand-700 text-white shadow-sm"
                : "bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Templates grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filtered.map((template, i) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="group"
          >
            <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 hover:border-slate-300 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-lg">
              {/* Template preview — actual-size design, no scaling */}
              <div className="relative bg-white overflow-hidden" style={{ height: 240 }}>
                <ResumePreview template={template} />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end pb-5 gap-2">
                  <button
                    onClick={() => setPreviewTemplate(template)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-semibold rounded-xl cursor-pointer hover:bg-white/30 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Full Preview
                  </button>
                  <Link
                    href={`/builder/new?template=${template.id}`}
                    className="flex items-center gap-1.5 px-4 py-2 text-white text-xs font-bold rounded-xl cursor-pointer"
                    style={{ background: `linear-gradient(135deg, ${template.accentColor}, ${template.accentColor}cc)` }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Use Template
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Premium badge */}
                {template.isPremium && (
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-1 bg-yellow-100 border border-yellow-300 rounded-lg shadow-sm">
                    <Lock className="w-3 h-3 text-yellow-600" />
                    <span className="text-yellow-700 text-[10px] font-bold">PRO</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3.5 bg-white border-t border-slate-100">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 text-sm">{template.name}</div>
                    <div className="text-slate-400 text-xs truncate mt-0.5">{template.description}</div>
                  </div>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full capitalize font-semibold flex-shrink-0 mt-0.5"
                    style={{ color: template.accentColor, backgroundColor: `${template.accentColor}18` }}
                  >
                    {template.category}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Full-size preview modal */}
      {previewTemplate && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setPreviewTemplate(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <div className="font-bold text-slate-900 text-lg">{previewTemplate.name}</div>
                <div className="text-slate-500 text-sm">{previewTemplate.description}</div>
              </div>
              <div className="flex items-center gap-3">
                {previewTemplate.isPremium && (
                  <div className="flex items-center gap-1 px-2.5 py-1.5 bg-yellow-100 border border-yellow-300 rounded-lg">
                    <Lock className="w-3.5 h-3.5 text-yellow-600" />
                    <span className="text-yellow-700 text-xs font-bold">PRO</span>
                  </div>
                )}
                <button onClick={() => setPreviewTemplate(null)} className="text-slate-400 hover:text-slate-600 text-lg font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100">✕</button>
              </div>
            </div>

            {/* Large preview */}
            <div className="bg-white overflow-hidden" style={{ height: 480 }}>
              <ResumePreview template={previewTemplate} />
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-slate-400 text-sm capitalize">{previewTemplate.category} template</span>
              <Link
                href={`/builder/new?template=${previewTemplate.id}`}
                className="flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold rounded-xl cursor-pointer hover:shadow-lg transition-all"
                style={{ background: `linear-gradient(135deg, ${previewTemplate.accentColor}, ${previewTemplate.accentColor}bb)` }}
              >
                Use This Template
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
