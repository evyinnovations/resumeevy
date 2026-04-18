"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CheckCircle, Upload, Wand2, Download } from "lucide-react";

function Step1Visual() {
  return (
    <div className="bg-white rounded-xl border border-[#C5C5E8] overflow-hidden shadow-[0_4px_20px_rgba(26,40,193,0.06)]">
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[#E8E8F8] bg-[#F0F0FB]">
        <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
        <span className="ml-2 text-[10px] font-mono text-slate-400">resume_parser.ai</span>
      </div>
      <div className="p-4 space-y-3">
        <div className="border-2 border-dashed border-[#C5C5E8] rounded-lg p-4 text-center bg-[#F5F5FE]">
          <Upload className="w-5 h-5 text-[#1A28C1] mx-auto mb-1.5" />
          <div className="text-xs font-medium text-slate-700">resume.pdf</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Parsing complete</div>
        </div>
        <div className="space-y-1.5">
          {["Experience — 4 roles extracted", "Skills — 18 detected", "Education — 2 degrees"].map((item) => (
            <div key={item} className="flex items-center gap-2 px-2.5 py-1.5 bg-[#F5F5FE] rounded-lg border border-[#E0E0F4]">
              <CheckCircle className="w-3 h-3 text-[#10B981] flex-shrink-0" />
              <span className="text-[10px] text-slate-500">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step2Visual() {
  return (
    <div className="bg-white rounded-xl border border-[#C5C5E8] overflow-hidden shadow-[0_4px_20px_rgba(26,40,193,0.06)]">
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[#E8E8F8] bg-[#F0F0FB]">
        <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
        <span className="ml-2 text-[10px] font-mono text-slate-400">jd_analysis.ai</span>
      </div>
      <div className="p-4 space-y-3">
        <div className="bg-[#F5F5FE] rounded-lg p-3 border border-[#E0E0F4]">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">// job description</div>
          <div className="space-y-1">
            <div className="h-1.5 bg-[#E0E0F4] rounded w-full" />
            <div className="h-1.5 bg-[#E0E0F4] rounded w-5/6" />
            <div className="h-1.5 bg-[#E0E0F4] rounded w-4/5" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#1A28C1]/5 rounded-lg border border-[#1A28C1]/15">
            <span className="text-[10px] text-[#1A28C1]">must-have skills</span>
            <span className="text-[10px] font-bold text-[#1A28C1]">12 found</span>
          </div>
          <div className="flex items-center justify-between px-2.5 py-1.5 bg-amber-50 rounded-lg border border-amber-200">
            <span className="text-[10px] text-amber-600">keyword gaps</span>
            <span className="text-[10px] font-bold text-amber-600">5 fixing</span>
          </div>
          <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#F5F5FE] rounded-lg border border-[#E0E0F4]">
            <span className="text-[10px] text-slate-500">ats match score</span>
            <span className="text-[10px] font-bold text-[#10B981]">52% → 91%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step3Visual() {
  return (
    <div className="bg-white rounded-xl border border-[#C5C5E8] overflow-hidden shadow-[0_4px_20px_rgba(26,40,193,0.06)]">
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[#E8E8F8] bg-[#F0F0FB]">
        <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
        <span className="ml-2 text-[10px] font-mono text-slate-400">download.ai</span>
      </div>
      <div className="p-4 space-y-2">
        {[
          { label: "Tailored Resume", badge: "91% ATS", color: "#10B981" },
          { label: "Cover Letter", badge: "Matched", color: "#1A28C1" },
          { label: "Interview Prep", badge: "8 questions", color: "#A855F7" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2.5 px-3 py-2.5 border border-[#E0E0F4] rounded-lg bg-[#F5F5FE]">
            <div className="w-1 h-6 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-xs font-medium text-slate-700 flex-1">{item.label}</span>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded border" style={{ color: item.color, borderColor: item.color + "40", backgroundColor: item.color + "10" }}>{item.badge}</span>
          </div>
        ))}
        <div className="mt-2 w-full py-2.5 bg-[#1A28C1] rounded-lg text-center">
          <span className="text-white text-xs font-semibold">Download all — PDF & Word</span>
        </div>
      </div>
    </div>
  );
}

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload your resume",
    tagline: "Or build from scratch in 4 minutes.",
    body: "PDF or Word. We parse it instantly — AI extracts experience, quantified bullets, and skills into a structured profile that becomes the foundation for every tailored version.",
    bullets: ["PDF & Word supported", "AI parsing — instant structured output", "Build from scratch with our guided editor"],
    Visual: Step1Visual,
  },
  {
    number: "02",
    icon: Wand2,
    title: "Paste a job description",
    tagline: "Any job board. Any format.",
    body: "Copy and paste any job posting — LinkedIn, Indeed, company careers page, anywhere. AI extracts must-have skills, identifies keyword gaps, and rewrites your resume to match the JD's language.",
    bullets: ["Works with any job board", "Extracts must-have vs. nice-to-have", "Identifies deal-breaker gaps"],
    Visual: Step2Visual,
  },
  {
    number: "03",
    icon: Download,
    title: "Download. Apply. Get hired.",
    tagline: "Eight seconds from paste to finished.",
    body: "In under 10 seconds: a fully tailored resume, a matching cover letter, and interview prep questions. All three generated from the same job description analysis. Download and apply with confidence.",
    bullets: ["Tailored resume + cover letter", "ATS score guaranteed 80+", "Interview prep included"],
    Visual: Step3Visual,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-[#EDEDFC]">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-28 pb-16 border-t border-[#D8D8F0]">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px w-8 bg-[#1A28C1]" />
            <span className="text-[#1A28C1] text-xs font-semibold tracking-[0.2em] uppercase">How it works</span>
          </div>
          <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-end">
            <h2
              className="font-black leading-[1.0] tracking-[-0.03em] text-[#0F1235]"
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
            >
              From resume to
              <br />
              interview-ready.
              <br />
              <span style={{
                background: "linear-gradient(135deg, #4D5EDB, #1A28C1)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>Three steps.</span>
            </h2>
            <p className="text-slate-500 text-base leading-relaxed">
              No setup, no templates to pick first, no hours of manual editing.
              Upload, paste, download. That&apos;s the entire product.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Steps */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.65, delay: 0.05 }}
              className={`grid lg:grid-cols-2 gap-12 xl:gap-20 items-center py-20 border-t border-[#D8D8F0] ${
                i === steps.length - 1 ? "border-b" : ""
              }`}
            >
              {/* Copy */}
              <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                <div className="flex items-start gap-5 mb-6">
                  <span className="text-[6rem] font-black leading-none tracking-tighter select-none flex-shrink-0 text-[#E0E0F4]"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {step.number}
                  </span>
                  <div className="pt-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1A28C1]/8 border border-[#1A28C1]/15 flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5 text-[#1A28C1]" />
                    </div>
                    <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#1A28C1]">
                      Step {step.number}
                    </div>
                  </div>
                </div>

                <h3
                  className="font-black leading-[1.05] tracking-[-0.02em] text-[#0F1235] mb-2"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)" }}
                >
                  {step.title}
                </h3>
                <div className="text-slate-400 text-sm italic mb-5">{step.tagline}</div>
                <p className="text-slate-500 text-base leading-relaxed mb-7 max-w-[460px] border-l-2 border-[#C5C5E8] pl-4">
                  {step.body}
                </p>
                <ul className="space-y-2.5">
                  {step.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2.5">
                      <CheckCircle className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                      <span className="text-sm text-slate-600">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual */}
              <motion.div
                className={`${i % 2 === 1 ? "lg:order-1" : ""} flex items-center justify-center`}
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="w-full max-w-sm">
                  <step.Visual />
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* CTA strip */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="border border-[#C5C5E8] rounded-2xl px-8 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-white shadow-[0_4px_24px_rgba(26,40,193,0.06)]"
        >
          <div>
            <div className="text-xl font-bold text-[#0F1235] mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Ready to try it?
            </div>
            <div className="text-slate-500 text-sm">3 free AI tailors · Full PDF download · No credit card</div>
          </div>
          <Link
            href="/register"
            className="group inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#1A28C1] hover:bg-[#1520A0] text-white font-semibold text-sm rounded-xl transition-all duration-200 cursor-pointer flex-shrink-0 shadow-lg shadow-[#1A28C1]/15"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Start Free Trial
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
