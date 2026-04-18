import { LandingNav } from "@/components/landing/landing-nav";
import { HeroSection } from "@/components/landing/hero-section";
import { LogoCloud } from "@/components/landing/logo-cloud";
import { FeaturesSection } from "@/components/landing/features-section";
import { ComparisonSection } from "@/components/landing/comparison-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ATSSection } from "@/components/landing/ats-section";
import { TemplatesPreview } from "@/components/landing/templates-preview";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { FAQSection } from "@/components/landing/faq-section";
import { CTASection } from "@/components/landing/cta-section";
import { LandingFooter } from "@/components/landing/landing-footer";

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-[#F5F5FE] overflow-x-hidden">
      <LandingNav />
      <HeroSection />
      <LogoCloud />
      <FeaturesSection />
      <ComparisonSection />
      <HowItWorks />
      <ATSSection />
      <TemplatesPreview />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <LandingFooter />
    </main>
  );
}
