import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { RegionsSection } from "@/components/regions-section";
import { PlansRegionsTabs } from "@/components/plans-regions-tabs";
import { FeaturesSection } from "@/components/features-section";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--navy)]">
      <Navbar />
      <HeroSection />
      <RegionsSection />
      <PlansRegionsTabs />
      <FeaturesSection />
      <Footer />
    </main>
  );
}
