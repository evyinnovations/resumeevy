"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Phone, MapPin, Linkedin, Github,
  Briefcase, Sparkles, ChevronRight, ChevronLeft,
  CheckCircle2, Loader2, FileText, Download, ArrowRight,
} from "lucide-react";
import { toast } from "@/components/ui/toaster";
import { useRouter } from "next/navigation";

type ExperienceLevel = "fresher" | "junior" | "mid" | "senior" | "lead";

const LEVELS: { value: ExperienceLevel; label: string; sub: string; bullets: string; color: string }[] = [
  { value: "fresher", label: "Fresher",       sub: "0–1 year",    bullets: "4–5 bullets/role",  color: "from-emerald-500 to-teal-500" },
  { value: "junior",  label: "Junior",         sub: "1–3 years",   bullets: "5–7 bullets/role",  color: "from-sky-500 to-blue-500" },
  { value: "mid",     label: "Mid-Level",      sub: "3–6 years",   bullets: "8–10 bullets/role", color: "from-violet-500 to-purple-500" },
  { value: "senior",  label: "Senior",         sub: "6–10 years",  bullets: "10–12 bullets/role",color: "from-orange-500 to-amber-500" },
  { value: "lead",    label: "Lead / Principal",sub: "10+ years",  bullets: "12–15 bullets/role",color: "from-rose-500 to-pink-500" },
];

const STEPS = ["Personal Info", "Target Role", "Generating"];

export function AIResumeGenerator() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [doneId, setDoneId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "", email: "", phone: "", location: "", linkedin: "", github: "",
    targetRole: "", experienceLevel: "" as ExperienceLevel | "",
  });

  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const step1Valid = form.name && form.email && form.phone && form.location;
  const step2Valid = form.targetRole && form.experienceLevel;

  const generate = async () => {
    setStep(2);
    setLoading(true);
    try {
      const res = await fetch("/api/resumes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personalInfo: {
            name: form.name, email: form.email, phone: form.phone,
            location: form.location, linkedin: form.linkedin, github: form.github,
          },
          targetRole: form.targetRole,
          experienceLevel: form.experienceLevel,
        }),
      });
      const text = await res.text();
      let data: { error?: string; resumeId?: string } = {};
      try {
        data = JSON.parse(text);
      } catch {
        if (res.status === 504 || res.status === 408) {
          throw new Error("Generation timed out. Please try again.");
        }
        throw new Error("Server error. Please try again in a moment.");
      }
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setDoneId(data.resumeId!);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate resume");
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const selectedLevel = LEVELS.find((l) => l.value === form.experienceLevel);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-700 to-brand-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          AI Resume Generator
        </h1>
        <p className="text-slate-500 mt-1 ml-14 text-sm">
          Enter your details and let AI build a complete ATS-optimised resume
        </p>
      </div>

      {/* Step indicator */}
      {step < 2 && (
        <div className="flex items-center gap-2">
          {STEPS.slice(0, 2).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < step ? "bg-brand-700 text-white" :
                i === step ? "bg-brand-100 text-brand-700 border-2 border-brand-700" :
                "bg-slate-100 text-slate-400"
              }`}>
                {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-sm font-medium ${i === step ? "text-brand-700" : "text-slate-400"}`}>{s}</span>
              {i < 1 && <ChevronRight className="w-4 h-4 text-slate-300" />}
            </div>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">

        {/* ── Step 0: Personal Info ─────────────────────────────────────────── */}
        {step === 0 && (
          <motion.div key="step0"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="glass-card rounded-2xl p-6 space-y-4"
          >
            <h2 className="font-semibold text-slate-900 text-lg">Personal Information</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                    placeholder="John Smith"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                    placeholder="john@example.com"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Phone *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                    placeholder="+1 (555) 000-0000"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Location *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                    placeholder="New York, NY"
                    value={form.location}
                    onChange={(e) => set("location", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">LinkedIn <span className="text-slate-400 normal-case">(optional)</span></label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                    placeholder="linkedin.com/in/johnsmith"
                    value={form.linkedin}
                    onChange={(e) => set("linkedin", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">GitHub <span className="text-slate-400 normal-case">(optional)</span></label>
                <div className="relative">
                  <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                    placeholder="github.com/johnsmith"
                    value={form.github}
                    onChange={(e) => set("github", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button
              disabled={!step1Valid}
              onClick={() => setStep(1)}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-brand-700 to-brand-500 text-white font-semibold rounded-xl hover:shadow-glow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* ── Step 1: Role + Level ───────────────────────────────────────────── */}
        {step === 1 && (
          <motion.div key="step1"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <h2 className="font-semibold text-slate-900 text-lg">Target Role</h2>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Job Title / Role *</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                    placeholder="e.g. Full Stack Developer, Data Scientist, Product Manager"
                    value={form.targetRole}
                    onChange={(e) => set("targetRole", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 space-y-4">
              <h2 className="font-semibold text-slate-900 text-lg">Experience Level</h2>
              <p className="text-sm text-slate-500">This determines how many bullet points and roles AI generates.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {LEVELS.map((lvl) => (
                  <button
                    key={lvl.value}
                    onClick={() => set("experienceLevel", lvl.value)}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                      form.experienceLevel === lvl.value
                        ? "border-brand-500 bg-brand-50"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${lvl.color}`} />
                      <span className="font-semibold text-slate-900 text-sm">{lvl.label}</span>
                    </div>
                    <p className="text-xs text-slate-500">{lvl.sub}</p>
                    <p className="text-xs text-brand-600 font-medium mt-1">{lvl.bullets}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(0)}
                className="flex items-center gap-2 px-5 py-3 border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button
                disabled={!step2Valid}
                onClick={generate}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-brand-700 to-brand-500 text-white font-semibold rounded-xl hover:shadow-glow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4" />
                Generate Resume
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Step 2: Generating ─────────────────────────────────────────────── */}
        {step === 2 && (
          <motion.div key="step2"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-10 text-center space-y-6"
          >
            {!doneId ? (
              <>
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-brand-700 to-brand-500 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Building Your Resume…</h2>
                  <p className="text-slate-500 text-sm">
                    AI is crafting a{selectedLevel ? ` ${selectedLevel.label}` : ""} <strong>{form.targetRole}</strong> resume for <strong>{form.name}</strong>
                  </p>
                </div>
                <div className="flex flex-col gap-2 text-sm text-slate-400 max-w-xs mx-auto">
                  {["Analysing role requirements", "Writing experience bullets", "Generating skills & certifications", "Optimising for ATS"].map((s, i) => (
                    <motion.div key={s}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.6 }}
                      className="flex items-center gap-2"
                    >
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-500 shrink-0" />
                      {s}
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Resume Ready!</h2>
                  <p className="text-slate-500 text-sm">Your ATS-optimised resume has been created successfully.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href={`/api/resumes/${doneId}/download?format=pdf`}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-700 to-brand-500 text-white font-semibold rounded-xl hover:shadow-glow-sm transition-all"
                  >
                    <Download className="w-4 h-4" /> Download PDF
                  </a>
                  <a
                    href={`/api/resumes/${doneId}/download?format=docx`}
                    className="flex items-center justify-center gap-2 px-6 py-3 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-all"
                  >
                    <FileText className="w-4 h-4" /> Download Word
                  </a>
                  <button
                    onClick={() => router.push("/resumes")}
                    className="flex items-center justify-center gap-2 px-6 py-3 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-all"
                  >
                    View All Resumes <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
