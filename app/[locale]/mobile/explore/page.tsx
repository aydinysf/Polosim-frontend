"use client";

import { useState, useEffect } from "react";
import { Search, Filter, ChevronRight, Star, Signal, Loader2, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { BottomNav } from "@/components/mobile/bottom-nav";
import { countryService, type Country } from "@/lib/services/countryService";
import { regionService, type Region } from "@/lib/services/regionService";
import { getLocalizedText } from "@/lib/product-helpers";
import { getImageUrl, getFlagFromISO } from "@/lib/api-client";
import { useLocale } from "next-intl";

export default function ExplorePage() {
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeRegion, setActiveRegion] = useState("all");
  const [countries, setCountries] = useState<Country[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const [countriesData, regionsData] = await Promise.all([
          countryService.getAll(),
          regionService.getAll(),
        ]);
        setCountries(countriesData);
        setRegions(regionsData);
      } catch (error) {
        console.error("Failed to fetch explore data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredCountries = countries.filter((country) => {
    const name = getLocalizedText(country.name, "", locale).toLowerCase();
    const matchesSearch = name.startsWith(searchQuery.toLowerCase());
    if (activeRegion === "all") return matchesSearch;
    return matchesSearch && country.region_id?.toString() === activeRegion;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-2 text-sm text-muted-foreground">Loading destinations...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />

      <main className="pt-16 pb-24">
        {/* Search Bar */}
        <div className="px-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search countries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 py-3 bg-secondary/50 border-border/50 rounded-xl text-sm"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-secondary">
              <Filter className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Region Tabs */}
        <div className="px-4 mb-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
            <button
              onClick={() => setActiveRegion("all")}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                activeRegion === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/50 text-muted-foreground"
              }`}
            >
              All
            </button>
            {regions.map((region) => (
              <button
                key={region.id}
                onClick={() => setActiveRegion(region.id.toString())}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                  activeRegion === region.id.toString()
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/50 text-muted-foreground"
                }`}
              >
                {getLocalizedText(region.name, region.slug, locale)}
              </button>
            ))}
          </div>
        </div>

        {/* Countries List */}
        <div className="px-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground">Destinations</h2>
            <span className="text-xs text-muted-foreground">{filteredCountries.length} countries</span>
          </div>

          <div className="space-y-2">
            {filteredCountries.map((country) => {
              const name = getLocalizedText(country.name, "", locale);
              const flagUrl = country.flag_url ? getImageUrl(country.flag_url) : getFlagFromISO(country.iso_code);
              
              return (
                <button
                  key={country.id}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/50 hover:bg-card hover:border-primary/30 transition-all"
                  onClick={() => window.location.href = `/${locale}/plans?country=${country.id}`}
                >
                  <div className="w-10 h-7 rounded overflow-hidden bg-secondary flex items-center justify-center">
                    {flagUrl ? (
                      <img src={flagUrl} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <Globe className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-foreground">{name}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Explore available plans</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
