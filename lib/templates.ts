export interface ResumeTemplate {
  id: string;
  name: string;
  category: "modern" | "classic" | "creative" | "minimal" | "executive" | "tech";
  accentColor: string;
  fontFamily: string;
  isPremium: boolean;
  description: string;
}

export const RESUME_TEMPLATES: ResumeTemplate[] = [
  // Modern templates
  { id: "modern-minimal", name: "Modern Minimal", category: "modern", accentColor: "#6366F1", fontFamily: "Plus Jakarta Sans", isPremium: false, description: "Clean, minimal design with indigo accents" },
  { id: "modern-bold", name: "Modern Bold", category: "modern", accentColor: "#8B5CF6", fontFamily: "Plus Jakarta Sans", isPremium: false, description: "Bold headers with purple gradient" },
  { id: "modern-clean", name: "Modern Clean", category: "modern", accentColor: "#3B82F6", fontFamily: "Inter", isPremium: false, description: "Two-column layout, ultra clean" },
  { id: "modern-dark", name: "Modern Dark", category: "modern", accentColor: "#6366F1", fontFamily: "Plus Jakarta Sans", isPremium: true, description: "Dark sidebar with light content area" },
  { id: "modern-gradient", name: "Modern Gradient", category: "modern", accentColor: "#EC4899", fontFamily: "Plus Jakarta Sans", isPremium: true, description: "Gradient header, modern spacing" },

  // Classic templates
  { id: "classic-professional", name: "Classic Professional", category: "classic", accentColor: "#1E40AF", fontFamily: "Georgia", isPremium: false, description: "Traditional single column layout" },
  { id: "classic-elegant", name: "Classic Elegant", category: "classic", accentColor: "#374151", fontFamily: "Merriweather", isPremium: false, description: "Timeless serif typography" },
  { id: "classic-executive", name: "Classic Executive", category: "classic", accentColor: "#1F2937", fontFamily: "Georgia", isPremium: true, description: "Executive style with bold name" },

  // Creative templates
  { id: "creative-portfolio", name: "Creative Portfolio", category: "creative", accentColor: "#EC4899", fontFamily: "Poppins", isPremium: true, description: "Eye-catching design for creatives" },
  { id: "creative-colorful", name: "Creative Colorful", category: "creative", accentColor: "#F59E0B", fontFamily: "Poppins", isPremium: true, description: "Vibrant colors, unique layout" },
  { id: "creative-sidebar", name: "Creative Sidebar", category: "creative", accentColor: "#10B981", fontFamily: "Plus Jakarta Sans", isPremium: true, description: "Colored sidebar with skills visual" },

  // Minimal templates
  { id: "minimal-white", name: "Minimal White", category: "minimal", accentColor: "#000000", fontFamily: "Inter", isPremium: false, description: "Ultra minimal, all white design" },
  { id: "minimal-lines", name: "Minimal Lines", category: "minimal", accentColor: "#6B7280", fontFamily: "Inter", isPremium: false, description: "Line dividers, clean typography" },
  { id: "minimal-swiss", name: "Minimal Swiss", category: "minimal", accentColor: "#EF4444", fontFamily: "Helvetica Neue", isPremium: true, description: "Swiss design inspired layout" },

  // Executive templates
  { id: "executive-premium", name: "Executive Premium", category: "executive", accentColor: "#1F2937", fontFamily: "Georgia", isPremium: true, description: "C-suite level prestige design" },
  { id: "executive-consulting", name: "Executive Consulting", category: "executive", accentColor: "#1E3A5F", fontFamily: "Times New Roman", isPremium: true, description: "McKinsey-style consulting format" },

  // Tech templates
  { id: "tech-developer", name: "Tech Developer", category: "tech", accentColor: "#10B981", fontFamily: "JetBrains Mono", isPremium: false, description: "GitHub-inspired developer resume" },
  { id: "tech-engineer", name: "Tech Engineer", category: "tech", accentColor: "#3B82F6", fontFamily: "Inter", isPremium: false, description: "Clean two-column for engineers" },
  { id: "tech-data", name: "Tech Data Scientist", category: "tech", accentColor: "#8B5CF6", fontFamily: "Plus Jakarta Sans", isPremium: true, description: "Data & ML focused layout" },
  { id: "tech-devops", name: "Tech DevOps", category: "tech", accentColor: "#F59E0B", fontFamily: "Inter", isPremium: true, description: "Infrastructure & DevOps focused" },
  { id: "tech-fullstack", name: "Tech Full Stack", category: "tech", accentColor: "#6366F1", fontFamily: "Plus Jakarta Sans", isPremium: true, description: "Full-stack engineer showcase" },
];

export function getTemplateById(id: string): ResumeTemplate {
  return RESUME_TEMPLATES.find((t) => t.id === id) || RESUME_TEMPLATES[0];
}

export function getTemplatesByCategory(category: string): ResumeTemplate[] {
  return RESUME_TEMPLATES.filter((t) => t.category === category);
}
