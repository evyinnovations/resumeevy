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
  thinkingBudget?: number;
}

async function chat(messages: Message[], opts: ChatOptions = {}): Promise<string> {
  const genAI = getGenAI();

  // Separate system instruction from conversation messages
  const systemMsg = messages.find((m) => m.role === "system");
  const convMessages = messages.filter((m) => m.role !== "system");

  const jsonMode = opts.jsonMode !== false;
  // Default: disable thinking for 2.5 models to cut latency. Override via opts.
  const thinkingBudget = opts.thinkingBudget !== undefined ? opts.thinkingBudget : 0;

  const model = genAI.getGenerativeModel({
    model: MODEL(),
    ...(systemMsg ? { systemInstruction: systemMsg.content } : {}),
    generationConfig: {
      ...(jsonMode ? { responseMimeType: "application/json" } : {}),
      ...(opts.temperature !== undefined ? { temperature: opts.temperature } : {}),
      ...(opts.topP !== undefined ? { topP: opts.topP } : {}),
      thinkingConfig: { thinkingBudget },
    } as Record<string, unknown>,
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

  const systemPrompt = `You are a senior resume editor. Tailor the resume to the job description with a clean, professional, recruiter-ready tone. The result must be tight and non-repetitive — quality over quantity.

STRUCTURE (must hold):
- tailoredResume MUST include EVERY experience role from the input — same count, same order, same id, company, title, location, dates. Never omit a role.
- tailoredResume MUST include EVERY project from the input — same id, name, tech, url. Never omit a project.
- personalInfo, education, certifications: copy through unchanged.
- summary: always include. 2-3 sentences max. Plain prose aligned to the JD. No buzzwords, no first-person pronouns.

CONTENT RULES (depth without repetition):
- Each experience role MUST have substantive depth so a recruiter can immediately see seniority and scope.
  - Junior / early-career roles (0-2 yrs, intern, associate, junior title): 6 to 8 bullets.
  - Mid-level roles (3-5 yrs, software engineer, analyst, etc.): 8 to 10 bullets.
  - Senior / lead / staff / principal / manager / architect / director roles: 10 to 13 bullets. Hard cap 13.
  - Infer the tier from job title, dates, and scope clues. When in doubt, lean toward the higher count for the candidate's most recent / most senior role and toward the lower count for older or junior roles.
- Pick the strongest, most JD-relevant content. Rewrite weak originals, drop redundant ones, add missing JD-aligned ones. Every bullet is a DISTINCT accomplishment — no two bullets in the same role may describe the same work, the same tool stack, or the same outcome.
- Within a role, cover a mix of: technical execution (what was built/shipped), measurable impact (numbers, %, latency, cost, revenue), scope and ownership (team size, systems, cross-functional collaboration), leadership / mentoring (for senior roles), and architecture / design decisions (for senior roles).
- Across the whole resume, do NOT restate the same achievement in two roles. If two roles share a theme (e.g. CI/CD ownership), each must show a different angle.
- If an input role has empty bullets, generate role-appropriate bullets at the count for that role's tier.
- Each project: 4 to 6 bullets. Same distinct-accomplishment rule. Cover: what the project does, key technical decisions, your specific contribution, measurable outcome.
- Each bullet under 25 words. Lead with a strong verb or quantified outcome. Include one concrete detail (number, tool, scope, system) where credible.

SKILLS (this is what fixes inflation):
- 4 to 6 skill groups max. 6 to 10 items per group. Hard caps.
- Only include skills supported by the candidate's actual experience, projects, or original skills list. Do NOT add a JD skill the candidate has no plausible exposure to. No keyword stuffing.
- No duplicates across groups (case-insensitive). Group names should be standard (e.g. "Languages", "Frameworks", "Cloud & DevOps", "Databases", "Tools").

TONE:
- Clean, neutral, professional. Standard resume verbs: built, led, designed, owned, shipped, delivered, reduced, improved, managed, drove, mentored, scaled, migrated, automated.
- No slang, no fragments, no parenthetical asides, no colon-led quirks. Complete sentences (or strong bullet phrases) only.
- Plain ASCII punctuation only. No em-dashes, en-dashes, smart quotes, ellipsis characters, or bullet glyphs.
- BANNED words/phrases: spearheaded, leveraged, synergized, utilized, orchestrated, streamlined, cutting-edge, best-in-class, game-changing, revolutionized, harnessed, pivotal, holistic, seamlessly, proactively, transformative, comprehensive, ensured, facilitated, in order to, as well as, key stakeholders, deliverables, synergies, best practices, state-of-the-art, thought leader, results-driven, passionate, dynamic, robust, innovative, deep dive, ecosystem, paradigm.

Return ONLY valid JSON.`;

  // Inject a per-call nonce + timestamp so re-tailoring the same resume + JD
  // produces a different rewording each time. Without this, Gemini tends to
  // converge on near-identical output for identical input.
  const variationSeed = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  const corePrompt = `Variation seed (use as inspiration to vary phrasing — do not echo): ${variationSeed}

Job Title: ${jobTitle}
Job Description: ${jdTrimmed}
Resume: ${JSON.stringify(resume)}

Rewrite the resume fresh — do NOT reuse phrasing from any prior tailor of this resume. Pick different verbs, different sentence structures, and different bullet orderings than a typical safe rewrite would.

Return a single JSON object with this exact structure:
{
  "tailoredResume": { ...complete resume data },
  "suggestions": ["suggestion 1", "suggestion 2"],
  "missingKeywords": ["keyword1"],
  "extractedSkills": ["skill1"],
  "atsScoreBefore": 65,
  "atsScoreAfter": 87,
  "keywordMatchPct": 78.5,
  "changes": [{ "section": "experience", "change": "Added Docker to Senior Engineer role" }]
}`;

  // Run core tailoring + side analyses in parallel to stay within Vercel's 120s
  // maxDuration. Side calls only need the JD + original resume context, so they
  // do not depend on the tailored output.
  const [coreRaw, coverLetter, interviewQuestions, atsAndGaps] = await Promise.all([
    chat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: corePrompt },
      ],
      { temperature: 0.95, topP: 0.95 }
    ),
    generateCoverLetter(resume, jdTrimmed, jobTitle),
    generateInterviewQuestions(resume, jdTrimmed, jobTitle),
    generateAtsAndGaps(resume, jdTrimmed, jobTitle),
  ]);

  let parsed: Partial<TailorResult>;
  try {
    parsed = JSON.parse(extractJSON(coreRaw)) as Partial<TailorResult>;
  } catch {
    throw new Error("AI returned invalid JSON. Please try again.");
  }

  if (!parsed.tailoredResume) {
    throw new Error("AI returned no tailored resume. Please try again.");
  }

  // Restore content the model may have dropped or returned empty.
  parsed.tailoredResume = restoreMissingFields(parsed.tailoredResume, resume);

  // Humanize pass disabled by default — it injected slang/quirks that made
  // tone unprofessional and produced repeated phrasing across bullets.
  // Opt-in via HUMANIZE_PASS_ENABLED="true".
  if (process.env.HUMANIZE_PASS_ENABLED === "true") {
    try {
      parsed.tailoredResume = await humanizeResumeContent(parsed.tailoredResume);
    } catch (e) {
      console.warn("Humanize pass failed:", e);
    }
  }

  // Strip non-ASCII punctuation that breaks PDF rendering (smart quotes,
  // em/en dashes, ellipsis). Belt-and-braces — the prompt also forbids them.
  parsed.tailoredResume = sanitizeResumeText(parsed.tailoredResume);

  return {
    tailoredResume: parsed.tailoredResume,
    suggestions: parsed.suggestions || [],
    missingKeywords: parsed.missingKeywords || [],
    extractedSkills: parsed.extractedSkills || [],
    atsScoreBefore: parsed.atsScoreBefore ?? 0,
    atsScoreAfter: parsed.atsScoreAfter ?? 0,
    keywordMatchPct: parsed.keywordMatchPct ?? 0,
    changes: parsed.changes || [],
    coverLetter,
    interviewQuestions,
    atsSimulation: atsAndGaps.atsSimulation,
    gapClassification: atsAndGaps.gapClassification,
  };
}

