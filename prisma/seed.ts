import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("Admin123!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "pmodugu@resumeevy.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "pmodugu@resumeevy.com",
      password: adminPassword,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  await prisma.usageStats.upsert({
    where: { userId: admin.id },
    update: {},
    create: { userId: admin.id },
  });

  await prisma.subscription.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      stripeCustomerId: `free_${admin.id}`,
      plan: "LIFETIME",
      status: "ACTIVE",
    },
  });

  // Create test user
  const testPassword = await bcrypt.hash("Test123!", 12);
  const testUser = await prisma.user.upsert({
    where: { email: "test@resumeevy.com" },
    update: {},
    create: {
      name: "Alex Johnson",
      email: "test@resumeevy.com",
      password: testPassword,
      emailVerified: new Date(),
    },
  });

  await prisma.usageStats.upsert({
    where: { userId: testUser.id },
    update: {},
    create: { userId: testUser.id },
  });

  await prisma.subscription.upsert({
    where: { userId: testUser.id },
    update: {},
    create: {
      userId: testUser.id,
      stripeCustomerId: `free_${testUser.id}`,
      plan: "FREE",
      status: "ACTIVE",
    },
  });

  // Create sample resume
  await prisma.resume.create({
    data: {
      userId: testUser.id,
      title: "Alex Johnson - Software Engineer",
      profileName: "Full Stack Engineer",
      templateId: "modern-minimal",
      isOriginal: true,
      atsScore: 67,
      personalInfo: JSON.stringify({
        name: "Alex Johnson",
        email: "alex@example.com",
        phone: "+1 (555) 123-4567",
        location: "San Francisco, CA",
        linkedin: "linkedin.com/in/alexjohnson",
        github: "github.com/alexjohnson",
        title: "Senior Full Stack Engineer",
      }),
      summary:
        "Experienced full-stack engineer with 5+ years building scalable web applications. Passionate about clean code, performance optimization, and developer experience.",
      experience: JSON.stringify([
        {
          id: "exp-1",
          company: "TechStartup Inc",
          title: "Senior Software Engineer",
          location: "San Francisco, CA",
          startDate: "Jan 2022",
          endDate: "Present",
          current: true,
          bullets: [
            "Led migration from monolith to microservices, reducing deployment time by 60%",
            "Built real-time collaboration features serving 50K+ daily active users",
            "Mentored 4 junior engineers and established code review best practices",
          ],
        },
        {
          id: "exp-2",
          company: "Digital Agency Co",
          title: "Full Stack Developer",
          location: "New York, NY",
          startDate: "Jun 2020",
          endDate: "Dec 2021",
          current: false,
          bullets: [
            "Delivered 15+ client projects using React, Node.js, and PostgreSQL",
            "Improved page load times by 45% through performance optimization",
            "Integrated third-party APIs including Stripe, Twilio, and Sendgrid",
          ],
        },
      ]),
      education: JSON.stringify([
        {
          id: "edu-1",
          school: "University of California, Berkeley",
          degree: "Bachelor of Science",
          field: "Computer Science",
          startDate: "2016",
          endDate: "2020",
          gpa: "3.8",
        },
      ]),
      skills: JSON.stringify([
        {
          id: "skill-1",
          category: "Languages",
          items: ["TypeScript", "JavaScript", "Python", "Go"],
        },
        {
          id: "skill-2",
          category: "Frontend",
          items: ["React", "Next.js", "Tailwind CSS", "Framer Motion"],
        },
        {
          id: "skill-3",
          category: "Backend",
          items: ["Node.js", "Express", "GraphQL", "REST APIs"],
        },
        {
          id: "skill-4",
          category: "Database & Cloud",
          items: ["PostgreSQL", "Redis", "AWS", "Cloudflare"],
        },
      ]),
      projects: JSON.stringify([
        {
          id: "proj-1",
          name: "Open Source CLI Tool",
          description: "A developer productivity tool",
          bullets: [
            "Built CLI tool with 2K+ GitHub stars",
            "Reduced boilerplate setup time by 80% for teams",
          ],
          tech: ["Node.js", "TypeScript"],
          url: "github.com/alexjohnson/cli-tool",
        },
      ]),
      certifications: JSON.stringify([]),
    },
  });

  // Seed templates
  const templates = [
    { name: "Modern Minimal", slug: "modern-minimal", category: "modern", isPremium: false, thumbnail: "/templates/modern-minimal.png" },
    { name: "Modern Bold", slug: "modern-bold", category: "modern", isPremium: false, thumbnail: "/templates/modern-bold.png" },
    { name: "Classic Professional", slug: "classic-professional", category: "classic", isPremium: false, thumbnail: "/templates/classic-professional.png" },
    { name: "Tech Developer", slug: "tech-developer", category: "tech", isPremium: false, thumbnail: "/templates/tech-developer.png" },
    { name: "Minimal White", slug: "minimal-white", category: "minimal", isPremium: false, thumbnail: "/templates/minimal-white.png" },
    { name: "Executive Premium", slug: "executive-premium", category: "executive", isPremium: true, thumbnail: "/templates/executive-premium.png" },
  ];

  for (const template of templates) {
    await prisma.template.upsert({
      where: { slug: template.slug },
      update: {},
      create: template,
    });
  }

  console.log("✅ Seeding complete!");
  console.log("Admin: pmodugu@resumeevy.com / Admin123!");
  console.log("User:  test@resumeevy.com / Test123!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
