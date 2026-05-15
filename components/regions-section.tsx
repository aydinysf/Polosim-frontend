"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { regionService, type Region } from "@/lib/services/regionService";

// Default data as fallback - 8 Afrika regions matching the design
const defaultRegions = [
  { id: "africa-1", name: "Afrika", price: "8 Dolar", validity: "30 Minutes Plan", icon: "africa" },
  { id: "africa-2", name: "Afrika", price: "9 Dolar", validity: "20 Hours Plan", icon: "africa" },
  { id: "africa-3", name: "Afrika", price: "9 Dolar", validity: "30 Minutes Plan", icon: "africa" },
  { id: "africa-4", name: "Afrika", price: "8 Dolar", validity: "30 Minutes Plan", icon: "africa" },
  { id: "africa-5", name: "Afrika", price: "8 Dolar", validity: "30 Minutes Plan", icon: "africa" },
  { id: "africa-6", name: "Afrika", price: "20 Dolar", validity: "20 Hours Plan", icon: "africa" },
  { id: "africa-7", name: "Afrika", price: "8 Dolar", validity: "30 Minutes Plan", icon: "africa" },
  { id: "africa-8", name: "Afrika", price: "8 Dolar", validity: "20 Hours Plan", icon: "africa" },
];

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
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
            price: `${reg.starting_price ? reg.starting_price + ' Dolar' : '8 Dolar'}`,
            validity: `30 Minutes Plan`,
            icon: reg.slug || reg.name.toLowerCase(),
            originalId: reg.id
          }));
          
          // If we have at least some regions, update the state
          setDisplayRegions(formatted.slice(0, 8));
        }
      } catch (error) {
        console.error("Failed to fetch regions, using defaults:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRegions();
  }, []);
  
  return (
    <section className="py-16 px-[5%] bg-[#FAF9F6] relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto relative z-10">
        {/* Section header */}
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-[24px] md:text-[28px] font-bold text-[var(--text-dark)]">
            Bölgeleri Keşfet
          </h2>
          <button 
            className="text-[13px] font-semibold text-black hover:text-[var(--gray-text)] bg-transparent border-none p-0 cursor-pointer transition-colors"
            onClick={() => router.push("/plans?view=regions")}
          >
            Hepsini Gör
          </button>
        </div>

        {/* Region Cards Grid - 4 columns, 2 rows */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 gap-y-10">
          {displayRegions.map((region, index) => (
            <div
              key={region.id + '-' + index}
              className="group relative bg-white rounded-2xl pt-8 pb-4 px-4 text-center border border-[var(--gray-mid)] hover:border-[var(--gold)] hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col items-center"
              onClick={() => router.push(`/plans?search=${region.name}`)}
            >
              {/* Floating Globe Icon */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-[#FAF9F6] border border-[var(--gray-mid)] group-hover:border-[var(--gold)] flex items-center justify-center transition-all shadow-sm">
                <div className="w-10 h-10 rounded-full bg-[#C9A84C] flex items-center justify-center">
                  <GlobeIcon className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Content */}
              <h3 className="text-[16px] font-bold text-[var(--text-dark)] mb-1 mt-1">
                {region.name}
              </h3>
              
              <div className="flex flex-col items-center gap-0.5 text-[12px] text-[var(--gray-text)]">
                <span className="font-semibold text-[var(--gold)]">{region.price}</span>
                <span>{region.validity}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
