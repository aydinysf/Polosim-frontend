"use client";

import { useState, useEffect } from "react";
import { Search, ChevronDown, ChevronRight, Loader2, Clock, ShoppingCart, Check, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import { countryService, type Country, regionService, type Region, productService, type Product, bannerService, type Banner } from "@/lib/services";
import { getLocalizedText, getProductPrice } from "@/lib/product-helpers";
import { getImageUrl, getFlagFromISO } from "@/lib/api-client";
import { useCart } from "@/lib/cart-context";
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

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
    sm: "w-5 h-4",
    md: "w-8 h-6",
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

// Popular destination flags for display - matching the design
const popularDestinationFlags = [
  { name: "Türkiye", flag: "TR", color: "#E30A17" },
  { name: "İspanya", flag: "ES", color: "#AA151B" },
  { name: "İngiltere", flag: "GB", color: "#012169" },
  { name: "Fransa", flag: "FR", color: "#002654" },
  { name: "Portekiz", flag: "PT", color: "#006600" },
  { name: "Brezilya", flag: "BR", color: "#009739" },
  { name: "Kanada", flag: "CA", color: "#FF0000" },
];

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
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carousel ref
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);

  // Search results state
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [addedToCart, setAddedToCart] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const [countriesData, regionsData, bannersData, popularCountriesData] = await Promise.all([
          countryService.getAll(),
          regionService.getAll(),
          bannerService.getBanners(undefined, locale).catch(() => []),
          countryService.getPopular().catch(() => [])
        ]);
        setCountries(countriesData);
        setRegions(regionsData);
        setBanners(bannersData);
        setPopularCountries(popularCountriesData.length > 0 ? popularCountriesData : countriesData.filter(c => c.is_popular).slice(0, 12));
      } catch (error) {
        console.error("Failed to fetch hero data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [locale]);

  const handleSearch = async (query?: string) => {
    const searchVal = query || searchQuery;
    if (!searchVal.trim()) return;

    setSearchQuery(searchVal);
    setIsLoadingResults(true);
    setShowSearchResults(true);
    setShowSuggestions(false);

    try {
      const results = await productService.fetchAll({ data_amount: searchVal });
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
    const name = getLocalizedText(product.name, "", locale) || getLocalizedText(product.country?.name, "", locale) || "";
    const data = product.data_amount || product.data_limit || product.data || "";
    const rawValidity = product.validity?.toString() || "";
    const validity = rawValidity.includes("Day") ? rawValidity : `${rawValidity} Days`;
    const speed = product.speed || "4G/LTE";

    addItem({
      id: product.id,
      name,
      description: getLocalizedText(product.description, "", locale) || `${data} Data Plan`,
      priceInCents: Math.round(getProductPrice(product) * 100),
      flag: product.flag_url || product.country?.flag_url || "",
      data,
      validity,
      speed,
      region: getLocalizedText(product.region_name, "", locale),
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
                        <span className="text-xl font-extrabold text-[var(--text-dark)]">€{getProductPrice(product)}</span>
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
    <section className="relative pt-48 pb-8 flex flex-col items-center justify-start overflow-hidden bg-[var(--navy)]">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[100px] -left-[100px] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(201,168,76,0.08)_0%,transparent_70%)]" />
        <div className="absolute -bottom-[80px] -right-[60px] w-[350px] h-[350px] bg-[radial-gradient(circle,rgba(201,168,76,0.05)_0%,transparent_70%)]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-[5%]">
        {/* Hero Title */}
        <div className="text-center mb-8">
          <h1 className="text-[28px] sm:text-[36px] md:text-[42px] font-extrabold text-white leading-[1.3] max-w-[900px] mx-auto tracking-tight">
            200&apos;den fazla ülke için anında <span className="text-[var(--gold)]">eSIM</span> teslimatı.
            <br />
            <span className="text-[var(--gold)]">Roaming</span> ücreti yok. Numaranızı koruyun.
          </h1>
        </div>

        {/* Search bar */}
        <div className="relative max-w-[580px] mx-auto mb-6">
          <div className="relative flex items-center bg-white rounded-full pl-5 pr-2 py-1.5 gap-2 shadow-xl">
            <Search className="w-5 h-5 text-[#9CA3AF] shrink-0" />
            <Input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="border-0 bg-transparent focus-visible:ring-0 text-[var(--text-dark)] placeholder:text-[#9CA3AF] text-base flex-1 h-11"
            />
            <button
              className="bg-[var(--gold)] text-white border-none rounded-full px-6 h-10 font-semibold text-[14px] cursor-pointer whitespace-nowrap hover:bg-[var(--gold-light)] transition-all"
              onClick={() => handleSearch()}
            >
              Hemen Ara
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

        {/* View All Destinations Button */}
        <div className="text-center mb-10">
          <button
            className="inline-flex items-center gap-2 bg-[var(--navy-mid)] border border-white/20 text-white rounded-full px-6 py-2.5 font-medium text-[13px] cursor-pointer hover:bg-[var(--navy-light)] hover:border-white/30 transition-all"
            onClick={() => router.push("/plans")}
          >
            200&apos;den Fazla Destinasyona göz atın
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Popular Destinations Section */}
        <div className="max-w-5xl mx-auto mb-6">
          <div className="flex items-center justify-between mb-4 px-1">
            <span className="text-[18px] font-semibold text-white">Popüler Destinasyonlar</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {popularDestinationFlags.map((dest) => (
              <button
                key={dest.name}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-white text-[13px] font-medium hover:bg-white/20 hover:border-white/30 transition-all cursor-pointer"
                onClick={() => router.push(`/plans?search=${encodeURIComponent(dest.name)}`)}
              >
                <img 
                  src={getFlagFromISO(dest.flag)} 
                  alt={dest.name} 
                  className="w-5 h-4 rounded-sm object-cover"
                />
                {dest.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
