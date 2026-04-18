"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, LayoutDashboard, FileText, Wand2,
  Palette, Download, CreditCard, Settings, ChevronLeft,
  ChevronRight, User, Briefcase, Mail, X, Menu, Sparkles, ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    section: "Main",
    items: [
      { label: "Dashboard",     href: "/dashboard",        icon: LayoutDashboard },
      { label: "My Resumes",    href: "/resumes",           icon: FileText },
      { label: "Tailor Resume", href: "/tailor",            icon: Wand2,    badge: "AI" },
      { label: "AI Generator",  href: "/builder/generate",  icon: Sparkles, badge: "NEW" },
    ],
  },
  {
    section: "Job Search",
    items: [
      { label: "Job Tracker",     href: "/job-tracker",     icon: Briefcase },
      { label: "Email Templates", href: "/email-templates", icon: Mail,     badge: "AI" },
      { label: "Templates",       href: "/templates",        icon: Palette },
      { label: "Downloads",       href: "/downloads",        icon: Download },
    ],
  },
  {
    section: "Account",
    items: [
      { label: "Billing", href: "/billing", icon: CreditCard },
      { label: "Profile", href: "/profile", icon: User },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function DashboardSidebar({ role }: { role?: string }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className={`flex items-center mb-8 ${collapsed ? "justify-center" : "justify-between"}`}>
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-700 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <span className="font-extrabold text-lg text-slate-900 tracking-tight">ResumeEvy</span>
          )}
        </Link>
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all cursor-pointer hidden lg:flex"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6">
        {navItems.map(({ section, items }) => (
          <div key={section}>
            {!collapsed && (
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em] mb-2 px-3">
                {section}
              </div>
            )}
            <ul className="space-y-0.5">
              {items.map(({ label, href, icon: Icon, badge }) => {
                const isActive = pathname === href || pathname.startsWith(href + "/");
                return (
                  <li key={label}>
                    <Link
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer",
                        collapsed && "justify-center px-3",
                        isActive
                          ? "bg-brand-100 text-brand-700 border border-brand-200"
                          : "text-slate-500 hover:text-brand-700 hover:bg-brand-50"
                      )}
                      title={collapsed ? label : undefined}
                    >
                      <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-brand-700" : "")} />
                      {!collapsed && <span className="flex-1">{label}</span>}
                      {!collapsed && badge && (
                        <span className="px-1.5 py-0.5 bg-brand-100 text-brand-700 text-[10px] font-bold rounded-md border border-brand-200">
                          {badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Admin link */}
      {role === "ADMIN" && (
        <div className="mt-4">
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer",
              collapsed && "justify-center px-3",
              "text-red-500 hover:text-red-600 hover:bg-red-50 border border-red-200 bg-red-50/50"
            )}
            title={collapsed ? "Admin Panel" : undefined}
          >
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span className="flex-1">Admin Panel</span>}
          </Link>
        </div>
      )}

      {/* Upgrade banner */}
      {!collapsed && (
        <div className="mt-6 p-4 rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-purple-50">
          <div className="text-sm font-semibold text-slate-900 mb-1">Upgrade to Pro</div>
          <div className="text-xs text-slate-500 mb-3">Unlimited tailors + all templates</div>
          <Link
            href="/billing"
            className="block w-full text-center py-2 bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Upgrade Now
          </Link>
        </div>
      )}

      {/* Collapse toggle when collapsed */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="mx-auto flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all cursor-pointer mt-4"
          aria-label="Expand sidebar"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-40 border-r border-slate-200 py-6 px-3 overflow-hidden bg-white"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-white border border-slate-200 shadow-sm cursor-pointer transition-all"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-slate-600" />
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-64 z-50 border-r border-slate-200 py-6 px-3 flex flex-col bg-white"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
