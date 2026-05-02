"use client";

import { useState, useEffect, useRef } from "react";
import { Search, ChevronLeft, ChevronRight, Loader2, Clock, Signal, Wifi, ShoppingCart, Check, Star, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import { countryService, type Country } from "@/lib/services/countryService";
import { regionService, type Region } from "@/lib/services/regionService";
import { productService, type Product } from "@/lib/services/productService";
import { getLocalizedText } from "@/lib/product-helpers";
import { getImageUrl, getFlagFromISO } from "@/lib/api-client";
import { useCart } from "@/lib/cart-context";

interface SearchResult {
  type: "country" | "region";
  name: string;
  flag?: string;
  region?: string;
  id: number;
}

const FlagDisplay = ({ flag, name, size = "md" }: { flag?: string; name: string; size?: "sm" | "md" | "lg" }) => {
  if (!flag) return <span className={size === "sm" ? "text-xs" : size === "md" ? "text-lg" : "text-3xl"}>🌍</span>;
  
  const isPath = flag.includes("/") || flag.includes(".");
  const url = isPath ? getImageUrl(flag) : getFlagFromISO(flag);
  
  if (!url) return <span className={size === "sm" ? "text-xs" : size === "md" ? "text-lg" : "text-3xl"}>🌍</span>;
  
  const sizeClasses = {
    sm: "w-4 h-3",
    md: "w-6 h-4",
    lg: "w-10 h-7"
  };
  
  return (
    <img 
      src={url} 
      alt={name} 
      className={`${sizeClasses[size]} rounded-sm object-cover shadow-sm`}
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = "none";
        (e.target as HTMLImageElement).parentElement!.innerHTML = "🌍";
      }}
    />
  );
};

