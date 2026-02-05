"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const promos = [
  {
    id: 1,
    title: "Summer Sale",
    subtitle: "20% off all Europe plans",
    gradient: "from-primary/20 to-primary/5",
    cta: "Shop Now",
  },
  {
    id: 2,
    title: "New: Japan Plans",
    subtitle: "Unlimited data options available",
    gradient: "from-rose-100 to-rose-50",
    cta: "Explore",
  },
  {
    id: 3,
    title: "Refer a Friend",
    subtitle: "Get $5 credit for each referral",
    gradient: "from-emerald-100 to-emerald-50",
    cta: "Invite",
  },
];

export function PromoBanner() {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((prev) => (prev + 1) % promos.length);
  const prev = () => setCurrent((prev) => (prev - 1 + promos.length) % promos.length);

  return (
    <div className="px-4 py-4">
      <div className={`relative p-4 rounded-2xl bg-gradient-to-r ${promos[current].gradient} border border-border/30 overflow-hidden`}>
        {/* Content */}
        <div className="relative z-10">
          <p className="text-lg font-bold text-foreground">{promos[current].title}</p>
          <p className="text-sm text-muted-foreground mt-0.5">{promos[current].subtitle}</p>
          <button className="mt-3 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">
            {promos[current].cta}
          </button>
        </div>

        {/* Navigation */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
          <button 
            onClick={prev}
            className="w-7 h-7 rounded-full bg-background/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={next}
            className="w-7 h-7 rounded-full bg-background/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {promos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                index === current ? "w-4 bg-primary" : "bg-foreground/20"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
