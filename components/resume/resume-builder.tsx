"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save, Download, Eye, Palette, Sparkles, Loader2, CheckCircle,
  ChevronRight, ChevronLeft, PlusCircle, Trash2, GripVertical,
  User, Briefcase, GraduationCap, Code, FolderOpen, Award,
  FileText, Wand2, Lock
} from "lucide-react";
import { debounce, generateId, cn } from "@/lib/utils";
import { RESUME_TEMPLATES } from "@/lib/templates";
import { UpgradeModal } from "@/components/shared/upgrade-modal";

interface ResumeBuilderProps {
  resume: {
    id: string;
    title: string;
    templateId: string;
    personalInfo: Record<string, string>;
    summary: string;
    experience: unknown[];
    education: unknown[];
    skills: unknown[];
    projects: unknown[];
    certifications: unknown[];
    atsScore: number | null;
  } | null;
  userId: string;
  subscription?: { plan: string; status: string } | null;
}

type Section = "personal" | "summary" | "experience" | "education" | "skills" | "projects" | "certifications";

const sections: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: "personal", label: "Personal Info", icon: User },
  { id: "summary", label: "Summary", icon: FileText },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "skills", label: "Skills", icon: Code },
  { id: "projects", label: "Projects", icon: FolderOpen },
  { id: "certifications", label: "Certifications", icon: Award },
];

function defaultPersonalInfo() {
  return { name: "", email: "", phone: "", location: "", linkedin: "", github: "", website: "", title: "" };
}

