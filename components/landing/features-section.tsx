"use client";

import { motion } from "framer-motion";
import {
  Brain, Target, Layers, Mail, MessageSquare,
  FileText, GitBranch, Download, Shield, CheckCircle, XCircle,
} from "lucide-react";

function RewriteVisual() {
  return (
    <div className="bg-white rounded-xl border border-[#C5C5E8] overflow-hidden shadow-[0_4px_20px_rgba(26,40,193,0.06)]">
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[#E8E8F8] bg-[#F0F0FB]">
        <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
        <span className="ml-2 text-[10px] font-mono text-slate-400">rewrite.engine</span>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <div className="text-[9px] font-mono text-slate-400 mb-1.5 uppercase tracking-wider">// before</div>
          <div className="bg-[#F5F5FE] rounded-lg p-3 border border-[#E0E0F4]">
            <p className="text-xs text-slate-400 leading-relaxed line-through decoration-red-400/50">
              &ldquo;Worked on various features using React and helped fix bugs.&rdquo;
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-[#E0E0F4]" />
          <span className="text-[9px] font-mono text-[#1A28C1] px-2 py-0.5 border border-[#1A28C1]/20 rounded-full bg-[#1A28C1]/5">ResumeEvy AI ↓</span>
          <div className="flex-1 h-px bg-[#E0E0F4]" />
        </div>
        <div>
          <div className="text-[9px] font-mono text-[#1A28C1] mb-1.5 uppercase tracking-wider">// after</div>
          <div className="bg-[#F5F5FE] rounded-lg p-3 border border-[#1A28C1]/15">
            <p className="text-xs text-slate-700 leading-relaxed">
              &ldquo;Shipped 14 React/TypeScript features, reducing bug backlog 40% and improving Core Web Vitals 62→94.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ATSVisual() {
  const platforms = [
    { name: "Workday", score: 94, width: "94%" },
    { name: "Greenhouse", score: 89, width: "89%" },
    { name: "Lever", score: 91, width: "91%" },
    { name: "Taleo", score: 87, width: "87%" },
  ];
  return (
    <div className="bg-white rounded-xl border border-[#C5C5E8] overflow-hidden shadow-[0_4px_20px_rgba(26,40,193,0.06)]">
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[#E8E8F8] bg-[#F0F0FB]">
        <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
        <span className="ml-2 text-[10px] font-mono text-slate-400">ats-simulation.engine</span>
      </div>
      <div className="p-4 space-y-4">
        {platforms.map((p, i) => (
          <motion.div key={p.name}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 + 0.2 }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-mono text-slate-500">{p.name}</span>
              <span className="text-xs font-bold font-mono text-[#10B981]">{p.score}%</span>
            </div>
            <div className="h-1.5 bg-[#EDEDFC] rounded-full overflow-hidden border border-[#E0E0F4]">
              <motion.div
                className="h-full bg-[#1A28C1] rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: p.width }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: i * 0.1 + 0.4, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        ))}
        <div className="pt-2 border-t border-[#E8E8F8] flex items-center gap-2">
          <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />
          <span className="text-[10px] font-mono text-[#10B981]">All 4 platforms: ready to apply</span>
        </div>
      </div>
    </div>
  );
}

function BatchVisual() {
  const jobs = [
    { title: "Sr. FE Engineer", company: "Stripe", match: 94, status: "done" },
    { title: "Staff Engineer", company: "Linear", match: 88, status: "done" },
    { title: "Principal Dev", company: "Vercel", match: 91, status: "done" },
    { title: "Tech Lead", company: "Notion", status: "processing" },
    { title: "Eng Manager", company: "Figma", status: "queued" },
  ] as const;
  return (
    <div className="bg-white rounded-xl border border-[#C5C5E8] overflow-hidden shadow-[0_4px_20px_rgba(26,40,193,0.06)]">
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[#E8E8F8] bg-[#F0F0FB]">
        <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
        <span className="ml-2 text-[10px] font-mono text-slate-400">batch-tailor.engine — 5 jobs</span>
      </div>
      <div className="p-4 space-y-2">
        {jobs.map((job, i) => (
          <motion.div key={job.company}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 + 0.2 }}
            className={`flex items-center justify-between px-3 py-2.5 rounded-lg border ${
              job.status === "done"
                ? "bg-[#1A28C1]/5 border-[#1A28C1]/15"
                : job.status === "processing"
                ? "bg-blue-50 border-blue-200"
                : "bg-[#F5F5FE] border-[#E0E0F4]"
            }`}
          >
            <div>
              <div className="text-xs font-medium text-slate-700">{job.title}</div>
              <div className="text-[10px] text-slate-400">{job.company}</div>
            </div>
            {job.status === "done" && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold font-mono text-[#10B981]">{job.match}%</span>
                <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />
              </div>
            )}
            {job.status === "processing" && (
              <div className="w-3.5 h-3.5 rounded-full border-2 border-[#1A28C1] border-t-transparent animate-spin" />
            )}
            {job.status === "queued" && (
              <span className="text-[9px] font-mono text-slate-400">queued</span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

const showcases = [
  {
    number: "01",
    tag: "EXCLUSIVE",
    headline: "We rewrite it.\nThey just flag it.",
    sub: "Teal, Resume.io, Zety — they show you a list of missing keywords and hand it back. We fix it. ResumeEvy rewrites your bullets, summary, and skills to contextually match the job — in 8 seconds.",
    Visual: RewriteVisual,
    flip: false,
  },
  {
    number: "02",
    tag: "EXCLUSIVE",
    headline: "Four real ATS\nsystems. Not one\ngeneric score.",
    sub: "Workday. Greenhouse. Lever. Taleo. Each parses differently. A multi-column layout that passes Greenhouse fails Taleo's legacy parser. We test against all four, specifically.",
    Visual: ATSVisual,
    flip: true,
  },
  {
    number: "03",
    tag: "EXCLUSIVE",
    headline: "Apply to 5 jobs.\nGet 5 tailored\nresumes.",
    sub: "Paste 5 job descriptions, get 5 fully tailored resumes with a diff view showing exactly what changed per version. One-click download all. Built for how job searching actually works.",
    Visual: BatchVisual,
    flip: false,
  },
];

const standard = [
  { icon: Mail, title: "Matching Cover Letter", desc: "Same JD analysis. Same keywords. One coherent application." },
  { icon: MessageSquare, title: "Interview Prep", desc: "8 predicted questions from the JD after every tailor." },
  { icon: FileText, title: "20+ ATS Templates", desc: "Every template tested against Workday and Greenhouse parsing." },
  { icon: GitBranch, title: "Version Control", desc: "Compare before/after, roll back, track which version went where." },
  { icon: Download, title: "Full PDF on Free Plan", desc: "Not crippled TXT-only like Resume.io and Zety." },
  { icon: Shield, title: "No Deceptive Billing", desc: "No $1.95 trials. Cancel from dashboard — no calls, no emails." },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-[#F5F5FE]">

      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-28 pb-16 border-t border-[#D8D8F0]">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px w-8 bg-[#1A28C1]" />
            <span className="text-[#1A28C1] text-xs font-semibold tracking-[0.2em] uppercase">What competitors refused to build</span>
          </div>
          <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-end">
            <h2
              className="font-black leading-[1.0] tracking-[-0.03em] text-[#0F1235]"
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
            >
              The features that
              <br />
              actually{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #4D5EDB, #1A28C1)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                get you hired.
              </span>
            </h2>
            <p className="text-slate-500 text-base leading-relaxed">
              Built what Teal, Resume.io, and Zety all decided wasn&apos;t worth shipping.
              Three years of competitor research in one product.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Showcases */}
      {showcases.map((s, i) => (
        <div key={s.number} className={i % 2 === 1 ? "bg-[#EDEDFC]" : "bg-[#F5F5FE]"}>
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20 border-t border-[#D8D8F0]">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
              className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center"
            >
              {/* Copy */}
              <div className={s.flip ? "lg:order-2" : ""}>
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-[4.5rem] font-black leading-none tracking-tighter select-none text-[#E0E0F4]"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {s.number}
                  </span>
                  <span className="text-[10px] font-semibold tracking-[0.15em] text-[#1A28C1] border border-[#1A28C1]/20 bg-[#1A28C1]/5 px-2 py-0.5 rounded">
                    {s.tag}
                  </span>
                </div>
                <h3
                  className="font-black leading-[1.05] tracking-[-0.02em] text-[#0F1235] mb-5 whitespace-pre-line"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)" }}
                >
                  {s.headline}
                </h3>
                <p className="text-slate-500 text-base leading-relaxed max-w-[460px] border-l-2 border-[#C5C5E8] pl-4">
                  {s.sub}
                </p>
              </div>

              {/* Visual */}
              <motion.div
                className={`${s.flip ? "lg:order-1" : ""} flex items-center justify-center`}
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                <div className="w-full max-w-sm">
                  <s.Visual />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      ))}

      {/* Standard features */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-16 pb-28 border-t border-[#D8D8F0]">
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-center gap-4 mb-12">
          <div className="h-px flex-1 bg-[#D8D8F0]" />
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em]">Also included</span>
          <div className="h-px flex-1 bg-[#D8D8F0]" />
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8">
          {standard.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div key={f.title} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="flex gap-4 group cursor-default">
                <div className="w-8 h-8 rounded-lg bg-white border border-[#C5C5E8] flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:border-[#1A28C1]/30 transition-colors duration-200">
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-[#1A28C1] transition-colors duration-200" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-700 mb-1">{f.title}</div>
                  <div className="text-sm text-slate-500 leading-relaxed">{f.desc}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
