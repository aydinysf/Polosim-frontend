"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Wifi, Globe, Smartphone, X, Signal, Clock, ShoppingCart, Check, ArrowRight, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/cart-context";
import { useRouter, Link } from "@/i18n/routing";
import Image from "next/image";
import { countryService, type Country } from "@/lib/services/countryService";
import { regionService, type Region } from "@/lib/services/regionService";
import { productService, type Product } from "@/lib/services/productService";
import { getLocalizedText, getProductData, getProductValidity, getProductSpeed, getProductThrottleSpeed, isHotspotAllowed, hasInstantActivation, isBestSeller, getProductName } from "@/lib/product-helpers";
import { getImageUrl, getFlagFromISO } from "@/lib/api-client";
import { useTranslations } from "next-intl";





// Flag component that handles both emoji and URL
function FlagDisplay({ flag, name, size = "md" }: { flag?: string; name: string; size?: "sm" | "md" | "lg" }) {
  const sizeStyles = {
    sm: { width: 16, height: 12, className: "w-4 h-3" },
    md: { width: 24, height: 18, className: "w-6 h-[18px]" },
    lg: { width: 32, height: 24, className: "w-8 h-6" },
  };
  const { width, height, className } = sizeStyles[size];
  const textClass = size === 'sm' ? 'text-sm' : size === 'md' ? 'text-xl' : 'text-2xl';


  if (!flag) {
    return <span className={`${className} ${textClass}`}>🌍</span>;
  }

  // 1. Check if it's a URL or needs prefixing (API path)
  const isPath = flag.includes('.') || flag.includes('/') || flag.startsWith('http');
  const imageUrl = isPath ? getImageUrl(flag) : null;

  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={`${name} flag`}
        width={width}
        height={height}
        className={`${className} object-cover`}
        unoptimized={true}
      />
    );
  }

  // 2. If it's a country code (2 letters), show image flag from FlagCDN
  const isoMatch = flag.match(/^[A-Za-z]{2}$/);
  const flagFromISO = getFlagFromISO(flag);
  if (isoMatch && flagFromISO) {
    return (
      <Image
        src={flagFromISO}
        alt={`${name} flag`}
        width={width}
        height={height}
        className={`${className} object-cover`}
        unoptimized={true}
      />
    );
  }

  // 3. Special case for common emojis that are not 2-letter ISO (e.g. "🇹🇷", "🇪🇺")
  // We can convert these to 2-letter ISO if they are regional indicator pairs
  if (flag.length > 2) {
    // Attempt to convert emoji to ISO
    const iso = emojiToISO(flag);
    const flagUrl = getFlagFromISO(iso);
    if (flagUrl) {
      return (
        <Image
          src={flagUrl}
          alt={`${name} flag`}
          width={width}
          height={height}
          className={`${className} object-cover`}
          unoptimized={true}
        />
      );
    }
  }

  // Fallback to globe
  return <span className={`${className} ${textClass}`}>🌍</span>;
}

// Convert flag emoji to ISO code
function emojiToISO(emoji: string): string | null {
  const codePoints = Array.from(emoji).map(c => c.codePointAt(0)!);
  if (codePoints.length >= 2 && codePoints.every(cp => cp >= 127462 && cp <= 127487)) {
    return codePoints.map(cp => String.fromCharCode(cp - 127397)).join("");
  }
  return null;
}


