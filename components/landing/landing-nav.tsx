"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { LogoMark } from "@/components/shared/logo-mark";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Templates", href: "#templates" },
  { label: "Pricing", href: "#pricing" },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#F5F5FE]/95 backdrop-blur-xl border-b border-[#D8D8F0]"
            : "bg-transparent"
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-[#1A28C1] flex items-center justify-center">
              <LogoMark className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[#0F1235] text-lg tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              ResumeEvy
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-[#1A28C1] rounded-lg transition-colors duration-200 cursor-pointer"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-500 hover:text-[#1A28C1] transition-colors cursor-pointer"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 text-sm font-semibold bg-[#1A28C1] hover:bg-[#1520A0] text-white rounded-lg transition-all duration-200 cursor-pointer shadow-sm shadow-[#1A28C1]/20"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Get Started Free
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:text-[#1A28C1] transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed top-16 left-0 right-0 z-40 bg-[#F5F5FE] border-b border-[#D8D8F0] p-4 md:hidden"
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-sm font-medium text-slate-500 hover:text-[#1A28C1] hover:bg-[#1A28C1]/5 rounded-lg transition-all cursor-pointer"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-3 pt-3 border-t border-[#D8D8F0] flex flex-col gap-2">
                <Link
                  href="/login"
                  className="px-4 py-3 text-sm font-medium text-center text-slate-500 hover:text-[#1A28C1] rounded-lg transition-all cursor-pointer"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-3 text-sm font-semibold text-center bg-[#1A28C1] text-white rounded-lg cursor-pointer"
                >
                  Get Started Free
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
