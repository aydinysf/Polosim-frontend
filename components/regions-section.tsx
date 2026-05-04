"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { regionService, type Region } from "@/lib/services/regionService";

// Default data as fallback
const defaultRegions = [
  { id: "africa", name: "Afrika", countries: "5 Ülke", plans: "20 Mevcut Plan", icon: "africa" },
  { id: "asia", name: "Asya", countries: "12 Ülke", plans: "45 Mevcut Plan", icon: "asia" },
  { id: "europe", name: "Avrupa", countries: "35 Ülke", plans: "120 Mevcut Plan", icon: "europe" },
  { id: "middle-east", name: "Orta Doğu", countries: "8 Ülke", plans: "30 Mevcut Plan", icon: "middle-east" },
  { id: "north-america", name: "Kuzey Amerika", countries: "3 Ülke", plans: "15 Mevcut Plan", icon: "north-america" },
  { id: "oceania", name: "Okyanusya", countries: "2 Ülke", plans: "10 Mevcut Plan", icon: "oceania" },
  { id: "south-america", name: "Güney Amerika", countries: "6 Ülke", plans: "25 Mevcut Plan", icon: "south-america" },
  { id: "global", name: "Küresel", countries: "200+ Ülke", plans: "500+ Mevcut Plan", icon: "global" },
];