export function ResumeBuilder({ resume, userId, subscription }: ResumeBuilderProps) {
  const [title, setTitle] = useState(resume?.title || "Untitled Resume");
  const [templateId, setTemplateId] = useState(resume?.templateId || "modern-minimal");
  const [activeSection, setActiveSection] = useState<Section>("personal");
  const [showTemplates, setShowTemplates] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [resumeId, setResumeId] = useState(resume?.id || "");
  const [aiLoading, setAiLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const isPro = subscription && subscription.plan !== "FREE" && ["ACTIVE", "TRIALING"].includes(subscription.status);

  const handleSelectTemplate = (id: string) => {
    const tpl = RESUME_TEMPLATES.find((t) => t.id === id);
    if (tpl?.isPremium && !isPro) { setShowUpgrade(true); return; }
    setTemplateId(id);
    setShowTemplates(false);
  };

  // Form state
  const [personalInfo, setPersonalInfo] = useState<Record<string, string>>(
    (resume?.personalInfo as Record<string, string>) || defaultPersonalInfo()
  );
  const [summary, setSummary] = useState(resume?.summary || "");
  const [experience, setExperience] = useState<ExperienceItem[]>(
    (resume?.experience as ExperienceItem[]) || []
  );
  const [education, setEducation] = useState<EducationItem[]>(
    (resume?.education as EducationItem[]) || []
  );
  const [skills, setSkills] = useState<SkillGroup[]>(
    (resume?.skills as SkillGroup[]) || []
  );
  const [projects, setProjects] = useState<ProjectItem[]>(
    (resume?.projects as ProjectItem[]) || []
  );
  const [certifications, setCertifications] = useState<CertificationItem[]>(
    (resume?.certifications as CertificationItem[]) || []
  );

  const getResumeData = () => ({
    title,
    templateId,
    personalInfo,
    summary,
    experience,
    education,
    skills,
    projects,
    certifications,
  });

  // Auto-save
  const autoSave = useCallback(
    debounce(async (data: ReturnType<typeof getResumeData>) => {
      try {
        setSaving(true);
        const res = await fetch(resumeId ? `/api/resumes/${resumeId}` : "/api/resumes", {
          method: resumeId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          const json = await res.json();
          if (!resumeId && json.id) setResumeId(json.id);
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }
      } finally {
        setSaving(false);
      }
    }, 1500),
    [resumeId]
  );

  useEffect(() => {
    autoSave(getResumeData());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, templateId, personalInfo, summary, experience, education, skills, projects, certifications]);

  const handleAiSuggestion = async () => {
    if (!summary && activeSection === "summary") {
      setAiLoading(true);
      try {
        const res = await fetch("/api/ai/suggest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            section: "summary",
            content: JSON.stringify({ personalInfo, experience }),
          }),
        });
        const data = await res.json();
        if (data.suggestion) setSummary(data.suggestion);
      } finally {
        setAiLoading(false);
      }
    }
  };

  const handleDownload = async (format: "pdf" | "docx") => {
    if (!resumeId) return;
    window.open(`/api/resumes/${resumeId}/download?format=${format}`, "_blank");
  };

  const currentTemplate = RESUME_TEMPLATES.find((t) => t.id === templateId) || RESUME_TEMPLATES[0];

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        title="Pro template"
        description="This template is exclusive to Pro subscribers. Upgrade to access all premium templates."
      />
      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 min-w-48 bg-transparent text-xl font-bold text-slate-900 outline-none border-b border-transparent hover:border-slate-200 focus:border-brand-500 transition-colors pb-1"
          placeholder="Resume title..."
        />
        <div className="flex items-center gap-2">
          {saving && <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />}
          {saved && <CheckCircle className="w-4 h-4 text-emerald-500" />}
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="btn-secondary flex items-center gap-2 text-sm px-4 py-2"
          >
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">{currentTemplate.name}</span>
          </button>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="btn-secondary flex items-center gap-2 text-sm px-4 py-2"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Preview</span>
          </button>
          <div className="flex gap-1">
            <button
              onClick={() => handleDownload("pdf")}
              disabled={!resumeId}
              className="btn-primary flex items-center gap-2 text-sm px-4 py-2"
            >
              <Download className="w-4 h-4" />
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* Template picker */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card rounded-2xl p-4"
          >
            <div className="text-sm font-semibold text-slate-800 mb-3">Choose Template</div>
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-10 gap-3">
              {RESUME_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleSelectTemplate(t.id)}
                  className={cn(
                    "group relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer",
                    templateId === t.id ? "border-brand-500 shadow-md" : "border-slate-200 hover:border-slate-400"
                  )}
                >
                  <div
                    className="h-16 w-full"
                    style={{ background: `linear-gradient(135deg, ${t.accentColor}20, ${t.accentColor}05)` }}
                  >
                    <div className="p-1.5 space-y-1">
                      <div className="h-1.5 rounded-full bg-slate-300 w-3/4" />
                      <div className="h-1 rounded-full bg-slate-200 w-full" />
                      <div className="h-1 rounded-full bg-slate-200 w-2/3" />
                    </div>
                    {t.isPremium && !isPro && (
                      <div className="absolute top-1 right-1">
                        <Lock className="w-3 h-3 text-yellow-600" />
                      </div>
                    )}
                  </div>
                  <div className="p-1 text-center text-[9px] text-slate-500 bg-slate-50">{t.name}</div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main editor */}
      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        {/* Section nav */}
        <div className="lg:sticky lg:top-20 h-fit space-y-1">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={cn(
                "sidebar-link w-full",
                activeSection === id && "active"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-left">{label}</span>
              <ChevronRight className={`w-4 h-4 transition-transform ${activeSection === id ? "rotate-90" : ""}`} />
            </button>
          ))}

          {/* ATS Score */}
          <div className="mt-6 p-4 glass-card rounded-2xl">
            <div className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">ATS Score</div>
            <div className="text-3xl font-black text-brand-700">{resume?.atsScore ?? "--"}</div>
            <div className="text-xs text-slate-400 mt-1">Run tailor to update</div>
            {resumeId && (
              <a
                href="/tailor"
                className="mt-3 block text-center py-2 bg-brand-100 border border-brand-200 rounded-xl text-brand-700 text-xs font-medium hover:bg-brand-200 transition-colors cursor-pointer"
              >
                Tailor with AI
              </a>
            )}
          </div>
        </div>

        {/* Section editor */}
        <div className="glass-card rounded-2xl p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeSection === "personal" && (
                <PersonalInfoSection data={personalInfo} onChange={setPersonalInfo} />
              )}
              {activeSection === "summary" && (
                <SummarySection
                  value={summary}
                  onChange={setSummary}
                  onAiSuggest={handleAiSuggestion}
                  aiLoading={aiLoading}
                />
              )}
              {activeSection === "experience" && (
                <ExperienceSection items={experience} onChange={setExperience} />
              )}
              {activeSection === "education" && (
                <EducationSection items={education} onChange={setEducation} />
              )}
              {activeSection === "skills" && (
                <SkillsSection groups={skills} onChange={setSkills} />
              )}
              {activeSection === "projects" && (
                <ProjectsSection items={projects} onChange={setProjects} />
              )}
              {activeSection === "certifications" && (
                <CertificationsSection items={certifications} onChange={setCertifications} />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
            <button
              onClick={() => {
                const idx = sections.findIndex((s) => s.id === activeSection);
                if (idx > 0) setActiveSection(sections[idx - 1].id);
              }}
              disabled={activeSection === sections[0].id}
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-slate-700 disabled:opacity-30 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <button
              onClick={() => {
                const idx = sections.findIndex((s) => s.id === activeSection);
                if (idx < sections.length - 1) setActiveSection(sections[idx + 1].id);
              }}
              disabled={activeSection === sections[sections.length - 1].id}
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-slate-700 disabled:opacity-30 transition-colors cursor-pointer"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Personal Info Section ────────────────────────────────────────────────────

function PersonalInfoSection({ data, onChange }: {
  data: Record<string, string>;
  onChange: (d: Record<string, string>) => void;
}) {
  const fields = [
    { key: "name", label: "Full Name", placeholder: "Alex Johnson", span: 2 },
    { key: "title", label: "Professional Title", placeholder: "Senior Software Engineer", span: 2 },
    { key: "email", label: "Email", placeholder: "alex@example.com", span: 1 },
    { key: "phone", label: "Phone", placeholder: "+1 (555) 123-4567", span: 1 },
    { key: "location", label: "Location", placeholder: "San Francisco, CA", span: 1 },
    { key: "website", label: "Website", placeholder: "alexjohnson.dev", span: 1 },
    { key: "linkedin", label: "LinkedIn", placeholder: "linkedin.com/in/alexjohnson", span: 1 },
    { key: "github", label: "GitHub", placeholder: "github.com/alexjohnson", span: 1 },
  ];

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
        <User className="w-5 h-5 text-brand-700" />
        Personal Information
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {fields.map(({ key, label, placeholder, span }) => (
          <div key={key} className={span === 2 ? "col-span-2" : "col-span-2 sm:col-span-1"}>
            <label className="block text-sm font-medium text-slate-500 mb-1.5">{label}</label>
            <input
              value={data[key] || ""}
              onChange={(e) => onChange({ ...data, [key]: e.target.value })}
              placeholder={placeholder}
              className="input-dark w-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Summary Section ──────────────────────────────────────────────────────────

function SummarySection({ value, onChange, onAiSuggest, aiLoading }: {
  value: string;
  onChange: (v: string) => void;
  onAiSuggest: () => void;
  aiLoading: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-brand-700" />
          Professional Summary
        </h2>
        <button
          onClick={onAiSuggest}
          disabled={aiLoading}
          className="flex items-center gap-2 px-4 py-2 bg-brand-100 border border-brand-200 text-brand-700 text-sm font-medium rounded-xl hover:bg-brand-200 transition-all cursor-pointer disabled:opacity-50"
        >
          {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          AI Write
        </button>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write a compelling 2-3 sentence summary of your experience, skills, and career goals. Focus on your most relevant achievements..."
        rows={6}
        className="input-dark w-full resize-none leading-relaxed"
      />
      <div className="text-xs text-slate-400 mt-2 text-right">
        {value.split(/\s+/).filter(Boolean).length} words (aim for 50-80)
      </div>
    </div>
  );
}

// ─── Experience Section ───────────────────────────────────────────────────────

interface ExperienceItem {
  id: string;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

function ExperienceSection({ items, onChange }: {
  items: ExperienceItem[];
  onChange: (items: ExperienceItem[]) => void;
}) {
  const addItem = () => {
    onChange([...items, {
      id: generateId(),
      company: "",
      title: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      bullets: [""],
    }]);
  };

  const updateItem = (id: string, updates: Partial<ExperienceItem>) => {
    onChange(items.map((item) => item.id === id ? { ...item, ...updates } : item));
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-brand-700" />
          Work Experience
        </h2>
        <button onClick={addItem} className="flex items-center gap-2 text-sm text-brand-700 hover:text-brand-800 cursor-pointer">
          <PlusCircle className="w-4 h-4" />
          Add Position
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-10 text-slate-400">
          <Briefcase className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No experience added yet</p>
          <button onClick={addItem} className="mt-3 text-brand-700 text-sm hover:underline cursor-pointer">
            Add your first position
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {items.map((item) => (
            <div key={item.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <GripVertical className="w-4 h-4" />
                  Drag to reorder
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all cursor-pointer"
                  aria-label="Remove experience"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Job Title</label>
                  <input
                    value={item.title}
                    onChange={(e) => updateItem(item.id, { title: e.target.value })}
                    placeholder="Senior Software Engineer"
                    className="input-dark w-full text-sm"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Company</label>
                  <input
                    value={item.company}
                    onChange={(e) => updateItem(item.id, { company: e.target.value })}
                    placeholder="Google"
                    className="input-dark w-full text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Location</label>
                  <input
                    value={item.location}
                    onChange={(e) => updateItem(item.id, { location: e.target.value })}
                    placeholder="San Francisco, CA"
                    className="input-dark w-full text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Start Date</label>
                  <input
                    value={item.startDate}
                    onChange={(e) => updateItem(item.id, { startDate: e.target.value })}
                    placeholder="Jan 2022"
                    className="input-dark w-full text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">End Date</label>
                  <input
                    value={item.endDate}
                    onChange={(e) => updateItem(item.id, { endDate: e.target.value })}
                    placeholder="Present"
                    disabled={item.current}
                    className="input-dark w-full text-sm disabled:opacity-40"
                  />
                </div>
                <div className="flex items-end pb-3">
                  <label className="flex items-center gap-2 text-sm text-slate-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.current}
                      onChange={(e) => updateItem(item.id, { current: e.target.checked, endDate: e.target.checked ? "Present" : "" })}
                      className="accent-brand-700"
                    />
                    Current position
                  </label>
                </div>
              </div>

              {/* Bullet points */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-2">
                  Key Achievements (use numbers & impact)
                </label>
                <div className="space-y-2">
                  {item.bullets.map((bullet, bi) => (
                    <div key={bi} className="flex items-start gap-2">
                      <div className="w-4 h-4 mt-3 flex-shrink-0 text-brand-500">•</div>
                      <textarea
                        value={bullet}
                        onChange={(e) => {
                          const newBullets = [...item.bullets];
                          newBullets[bi] = e.target.value;
                          updateItem(item.id, { bullets: newBullets });
                        }}
                        placeholder="Led migration of monolith to microservices, reducing latency by 40%..."
                        rows={2}
                        className="input-dark flex-1 text-sm resize-none leading-relaxed"
                      />
                      <button
                        onClick={() => {
                          const newBullets = item.bullets.filter((_, i) => i !== bi);
                          updateItem(item.id, { bullets: newBullets });
                        }}
                        className="mt-2 p-1.5 hover:bg-red-50 rounded-lg text-slate-300 hover:text-red-500 transition-all cursor-pointer flex-shrink-0"
                        aria-label="Remove bullet"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => updateItem(item.id, { bullets: [...item.bullets, ""] })}
                    className="flex items-center gap-2 text-xs text-brand-700 hover:text-brand-800 cursor-pointer mt-1"
                  >
                    <PlusCircle className="w-3 h-3" />
                    Add bullet point
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Education Section ────────────────────────────────────────────────────────

interface EducationItem {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa: string;
}

function EducationSection({ items, onChange }: {
  items: EducationItem[];
  onChange: (items: EducationItem[]) => void;
}) {
  const addItem = () => {
    onChange([...items, {
      id: generateId(),
      school: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      gpa: "",
    }]);
  };

  const updateItem = (id: string, updates: Partial<EducationItem>) => {
    onChange(items.map((item) => item.id === id ? { ...item, ...updates } : item));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-brand-700" />
          Education
        </h2>
        <button onClick={addItem} className="flex items-center gap-2 text-sm text-brand-700 hover:text-brand-800 cursor-pointer">
          <PlusCircle className="w-4 h-4" />
          Add Education
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">School / University</label>
                <input
                  value={item.school}
                  onChange={(e) => updateItem(item.id, { school: e.target.value })}
                  placeholder="MIT"
                  className="input-dark w-full text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Degree</label>
                <input
                  value={item.degree}
                  onChange={(e) => updateItem(item.id, { degree: e.target.value })}
                  placeholder="Bachelor of Science"
                  className="input-dark w-full text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Field of Study</label>
                <input
                  value={item.field}
                  onChange={(e) => updateItem(item.id, { field: e.target.value })}
                  placeholder="Computer Science"
                  className="input-dark w-full text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Start Year</label>
                <input
                  value={item.startDate}
                  onChange={(e) => updateItem(item.id, { startDate: e.target.value })}
                  placeholder="2018"
                  className="input-dark w-full text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">End Year</label>
                <input
                  value={item.endDate}
                  onChange={(e) => updateItem(item.id, { endDate: e.target.value })}
                  placeholder="2022"
                  className="input-dark w-full text-sm"
                />
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <button onClick={addItem} className="text-brand-700 text-sm cursor-pointer">Add education</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Skills Section ───────────────────────────────────────────────────────────

interface SkillGroup {
  id: string;
  category: string;
  items: string[];
}

function SkillsSection({ groups, onChange }: {
  groups: SkillGroup[];
  onChange: (groups: SkillGroup[]) => void;
}) {
  const addGroup = () => {
    onChange([...groups, { id: generateId(), category: "", items: [] }]);
  };

  const updateGroup = (id: string, updates: Partial<SkillGroup>) => {
    onChange(groups.map((g) => g.id === id ? { ...g, ...updates } : g));
  };

  const removeGroup = (id: string) => {
    onChange(groups.filter((g) => g.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Code className="w-5 h-5 text-brand-700" />
          Skills
        </h2>
        <button onClick={addGroup} className="flex items-center gap-2 text-sm text-brand-700 hover:text-brand-800 cursor-pointer">
          <PlusCircle className="w-4 h-4" />
          Add Category
        </button>
      </div>

      <div className="space-y-4">
        {groups.map((group) => (
          <div key={group.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <input
                value={group.category}
                onChange={(e) => updateGroup(group.id, { category: e.target.value })}
                placeholder="Category (e.g. Programming Languages)"
                className="input-dark flex-1 text-sm"
              />
              <button
                onClick={() => removeGroup(group.id)}
                className="p-1.5 hover:bg-red-50 rounded-lg text-slate-300 hover:text-red-500 transition-all cursor-pointer"
                aria-label="Remove skill group"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <input
              value={group.items.join(", ")}
              onChange={(e) => updateGroup(group.id, { items: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
              placeholder="Python, TypeScript, Go, Rust (comma separated)"
              className="input-dark w-full text-sm"
            />
            <div className="flex flex-wrap gap-2 mt-3">
              {group.items.map((skill) => (
                <span key={skill} className="badge-brand">{skill}</span>
              ))}
            </div>
          </div>
        ))}
        {groups.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <button onClick={addGroup} className="text-brand-700 text-sm cursor-pointer">Add skill categories</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Projects Section ─────────────────────────────────────────────────────────

interface ProjectItem {
  id: string;
  name: string;
  description: string;
  bullets: string[];
  tech: string[];
  url: string;
}

function ProjectsSection({ items, onChange }: {
  items: ProjectItem[];
  onChange: (items: ProjectItem[]) => void;
}) {
  const addItem = () => {
    onChange([...items, { id: generateId(), name: "", description: "", bullets: [""], tech: [], url: "" }]);
  };

  const updateItem = (id: string, updates: Partial<ProjectItem>) => {
    onChange(items.map((item) => item.id === id ? { ...item, ...updates } : item));
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-brand-700" />
          Projects
        </h2>
        <button onClick={addItem} className="flex items-center gap-2 text-sm text-brand-700 hover:text-brand-800 cursor-pointer">
          <PlusCircle className="w-4 h-4" />
          Add Project
        </button>
      </div>

      <div className="space-y-6">
        {items.map((item) => (
          <div key={item.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-3">
              <input
                value={item.name}
                onChange={(e) => updateItem(item.id, { name: e.target.value })}
                placeholder="Project name"
                className="input-dark flex-1 text-sm font-semibold"
              />
              <button
                onClick={() => removeItem(item.id)}
                className="p-1.5 hover:bg-red-50 rounded-lg text-slate-300 hover:text-red-500 transition-all cursor-pointer"
                aria-label="Remove project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <input
              value={item.url}
              onChange={(e) => updateItem(item.id, { url: e.target.value })}
              placeholder="URL (optional)"
              className="input-dark w-full text-sm"
            />
            <input
              value={item.tech.join(", ")}
              onChange={(e) => updateItem(item.id, { tech: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
              placeholder="Tech stack: React, Node.js, PostgreSQL"
              className="input-dark w-full text-sm"
            />
            <div className="space-y-2">
              {item.bullets.map((bullet, bi) => (
                <div key={bi} className="flex items-start gap-2">
                  <div className="text-brand-500 mt-3">•</div>
                  <textarea
                    value={bullet}
                    onChange={(e) => {
                      const newBullets = [...item.bullets];
                      newBullets[bi] = e.target.value;
                      updateItem(item.id, { bullets: newBullets });
                    }}
                    placeholder="Built feature X that reduced Y by Z%..."
                    rows={2}
                    className="input-dark flex-1 text-sm resize-none"
                  />
                </div>
              ))}
              <button
                onClick={() => updateItem(item.id, { bullets: [...item.bullets, ""] })}
                className="text-xs text-brand-700 hover:text-brand-800 cursor-pointer flex items-center gap-1"
              >
                <PlusCircle className="w-3 h-3" />
                Add bullet
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <button onClick={addItem} className="text-brand-700 text-sm cursor-pointer">Add a project</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Certifications Section ───────────────────────────────────────────────────

interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url: string;
}

function CertificationsSection({ items, onChange }: {
  items: CertificationItem[];
  onChange: (items: CertificationItem[]) => void;
}) {
  const addItem = () => {
    onChange([...items, { id: generateId(), name: "", issuer: "", date: "", url: "" }]);
  };

  const updateItem = (id: string, updates: Partial<CertificationItem>) => {
    onChange(items.map((item) => item.id === id ? { ...item, ...updates } : item));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-brand-700" />
          Certifications
        </h2>
        <button onClick={addItem} className="flex items-center gap-2 text-sm text-brand-700 hover:text-brand-800 cursor-pointer">
          <PlusCircle className="w-4 h-4" />
          Add Certification
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <input
                  value={item.name}
                  onChange={(e) => updateItem(item.id, { name: e.target.value })}
                  placeholder="AWS Certified Solutions Architect"
                  className="input-dark w-full text-sm font-semibold"
                />
              </div>
              <input
                value={item.issuer}
                onChange={(e) => updateItem(item.id, { issuer: e.target.value })}
                placeholder="Amazon Web Services"
                className="input-dark w-full text-sm"
              />
              <input
                value={item.date}
                onChange={(e) => updateItem(item.id, { date: e.target.value })}
                placeholder="Jan 2024"
                className="input-dark w-full text-sm"
              />
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <button onClick={addItem} className="text-brand-700 text-sm cursor-pointer">Add certifications</button>
          </div>
        )}
      </div>
    </div>
  );
}
