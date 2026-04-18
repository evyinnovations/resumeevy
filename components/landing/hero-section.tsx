"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center bg-[#F5F5FE] overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-[#1A28C1]/6 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-[#4D5EDB]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(#1A28C1 1px, transparent 1px), linear-gradient(90deg, #1A28C1 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Top status bar */}
      <div className="absolute top-0 left-0 right-0 px-6 lg:px-12 pt-8 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="text-[#10B981] text-xs font-medium tracking-widest uppercase">
            ResumeEvy AI · Live
          </span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="hidden sm:flex items-center gap-6"
        >
          {[
            { v: "+47%", l: "ATS boost" },
            { v: "8s", l: "to tailor" },
            { v: "10K+", l: "hired" },
          ].map(({ v, l }) => (
            <div key={l} className="text-right">
              <div className="text-[#1A28C1] text-sm font-bold">{v}</div>
              <div className="text-slate-400 text-[10px]">{l}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto w-full px-6 lg:px-12 pt-32 pb-20">

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="h-px w-10 bg-[#1A28C1]" />
          <span className="text-[#1A28C1] text-xs font-semibold tracking-[0.2em] uppercase">
            Resume Tailoring, Rebuilt
          </span>
        </motion.div>

        {/* Giant headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="font-black leading-[0.92] tracking-[-0.04em] text-[#0F1235] mb-8"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "clamp(3.5rem, 9vw, 9rem)",
          }}
        >
          Your resume,
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #4D5EDB 0%, #1A28C1 50%, #2D3DD0 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            rewritten.
          </span>
          <br />
          <span className="text-[#D8D8F0]">Every job.</span>
        </motion.h1>

        {/* Sub + CTA row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid lg:grid-cols-2 gap-10 items-end"
        >
          {/* Sub */}
          <div>
            <p className="text-slate-500 text-lg leading-relaxed mb-8 max-w-[480px]">
              Paste any job description. ResumeEvy rewrites your bullets, summary, and skills to match it —
              not a keyword list to fix, a fully rewritten resume. In 8 seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2.5 px-7 py-4 bg-[#1A28C1] hover:bg-[#1520A0] text-white font-semibold text-sm rounded-xl transition-all duration-200 cursor-pointer shadow-lg shadow-[#1A28C1]/20"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1A28C1] text-sm font-medium transition-colors duration-200 cursor-pointer pt-4"
              >
                See how it works →
              </a>
            </div>
          </div>

          {/* Before → After panel */}
          <div className="relative">
            <div className="absolute -inset-px rounded-2xl border border-[#C5C5E8]" />
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(26,40,193,0.06)]">
              {/* Terminal bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#E8E8F8] bg-[#F0F0FB]">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                <span className="ml-3 text-slate-400 text-xs font-mono">ai-tailor.engine</span>
                <span className="ml-auto text-[10px] font-mono text-[#10B981]">● running</span>
              </div>

              <div className="p-5 space-y-4">
                {/* Before */}
                <div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2">// before</div>
                  <div className="bg-[#F5F5FE] rounded-xl p-3 border border-[#E0E0F4]">
                    <p className="text-xs text-slate-400 leading-relaxed line-through decoration-red-400/60">
                      &ldquo;Worked on various features for the web app and helped with bug fixes using React.&rdquo;
                    </p>
                  </div>
                </div>

                {/* Rewrite indicator */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-[#E0E0F4]" />
                  <div className="flex items-center gap-2 px-3 py-1 bg-[#1A28C1]/8 border border-[#1A28C1]/20 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1A28C1] animate-pulse" />
                    <span className="text-[10px] font-mono text-[#1A28C1] font-medium">ResumeEvy rewriting</span>
                  </div>
                  <div className="flex-1 h-px bg-[#E0E0F4]" />
                </div>

                {/* After */}
                <div>
                  <div className="text-[10px] font-mono text-[#1A28C1] uppercase tracking-widest mb-2">// after</div>
                  <div className="bg-[#F5F5FE] rounded-xl p-3 border border-[#1A28C1]/15">
                    <p className="text-xs text-slate-700 leading-relaxed">
                      &ldquo;Shipped 14 React/TypeScript features to production, cutting bug backlog 40% and lifting Core Web Vitals from 62 → 94 over 6 months.&rdquo;
                    </p>
                  </div>
                </div>

                {/* Score row */}
                <div className="flex items-center justify-between pt-2 border-t border-[#E8E8F8]">
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <div className="text-sm font-bold text-slate-400 font-mono">52%</div>
                      <div className="text-[9px] text-slate-400">before</div>
                    </div>
                    <div className="h-px w-8 bg-[#E0E0F4]" />
                    <div className="text-center">
                      <div className="text-sm font-bold text-[#10B981] font-mono">91%</div>
                      <div className="text-[9px] text-[#10B981]/70">ATS score</div>
                    </div>
                  </div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="text-xs font-mono text-[#10B981] bg-[#10B981]/8 border border-[#10B981]/20 rounded-lg px-2.5 py-1"
                  >
                    +39 pts ↑
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Trust chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="flex flex-wrap gap-5 mt-12 pt-10 border-t border-[#D8D8F0]"
        >
          {[
            "3 free tailors",
            "Full PDF download",
            "ATS-verified templates",
            "No deceptive billing",
          ].map((t) => (
            <div key={t} className="flex items-center gap-1.5 text-xs text-slate-500">
              <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />
              {t}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
