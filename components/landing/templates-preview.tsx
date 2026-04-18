"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";

const templates = [
  { name: "Modern Minimal", category: "Modern", accent: "#1A28C1" },
  { name: "Executive Pro", category: "Executive", accent: "#3B82F6" },
  { name: "Creative Bold", category: "Creative", accent: "#EC4899" },
  { name: "Tech Stack", category: "Tech", accent: "#10B981" },
  { name: "Classic Clean", category: "Classic", accent: "#A855F7" },
  { name: "Startup Vibe", category: "Modern", accent: "#F59E0B" },
];

function ResumeTemplateCard({ name, category, accent, delay }: {
  name: string; category: string; accent: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="group cursor-pointer"
    >
      <div className="relative rounded-xl overflow-hidden border border-[#C5C5E8] hover:border-[#1A28C1]/30 transition-all duration-300 bg-white shadow-[0_2px_12px_rgba(26,40,193,0.04)]">
        <div className="p-4 h-52 flex flex-col">
          <div className="h-7 rounded-lg mb-3 flex items-center justify-between px-2 border border-[#E0E0F4]" style={{ backgroundColor: `${accent}10` }}>
            <div className="flex gap-1">
              <div className="w-14 h-1.5 rounded-full" style={{ backgroundColor: `${accent}50` }} />
              <div className="w-8 h-1.5 rounded-full" style={{ backgroundColor: `${accent}25` }} />
            </div>
            <div className="w-5 h-5 rounded-full" style={{ backgroundColor: `${accent}20` }} />
          </div>

          <div className="flex gap-2 flex-1">
            <div className="w-1/3 space-y-1.5">
              <div className="h-1.5 rounded w-full" style={{ backgroundColor: `${accent}30` }} />
              <div className="h-1.5 rounded w-3/4" style={{ backgroundColor: `${accent}15` }} />
              <div className="mt-2 h-1 rounded w-full bg-[#E8E8F8]" />
              <div className="h-1 rounded bg-[#E8E8F8] w-4/5" />
              <div className="h-1 rounded bg-[#E8E8F8] w-3/4" />
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="h-1.5 rounded w-2/3" style={{ backgroundColor: `${accent}25` }} />
              <div className="h-1 rounded bg-[#E8E8F8] w-full" />
              <div className="h-1 rounded bg-[#E8E8F8] w-5/6" />
              <div className="h-1 rounded bg-[#E8E8F8] w-4/5" />
              <div className="mt-2 h-1.5 rounded w-1/2" style={{ backgroundColor: `${accent}20` }} />
              <div className="h-1 rounded bg-[#E8E8F8] w-full" />
              <div className="h-1 rounded bg-[#E8E8F8] w-3/4" />
            </div>
          </div>
        </div>

        <div className="absolute inset-0 bg-white/85 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <div className="flex items-center gap-2 text-xs font-medium" style={{ color: accent }}>
            <span>Use Template</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      <div className="mt-3 px-1">
        <div className="font-semibold text-slate-700 text-xs">{name}</div>
        <div className="text-slate-400 text-[10px] mt-0.5">{category}</div>
      </div>
    </motion.div>
  );
}

export function TemplatesPreview() {
  return (
    <section id="templates" className="bg-[#F5F5FE] border-t border-[#D8D8F0]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px w-8 bg-[#1A28C1]" />
            <span className="text-[#1A28C1] text-xs font-semibold tracking-[0.2em] uppercase">20+ ATS-Verified Templates</span>
          </div>
          <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-end">
            <h2
              className="font-black leading-[1.0] tracking-[-0.03em] text-[#0F1235]"
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
            >
              Designs that make
              <br />
              <span style={{
                background: "linear-gradient(135deg, #4D5EDB, #1A28C1)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>recruiters stop scrolling.</span>
            </h2>
            <p className="text-slate-500 text-base leading-relaxed">
              ATS-friendly formats that also look stunning. Every template tested against
              Workday, Greenhouse, Lever, and Taleo. Switch instantly without losing content.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 mt-8">
            {["Tested against Workday", "Single & multi-column", "Recruiter-approved", "Switch in 1 click"].map((t) => (
              <div key={t} className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-[#D8D8F0] px-3 py-1.5 rounded-lg">
                <CheckCircle className="w-3 h-3 text-[#10B981]" />
                {t}
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {templates.map((t, i) => (
            <ResumeTemplateCard key={t.name} {...t} delay={i * 0.08} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
        >
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 px-7 py-3.5 bg-[#1A28C1] hover:bg-[#1520A0] text-white font-semibold text-sm rounded-xl transition-all duration-200 cursor-pointer shadow-lg shadow-[#1A28C1]/15"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Browse All Templates
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <p className="text-slate-400 text-xs">More templates added monthly</p>
        </motion.div>
      </div>
    </section>
  );
}
