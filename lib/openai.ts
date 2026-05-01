import { GoogleGenerativeAI } from "@google/generative-ai";

// ─── Gemini client ─────────────────────────────────────────────────────────────

function getGenAI() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set in .env.local");
  return new GoogleGenerativeAI(key);
}

const MODEL = () => process.env.GEMINI_MODEL || "gemini-2.5-flash";

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Message = { role: "system" | "user" | "assistant"; content: string };

interface ChatOptions {
  temperature?: number;
  topP?: number;
  jsonMode?: boolean;
}

async function chat(messages: Message[], opts: ChatOptions = {}): Promise<string> {
  const genAI = getGenAI();

  // Separate system instruction from conversation messages
  const systemMsg = messages.find((m) => m.role === "system");
  const convMessages = messages.filter((m) => m.role !== "system");

  const jsonMode = opts.jsonMode !== false;

  const model = genAI.getGenerativeModel({
    model: MODEL(),
    ...(systemMsg ? { systemInstruction: systemMsg.content } : {}),
    generationConfig: {
      ...(jsonMode ? { responseMimeType: "application/json" } : {}),
      ...(opts.temperature !== undefined ? { temperature: opts.temperature } : {}),
      ...(opts.topP !== undefined ? { topP: opts.topP } : {}),
    },
  });

  const contents = convMessages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const result = await model.generateContent({ contents });
  const text = result.response.text();

  if (!text) throw new Error("Empty response from Gemini");
  return text;
}

function extractJSON(text: string): string {
  // Strip markdown code fences if present
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();
  // Find the first { or [ and return from there
  const objStart = text.indexOf("{");
  const arrStart = text.indexOf("[");
  if (objStart === -1 && arrStart === -1) throw new Error("No JSON found in AI response");
  const start = objStart === -1 ? arrStart : arrStart === -1 ? objStart : Math.min(objStart, arrStart);
  return text.slice(start);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TailorResult {
  tailoredResume: ResumeData;
  suggestions: string[];
  missingKeywords: string[];
  extractedSkills: string[];
  atsScoreBefore: number;
  atsScoreAfter: number;
  keywordMatchPct: number;
  changes: Array<{ section: string; change: string }>;
  coverLetter: string;
  interviewQuestions: Array<{ question: string; category: string; tip: string }>;
  atsSimulation: {
    workday: number;
    greenhouse: number;
    lever: number;
    taleo: number;
    notes: string[];
  };
  gapClassification: {
    dealBreakers: Array<{ skill: string; reason: string }>;
    niceToHave: Array<{ skill: string; reason: string }>;
    framingIssues: Array<{ skill: string; fix: string }>;
  };
}

export interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    website?: string;
    title?: string;
  };
  summary?: string;
  experience: Array<{
    id: string;
    company: string;
    title: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    bullets: string[];
  }>;
  education: Array<{
    id: string;
    school: string;
    degree: string;
    field?: string;
    startDate?: string;
    endDate?: string;
    gpa?: string;
  }>;
  skills: Array<{ id: string; category: string; items: string[] }>;
  projects: Array<{
    id: string;
    name: string;
    description: string;
    bullets: string[];
    tech: string[];
    url?: string;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    date?: string;
    url?: string;
  }>;
}

// ─── Resume Tailoring ─────────────────────────────────────────────────────────

