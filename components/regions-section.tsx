"use client";

import { ArrowRight, MapPin } from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";

const regions = [
  { name: "Afrika", countries: "5 Ülke", plans: "20 Mevcut Plan", icon: "🌍" },
  { name: "Asya", countries: "12 Ülke", plans: "45 Mevcut Plan", icon: "🌏" },
  { name: "Avrupa", countries: "35 Ülke", plans: "120 Mevcut Plan", icon: "🇪🇺" },
  { name: "Orta Doğu", countries: "8 Ülke", plans: "30 Mevcut Plan", icon: "🕌" },
  { name: "Kuzey Amerika", countries: "3 Ülke", plans: "15 Mevcut Plan", icon: "🌎" },
  { name: "Okyanusya", countries: "2 Ülke", plans: "10 Mevcut Plan", icon: "🦘" },
];

export function RegionsSection() {
  const router = useRouter();
  
  return (
    <section className="py-20 px-[5%] bg-[#F9FAFB]">
      <div className="max-w-[1200px] mx-auto">
        {/* Section header */}
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-[28px] font-extrabold text-[var(--text-dark)] font-['Sora']">
            Bölgeleri Keşfet
          </h2>
          <button 
            className="text-sm font-bold text-[var(--gold)] hover:underline bg-transparent border-none p-0 cursor-pointer"
            onClick={() => router.push("/plans?view=regions")}
          >
            Hepsini Gör
          </button>
        </div>

        {/* Region Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {regions.map((region) => (
            <div
              key={region.name}
              className="group bg-white rounded-2xl p-8 text-center border border-[var(--gray-mid)] hover:border-[var(--gold)] transition-all cursor-pointer hover:shadow-2xl flex flex-col items-center justify-between min-h-[320px] shadow-sm"
              onClick={() => router.push(`/plans?search=${region.name}`)}
            >
              <div className="w-20 h-20 rounded-full bg-[var(--gray-bg)] flex items-center justify-center text-4xl mb-6 group-hover:bg-[var(--gold-pale)] transition-all group-hover:scale-110 shadow-inner">
                {region.icon}
              </div>
              <div className="flex-grow flex flex-col items-center justify-center">
                <h3 className="text-[16px] font-bold text-[var(--text-dark)] mb-2 font-['Sora']">{region.name}</h3>
                <div className="space-y-1">
                  <p className="text-[12px] text-[var(--gray-text)] font-medium">
                    {region.countries}
                  </p>
                  <p className="text-[11px] text-[var(--gold)] font-bold uppercase tracking-wider">
                    {region.plans}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
