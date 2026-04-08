"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { bannerService, type Banner } from "@/lib/services/bannerService";
import { getImageUrl } from "@/lib/api-client";
import { getLocalizedText } from "@/lib/product-helpers";
import { useLocale } from "next-intl";

export function PromoBanner() {
  const locale = useLocale();
  const [promos, setPromos] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBanners() {
      try {
        setIsLoading(true);
        const data = await bannerService.getAll();
        setPromos(data);
      } catch (error) {
        console.error("Failed to fetch banners:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBanners();
  }, []);

  const next = () => setCurrent((prev) => (prev + 1) % promos.length);
  const prev = () => setCurrent((prev) => (prev - 1 + promos.length) % promos.length);

  if (isLoading) {
    return (
      <div className="px-4 py-4 w-full h-32 flex items-center justify-center bg-secondary/20 rounded-2xl animate-pulse">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  if (promos.length === 0) return null;

  const currentPromo = promos[current];
  const title = getLocalizedText(currentPromo.title, "", locale);
  const subtitle = getLocalizedText(currentPromo.description, "", locale);
  const imageUrl = currentPromo.image_url ? getImageUrl(currentPromo.image_url) : null;

  return (
    <div className="px-4 py-4">
      <div className={`relative p-4 rounded-2xl border border-border/30 overflow-hidden min-h-[120px] flex flex-col justify-center bg-gradient-to-r from-primary/10 to-transparent`}>
        {/* Background Image if exists */}
        {imageUrl && (
          <div className="absolute inset-0 z-0 opacity-10">
            <img src={imageUrl} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        
        {/* Content */}
        <div className="relative z-10">
          <p className="text-lg font-bold text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{subtitle}</p>
          <button 
            className="mt-3 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold"
            onClick={() => {
              if (currentPromo.link) window.location.href = currentPromo.link;
            }}
          >
            {getLocalizedText(currentPromo.button_text, "Explore", locale)}
          </button>
        </div>

        {/* Navigation */}
        {promos.length > 1 && (
          <>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
              <button 
                onClick={prev}
                className="w-7 h-7 rounded-full bg-background/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={next}
                className="w-7 h-7 rounded-full bg-background/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shadow-sm"
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
          </>
        )}
      </div>
    </div>
  );
}