export async function tailorResume(
  resume: ResumeData,
  jobDescription: string,
  jobTitle: string
): Promise<TailorResult> {
  // Trim job description to ~3000 chars to stay within token limits
  const jdTrimmed = jobDescription.slice(0, 3000);

  const systemPrompt = `You are a resume editor. Your output must read like a real working professional wrote it — not AI. Output that fails AI-detector tools (GPTZero, Originality.ai, Copyleaks, ZeroGPT) is unacceptable.

JOB:
- Output tailoredResume MUST include EVERY experience role from the input — same count, same order, same id, company, title, location, dates. Never omit a role.
- Output tailoredResume MUST include EVERY project from the input — same id, name, tech, url. Never omit a project.
- Keep personalInfo, education, and certifications exactly as-is
- ALWAYS include a "summary" field — if input has one, refine it for the JD; if missing, write a 2-3 sentence professional summary aligned to the JD
- For experience: PRESERVE every existing bullet for every role (never drop a bullet) and append 2-4 NEW bullets per role that match key JD requirements (tools, methodologies, outcomes). Frame new bullets as things the candidate plausibly did in that role even if not listed
- If a role in input has empty bullets, generate 5-7 fresh bullets for it based on the role title/company/dates and the JD
- Every experience role MUST end with a non-empty "bullets" array of strings — never return an empty bullets array
- Add missing JD keywords into existing AND new bullets naturally
- Keep bullets concise, impact-driven
- Add any missing skills from the JD to the skills section (preserve all existing skill groups)
- Return ONLY valid JSON

ANTI-AI-DETECTOR RULES (highest priority — violating these makes output unusable):

1. BURSTY rhythm. Alternate very short bullets (5-9 words) with longer ones (16-24 words). Never put 3 similar-length bullets in a row. AI detectors flag uniform length.

2. NON-PARALLEL openings. Do NOT start every bullet with a past-tense verb. Across a single role, mix:
   - Plain verb: "Built the retry logic for..."
   - Context first: "After a bad incident, rewrote the..."
   - Number first: "40% fewer pages for oncall after..."
   - Tool/situation first: "On the new pipeline, owned..."
   - Fragment: "Cut DB writes 3x. Found a race condition in..."
   At least 3 different opening styles per role.

3. IMPERFECT numbers. Use "around 40%", "roughly 8 hrs/week", "~150ms", "about 12 engineers" sometimes — not always clean round numbers. Real people estimate.

4. DOMAIN slang. Use natural professional speech where it fits: "wired up", "shipped behind a flag", "moved off", "stood up", "ripped out", "ran point on", "got rid of", "flaky tests", "noisy alerts", "took over", "owned end-to-end".

5. ONE stylistic quirk per role minimum: an em-dash mid-sentence, a colon-led clause, a parenthetical aside, or a fragment.

6. BANNED words/phrases (never appear): spearheaded, leveraged, synergized, utilized, orchestrated, streamlined, cutting-edge, best-in-class, game-changing, revolutionized, harnessed, pivotal, robust, scalable, innovative, dynamic, passionate, results-driven, thought leader, deep dive, ecosystem, paradigm, holistic, seamlessly, proactively, overarching, transformative, comprehensive, ensured, facilitated, implemented, in order to, as well as, key stakeholders, deliverables, synergies, best practices, state-of-the-art.

7. PREFERRED verbs: built, wrote, led, ran, fixed, shipped, cut, grew, reduced, added, improved, helped, managed, worked on, set up, moved, owned, drove, hired, killed, replaced, rewrote, debugged, profiled, tuned, scoped, pitched, mentored, paired.

8. NO templated phrasing. Avoid the pattern "[verb] [thing] [resulting in/leading to/which] [metric]" repeating 3+ times in a section. Vary the connector and structure.

9. ONE concrete detail per bullet — a number, a tool name, a team size, a deadline, a system. Vague claims look AI-written.

10. Write like the person told a friend over coffee, then cleaned it up. Voice over polish.`;

  const userPrompt = `Job Title: ${jobTitle}
Job Description: ${jdTrimmed}
Resume: ${JSON.stringify(resume)}

Return a single JSON object with this exact structure:
{
  "tailoredResume": { ...complete resume data },
  "suggestions": ["suggestion 1", "suggestion 2"],
  "missingKeywords": ["keyword1"],
  "extractedSkills": ["skill1"],
  "atsScoreBefore": 65,
  "atsScoreAfter": 87,
  "keywordMatchPct": 78.5,
  "changes": [{ "section": "experience", "change": "Added Docker to Senior Engineer role" }],
  "atsSimulation": { "workday": 84, "greenhouse": 89, "lever": 91, "taleo": 79, "notes": ["note1"] },
  "gapClassification": {
    "dealBreakers": [{ "skill": "Kubernetes", "reason": "Required, not in resume" }],
    "niceToHave": [{ "skill": "Terraform", "reason": "Preferred" }],
    "framingIssues": [{ "skill": "CI/CD", "fix": "Rephrase Jenkins as CI/CD pipeline" }]
  },
  "coverLetter": "Dear Hiring Manager,\\n\\n[paragraph 1]\\n\\n[paragraph 2]\\n\\n[paragraph 3]\\n\\nSincerely,\\n[Name]",
  "interviewQuestions": [{ "question": "...", "category": "Technical", "tip": "..." }]
}`;

  const raw = await chat(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    { temperature: 0.95, topP: 0.95 }
  );

  let parsed: TailorResult;
  try {
    parsed = JSON.parse(extractJSON(raw)) as TailorResult;
  } catch {
    throw new Error("AI returned invalid JSON. Please try again.");
  }

  // Restore content the model may have dropped or returned empty.
  parsed.tailoredResume = restoreMissingFields(parsed.tailoredResume, resume);

  // Second pass: humanize the tailored content to defeat AI detectors.
  // Gated by env flag — adds a second LLM call which can blow Vercel timeout.
  if (process.env.HUMANIZE_PASS_ENABLED === "true") {
    try {
      parsed.tailoredResume = await humanizeResumeContent(parsed.tailoredResume);
    } catch (e) {
      console.warn("Humanize pass failed:", e);
    }
  }

  return parsed;
}

