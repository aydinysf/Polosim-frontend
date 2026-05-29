"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Globe, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useRouter } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { regionService, type Region } from "@/lib/services/regionService";
import { countryService, type Country } from "@/lib/services/countryService";
import { getLocalizedText } from "@/lib/product-helpers";
import { getImageUrl, getFlagFromISO } from "@/lib/api-client";

interface SearchHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: React.ReactNode;
}

export function SearchHeader({ title, subtitle, badge, icon }: SearchHeaderProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Hero");

  const [searchQuery, setSearchQuery] = useState("");
  const [openCombobox, setOpenCombobox] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadSearchData() {
      try {
        const [regionsData, countriesData] = await Promise.all([
          regionService.getAll(),
          countryService.getAll(),
        ]);
        setRegions(regionsData);
        setCountries(countriesData);
      } catch (error) {
        console.error("Error loading search data for header:", error);
      }
    }
    loadSearchData();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenCombobox(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredSuggestions = searchQuery
    ? [
        ...countries
          .filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((c) => ({ type: "country" as const, ...c })),
        ...regions
          .filter((r) =>
            getLocalizedText(r.name, "", locale)
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          )
          .map((r) => ({ type: "region" as const, ...r })),
      ].slice(0, 8)
    : [];

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/plans?search=${encodeURIComponent(searchQuery.trim())}`);
      setOpenCombobox(false);
    }
  };

  return (
    <section className="bg-[var(--navy)] pt-48 pb-16 px-[5%] relative overflow-hidden text-center">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />
      
      <div className="relative max-w-7xl mx-auto text-center z-20">
        {badge && (
          <div className="inline-block bg-[rgba(201,168,76,0.15)] text-[var(--gold)] border border-[rgba(201,168,76,0.3)] rounded-full px-4 py-1.5 text-[12px] font-bold tracking-[0.5px] uppercase mb-5">
            {badge}
          </div>
        )}
        
        <div className="flex items-center justify-center gap-5 mb-4">
          {icon && (
            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)] relative group overflow-hidden shrink-0">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              {icon}
            </div>
          )}
          <h1 className="text-[42px] font-extrabold text-white tracking-tight drop-shadow-sm">
            {title}
          </h1>
        </div>
        
        {subtitle && (
          <p className="text-[15px] text-white/60 max-w-[520px] mx-auto mb-8 leading-[1.6]">
            {subtitle}
          </p>
        )}

        {/* Search Bar Container */}
        <div ref={dropdownRef} className="max-w-[560px] mx-auto relative z-50">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center bg-white rounded-3xl pl-5 pr-1.5 py-1.5 gap-2 shadow-lg">
            <div className="flex items-center gap-3 flex-1">
              <Search className="w-4 h-4 text-[#9CA3AF] shrink-0" />
              <Input
                type="text"
                placeholder={t("searchPlaceholder") || "Where are you going?"}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setOpenCombobox(true);
                }}
                onFocus={() => setOpenCombobox(true)}
                className="border-0 bg-transparent focus-visible:ring-0 text-[var(--text-dark)] placeholder:text-[#9CA3AF] text-[15px] flex-1 h-9"
              />
            </div>
            <button
              type="submit"
              className="bg-[var(--gold)] text-white border-none rounded-2xl px-6 py-2 font-['Sora'] font-bold text-sm cursor-pointer whitespace-nowrap hover:bg-[var(--gold-light)] transition-colors h-9 flex items-center justify-center"
            >
              {t("searchButton") || "Search"}
            </button>
          </form>

          {/* Autocomplete Dropdown */}
          {openCombobox && searchQuery && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[var(--gray-mid)] rounded-2xl shadow-xl overflow-hidden max-h-80 overflow-y-auto z-[9999] text-left">
              {filteredSuggestions.map((item) => (
                <button
                  key={`${item.type}-${item.id}`}
                  type="button"
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--gray-bg)] text-left transition-colors border-b border-[var(--gray-mid)] last:border-0"
                  onClick={() => {
                    const name =
                      item.type === "country"
                        ? (item as Country).name
                        : getLocalizedText((item as Region).name, "", locale);
                    setSearchQuery(name);
                    setOpenCombobox(false);
                    router.push(`/plans?search=${encodeURIComponent(name)}`);
                  }}
                >
                  <span className="text-xl shrink-0">
                    {item.type === "country"
                      ? (() => {
                          const country = item as Country;
                          const rawFlag = country.flag_url;
                          const isPath = rawFlag && (rawFlag.includes(".") || rawFlag.includes("/"));
                          const url = isPath
                            ? getImageUrl(rawFlag)
                            : getFlagFromISO(country.iso_code);
                          return url ? (
                            <img src={url} alt="" className="w-6 h-4 object-cover flag-wave" />
                          ) : (
                            "🏳️"
                          );
                        })()
                      : (() => {
                          const icon = (item as Region).icon;
                          const isPath = icon && (icon.includes("/") || icon.includes("."));
                          const url = isPath ? getImageUrl(icon) : null;
                          return url ? (
                            <div className="relative w-6 h-6 rounded-sm overflow-hidden">
                              <Image src={url} alt="" fill className="object-cover" sizes="24px" />
                            </div>
                          ) : (
                            icon || "🌍"
                          );
                        })()}
                  </span>
                  <div className="flex-1">
                    <div className="font-semibold text-[var(--navy)] text-sm">
                      {item.type === "country"
                        ? (item as Country).name
                        : getLocalizedText((item as Region).name, "", locale)}
                    </div>
                    <div className="text-xs text-[var(--gray-text)] capitalize">{item.type}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
