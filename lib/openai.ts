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

async function chat(messages: Message[]): Promise<string> {
  const genAI = getGenAI();

  // Separate system instruction from conversation messages
  const systemMsg = messages.find((m) => m.role === "system");
  const convMessages = messages.filter((m) => m.role !== "system");

  const model = genAI.getGenerativeModel({
    model: MODEL(),
    ...(systemMsg ? { systemInstruction: systemMsg.content } : {}),
    generationConfig: {
      responseMimeType: "application/json",
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

  const systemPrompt = `You are an expert resume writer and ATS optimization specialist. Your writing sounds like a real human professional wrote it — never like AI output.

Rules:
- Keep personalInfo (name, email, phone, location, linkedin, github, website, title) exactly as-is
- Keep projects exactly as-is — do not change them
- Keep education exactly as-is
- For experience: enhance the last 3 roles by adding NEW bullet points that reflect responsibilities and skills the recruiter is asking for in the JD — frame them as things the candidate plausibly did in that role even if not listed
- Add 2-4 new bullets per role that match key JD requirements (tools, methodologies, outcomes)
- Add missing JD keywords into existing AND new bullets naturally
- Keep bullets concise, impact-driven, with numbers/metrics where possible
- Add any missing skills from the JD to the skills section
- Return ONLY valid JSON

CRITICAL — Human writing style rules (violating these makes the resume unacceptable):
- NEVER use these words/phrases: spearheaded, leveraged, synergized, utilized, orchestrated, streamlined, cutting-edge, best-in-class, game-changing, revolutionized, harnessed, pivotal, robust, scalable solutions, innovative, dynamic, passionate, results-driven, thought leader, deep dive, ecosystem, paradigm, holistic, seamlessly, proactively, overarching, transformative
- Use simple direct verbs instead: built, wrote, led, ran, fixed, shipped, cut, grew, reduced, added, improved, helped, managed, worked on, set up, moved
- Vary sentence length — mix short punchy bullets with slightly longer ones
- Include one specific detail per bullet (a team size, a number, a tool name) — not vague claims
- Write like a real person describing their job to a friend, then cleaned up for a resume
- Avoid corporate buzzword stacking — max one "impressive" word per bullet
- Numbers and % make bullets human — use them wherever plausible`;

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

  const raw = await chat([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ]);

  try {
    return JSON.parse(extractJSON(raw)) as TailorResult;
  } catch {
    throw new Error("AI returned invalid JSON. Please try again.");
  }
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
  const prompt = `You are a professional resume writer. Rewrite this ${section} section to sound like a real human professional wrote it — not AI.
${context ? `Target role: ${context}` : ""}
Current content: ${content}

Rules:
- Natural, varied sentence structure — not templated
- No buzzwords: spearheaded, leveraged, synergized, utilized, orchestrated, streamlined, cutting-edge, robust, innovative, dynamic, passionate, results-driven, thought leader, holistic, seamlessly, proactively, transformative
- Simple direct verbs, specific details, honest tone
- Reads like the person wrote it themselves, cleaned up

Return ONLY a JSON array of 3 improved versions:
["version1", "version2", "version3"]`;

  const raw = await chat([{ role: "user", content: prompt }]);
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

Resume text:
${text}

Return ONLY valid JSON:
{
  "personalInfo": { "name": "", "email": "", "phone": "", "location": "", "linkedin": "", "github": "", "website": "", "title": "" },
  "summary": "",
  "experience": [{ "id": "exp-1", "company": "", "title": "", "location": "", "startDate": "MM/YYYY", "endDate": "MM/YYYY", "current": false, "bullets": [] }],
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

  const systemPrompt = `You are a professional resume writer. You write resumes that sound like a real human professional wrote them — not AI. Every resume you write:
- Uses simple, direct action verbs with real numbers (%, $, team size, time saved)
- Has natural, varied sentence length — not every bullet follows the same template
- Sounds like the person described their own job, then cleaned it up for a resume
- Passes ATS with proper keywords woven in naturally
- Has realistic company names, tech stacks, and career progression
- NEVER uses: spearheaded, leveraged, synergized, utilized, orchestrated, streamlined, cutting-edge, best-in-class, game-changing, revolutionized, harnessed, pivotal, robust, scalable solutions, innovative, dynamic, passionate, results-driven, thought leader, deep dive, ecosystem, paradigm, holistic, seamlessly, proactively, overarching, transformative
- Instead uses: built, wrote, led, ran, fixed, shipped, cut, grew, reduced, added, improved, helped, managed, worked on, set up, moved, owned, shipped
- Includes one specific concrete detail per bullet — a number, a tool, a team size, a deadline
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

  const raw = await chat([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ]);

  try {
    return JSON.parse(extractJSON(raw)) as ResumeData;
  } catch {
    throw new Error("AI returned invalid JSON. Please try again.");
  }
}
