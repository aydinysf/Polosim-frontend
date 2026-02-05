"use client";

import { useState } from "react";
import { Signal, Clock, ShoppingCart, Star, ArrowUpDown, ChevronDown, MapPin, ArrowRight, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type TabType = "plans" | "regions";
type SortOption = "popular" | "price-low" | "price-high" | "data-high" | "name-az";
type FilterType = "all" | "bestSeller" | "europe" | "asia";
type RegionFilterType = "all" | "popular" | "europe" | "asia" | "americas";

const sortOptions: { key: SortOption; label: string }[] = [
  { key: "popular", label: "Most Popular" },
  { key: "price-low", label: "Price: Low to High" },
  { key: "price-high", label: "Price: High to Low" },
  { key: "data-high", label: "Data: High to Low" },
  { key: "name-az", label: "Name: A to Z" },
];

const plans = [
  { id: 1, name: "Turkey", data: "10GB", validity: "30 Days", speed: "5G/LTE", price: 14.99, bestSeller: true, flag: "🇹🇷", region: "europe" },
  { id: 2, name: "Europe", data: "20GB", validity: "30 Days", speed: "5G/LTE", price: 29.99, bestSeller: true, flag: "🇪🇺", region: "europe" },
  { id: 3, name: "Japan", data: "15GB", validity: "14 Days", speed: "5G/LTE", price: 24.99, bestSeller: false, flag: "🇯🇵", region: "asia" },
  { id: 4, name: "United States", data: "30GB", validity: "30 Days", speed: "5G/LTE", price: 34.99, bestSeller: false, flag: "🇺🇸", region: "americas" },
  { id: 5, name: "Thailand", data: "8GB", validity: "15 Days", speed: "LTE", price: 11.99, bestSeller: true, flag: "🇹🇭", region: "asia" },
  { id: 6, name: "Australia", data: "25GB", validity: "30 Days", speed: "5G/LTE", price: 39.99, bestSeller: false, flag: "🇦🇺", region: "oceania" },
  { id: 7, name: "UK & Ireland", data: "12GB", validity: "14 Days", speed: "5G/LTE", price: 19.99, bestSeller: false, flag: "🇬🇧", region: "europe" },
  { id: 8, name: "South Korea", data: "10GB", validity: "10 Days", speed: "5G", price: 18.99, bestSeller: false, flag: "🇰🇷", region: "asia" },
];

const regions = [
  { id: 1, name: "Europe", icon: "🇪🇺", countries: ["Germany", "France", "Italy", "Spain", "UK", "Netherlands", "Portugal", "Greece", "Switzerland", "Austria"], countryCount: 40, price: 4.99, popular: true, gradient: "from-blue-500/20 to-cyan-500/20" },
  { id: 2, name: "Asia Pacific", icon: "🌏", countries: ["Japan", "Korea", "Thailand", "Singapore", "Vietnam", "Malaysia", "Indonesia", "Philippines", "Taiwan", "Hong Kong"], countryCount: 30, price: 3.99, popular: true, gradient: "from-rose-500/20 to-orange-500/20" },
  { id: 3, name: "North America", icon: "🌎", countries: ["USA", "Canada", "Mexico"], countryCount: 3, price: 5.99, popular: false, gradient: "from-emerald-500/20 to-teal-500/20" },
  { id: 4, name: "South America", icon: "🌎", countries: ["Brazil", "Argentina", "Chile", "Colombia", "Peru"], countryCount: 12, price: 6.99, popular: false, gradient: "from-green-500/20 to-emerald-500/20" },
  { id: 5, name: "Middle East", icon: "🕌", countries: ["Turkey", "UAE", "Saudi Arabia", "Qatar", "Israel", "Egypt", "Jordan"], countryCount: 15, price: 5.49, popular: true, gradient: "from-amber-500/20 to-yellow-500/20" },
  { id: 6, name: "Oceania", icon: "🦘", countries: ["Australia", "New Zealand", "Fiji"], countryCount: 10, price: 7.99, popular: false, gradient: "from-purple-500/20 to-pink-500/20" },
  { id: 7, name: "Africa", icon: "🌍", countries: ["South Africa", "Morocco", "Kenya", "Nigeria", "Ghana", "Tanzania"], countryCount: 25, price: 6.99, popular: false, gradient: "from-cyan-500/20 to-blue-500/20" },
  { id: 8, name: "Caribbean", icon: "🏝️", countries: ["Jamaica", "Bahamas", "Dominican Republic", "Puerto Rico"], countryCount: 15, price: 8.99, popular: false, gradient: "from-teal-500/20 to-cyan-500/20" },
];

export function PlansRegionsTabs() {
  const [activeTab, setActiveTab] = useState<TabType>("plans");
  const [filter, setFilter] = useState<FilterType>("all");
  const [regionFilter, setRegionFilter] = useState<RegionFilterType>("all");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  const filteredPlans = plans
    .filter((plan) => {
      if (filter === "all") return true;
      if (filter === "bestSeller") return plan.bestSeller;
      if (filter === "europe") return plan.region === "europe";
      if (filter === "asia") return plan.region === "asia";
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low": return a.price - b.price;
        case "price-high": return b.price - a.price;
        case "data-high": return Number.parseInt(b.data) - Number.parseInt(a.data);
        case "name-az": return a.name.localeCompare(b.name);
        default: return (b.bestSeller ? 1 : 0) - (a.bestSeller ? 1 : 0);
      }
    });

  const filteredRegions = regions
    .filter((region) => {
      if (regionFilter === "all") return true;
      if (regionFilter === "popular") return region.popular;
      if (regionFilter === "europe") return region.name === "Europe";
      if (regionFilter === "asia") return region.name === "Asia Pacific";
      if (regionFilter === "americas") return region.name.includes("America");
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low": return a.price - b.price;
        case "price-high": return b.price - a.price;
        case "name-az": return a.name.localeCompare(b.name);
        default: return (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
      }
    });

  return (
    <section className="pt-12 pb-16 sm:pb-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Tabs */}
        <div className="flex items-center justify-start gap-2 mb-8">
          <button
            onClick={() => setActiveTab("plans")}
            className={`px-8 sm:px-10 py-3.5 rounded-xl text-sm sm:text-base font-semibold transition-all ${
              activeTab === "plans"
                ? "bg-primary text-primary-foreground shadow-lg"
                : "bg-card/50 text-muted-foreground hover:bg-card border border-border/50"
            }`}
          >
            Data Plans
          </button>
          <button
            onClick={() => setActiveTab("regions")}
            className={`px-8 sm:px-10 py-3.5 rounded-xl text-sm sm:text-base font-semibold transition-all ${
              activeTab === "regions"
                ? "bg-primary text-primary-foreground shadow-lg"
                : "bg-card/50 text-muted-foreground hover:bg-card border border-border/50"
            }`}
          >
            Regions
          </button>
        </div>

        {/* Content */}
        {activeTab === "plans" ? (
          <>
            {/* Plans Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 gap-4">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 md:text-3xl">Data Plans</h2>
                <p className="text-muted-foreground text-base sm:text-lg">Find the perfect plan for your next adventure.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
                  {[
                    { key: "all", label: "All Plans" },
                    { key: "bestSeller", label: "Best Sellers" },
                    { key: "europe", label: "Europe" },
                    { key: "asia", label: "Asia" },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setFilter(item.key as FilterType)}
                      className={`flex-shrink-0 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                        filter === item.key
                          ? "bg-primary text-primary-foreground"
                          : "bg-card/50 text-muted-foreground hover:bg-card border border-border/50"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <button
                    onClick={() => setSortMenuOpen(!sortMenuOpen)}
                    onBlur={() => setTimeout(() => setSortMenuOpen(false), 150)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium bg-card/50 text-muted-foreground hover:bg-card border border-border/50 transition-all w-full sm:w-auto justify-between"
                  >
                    <ArrowUpDown className="w-4 h-4" />
                    <span className="truncate">{sortOptions.find((opt) => opt.key === sortBy)?.label}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${sortMenuOpen ? "rotate-180" : ""}`} />
                  </button>
                  {sortMenuOpen && (
                    <div className="absolute top-full left-0 sm:right-0 sm:left-auto mt-2 bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl overflow-hidden z-50 min-w-[180px]">
                      {sortOptions.map((option) => (
                        <button
                          key={option.key}
                          onClick={() => { setSortBy(option.key); setSortMenuOpen(false); }}
                          className={`w-full px-4 py-2.5 text-left text-xs sm:text-sm hover:bg-secondary/50 transition-colors ${
                            sortBy === option.key ? "text-primary font-medium" : "text-foreground"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredPlans.map((plan) => (
                <div key={plan.id} className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:bg-card/50">
                  {plan.bestSeller && (
                    <div className="absolute top-3 right-3 z-10">
                      <Badge className="bg-primary/20 text-primary border-primary/30"><Star className="w-3 h-3 mr-1 fill-primary" />Best Seller</Badge>
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">{plan.flag}</span>
                      <div>
                        <h3 className="font-semibold text-foreground">{plan.name}</h3>
                        <p className="text-2xl font-bold text-primary">{plan.data}</p>
                      </div>
                    </div>
                    <div className="space-y-2 mb-5">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground"><Clock className="w-4 h-4" /><span>{plan.validity}</span></div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground"><Signal className="w-4 h-4" /><span>{plan.speed}</span></div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-border/30">
                      <span className="text-2xl font-bold text-foreground">${plan.price}</span>
                      <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90"><ShoppingCart className="w-4 h-4 mr-2" />Buy Now</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Regions Header */}
            <div className="text-left mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border/50 backdrop-blur-sm mb-4">
                <Globe2 className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Regional Plans</span>
              </div>
              <h2 className="text-3xl font-bold mb-3 text-foreground sm:text-3xl">Explore the World</h2>
              <p className="text-muted-foreground text-base sm:text-lg max-w-2xl">
                Choose from our most popular regional plans and stay connected wherever your journey takes you.
              </p>
            </div>

            {/* Regions Filters */}
            <div className="flex flex-col sm:flex-row items-end justify-end gap-3 mb-8">
              <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
                {[
                  { key: "all", label: "All Regions" },
                  { key: "popular", label: "Popular" },
                  { key: "europe", label: "Europe" },
                  { key: "asia", label: "Asia" },
                  { key: "americas", label: "Americas" },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setRegionFilter(item.key as RegionFilterType)}
                    className={`flex-shrink-0 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      regionFilter === item.key
                        ? "bg-primary text-primary-foreground"
                        : "bg-card/50 text-muted-foreground hover:bg-card border border-border/50"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="relative">
                <button
                  onClick={() => setSortMenuOpen(!sortMenuOpen)}
                  onBlur={() => setTimeout(() => setSortMenuOpen(false), 150)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium bg-card/50 text-muted-foreground hover:bg-card border border-border/50 transition-all"
                >
                  <ArrowUpDown className="w-4 h-4" />
                  <span>{sortOptions.find((opt) => opt.key === sortBy)?.label}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${sortMenuOpen ? "rotate-180" : ""}`} />
                </button>
                {sortMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl overflow-hidden z-50 min-w-[180px]">
                    {sortOptions.filter(o => o.key !== "data-high").map((option) => (
                      <button
                        key={option.key}
                        onClick={() => { setSortBy(option.key); setSortMenuOpen(false); }}
                        className={`w-full px-4 py-2.5 text-left text-xs sm:text-sm hover:bg-secondary/50 transition-colors ${
                          sortBy === option.key ? "text-primary font-medium" : "text-foreground"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Regions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredRegions.map((region) => (
                <div key={region.id} className={`group relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br ${region.gradient} backdrop-blur-sm p-5 transition-all duration-300 hover:border-primary/50 hover:scale-[1.02]`}>
                  {region.popular && (
                    <span className="absolute top-3 right-3 px-2 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full border border-primary/30">Popular</span>
                  )}
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-4xl">{region.icon}</span>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{region.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>{region.countryCount} countries</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{region.countries.join(", ")}</p>
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-xs text-muted-foreground">From</span>
                      <p className="text-2xl font-bold text-primary">${region.price}</p>
                    </div>
                    <Button size="sm" variant="outline" className="border-border/50 hover:border-primary hover:bg-primary/10 text-foreground bg-transparent">
                      View Plans <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* View all link */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="border-border/50 hover:border-primary hover:bg-primary/10 text-foreground bg-transparent">
            View All 200+ Destinations
          </Button>
        </div>
      </div>
    </section>
  );
}
