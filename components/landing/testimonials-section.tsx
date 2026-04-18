"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const featured = {
  name: "Marcus Johnson",
  role: "Product Manager",
  company: "Hired at Stripe",
  avatar: "MJ",
  avatarBg: "#1A28C1",
  quote: "Three months. Zero responses. One tailored resume from ResumeEvy. Six interviews in two weeks.",
  detail: "The cover letter it generated matched my resume perfectly — same language, same narrative. For the first time in months, every application felt coherent.",
  stars: 5,
};

const rest = [
  {
    name: "Sarah Chen",
    role: "Software Engineer → Google",
    avatar: "SC",
    avatarBg: "#3B82F6",
    content: "ResumeEvy actually rewrote my resume. My ATS score went from 54 to 93. Got calls from 4 FAANG companies in one week.",
    stars: 5,
  },
  {
    name: "Priya Patel",
    role: "Data Scientist → Netflix",
    avatar: "PP",
    avatarBg: "#A855F7",
    content: "The ATS simulation is a game-changer. I could see exactly how Workday parsed my resume — and fix it before applying. Dream job in 3 weeks.",
    stars: 5,
  },
  {
    name: "Alex Rivera",
    role: "DevOps Engineer → AWS",
    avatar: "AR",
    avatarBg: "#F59E0B",
    content: "Batch tailoring changed everything. Applied to 12 jobs in one afternoon — each with a perfectly tailored resume. Used to take me a full day.",
    stars: 5,
  },
  {
    name: "Emily Watson",
    role: "UX Designer → Airbnb",
    avatar: "EW",
    avatarBg: "#EC4899",
    content: "Interview prep predicted 4 out of 5 questions I was actually asked. I walked in knowing exactly what they were going to ask.",
    stars: 5,
  },
  {
    name: "James Park",
    role: "Backend Engineer → Uber",
    avatar: "JP",
    avatarBg: "#10B981",
    content: "Tried Resume.io and Teal — both gave me a to-do list. ResumeEvy actually fixed it. The before/after diff was incredible.",
    stars: 5,
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="bg-[#F5F5FE] border-t border-[#D8D8F0]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-28">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="flex items-start justify-between flex-wrap gap-8">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-8 bg-[#1A28C1]" />
                <span className="text-[#1A28C1] text-xs font-semibold tracking-[0.2em] uppercase">10,000+ users hired</span>
              </div>
              <h2
                className="font-black leading-[1.0] tracking-[-0.03em] text-[#0F1235]"
                style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
              >
                What users say
                <br />
                after{" "}
                <span style={{
                  background: "linear-gradient(135deg, #4D5EDB, #1A28C1)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>getting hired.</span>
              </h2>
            </div>
            <div className="flex gap-10 pt-4">
              {[
                { value: "3.2×", label: "more interviews" },
                { value: "+47%", label: "avg ATS boost" },
                { value: "8s", label: "to tailor" },
              ].map(({ value, label }) => (
                <div key={label} className="text-right">
                  <div className="text-3xl font-black text-[#0F1235]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{value}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Featured testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl border border-[#C5C5E8] p-8 md:p-12 mb-6 relative overflow-hidden shadow-[0_4px_24px_rgba(26,40,193,0.06)]"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#1A28C1]/4 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative">
            <Stars count={featured.stars} />
            <blockquote
              className="font-black leading-[1.15] tracking-tight text-[#0F1235] mt-6 mb-4 max-w-4xl"
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(1.5rem, 3.5vw, 2.5rem)" }}
            >
              &ldquo;{featured.quote}&rdquo;
            </blockquote>
            <p className="text-slate-500 text-base leading-relaxed mb-8 max-w-2xl">
              {featured.detail}
            </p>
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: featured.avatarBg }}
              >
                {featured.avatar}
              </div>
              <div>
                <div className="text-[#0F1235] font-semibold text-sm">{featured.name}</div>
                <div className="text-slate-500 text-xs">{featured.role}</div>
                <div className="text-[#1A28C1] text-xs font-semibold">{featured.company}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Remaining testimonials */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rest.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-white border border-[#C5C5E8] hover:border-[#1A28C1]/25 rounded-xl p-6 transition-all duration-300 cursor-default shadow-[0_2px_12px_rgba(26,40,193,0.04)]"
            >
              <Stars count={t.stars} />
              <p className="text-slate-500 text-sm leading-relaxed mt-4 mb-5">
                &ldquo;{t.content}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-[#E8E8F8]">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: t.avatarBg }}
                >
                  {t.avatar}
                </div>
                <div>
                  <div className="text-slate-700 font-semibold text-sm">{t.name}</div>
                  <div className="text-[#1A28C1] text-xs">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