export function HeroSection() {
  const t = useTranslations('Hero');
  const tc = useTranslations('Common');
  const tp = useTranslations('Plans');
  const locale = useLocale();
  const router = useRouter();
  const { addItem } = useCart();

  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [popularCountries, setPopularCountries] = useState<Country[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search results state
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [addedToCart, setAddedToCart] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const [countriesData, regionsData] = await Promise.all([
          countryService.getAll(),
          regionService.getAll()
        ]);
        setCountries(countriesData);
        setRegions(regionsData);
        setPopularCountries(countriesData.filter(c => c.is_popular).slice(0, 12));
      } catch (error) {
        console.error("Failed to fetch hero data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSearch = async (query?: string) => {
    const searchVal = query || searchQuery;
    if (!searchVal.trim()) return;

    setSearchQuery(searchVal);
    setIsLoadingResults(true);
    setShowSearchResults(true);
    setShowSuggestions(false);

    try {
      const results = await productService.fetchAll({ data_amount: searchVal });
      // If direct match failed or no results, try general search
      if (results.length === 0) {
        // Here we could add more complex search logic if needed
      }
      setSearchResults(results);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoadingResults(false);
    }
  };

  const handleSelectSuggestion = (item: SearchResult) => {
    setSearchQuery(item.name);
    setShowSuggestions(false);
    if (item.type === "country") {
      router.push(`/plans?search=${encodeURIComponent(item.name)}`);
    } else {
      router.push(`/plans?region=${item.region || item.id}&view=plans`);
    }
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: getLocalizedText(product.name, "", locale),
      price: product.price,
      quantity: 1,
      image_url: product.country?.image_url || product.image_url || product.flag_url,
      country_name: getLocalizedText(product.country?.name || "", "", locale),
      data_amount: product.data_amount || product.data_limit || product.data || "",
      validity: product.validity?.toString() || ""
    });
    setAddedToCart(product.id);
    setTimeout(() => setAddedToCart(null), 2000);
  };

  const filteredSuggestions = searchQuery.length > 0 
    ? [
        ...countries.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map(c => ({
          type: "country" as const,
          name: c.name,
          flag: c.flag_url || c.iso_code,
          id: c.id
        })),
        ...regions.filter(r => getLocalizedText(r.name).toLowerCase().includes(searchQuery.toLowerCase())).map(r => ({
          type: "region" as const,
          name: getLocalizedText(r.name),
          flag: (r as any).icon || "🌍",
          region: r.slug,
          id: r.id
        }))
      ]
    : [];

  if (showSearchResults) {
    return (
      <section className="relative min-h-[600px] pt-14 pb-20 bg-[var(--navy)]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[100px] -left-[100px] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(201,168,76,0.12)_0%,transparent:70%)]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-[5%]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <button 
                onClick={() => setShowSearchResults(false)}
                className="flex items-center gap-2 text-[var(--gold)] font-bold mb-4 hover:opacity-70 transition-all bg-transparent border-none p-0 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                {tc('back')}
              </button>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">
                {t('searchResultsTitle', { query: searchQuery })}
              </h2>
            </div>
            
            <div className="w-full max-w-[400px]">
              <div className="relative flex items-center bg-white rounded-2xl pl-4 pr-1 py-1 shadow-lg">
                <Search className="w-4 h-4 text-[#9CA3AF]" />
                <Input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="border-0 bg-transparent focus-visible:ring-0 text-[var(--text-dark)] h-10"
                />
                <Button 
                  onClick={() => handleSearch()}
                  className="bg-[var(--gold)] hover:bg-[var(--gold-light)] rounded-xl px-5"
                >
                  {t('searchButton')}
                </Button>
              </div>
            </div>
          </div>

          {isLoadingResults ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-[var(--gold)]" />
              <p className="text-white/60 font-medium">{t('loadingPlans')}</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {searchResults.map((product) => {
                const name = getLocalizedText(product.name, "", locale);
                const data = product.data_amount || product.data_limit || product.data || "";
                const validity = product.validity?.toString().includes("Day") ? product.validity : `${product.validity} Days`;
                
                return (
                  <div key={product.id} className="bg-white rounded-2xl overflow-hidden border border-[var(--gray-mid)] hover:border-[var(--gold)] transition-all hover:translate-y-[-2px] hover:shadow-lg flex flex-col h-full group">
                    <div className="p-5 flex flex-col h-full">
                      <div className="flex items-center gap-3 mb-4">
                        {(() => {
                          const raw = product.country?.image_url || product.image_url || product.flag_url;
                          const isPath = raw && (raw.includes('.') || raw.includes('/'));
                          const url = isPath ? getImageUrl(raw) : getFlagFromISO(product.country?.iso_code);
                          return url ? (
                            <img src={url} alt={name} className="w-10 h-10 rounded-lg object-cover shadow-sm" />
                          ) : <span className="text-3xl">🌍</span>;
                        })()}
                        <div>
                          <h3 className="font-bold text-[var(--text-dark)] leading-tight">{name}</h3>
                          <p className="text-xl font-extrabold text-[var(--gold)]">{data}</p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-6 flex-grow">
                        <div className="flex items-center gap-2 text-sm text-[var(--gray-text)] font-medium">
                          <Clock className="w-4 h-4 text-[var(--gold)]" />
                          <span>{validity}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-[var(--gray-mid)]">
                        <span className="text-xl font-extrabold text-[var(--text-dark)]">€{product.price}</span>
                        <Button
                          size="sm"
                          className={`rounded-xl px-4 h-9 font-bold transition-all ${addedToCart === product.id ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-[var(--gold)] hover:bg-[var(--gold-light)] text-white"}`}
                          onClick={() => handleAddToCart(product)}
                        >
                          {addedToCart === product.id ? (
                            <><Check className="w-4 h-4 mr-1.5" />{tp('cta.added')}</>
                          ) : (
                            <><ShoppingCart className="w-4 h-4 mr-1.5" />{tp('cta.buy')}</>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
              <p className="text-white/60 text-lg">{t('noResultsFound')}</p>
              <Button 
                variant="link" 
                onClick={() => router.push("/plans")}
                className="text-[var(--gold)] font-bold mt-2"
              >
                {t('viewAllPlans')}
              </Button>
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="relative pt-20 pb-16 flex flex-col items-center justify-start overflow-hidden bg-[var(--navy)]">
      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[100px] -left-[100px] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(201,168,76,0.12)_0%,transparent:70%)]" />
        <div className="absolute -bottom-[80px] -right-[60px] w-[350px] h-[350px] bg-[radial-gradient(circle,rgba(201,168,76,0.08)_0%,transparent:70%)]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-[5%]">
        <div className="text-center mb-10">
          <h1 className="text-[clamp(32px,5vw,56px)] font-extrabold text-white leading-[1.1] max-w-[850px] mx-auto mb-8 tracking-tight">
            {t.rich('mainHeading', {
              gold: (chunks) => <span className="text-[var(--gold)]">{chunks}</span>
            })}
          </h1>
        </div>

        {/* Search bar */}
        <div className="relative max-w-[560px] mx-auto mb-6">
          <div className="relative flex items-center bg-white rounded-3xl pl-5 pr-1.5 py-1.5 gap-2 shadow-lg">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" className="text-[#9CA3AF] shrink-0"><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/><path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            <Input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="border-0 bg-transparent focus-visible:ring-0 text-[var(--text-dark)] placeholder:text-[#9CA3AF] text-[15px] flex-1 h-10"
            />
            <button
              className="bg-[var(--gold)] text-white border-none rounded-2xl px-7 h-10 font-['Sora'] font-bold text-sm cursor-pointer whitespace-nowrap hover:bg-[var(--gold-light)] transition-all hover:scale-[1.02]"
              onClick={() => handleSearch()}
            >
              {t('searchButton')}
            </button>
          </div>

          {/* Search Suggestions Dropdown */}
          {showSuggestions && searchQuery && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[var(--gray-mid)] rounded-2xl overflow-hidden z-50 max-h-80 overflow-y-auto shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
              {filteredSuggestions.slice(0, 8).map((item, index) => (
                <button
                  key={`${item.name}-${index}`}
                  className="w-full px-5 py-3.5 text-left hover:bg-[var(--gray-bg)] flex items-center gap-3 transition-colors text-[var(--text-dark)] border-b border-[var(--gray-mid)] last:border-0"
                  onMouseDown={() => handleSelectSuggestion(item)}
                >
                  <FlagDisplay flag={item.flag} name={item.name} size="md" />
                  <div>
                    <span className="block font-bold text-sm">{item.name}</span>
                    <span className="text-[11px] text-[var(--gray-text)] font-semibold uppercase tracking-wider">{item.type}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View All Button */}
        <div className="text-center mb-12">
          <button
            className="inline-flex items-center gap-2 bg-transparent border-[1.5px] border-white/30 text-white rounded-full px-7 py-2.5 font-['Sora'] font-semibold text-[13px] cursor-pointer hover:border-[var(--gold)] hover:text-[var(--gold)] transition-all"
            onClick={() => router.push("/plans")}
          >
            {t('viewAllDestinations')} ›
          </button>
        </div>

        {/* Popular Destinations Chips */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="flex items-center justify-between mb-4 px-2">
            <span className="text-[12px] font-bold text-white/40 uppercase tracking-[1.5px]">{t('popularDestinations')}</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2.5">
            {popularCountries.map((country) => {
              const countryName = getLocalizedText(country.name);
              return (
                <button
                  key={country.id}
                  className="flex-shrink-0 inline-flex items-center gap-2.5 bg-white/[0.07] border border-white/[0.12] rounded-full px-4 py-2 cursor-pointer hover:bg-[rgba(201,168,76,0.15)] hover:border-[var(--gold)] transition-all group no-underline"
                  onClick={() => router.push(`/plans?search=${encodeURIComponent(countryName)}`)}
                >
                  <FlagDisplay flag={country.flag_url || country.iso_code} name={countryName} size="md" />
                  <span className="text-sm font-semibold text-white/90 group-hover:text-white">{countryName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          <div className="flex items-center gap-2.5 text-[13px] font-semibold text-white/60">
            <div className="w-2 h-2 bg-[var(--gold)] rounded-full shadow-[0_0_8px_var(--gold)]" />
            <span>{tc('instantActivation')}</span>
          </div>
          <div className="flex items-center gap-2.5 text-[13px] font-semibold text-white/60">
            <div className="w-2 h-2 bg-[var(--gold)] rounded-full shadow-[0_0_8px_var(--gold)]" />
            <span>{tc('support247')}</span>
          </div>
          <div className="flex items-center gap-2.5 text-[13px] font-semibold text-white/60">
            <div className="w-2 h-2 bg-[var(--gold)] rounded-full shadow-[0_0_8px_var(--gold)]" />
            <span>{tc('deviceCompatibility')}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
