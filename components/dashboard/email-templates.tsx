"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Sparkles, Copy, Check, Loader2,
  Briefcase, Building2, User, ChevronDown,
} from "lucide-react";
import { toast } from "@/components/ui/toaster";

const TEMPLATE_TYPES = [
  { value: "follow_up",         label: "Follow-Up After Application",    emoji: "📩", timing: "7–10 days after applying" },
  { value: "thank_you",         label: "Thank You After Interview",       emoji: "🙏", timing: "Within 24 hours of interview" },
  { value: "cold_outreach",     label: "Cold Outreach to Hiring Manager", emoji: "🎯", timing: "Before applying" },
  { value: "offer_negotiation", label: "Salary Negotiation",             emoji: "💰", timing: "After receiving offer" },
  { value: "withdrawal",        label: "Withdraw Application",           emoji: "✋", timing: "If you accept another offer" },
] as const;

type TemplateType = typeof TEMPLATE_TYPES[number]["value"];

interface Props {
  defaultJobTitle?: string;
  defaultCompany?: string;
  userName?: string;
}

export function EmailTemplates({ defaultJobTitle = "", defaultCompany = "", userName = "Your Name" }: Props) {
  const [jobTitle, setJobTitle] = useState(defaultJobTitle);
  const [company, setCompany] = useState(defaultCompany);
  const [context, setContext] = useState("");
  const [selectedType, setSelectedType] = useState<TemplateType>("follow_up");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ subject: string; body: string; label: string; timing: string } | null>(null);
  const [copied, setCopied] = useState<"subject" | "body" | "all" | null>(null);

  const generate = async () => {
    if (!jobTitle.trim() || !company.trim()) {
      toast.error("Enter job title and company first");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/email-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: selectedType, jobTitle, company, userName, context }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate email");
    } finally {
      setLoading(false);
    }
  };

  const copy = (type: "subject" | "body" | "all") => {
    if (!result) return;
    const text = type === "subject" ? result.subject
      : type === "body" ? result.body
      : `Subject: ${result.subject}\n\n${result.body}`;
    navigator.clipboard.writeText(text);
    setCopied(type);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-700 to-brand-500 flex items-center justify-center">
            <Mail className="w-5 h-5 text-white" />
          </div>
          Email Templates
        </h1>
        <p className="text-slate-500 mt-1 ml-14 text-sm">AI-generated professional emails for every stage of your job search</p>
      </div>

      {/* Form */}
      <div className="glass-card rounded-2xl p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Job Title *</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Software Engineer"
                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Company *</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Google"
                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
              />
            </div>
          </div>
        </div>

        {/* Template type selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Email Type</label>
          <div className="grid sm:grid-cols-2 gap-2">
            {TEMPLATE_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setSelectedType(t.value)}
                className={`text-left p-3 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedType === t.value
                    ? "border-brand-500 bg-brand-50"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{t.emoji}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{t.label}</p>
                    <p className="text-xs text-slate-400">{t.timing}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Optional context */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            Extra context <span className="normal-case font-normal">(optional)</span>
          </label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={2}
            placeholder="e.g. Interviewed with Sarah (Engineering Manager), discussed React experience..."
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 resize-none"
          />
        </div>

        <button
          onClick={generate}
          disabled={loading || !jobTitle.trim() || !company.trim()}
          className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-brand-700 to-brand-500 text-white font-semibold rounded-xl hover:shadow-glow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? "Generating…" : "Generate Email"}
        </button>
      </div>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900">{result.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{result.timing}</p>
              </div>
              <button
                onClick={() => copy("all")}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                {copied === "all" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                Copy All
              </button>
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Subject</label>
                <button onClick={() => copy("subject")} className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1 cursor-pointer">
                  {copied === "subject" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy
                </button>
              </div>
              <div className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium">
                {result.subject}
              </div>
            </div>

            {/* Body */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Email Body</label>
                <button onClick={() => copy("body")} className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1 cursor-pointer">
                  {copied === "body" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy
                </button>
              </div>
              <div className="px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {result.body}
              </div>
            </div>

            <button
              onClick={generate}
              className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 font-medium cursor-pointer"
            >
              <Sparkles className="w-3 h-3" /> Regenerate
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
