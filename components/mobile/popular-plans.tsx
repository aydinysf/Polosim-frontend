"use client";

import { ChevronRight, Star } from "lucide-react";

const popularPlans = [
  { flag: "TR", name: "Turkey", data: "10GB", validity: "30 Days", price: 14.99, rating: 4.8 },
  { flag: "EU", name: "Europe", data: "20GB", validity: "30 Days", price: 29.99, rating: 4.9 },
  { flag: "JP", name: "Japan", data: "15GB", validity: "15 Days", price: 24.99, rating: 4.7 },
  { flag: "US", name: "USA", data: "30GB", validity: "30 Days", price: 34.99, rating: 4.8 },
  { flag: "TH", name: "Thailand", data: "8GB", validity: "15 Days", price: 11.99, rating: 4.6 },
];

const flagEmojis: Record<string, string> = {
  TR: "🇹🇷",
  EU: "🇪🇺",
  JP: "🇯🇵",
  US: "🇺🇸",
  TH: "🇹🇭",
};

export function PopularPlans() {
  return (
    <div className="py-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="text-base font-semibold text-foreground">Popular Plans</h2>
        <button className="flex items-center gap-1 text-xs text-primary font-medium">
          See All
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Horizontal scroll */}
      <div 
        className="flex gap-3 px-4 overflow-x-auto pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {popularPlans.map((plan) => (
          <button
            key={plan.name}
            className="flex-shrink-0 w-36 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-sm transition-all text-left"
          >
            {/* Flag & Rating */}
            <div className="flex items-start justify-between mb-2">
              <span className="text-3xl">{flagEmojis[plan.flag]}</span>
              <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600">
                <Star className="w-3 h-3 fill-current" />
                <span className="text-[10px] font-medium">{plan.rating}</span>
              </div>
            </div>

            {/* Info */}
            <p className="text-sm font-semibold text-foreground">{plan.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{plan.data} / {plan.validity}</p>

            {/* Price */}
            <div className="mt-2 pt-2 border-t border-border/50">
              <span className="text-base font-bold text-primary">${plan.price}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