export function HeroSection() {
  const t = useTranslations('Hero');
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ type: string; name: string; flag?: string; region?: string; id?: number } | null>(null);
  const [addedToCart, setAddedToCart] = useState<number | null>(null);
  const [searchResultPlans, setSearchResultPlans] = useState<any[]>([]); // Declare searchResultPlans variable

  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [searchSource, setSearchSource] = useState<'search' | 'popular' | 'regions' | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || !isAutoScrolling) return;

    const scrollInterval = setInterval(() => {
      if (scrollContainer.scrollLeft + scrollContainer.clientWidth >= scrollContainer.scrollWidth - 1) {
        scrollContainer.scrollLeft = 0;
      } else {
        scrollContainer.scrollLeft += 1;
      }
    }, 30);

    return () => clearInterval(scrollInterval);
  }, [isAutoScrolling]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // API data states
  const [countries, setCountries] = useState<Country[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [popularCountries, setPopularCountries] = useState<Country[]>([]);
  const [searchResultProducts, setSearchResultProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const { addItem } = useCart();
  const router = useRouter();

  // Fetch countries and regions on mount
  useEffect(() => {
    async function fetchInitialData() {
      try {
        setIsLoading(true);
        const [countriesResponse, regionsData, popularData] = await Promise.all([
          countryService.getAll(),
          regionService.getAll(),
          countryService.getPopular(),
        ]);
        setCountries(Array.isArray(countriesResponse) ? countriesResponse : (countriesResponse as any).data);
        setRegions(Array.isArray(regionsData) ? regionsData : (regionsData as any).data);
        setPopularCountries(popularData);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchInitialData();
  }, []);

  // Build searchable items from API data + fallback
  const searchableItems = [
    ...countries.map(c => ({
      type: "country" as const,
      name: getLocalizedText(c.name, "Unknown Country"),
      flag: c.flag_url || c.iso_code,
      region: c.region_id?.toString(),
      id: c.id
    })),
    ...regions.map(r => ({
      type: "region" as const,
      name: getLocalizedText(r.name, "Unknown Region"),
      flag: r.icon,
      region: r.slug,
      id: r.id
    })),
  ];

  const filteredSuggestions = searchableItems.filter((item) =>
    item.name && typeof item.name === "string" && item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch products when selection changes
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    async function fetchProducts() {
      if (!selectedItem) {
        setSearchResultProducts([]);
        return;
      }

      try {
        setIsLoadingProducts(true);
        let products: Product[] = [];

        if (selectedItem.type === "country" && selectedItem.id) {
          const response = await productService.getByCountry(selectedItem.id, signal);
          if (signal.aborted) return;
          products = response.data;
        } else if (selectedItem.type === "region") {
          // For regions, try multiple approaches
          if (selectedItem.id) {
            const response = await productService.getByRegion(selectedItem.id, signal);
            if (signal.aborted) return;
            products = response.data;
          } else {
            // Try to find region ID from loaded regions
            const matchedRegion = regions.find(r => {
              const rName = getLocalizedText(r.name, "").toLowerCase();
              return rName === selectedItem.name.toLowerCase() || r.slug === selectedItem.region;
            });

            if (matchedRegion?.id) {
              const response = await productService.getByRegion(matchedRegion.id, signal);
              if (signal.aborted) return;
              products = response.data;
            } else {
              // Last resort: fetch all and filter
              const response = await productService.getAll(undefined, signal);
              if (signal.aborted) return;
              products = response.data.filter(p => {
                const regionName = getLocalizedText(p.region_name || p.region?.name, "").toLowerCase();
                return regionName.includes(selectedItem.name.toLowerCase());
              });
            }
          }
        } else {
          // Fallback to all products filtered by name
          const response = await productService.getAll(undefined, signal);
          if (signal.aborted) return;
          products = response.data.filter(p => {
            const countryName = getLocalizedText(p.country_name || p.country?.name, "").toLowerCase();
            const regionName = getLocalizedText(p.region_name || p.region?.name, "").toLowerCase();
            return countryName.includes(selectedItem.name.toLowerCase()) ||
              regionName.includes(selectedItem.name.toLowerCase());
          });
        }

        setSearchResultProducts(products);
      } catch (error: any) {
        // Silently ignore aborted/canceled requests (AbortController + axios)
        if (
          error?.name === "AbortError" ||
          error?.name === "CanceledError" ||
          error?.code === "ERR_CANCELED" ||
          signal.aborted
        ) return;
        console.error("Error fetching products:", error);
        setSearchResultProducts([]);
      } finally {
        if (!signal.aborted) {
          setIsLoadingProducts(false);
        }
      }
    }

    fetchProducts();

    return () => {
      controller.abort();
    };
  }, [selectedItem, regions]);

  // Handle scrolling to results
  useEffect(() => {
    if (showSearchResults && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [showSearchResults, searchSource]);

  const handleSelectSuggestion = (item: { type: string; name: string; flag?: string; region?: string; id?: number }, source: 'search' | 'popular' | 'regions' = 'search') => {
    setSelectedItem(item);
    setSearchQuery(item.name);
    setShowSuggestions(false);
    setSearchSource(source);
    setShowSearchResults(true);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const found = searchableItems.find(item =>
        item.name.toLowerCase() === searchQuery.toLowerCase()
      );
      if (found) {
        handleSelectSuggestion(found, 'search');
      } else {
        // Partial match
        const partial = filteredSuggestions[0];
        if (partial) {
          handleSelectSuggestion(partial, 'search');
        }
      }
    }
  };

  const handleAddToCart = (product: Product) => {
    const productName = getProductName(product);
    const productData = getProductData(product);
    const productValidity = getProductValidity(product);
    const productSpeed = getProductSpeed(product);

    const cartItem = {
      id: product.id,
      name: productName,
      description: getLocalizedText(product.description) || `${productData} Data Plan`,
      priceInCents: product.base_price ? Math.round(product.base_price * 100) : 0,
      flag: product.flag_url || product.country?.flag_url || "",
      data: productData,
      validity: String(productValidity),
      speed: productSpeed || "4G/LTE",
      region: getLocalizedText(product.region_name),
    };
    addItem(cartItem);
    setAddedToCart(product.id);
    setTimeout(() => setAddedToCart(null), 2000);
  };

  const closeSearchResults = () => {
    setShowSearchResults(false);
    setSelectedItem(null);
    setSearchSource(null);
    setSearchQuery("");
  };

  const renderSearchResults = () => {
    if (!showSearchResults || !selectedItem) return null;

    return (
      <div ref={resultsRef} className="mt-8 mb-8 bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 relative">
        <button
          onClick={closeSearchResults}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary/50 transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <FlagDisplay flag={selectedItem.flag} name={selectedItem.name} size="lg" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">{selectedItem.name}</h2>
            <p className="text-muted-foreground capitalize">{selectedItem.type === "region" ? t('regionalPlans') : t('countryPlans')}</p>
          </div>
        </div>

        {isLoadingProducts ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : searchResultProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
              {searchResultProducts.map((product) => {
                const productName = getProductName(product);
                const productData = getProductData(product);
                const productValidity = getProductValidity(product);
                const productSpeed = getProductSpeed(product);
                const hotspot = isHotspotAllowed(product);
                const instantActivation = hasInstantActivation(product);
                const bestSeller = isBestSeller(product);

                return (
                  <div
                    key={product.id}
                    className="relative overflow-hidden rounded-xl border border-border/50 bg-primary/5 dark:bg-card p-4 transition-all duration-300 hover:border-primary/50"
                  >
                    {bestSeller && (
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full">{t('bestSeller')}</span>
                      </div>
                    )}

                    {/* Header with flag and data */}
                    <div className="flex items-center gap-2 mb-3">
                      <FlagDisplay flag={product.flag_url || product.country?.flag_url} name={productName} size="md" />
                      <div>
                        <h3 className="font-semibold text-foreground">{productName}</h3>
                        <p className="text-lg font-bold text-primary">{productData}</p>
                      </div>
                    </div>

                    {/* Plan details */}
                    <div className="space-y-1.5 mb-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        <span>{productValidity}</span>
                      </div>
                      {productSpeed && (
                        <div className="flex items-center gap-2">
                          <Signal className="w-3 h-3 flex-shrink-0" />
                          <span>{productSpeed}</span>
                        </div>
                      )}
                    </div>

                    {/* Features badges */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {hotspot && (
                        <span className="px-2 py-0.5 text-[10px] font-medium bg-emerald-500/10 text-emerald-500 rounded-full">
                          Hotspot
                        </span>
                      )}
                      {instantActivation && (
                        <span className="px-2 py-0.5 text-[10px] font-medium bg-blue-500/10 text-blue-500 rounded-full">
                          Instant
                        </span>
                      )}
                    </div>

                    {/* Price and buy button */}
                    <div className="flex items-center justify-between pt-3 border-t border-border/30">
                      <span className="text-xl font-bold text-foreground">
                        {product.base_currency || 'EUR'} {product.base_price}
                      </span>
                      <Button
                        size="sm"
                        className={`transition-all ${addedToCart === product.id ? "bg-emerald-500 hover:bg-emerald-500" : "bg-primary hover:bg-primary/90"} text-primary-foreground`}
                        onClick={() => handleAddToCart(product)}
                      >
                        {addedToCart === product.id ? (
                          <><Check className="w-4 h-4 mr-1" />Added</>
                        ) : (
                          <><ShoppingCart className="w-4 h-4 mr-1" />Buy</>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : !isLoadingProducts ? (
          <div className="text-center py-8">
            <Globe className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No plans found for {selectedItem.name}</p>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <section className="relative pt-36 sm:pt-40 pb-8 flex flex-col items-center justify-start overflow-hidden bg-gray-100">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(14,116,144,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(14,116,144,0.04)_1px,transparent_1px)] bg-[size:40px_40px] md:bg-[size:60px_60px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,116,144,0.06)_0%,transparent_70%)]" />
        <div className="absolute top-20 left-10 w-48 md:w-72 h-48 md:h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-64 md:w-96 h-64 md:h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-foreground tracking-tight mb-4 sm:mb-6">
            {t('title')}
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            {t('subtitle')}
          </p>
        </div>

        {/* Search bar - TOP */}
        <div className="relative max-w-xl mx-auto mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-cyan-500/20 to-primary/20 rounded-xl sm:rounded-2xl blur-xl" />
            <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-xl sm:rounded-2xl p-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center gap-3 flex-1 pl-3 sm:pl-4">
                  <Search className="w-5 h-5 text-muted-foreground shrink-0" />
                  <Input
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (showSearchResults) setShowSearchResults(false);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="border-0 bg-transparent focus-visible:ring-0 text-foreground placeholder:text-muted-foreground text-base sm:text-lg"
                  />
                </div>
                <Button
                  size="lg"
                  className="w-full sm:w-auto rounded-lg sm:rounded-xl px-4 sm:px-6 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handleSearch}
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </div>

          {/* Search Suggestions Dropdown */}
          {showSuggestions && searchQuery && filteredSuggestions.length > 0 && !showSearchResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl overflow-hidden z-50 max-h-80 overflow-y-auto">
              {filteredSuggestions.slice(0, 8).map((item, index) => (
                <button
                  key={`${item.name}-${index}`}
                  className="w-full px-4 py-3 text-left hover:bg-secondary/50 flex items-center gap-3 transition-colors text-foreground"
                  onMouseDown={() => handleSelectSuggestion(item)}
                >
                  <FlagDisplay flag={item.flag} name={item.name} size="md" />
                  <div>
                    <span className="block font-medium">{item.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">{item.type}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>



        {/* Badge - View All Button */}
        <div className="text-center mb-6 relative z-20">
          <Button
            variant="outline"
            size="lg"
            className="rounded-full gap-2 bg-card/50 backdrop-blur-sm hover:bg-card"
            onClick={() => router.push("/plans")}
          >
            <Wifi className="w-4 h-4 text-primary" />
            View All 200+ Destinations
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Popular Destinations Marquee */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-sm font-medium text-muted-foreground">{t('popularDestinations')}</h3>
            <Button
              variant="link"
              size="sm"
              className="text-primary p-0 h-auto"
              onClick={() => router.push("/plans")}
            >
              View All <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
          <div
            className="relative overflow-hidden group"
            onMouseEnter={() => setIsAutoScrolling(false)}
            onMouseLeave={() => setIsAutoScrolling(true)}
          >
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-md hidden sm:flex"
              onClick={() => scroll('left')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div
              ref={scrollContainerRef}
              className="flex gap-3 overflow-x-auto scrollbar-hide snap-x p-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {(popularCountries.length > 0 ? [...popularCountries, ...popularCountries] : []).map((country, index) => {
                const countryName = getLocalizedText(country.name);
                return (
                  <button
                    key={`${country.id}-${index}`}
                    className="flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl bg-card/60 border border-border/50 backdrop-blur-sm hover:bg-card hover:border-primary/50 transition-all cursor-pointer group"
                    onClick={() => {
                      handleSelectSuggestion({
                        type: "country",
                        name: countryName,
                        flag: country.flag_url || country.iso_code,
                        region: country.region_id?.toString(),
                        id: country.id
                      });
                    }}
                  >
                    <FlagDisplay flag={country.flag_url || country.iso_code} name={countryName} size="md" />
                    <div className="text-left">
                      <span className="block text-sm font-medium text-foreground group-hover:text-primary transition-colors">{countryName}</span>
                      <span className="block text-xs text-muted-foreground">eSIM Plans Available</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-md hidden sm:flex"
              onClick={() => scroll('right')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search Results */}
        {renderSearchResults()}

        {/* Popular Regions - Large Gradient Cards */}
        <div className="mb-10">
          <h3 className="text-sm font-medium text-muted-foreground mb-4 px-2">Popular Regions</h3>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {(regions.length > 0 ? regions.slice(0, 8) : [
                  { id: 1, name: "Europe", icon: "🇪🇺", countries_count: 40, starting_price: 4.99, slug: "europe", countries: [] },
                  { id: 2, name: "Asia", icon: "🌏", countries_count: 30, starting_price: 3.99, slug: "asia", countries: [] },
                  { id: 3, name: "Americas", icon: "🌎", countries_count: 25, starting_price: 5.99, slug: "americas", countries: [] },
                  { id: 4, name: "Middle East", icon: "🕌", countries_count: 15, starting_price: 5.49, slug: "middle-east", countries: [] },
                ]).map((region, index) => {
                  const regionData = "countries_count" in region ? region : null;
                  const regionName = getLocalizedText(regionData?.name || region.name, "Region");
                  const regionIcon = regionData?.icon || (region as { icon?: string }).icon || "🌍";
                  const countryCount = regionData?.countries_count || 0;
                  const startingPrice = regionData?.starting_price || 0;
                  const regionCountries =
                    regionData?.countries ||
                    (region as { countries?: { name: string; iso_code?: string; flag_url?: string }[] }).countries ||
                    [];

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
                    <button
                      key={regionName}
                      className={`group relative overflow-hidden flex flex-col items-center justify-center gap-3 rounded-2xl bg-gradient-to-br ${gradients[index % 4]} border border-border/40 backdrop-blur-sm ${borderColors[index % 4]} hover:scale-[1.03] transition-all duration-300 cursor-pointer p-5 min-h-[200px] sm:min-h-[230px]`}
                      onClick={() =>
                        handleSelectSuggestion(
                          {
                            type: "region",
                            name: regionName,
                            flag: regionIcon,
                            region: (regionData?.slug ?? (region as any).slug) || undefined,
                            id: regionData?.id ?? (region as any).id,
                          },
                          "regions"
                        )
                      }
                    >
                      <span className="text-5xl sm:text-6xl drop-shadow-sm">{regionIcon}</span>
                      <span className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                        {regionName}
                      </span>
                      {countryCount > 0 && (
                        <span className="text-xs text-muted-foreground">{countryCount}+ countries</span>
                      )}
                      {startingPrice > 0 && (
                        <span className="text-xs text-primary font-semibold">
                          From EUR {startingPrice.toFixed(2)}
                        </span>
                      )}
                      {regionCountries.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-2 mt-1">
                          {regionCountries.slice(0, 5).map((country) => {
                            const cName = getLocalizedText(country.name, "");
                            const cCode = country.iso_code || cName.substring(0, 2).toUpperCase();
                            return (
                              <div key={cName} className="flex flex-col items-center gap-0.5">
                                <span className="text-[9px] text-muted-foreground/80 font-medium uppercase leading-none">
                                  {cCode}
                                </span>
                                {(() => {
                                  const raw = country.flag_url;
                                  const isPath = raw && (raw.includes(".") || raw.includes("/"));
                                  const url = isPath ? getImageUrl(raw) : getFlagFromISO(country.iso_code);
                                  return url ? (
                                    <img
                                      src={url}
                                      alt={cName}
                                      className="w-5 h-3.5 rounded-sm object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = "none";
                                        (e.target as HTMLImageElement).parentElement!.innerHTML =
                                          '<span class="text-xs leading-none">🌍</span>';
                                      }}
                                    />
                                  ) : (
                                    <span className="text-xs leading-none">🌍</span>
                                  );
                                })()}
                              </div>
                            );
                          })}
                          {regionCountries.length > 5 && (
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="text-[9px] text-muted-foreground/60 font-medium leading-none">
                                +{regionCountries.length - 5}
                              </span>
                              <span className="text-xs text-muted-foreground/60 leading-none">...</span>
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* View All Regions Button */}
              <div className="flex justify-center mt-6">
                <Button
                  variant="outline"
                  className="border-border/50 hover:border-primary hover:bg-primary/10 text-foreground bg-transparent gap-2"
                  onClick={() => router.push("/plans?view=regions")}
                >
                  View All Regions
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Trust indicators */}
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
            <span>Instant Activation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full" />
            <span>24/7 Support</span>
          </div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-primary" />
            <span>Works with any eSIM device</span>
          </div>
        </div>
      </div>
    </section >
  );
}