// Use original resume as the structural source of truth. Only let the model
// contribute additions: refined summary, extra bullets per role, extra skills.
// Never let it drop roles, projects, certifications, or education.
function restoreMissingFields(tailored: ResumeData, original: ResumeData): ResumeData {
  const cleanBullets = (arr: unknown): string[] =>
    Array.isArray(arr) ? arr.filter((b): b is string => typeof b === "string" && b.trim().length > 0) : [];

  const findTailoredRole = (orig: ResumeData["experience"][number]) => {
    const list = tailored.experience || [];
    const byId = list.find((r) => r.id && r.id === orig.id);
    if (byId) return byId;
    const norm = (s?: string) => (s || "").trim().toLowerCase();
    return list.find(
      (r) => norm(r.company) === norm(orig.company) && norm(r.title) === norm(orig.title),
    );
  };

  const findTailoredProject = (orig: ResumeData["projects"][number]) => {
    const list = tailored.projects || [];
    const byId = list.find((p) => p.id && p.id === orig.id);
    if (byId) return byId;
    return list.find((p) => (p.name || "").trim().toLowerCase() === (orig.name || "").trim().toLowerCase());
  };

  const mergedExperience: ResumeData["experience"] = original.experience.map((orig) => {
    const t = findTailoredRole(orig);
    const origBullets = cleanBullets(orig.bullets);
    const tailoredBullets = cleanBullets(t?.bullets);
    const seen = new Set(origBullets.map((b) => b.trim().toLowerCase()));
    const newBullets = tailoredBullets.filter((b) => !seen.has(b.trim().toLowerCase()));
    return { ...orig, bullets: [...origBullets, ...newBullets] };
  });

  const mergedProjects: ResumeData["projects"] = original.projects.map((orig) => {
    const t = findTailoredProject(orig);
    const origBullets = cleanBullets(orig.bullets);
    const tailoredBullets = cleanBullets(t?.bullets);
    const seen = new Set(origBullets.map((b) => b.trim().toLowerCase()));
    const newBullets = tailoredBullets.filter((b) => !seen.has(b.trim().toLowerCase()));
    return { ...orig, bullets: [...origBullets, ...newBullets] };
  });

  // Skills: union original + new categories/items the model added.
  const mergedSkills: ResumeData["skills"] = (() => {
    const map = new Map<string, Set<string>>();
    for (const group of original.skills || []) {
      const key = (group.category || "Skills").trim();
      if (!map.has(key)) map.set(key, new Set());
      for (const item of group.items || []) if (item?.trim()) map.get(key)!.add(item.trim());
    }
    for (const group of tailored.skills || []) {
      const key = (group.category || "Skills").trim();
      if (!map.has(key)) map.set(key, new Set());
      for (const item of group.items || []) if (item?.trim()) map.get(key)!.add(item.trim());
    }
    return Array.from(map.entries()).map(([category, items], i) => ({
      id: `skill-${i + 1}`,
      category,
      items: Array.from(items),
    }));
  })();

  return {
    personalInfo: { ...original.personalInfo, ...tailored.personalInfo },
    summary: tailored.summary?.trim() ? tailored.summary : original.summary,
    experience: mergedExperience,
    education: original.education,
    skills: mergedSkills.length ? mergedSkills : original.skills,
    projects: mergedProjects,
    certifications: original.certifications,
  };
}

