"use client";

import { Download, FileText, FileType2, Clock, TrendingUp } from "lucide-react";
import { formatDate, getAtsScoreColor } from "@/lib/utils";
import { toast } from "@/components/ui/toaster";

interface Resume {
  id: string;
  title: string;
  isOriginal: boolean;
  atsScore: number | null;
  atsScoreAfter: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export function DownloadsPage({ resumes }: { resumes: Resume[] }) {
  const handleDownload = async (id: string, format: "pdf" | "docx", title: string) => {
    try {
      const res = await fetch(`/api/resumes/${id}/download?format=${format}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Download failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.replace(/[^a-z0-9\-_ ]/gi, "").replace(/\s+/g, "-")}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Downloaded ${format.toUpperCase()}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Download failed");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-700 to-brand-500 flex items-center justify-center">
            <Download className="w-5 h-5 text-white" />
          </div>
          Downloads
        </h1>
        <p className="text-slate-500 mt-1 ml-14 text-sm">Download any of your resumes as PDF or Word</p>
      </div>

      {resumes.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center">
          <Download className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-slate-900 font-semibold mb-2">No resumes yet</h3>
          <p className="text-slate-500 text-sm">Create or upload a resume to download it</p>
        </div>
      ) : (
        <div className="space-y-3">
          {resumes.map((resume) => {
            const score = resume.atsScoreAfter ?? resume.atsScore;
            return (
              <div key={resume.id} className="glass-card rounded-2xl p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-brand-600" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{resume.title}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatDate(resume.updatedAt)}
                    </span>
                    {score && (
                      <span className={`text-xs font-medium flex items-center gap-1 ${getAtsScoreColor(score)}`}>
                        <TrendingUp className="w-3 h-3" /> ATS {score}
                      </span>
                    )}
                    {!resume.isOriginal && (
                      <span className="text-xs bg-brand-50 text-brand-600 border border-brand-100 px-2 py-0.5 rounded-full font-medium">
                        Tailored
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleDownload(resume.id, "pdf", resume.title)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-brand-700 to-brand-500 text-white text-xs font-semibold rounded-lg hover:shadow-glow-sm transition-all"
                  >
                    <FileType2 className="w-3.5 h-3.5" /> PDF
                  </button>
                  <button
                    onClick={() => handleDownload(resume.id, "docx", resume.title)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-all"
                  >
                    <FileText className="w-3.5 h-3.5" /> Word
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
