"use client";

import { motion } from "framer-motion";

const companies = [
  "Google", "Meta", "Amazon", "Apple", "Microsoft",
  "Netflix", "Stripe", "Airbnb", "Uber", "Figma",
  "Shopify", "Salesforce", "Adobe", "LinkedIn", "OpenAI",
];

export function LogoCloud() {
  return (
    <section className="relative py-14 px-6 bg-[#F5F5FE] border-y border-[#D8D8F0]">
      <div className="max-w-7xl mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-[10px] font-semibold text-slate-400 uppercase tracking-[0.25em] mb-8"
        >
          Users hired at
        </motion.p>

        <div className="relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#F5F5FE] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#F5F5FE] to-transparent z-10 pointer-events-none" />
          <div className="flex gap-14 animate-scroll whitespace-nowrap">
            {[...companies, ...companies].map((company, i) => (
              <span
                key={i}
                className="inline-flex items-center text-[#C5C5E8] hover:text-[#1A28C1] font-bold text-sm tracking-widest transition-colors duration-300 cursor-default flex-shrink-0 uppercase"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {company}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
