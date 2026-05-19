"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Signal, Clock, Star, ArrowUpDown, ChevronDown, Filter, Globe, Wifi, Check, ArrowRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { productService, type Product, type PaginationMeta } from "@/lib/services/productService";
import { regionService, type Region } from "@/lib/services/regionService";
import { countryService, type Country } from "@/lib/services/countryService";
import { getLocalizedText, getProductData, getProductValidity, getProductSpeed, isBestSeller, getProductName, getProductPrice } from "@/lib/product-helpers";
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
      priceInCents: Math.round(getProductPrice(product) * 100),
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
        const price = getProductPrice(product);
        matchesPrice = price >= filterPriceRange[0] && price <= filterPriceRange[1];
      }

      return matchesSearch && matchesBestSeller && matchesData && matchesValidity && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low": return getProductPrice(a) - getProductPrice(b);
        case "price-high": return getProductPrice(b) - getProductPrice(a);
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

          {/* Toolbar: Tabs + Filters + Sort */}
          <div className="mt-6 mb-8">

            {/* Top row: view toggle left, sort right */}
            <div className="flex items-center justify-between gap-3 mb-4">

              {/* View Mode Pills */}
              <div className="inline-flex items-center bg-white border border-[#E5E7EB] rounded-xl p-1 gap-1 shadow-sm">
                <button
                  onClick={() => { setViewMode("plans"); }}
                  className={`px-5 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                    viewMode === "plans"
                      ? "bg-[var(--navy)] text-white shadow"
                      : "text-[var(--gray-text)] hover:text-[var(--text-dark)]"
                  }`}
                >
                  {t('tabs.plans') || 'Planlar'}
                </button>
                <button
                  onClick={() => { setViewMode("regions"); setSearchQuery(""); }}
                  className={`px-5 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                    viewMode === "regions"
                      ? "bg-[var(--navy)] text-white shadow"
                      : "text-[var(--gray-text)] hover:text-[var(--text-dark)]"
                  }`}
                >
                  {t('tabs.regions')}
                </button>
              </div>

              {/* Right side: filter toggle + sort */}
              <div className="flex items-center gap-2">
                {/* Filter toggle button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold border transition-all ${
                    showFilters || filterData || filterValidity || filterPriceRange[0] > 0 || filterPriceRange[1] < 100
                      ? "bg-[var(--navy)] text-white border-[var(--navy)]"
                      : "bg-white text-[var(--gray-text)] border-[#E5E7EB] hover:border-[var(--navy)] hover:text-[var(--navy)]"
                  }`}
                >
                  <Filter className="w-3.5 h-3.5" />
                  {t('filters.title')}
                  {(filterData || filterValidity || filterPriceRange[0] > 0 || filterPriceRange[1] < 100) && (
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[var(--gold)] text-white text-[9px] font-bold">
                      {(filterData ? 1 : 0) + (filterValidity ? 1 : 0) + ((filterPriceRange[0] > 0 || filterPriceRange[1] < 100) ? 1 : 0)}
                    </span>
                  )}
                </button>

                {/* Sort dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setSortMenuOpen(!sortMenuOpen)}
                    onBlur={() => setTimeout(() => setSortMenuOpen(false), 150)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold bg-white text-[var(--gray-text)] border border-[#E5E7EB] hover:border-[var(--navy)] hover:text-[var(--navy)] transition-all"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{sortOptions.find(o => o.key === sortBy)?.label}</span>
                    <span className="sm:hidden">{t('sort.popular') || 'Sırala'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${sortMenuOpen ? "rotate-180" : ""}`} />
                  </button>
                  {sortMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 bg-white border border-[#E5E7EB] rounded-2xl shadow-xl overflow-hidden z-50 min-w-[200px]">
                      {sortOptions.filter(o => viewMode === "regions" ? !["data-high", "data-low"].includes(o.key) : true).map((option) => (
                        <button
                          key={option.key}
                          onClick={() => { setSortBy(option.key); setSortMenuOpen(false); }}
                          className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-[13px] hover:bg-[#F9FAFB] transition-colors ${
                            sortBy === option.key
                              ? "text-[var(--navy)] font-bold"
                              : "text-[var(--text-dark)] font-medium"
                          }`}
                        >
                          {option.label}
                          {sortBy === option.key && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] inline-block" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Region quick-filter pills (plans view only) */}
            {viewMode === "plans" && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {regions.slice(0, 8).map((region) => {
                  const icon = region.icon;
                  const isPath = icon && (icon.includes('/') || icon.includes('.'));
                  const url = isPath ? getImageUrl(icon) : null;
                  const isActive = selectedRegionId === region.id;
                  return (
                    <button
                      key={region.id}
                      onClick={() => { setSelectedRegionId(isActive ? null : region.id); setSearchQuery(""); }}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-all ${
                        isActive
                          ? "bg-[var(--navy)] text-white border-[var(--navy)] shadow-sm"
                          : "bg-white text-[var(--gray-text)] border-[#E5E7EB] hover:border-[var(--navy)] hover:text-[var(--navy)]"
                      }`}
                    >
                      {url ? (
                        <div className="relative w-3.5 h-3.5 rounded-sm overflow-hidden shrink-0">
                          <Image src={url} alt="" fill className="object-cover" sizes="14px" />
                        </div>
                      ) : icon ? (
                        <span className="text-[11px] leading-none">{icon}</span>
                      ) : null}
                      {getLocalizedText(region.name, "", locale)}
                    </button>
                  );
                })}

                {/* Best Sellers pill */}
                <button
                  onClick={() => setShowBestSellers(!showBestSellers)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-all ${
                    showBestSellers
                      ? "bg-[var(--gold)] text-white border-[var(--gold)] shadow-sm"
                      : "bg-white text-[var(--gray-text)] border-[#E5E7EB] hover:border-[var(--gold)] hover:text-[var(--gold)]"
                  }`}
                >
                  <Star className={`w-3 h-3 ${showBestSellers ? "fill-white" : ""}`} />
                  {t('filters.bestSellers')}
                </button>
              </div>
            )}

            {/* Expanded Filter Panel */}
            {showFilters && (
              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

                {/* Data Filter */}
                <div className="space-y-2.5">
                  <p className="text-[11px] font-bold text-[var(--gray-text)] uppercase tracking-wider">{t('filters.dataAmount')}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setFilterData(null)}
                      className={`px-3 py-1 rounded-full text-[12px] font-semibold border transition-all ${
                        !filterData
                          ? "bg-[var(--navy)] text-white border-[var(--navy)]"
                          : "bg-white text-[var(--gray-text)] border-[#E5E7EB] hover:border-[var(--navy)]"
                      }`}
                    >
                      {t('filters.any')}
                    </button>
                    {dataFilterOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setFilterData(filterData === opt.value ? null : opt.value)}
                        className={`px-3 py-1 rounded-full text-[12px] font-semibold border transition-all ${
                          filterData === opt.value
                            ? "bg-[var(--navy)] text-white border-[var(--navy)]"
                            : "bg-white text-[var(--gray-text)] border-[#E5E7EB] hover:border-[var(--navy)]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Validity Filter */}
                <div className="space-y-2.5">
                  <p className="text-[11px] font-bold text-[var(--gray-text)] uppercase tracking-wider">{t('filters.duration')}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setFilterValidity(null)}
                      className={`px-3 py-1 rounded-full text-[12px] font-semibold border transition-all ${
                        !filterValidity
                          ? "bg-[var(--navy)] text-white border-[var(--navy)]"
                          : "bg-white text-[var(--gray-text)] border-[#E5E7EB] hover:border-[var(--navy)]"
                      }`}
                    >
                      {t('filters.any')}
                    </button>
                    {validityFilterOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setFilterValidity(filterValidity === opt.value ? null : opt.value)}
                        className={`px-3 py-1 rounded-full text-[12px] font-semibold border transition-all ${
                          filterValidity === opt.value
                            ? "bg-[var(--navy)] text-white border-[var(--navy)]"
                            : "bg-white text-[var(--gray-text)] border-[#E5E7EB] hover:border-[var(--navy)]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Filter */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-[var(--gray-text)] uppercase tracking-wider">{t('filters.priceRange')}</p>
                    <span className="text-[12px] font-bold text-[var(--navy)]">€{filterPriceRange[0]} – €{filterPriceRange[1]}</span>
                  </div>
                  <Slider
                    defaultValue={[0, 100]}
                    max={100}
                    step={1}
                    value={filterPriceRange}
                    onValueChange={(val) => setFilterPriceRange(val as [number, number])}
                    className="py-1"
                  />
                  {(filterPriceRange[0] > 0 || filterPriceRange[1] < 100) && (
                    <button
                      onClick={() => setFilterPriceRange([0, 100])}
                      className="text-[11px] text-[var(--gold)] font-semibold hover:underline"
                    >
                      Sıfırla
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Pagination */}
            {viewMode === "plans" && totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded-lg border border-[#E5E7EB] bg-white flex items-center justify-center text-[var(--gray-text)] hover:border-[var(--navy)] hover:text-[var(--navy)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {(() => {
                  const lastPage = totalPages;
                  const pages: (number | string)[] = [];
                  if (lastPage <= 10) {
                    for (let i = 1; i <= lastPage; i++) pages.push(i);
                  } else {
                    pages.push(1, 2, 3);
                    const endStart = lastPage - 3;
                    if (currentPage > 3 && currentPage < endStart) {
                      if (currentPage > 4) pages.push('...');
                      pages.push(currentPage);
                      if (currentPage < endStart - 1) pages.push('...');
                    } else { pages.push('...'); }
                    for (let i = endStart; i <= lastPage; i++) {
                      if (!pages.includes(i)) pages.push(i);
                    }
                  }
                  return pages.map((page, index) => {
                    if (page === '...') return <span key={`e-${index}`} className="px-1 text-[var(--gray-text)]">…</span>;
                    const p = page as number;
                    return (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={`w-8 h-8 rounded-lg text-[13px] font-semibold border transition-all ${
                          currentPage === p
                            ? "bg-[var(--navy)] text-white border-[var(--navy)] pointer-events-none"
                            : "bg-white text-[var(--gray-text)] border-[#E5E7EB] hover:border-[var(--navy)] hover:text-[var(--navy)]"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  });
                })()}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 rounded-lg border border-[#E5E7EB] bg-white flex items-center justify-center text-[var(--gray-text)] hover:border-[var(--navy)] hover:text-[var(--navy)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Results Count */}
          <p className="text-[13px] text-[var(--gray-text)] font-medium mb-5">
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
                          <span className="text-xl font-extrabold text-[var(--text-dark)]">€{getProductPrice(product)}</span>
                          <button
                            className={`rounded-lg px-4 h-9 text-sm font-bold transition-all shadow-sm ${
                              addedToCart === product.id
                                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                                : "bg-[var(--navy)] hover:bg-[var(--navy)]/90 text-white"
                            }`}
                            onClick={() => handleAddToCart(product)}
                          >
                            {addedToCart === product.id ? (
                              <><Check className="w-4 h-4 mr-1 inline" />{t('cta.added')}</>
                            ) : (
                              t('cta.buy')
                            )}
                          </button>
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
