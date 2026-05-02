import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { PopularDestinations } from "@/components/popular-destinations";
import { PlansRegionsTabs } from "@/components/plans-regions-tabs";
import { FeaturesSection } from "@/components/features-section";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <PopularDestinations />
      <PlansRegionsTabs />
      <FeaturesSection />
      <Footer />
    </main>
  );
}
