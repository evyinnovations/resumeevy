"use client";

import Link from "next/link";
import { Github, Twitter, Linkedin } from "lucide-react";
import { LogoMark } from "@/components/shared/logo-mark";

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Templates", href: "#templates" },
    { label: "Pricing", href: "#pricing" },
    { label: "How It Works", href: "#how-it-works" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

export function LandingFooter() {
  return (
    <footer className="relative border-t border-[#D8D8F0] bg-[#F5F5FE] py-16 px-4">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5 group cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-[#1A28C1] flex items-center justify-center">
                <LogoMark className="w-4 h-4 text-white" />
              </div>
              <span
                className="font-bold text-[#0F1235] text-lg tracking-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                ResumeEvy
              </span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs mb-6">
              The only resume tailor that actually rewrites your resume for each job description —
              not just flags keywords. Get hired faster.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Linkedin, href: "#", label: "LinkedIn" },
                { icon: Github, href: "#", label: "GitHub" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white hover:bg-[#1A28C1]/8 border border-[#D8D8F0] hover:border-[#1A28C1]/25 flex items-center justify-center text-slate-400 hover:text-[#1A28C1] transition-all cursor-pointer"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <div className="font-semibold text-slate-400 text-xs uppercase tracking-widest mb-4">{section}</div>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-slate-500 hover:text-[#1A28C1] text-sm transition-colors cursor-pointer"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-[#D8D8F0] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-400 text-xs">
            &copy; {new Date().getFullYear()} ResumeEvy. All rights reserved.
          </p>
          <p className="text-[#C5C5E8] text-xs">
            Built with Next.js · Tailwind CSS · ResumeEvy AI
          </p>
        </div>
      </div>
    </footer>
  );
}
