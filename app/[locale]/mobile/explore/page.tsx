"use client";

import { useState } from "react";
import { Search, Filter, ChevronRight, Star, Signal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { BottomNav } from "@/components/mobile/bottom-nav";

const regions = [
  { id: "all", name: "All" },
  { id: "europe", name: "Europe" },
  { id: "asia", name: "Asia" },
  { id: "americas", name: "Americas" },
  { id: "africa", name: "Africa" },
  { id: "oceania", name: "Oceania" },
];

const countries = [
  { flag: "TR", name: "Turkey", plans: 12, startPrice: 4.99, popular: true },
  { flag: "DE", name: "Germany", plans: 8, startPrice: 5.99, popular: true },
  { flag: "FR", name: "France", plans: 10, startPrice: 5.49, popular: true },
  { flag: "IT", name: "Italy", plans: 9, startPrice: 4.99, popular: false },
  { flag: "ES", name: "Spain", plans: 11, startPrice: 4.49, popular: true },
  { flag: "GB", name: "United Kingdom", plans: 7, startPrice: 6.99, popular: false },
  { flag: "JP", name: "Japan", plans: 15, startPrice: 7.99, popular: true },
  { flag: "KR", name: "South Korea", plans: 8, startPrice: 6.99, popular: false },
  { flag: "TH", name: "Thailand", plans: 10, startPrice: 3.99, popular: true },
  { flag: "US", name: "United States", plans: 20, startPrice: 8.99, popular: true },
  { flag: "AU", name: "Australia", plans: 6, startPrice: 9.99, popular: false },
  { flag: "BR", name: "Brazil", plans: 5, startPrice: 7.49, popular: false },
];

const getFlagEmoji = (countryCode: string) => {
  const flags: Record<string, string> = {
    TR: "🇹🇷", DE: "🇩🇪", FR: "🇫🇷", IT: "🇮🇹", ES: "🇪🇸", GB: "🇬🇧",
    JP: "🇯🇵", KR: "🇰🇷", TH: "🇹🇭", US: "🇺🇸", AU: "🇦🇺", BR: "🇧🇷"
  };
  return flags[countryCode] || "🏳️";
};

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeRegion, setActiveRegion] = useState("all");

  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().startsWith(searchQuery.toLowerCase())
  );

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
            {regions.map((region) => (
              <button
                key={region.id}
                onClick={() => setActiveRegion(region.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                  activeRegion === region.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/50 text-muted-foreground"
                }`}
              >
                {region.name}
              </button>
            ))}
          </div>
        </div>

        {/* Regional Plans Banner */}
        <div className="px-4 mb-4">
          <div className="bg-gradient-to-r from-primary/20 to-primary/5 rounded-xl p-4 border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-foreground">Regional Plans</h3>
                <p className="text-xs text-muted-foreground mt-1">One plan, multiple countries</p>
              </div>
              <ChevronRight className="w-5 h-5 text-primary" />
            </div>
          </div>
        </div>

        {/* Countries List */}
        <div className="px-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground">All Countries</h2>
            <span className="text-xs text-muted-foreground">{filteredCountries.length} destinations</span>
          </div>

          <div className="space-y-2">
            {filteredCountries.map((country) => (
              <button
                key={country.flag}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/50 hover:bg-card hover:border-primary/30 transition-all"
              >
                <span className="text-3xl">{getFlagEmoji(country.flag)}</span>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-foreground">{country.name}</span>
                    {country.popular && <Star className="w-3 h-3 text-primary fill-primary" />}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Signal className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{country.plans} plans available</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">From</p>
                  <p className="font-semibold text-sm text-primary">${country.startPrice}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