// ─── Humanizer (anti-AI-detector pass) ────────────────────────────────────────
// Rewrites summary + experience bullets + project bullets so output looks
// human-written to AI detectors (GPTZero, Originality.ai, Copyleaks, ZeroGPT).

const HUMANIZE_SYSTEM = `You rewrite resume text so it reads as human-written and defeats AI text detectors (GPTZero, Originality.ai, Copyleaks, ZeroGPT).

KEEP all factual content — companies, tools, numbers, dates, accomplishments. ONLY change *how* it is phrased.

PRINCIPLES:
- BURSTINESS: vary sentence length aggressively. Short fragments (4-8 words) next to longer ones (18-26 words). Avoid uniform length runs.
- PERPLEXITY: pick less-predictable phrasing. Avoid the phrase a typical LLM would emit. Lean on professional slang: "wired up", "stood up", "moved off", "ripped out", "ran point on", "got rid of", "took over", "shipped behind a flag", "owned end-to-end".
- NON-PARALLEL openings: don't start every bullet with the same word class. Mix verb-first, context-first ("After the migration..."), number-first ("Roughly 40%..."), fragment.
- IMPERFECT numbers: change clean round numbers to estimates sometimes — "50%" → "about half", "100ms" → "~100ms". Real people estimate.
- ONE quirk per bullet minimum: em-dash mid-sentence, colon-led clause, a parenthetical aside, or a fragment.
- BANNED words (never output): spearheaded, leveraged, synergized, utilized, orchestrated, streamlined, cutting-edge, best-in-class, game-changing, revolutionized, harnessed, pivotal, robust, scalable, innovative, dynamic, passionate, results-driven, thought leader, deep dive, ecosystem, paradigm, holistic, seamlessly, proactively, overarching, transformative, comprehensive, ensured, facilitated, implemented, in order to, as well as, key stakeholders, deliverables, synergies, best practices, state-of-the-art.
- PREFERRED verbs: built, wrote, led, ran, fixed, shipped, cut, grew, reduced, added, improved, helped, managed, worked on, set up, moved, owned, drove, killed, replaced, rewrote, debugged, profiled, tuned, scoped, pitched, mentored, paired.
- Avoid the templated pattern "[verb] X [resulting in/leading to/which] Y" three or more times in a row.
- Keep ATS keywords intact.

Output ONLY valid JSON, same shape as the input — a JSON object mapping each input id to the rewritten text.`;

interface HumanizeItem {
  id: string;
  text: string;
}

export async function humanizeResumeContent(resume: ResumeData): Promise<ResumeData> {
  const items: HumanizeItem[] = [];

  if (resume.summary && resume.summary.trim()) {
    items.push({ id: "summary", text: resume.summary });
  }

  resume.experience.forEach((exp, i) => {
    exp.bullets.forEach((b, j) => {
      if (b && b.trim()) items.push({ id: `exp-${i}-${j}`, text: b });
    });
  });

  resume.projects.forEach((proj, i) => {
    if (proj.description && proj.description.trim()) {
      items.push({ id: `pdesc-${i}`, text: proj.description });
    }
    proj.bullets.forEach((b, j) => {
      if (b && b.trim()) items.push({ id: `proj-${i}-${j}`, text: b });
    });
  });

  if (items.length === 0) return resume;

  const userPrompt = `Rewrite each item below to read as natural human-written resume text and defeat AI text detectors. Preserve every fact, number, tool, and keyword — only change phrasing/rhythm.

Input items (JSON):
${JSON.stringify(items)}

Return ONLY a JSON object mapping each id to its rewritten text. Example:
{"summary": "rewritten summary...", "exp-0-0": "rewritten bullet...", ...}

Every input id MUST appear in the output. Do not add new ids.`;

  const raw = await chat(
    [
      { role: "system", content: HUMANIZE_SYSTEM },
      { role: "user", content: userPrompt },
    ],
    { temperature: 1.0, topP: 0.98 }
  );

  let map: Record<string, string>;
  try {
    map = JSON.parse(extractJSON(raw)) as Record<string, string>;
  } catch {
    return resume; // bail silently — keep original text
  }

  const get = (id: string, fallback: string) =>
    typeof map[id] === "string" && map[id].trim() ? map[id] : fallback;

  return {
    ...resume,
    summary: resume.summary ? get("summary", resume.summary) : resume.summary,
    experience: resume.experience.map((exp, i) => ({
      ...exp,
      bullets: exp.bullets.map((b, j) => get(`exp-${i}-${j}`, b)),
    })),
    projects: resume.projects.map((proj, i) => ({
      ...proj,
      description: proj.description ? get(`pdesc-${i}`, proj.description) : proj.description,
      bullets: proj.bullets.map((b, j) => get(`proj-${i}-${j}`, b)),
    })),
  };
}

