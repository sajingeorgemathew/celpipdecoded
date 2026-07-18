import { LandingHeader } from "@/components/landing/LandingHeader";
import { HeroSection } from "@/components/landing/HeroSection";
import { CoreValuesSection } from "@/components/landing/CoreValuesSection";
import { PracticeModulesSection } from "@/components/landing/PracticeModulesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { EarlyAccessForm } from "@/components/landing/EarlyAccessForm";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <LandingHeader />
      <main className="flex-1">
        <HeroSection />
        <CoreValuesSection />
        <PracticeModulesSection />
        <HowItWorksSection />
        <EarlyAccessForm />
      </main>
      <Footer />
    </div>
  );
}
