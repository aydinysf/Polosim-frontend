import { MobileHeader } from "@/components/mobile/mobile-header";
import { BottomNav } from "@/components/mobile/bottom-nav";
import { ActiveEsimCard } from "@/components/mobile/active-esim-card";
import { QuickSearch } from "@/components/mobile/quick-search";
import { PopularPlans } from "@/components/mobile/popular-plans";
import { RegionCategories } from "@/components/mobile/region-categories";
import { PromoBanner } from "@/components/mobile/promo-banner";

export default function MobilePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <MobileHeader />

      {/* Main Content - with padding for fixed header and bottom nav */}
      <main className="pt-16 pb-24">
        {/* Quick Search */}
        <QuickSearch />

        {/* Active eSIM Status */}
        <ActiveEsimCard hasActivePlan={true} />

        {/* Promo Banner */}
        <PromoBanner />

        {/* Popular Plans */}
        <PopularPlans />

        {/* Region Categories */}
        <RegionCategories />

        {/* Features highlight */}
        <div className="px-4 py-6">
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-secondary/30 text-center">
              <div className="text-xl mb-1">⚡</div>
              <p className="text-[10px] font-medium text-foreground">Instant</p>
              <p className="text-[10px] text-muted-foreground">Activation</p>
            </div>
            <div className="p-3 rounded-xl bg-secondary/30 text-center">
              <div className="text-xl mb-1">🌍</div>
              <p className="text-[10px] font-medium text-foreground">200+</p>
              <p className="text-[10px] text-muted-foreground">Countries</p>
            </div>
            <div className="p-3 rounded-xl bg-secondary/30 text-center">
              <div className="text-xl mb-1">💬</div>
              <p className="text-[10px] font-medium text-foreground">24/7</p>
              <p className="text-[10px] text-muted-foreground">Support</p>
            </div>
          </div>
        </div>
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