// ─── Text sanitizer ──────────────────────────────────────────────────────────
// Replace Unicode punctuation that PDF/DOCX renderers garble into ?? or --.

function sanitizeText(s: string): string {
  return s
    .replace(/[—–]/g, "-")    // em-dash, en-dash → hyphen
    .replace(/[‘’‚‛]/g, "'") // smart single quotes
    .replace(/[“”„‟]/g, '"') // smart double quotes
    .replace(/…/g, "...")          // ellipsis
    .replace(/ /g, " ")            // non-breaking space
    .replace(/•/g, "-")            // bullet • → -
    .replace(/[‐-―]/g, "-");  // any other dash variants
}

function sanitizeResumeText(r: ResumeData): ResumeData {
  return {
    ...r,
    summary: r.summary ? sanitizeText(r.summary) : r.summary,
    experience: r.experience.map((e) => ({
      ...e,
      bullets: e.bullets.map(sanitizeText),
    })),
    projects: r.projects.map((p) => ({
      ...p,
      description: p.description ? sanitizeText(p.description) : p.description,
      bullets: (p.bullets || []).map(sanitizeText),
    })),
    skills: r.skills.map((g) => ({
      ...g,
      items: g.items.map(sanitizeText),
    })),
  };
}

// ─── Side calls (parallel) ────────────────────────────────────────────────────

