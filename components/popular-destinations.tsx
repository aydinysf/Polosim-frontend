"use client";

import { ArrowRight, Globe2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const destinations = [
  {
    name: "Europe",
    countries: "40+ countries",
    price: "$4.99",
    gradient: "from-blue-500/20 to-cyan-500/20",
    icon: "🇪🇺",
    popular: true,
  },
  {
    name: "Asia",
    countries: "30+ countries",
    price: "$3.99",
    gradient: "from-rose-500/20 to-orange-500/20",
    icon: "🌏",
    popular: true,
  },
  {
    name: "North America",
    countries: "3 countries",
    price: "$5.99",
    gradient: "from-emerald-500/20 to-teal-500/20",
    icon: "🌎",
    popular: false,
  },
  {
    name: "Africa",
    countries: "25+ countries",
    price: "$6.99",
    gradient: "from-amber-500/20 to-yellow-500/20",
    icon: "🌍",
    popular: false,
  },
  {
    name: "Middle East",
    countries: "15+ countries",
    price: "$5.49",
    gradient: "from-purple-500/20 to-pink-500/20",
    icon: "🕌",
    popular: false,
  },
  {
    name: "Oceania",
    countries: "10+ countries",
    price: "$7.99",
    gradient: "from-cyan-500/20 to-blue-500/20",
    icon: "🦘",
    popular: false,
  },
];

export function PopularDestinations() {
  return (
    <section className="py-16 sm:py-24 px-4 bg-gray-500">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-card/50 border border-border/50 backdrop-blur-sm mb-4 sm:mb-6">
            <Globe2 className="w-4 h-4 text-primary" />
            <span className="text-xs sm:text-sm text-muted-foreground">Popular Destinations</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-foreground">
            Explore the World
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto px-4">
            Choose from our most popular regional plans and stay connected wherever your journey takes you.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Featured large cards */}
          {destinations.slice(0, 2).map((destination, index) => (
            <div
              key={destination.name}
              className={`group relative overflow-hidden rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-6 transition-all duration-300 hover:border-primary/50 hover:bg-card/50 ${
                index === 0 ? "md:col-span-2 lg:col-span-1 lg:row-span-2" : ""
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${destination.gradient} opacity-30`} />
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl">{destination.icon}</span>
                  {destination.popular && (
                    <span className="px-3 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full border border-primary/30">
                      Popular
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2 text-foreground">{destination.name}</h3>
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>{destination.countries}</span>
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-sm text-muted-foreground">Starting from</span>
                    <p className="text-3xl font-bold text-primary">{destination.price}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="group/btn border-border/50 hover:border-primary hover:bg-primary/10 text-foreground bg-transparent"
                  >
                    View Plans
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {/* Smaller cards */}
          {destinations.slice(2).map((destination) => (
            <div
              key={destination.name}
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-5 transition-all duration-300 hover:border-primary/50 hover:bg-card/50"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${destination.gradient} opacity-20`} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{destination.icon}</span>
                  <span className="text-xl font-bold text-primary">{destination.price}</span>
                </div>
                <h3 className="text-lg font-semibold mb-1 text-foreground">{destination.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{destination.countries}</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full border border-border/50 hover:border-primary/50 hover:bg-primary/10 text-foreground"
                >
                  View Plans
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