function ContinentIcon({ type, className }: { type: string, className?: string }) {
  // Map slugs or names to icons
  const lowerType = type.toLowerCase();
  
  if (lowerType.includes("africa")) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M12.4,3.2C12,3.1,11.5,3,11,3.1c-0.5,0-1,0.2-1.4,0.5c-0.3,0.3-0.5,0.7-0.5,1.1c0,0.4,0.1,0.8,0.4,1.1c0.1,0.1,0.3,0.3,0.3,0.5 c0,0.2-0.1,0.4-0.1,0.7c0,0.2,0.1,0.4,0.2,0.6c0.1,0.2,0.2,0.3,0.4,0.4c0.2,0.1,0.4,0.1,0.6,0.1c0.2,0,0.4-0.1,0.5-0.2 c0.2-0.2,0.5-0.3,0.8-0.3c0.3,0,0.6,0.1,0.8,0.3c0.1,0.1,0.2,0.3,0.3,0.5c0.1,0.2,0.1,0.4,0.1,0.6c0,0.2-0.1,0.4-0.2,0.6 c-0.1,0.2-0.3,0.4-0.5,0.5c-0.4,0.2-0.7,0.5-0.9,0.9c-0.2,0.4-0.2,0.8,0,1.2c0.1,0.1,0.2,0.3,0.2,0.5c0,0.2-0.1,0.4-0.2,0.6 c-0.1,0.2-0.3,0.4-0.5,0.5c-0.4,0.2-0.8,0.3-1.2,0.2c-0.4-0.1-0.8-0.3-1.1-0.6c-0.1-0.1-0.2-0.2-0.4-0.3C8,12,7.8,12,7.6,12.1 c-0.2,0.1-0.3,0.2-0.4,0.4c-0.1,0.2-0.1,0.4,0,0.6c0.1,0.2,0.2,0.3,0.3,0.5c0.4,0.4,0.6,1,0.7,1.5c0.1,0.6,0,1.2-0.3,1.7 c-0.1,0.1-0.1,0.3-0.1,0.5s0.1,0.4,0.2,0.5c0.1,0.2,0.3,0.3,0.5,0.4c0.2,0.1,0.4,0.1,0.6,0c0.2-0.1,0.3-0.2,0.4-0.4 c0.1-0.2,0.3-0.3,0.5-0.3c0.2,0,0.4,0.1,0.5,0.3c0.2,0.2,0.3,0.5,0.3,0.8c0,0.3-0.1,0.6-0.3,0.8c-0.1,0.1-0.2,0.2-0.2,0.4 c0,0.2,0,0.4,0.1,0.6c0.1,0.2,0.2,0.3,0.4,0.4c0.2,0.1,0.4,0.1,0.6,0c0.3-0.1,0.7-0.2,1-0.1c0.3,0.1,0.6,0.3,0.9,0.5 c0.1,0.1,0.3,0.2,0.5,0.2s0.4-0.1,0.5-0.2c0.2-0.2,0.3-0.5,0.3-0.8c0-0.3,0.1-0.6,0.3-0.8c0.2-0.2,0.5-0.3,0.8-0.3 c0.3,0,0.6,0.1,0.8,0.3c0.1,0.1,0.2,0.2,0.4,0.3c0.2,0.1,0.4,0.1,0.6,0.1c0.2,0,0.4-0.1,0.5-0.3c0.1-0.2,0.1-0.4,0-0.6 c-0.1-0.2-0.1-0.4,0-0.6c0.1-0.2,0.2-0.3,0.4-0.4c0.4-0.2,0.8-0.5,1.1-0.9c0.3-0.4,0.5-0.8,0.5-1.3c0-0.2,0.1-0.4,0.2-0.6 c0.1-0.2,0.3-0.3,0.5-0.4c0.4-0.2,0.7-0.5,0.9-0.9c0.2-0.4,0.3-0.8,0.2-1.3c-0.1-0.4-0.2-0.8-0.5-1.1c-0.3-0.3-0.7-0.5-1.1-0.6 c-0.2,0-0.4-0.1-0.6-0.2c-0.2-0.1-0.3-0.3-0.4-0.5c-0.2-0.4-0.3-0.8-0.2-1.3c0.1-0.5,0.3-0.9,0.6-1.2c0.1-0.1,0.2-0.3,0.2-0.5 c0-0.2-0.1-0.4-0.2-0.6c-0.1-0.2-0.3-0.3-0.5-0.4c-0.2-0.1-0.4-0.1-0.6,0c-0.2,0.1-0.3,0.2-0.4,0.4c-0.3,0.4-0.7,0.7-1.1,0.9 c-0.4,0.2-0.9,0.3-1.4,0.2c-0.2,0-0.4-0.1-0.5-0.2c-0.1-0.1-0.2-0.3-0.2-0.5c-0.1-0.4-0.3-0.8-0.6-1.1c-0.3-0.3-0.7-0.5-1.1-0.6 C12.8,3.3,12.6,3.2,12.4,3.2z" />
      </svg>
    );
  }
  if (lowerType.includes("asia")) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M21,11c-0.3-0.1-0.7-0.1-1,0c-0.3,0.1-0.6,0.3-0.8,0.6c-0.2,0.3-0.2,0.7-0.2,1c0.1,0.3,0.3,0.6,0.6,0.8 c0.1,0.1,0.2,0.2,0.3,0.3c0.1,0.1,0.1,0.3,0.1,0.4c0,0.2-0.1,0.3-0.2,0.4c-0.1,0.1-0.3,0.2-0.4,0.2c-0.4,0-0.7,0.2-0.9,0.5 c-0.2,0.3-0.3,0.7-0.2,1.1c0,0.2,0.1,0.3,0.2,0.5c0.1,0.1,0.3,0.2,0.5,0.2c0.2,0,0.4-0.1,0.5-0.2c0.1-0.1,0.2-0.3,0.2-0.5 c0-0.2,0.1-0.3,0.2-0.4c0.1-0.1,0.3-0.2,0.4-0.2c0.3,0,0.6-0.1,0.8-0.3c0.2-0.2,0.4-0.5,0.5-0.8c0.1-0.3,0.1-0.7,0-1 C21.9,11.5,21.5,11.2,21,11z M18.5,5c-0.3-0.2-0.7-0.3-1-0.2c-0.3,0-0.6,0.2-0.9,0.4c-0.2,0.2-0.4,0.5-0.5,0.9 c-0.1,0.3,0,0.7,0.2,1c0.1,0.2,0.3,0.3,0.5,0.4c0.2,0.1,0.4,0,0.6-0.1c0.2-0.1,0.3-0.3,0.3-0.5c0-0.2,0.1-0.3,0.2-0.4 c0.1-0.1,0.3-0.1,0.5,0c0.3,0.1,0.7,0.1,1,0c0.3-0.1,0.6-0.3,0.8-0.6c0.2-0.3,0.2-0.7,0.2-1c-0.1-0.3-0.3-0.6-0.6-0.8 C19.5,5.2,19,5.1,18.5,5z M15,8c-0.4,0-0.8,0.2-1.1,0.5c-0.3,0.3-0.5,0.7-0.5,1.1c0,0.4,0.2,0.8,0.5,1.1c0.3,0.3,0.7,0.5,1.1,0.5 c0.4,0,0.8-0.2,1.1-0.5c0.3-0.3,0.5-0.7,0.5-1.1c0-0.4-0.2-0.8-0.5-1.1C15.8,8.2,15.4,8,15,8z M10,4C9.6,4,9.2,4.2,8.9,4.5 c-0.3,0.3-0.5,0.7-0.5,1.1c0,0.4,0.2,0.8,0.5,1.1c0.3,0.3,0.7,0.5,1.1,0.5c0.4,0,0.8-0.2,1.1-0.5c0.3-0.3,0.5-0.7,0.5-1.1 c0-0.4-0.2-0.8-0.5-1.1C10.8,4.2,10.4,4,10,4z M6,7C5.6,7,5.2,7.2,4.9,7.5C4.6,7.8,4.4,8.2,4.4,8.6c0,0.4,0.2,0.8,0.5,1.1 c0.3,0.3,0.7,0.5,1.1,0.5c0.4,0,0.8-0.2,1.1-0.5c0.3-0.3,0.5-0.7,0.5-1.1c0-0.4-0.2-0.8-0.5-1.1C6.8,7.2,6.4,7,6,7z M5,12 c-0.4,0-0.8,0.2-1.1,0.5C3.6,12.8,3.4,13.2,3.4,13.6c0,0.4,0.2,0.8,0.5,1.1C4.2,15,4.6,15.2,5,15.2c0.4,0,0.8-0.2,1.1-0.5 c0.3-0.3,0.5-0.7,0.5-1.1c0-0.4-0.2-0.8-0.5-1.1C5.8,12.2,5.4,12,5,12z M9,16c-0.4,0-0.8,0.2-1.1,0.5c-0.3,0.3-0.5,0.7-0.5,1.1 c0,0.4,0.2,0.8,0.5,1.1c0.3,0.3,0.7,0.5,1.1,0.5c0.4,0,0.8-0.2,1.1-0.5c0.3-0.3,0.5-0.7,0.5-1.1c0-0.4-0.2-0.8-0.5-1.1 C9.8,16.2,9.4,16,9,16z M13,15c-0.4,0-0.8,0.2-1.1,0.5c-0.3,0.3-0.5,0.7-0.5,1.1c0,0.4,0.2,0.8,0.5,1.1c0.3,0.3,0.7,0.5,1.1,0.5 c0.4,0,0.8-0.2,1.1-0.5c0.3-0.3,0.5-0.7,0.5-1.1c0-0.4-0.2-0.8-0.5-1.1C13.8,15.2,13.4,15,13,15z" />
      </svg>
    );
  }
  if (lowerType.includes("europ")) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M11,4c-1,0-1.9,0.3-2.6,0.9C7.7,5.5,7.2,6.3,7.1,7.2C7,8.2,7.2,9.1,7.8,9.9c0.6,0.8,1.4,1.3,2.4,1.5c0.1,0,0.3,0.1,0.4,0.2 c0.1,0.1,0.2,0.3,0.2,0.5c0,0.2-0.1,0.4-0.2,0.6c-0.1,0.2-0.3,0.3-0.5,0.4c-0.5,0.1-0.9,0.4-1.2,0.7c-0.3,0.3-0.5,0.8-0.5,1.2 c0,0.2-0.1,0.3-0.2,0.5c-0.1,0.1-0.3,0.2-0.5,0.2c-0.2,0-0.4-0.1-0.5-0.2c-0.1-0.1-0.2-0.3-0.2-0.5c0-0.4,0.2-0.8,0.5-1.1 c0.3-0.3,0.7-0.5,1.1-0.6c0.2,0,0.3-0.1,0.4-0.2c0.1-0.1,0.2-0.3,0.2-0.4c0-0.2-0.1-0.3-0.2-0.5c-0.1-0.1-0.3-0.2-0.4-0.2 c-0.6-0.1-1.1-0.4-1.5-0.8c-0.4-0.4-0.7-1-0.8-1.5c-0.1-0.6,0-1.1,0.3-1.6c0.3-0.5,0.7-0.9,1.2-1.1c0.2-0.1,0.3-0.2,0.4-0.4 c0.1-0.2,0.1-0.4,0-0.6c-0.1-0.2-0.2-0.3-0.4-0.4c-0.2-0.1-0.4-0.1-0.6,0C6.6,4.6,6.1,5,5.7,5.5c-0.4,0.5-0.6,1.1-0.7,1.7 c0,0.6,0.1,1.2,0.4,1.7c0.3,0.5,0.7,0.9,1.2,1.2c0.1,0.1,0.3,0.2,0.4,0.4c0.1,0.2,0.1,0.4,0,0.6c-0.1,0.2-0.2,0.3-0.4,0.4 c-0.2,0.1-0.4,0.1-0.6,0c-0.7-0.4-1.2-1-1.6-1.7c-0.4-0.7-0.5-1.5-0.4-2.3c0.1-0.8,0.4-1.6,1-2.2c0.6-0.6,1.3-1,2.1-1.2 c0.2,0,0.4-0.1,0.6-0.2c0.2-0.1,0.3-0.3,0.4-0.5c0.1-0.2,0.1-0.4,0-0.6s-0.2-0.3-0.4-0.4c-1-0.4-2-0.5-3-0.3c-1,0.2-2,0.7-2.7,1.4 c-0.8,0.7-1.3,1.7-1.6,2.7c-0.2,1-0.1,2.1,0.3,3c0.4,1,1.1,1.8,1.9,2.4c0.1,0.1,0.2,0.3,0.2,0.5c0,0.2-0.1,0.4-0.2,0.6 c-0.1,0.2-0.3,0.3-0.5,0.4c-0.2,0.1-0.4,0.1-0.6,0c-1-0.7-1.8-1.6-2.3-2.7C0.1,11,0,9.8,0.2,8.6C0.4,7.4,0.9,6.3,1.7,5.3 c0.8-1,1.8-1.7,3-2.1C5.9,2.8,7.1,2.6,8.3,2.8c1.2,0.2,2.3,0.7,3.2,1.5C11.7,4.5,11.8,4.7,11.8,4.9S11.7,5.3,11.5,5.4 C11.4,5.6,11.2,5.7,11,5.7c-0.2,0-0.4-0.1-0.5-0.2C10.1,5.2,9.6,5,9.1,4.9C8.6,4.8,8.1,4.9,7.6,5.1c-0.5,0.2-0.9,0.5-1.2,0.9 C6.1,6.4,5.9,6.9,5.8,7.4c0,0.5,0.1,1,0.3,1.5c0.2,0.5,0.5,0.9,0.9,1.2C7.1,10.2,7.2,10.4,7.2,10.6c0,0.2-0.1,0.4-0.2,0.6 c-0.1,0.2-0.3,0.3-0.5,0.4c-0.2,0.1-0.4,0.1-0.6,0C5.3,11.2,4.8,10.6,4.5,10c-0.3-0.6-0.4-1.3-0.3-2c0.1-0.7,0.4-1.3,0.9-1.8 c0.5-0.5,1.1-0.8,1.8-0.9C7.6,5.2,8.3,5.3,8.9,5.6c0.1,0.1,0.3,0.1,0.5,0.1c0.2,0,0.4-0.1,0.5-0.2c0.2-0.2,0.3-0.5,0.3-0.8 C10.2,4.4,10.6,4.1,11,4z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
       <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
       <path d="M12,2C6.5,2,2,6.5,2,12s4.5,10,10,10s10-4.5,10-10S17.5,2,12,2z M12,20c-4.4,0-8-3.6-8-8c0-1.4,0.4-2.7,1-3.8L9,12l3,3l3-3l3.6-5.4c0.8,1.3,1.4,2.7,1.4,4.4C20,16.4,16.4,20,12,20z" />
    </svg>
  );
}