async function generateCoverLetter(
  resume: ResumeData,
  jobDescription: string,
  jobTitle: string
): Promise<string> {
  const name = resume.personalInfo?.name || "Candidate";
  const sys = `Write a concise, human-sounding 3-paragraph cover letter. No buzzwords (spearheaded, leveraged, synergized, utilized, robust, scalable, innovative, results-driven, passionate, deep dive, ecosystem, holistic, seamlessly). Plain prose, real voice. Output JSON: { "coverLetter": "..." }`;
  const user = `Job Title: ${jobTitle}
Job Description: ${jobDescription}
Candidate name: ${name}
Top experience: ${JSON.stringify(resume.experience.slice(0, 2))}
Top skills: ${JSON.stringify((resume.skills || []).slice(0, 3))}

Return JSON: { "coverLetter": "Dear Hiring Manager,\\n\\n[3 paragraphs]\\n\\nSincerely,\\n${name}" }`;
  try {
    const raw = await chat(
      [{ role: "system", content: sys }, { role: "user", content: user }],
      { temperature: 0.9, topP: 0.95 }
    );
    const obj = JSON.parse(extractJSON(raw)) as { coverLetter?: string };
    return obj.coverLetter || "";
  } catch (e) {
    console.warn("Cover letter generation failed:", e);
    return "";
  }
}

async function generateInterviewQuestions(
  resume: ResumeData,
  jobDescription: string,
  jobTitle: string
): Promise<TailorResult["interviewQuestions"]> {
  const sys = `Generate 6-8 likely interview questions for the candidate based on the job description and their resume. Mix categories: Technical, Behavioral, System Design, Role-specific. Each question gets a short answer tip. Output JSON: { "questions": [{"question":"...","category":"Technical","tip":"..."}] }`;
  const user = `Job Title: ${jobTitle}
Job Description: ${jobDescription}
Resume summary: ${resume.summary || ""}
Experience: ${JSON.stringify(resume.experience.slice(0, 3))}
Skills: ${JSON.stringify(resume.skills || [])}

Return JSON only.`;
  try {
    const raw = await chat(
      [{ role: "system", content: sys }, { role: "user", content: user }],
      { temperature: 0.85 }
    );
    const obj = JSON.parse(extractJSON(raw)) as { questions?: TailorResult["interviewQuestions"] };
    return obj.questions || [];
  } catch (e) {
    console.warn("Interview questions generation failed:", e);
    return [];
  }
}

