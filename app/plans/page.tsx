"use client";

import { useState } from "react";
import { Search, Signal, Clock, ShoppingCart, Star, ArrowUpDown, ChevronDown, Filter, Globe, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

type SortOption = "popular" | "price-low" | "price-high" | "data-high" | "name-az";

const sortOptions: { key: SortOption; label: string }[] = [
  { key: "popular", label: "Most Popular" },
  { key: "price-low", label: "Price: Low to High" },
  { key: "price-high", label: "Price: High to Low" },
  { key: "data-high", label: "Data: High to Low" },
  { key: "name-az", label: "Name: A to Z" },
];

const allPlans = [
  { id: 1, name: "Turkey", data: "5GB", validity: "7 Days", speed: "5G/LTE", price: 9.99, bestSeller: false, flag: "🇹🇷", region: "europe" },
  { id: 2, name: "Turkey", data: "10GB", validity: "30 Days", speed: "5G/LTE", price: 14.99, bestSeller: true, flag: "🇹🇷", region: "europe" },
  { id: 3, name: "Turkey", data: "20GB", validity: "30 Days", speed: "5G/LTE", price: 24.99, bestSeller: false, flag: "🇹🇷", region: "europe" },
  { id: 4, name: "Europe", data: "10GB", validity: "14 Days", speed: "5G/LTE", price: 19.99, bestSeller: false, flag: "🇪🇺", region: "europe" },
  { id: 5, name: "Europe", data: "20GB", validity: "30 Days", speed: "5G/LTE", price: 29.99, bestSeller: true, flag: "🇪🇺", region: "europe" },
  { id: 6, name: "Europe", data: "50GB", validity: "30 Days", speed: "5G/LTE", price: 49.99, bestSeller: false, flag: "🇪🇺", region: "europe" },
  { id: 7, name: "Japan", data: "5GB", validity: "7 Days", speed: "5G/LTE", price: 12.99, bestSeller: false, flag: "🇯🇵", region: "asia" },
  { id: 8, name: "Japan", data: "15GB", validity: "14 Days", speed: "5G/LTE", price: 24.99, bestSeller: true, flag: "🇯🇵", region: "asia" },
  { id: 9, name: "Japan", data: "30GB", validity: "30 Days", speed: "5G/LTE", price: 39.99, bestSeller: false, flag: "🇯🇵", region: "asia" },
  { id: 10, name: "USA", data: "10GB", validity: "14 Days", speed: "5G/LTE", price: 19.99, bestSeller: false, flag: "🇺🇸", region: "americas" },
  { id: 11, name: "USA", data: "30GB", validity: "30 Days", speed: "5G/LTE", price: 34.99, bestSeller: true, flag: "🇺🇸", region: "americas" },
  { id: 12, name: "USA", data: "Unlimited", validity: "30 Days", speed: "5G/LTE", price: 54.99, bestSeller: false, flag: "🇺🇸", region: "americas" },
  { id: 13, name: "Thailand", data: "8GB", validity: "15 Days", speed: "LTE", price: 11.99, bestSeller: true, flag: "🇹🇭", region: "asia" },
  { id: 14, name: "Thailand", data: "15GB", validity: "30 Days", speed: "LTE", price: 19.99, bestSeller: false, flag: "🇹🇭", region: "asia" },
  { id: 15, name: "Australia", data: "15GB", validity: "14 Days", speed: "5G/LTE", price: 29.99, bestSeller: false, flag: "🇦🇺", region: "oceania" },
  { id: 16, name: "Australia", data: "25GB", validity: "30 Days", speed: "5G/LTE", price: 39.99, bestSeller: true, flag: "🇦🇺", region: "oceania" },
  { id: 17, name: "UK", data: "12GB", validity: "14 Days", speed: "5G/LTE", price: 19.99, bestSeller: false, flag: "🇬🇧", region: "europe" },
  { id: 18, name: "Germany", data: "10GB", validity: "14 Days", speed: "5G/LTE", price: 17.99, bestSeller: false, flag: "🇩🇪", region: "europe" },
  { id: 19, name: "France", data: "10GB", validity: "14 Days", speed: "5G/LTE", price: 17.99, bestSeller: false, flag: "🇫🇷", region: "europe" },
  { id: 20, name: "South Korea", data: "10GB", validity: "10 Days", speed: "5G", price: 18.99, bestSeller: true, flag: "🇰🇷", region: "asia" },
];

const regions = [
  { key: "all", label: "All Regions" },
  { key: "europe", label: "Europe" },
  { key: "asia", label: "Asia" },
  { key: "americas", label: "Americas" },
  { key: "oceania", label: "Oceania" },
];

export default function PlansPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [showBestSellers, setShowBestSellers] = useState(false);

  const filteredPlans = allPlans
    .filter((plan) => {
      const matchesSearch = plan.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRegion = selectedRegion === "all" || plan.region === selectedRegion;
      const matchesBestSeller = !showBestSellers || plan.bestSeller;
      return matchesSearch && matchesRegion && matchesBestSeller;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low": return a.price - b.price;
        case "price-high": return b.price - a.price;
        case "data-high": 
          const aData = a.data === "Unlimited" ? 999 : Number.parseInt(a.data);
          const bData = b.data === "Unlimited" ? 999 : Number.parseInt(b.data);
          return bData - aData;
        case "name-az": return a.name.localeCompare(b.name);
        default: return (b.bestSeller ? 1 : 0) - (a.bestSeller ? 1 : 0);
      }
    });

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-40 pb-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(14,116,144,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(14,116,144,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-20 left-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border/50 backdrop-blur-sm mb-6">
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">200+ Destinations Available</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 md:text-4xl">
            Browse All Plans
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8 text-lg">
            Find the perfect eSIM data plan for your destination. Instant activation, no roaming fees.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-xl mx-auto">
            <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 flex-1 pl-4">
                  <Search className="w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search countries or regions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-0 bg-transparent focus-visible:ring-0 text-foreground placeholder:text-muted-foreground text-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Plans */}
      <section className="pb-24 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Filter Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8 p-4 rounded-2xl bg-card/30 border border-border/50 backdrop-blur-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              {regions.map((region) => (
                <button
                  key={region.key}
                  onClick={() => setSelectedRegion(region.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedRegion === region.key
                      ? "bg-primary text-primary-foreground"
                      : "bg-card/50 text-muted-foreground hover:bg-card border border-border/50"
                  }`}
                >
                  {region.label}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowBestSellers(!showBestSellers)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  showBestSellers
                    ? "bg-primary text-primary-foreground"
                    : "bg-card/50 text-muted-foreground hover:bg-card border border-border/50"
                }`}
              >
                <Star className={`w-4 h-4 ${showBestSellers ? "fill-primary-foreground" : ""}`} />
                Best Sellers
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setSortMenuOpen(!sortMenuOpen)}
                  onBlur={() => setTimeout(() => setSortMenuOpen(false), 150)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-card/50 text-muted-foreground hover:bg-card border border-border/50 transition-all"
                >
                  <ArrowUpDown className="w-4 h-4" />
                  {sortOptions.find((opt) => opt.key === sortBy)?.label}
                  <ChevronDown className={`w-4 h-4 transition-transform ${sortMenuOpen ? "rotate-180" : ""}`} />
                </button>
                {sortMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl overflow-hidden z-50 min-w-[180px]">
                    {sortOptions.map((option) => (
                      <button
                        key={option.key}
                        onClick={() => { setSortBy(option.key); setSortMenuOpen(false); }}
                        className={`w-full px-4 py-2.5 text-left text-sm hover:bg-secondary/50 transition-colors ${
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

          {/* Results Count */}
          <p className="text-sm text-muted-foreground mb-6">
            Showing {filteredPlans.length} plans
          </p>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPlans.map((plan) => (
              <div
                key={plan.id}
                className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:bg-card/50"
              >
                {plan.bestSeller && (
                  <div className="absolute top-3 right-3 z-10">
                    <Badge className="bg-primary/20 text-primary border-primary/30">
                      <Star className="w-3 h-3 mr-1 fill-primary" />
                      Best Seller
                    </Badge>
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">{plan.flag}</span>
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">{plan.name}</h3>
                      <p className="text-2xl font-bold text-primary">{plan.data}</p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-5">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{plan.validity}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Signal className="w-4 h-4" />
                      <span>{plan.speed}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Wifi className="w-4 h-4" />
                      <span>Instant Activation</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-border/30">
                    <span className="text-2xl font-bold text-foreground">${plan.price}</span>
                    <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Buy Now
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredPlans.length === 0 && (
            <div className="text-center py-16">
              <Globe className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No plans found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
