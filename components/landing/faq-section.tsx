"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "How is ResumeEvy different from Teal or Resume.io?",
    a: "Teal and Resume.io identify missing keywords and show you a to-do list. ResumeEvy actually rewrites your resume — bullets, summary, and skills — to contextually match the job description's language and priorities. We also simulate how real ATS platforms (Workday, Greenhouse, Lever, Taleo) parse your resume, not just a generic keyword score.",
  },
  {
    q: "How does the AI tailoring work?",
    a: "You upload your resume and paste a job description. Our Gemini-powered AI analyzes the job requirements, identifies missing keywords and skills, then rewrites relevant sections of your resume to naturally incorporate what the employer is looking for. It maintains your authentic voice and never fabricates experience.",
  },
  {
    q: "Will the tailored resume sound like it was written by AI?",
    a: "No. We specifically train our prompts to avoid generic AI-sounding language. The AI improves your existing bullet points rather than replacing them with boilerplate text. The result sounds like you — but more precise and impactful.",
  },
  {
    q: "Is there a free trial on paid plans?",
    a: "Yes — Monthly gets a 3-day free trial and Yearly gets a 7-day free trial. Your card is required upfront but you won't be charged until the trial ends. Cancel any time during the trial from your dashboard at no cost. Lifetime is a one-time payment with no trial needed.",
  },
  {
    q: "What ATS platforms do you simulate?",
    a: "We simulate Workday, Greenhouse, Lever, and Taleo — the four most widely deployed ATS systems in enterprise hiring. Each has different parsing behavior for multi-column layouts, section headers, and contact information. We test your resume against all four and show you a parse-fidelity report.",
  },
  {
    q: "What's included in the free plan?",
    a: "3 complete AI resume tailors, full PDF download (not TXT-only like Resume.io and Zety), ATS score check, and 5 ATS-verified templates. It's enough to apply to 3 jobs with a fully tailored resume before deciding to upgrade.",
  },
  {
    q: "Can I create multiple resume profiles?",
    a: "Yes. Free users get 1 profile. Pro (Monthly/Yearly) and Lifetime users get unlimited profiles. This lets you maintain separate resumes for different career paths — useful when applying for roles across different tracks like engineering and management.",
  },
  {
    q: "Is my data private and secure?",
    a: "Your resume data is encrypted at rest and in transit. We never share your data with third parties or use it to train AI models. Files are stored securely in Cloudflare R2 with isolated storage per user.",
  },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-[#F5F5FE] border-t border-[#D8D8F0]">
      <div className="max-w-3xl mx-auto px-6 lg:px-12 py-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px w-8 bg-[#1A28C1]" />
            <span className="text-[#1A28C1] text-xs font-semibold tracking-[0.2em] uppercase">FAQ</span>
          </div>
          <h2
            className="font-black leading-[1.0] tracking-[-0.03em] text-[#0F1235]"
            style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
          >
            Questions?
            <br />
            <span style={{
              background: "linear-gradient(135deg, #4D5EDB, #1A28C1)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>Answered.</span>
          </h2>
        </motion.div>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={`bg-white rounded-xl overflow-hidden border transition-colors duration-200 shadow-[0_2px_8px_rgba(26,40,193,0.04)] ${
                open === i ? "border-[#1A28C1]/25" : "border-[#C5C5E8]"
              }`}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left cursor-pointer hover:bg-[#F5F5FE]/60 transition-colors duration-200"
              >
                <span className="font-semibold text-slate-700 pr-4 text-sm leading-relaxed">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${
                    open === i ? "rotate-180 text-[#1A28C1]" : "text-slate-400"
                  }`}
                />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 text-slate-500 leading-relaxed text-sm border-t border-[#E8E8F8] pt-4">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
