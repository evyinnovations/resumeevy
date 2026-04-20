"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import {
  Wand2, Upload, FileText, Target, CheckCircle, XCircle,
  AlertCircle, Loader2, ArrowRight, Download, Eye, Sparkles,
  TrendingUp, RefreshCw, Mail, MessageSquare, Shield, BarChart3,
  Copy, Check, GitCompare,
} from "lucide-react";
import { getAtsScoreColor, getAtsScoreLabel, cn } from "@/lib/utils";
import { UpgradeModal } from "@/components/shared/upgrade-modal";

interface Resume {
  id: string;
  title: string;
  profileName: string | null;
  atsScore: number | null;
}

interface TailorEngineProps {
  resumes: Resume[];
  subscription: { plan: string } | null;
  thisMonthCount: number;
}

type Step = "select" | "job" | "processing" | "results";

export function TailorEngine({ resumes, subscription, thisMonthCount }: TailorEngineProps) {
  const [step, setStep] = useState<Step>("select");
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<TailorResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tailoredResumeId, setTailoredResumeId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "changes" | "cover-letter" | "interview" | "ats-sim" | "gaps">("overview");
  const [copied, setCopied] = useState(false);

  const isFreePlan = !subscription || subscription.plan === "FREE";
  const canTailor = !isFreePlan || thisMonthCount < 3;
  const remainingFree = Math.max(0, 3 - thisMonthCount);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const onDrop = useCallback((files: File[]) => {
    if (files[0]) setUploadedFile(files[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
  });

  const handleTailor = async () => {
    if ((!selectedResumeId && !uploadedFile) || !jobDescription.trim()) return;
    setStep("processing");
    setError(null);

    try {
      let resumeId = selectedResumeId;

      // Upload file first if needed
      if (uploadedFile && !selectedResumeId) {
        const formData = new FormData();
        formData.append("file", uploadedFile);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || "Failed to upload resume");
        resumeId = uploadData.resumeId;
      }

      const res = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId, jobTitle, company, jobDescription }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Tailoring failed");
      }

      const data = await res.json();
      setResult(data.result);
      setTailoredResumeId(data.tailoredResumeId);
      setActiveTab("changes");
      setStep("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStep("job");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-700 to-brand-500 flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            AI Resume Tailor
          </h1>
          <p className="text-slate-500 mt-1 ml-14">
            Match your resume to any job description in seconds
          </p>
        </div>
        {isFreePlan && (
          <div className="text-right">
            <div className="text-2xl font-black text-slate-900">{remainingFree}</div>
            <div className="text-xs text-slate-400">tailors left</div>
          </div>
        )}
      </div>

      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        title="Monthly tailor limit reached"
        description="Free plan includes 3 AI tailors per month. Upgrade to Pro for unlimited tailoring."
      />

      {/* Limit warning */}
      {isFreePlan && !canTailor && (
        <div className="flex items-center gap-3 p-4 bg-[#F5F5FE] border border-[#C5C5E8] rounded-2xl">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-[#1A28C1]" />
          <div>
            <div className="font-semibold text-slate-900">Monthly limit reached</div>
            <div className="text-sm text-slate-500">3/3 free tailors used this month</div>
          </div>
          <button
            onClick={() => setShowUpgrade(true)}
            className="ml-auto px-4 py-2 bg-[#1A28C1] hover:bg-[#1520A0] text-white rounded-xl text-sm font-semibold transition-all cursor-pointer whitespace-nowrap"
          >
            Upgrade Now
          </button>
        </div>
      )}

      {/* Progress steps */}
      <div className="flex items-center gap-2">
        {(["select", "job", "results"] as const).map((s, i) => {
          const labels = ["Choose Resume", "Job Details", "Results"];
          const isCompleted =
            (s === "select" && (step === "job" || step === "processing" || step === "results")) ||
            (s === "job" && (step === "processing" || step === "results"));
          const isCurrent = step === s || (s === "job" && step === "processing");

          return (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all",
                isCompleted ? "text-emerald-600" : isCurrent ? "text-brand-700 bg-brand-100" : "text-slate-400"
              )}>
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-bold",
                    isCurrent ? "border-brand-700 text-brand-700" : "border-slate-300 text-slate-400"
                  )}>
                    {i + 1}
                  </div>
                )}
                <span className="hidden sm:inline">{labels[i]}</span>
              </div>
              {i < 2 && <div className={cn("flex-1 h-px", isCompleted ? "bg-emerald-300" : "bg-slate-200")} />}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        {/* Step 1: Select or upload resume */}
        {step === "select" && (
          <motion.div
            key="select"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className="text-lg font-bold text-slate-900">Select a resume to tailor</h2>

            {/* Existing resumes */}
            {resumes.length > 0 && (
              <div className="space-y-3">
                <div className="text-sm text-slate-500 font-medium">Your saved resumes</div>
                <div className="grid gap-3">
                  {resumes.map((resume) => (
                    <button
                      key={resume.id}
                      onClick={() => setSelectedResumeId(resume.id)}
                      className={cn(
                        "flex items-center gap-4 p-4 glass-card rounded-2xl border transition-all duration-200 text-left cursor-pointer w-full",
                        selectedResumeId === resume.id
                          ? "border-brand-500 bg-brand-50"
                          : "border-slate-200 hover:border-slate-300"
                      )}
                    >
                      <div className="w-10 h-12 rounded-lg bg-brand-100 border border-brand-200 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-brand-700" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900">{resume.title}</div>
                        {resume.profileName && (
                          <div className="text-xs text-slate-400 mt-0.5">{resume.profileName}</div>
                        )}
                      </div>
                      {resume.atsScore && (
                        <div className="text-right">
                          <div className={`text-xl font-black ${getAtsScoreColor(resume.atsScore)}`}>
                            {resume.atsScore}
                          </div>
                          <div className="text-[10px] text-slate-400">ATS</div>
                        </div>
                      )}
                      {selectedResumeId === resume.id && (
                        <CheckCircle className="w-5 h-5 text-brand-700 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Or upload */}
            <div>
              <div className="text-sm text-slate-500 font-medium mb-3">
                {resumes.length > 0 ? "Or upload a new resume" : "Upload your resume"}
              </div>
              <div
                {...getRootProps()}
                className={cn(
                  "relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer",
                  isDragActive
                    ? "border-brand-500 bg-brand-50"
                    : uploadedFile
                    ? "border-emerald-400 bg-emerald-50"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                <input {...getInputProps()} />
                {uploadedFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <CheckCircle className="w-6 h-6 text-emerald-500" />
                    <div>
                      <div className="font-semibold text-slate-900">{uploadedFile.name}</div>
                      <div className="text-xs text-slate-400">{(uploadedFile.size / 1024).toFixed(0)} KB</div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }}
                      className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                      <XCircle className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                    <div className="font-semibold text-slate-700 mb-1">
                      {isDragActive ? "Drop your resume here" : "Drag & drop or click to upload"}
                    </div>
                    <div className="text-sm text-slate-400">PDF or Word (.docx) — max 10MB</div>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={() => setStep("job")}
              disabled={!selectedResumeId && !uploadedFile}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Step 2: Job details */}
        {step === "job" && (
          <motion.div
            key="job"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className="text-lg font-bold text-slate-900">Paste the job description</h2>

            {error && (
              <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Job Title *</label>
                <input
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Senior Software Engineer"
                  className="input-dark w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Company</label>
                <input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Google, Stripe, etc."
                  className="input-dark w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Job Description *
                <span className="text-slate-400 font-normal ml-2">Paste the full job posting</span>
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the complete job description here. Include responsibilities, requirements, preferred qualifications, and any tech stack mentioned..."
                rows={12}
                className="input-dark w-full resize-none font-mono text-xs leading-relaxed"
              />
              <div className="text-xs text-slate-400 mt-1.5 text-right">
                {jobDescription.split(/\s+/).filter(Boolean).length} words
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("select")}
                className="btn-secondary px-6"
              >
                Back
              </button>
              <button
                onClick={!canTailor ? () => setShowUpgrade(true) : handleTailor}
                disabled={!jobTitle || !jobDescription.trim()}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {!canTailor ? "Upgrade to Tailor" : "Tailor My Resume with AI"}
              </button>
            </div>
          </motion.div>
        )}

        {/* Processing */}
        {step === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full bg-brand-200 animate-ping" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-brand-700 to-brand-500 flex items-center justify-center shadow-lg">
                <Wand2 className="w-10 h-10 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">AI is tailoring your resume...</h2>
            <p className="text-slate-500 max-w-sm mx-auto">
              Analyzing job requirements, identifying gaps, and optimizing your resume for ATS. This takes about 15 seconds.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              {[
                "Parsing job description",
                "Analyzing skill gaps",
                "Rewriting bullet points",
                "Calculating ATS score",
              ].map((task, i) => (
                <motion.div
                  key={task}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.8 }}
                  className="flex items-center gap-2 text-xs text-slate-400"
                >
                  <Loader2 className="w-3 h-3 animate-spin text-brand-700" />
                  <span className="hidden sm:inline">{task}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Results */}
        {step === "results" && result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Score bar */}
            <div className="glass-card rounded-3xl p-6 border border-emerald-200">
              <div className="grid grid-cols-3 gap-4 items-center mb-5">
                <div className="text-center">
                  <div className="text-xs text-slate-400 mb-2">Before</div>
                  <div className={`text-4xl font-black ${getAtsScoreColor(result.atsScoreBefore)}`}>{result.atsScoreBefore}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{getAtsScoreLabel(result.atsScoreBefore)}</div>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center mx-auto">
                    <TrendingUp className="w-5 h-5 text-brand-700" />
                  </div>
                  <div className="text-base font-black text-brand-700 mt-1.5">+{result.atsScoreAfter - result.atsScoreBefore} pts</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-slate-400 mb-2">After AI</div>
                  <div className={`text-4xl font-black ${getAtsScoreColor(result.atsScoreAfter)}`}>{result.atsScoreAfter}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{getAtsScoreLabel(result.atsScoreAfter)}</div>
                </div>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${result.keywordMatchPct}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-brand-700 to-emerald-500 rounded-full"
                />
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Keyword match</span>
                <span>{result.keywordMatchPct?.toFixed(0)}%</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl overflow-x-auto">
              {[
                { id: "overview", label: "Overview", icon: BarChart3 },
                { id: "changes", label: "What Changed", icon: GitCompare },
                { id: "cover-letter", label: "Cover Letter", icon: Mail },
                { id: "interview", label: "Interview Prep", icon: MessageSquare },
                { id: "ats-sim", label: "ATS Simulation", icon: Shield },
                { id: "gaps", label: "Gap Analysis", icon: Target },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as typeof activeTab)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex-shrink-0",
                    activeTab === id
                      ? "bg-brand-100 text-brand-700 border border-brand-200"
                      : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* Tab: Overview */}
            {activeTab === "overview" && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="glass-card rounded-2xl p-5">
                    <div className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Keywords Added
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.extractedSkills?.slice(0, 12).map((skill) => (
                        <span key={skill} className="px-2.5 py-1 bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs rounded-lg font-medium">
                          +{skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="glass-card rounded-2xl p-5">
                    <div className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-brand-700" />
                      Rewrites Applied
                    </div>
                    <ul className="space-y-2">
                      {result.changes?.slice(0, 5).map((change, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-500">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0 mt-1.5" />
                          {change.change}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                {result.suggestions?.length > 0 && (
                  <div className="glass-card rounded-2xl p-5">
                    <div className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                      Additional Suggestions
                    </div>
                    <ul className="space-y-2">
                      {result.suggestions.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-500">
                          <span className="text-yellow-500 font-bold mt-0.5 flex-shrink-0">→</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Tab: What Changed */}
            {activeTab === "changes" && (
              <div className="space-y-6">
                {/* Experience changes */}
                {result.tailoredExperience && result.tailoredExperience.length > 0 && (
                  <div className="space-y-4">
                    <div className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-brand-700" />
                      Experience — Updated Bullets
                    </div>
                    {(result.tailoredExperience as ExperienceItem[]).map((exp, i) => {
                      const orig = (result.originalExperience as ExperienceItem[])?.[i];
                      const origBullets = orig?.bullets || [];
                      const newBullets = (exp.bullets || []).filter((b) => !origBullets.includes(b));
                      const keptBullets = (exp.bullets || []).filter((b) => origBullets.includes(b));
                      if (newBullets.length === 0) return null;
                      return (
                        <div key={i} className="glass-card rounded-2xl p-5">
                          <div className="font-semibold text-slate-900 mb-1">{exp.title}</div>
                          <div className="text-xs text-slate-400 mb-3">{exp.company}</div>
                          {newBullets.map((b, j) => (
                            <div key={j} className="flex items-start gap-2 mb-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                              <span className="text-emerald-600 font-bold text-xs mt-0.5 flex-shrink-0">+ NEW</span>
                              <span className="text-xs text-slate-700">{b}</span>
                            </div>
                          ))}
                          {keptBullets.length > 0 && (
                            <div className="text-xs text-slate-400 mt-2">{keptBullets.length} original bullet{keptBullets.length !== 1 ? "s" : ""} kept unchanged</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Projects changes */}
                {result.tailoredProjects && result.tailoredProjects.length > 0 && (
                  <div className="space-y-4">
                    <div className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-violet-600" />
                      Projects — Updated Bullets
                    </div>
                    {(result.tailoredProjects as ProjectItem[]).map((proj, i) => {
                      const orig = (result.originalProjects as ProjectItem[])?.[i];
                      const origBullets = orig?.bullets || [];
                      const newBullets = (proj.bullets || []).filter((b) => !origBullets.includes(b));
                      if (newBullets.length === 0) return null;
                      return (
                        <div key={i} className="glass-card rounded-2xl p-5">
                          <div className="font-semibold text-slate-900 mb-3">{proj.name}</div>
                          {newBullets.map((b, j) => (
                            <div key={j} className="flex items-start gap-2 mb-2 p-2 bg-violet-50 border border-violet-200 rounded-lg">
                              <span className="text-violet-600 font-bold text-xs mt-0.5 flex-shrink-0">+ NEW</span>
                              <span className="text-xs text-slate-700">{b}</span>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}

                {!result.tailoredExperience?.length && !result.tailoredProjects?.length && (
                  <div className="text-slate-400 text-sm text-center py-8">No change data available.</div>
                )}
              </div>
            )}

            {/* Tab: Cover Letter */}
            {activeTab === "cover-letter" && (
              <div className="glass-card rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-500" />
                    Matching Cover Letter
                  </div>
                  <button
                    onClick={() => {
                      if (result.coverLetter) {
                        navigator.clipboard.writeText(result.coverLetter);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs text-slate-500 transition-all cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                {result.coverLetter ? (
                  <pre className="whitespace-pre-wrap text-sm text-slate-600 leading-relaxed font-sans bg-slate-50 rounded-xl p-4 border border-slate-100 max-h-96 overflow-y-auto">
                    {result.coverLetter}
                  </pre>
                ) : (
                  <div className="text-slate-400 text-sm text-center py-8">Cover letter not generated for this job.</div>
                )}
              </div>
            )}

            {/* Tab: Interview Prep */}
            {activeTab === "interview" && (
              <div className="glass-card rounded-2xl p-5">
                <div className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-violet-500" />
                  Predicted Interview Questions
                </div>
                {result.interviewQuestions && result.interviewQuestions.length > 0 ? (
                  <div className="space-y-3">
                    {result.interviewQuestions.map((q, i) => (
                      <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="text-sm font-medium text-slate-900">{q.question}</div>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-violet-100 text-violet-600 border border-violet-200 rounded-full whitespace-nowrap flex-shrink-0">
                            {q.category}
                          </span>
                        </div>
                        <div className="flex items-start gap-2 text-xs text-slate-400">
                          <Sparkles className="w-3 h-3 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <span>{q.tip}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-400 text-sm text-center py-8">No interview questions generated.</div>
                )}
              </div>
            )}

            {/* Tab: ATS Simulation */}
            {activeTab === "ats-sim" && (
              <div className="glass-card rounded-2xl p-5">
                <div className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  Platform-Specific ATS Scores
                </div>
                {result.atsSimulation ? (
                  <div className="space-y-5">
                    {[
                      { name: "Workday", score: result.atsSimulation.workday, color: "bg-blue-500", note: "Strict on section headers and column layouts" },
                      { name: "Greenhouse", score: result.atsSimulation.greenhouse, color: "bg-emerald-500", note: "Good with modern formats, focuses on keyword density" },
                      { name: "Lever", score: result.atsSimulation.lever, color: "bg-violet-500", note: "Lenient on format, prioritizes skills match" },
                      { name: "Taleo", score: result.atsSimulation.taleo, color: "bg-amber-500", note: "Legacy parser — prefers plain text, no tables" },
                    ].map((p) => (
                      <div key={p.name}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div>
                            <span className="text-sm font-semibold text-slate-900">{p.name}</span>
                            <span className="text-xs text-slate-400 ml-2">{p.note}</span>
                          </div>
                          <span className={`text-sm font-black ${p.score >= 80 ? "text-emerald-600" : p.score >= 65 ? "text-yellow-600" : "text-red-500"}`}>
                            {p.score}%
                          </span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full ${p.color} rounded-full`}
                            initial={{ width: 0 }}
                            animate={{ width: `${p.score}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    ))}
                    {result.atsSimulation.notes?.length > 0 && (
                      <div className="pt-3 border-t border-slate-100">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Parse Notes</div>
                        <ul className="space-y-1">
                          {result.atsSimulation.notes.map((note, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                              {note}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-slate-400 text-sm text-center py-8">ATS simulation not available.</div>
                )}
              </div>
            )}

            {/* Tab: Gap Analysis */}
            {activeTab === "gaps" && (
              <div className="space-y-4">
                {result.gapClassification ? (
                  <>
                    {result.gapClassification.dealBreakers?.length > 0 && (
                      <div className="p-5 bg-red-50 border border-red-200 rounded-2xl">
                        <div className="text-sm font-bold text-red-600 mb-3 flex items-center gap-2">
                          <XCircle className="w-4 h-4" />
                          Deal-Breakers — Required skills you&apos;re missing
                        </div>
                        <div className="space-y-2">
                          {result.gapClassification.dealBreakers.map((item, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <span className="text-xs font-bold px-2 py-0.5 bg-red-100 text-red-600 rounded-lg whitespace-nowrap">{item.skill}</span>
                              <span className="text-xs text-slate-500">{item.reason}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {result.gapClassification.framingIssues?.length > 0 && (
                      <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl">
                        <div className="text-sm font-bold text-amber-600 mb-3 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Framing Issues — You have it, just worded differently
                        </div>
                        <div className="space-y-2">
                          {result.gapClassification.framingIssues.map((item, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <span className="text-xs font-bold px-2 py-0.5 bg-amber-100 text-amber-600 rounded-lg whitespace-nowrap">{item.skill}</span>
                              <span className="text-xs text-slate-500">{item.fix}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {result.gapClassification.niceToHave?.length > 0 && (
                      <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                        <div className="text-sm font-bold text-slate-500 mb-3 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-slate-400" />
                          Nice-to-Have — Preferred but not blocking
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {result.gapClassification.niceToHave.map((item, i) => (
                            <span key={i} className="text-xs px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-500 rounded-lg">
                              {item.skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="glass-card rounded-2xl p-5 text-slate-400 text-sm text-center py-8">Gap analysis not available.</div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-2">
              {tailoredResumeId && (
                <>
                  <a
                    href={`/builder/${tailoredResumeId}`}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-brand-700 to-brand-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all cursor-pointer text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    View & Edit Resume
                  </a>
                  <a
                    href={`/api/resumes/${tailoredResumeId}/download?format=pdf`}
                    className="flex items-center justify-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-medium rounded-xl transition-all cursor-pointer text-sm"
                  >
                    <Download className="w-4 h-4" />
                    PDF
                  </a>
                  <a
                    href={`/api/resumes/${tailoredResumeId}/download?format=docx`}
                    className="flex items-center justify-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-medium rounded-xl transition-all cursor-pointer text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Word
                  </a>
                </>
              )}
              <button
                onClick={() => {
                  setStep("select");
                  setResult(null);
                  setTailoredResumeId(null);
                  setJobDescription("");
                  setJobTitle("");
                  setCompany("");
                  setActiveTab("overview");
                }}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-medium rounded-xl transition-all cursor-pointer text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Tailor Another
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ExperienceItem {
  title: string;
  company: string;
  bullets: string[];
  [key: string]: unknown;
}

interface ProjectItem {
  name: string;
  bullets: string[];
  [key: string]: unknown;
}

interface TailorResult {
  atsScoreBefore: number;
  atsScoreAfter: number;
  keywordMatchPct: number;
  extractedSkills: string[];
  missingKeywords: string[];
  suggestions: string[];
  changes: Array<{ section: string; change: string }>;
  coverLetter?: string | null;
  interviewQuestions?: Array<{ question: string; category: string; tip: string }>;
  atsSimulation?: {
    workday: number;
    greenhouse: number;
    lever: number;
    taleo: number;
    notes: string[];
  } | null;
  gapClassification?: {
    dealBreakers: Array<{ skill: string; reason: string }>;
    niceToHave: Array<{ skill: string; reason: string }>;
    framingIssues: Array<{ skill: string; fix: string }>;
  } | null;
  originalExperience?: unknown[];
  tailoredExperience?: unknown[];
  originalProjects?: unknown[];
  tailoredProjects?: unknown[];
}