export function RegionsSection() {
  const router = useRouter();
  const [displayRegions, setDisplayRegions] = useState<any[]>(defaultRegions);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRegions() {
      try {
        setIsLoading(true);
        const data = await regionService.getAll();
        
        if (data && data.length > 0) {
          // Transform API data to our card format
          const formatted = data.map((reg: Region) => ({
            id: reg.slug || reg.id.toString(),
            name: reg.name,
            countries: `${reg.countries_count || 0} Ülke`,
            plans: `${reg.starting_price ? '€' + reg.starting_price + '\'den başlayan' : 'Çok Yakında'}`,
            icon: reg.slug || reg.name.toLowerCase(),
            originalId: reg.id
          }));
          
          // If we have at least some regions, update the state
          // Otherwise keep defaults
          setDisplayRegions(formatted.slice(0, 8));
        }
      } catch (error) {
        console.error("Failed to fetch regions, using defaults:", error);
        // Fallback is already in state (defaultRegions)
      } finally {
        setIsLoading(false);
      }
    }

    fetchRegions();
  }, []);
  
  return (
    <section className="py-24 px-[5%] bg-[#F8F9FA] relative overflow-hidden">
      {/* Background World Map Pattern */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none flex items-center justify-center">
        <svg width="1200" height="600" viewBox="0 0 1000 500" fill="var(--navy)">
          <path d="M150,100c-10,0-20,10-20,20s10,20,20,20h50c10,0,20-10,20-20s-10-20-20-20H150z M300,150c-10,0-20,10-20,20s10,20,20,20h80c10,0,20-10,20-20s-10-20-20-20H300z M500,80c-10,0-20,10-20,20s10,20,20,20h100c10,0,20-10,20-20s-10-20-20-20H500z M750,120c-10,0-20,10-20,20s10,20,20,20h60c10,0,20-10,20-20s-10-20-20-20H750z M200,300c-10,0-20,10-20,20s10,20,20,20h120c10,0,20-10,20-20s-10-20-20-20H200z M450,350c-10,0-20,10-20,20s10,20,20,20h90c10,0,20-10,20-20s-10-20-20-20H450z M650,280c-10,0-20,10-20,20s10,20,20,20h110c10,0,20-10,20-20s-10-20-20-20H650z M850,320c-10,0-20,10-20,20s10,20,20,20h40c10,0,20-10,20-20s-10-20-20-20H850z" opacity="0.4" />
        </svg>
      </div>

      <div className="max-w-[1240px] mx-auto relative z-10">
        {/* Section header */}
        <div className="flex items-center justify-between mb-20">
          <h2 className="text-[28px] md:text-[34px] font-extrabold text-[var(--text-dark)] font-['Sora'] tracking-tight">
            Bölgeleri Keşfet
          </h2>
          <button 
            className="text-[14px] font-bold text-[var(--gold)] hover:text-[var(--gold-light)] bg-transparent border-none p-0 cursor-pointer transition-colors"
            onClick={() => router.push("/plans?view=regions")}
          >
            Hepsini Gör
          </button>
        </div>

        {/* Region Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-20">
          {displayRegions.map((region) => (
            <div
              key={region.id}
              className="group relative bg-white rounded-2xl pt-14 pb-10 px-6 text-center border-[1.5px] border-[var(--gold)] hover:bg-[var(--navy)] hover:border-[var(--navy)] transition-all duration-300 cursor-pointer shadow-sm hover:shadow-2xl flex flex-col items-center"
              onClick={() => router.push(`/plans?search=${region.name}`)}
            >
              {/* Floating Icon Circle */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white border-[1.5px] border-[var(--gold)] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <div className="w-16 h-16 rounded-full bg-[#F4F5F7] flex items-center justify-center text-[var(--navy)] group-hover:bg-[var(--gold-pale)] transition-colors">
                  <ContinentIcon type={region.icon} className="w-9 h-9 opacity-90" />
                </div>
              </div>

              {/* Content */}
              <h3 className="text-[20px] font-bold text-[var(--text-dark)] mb-4 font-['Sora'] group-hover:text-white transition-colors">
                {region.name}
              </h3>
              
              <div className="flex items-center gap-3 justify-center">
                <span className="text-[14px] text-[var(--gray-text)] font-semibold group-hover:text-white/60 transition-colors">
                  {region.countries}
                </span>
                <span className="w-1 h-1 rounded-full bg-[var(--gray-mid)] group-hover:bg-white/20"></span>
                <span className="text-[14px] text-[var(--text-dark)] font-bold group-hover:text-white transition-colors">
                  {region.plans}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