// ─── ATS Score ────────────────────────────────────────────────────────────────

export interface ATSResult {
  score: number;
  keywordMatch: number;
  formatScore: number;
  suggestions: string[];
  missingKeywords: string[];
  foundKeywords: string[];
  sectionScores: Record<string, number>;
}

export async function calculateATSScore(
  resume: ResumeData,
  jobDescription?: string
): Promise<ATSResult> {
  const prompt = `Analyze this resume for ATS compatibility.
${jobDescription ? `Job Description: ${jobDescription.slice(0, 2000)}` : ""}
Resume: ${JSON.stringify(resume)}

Return ONLY valid JSON:
{
  "score": 75,
  "keywordMatch": 80,
  "formatScore": 90,
  "suggestions": ["suggestion1"],
  "missingKeywords": ["keyword1"],
  "foundKeywords": ["keyword1"],
  "sectionScores": { "summary": 80, "experience": 85, "skills": 90, "education": 95, "formatting": 88 }
}`;

  const raw = await chat([{ role: "user", content: prompt }]);
  try {
    return JSON.parse(extractJSON(raw)) as ATSResult;
  } catch {
    throw new Error("Failed to parse ATS score response");
  }
}

// ─── Section Suggestions ──────────────────────────────────────────────────────

export async function getSectionSuggestion(
  section: string,
  content: string,
  context?: string
): Promise<string[]> {
  const prompt = `Rewrite this ${section} section to read as human-written and defeat AI text detectors (GPTZero, Originality.ai, Copyleaks, ZeroGPT).
${context ? `Target role: ${context}` : ""}
Current content: ${content}

Rules:
- BURSTY rhythm — alternate short fragments with longer sentences
- NON-PARALLEL openings — don't always start with a verb
- IMPERFECT numbers — "around 40%", "~150ms"
- Domain slang OK: "wired up", "stood up", "ripped out", "moved off", "shipped behind a flag"
- One stylistic quirk per version: em-dash, colon clause, fragment, or parenthetical
- BANNED: spearheaded, leveraged, synergized, utilized, orchestrated, streamlined, cutting-edge, robust, innovative, dynamic, passionate, results-driven, thought leader, holistic, seamlessly, proactively, transformative, comprehensive, ensured, facilitated, implemented, in order to, as well as, key stakeholders, deliverables, best practices
- PREFERRED verbs: built, wrote, led, ran, fixed, shipped, cut, grew, reduced, added, improved, owned, drove, replaced, rewrote, tuned

Return ONLY a JSON array of 3 distinctly different rewrites:
["version1", "version2", "version3"]`;

  const raw = await chat(
    [{ role: "user", content: prompt }],
    { temperature: 1.0, topP: 0.95 }
  );
  try {
    const parsed = JSON.parse(extractJSON(raw));
    return Array.isArray(parsed) ? parsed : parsed.suggestions || [];
  } catch {
    return [];
  }
}

// ─── Resume Parsing ───────────────────────────────────────────────────────────

