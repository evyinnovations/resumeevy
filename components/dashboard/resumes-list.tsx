"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  FileText, PlusCircle, Wand2, Download, Trash2, Edit,
  GitBranch, Clock, TrendingUp, Sparkles
} from "lucide-react";
import { formatDate, getAtsScoreColor, getAtsScoreLabel } from "@/lib/utils";
import { useState } from "react";
import { toast } from "@/components/ui/toaster";
import { UpgradeModal } from "@/components/shared/upgrade-modal";

interface Resume {
  id: string;
  title: string;
  profileName: string | null;
  templateId: string;
  status: string;
  atsScore: number | null;
  atsScoreAfter: number | null;
  isOriginal: boolean;
  parentId: string | null;
  updatedAt: Date;
  createdAt: Date;
  _count: { versions: number };
}

export function ResumesList({
  resumes: initialResumes,
  subscription,
}: {
  resumes: Resume[];
  subscription?: { plan: string; status: string } | null;
}) {
  const [resumes, setResumes] = useState(initialResumes);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const isFreePlan = !subscription || subscription.plan === "FREE";
  const atResumeLimit = isFreePlan && resumes.length >= 1;

  const handleNewResume = (e: React.MouseEvent) => {
    if (atResumeLimit) {
      e.preventDefault();
      setShowUpgrade(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this resume? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await fetch(`/api/resumes/${id}`, { method: "DELETE" });
      setResumes((prev) => prev.filter((r) => r.id !== id));
      toast.success("Resume deleted");
    } catch {
      toast.error("Failed to delete resume");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        title="Resume limit reached"
        description="Free plan allows 1 resume. Upgrade to Pro for unlimited resumes, unlimited tailors, and all templates."
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-700 to-brand-500 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            My Resumes
          </h1>
          <p className="text-slate-500 mt-1 ml-14">{resumes.length} resume{resumes.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link
            href="/tailor"
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-all cursor-pointer"
          >
            <Wand2 className="w-4 h-4" />
            Tailor
          </Link>
          <Link
            href="/builder/generate"
            onClick={handleNewResume}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-brand-600 text-white text-sm font-semibold rounded-xl hover:shadow-glow-sm transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            AI Generate
          </Link>
          <Link
            href="/builder/new"
            onClick={handleNewResume}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-700 to-brand-500 text-white text-sm font-semibold rounded-xl hover:shadow-glow-sm transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            New Resume
          </Link>
        </div>
      </div>

      {/* Resumes */}
      {resumes.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-slate-900 font-semibold mb-2">No resumes yet</h3>
          <p className="text-slate-500 text-sm mb-6">Create your first resume to get started</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/builder/generate"
              className="px-6 py-3 bg-gradient-to-r from-violet-600 to-brand-600 text-white font-semibold rounded-xl hover:shadow-glow-sm transition-all cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> AI Generate
            </Link>
            <Link
              href="/builder/new"
              className="px-6 py-3 bg-gradient-to-r from-brand-700 to-brand-500 text-white font-semibold rounded-xl hover:shadow-glow-sm transition-all cursor-pointer"
            >
              Build Manually
            </Link>
            <Link
              href="/tailor"
              className="px-6 py-3 bg-slate-100 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
            >
              Upload & Tailor
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {resumes.map((resume, i) => {
            const score = resume.atsScoreAfter ?? resume.atsScore;
            return (
              <motion.div
                key={resume.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass-card rounded-2xl p-5 hover:border-slate-300 transition-all"
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className="w-12 h-14 bg-brand-100 border border-brand-200 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-brand-700" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900">{resume.title}</h3>
                      {resume.profileName && (
                        <span className="badge-brand">{resume.profileName}</span>
                      )}
                      {!resume.isOriginal && (
                        <span className="badge-success">Tailored</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Updated {formatDate(resume.updatedAt)}
                      </span>
                      {resume._count.versions > 0 && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <GitBranch className="w-3 h-3" />
                          {resume._count.versions} version{resume._count.versions !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ATS Score */}
                  {score !== null && (
                    <div className="text-right flex-shrink-0 hidden sm:block">
                      <div className={`text-2xl font-black ${getAtsScoreColor(score)}`}>{score}</div>
                      <div className="text-[10px] text-slate-400">{getAtsScoreLabel(score)}</div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/builder/${resume.id}`}
                      className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/tailor?resumeId=${resume.id}`}
                      className="p-2 rounded-xl hover:bg-brand-100 text-slate-400 hover:text-brand-700 transition-all cursor-pointer"
                      title="Tailor with AI"
                    >
                      <Wand2 className="w-4 h-4" />
                    </Link>
                    <a
                      href={`/api/resumes/${resume.id}/download?format=pdf`}
                      className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(resume.id)}
                      disabled={deleting === resume.id}
                      className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all cursor-pointer disabled:opacity-30"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
