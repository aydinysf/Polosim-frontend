"use client";

import { useState } from "react";
import { Signal, Clock, ShoppingCart, Star, ArrowUpDown, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type SortOption = "popular" | "price-low" | "price-high" | "data-high" | "name-az";

const sortOptions: { key: SortOption; label: string }[] = [
  { key: "popular", label: "Most Popular" },
  { key: "price-low", label: "Price: Low to High" },
  { key: "price-high", label: "Price: High to Low" },
  { key: "data-high", label: "Data: High to Low" },
  { key: "name-az", label: "Name: A to Z" },
];

const plans = [
  {
    id: 1,
    name: "Turkey",
    data: "10GB",
    validity: "30 Days",
    speed: "5G/LTE",
    price: 14.99,
    bestSeller: true,
    flag: "🇹🇷",
  },
  {
    id: 2,
    name: "Europe",
    data: "20GB",
    validity: "30 Days",
    speed: "5G/LTE",
    price: 29.99,
    bestSeller: true,
    flag: "🇪🇺",
  },
  {
    id: 3,
    name: "Japan",
    data: "15GB",
    validity: "14 Days",
    speed: "5G/LTE",
    price: 24.99,
    bestSeller: false,
    flag: "🇯🇵",
  },
  {
    id: 4,
    name: "United States",
    data: "30GB",
    validity: "30 Days",
    speed: "5G/LTE",
    price: 34.99,
    bestSeller: false,
    flag: "🇺🇸",
  },
  {
    id: 5,
    name: "Thailand",
    data: "8GB",
    validity: "15 Days",
    speed: "LTE",
    price: 11.99,
    bestSeller: true,
    flag: "🇹🇭",
  },
  {
    id: 6,
    name: "Australia",
    data: "25GB",
    validity: "30 Days",
    speed: "5G/LTE",
    price: 39.99,
    bestSeller: false,
    flag: "🇦🇺",
  },
  {
    id: 7,
    name: "UK & Ireland",
    data: "12GB",
    validity: "14 Days",
    speed: "5G/LTE",
    price: 19.99,
    bestSeller: false,
    flag: "🇬🇧",
  },
  {
    id: 8,
    name: "South Korea",
    data: "10GB",
    validity: "10 Days",
    speed: "5G",
    price: 18.99,
    bestSeller: false,
    flag: "🇰🇷",
  },
];

type FilterType = "all" | "bestSeller" | "europe" | "asia";

export function ProductListing() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  const filteredPlans = plans
    .filter((plan) => {
      if (filter === "all") return true;
      if (filter === "bestSeller") return plan.bestSeller;
      if (filter === "europe") return ["Europe", "UK & Ireland", "Turkey"].includes(plan.name);
      if (filter === "asia") return ["Japan", "Thailand", "South Korea"].includes(plan.name);
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "data-high":
          return Number.parseInt(b.data) - Number.parseInt(a.data);
        case "name-az":
          return a.name.localeCompare(b.name);
        case "popular":
        default:
          return (b.bestSeller ? 1 : 0) - (a.bestSeller ? 1 : 0);
      }
    });

  return (
    <section className="py-16 sm:py-24 px-4 bg-gray-400">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 sm:mb-12 gap-4 sm:gap-6">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4 text-foreground">
              Data Plans
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg">
              Find the perfect plan for your next adventure.
            </p>
          </div>
          
          {/* Filters and Sort */}
          <div className="flex flex-col gap-3 sm:gap-4 w-full md:w-auto">
            {/* Filters - horizontal scroll on mobile */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setSortMenuOpen(!sortMenuOpen)}
                onBlur={() => setTimeout(() => setSortMenuOpen(false), 150)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium bg-card/50 text-muted-foreground hover:bg-card border border-border/50 transition-all w-full sm:w-auto justify-between sm:justify-start"
              >
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4" />
                  <span className="truncate">{sortOptions.find((opt) => opt.key === sortBy)?.label}</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform shrink-0 ${sortMenuOpen ? "rotate-180" : ""}`} />
              </button>
              {sortMenuOpen && (
                <div className="absolute top-full left-0 sm:right-0 sm:left-auto mt-2 bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl overflow-hidden z-50 min-w-[180px] w-full sm:w-auto">
                  {sortOptions.map((option) => (
                    <button
                      key={option.key}
                      onClick={() => {
                        setSortBy(option.key);
                        setSortMenuOpen(false);
                      }}
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

        {/* Product cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {filteredPlans.map((plan) => (
            <div
              key={plan.id}
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:bg-card/50"
            >
              {/* Best seller badge */}
              {plan.bestSeller && (
                <div className="absolute top-3 right-3 z-10">
                  <Badge className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/30">
                    <Star className="w-3 h-3 mr-1 fill-primary" />
                    Best Seller
                  </Badge>
                </div>
              )}

              <div className="p-5">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{plan.flag}</span>
                  <div>
                    <h3 className="font-semibold text-foreground">{plan.name}</h3>
                    <p className="text-2xl font-bold text-primary">{plan.data}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-5">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{plan.validity}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Signal className="w-4 h-4" />
                    <span>{plan.speed}</span>
                  </div>
                </div>

                {/* Price and CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-border/30">
                  <div>
                    <span className="text-2xl font-bold text-foreground">${plan.price}</span>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Buy Now
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

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