export async function parseResumeText(text: string): Promise<ResumeData> {
  const prompt = `Parse this resume text into structured JSON data.

Extraction rules:
- Capture EVERY bullet point under each experience role. A bullet is any line that starts with •, -, ▪, *, →, or appears as a discrete sentence describing a responsibility/achievement under a role. Do not summarize, merge, or drop bullets — preserve them verbatim.
- Each experience role's "bullets" array MUST contain every bullet found under that role in the source text.
- Capture project bullets the same way.
- Preserve original wording for bullets, summary, skills.
- If a section is genuinely missing from the source, return an empty array for it (do not invent content).

Resume text:
${text}

Return ONLY valid JSON:
{
  "personalInfo": { "name": "", "email": "", "phone": "", "location": "", "linkedin": "", "github": "", "website": "", "title": "" },
  "summary": "",
  "experience": [{ "id": "exp-1", "company": "", "title": "", "location": "", "startDate": "MM/YYYY", "endDate": "MM/YYYY", "current": false, "bullets": ["bullet text 1", "bullet text 2"] }],
  "education": [{ "id": "edu-1", "school": "", "degree": "", "field": "", "startDate": "YYYY", "endDate": "YYYY", "gpa": "" }],
  "skills": [{ "id": "skill-1", "category": "Programming Languages", "items": [] }],
  "projects": [{ "id": "proj-1", "name": "", "description": "", "bullets": [], "tech": [], "url": "" }],
  "certifications": [{ "id": "cert-1", "name": "", "issuer": "", "date": "", "url": "" }]
}`;

  const raw = await chat([{ role: "user", content: prompt }]);
  try {
    return JSON.parse(extractJSON(raw)) as ResumeData;
  } catch {
    throw new Error("Failed to parse resume text with AI");
  }
}

// ─── AI Resume Generator (from scratch) ──────────────────────────────────────

export type ExperienceLevel = "fresher" | "junior" | "mid" | "senior" | "lead";

export interface GenerateResumeInput {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    github?: string;
  };
  targetRole: string;
  experienceLevel: ExperienceLevel;
}

const LEVEL_CONFIG: Record<ExperienceLevel, { years: string; roles: number; bulletsPerRole: number; label: string }> = {
  fresher: { years: "0-1 years",  roles: 1, bulletsPerRole: 5,  label: "Entry Level / Fresher" },
  junior:  { years: "1-3 years",  roles: 2, bulletsPerRole: 7,  label: "Junior (1-3 yrs)" },
  mid:     { years: "3-6 years",  roles: 3, bulletsPerRole: 10, label: "Mid-Level (3-6 yrs)" },
  senior:  { years: "6-10 years", roles: 4, bulletsPerRole: 12, label: "Senior (6-10 yrs)" },
  lead:    { years: "10+ years",  roles: 5, bulletsPerRole: 15, label: "Lead / Principal (10+ yrs)" },
};

