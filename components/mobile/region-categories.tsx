"use client";

import { ChevronRight } from "lucide-react";

const regions = [
  { name: "Europe", icon: "🌍", countries: 40, color: "bg-blue-50 border-blue-100" },
  { name: "Asia", icon: "🌏", countries: 30, color: "bg-rose-50 border-rose-100" },
  { name: "Americas", icon: "🌎", countries: 15, color: "bg-emerald-50 border-emerald-100" },
  { name: "Middle East", icon: "🕌", countries: 15, color: "bg-amber-50 border-amber-100" },
  { name: "Africa", icon: "🦁", countries: 25, color: "bg-orange-50 border-orange-100" },
  { name: "Oceania", icon: "🦘", countries: 10, color: "bg-cyan-50 border-cyan-100" },
];

export function RegionCategories() {
  return (
    <div className="py-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="text-base font-semibold text-foreground">Browse by Region</h2>
        <button className="flex items-center gap-1 text-xs text-primary font-medium">
          All Regions
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-2 px-4">
        {regions.map((region) => (
          <button
            key={region.name}
            className={`p-3 rounded-xl border ${region.color} hover:shadow-sm transition-all text-center`}
          >
            <span className="text-2xl block mb-1">{region.icon}</span>
            <p className="text-xs font-medium text-foreground">{region.name}</p>
            <p className="text-[10px] text-muted-foreground">{region.countries}+ countries</p>
          </button>
        ))}
      </div>
    </div>
  );
}
