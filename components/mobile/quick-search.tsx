"use client";

import { Search, MapPin } from "lucide-react";
import { useState } from "react";

const recentSearches = ["Turkey", "Europe", "Japan"];

export function QuickSearch() {
  const [focused, setFocused] = useState(false);

  return (
    <div className="px-4 py-4">
      {/* Search bar */}
      <div className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
        focused ? "border-primary bg-card shadow-sm" : "border-border/50 bg-secondary/30"
      }`}>
        <Search className="w-5 h-5 text-muted-foreground shrink-0" />
        <input
          type="text"
          placeholder="Where are you traveling?"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <button className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-xs text-primary font-medium">
          <MapPin className="w-3 h-3" />
          Near me
        </button>
      </div>

      {/* Recent searches */}
      <div className="flex items-center gap-2 mt-3">
        <span className="text-xs text-muted-foreground">Recent:</span>
        <div className="flex gap-2 overflow-x-auto">
          {recentSearches.map((search) => (
            <button
              key={search}
              className="px-3 py-1.5 rounded-full bg-secondary/50 text-xs font-medium text-foreground hover:bg-secondary transition-colors shrink-0"
            >
              {search}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
