"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

const keywords = [
  { word: "React", found: true },
  { word: "TypeScript", found: true },
  { word: "Node.js", found: true },
  { word: "Docker", found: false },
  { word: "Kubernetes", found: false },
  { word: "CI/CD", found: false },
  { word: "REST API", found: true },
  { word: "GraphQL", found: false },
  { word: "PostgreSQL", found: true },
  { word: "Agile", found: false },
  { word: "AWS", found: false },
  { word: "Testing", found: true },
];

const sectionScores = [
  { section: "Summary", score: 85, status: "good" },
  { section: "Experience", score: 72, status: "good" },
  { section: "Skills", score: 48, status: "warn" },
  { section: "Education", score: 90, status: "good" },
  { section: "Keywords", score: 38, status: "bad" },
];

const atsTargets = ["Workday", "Greenhouse", "Lever", "Taleo"];

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = value;
    const duration = 1500;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start = Math.min(start + step, end);
      setDisplay(Math.round(start));
      if (start >= end) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, value]);

  return <span ref={ref}>{display}</span>;
}

export function ATSSection() {
  return (
    <section className="bg-[#EDEDFC] border-t border-[#D8D8F0]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-28">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — Copy */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-8 bg-[#1A28C1]" />
              <span className="text-[#1A28C1] text-xs font-semibold tracking-[0.2em] uppercase">Real ATS simulation — not just a score</span>
            </div>
            <h2
              className="font-black leading-[1.05] tracking-[-0.03em] text-[#0F1235] mb-6"
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(2.2rem, 4.5vw, 3.5rem)" }}
            >
              Beat ATS filters
              <br />
              <span style={{
                background: "linear-gradient(135deg, #4D5EDB, #1A28C1)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>every time.</span>
            </h2>
            <p className="text-slate-500 text-base leading-relaxed mb-8 border-l-2 border-[#C5C5E8] pl-4">
              75% of resumes are rejected before a human sees them. While Teal and Resume.io give you a generic keyword score,
              we simulate how <span className="text-slate-700 font-medium">real ATS platforms actually parse your resume</span> — Workday, Greenhouse, Lever, and Taleo.
            </p>

            <div className="flex flex-wrap gap-2 mb-8">
              {atsTargets.map((ats) => (
                <div key={ats} className="flex items-center gap-2 px-3 py-2 bg-[#1A28C1]/5 border border-[#1A28C1]/15 rounded-lg text-xs font-medium text-[#1A28C1]">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {ats}
                </div>
              ))}
            </div>

            <div className="space-y-4">
              {[
                { icon: CheckCircle, text: "Section-by-section ATS breakdown", ok: true },
                { icon: AlertCircle, text: "Missing keyword identification & contextual fix", ok: false },
                { icon: CheckCircle, text: "Parse-fidelity report — see what ATS actually reads", ok: true },
                { icon: CheckCircle, text: "Format compatibility check per platform", ok: true },
                { icon: CheckCircle, text: "Deal-breaker vs. nice-to-have gap classification", ok: true },
              ].map(({ icon: Icon, text, ok }) => (
                <div key={text} className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${ok ? "text-[#10B981]" : "text-amber-500"}`} />
                  <span className="text-slate-600 text-sm">{text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — Dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="bg-white rounded-xl border border-[#C5C5E8] overflow-hidden shadow-[0_4px_24px_rgba(26,40,193,0.08)]">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[#E8E8F8] bg-[#F0F0FB]">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                <span className="ml-2 text-[10px] font-mono text-slate-400">ats-simulation.engine</span>
                <span className="ml-auto text-[10px] font-mono text-[#10B981]">● running</span>
              </div>

              <div className="p-5 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">// overall ats score</div>
                    <div className="text-5xl font-black text-[#0F1235]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      <AnimatedNumber value={87} />
                      <span className="text-[#D8D8F0] text-2xl">/100</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#10B981]/8 border border-[#10B981]/20 text-[#10B981] text-xs font-medium rounded mb-2">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Excellent
                    </div>
                    <div className="text-[10px] text-slate-400">After AI optimization</div>
                  </div>
                </div>

                <div className="h-1.5 bg-[#EDEDFC] rounded-full overflow-hidden border border-[#E0E0F4]">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "87%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                    className="h-full bg-[#1A28C1] rounded-full"
                  />
                </div>

                <div className="space-y-3">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">// section breakdown</div>
                  {sectionScores.map((s, i) => (
                    <motion.div
                      key={s.section}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="text-[10px] text-slate-500 w-20 flex-shrink-0">{s.section}</div>
                      <div className="flex-1 h-1.5 bg-[#EDEDFC] rounded-full overflow-hidden border border-[#E0E0F4]">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${s.score}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                          className={`h-full rounded-full ${
                            s.status === "good" ? "bg-[#1A28C1]"
                            : s.status === "warn" ? "bg-amber-400"
                            : "bg-red-400"
                          }`}
                        />
                      </div>
                      <div className="text-[10px] text-slate-500 w-8 text-right font-mono">{s.score}%</div>
                    </motion.div>
                  ))}
                </div>

                <div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-3">// keyword analysis</div>
                  <div className="flex flex-wrap gap-1.5">
                    {keywords.map((kw, i) => (
                      <motion.span
                        key={kw.word}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                        className={`px-2 py-1 rounded text-[10px] font-medium flex items-center gap-1 ${
                          kw.found
                            ? "bg-[#1A28C1]/8 text-[#1A28C1] border border-[#1A28C1]/20"
                            : "bg-[#F0F0FB] text-slate-400 border border-[#E0E0F4]"
                        }`}
                      >
                        {kw.found ? <CheckCircle className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                        {kw.word}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
