"use client";

import { motion } from "framer-motion";
import { CheckCircle, XCircle, MinusCircle } from "lucide-react";

const rows = [
  { feature: "Contextual AI rewriting (not keyword flags)", us: "yes", teal: "no", resumeio: "no", zety: "no" },
  { feature: "ATS simulation by named platform (Workday, Greenhouse)", us: "yes", teal: "no", resumeio: "no", zety: "no" },
  { feature: "Multi-job batch tailoring + version diff", us: "yes", teal: "no", resumeio: "no", zety: "no" },
  { feature: "Matching cover letter from same JD analysis", us: "yes", teal: "partial", resumeio: "no", zety: "no" },
  { feature: "Interview prep questions from JD", us: "yes", teal: "no", resumeio: "no", zety: "no" },
  { feature: "Fit score (gap classification, not just keyword %)", us: "yes", teal: "no", resumeio: "no", zety: "no" },
  { feature: "Full PDF download on free plan", us: "yes", teal: "yes", resumeio: "no", zety: "no" },
  { feature: "Transparent billing (no deceptive trial)", us: "yes", teal: "yes", resumeio: "no", zety: "no" },
  { feature: "ATS keyword gap analysis", us: "yes", teal: "yes", resumeio: "partial", zety: "no" },
  { feature: "Resume builder with AI bullets", us: "yes", teal: "yes", resumeio: "partial", zety: "yes" },
  { feature: "20+ templates", us: "yes", teal: "yes", resumeio: "yes", zety: "yes" },
  { feature: "Word export", us: "yes", teal: "no", resumeio: "partial", zety: "yes" },
];

function Cell({ value }: { value: string }) {
  if (value === "yes") return (
    <div className="flex justify-center">
      <div className="w-7 h-7 rounded-full bg-[#1A28C1]/8 border border-[#1A28C1]/20 flex items-center justify-center">
        <CheckCircle className="w-4 h-4 text-[#1A28C1]" />
      </div>
    </div>
  );
  if (value === "no") return (
    <div className="flex justify-center">
      <div className="w-7 h-7 rounded-full bg-[#F0F0FB] border border-[#E0E0F4] flex items-center justify-center">
        <XCircle className="w-4 h-4 text-slate-300" />
      </div>
    </div>
  );
  return (
    <div className="flex justify-center">
      <div className="w-7 h-7 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
        <MinusCircle className="w-4 h-4 text-amber-500" />
      </div>
    </div>
  );
}

export function ComparisonSection() {
  return (
    <section className="bg-[#F5F5FE] border-t border-[#D8D8F0]">
      <div className="max-w-5xl mx-auto px-6 lg:px-12 py-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px w-8 bg-[#1A28C1]" />
            <span className="text-[#1A28C1] text-xs font-semibold tracking-[0.2em] uppercase">Honest comparison</span>
          </div>
          <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-end">
            <h2
              className="font-black leading-[1.0] tracking-[-0.03em] text-[#0F1235]"
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
            >
              Head-to-head vs.
              <br />
              <span style={{
                background: "linear-gradient(135deg, #4D5EDB, #1A28C1)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>Teal, Resume.io, Zety.</span>
            </h2>
            <p className="text-slate-500 text-base leading-relaxed">
              We compared every feature. First 6 rows are things only we do.
              The results aren&apos;t close.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="overflow-x-auto"
        >
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left pb-4 pr-6 text-xs font-semibold text-slate-400 uppercase tracking-widest w-[40%]">Feature</th>
                <th className="pb-4 px-3 text-center w-[15%]">
                  <div className="inline-flex flex-col items-center gap-1.5">
                    <div className="w-9 h-9 rounded-xl bg-[#1A28C1] flex items-center justify-center">
                      <span className="text-white text-xs font-bold">R</span>
                    </div>
                    <span className="text-xs font-bold text-[#1A28C1]">ResumeEvy</span>
                  </div>
                </th>
                <th className="pb-4 px-3 text-center w-[15%]">
                  <div className="inline-flex flex-col items-center gap-1.5">
                    <div className="w-9 h-9 rounded-xl bg-[#F0F0FB] border border-[#D8D8F0] flex items-center justify-center">
                      <span className="text-slate-400 text-xs font-bold">T</span>
                    </div>
                    <span className="text-xs text-slate-400">Teal</span>
                  </div>
                </th>
                <th className="pb-4 px-3 text-center w-[15%]">
                  <div className="inline-flex flex-col items-center gap-1.5">
                    <div className="w-9 h-9 rounded-xl bg-[#F0F0FB] border border-[#D8D8F0] flex items-center justify-center">
                      <span className="text-slate-400 text-xs font-bold">R</span>
                    </div>
                    <span className="text-xs text-slate-400">Resume.io</span>
                  </div>
                </th>
                <th className="pb-4 px-3 text-center w-[15%]">
                  <div className="inline-flex flex-col items-center gap-1.5">
                    <div className="w-9 h-9 rounded-xl bg-[#F0F0FB] border border-[#D8D8F0] flex items-center justify-center">
                      <span className="text-slate-400 text-xs font-bold">Z</span>
                    </div>
                    <span className="text-xs text-slate-400">Zety</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <motion.tr
                  key={row.feature}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className={`border-t border-[#D8D8F0] ${i < 6 ? "bg-[#1A28C1]/[0.015]" : ""}`}
                >
                  <td className="py-3.5 pr-6">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-600">{row.feature}</span>
                      {i < 6 && (
                        <span className="text-[9px] font-semibold px-2 py-0.5 bg-[#1A28C1]/8 border border-[#1A28C1]/20 text-[#1A28C1] rounded whitespace-nowrap">Only us</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-3"><Cell value={row.us} /></td>
                  <td className="py-3.5 px-3"><Cell value={row.teal} /></td>
                  <td className="py-3.5 px-3"><Cell value={row.resumeio} /></td>
                  <td className="py-3.5 px-3"><Cell value={row.zety} /></td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center gap-6 mt-6 pt-4 border-t border-[#D8D8F0]">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <CheckCircle className="w-3.5 h-3.5 text-[#1A28C1]" /> Yes / Included
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <MinusCircle className="w-3.5 h-3.5 text-amber-500" /> Partial
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <XCircle className="w-3.5 h-3.5 text-slate-300" /> Not available
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
