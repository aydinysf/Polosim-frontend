"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Signal, Clock, Star, ArrowUpDown, ChevronDown, Filter, Globe, Wifi, Check, ArrowRight, Loader2 } from "lucide-react";
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
import { Check as CheckIcon, ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
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

  const [addedToCart, setAddedToCart] = useState<number | null>(null);

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

  const { addItem } = useCart();

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
        if (!selectedRegionId && !initialRegion && regionsData.length > 0) {
          setSelectedRegionId(regionsData[0].id);
        }
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
        // Default to first region if no initial region specified
        setSelectedRegionId(regions[0].id);
        initializedRef.current = true;
      }
    }
  }, [initialRegion, regions]);

  const handleAddToCart = (product: Product) => {
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
    setAddedToCart(product.id);
    setTimeout(() => setAddedToCart(null), 2000);
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

  const pageSize = 12;
  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-[var(--navy)] pt-14 pb-12 px-[5%] relative overflow-hidden text-center">


        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-block bg-[rgba(201,168,76,0.15)] text-[var(--gold)] border border-[rgba(201,168,76,0.3)] rounded-full px-4 py-1.5 text-[12px] font-bold tracking-[0.5px] uppercase mb-5">
            {t('hero.destinationsAvailable')}
          </div>
          <h1 className="text-[38px] font-extrabold text-white mb-3 tracking-tight">
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
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[#9CA3AF] shrink-0"><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/><path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
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
            </div>

            {/* Autocomplete Dropdown */}
            {openCombobox && searchQuery && filteredSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden max-h-80 overflow-y-auto">
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
                          return url ? <img src={url} alt="" className="w-6 h-4 object-cover rounded-sm" /> : "🏳️";
                        })()
                        : (() => {
                          const icon = (item as Region).icon;
                          const isPath = icon && (icon.includes('/') || icon.includes('.'));
                          const url = isPath ? getImageUrl(icon) : null;
                          return url ? (
                            <div className="relative w-6 h-6 rounded-sm overflow-hidden">
                              <Image src={url} alt="" fill className="object-cover" sizes="24px" />
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
      </section>

      {/* Filters & Content */}
      <section className="pb-24 px-4">
        <div className="max-w-7xl mx-auto">
          {/* View Mode Tabs + Filter Bar */}
          <div className="flex flex-col gap-4 mb-8">
            {/* View Mode Tabs */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setViewMode("regions"); setSearchQuery(""); }}
                className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${viewMode === "regions"
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-card/50 text-muted-foreground hover:bg-card border border-border/50"
                  }`}
              >
                {t('tabs.regions')}
              </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col gap-4 p-4 rounded-2xl bg-card/30 border border-border/50 backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`gap-2 ${showFilters ? 'bg-primary/10 border-primary/30 text-primary' : ''}`}
                  >
                    <Filter className="w-4 h-4" />
                    {t('filters.title')}
                    {(filterData || filterValidity || filterPriceRange[0] > 0 || filterPriceRange[1] < 100) && (
                      <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] rounded-full">
                        {(filterData ? 1 : 0) + (filterValidity ? 1 : 0) + ((filterPriceRange[0] > 0 || filterPriceRange[1] < 100) ? 1 : 0)}
                      </Badge>
                    )}
                  </Button>

                  {viewMode === "plans" && (
                    <>
                      {/* Region filter pills for plans view */}
                      {regions.slice(0, 6).map((region) => (
                        <button
                          key={region.id}
                          onClick={() => { setSelectedRegionId(region.id === selectedRegionId ? null : region.id); setSearchQuery(""); }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedRegionId === region.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-card/50 text-muted-foreground hover:bg-card border border-border/50"
                            }`}
                        >
                          {(() => {
                            const icon = region.icon;
                            const isPath = icon && (icon.includes('/') || icon.includes('.'));
                            const url = isPath ? getImageUrl(icon) : null;
                            return url ? (
                              <div className="relative w-4 h-4 rounded-sm overflow-hidden inline-block mr-1 align-middle">
                                <Image src={url} alt="" fill className="object-cover" sizes="16px" />
                              </div>
                            ) : (icon ? <span className="mr-1">{icon}</span> : null);
                          })()}
                          {getLocalizedText(region.name, "", locale)}
                        </button>
                      ))}

                      <button
                        onClick={() => setShowBestSellers(!showBestSellers)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${showBestSellers
                          ? "bg-primary text-primary-foreground"
                          : "bg-card/50 text-muted-foreground hover:bg-card border border-border/50"
                          }`}
                      >
                        <Star className={`w-3 h-3 ${showBestSellers ? "fill-primary-foreground" : ""}`} />
                        {t('filters.bestSellers')}
                      </button>
                    </>
                  )}
                </div>

                {/* Sort */}
                <div className="relative flex-shrink-0">
                  <button
                    onClick={() => setSortMenuOpen(!sortMenuOpen)}
                    onBlur={() => setTimeout(() => setSortMenuOpen(false), 150)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-card/50 text-muted-foreground hover:bg-card border border-border/50 transition-all"
                  >
                    <ArrowUpDown className="w-3 h-3" />
                    {sortOptions.find((opt) => opt.key === sortBy)?.label}
                    <ChevronDown className={`w-3 h-3 transition-transform ${sortMenuOpen ? "rotate-180" : ""}`} />
                  </button>
                  {sortMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl overflow-hidden z-50 min-w-[180px]">
                      {sortOptions.filter(o => viewMode === "regions" ? o.key !== "data-high" : true).map((option) => (
                        <button
                          key={option.key}
                          onClick={() => { setSortBy(option.key); setSortMenuOpen(false); }}
                          className={`w-full px-4 py-2.5 text-left text-sm hover:bg-secondary/50 transition-colors ${sortBy === option.key ? "text-primary font-medium" : "text-foreground"
                            }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded Filters Panel */}
              {showFilters && (
                <div className="pt-4 mt-2 border-t border-border/30 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2">

                  {/* Data Filter */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">{t('filters.dataAmount')}</label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setFilterData(null)}
                        className={`px-3 py-1 rounded-md text-xs transition-colors ${!filterData ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                      >
                        {t('filters.any')}
                      </button>
                      {dataFilterOptions.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setFilterData(filterData === opt.value ? null : opt.value)}
                          className={`px-3 py-1 rounded-md text-xs transition-colors ${filterData === opt.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Validity Filter */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">{t('filters.duration')}</label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setFilterValidity(null)}
                        className={`px-3 py-1 rounded-md text-xs transition-colors ${!filterValidity ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                      >
                        {t('filters.any')}
                      </button>
                      {validityFilterOptions.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setFilterValidity(filterValidity === opt.value ? null : opt.value)}
                          className={`px-3 py-1 rounded-md text-xs transition-colors ${filterValidity === opt.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Filter */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-muted-foreground">{t('filters.priceRange')}</label>
                      <span className="text-xs font-medium">€{filterPriceRange[0]} - €{filterPriceRange[1]}</span>
                    </div>
                    <Slider
                      defaultValue={[0, 100]}
                      max={100}
                      step={1}
                      value={filterPriceRange}
                      onValueChange={(val) => setFilterPriceRange(val as [number, number])}
                      className="py-1"
                    />
                  </div>
                </div>
              )}

              {/* Pagination - only show in plans view */}
              {viewMode === "plans" && totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="h-8 w-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-1">
                    {(() => {
                      const lastPage = totalPages;
                      const pages: (number | string)[] = [];

                      if (lastPage <= 10) {
                        for (let i = 1; i <= lastPage; i++) pages.push(i);
                      } else {
                        // First 3 pages
                        pages.push(1, 2, 3);

                        const endStart = lastPage - 3;

                        // Handle middle
                        if (currentPage > 3 && currentPage < endStart) {
                          if (currentPage > 4) pages.push('...');
                          pages.push(currentPage);
                          if (currentPage < endStart - 1) pages.push('...');
                        } else {
                          pages.push('...');
                        }

                        // Last 4 pages (n-3, n-2, n-1, n)
                        for (let i = endStart; i <= lastPage; i++) {
                          if (!pages.includes(i)) pages.push(i);
                        }
                      }

                      return pages.map((page, index) => {
                        if (page === '...') {
                          return <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">...</span>;
                        }
                        const p = page as number;
                        return (
                          <Button
                            key={p}
                            variant={currentPage === p ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(p)}
                            className={cn("h-8 w-8 p-0", currentPage === p ? "pointer-events-none" : "")}
                          >
                            {p}
                          </Button>
                        );
                      });
                    })()}
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Results Count */}
          <p className="text-sm text-muted-foreground mb-6">
            {viewMode === "plans"
              ? t('results.plansCount', { count: filteredProducts.length })
              : t('results.regionsCount', { count: filteredRegions.length })}
          </p>

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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {paginatedProducts.map((product) => {
                    const name = getProductName(product, locale);
                    const data = getProductData(product);
                    const validity = getProductValidity(product, t);
                    const speed = getProductSpeed(product);
                    const bestSeller = isBestSeller(product);

                    // Parse validity days for progress bar
                    const validityDays = parseInt(getProductValidity(product)) || 30;
                    const progressPct = Math.min(100, Math.round((validityDays / 30) * 40));

                    // Flag URL
                    const rawFlag = product.country?.flag_url || product.flag_url;
                    const isFlagPath = rawFlag && (rawFlag.includes('.') || rawFlag.includes('/'));
                    const flagUrl = isFlagPath ? getImageUrl(rawFlag) : getFlagFromISO(product.country?.iso_code);

                    // Country name
                    const countryName = getLocalizedText(product.country?.name) || name;

                    return (
                      <div
                        key={product.id}
                        className="group relative overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white transition-all duration-200 hover:border-[var(--gold)] hover:translate-y-[-2px] hover:shadow-lg cursor-pointer"
                      >
                        {/* Top row: Flag + Country name + arrow */}
                        <div className="flex items-center justify-between px-4 pt-4 pb-3">
                          <div className="flex items-center gap-2">
                            {flagUrl ? (
                              <img
                                src={flagUrl}
                                alt={countryName}
                                className="w-8 h-5 rounded-sm object-cover shadow-sm"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                            ) : (
                              <span className="text-xl">🌍</span>
                            )}
                            <span className="font-bold text-[var(--text-dark)] text-[15px]">{countryName}</span>
                          </div>
                          <div className="w-6 h-6 rounded-full border border-[#E5E7EB] flex items-center justify-center text-[var(--text-dark)] group-hover:border-[var(--gold)] group-hover:text-[var(--gold)] transition-all">
                            <ArrowRight className="w-3 h-3" />
                          </div>
                        </div>

                        {/* Status + Date row */}
                        <div className="flex items-center justify-between px-4 pb-3">
                          <span className="inline-flex items-center gap-1 bg-[#F3F4F6] text-[var(--gray-text)] text-[11px] font-semibold px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] inline-block"></span>
                            {t('labels.upcoming') || 'Gelecek'}
                          </span>
                          {bestSeller && (
                            <span className="text-[10px] text-[var(--gold)] font-bold uppercase tracking-wider">
                              ★ {t('labels.bestSeller')}
                            </span>
                          )}
                        </div>

                        {/* Data row */}
                        <div className="mx-4 mb-2 flex items-center justify-between bg-[#F9FAFB] rounded-xl px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center">
                              <Signal className="w-3 h-3 text-[var(--gold)]" />
                            </div>
                            <span className="text-[12px] text-[var(--gray-text)] font-medium">{t('labels.dataVolume') || 'Veri Hacmi'}</span>
                          </div>
                          <span className="text-[13px] font-bold text-[var(--text-dark)]">{data}</span>
                        </div>

                        {/* Validity row */}
                        <div className="mx-4 mb-4 flex items-center justify-between bg-[#F9FAFB] rounded-xl px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center">
                              <Clock className="w-3 h-3 text-[var(--gold)]" />
                            </div>
                            <span className="text-[12px] text-[var(--gray-text)] font-medium">{t('labels.validityDuration') || 'Geçerlilik Süresi'}</span>
                          </div>
                          <span className="text-[13px] font-bold text-[var(--text-dark)]">{validity}</span>
                        </div>

                        {/* Bottom: price + buy button */}
                        <div className="flex items-center justify-between px-4 pb-4">
                          <span className="text-xl font-extrabold text-[var(--text-dark)]">€{product.price}</span>
                          <Button
                            size="sm"
                            className={`rounded-lg px-4 h-9 text-sm font-bold transition-all shadow-sm ${
                              addedToCart === product.id
                                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                                : "bg-[var(--navy)] hover:bg-[var(--navy)]/90 text-white"
                            }`}
                            onClick={() => handleAddToCart(product)}
                          >
                            {addedToCart === product.id ? (
                              <><Check className="w-4 h-4 mr-1" />{t('cta.added')}</>
                            ) : (
                              t('cta.buy')
                            )}
                          </Button>
                        </div>

                        {/* Zaman Çizelgesi progress bar */}
                        <div className="px-4 pb-4">
                          <span className="text-[10px] text-[var(--gray-text)] font-medium block mb-1.5">{t('labels.timeline') || 'Zaman Çizelgesi'}</span>
                          <div className="w-full h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[var(--gold)] to-[#E8C84A] transition-all duration-500"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Regions Grid */}
          {viewMode === "regions" && !isLoading && filteredRegions.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredRegions.map((region, index) => {
                const regionName = getLocalizedText(region.name, t('labels.region'), locale);
                const countryCount = region.countries_count || 0;
                const startingPrice = region.starting_price || 0;

                // Region icon/image
                const icon = region.icon;
                const imageUrl = region.image_url;
                const isIconPath = icon && (icon.includes('/') || icon.includes('.'));
                const iconUrl = isIconPath ? getImageUrl(icon) : null;
                const displayImageUrl = imageUrl ? getImageUrl(imageUrl) : iconUrl;

                return (
                  <button
                    key={region.id}
                    className="group relative overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white text-left transition-all duration-200 hover:border-[var(--gold)] hover:translate-y-[-2px] hover:shadow-lg cursor-pointer"
                    onClick={() => {
                      setViewMode("plans");
                      setSelectedRegionId(region.id);
                    }}
                  >
                    {/* Region icon at top-center */}
                    <div className="flex justify-center pt-5 pb-3">
                      <div className="w-16 h-16 rounded-full border-[3px] border-[#E5E7EB] bg-[#F3F4F6] overflow-hidden flex items-center justify-center shadow-sm group-hover:border-[var(--gold)] transition-all">
                        {displayImageUrl ? (
                          <img src={displayImageUrl} alt={regionName} className="w-full h-full object-cover" />
                        ) : icon && !isIconPath ? (
                          <span className="text-3xl">{icon}</span>
                        ) : (
                          <Globe className="w-8 h-8 text-[var(--gray-text)]" />
                        )}
                      </div>
                    </div>

                    {/* Region name */}
                    <div className="text-center px-4 pb-3">
                      <h3 className="text-[15px] font-bold text-[var(--text-dark)] leading-tight">{regionName}</h3>
                      {countryCount > 0 && (
                        <p className="text-[11px] text-[var(--gray-text)] mt-0.5">{t('labels.countriesCount', { count: countryCount })}</p>
                      )}
                    </div>

                    {/* Badges row: data / days / speed */}
                    <div className="flex items-center justify-center gap-2 px-3 pb-4 flex-wrap">
                      <span className="inline-flex items-center gap-1 bg-[#F3F4F6] rounded-full px-2.5 py-1 text-[11px] font-semibold text-[var(--text-dark)]">
                        <Signal className="w-3 h-3 text-[var(--gold)]" />
                        {t('labels.dataTag') || '5 GB'}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-[#F3F4F6] rounded-full px-2.5 py-1 text-[11px] font-semibold text-[var(--text-dark)]">
                        <Clock className="w-3 h-3 text-[var(--gold)]" />
                        {countryCount > 0 ? `${countryCount} ${t('labels.countries') || 'Ülke'}` : (t('labels.daysTag') || '10 Gün')}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-[#F3F4F6] rounded-full px-2.5 py-1 text-[11px] font-semibold text-[var(--text-dark)]">
                        <Wifi className="w-3 h-3 text-[var(--gold)]" />
                        4G
                      </span>
                    </div>

                    {/* Price + Buy button */}
                    <div className="flex items-center justify-between px-4 pb-5">
                      <div>
                        {startingPrice > 0 ? (
                          <>
                            <span className="text-[10px] text-[var(--gray-text)] font-medium block">{t('labels.from')}</span>
                            <p className="text-xl font-extrabold text-[var(--text-dark)] tracking-tight">€{startingPrice.toFixed(2)}</p>
                          </>
                        ) : (
                          <p className="text-xl font-extrabold text-[var(--text-dark)] tracking-tight">—</p>
                        )}
                      </div>
                      <div className="bg-[var(--navy)] text-white text-[12px] font-bold px-4 py-2 rounded-lg group-hover:bg-[var(--gold)] transition-all">
                        {t('cta.buy')}
                      </div>
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