async function generateAtsAndGaps(
  resume: ResumeData,
  jobDescription: string,
  jobTitle: string
): Promise<{ atsSimulation: TailorResult["atsSimulation"]; gapClassification: TailorResult["gapClassification"] }> {
  const sys = `Score how the resume would perform against major ATS systems (Workday, Greenhouse, Lever, Taleo) for the given JD — each 0-100. Then classify gaps between JD requirements and resume into: dealBreakers (hard requirements missing), niceToHave (preferred but missing), framingIssues (resume has it but phrased poorly). Output JSON only.`;
  const user = `Job Title: ${jobTitle}
Job Description: ${jobDescription}
Resume: ${JSON.stringify({ summary: resume.summary, experience: resume.experience, skills: resume.skills, projects: resume.projects })}

Return JSON:
{
  "atsSimulation": { "workday": 84, "greenhouse": 89, "lever": 91, "taleo": 79, "notes": ["note"] },
  "gapClassification": {
    "dealBreakers": [{ "skill": "...", "reason": "..." }],
    "niceToHave": [{ "skill": "...", "reason": "..." }],
    "framingIssues": [{ "skill": "...", "fix": "..." }]
  }
}`;
  const fallback = {
    atsSimulation: { workday: 0, greenhouse: 0, lever: 0, taleo: 0, notes: [] as string[] },
    gapClassification: { dealBreakers: [], niceToHave: [], framingIssues: [] },
  };
  try {
    const raw = await chat(
      [{ role: "system", content: sys }, { role: "user", content: user }],
      { temperature: 0.6 }
    );
    const obj = JSON.parse(extractJSON(raw)) as Partial<typeof fallback>;
    return {
      atsSimulation: obj.atsSimulation || fallback.atsSimulation,
      gapClassification: obj.gapClassification || fallback.gapClassification,
    };
  } catch (e) {
    console.warn("ATS/gap analysis failed:", e);
    return fallback;
  }
}

// ─── Caps & dedup ─────────────────────────────────────────────────────────────
// Tight, professional output: enforce role/project/skill caps and remove
// near-duplicate bullets so the resume reads clean and non-repetitive.

const MAX_BULLETS_PER_ROLE_SENIOR = 13;
const MAX_BULLETS_PER_ROLE_MID = 10;
const MAX_BULLETS_PER_ROLE_JUNIOR = 8;
const MAX_BULLETS_PER_PROJECT = 6;
const MAX_SKILL_GROUPS = 6;
const MAX_ITEMS_PER_GROUP = 10;
const MAX_BULLET_WORDS = 28;

type SeniorityTier = "junior" | "mid" | "senior";

const SENIOR_TITLE_RX =
  /\b(senior|sr\.?|staff|principal|lead|architect|head|director|vp|vice\s*president|chief|cto|cio|manager|mgr|founder|owner|president)\b/i;
const JUNIOR_TITLE_RX =
  /\b(intern|trainee|apprentice|junior|jr\.?|associate|entry|graduate|grad|assistant)\b/i;

function roleSeniority(role: { title?: string; startDate?: string; endDate?: string; current?: boolean }): SeniorityTier {
  const title = role.title || "";
  if (SENIOR_TITLE_RX.test(title)) return "senior";
  if (JUNIOR_TITLE_RX.test(title)) return "junior";

  const parseYear = (s?: string) => {
    if (!s) return undefined;
    const m = s.match(/(19|20)\d{2}/);
    return m ? parseInt(m[0], 10) : undefined;
  };
  const start = parseYear(role.startDate);
  const end = role.current ? new Date().getFullYear() : parseYear(role.endDate) ?? new Date().getFullYear();
  if (start && end) {
    const years = end - start;
    if (years >= 5) return "senior";
    if (years >= 2) return "mid";
    return "junior";
  }
  return "mid";
}

function bulletCapForRole(role: { title?: string; startDate?: string; endDate?: string; current?: boolean }): number {
  switch (roleSeniority(role)) {
    case "senior": return MAX_BULLETS_PER_ROLE_SENIOR;
    case "mid":    return MAX_BULLETS_PER_ROLE_MID;
    case "junior": return MAX_BULLETS_PER_ROLE_JUNIOR;
  }
}

