"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase, ChevronDown, ChevronUp, Tag, TrendingUp, TrendingDown,
  FileText, Mail, StickyNote, Check, X, Loader2, ExternalLink,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "@/components/ui/toaster";
import Link from "next/link";

const STATUSES = [
  { value: "SAVED",        label: "Saved",        color: "bg-slate-100 text-slate-600 border-slate-200" },
  { value: "APPLIED",      label: "Applied",      color: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "PHONE_SCREEN", label: "Phone Screen", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  { value: "INTERVIEW",    label: "Interview",    color: "bg-violet-50 text-violet-700 border-violet-200" },
  { value: "OFFER",        label: "Offer",        color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: "REJECTED",     label: "Rejected",     color: "bg-red-50 text-red-600 border-red-200" },
];

interface Job {
  id: string;
  jobTitle: string;
  company: string | null;
  applicationStatus: string;
  atsScoreBefore: number | null;
  atsScoreAfter: number | null;
  keywordMatchPct: number | null;
  extractedSkills: string;
  missingKeywords: string;
  notes: string | null;
  coverLetter: string | null;
  createdAt: Date;
  tailoredResumeId: string | null;
}

function safeParseArray(val: string | null): string[] {
  try { return val ? JSON.parse(val) : []; } catch { return []; }
}

export function JobTracker({ initialJobs }: { initialJobs: Job[] }) {
  const [jobs, setJobs] = useState(initialJobs);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const updateJob = async (id: string, data: { applicationStatus?: string; notes?: string }) => {
    setUpdating(id);
    try {
      const res = await fetch("/api/jobs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...data }),
      });
      if (!res.ok) throw new Error("Update failed");
      setJobs((prev) => prev.map((j) => j.id === id ? { ...j, ...data } : j));
      if (data.notes !== undefined) { setEditingNotes(null); toast.success("Notes saved"); }
    } catch {
      toast.error("Failed to update");
    } finally {
      setUpdating(null);
    }
  };

  const filtered = filterStatus === "ALL" ? jobs : jobs.filter((j) => j.applicationStatus === filterStatus);

  const counts = STATUSES.reduce((acc, s) => {
    acc[s.value] = jobs.filter((j) => j.applicationStatus === s.value).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-700 to-brand-500 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          Job Tracker
        </h1>
        <p className="text-slate-500 mt-1 ml-14 text-sm">Track every application, interview, and offer in one place</p>
      </div>

      {/* Pipeline summary */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => setFilterStatus(filterStatus === s.value ? "ALL" : s.value)}
            className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
              filterStatus === s.value ? s.color + " ring-2 ring-offset-1 ring-current" : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="text-xl font-black text-slate-900">{counts[s.value] || 0}</div>
            <div className="text-[10px] font-semibold text-slate-500 mt-0.5">{s.label}</div>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-slate-900 font-semibold mb-2">No jobs yet</h3>
          <p className="text-slate-500 text-sm mb-4">Tailor your resume to a job to add it here automatically</p>
          <Link href="/tailor" className="inline-flex items-center gap-2 px-4 py-2 bg-brand-700 text-white text-sm font-semibold rounded-xl hover:bg-brand-800 transition-all">
            Tailor a Resume
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((job) => {
            const skills = safeParseArray(job.extractedSkills);
            const missing = safeParseArray(job.missingKeywords);
            const status = STATUSES.find((s) => s.value === job.applicationStatus) ?? STATUSES[0];
            const isExpanded = expanded === job.id;

            return (
              <motion.div
                key={job.id}
                layout
                className="glass-card rounded-2xl border border-slate-200 overflow-hidden"
              >
                {/* Row */}
                <div className="p-5 flex items-center gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-slate-900 truncate">{job.jobTitle}</p>
                      <span className="text-slate-400 text-sm">@</span>
                      <p className="text-slate-600 text-sm font-medium">{job.company}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="text-xs text-slate-400">{formatDate(job.createdAt)}</span>
                      {job.atsScoreAfter && (
                        <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                          <TrendingUp className="w-3 h-3" /> ATS {job.atsScoreAfter}
                          {job.atsScoreBefore && job.atsScoreBefore < job.atsScoreAfter && (
                            <span className="text-slate-400">(+{job.atsScoreAfter - job.atsScoreBefore})</span>
                          )}
                        </span>
                      )}
                      {job.keywordMatchPct && (
                        <span className="text-xs text-brand-600 font-medium">
                          {Math.round(job.keywordMatchPct)}% keyword match
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Status dropdown */}
                    <select
                      value={job.applicationStatus}
                      onChange={(e) => updateJob(job.id, { applicationStatus: e.target.value })}
                      disabled={updating === job.id}
                      className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border cursor-pointer focus:outline-none transition-all ${status.color}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>

                    <button
                      onClick={() => setExpanded(isExpanded ? null : job.id)}
                      className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer transition-all"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded detail */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-4">
                        {/* Keywords */}
                        <div className="grid sm:grid-cols-2 gap-4">
                          {skills.length > 0 && (
                            <div>
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                                <Tag className="w-3 h-3" /> Matched Keywords
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {skills.slice(0, 15).map((s) => (
                                  <span key={s} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs rounded-full flex items-center gap-1">
                                    <Check className="w-2.5 h-2.5" /> {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {missing.length > 0 && (
                            <div>
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                                <TrendingDown className="w-3 h-3" /> Missing Keywords
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {missing.slice(0, 10).map((s) => (
                                  <span key={s} className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-200 text-xs rounded-full flex items-center gap-1">
                                    <X className="w-2.5 h-2.5" /> {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Notes */}
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                            <StickyNote className="w-3 h-3" /> Notes
                          </p>
                          {editingNotes === job.id ? (
                            <div className="space-y-2">
                              <textarea
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                rows={3}
                                placeholder="Recruiter name, interview notes, follow-up date..."
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 resize-none"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => updateJob(job.id, { notes: noteText })}
                                  disabled={updating === job.id}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-700 text-white text-xs font-semibold rounded-lg cursor-pointer disabled:opacity-50"
                                >
                                  {updating === job.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Save
                                </button>
                                <button onClick={() => setEditingNotes(null)} className="px-3 py-1.5 border border-slate-200 text-slate-600 text-xs rounded-lg cursor-pointer hover:bg-slate-50">
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setEditingNotes(job.id); setNoteText(job.notes || ""); }}
                              className="w-full text-left px-3 py-2 border border-dashed border-slate-200 rounded-xl text-sm text-slate-500 hover:border-brand-300 hover:text-slate-700 transition-all cursor-pointer min-h-[40px]"
                            >
                              {job.notes || "Click to add notes…"}
                            </button>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 flex-wrap pt-1">
                          {job.tailoredResumeId && (
                            <Link
                              href={`/builder/${job.tailoredResumeId}`}
                              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all"
                            >
                              <FileText className="w-3.5 h-3.5" /> View Resume
                            </Link>
                          )}
                          <Link
                            href={`/email-templates?jobId=${job.id}&jobTitle=${encodeURIComponent(job.jobTitle)}&company=${encodeURIComponent(job.company ?? "")}`}
                            className="flex items-center gap-1.5 px-3 py-2 bg-brand-50 hover:bg-brand-100 border border-brand-200 text-brand-700 text-xs font-semibold rounded-xl transition-all"
                          >
                            <Mail className="w-3.5 h-3.5" /> Email Templates
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
