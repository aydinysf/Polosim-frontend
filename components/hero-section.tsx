"use client";

import { useState } from "react";
import { Search, Wifi, Globe, Smartphone, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const popularPlans = [
  { flag: "🇹🇷", name: "Turkey", data: "10GB", price: "$14.99" },
  { flag: "🇯🇵", name: "Japan", data: "15GB", price: "$24.99" },
  { flag: "🇺🇸", name: "USA", data: "30GB", price: "$34.99" },
  { flag: "🇹🇭", name: "Thailand", data: "8GB", price: "$11.99" },
  { flag: "🇦🇺", name: "Australia", data: "25GB", price: "$39.99" },
  { flag: "🇬🇧", name: "UK", data: "12GB", price: "$19.99" },
  { flag: "🇰🇷", name: "Korea", data: "10GB", price: "$18.99" },
  { flag: "🇩🇪", name: "Germany", data: "15GB", price: "$22.99" },
  { flag: "🇫🇷", name: "France", data: "12GB", price: "$19.99" },
  { flag: "🇮🇹", name: "Italy", data: "10GB", price: "$17.99" },
  { flag: "🇪🇸", name: "Spain", data: "10GB", price: "$16.99" },
  { flag: "🇳🇱", name: "Netherlands", data: "10GB", price: "$18.99" },
];

const popularRegions = [
  { icon: "🇪🇺", name: "Europe", countries: "40+ countries", price: "$4.99" },
  { icon: "🌏", name: "Asia", countries: "30+ countries", price: "$3.99" },
  { icon: "🌎", name: "Americas", countries: "25+ countries", price: "$5.99" },
  { icon: "🕌", name: "Middle East", countries: "15+ countries", price: "$5.49" },
  { icon: "🦘", name: "Oceania", countries: "10+ countries", price: "$7.99" },
  { icon: "🌍", name: "Africa", countries: "25+ countries", price: "$6.99" },
];

const popularCountries = [
  "Turkey", "Japan", "United States", "United Kingdom", "Germany",
  "France", "Australia", "Canada", "South Korea", "Thailand",
  "Italy", "Spain", "Netherlands", "Singapore", "UAE"
];

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredCountries = popularCountries.filter((country) =>
    country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scrollPlans = (direction: "left" | "right") => {
    const container = document.getElementById("plans-marquee");
    if (container) {
      container.scrollBy({ left: direction === "left" ? -300 : 300, behavior: "smooth" });
    }
  };

  const scrollRegions = (direction: "left" | "right") => {
    const container = document.getElementById("regions-marquee");
    if (container) {
      container.scrollBy({ left: direction === "left" ? -300 : 300, behavior: "smooth" });
    }
  };

  return (
    <section className="relative pt-36 sm:pt-40 pb-8 flex flex-col items-center justify-start overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(14,116,144,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(14,116,144,0.04)_1px,transparent_1px)] bg-[size:40px_40px] md:bg-[size:60px_60px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,116,144,0.06)_0%,transparent_70%)]" />
        <div className="absolute top-20 left-10 w-48 md:w-72 h-48 md:h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-64 md:w-96 h-64 md:h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4">
        {/* Search bar - TOP */}
        <div className="relative max-w-xl mx-auto mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-cyan-500/20 to-primary/20 rounded-xl sm:rounded-2xl blur-xl" />
            <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-xl sm:rounded-2xl p-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center gap-3 flex-1 pl-3 sm:pl-4">
                  <Search className="w-5 h-5 text-muted-foreground shrink-0" />
                  <Input
                    type="text"
                    placeholder="Where are you traveling?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="border-0 bg-transparent focus-visible:ring-0 text-foreground placeholder:text-muted-foreground text-base sm:text-lg"
                  />
                </div>
                <Button size="lg" className="w-full sm:w-auto rounded-lg sm:rounded-xl px-4 sm:px-6 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Globe className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </div>

          {showSuggestions && searchQuery && filteredCountries.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl overflow-hidden z-50">
              {filteredCountries.slice(0, 5).map((country) => (
                <button
                  key={country}
                  className="w-full px-4 py-3 text-left hover:bg-secondary/50 flex items-center gap-3 transition-colors text-foreground"
                  onClick={() => setSearchQuery(country)}
                >
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  {country}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-card/50 border border-border/50 backdrop-blur-sm">
            <Wifi className="w-4 h-4 text-primary" />
            <span className="text-xs sm:text-sm text-muted-foreground">200+ Countries Covered</span>
          </div>
        </div>

        {/* Popular Plans - Marquee */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 text-center">Popular Plans</h3>
          <div className="relative">
            <button
              onClick={() => scrollPlans("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-card/90 border border-border/50 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-card hover:border-primary/50 transition-all shadow-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollPlans("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-card/90 border border-border/50 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-card hover:border-primary/50 transition-all shadow-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute left-10 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-[5] pointer-events-none" />
            <div className="absolute right-10 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-[5] pointer-events-none" />
            
            <div id="plans-marquee" className="overflow-hidden mx-10">
              <div className="flex gap-3 animate-marquee hover:[animation-play-state:paused]">
                {[...popularPlans, ...popularPlans].map((plan, index) => (
                  <button
                    key={index}
                    className="flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl bg-card/60 border border-border/50 backdrop-blur-sm hover:bg-card hover:border-primary/50 transition-all cursor-pointer group"
                  >
                    <span className="text-2xl">{plan.flag}</span>
                    <div className="text-left">
                      <span className="block text-sm font-medium text-foreground group-hover:text-primary transition-colors">{plan.name}</span>
                      <span className="block text-xs text-muted-foreground">{plan.data} - {plan.price}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Popular Regions - Marquee */}
        <div className="mb-10">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 text-center">Popular Regions</h3>
          <div className="relative">
            <button
              onClick={() => scrollRegions("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-card/90 border border-border/50 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-card hover:border-primary/50 transition-all shadow-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollRegions("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-card/90 border border-border/50 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-card hover:border-primary/50 transition-all shadow-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute left-10 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-[5] pointer-events-none" />
            <div className="absolute right-10 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-[5] pointer-events-none" />
            
            <div id="regions-marquee" className="overflow-hidden mx-10">
              <div className="flex gap-4 animate-marquee-reverse hover:[animation-play-state:paused]">
                {[...popularRegions, ...popularRegions, ...popularRegions].map((region, index) => (
                  <button
                    key={index}
                    className="flex-shrink-0 w-36 h-36 flex flex-col items-center justify-center gap-2 rounded-2xl bg-card/60 border border-border/50 backdrop-blur-sm hover:bg-card hover:border-primary/50 hover:scale-105 transition-all cursor-pointer group"
                  >
                    <span className="text-4xl">{region.icon}</span>
                    <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{region.name}</span>
                    <span className="text-xs text-muted-foreground">{region.countries}</span>
                    <span className="text-xs font-medium text-primary">from {region.price}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
            <span>Instant Activation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full" />
            <span>24/7 Support</span>
          </div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-primary" />
            <span>Works with any eSIM device</span>
          </div>
        </div>
      </div>
    </section>
  );
}