function normalizeForDedup(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function tokenSet(s: string): Set<string> {
  return new Set(normalizeForDedup(s).split(" ").filter((w) => w.length > 2));
}

function isNearDuplicate(a: string, b: string): boolean {
  const na = normalizeForDedup(a);
  const nb = normalizeForDedup(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  const shorter = na.length <= nb.length ? na : nb;
  const longer = na.length <= nb.length ? nb : na;
  if (shorter.length >= 24 && longer.includes(shorter)) return true;
  const ta = tokenSet(a);
  const tb = tokenSet(b);
  const minSize = Math.min(ta.size, tb.size);
  if (minSize < 4) return false;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  return inter / minSize > 0.7;
}

function dedupBullets(bullets: string[]): string[] {
  const out: string[] = [];
  for (const raw of bullets) {
    if (typeof raw !== "string") continue;
    const trimmed = raw.trim();
    if (trimmed.length < 4) continue;
    if (out.some((kept) => isNearDuplicate(kept, trimmed))) continue;
    out.push(trimmed);
  }
  return out;
}

function truncateBullet(b: string): string {
  const words = b.split(/\s+/);
  if (words.length <= MAX_BULLET_WORDS) return b;
  return words.slice(0, MAX_BULLET_WORDS).join(" ").replace(/[,;:]+$/, "") + ".";
}

// Use original resume as structural source of truth. Take the model's tailored
// bullets/skills as the content (it is told to rewrite, not append), then dedup
// and cap so repetition and skills inflation cannot leak through.
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
    const tailoredBullets = cleanBullets(t?.bullets);
    const origBullets = cleanBullets(orig.bullets);
    // Combine tailored + original, dedup, then cap by tier.
    const combined = tailoredBullets.length
      ? [...tailoredBullets, ...origBullets]
      : origBullets;
    const deduped = dedupBullets(combined).map(truncateBullet);
    const cap = bulletCapForRole(orig);
    const capped = deduped.slice(0, cap);
    return { ...orig, bullets: capped };
  });

  const mergedProjects: ResumeData["projects"] = original.projects.map((orig) => {
    const t = findTailoredProject(orig);
    const tailoredBullets = cleanBullets(t?.bullets);
    const origBullets = cleanBullets(orig.bullets);
    const source = tailoredBullets.length ? tailoredBullets : origBullets;
    const deduped = dedupBullets(source).map(truncateBullet);
    const capped = deduped.slice(0, MAX_BULLETS_PER_PROJECT);
    return { ...orig, bullets: capped };
  });

  // Skills: prefer the model's tailored list (it was told to keep tight & credible).
  // Fall back to original. Then case-insensitively dedup items, dedup across
  // groups (item only appears in its first group), and cap groups + items.
  const mergedSkills: ResumeData["skills"] = (() => {
    const sourceGroups =
      tailored.skills && tailored.skills.length ? tailored.skills : original.skills || [];

    const seenItems = new Set<string>();
    const groups: Array<{ category: string; items: string[] }> = [];

    for (const group of sourceGroups) {
      const category = (group.category || "Skills").trim();
      if (!category) continue;
      const items: string[] = [];
      const itemsSeen = new Set<string>();
      for (const raw of group.items || []) {
        const item = typeof raw === "string" ? raw.trim() : "";
        if (!item) continue;
        const key = item.toLowerCase();
        if (seenItems.has(key) || itemsSeen.has(key)) continue;
        itemsSeen.add(key);
        seenItems.add(key);
        items.push(item);
        if (items.length >= MAX_ITEMS_PER_GROUP) break;
      }
      if (items.length) groups.push({ category, items });
      if (groups.length >= MAX_SKILL_GROUPS) break;
    }

    return groups.map((g, i) => ({ id: `skill-${i + 1}`, ...g }));
  })();

  // Summary: prefer tailored, else original. Cap at ~3 sentences / 80 words.
  const rawSummary = tailored.summary?.trim() ? tailored.summary : original.summary || "";
  const summary = (() => {
    if (!rawSummary) return original.summary;
    const sentences = rawSummary.match(/[^.!?]+[.!?]+/g) || [rawSummary];
    const trimmed = sentences.slice(0, 3).join(" ").trim();
    const words = trimmed.split(/\s+/);
    return words.length > 80 ? words.slice(0, 80).join(" ") + "." : trimmed;
  })();

  return {
    personalInfo: { ...original.personalInfo, ...tailored.personalInfo },
    summary,
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
  const prompt = `Rewrite this ${section} section in a clean, professional, recruiter-ready tone.
${context ? `Target role: ${context}` : ""}
Current content: ${content}

Rules:
- Tight and non-repetitive. Each version is a distinct angle, not a paraphrase.
- Strong resume verbs (built, led, designed, owned, shipped, delivered, reduced, improved, managed, drove, scaled, migrated, automated).
- One concrete detail per bullet where credible (number, tool, scope, system).
- Complete phrases. No slang, fragments, parentheticals, or colon-led quirks.
- Plain ASCII punctuation only.
- BANNED: spearheaded, leveraged, synergized, utilized, orchestrated, streamlined, cutting-edge, robust, innovative, dynamic, passionate, results-driven, thought leader, holistic, seamlessly, proactively, transformative, comprehensive, ensured, facilitated, in order to, as well as, key stakeholders, deliverables, best practices.

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