export async function generateResumeFromScratch(input: GenerateResumeInput): Promise<ResumeData> {
  const { personalInfo, targetRole, experienceLevel } = input;
  const cfg = LEVEL_CONFIG[experienceLevel];

  const systemPrompt = `You write resumes that read as human-written and defeat AI text detectors (GPTZero, Originality.ai, Copyleaks, ZeroGPT). Output flagged as AI is unacceptable.

ANTI-AI-DETECTOR RULES (highest priority):

1. BURSTY rhythm. Alternate very short bullets (5-9 words) with longer ones (16-24 words). Never put 3 similar-length bullets in a row.

2. NON-PARALLEL openings. Across a single role, mix at least 3 styles:
   - Plain verb: "Built the retry logic for..."
   - Context first: "After a bad incident, rewrote..."
   - Number first: "40% fewer pages for oncall after..."
   - Tool/situation first: "On the new pipeline, owned..."
   - Fragment: "Cut DB writes 3x. Found a race condition in..."

3. IMPERFECT numbers. Mix clean numbers with estimates: "around 40%", "~150ms", "roughly 8 engineers", "about half".

4. DOMAIN slang. Use natural professional speech where it fits: "wired up", "shipped behind a flag", "moved off", "stood up", "ripped out", "ran point on", "got rid of", "flaky tests", "noisy alerts", "took over", "owned end-to-end".

5. ONE stylistic quirk per role minimum: em-dash mid-sentence, colon-led clause, parenthetical aside, or a fragment.

6. BANNED words/phrases (never appear): spearheaded, leveraged, synergized, utilized, orchestrated, streamlined, cutting-edge, best-in-class, game-changing, revolutionized, harnessed, pivotal, robust, scalable, innovative, dynamic, passionate, results-driven, thought leader, deep dive, ecosystem, paradigm, holistic, seamlessly, proactively, overarching, transformative, comprehensive, ensured, facilitated, implemented, in order to, as well as, key stakeholders, deliverables, synergies, best practices, state-of-the-art.

7. PREFERRED verbs: built, wrote, led, ran, fixed, shipped, cut, grew, reduced, added, improved, helped, managed, worked on, set up, moved, owned, drove, killed, replaced, rewrote, debugged, profiled, tuned, scoped, pitched, mentored, paired.

8. NO templated phrasing. Don't repeat "[verb] X [resulting in] Y" three times in a row. Vary the connector and structure.

9. ONE concrete detail per bullet — a number, a tool, a team size, a deadline.

10. Voice over polish. Write like the person told a friend over coffee, then cleaned it up.

Realistic company names, tech stacks, and career progression. Keywords woven in naturally for ATS.

Return ONLY valid JSON.`;

  const userPrompt = `Create a complete, realistic ATS-optimized resume for:

Name: ${personalInfo.name}
Email: ${personalInfo.email}
Phone: ${personalInfo.phone}
Location: ${personalInfo.location}
${personalInfo.linkedin ? `LinkedIn: ${personalInfo.linkedin}` : ""}
${personalInfo.github ? `GitHub: ${personalInfo.github}` : ""}
Target Role: ${targetRole}
Experience Level: ${cfg.label} (${cfg.years})

Requirements:
- Generate ${cfg.roles} realistic past job(s) with ${cfg.bulletsPerRole} bullet points each
- Each bullet must sound human-written with one concrete detail (e.g., "Cut API response time from 800ms to 120ms by switching to Redis caching")
- Vary bullet length — some short (8 words), some longer (15 words) — never all the same
- For fresher: use internships, academic projects, part-time roles
- For junior/mid: realistic company progression with growing responsibilities
- For senior/lead: include leadership, architecture decisions, team mentoring — described plainly
- Summary: 2-3 sentences, natural-sounding, first person implied but no "I", no buzzwords
- Skills: group by category (e.g., Languages, Frameworks, Tools, Cloud), include 6-10 items per group
- Certifications: include 2-3 relevant real certifications for this role/level
- Projects: include 2 relevant projects with tech stack — describe what it actually does, not vague
- Education: realistic degree relevant to the role
- Use realistic dates (end date of last job = present, work backwards)
- BANNED words in all output: spearheaded, leveraged, synergized, utilized, orchestrated, streamlined, cutting-edge, robust, innovative, dynamic, passionate, results-driven, thought leader, holistic, seamlessly, proactively, transformative

Return this exact JSON structure:
{
  "personalInfo": { "name": "${personalInfo.name}", "email": "${personalInfo.email}", "phone": "${personalInfo.phone}", "location": "${personalInfo.location}", "linkedin": "${personalInfo.linkedin || ""}", "github": "${personalInfo.github || ""}", "title": "[generated job title]" },
  "summary": "[3-4 sentence professional summary]",
  "experience": [
    { "id": "exp-1", "company": "[realistic company]", "title": "[job title]", "location": "[city, state]", "startDate": "MM/YYYY", "endDate": "MM/YYYY", "current": false, "bullets": ["[impact bullet 1]", "...${cfg.bulletsPerRole} total"] }
  ],
  "education": [{ "id": "edu-1", "school": "[university]", "degree": "[degree]", "field": "[field]", "startDate": "YYYY", "endDate": "YYYY", "gpa": "" }],
  "skills": [{ "id": "skill-1", "category": "[category]", "items": ["skill1", "skill2"] }],
  "projects": [{ "id": "proj-1", "name": "[project]", "description": "[1 line]", "bullets": ["[bullet]"], "tech": ["tech1"], "url": "" }],
  "certifications": [{ "id": "cert-1", "name": "[cert name]", "issuer": "[issuer]", "date": "YYYY", "url": "" }]
}`;

  const raw = await chat(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    { temperature: 0.95, topP: 0.95 }
  );

  let resume: ResumeData;
  try {
    resume = JSON.parse(extractJSON(raw)) as ResumeData;
  } catch {
    throw new Error("AI returned invalid JSON. Please try again.");
  }

  // Second pass: humanize to defeat AI detectors.
  // Gated by env flag — adds a second LLM call which can blow Vercel timeout.
  if (process.env.HUMANIZE_PASS_ENABLED === "true") {
    try {
      resume = await humanizeResumeContent(resume);
    } catch (e) {
      console.warn("Humanize pass failed:", e);
    }
  }

  return resume;
}
