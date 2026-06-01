"use client";

import { useState, useEffect, useRef } from "react";
import { Signal, Clock, Star, ArrowUpDown, ChevronDown, Filter, Globe, Wifi, Check, MapPin, Loader2, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { productService, type Product, type PaginationMeta } from "@/lib/services/productService";
import { regionService, type Region } from "@/lib/services/regionService";
import { countryService, type Country } from "@/lib/services/countryService";
import { getLocalizedText, getProductData, getProductValidity, getProductSpeed, isBestSeller, getProductName } from "@/lib/product-helpers";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getImageUrl, getFlagFromISO } from "@/lib/api-client";
import { useLocale, useTranslations } from "next-intl";

type ViewMode = "plans" | "regions";
type SortOption = "popular" | "price-low" | "price-high" | "data-high" | "data-low" | "name-az" | "name-za" | "validity-low" | "validity-high";

export default function PlansPage() {
  const t = useTranslations('Plans');
  const locale = useLocale();

  const sortOptions: { key: SortOption; label: string }[] = [
    { key: "popular", label: t('sort.popular') },
    { key: "price-low", label: t('sort.priceLow') },
    { key: "price-high", label: t('sort.priceHigh') },
    { key: "data-high", label: t('sort.dataHigh') },
    { key: "data-low", label: t('sort.dataLow') },
    { key: "validity-high", label: t('sort.validityHigh') },
    { key: "validity-low", label: t('sort.validityLow') },
    { key: "name-az", label: t('sort.nameAz') },
    { key: "name-za", label: t('sort.nameZa') },
  ];

  const dataFilterOptions = [
    { label: "1GB", value: "1GB" },
    { label: "3GB", value: "3GB" },
    { label: "5GB", value: "5GB" },
    { label: "10GB", value: "10GB" },
    { label: "20GB", value: "20GB" },
    { label: t('filters.unlimited'), value: "Unlimited" },
  ];

  const validityFilterOptions = [
    { label: t('validity.days', { count: 1 }), value: 1 },
    { label: t('validity.days', { count: 2 }), value: 2 },
    { label: t('validity.days', { count: 3 }), value: 3 },
    { label: t('validity.days', { count: 4 }), value: 4 },
    { label: t('validity.days', { count: 5 }), value: 5 },
    { label: t('validity.days', { count: 6 }), value: 6 },
    { label: t('validity.days', { count: 7 }), value: 7 },
    { label: t('validity.days', { count: 15 }), value: 15 },
    { label: t('validity.days', { count: 30 }), value: 30 },
  ];

  function parseDataAmount(dataStr: string): number {
    if (!dataStr) return 0;
    const lower = dataStr.toLowerCase().replace(/\s/g, "");
    if (lower.includes("unlimited")) return 999999999;
    const num = parseFloat(lower);
    if (isNaN(num)) return 0;
    if (lower.includes("gb")) return num * 1024;
    if (lower.includes("mb")) return num;
    return num;
  }

  function parseValidity(validityStr: string): number {
    if (!validityStr) return 0;
    const num = parseInt(validityStr);
    return isNaN(num) ? 0 : num;
  }

  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialView = (searchParams.get("view") || "plans") as ViewMode;
  const initialRegion = searchParams.get("region") || "";

  const [viewMode, setViewMode] = useState<ViewMode>(initialView);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState<SortOption>("data-low");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [showBestSellers, setShowBestSellers] = useState(false);

  // Advanced Filters
  const [filterData, setFilterData] = useState<string | null>(null);
  const [filterValidity, setFilterValidity] = useState<number | null>(null);
  const [filterPriceRange, setFilterPriceRange] = useState<[number, number]>([0, 100]);
  const [showFilters, setShowFilters] = useState(false);

  // API data
  const [products, setProducts] = useState<Product[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(initialSearch);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [openCombobox, setOpenCombobox] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);

  const { items, addItem, removeItem } = useCart();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Resolve search to country/region
  useEffect(() => {
    async function resolveSearch() {
      if (!debouncedSearchQuery) {
        if (!initialRegion) setSelectedRegionId(null);
        setSelectedCountryId(null);
        return;
      }

      // Try to match country
      try {
        const countries = await countryService.getAll();
        const matchedCountry = countries.find(c =>
          c.name.toLowerCase() === debouncedSearchQuery.toLowerCase() ||
          c.slug === debouncedSearchQuery.toLowerCase()
        );

        if (matchedCountry) {
          setSelectedCountryId(matchedCountry.id);
          setSelectedRegionId(null);
          setViewMode("plans");
          return;
        }
      } catch (e) { console.error(e); }

      // Try to match region
      try {
        const regionsList = regions.length > 0 ? regions : await regionService.getAll();
        const matchedRegion = regionsList.find(r =>
          getLocalizedText(r.name, "", locale).toLowerCase() === debouncedSearchQuery.toLowerCase() ||
          r.slug === debouncedSearchQuery.toLowerCase()
        );

        if (matchedRegion) {
          setSelectedRegionId(matchedRegion.id);
          setSelectedCountryId(null);
          setViewMode("plans");
          return;
        }
      } catch (e) { console.error(e); }

      // No match found
      setSelectedCountryId(null);
    }

    resolveSearch();
  }, [debouncedSearchQuery, initialRegion]);

  // Fetch regions and countries on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [regionsData, countriesData] = await Promise.all([
          regionService.getAll(),
          countryService.getAll()
        ]);
        setRegions(regionsData);
        setCountries(countriesData);

        // If no region is selected and no initial region, select the first one by default
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, []);

  // Filter countries and regions for autocomplete
  const filteredSuggestions = searchQuery ? [
    ...countries.filter(c => c.name.toLowerCase().startsWith(searchQuery.toLowerCase())).map(c => ({ type: 'country' as const, ...c })),
    ...regions.filter(r => getLocalizedText(r.name, "", locale).toLowerCase().startsWith(searchQuery.toLowerCase())).map(r => ({ type: 'region' as const, ...r }))
  ].slice(0, 10) : [];

  // Fetch products on mount and when filters change
  useEffect(() => {
    async function fetchProducts() {
      try {
        setIsLoadingProducts(true);

        let data: Product[] = [];

        const filters = {};

        if (selectedRegionId) {
          data = await productService.fetchAll({ ...filters, region_id: selectedRegionId });
        } else if (selectedCountryId) {
          data = await productService.fetchAll({ ...filters, country_id: selectedCountryId });
        } else {
          data = await productService.fetchAll(filters);
        }

        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setIsLoadingProducts(false);
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, [selectedRegionId, selectedCountryId]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRegionId, selectedCountryId, searchQuery, showBestSellers, filterData, filterValidity, filterPriceRange, sortBy]);

  // Handle initial region from URL or default to first region
  const initializedRef = useRef(false);

  useEffect(() => {
    if (regions.length > 0) {
      if (initialRegion) {
        const matched = regions.find(r =>
          r.slug === initialRegion || getLocalizedText(r.name, "").toLowerCase() === initialRegion.toLowerCase()
        );
        if (matched) {
          setSelectedRegionId(matched.id);
        }
      } else if (!initializedRef.current) {
        initializedRef.current = true;
      }
    }
  }, [initialRegion, regions]);

  const handleToggleCart = (product: Product) => {
    const isItemInCart = items.some(item => item.id === product.id);
    if (isItemInCart) {
      removeItem(product.id);
    } else {
      const name = getProductName(product);
      const data = getProductData(product);
      const validity = getProductValidity(product);
      const speed = getProductSpeed(product);

      const cartItem = {
        id: product.id,
        name,
        description: getLocalizedText(product.description, "", locale) || `${data} ${t('labels.dataPlan')}`,
        priceInCents: Math.round((product.price || 0) * 100),
        flag: product.flag_url || product.country?.flag_url || "",
        data,
        validity,
        speed: speed || "4G/LTE",
        region: getLocalizedText(product.region_name, "", locale),
      };
      addItem(cartItem);
    }
  };

  // Filter products (Search only, as sorting and other filters are server-side)
  // UPDATED: Added client-side filtering for Data, Validity, and Price because API seems to ignore them
  const filteredProducts = products
    .filter((product) => {
      const name = getProductName(product).toLowerCase();
      const countryName = getLocalizedText(product.country?.name).toLowerCase();
      const matchesSearch = !searchQuery ||
        name.includes(searchQuery.toLowerCase()) ||
        countryName.startsWith(searchQuery.toLowerCase());

      // Best seller filter
      const matchesBestSeller = !showBestSellers || isBestSeller(product);

      // Data Amount Filter
      let matchesData = true;
      if (filterData) {
        const pData = getProductData(product).replace(/\s/g, "").toLowerCase();
        const fData = filterData.replace(/\s/g, "").toLowerCase();
        matchesData = pData === fData;
      }

      // Validity Filter
      let matchesValidity = true;
      if (filterValidity) {
        const pValidityStr = getProductValidity(product);
        const pValidity = parseInt(pValidityStr);
        if (!isNaN(pValidity)) {
          matchesValidity = pValidity === filterValidity;
        }
      }

      // Price Filter
      let matchesPrice = true;
      if (filterPriceRange[0] > 0 || filterPriceRange[1] < 100) {
        const price = product.price || 0;
        matchesPrice = price >= filterPriceRange[0] && price <= filterPriceRange[1];
      }

      return matchesSearch && matchesBestSeller && matchesData && matchesValidity && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low": return (a.price || 0) - (b.price || 0);
        case "price-high": return (b.price || 0) - (a.price || 0);
        case "data-high": return parseDataAmount(getProductData(b)) - parseDataAmount(getProductData(a));
        case "data-low": return parseDataAmount(getProductData(a)) - parseDataAmount(getProductData(b));
        case "validity-high": return parseValidity(getProductValidity(b)) - parseValidity(getProductValidity(a));
        case "validity-low": return parseValidity(getProductValidity(a)) - parseValidity(getProductValidity(b));
        case "name-az": return getProductName(a, locale).localeCompare(getProductName(b, locale));
        case "name-za": return getProductName(b, locale).localeCompare(getProductName(a, locale));
        case "popular":
        default: return (b.is_best_seller ? 1 : 0) - (a.is_best_seller ? 1 : 0);
      }
    });

  // All products shown without pagination
  const paginatedProducts = filteredProducts;

  // Filter regions
  const filteredRegions = regions
    .filter(r => {
      if (!searchQuery) return true;
      return getLocalizedText(r.name, "", locale).toLowerCase().startsWith(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low": return (a.starting_price || 0) - (b.starting_price || 0);
        case "price-high": return (b.starting_price || 0) - (a.starting_price || 0);
        case "name-az": return getLocalizedText(a.name, "", locale).localeCompare(getLocalizedText(b.name, "", locale));
        default: return (b.countries_count || 0) - (a.countries_count || 0);
      }
    });

  const gradients = [
    "from-blue-600/20 via-cyan-500/10 to-teal-400/5",
    "from-rose-500/20 via-orange-400/10 to-amber-300/5",
    "from-emerald-600/20 via-green-500/10 to-lime-400/5",
    "from-amber-500/20 via-yellow-400/10 to-orange-300/5",
  ];
  const borderColors = [
    "hover:border-cyan-400/60",
    "hover:border-rose-400/60",
    "hover:border-emerald-400/60",
    "hover:border-amber-400/60",
  ];

  const selectedCountry = countries.find(c => c.id === selectedCountryId);
  const selectedRegion = regions.find(r => r.id === selectedRegionId);

  let displayTitle = "";
  if (selectedCountry) {
    displayTitle = t('labels.packages', { country: selectedCountry.name });
  } else if (selectedRegion) {
    displayTitle = t('labels.packages', { country: getLocalizedText(selectedRegion.name, "", locale) });
  } else if (searchQuery) {
    displayTitle = t('labels.packages', { country: searchQuery });
  } else {
    displayTitle = viewMode === "regions" ? t('tabs.regions') : t('labels.esimPlans');
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-[var(--navy)] pt-48 pb-12 px-[5%] relative text-center">


        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-block bg-[rgba(201,168,76,0.15)] text-[var(--gold)] border border-[rgba(201,168,76,0.3)] rounded-full px-4 py-1.5 text-[12px] font-bold tracking-[0.5px] uppercase mb-5">
            {t('hero.destinationsAvailable')}
          </div>
          <h1 className="text-[32px] font-extrabold text-white mb-3 tracking-tight">
            {viewMode === "regions" ? t('hero.browseRegions') : t('hero.browsePlans')}
          </h1>
          <p className="text-[15px] text-white/60 max-w-[520px] mx-auto mb-8 leading-[1.6]">
            {viewMode === "regions"
              ? t('hero.regionsDescription')
              : t('hero.plansDescription')}
          </p>

          {/* Search Bar */}
          <div className="max-w-[560px] mx-auto relative z-50">
            <div className="relative flex items-center bg-white rounded-3xl pl-5 pr-1.5 py-1.5 gap-2">
              <div className="flex items-center gap-3 flex-1">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[#9CA3AF] shrink-0"><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" /><path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                <Input
                  type="text"
                  placeholder={viewMode === "regions" ? t('search.regionsPlaceholder') : t('search.plansPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setOpenCombobox(true);
                  }}
                  onFocus={() => setOpenCombobox(true)}
                  className="border-0 bg-transparent focus-visible:ring-0 text-[var(--text-dark)] placeholder:text-[#9CA3AF] text-[15px] flex-1"
                />
              </div>
            </div>

            {/* Autocomplete Dropdown */}
            {openCombobox && searchQuery && filteredSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden max-h-80 overflow-y-auto z-[9999] text-left">
                {filteredSuggestions.map((item) => (
                  <button
                    key={`${item.type}-${item.id}`}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 text-left transition-colors"
                    onClick={() => {
                      setSearchQuery(item.type === 'country' ? (item as Country).name : getLocalizedText((item as Region).name));
                      setOpenCombobox(false);
                      setViewMode("plans");
                      if (item.type === 'country') {
                        setSelectedCountryId(item.id);
                        setSelectedRegionId(null);
                      } else {
                        setSelectedRegionId(item.id);
                        setSelectedCountryId(null);
                      }
                    }}
                  >
                    <span className="text-xl">
                      {item.type === 'country'
                        ? (() => {
                          const country = item as Country;
                          const rawFlag = country.flag_url;
                          const isPath = rawFlag && (rawFlag.includes('.') || rawFlag.includes('/'));
                          const url = isPath ? getImageUrl(rawFlag) : getFlagFromISO(country.iso_code);
                          return url ? <img src={url} alt="" className="w-6 h-4 object-cover flag-wave" /> : "🏳️";
                        })()
                        : (() => {
                          const icon = (item as Region).icon;
                          const isPath = icon && (icon.includes('/') || icon.includes('.'));
                          const url = isPath ? getImageUrl(icon) : null;
                          return url ? (
                            <div className="relative w-7 h-5 overflow-hidden">
                              <Image src={url} alt="" fill className="object-cover flag-wave" sizes="28px" />
                            </div>
                          ) : (icon || "🌍");
                        })()}
                    </span>
                    <div>
                      <div className="font-medium text-foreground">
                        {item.type === 'country' ? (item as Country).name : getLocalizedText((item as Region).name, "", locale)}
                      </div>
                      <div className="text-xs text-muted-foreground capitalize">{item.type}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Click outside to close */}
            {openCombobox && (
              <div
                className="fixed inset-0 z-[-1]"
                onClick={() => setOpenCombobox(false)}
              />
            )}
          </div>
        </div>
      </section>

      {/* Filters & Content */}
      <section className="pb-24 px-4 bg-[#F5F7FA]">
        <div className="max-w-7xl mx-auto pt-8">
          {/* Header & Sticky Filter Bar */}
          <div className="mb-12 sticky top-[160px] z-40 bg-[#F5F7FA]/95 backdrop-blur-md pt-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pt-6 border-b border-[var(--gray-mid)]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[var(--navy)]">
                {displayTitle}
              </h3>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${showFilters
                    ? 'bg-[var(--gold)] text-white'
                    : 'bg-white border border-[var(--gray-mid)] text-[var(--navy)] hover:border-[var(--gold)] hover:text-[var(--gold)] shadow-sm'
                  }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                {t('labels.advancedSearch')}
                {(filterData || filterValidity || filterPriceRange[0] > 0 || filterPriceRange[1] < 100) && (
                  <span className="ml-1 w-5 h-5 rounded-full bg-white text-[var(--gold)] text-[10px] font-bold flex items-center justify-center">
                    {(filterData ? 1 : 0) + (filterValidity ? 1 : 0) + ((filterPriceRange[0] > 0 || filterPriceRange[1] < 100) ? 1 : 0)}
                  </span>
                )}
              </button>
            </div>

            {/* Expandable Filters & Sorting Panel */}
            {showFilters && (
              <div className="mt-4 mb-2 p-4 sm:p-6 bg-white rounded-2xl shadow-sm border border-[var(--gray-mid)]">
                <div className="flex flex-col lg:flex-row gap-6 justify-between lg:items-center">
                  <div className="flex flex-col sm:flex-row gap-6 flex-1">
                    {/* Data Filter */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[var(--gray-text)] uppercase tracking-wider">{t('filters.dataAmount')}</label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => { setFilterData(null); setCurrentPage(1); }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!filterData ? 'bg-[var(--gold)] text-white shadow-sm' : 'bg-[#F5F7FA] text-[var(--navy)] hover:bg-[var(--gray-mid)] border border-[var(--gray-mid)]'
                            }`}
                        >
                          {t('filters.any')}
                        </button>
                        {dataFilterOptions.map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => { setFilterData(filterData === opt.value ? null : opt.value); setCurrentPage(1); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterData === opt.value ? 'bg-[var(--gold)] text-white shadow-sm' : 'bg-[#F5F7FA] text-[var(--navy)] hover:bg-[var(--gray-mid)] border border-[var(--gray-mid)]'
                              }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Validity Filter */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[var(--gray-text)] uppercase tracking-wider">{t('filters.duration')}</label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => { setFilterValidity(null); setCurrentPage(1); }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!filterValidity ? 'bg-[var(--gold)] text-white shadow-sm' : 'bg-[#F5F7FA] text-[var(--navy)] hover:bg-[var(--gray-mid)] border border-[var(--gray-mid)]'
                            }`}
                        >
                          {t('filters.any')}
                        </button>
                        {validityFilterOptions.map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => { setFilterValidity(filterValidity === opt.value ? null : opt.value); setCurrentPage(1); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterValidity === opt.value ? 'bg-[var(--gold)] text-white shadow-sm' : 'bg-[#F5F7FA] text-[var(--navy)] hover:bg-[var(--gray-mid)] border border-[var(--gray-mid)]'
                              }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price Filter */}
                    <div className="space-y-2 flex-1 max-w-xs">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-[var(--gray-text)] uppercase tracking-wider">{t('filters.priceRange')}</label>
                        <span className="text-xs font-bold text-[var(--gold)]">€{filterPriceRange[0]} - €{filterPriceRange[1]}</span>
                      </div>
                      <Slider
                        defaultValue={[0, 100]}
                        max={100}
                        step={1}
                        value={filterPriceRange}
                        onValueChange={(val) => { setFilterPriceRange(val as [number, number]); setCurrentPage(1); }}
                        className="py-2 [&_[role=slider]]:bg-[var(--gold)] [&_[role=slider]]:border-[var(--gold)] [&_.bg-primary]:bg-[var(--gold)]"
                      />
                    </div>
                  </div>

                  {/* Right: Sort Dropdown & Best Sellers */}
                  <div className="flex flex-wrap gap-3 items-center self-start lg:self-center">
                    {/* Best Sellers Toggle */}
                    <button
                      onClick={() => { setShowBestSellers(!showBestSellers); setCurrentPage(1); }}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${showBestSellers
                          ? "bg-[var(--gold)] text-white shadow-sm"
                          : "bg-white border border-[var(--gray-mid)] text-[var(--navy)] hover:border-[var(--gold)] hover:text-[var(--gold)] shadow-sm"
                        }`}
                    >
                      <Star className={`w-4 h-4 ${showBestSellers ? "fill-white" : ""}`} />
                      {t('filters.bestSellers')}
                    </button>

                    {/* Sort Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setSortMenuOpen(!sortMenuOpen)}
                        onBlur={() => setTimeout(() => setSortMenuOpen(false), 150)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-[var(--gray-mid)] text-[var(--navy)] hover:border-[var(--gold)] transition-all shadow-sm"
                      >
                        <ArrowUpDown className="w-4 h-4 text-[var(--gold)]" />
                        {sortOptions.find((opt) => opt.key === sortBy)?.label}
                        <ChevronDown className={`w-4 h-4 text-[var(--gray-text)] transition-transform ${sortMenuOpen ? "rotate-180" : ""}`} />
                      </button>
                      {sortMenuOpen && (
                        <div className="absolute top-full right-0 mt-2 bg-white border border-[var(--gray-mid)] rounded-xl shadow-lg overflow-hidden z-50 min-w-[220px]">
                          {sortOptions.filter(o => viewMode === "regions" ? o.key !== "data-high" : true).map((option) => (
                            <button
                              key={option.key}
                              onClick={() => { setSortBy(option.key); setSortMenuOpen(false); setCurrentPage(1); }}
                              className={`w-full px-4 py-3 text-left text-sm hover:bg-[var(--gray-bg)] transition-colors ${sortBy === option.key
                                  ? "text-[var(--gold)] font-semibold bg-[var(--gold)]/5"
                                  : "text-[var(--navy)]"
                                }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Count - Styled */}
          {viewMode === "plans" && (
            <p className="text-sm font-medium text-[var(--gray-text)] mb-6">
              {t('results.plansCount', { count: filteredProducts.length })}
            </p>
          )}

          {/* Loading State */}
          {(isLoading || isLoadingProducts) && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {/* Plans Grid */}
          {viewMode === "plans" && !isLoading && !isLoadingProducts && (
            <div className="flex flex-col gap-8">
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {paginatedProducts.map((product) => {
                    const name = getProductName(product, locale);
                    const data = getProductData(product);
                    const validity = getProductValidity(product, t);
                    const speed = getProductSpeed(product);

                    const raw = product.country?.image_url || product.image_url || product.flag_url || product.country?.flag_url;
                    const isPath = raw && (raw.includes('.') || raw.includes('/'));
                    const url = isPath ? getImageUrl(raw) : getFlagFromISO(product.country?.iso_code);

                    const isItemInCart = items.some(item => item.id === product.id);

                    return (
                      <div
                        key={product.id}
                        onClick={() => handleToggleCart(product)}
                        className={`bg-[#F0F2F5] rounded-2xl border px-6 py-4 flex items-center justify-between transition-all shadow-sm cursor-pointer ${isItemInCart
                            ? "border-[var(--gold)]"
                            : "border-[#E2E5EA] hover:border-[var(--gold)]"
                          }`}
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            {url ? (
                              <img src={url} alt={name} className="w-7 h-5 object-cover flag-wave" />
                            ) : (
                              <Globe className="w-5 h-5 text-[var(--gray-text)]" />
                            )}
                            <span className="text-xs font-semibold text-[var(--gray-text)] uppercase tracking-wider truncate max-w-[120px]" title={name}>{name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-extrabold text-[var(--navy)] flex items-baseline">
                              {data.replace(/GB/g, '').replace(/MB/g, '')}
                              <span className="text-sm font-extrabold text-[#A38334] ml-1">{data.includes('GB') ? 'GB' : data.includes('MB') ? 'MB' : ''}</span>
                            </span>
                            <span className="text-sm font-medium text-[var(--gray-text)]">{validity}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <span className="text-lg sm:text-xl font-extrabold text-[var(--navy)] tracking-tight">
                            €{product.price?.toFixed(2) || '0.00'}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleToggleCart(product); }}
                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${isItemInCart
                                ? "bg-[var(--gold)] border-[var(--gold)] text-white"
                                : "bg-white border-[var(--gray-mid)] text-transparent hover:border-[var(--gold)] hover:text-[var(--gold)]"
                              }`}
                          >
                            {isItemInCart ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <div className="w-4 h-4 rounded-full bg-transparent group-hover:bg-[var(--gold)]" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination removed — all products shown at once */}
              </div>
            </div>
          )}

          {/* Regions Grid */}
          {viewMode === "regions" && !isLoading && filteredRegions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredRegions.map((region) => {
                const regionName = getLocalizedText(region.name, t('labels.region'), locale);
                const countryCount = region.countries_count || 0;
                const startingPrice = region.starting_price || 0;

                const icon = region.icon;
                const isPath = icon && (icon.includes('/') || icon.includes('.'));
                const url = isPath ? getImageUrl(icon) : null;

                return (
                  <button
                    key={region.id}
                    className="bg-[#F0F2F5] rounded-2xl border border-[#E2E5EA] px-4 py-4 sm:px-6 flex items-center justify-between hover:border-[var(--gold)] transition-colors shadow-sm text-left w-full"
                    onClick={() => {
                      setViewMode("plans");
                      setSelectedRegionId(region.id);
                    }}
                  >
                    <div className="flex items-center gap-4">
                      {url ? (
                        <img src={url} alt={regionName} className="w-10 h-7 object-cover flag-wave shrink-0" />
                      ) : (
                        <Globe className="w-10 h-10 text-[var(--gray-text)] shrink-0" />
                      )}
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-[var(--navy)]">{regionName}</span>
                        {countryCount > 0 && (
                          <span className="text-xs font-medium text-[var(--gray-text)]">{countryCount} {t('labels.countries')}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="flex flex-col items-end hidden sm:flex">
                        <span className="text-[10px] text-[var(--gray-text)] uppercase font-semibold">{t('labels.from')}</span>
                        <span className="text-lg font-extrabold text-[var(--navy)] tracking-tight">€{startingPrice.toFixed(2)}</span>
                      </div>
                      <span className="bg-[var(--navy)] text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-[var(--navy-mid)] transition-colors shrink-0">
                        {t('cta.explore')}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isLoadingProducts && (
            (viewMode === "plans" && filteredProducts.length === 0) ||
            (viewMode === "regions" && filteredRegions.length === 0)
          ) && (
              <div className="text-center py-16">
                <Globe className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">{t('empty.title')}</h3>
                <p className="text-muted-foreground">{t('empty.description')}</p>
              </div>
            )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
