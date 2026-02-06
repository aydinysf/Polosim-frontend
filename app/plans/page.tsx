"use client";

import { useState, useEffect } from "react";
import { Search, Signal, Clock, ShoppingCart, Star, ArrowUpDown, ChevronDown, Filter, Globe, Wifi, Check, MapPin, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useCart } from "@/lib/cart-context";
import { useSearchParams } from "next/navigation";
import { productService, type Product } from "@/lib/services/productService";
import { regionService, type Region } from "@/lib/services/regionService";
import { getLocalizedText, getProductData, getProductValidity, getProductSpeed, getProductThrottleSpeed, isHotspotAllowed, hasInstantActivation, isBestSeller, getProductName } from "@/lib/product-helpers";

type ViewMode = "plans" | "regions";
type SortOption = "popular" | "price-low" | "price-high" | "data-high" | "name-az";

const sortOptions: { key: SortOption; label: string }[] = [
  { key: "popular", label: "Most Popular" },
  { key: "price-low", label: "Price: Low to High" },
  { key: "price-high", label: "Price: High to Low" },
  { key: "data-high", label: "Data: High to Low" },
  { key: "name-az", label: "Name: A to Z" },
];

export default function PlansPage() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialView = (searchParams.get("view") || "plans") as ViewMode;
  const initialRegion = searchParams.get("region") || "";
  
  const [viewMode, setViewMode] = useState<ViewMode>(initialView);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [showBestSellers, setShowBestSellers] = useState(false);
  const [addedToCart, setAddedToCart] = useState<number | null>(null);
  
  // API data
  const [products, setProducts] = useState<Product[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  
  const { addItem } = useCart();

  // Fetch regions on mount
  useEffect(() => {
    async function fetchRegions() {
      try {
        const data = await regionService.getAll();
        setRegions(data);
      } catch (error) {
        console.error("Error fetching regions:", error);
      }
    }
    fetchRegions();
  }, []);

  // Fetch products on mount and when filters change
  useEffect(() => {
    async function fetchProducts() {
      try {
        setIsLoadingProducts(true);
        let data: Product[];
        
        if (selectedRegionId) {
          data = await productService.getByRegion(selectedRegionId);
        } else {
          data = await productService.getAll();
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
  }, [selectedRegionId]);

  // Handle initial region from URL
  useEffect(() => {
    if (initialRegion && regions.length > 0) {
      const matched = regions.find(r => 
        r.slug === initialRegion || getLocalizedText(r.name, "").toLowerCase() === initialRegion.toLowerCase()
      );
      if (matched) {
        setSelectedRegionId(matched.id);
      }
    }
  }, [initialRegion, regions]);

  const handleAddToCart = (product: Product) => {
    const name = getProductName(product);
    const data = getProductData(product);
    const validity = getProductValidity(product);
    const speed = getProductSpeed(product);
    
    const cartItem = {
      id: product.id.toString(),
      name,
      description: getLocalizedText(product.description) || `${data} Data Plan`,
      priceInCents: Math.round((product.price || 0) * 100),
      flag: product.flag_url || product.country?.flag_url,
      data,
      validity,
      speed,
      region: getLocalizedText(product.region_name),
    };
    addItem(cartItem);
    setAddedToCart(product.id);
    setTimeout(() => setAddedToCart(null), 2000);
  };

  // Filter and sort products
  const filteredProducts = products
    .filter((product) => {
      const name = getProductName(product).toLowerCase();
      const matchesSearch = !searchQuery || name.includes(searchQuery.toLowerCase());
      const matchesBestSeller = !showBestSellers || isBestSeller(product);
      return matchesSearch && matchesBestSeller;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low": return (a.price || 0) - (b.price || 0);
        case "price-high": return (b.price || 0) - (a.price || 0);
        case "data-high": {
          const aFeatures = a.features as Record<string, unknown> | undefined;
          const bFeatures = b.features as Record<string, unknown> | undefined;
          const aData = Number(aFeatures?.data_raw_mb) || 0;
          const bData = Number(bFeatures?.data_raw_mb) || 0;
          return bData - aData;
        }
        case "name-az": return getProductName(a).localeCompare(getProductName(b));
        default: return (isBestSeller(b) ? 1 : 0) - (isBestSeller(a) ? 1 : 0);
      }
    });

  // Filter regions
  const filteredRegions = regions
    .filter(r => {
      if (!searchQuery) return true;
      return getLocalizedText(r.name, "").toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low": return (a.starting_price || 0) - (b.starting_price || 0);
        case "price-high": return (b.starting_price || 0) - (a.starting_price || 0);
        case "name-az": return getLocalizedText(a.name, "").localeCompare(getLocalizedText(b.name, ""));
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
      <section className="pt-40 pb-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(14,116,144,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(14,116,144,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-20 left-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border/50 backdrop-blur-sm mb-6">
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">200+ Destinations Available</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 text-balance">
            {viewMode === "regions" ? "Browse All Regions" : "Browse All Plans"}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8 text-lg">
            {viewMode === "regions" 
              ? "Explore our regional eSIM plans covering multiple countries with a single package."
              : "Find the perfect eSIM data plan for your destination. Instant activation, no roaming fees."}
          </p>
          
          {/* Search Bar */}
          <div className="max-w-xl mx-auto">
            <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 flex-1 pl-4">
                  <Search className="w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={viewMode === "regions" ? "Search regions..." : "Search countries or plans..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-0 bg-transparent focus-visible:ring-0 text-foreground placeholder:text-muted-foreground text-lg"
                  />
                </div>
              </div>
            </div>
          </div>
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
                onClick={() => { setViewMode("plans"); setSelectedRegionId(null); }}
                className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                  viewMode === "plans"
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-card/50 text-muted-foreground hover:bg-card border border-border/50"
                }`}
              >
                All Plans
              </button>
              <button
                onClick={() => setViewMode("regions")}
                className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                  viewMode === "regions"
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-card/50 text-muted-foreground hover:bg-card border border-border/50"
                }`}
              >
                Regions
              </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl bg-card/30 border border-border/50 backdrop-blur-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                
                {viewMode === "plans" && (
                  <>
                    {/* Region filter pills for plans view */}
                    <button
                      onClick={() => setSelectedRegionId(null)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        !selectedRegionId
                          ? "bg-primary text-primary-foreground"
                          : "bg-card/50 text-muted-foreground hover:bg-card border border-border/50"
                      }`}
                    >
                      All
                    </button>
                    {regions.slice(0, 6).map((region) => (
                      <button
                        key={region.id}
                        onClick={() => setSelectedRegionId(region.id === selectedRegionId ? null : region.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          selectedRegionId === region.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-card/50 text-muted-foreground hover:bg-card border border-border/50"
                        }`}
                      >
                        {region.icon} {getLocalizedText(region.name)}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setShowBestSellers(!showBestSellers)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        showBestSellers
                          ? "bg-primary text-primary-foreground"
                          : "bg-card/50 text-muted-foreground hover:bg-card border border-border/50"
                      }`}
                    >
                      <Star className={`w-3 h-3 ${showBestSellers ? "fill-primary-foreground" : ""}`} />
                      Best Sellers
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
                        className={`w-full px-4 py-2.5 text-left text-sm hover:bg-secondary/50 transition-colors ${
                          sortBy === option.key ? "text-primary font-medium" : "text-foreground"
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

          {/* Results Count */}
          <p className="text-sm text-muted-foreground mb-6">
            {viewMode === "plans" 
              ? `Showing ${filteredProducts.length} plans`
              : `Showing ${filteredRegions.length} regions`}
          </p>

          {/* Loading State */}
          {(isLoading || isLoadingProducts) && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {/* Plans Grid */}
          {viewMode === "plans" && !isLoading && !isLoadingProducts && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => {
                const name = getProductName(product);
                const data = getProductData(product);
                const validity = getProductValidity(product);
                const speed = getProductSpeed(product);
                const throttle = getProductThrottleSpeed(product);
                const hotspot = isHotspotAllowed(product);
                const instant = hasInstantActivation(product);
                const bestSeller = isBestSeller(product);
                
                return (
                  <div
                    key={product.id}
                    className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:bg-card/50"
                  >
                    {bestSeller && (
                      <div className="absolute top-3 right-3 z-10">
                        <Badge className="bg-primary/20 text-primary border-primary/30">
                          <Star className="w-3 h-3 mr-1 fill-primary" />
                          Best Seller
                        </Badge>
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-center gap-3 mb-4">
                        {product.flag_url || product.country?.flag_url ? (
                          <img 
                            src={product.flag_url || product.country?.flag_url} 
                            alt={name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <span className="text-3xl">🌍</span>
                        )}
                        <div>
                          <h3 className="font-semibold text-foreground">{name}</h3>
                          <p className="text-2xl font-bold text-primary">{data}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 flex-shrink-0" />
                          <span>{validity}</span>
                        </div>
                        {speed && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Signal className="w-4 h-4 flex-shrink-0" />
                            <span>{speed}</span>
                          </div>
                        )}
                        {throttle && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Wifi className="w-4 h-4 flex-shrink-0" />
                            <span>{throttle}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Feature badges */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {hotspot && (
                          <span className="px-2 py-0.5 text-[10px] font-medium bg-emerald-500/10 text-emerald-500 rounded-full">Hotspot</span>
                        )}
                        {instant && (
                          <span className="px-2 py-0.5 text-[10px] font-medium bg-blue-500/10 text-blue-500 rounded-full">Instant</span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-border/30">
                        <span className="text-2xl font-bold text-foreground">EUR {product.price}</span>
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
                  </div>
                );
              })}
            </div>
          )}

          {/* Regions Grid */}
          {viewMode === "regions" && !isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredRegions.map((region, index) => {
                const regionName = getLocalizedText(region.name, "Region");
                const countryCount = region.countries_count || 0;
                const startingPrice = region.starting_price || 0;
                const regionCountries = region.countries || [];
                
                return (
                  <button
                    key={region.id}
                    className={`group relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br ${gradients[index % 4]} backdrop-blur-sm ${borderColors[index % 4]} p-6 text-left transition-all duration-300 hover:scale-[1.02]`}
                    onClick={() => { 
                      setViewMode("plans"); 
                      setSelectedRegionId(region.id); 
                    }}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-5xl">{region.icon || "🌍"}</span>
                      <div>
                        <h3 className="text-lg font-bold text-foreground">{regionName}</h3>
                        {countryCount > 0 && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                            <MapPin className="w-3 h-3" />
                            <span>{countryCount} countries</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Country flags with codes */}
                    {regionCountries.length > 0 && (
                      <div className="flex flex-wrap gap-2.5 mb-4">
                        {regionCountries.slice(0, 6).map((country) => {
                          const cName = getLocalizedText(country.name, "");
                          const cCode = country.iso_code || cName.substring(0, 2).toUpperCase();
                          return (
                            <div key={cName} className="flex flex-col items-center gap-0.5">
                              <span className="text-[9px] text-muted-foreground/80 font-medium uppercase leading-none">{cCode}</span>
                              {country.flag_url ? (
                                <img src={country.flag_url} alt={cName} className="w-6 h-4 rounded-sm object-cover" />
                              ) : (
                                <span className="text-sm leading-none">🏳️</span>
                              )}
                            </div>
                          );
                        })}
                        {regionCountries.length > 6 && (
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="text-[9px] text-muted-foreground/60 font-medium leading-none">+{regionCountries.length - 6}</span>
                            <span className="text-sm text-muted-foreground/60 leading-none">...</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-end justify-between">
                      <div>
                        {startingPrice > 0 && (
                          <>
                            <span className="text-xs text-muted-foreground">From</span>
                            <p className="text-2xl font-bold text-primary">EUR {startingPrice.toFixed(2)}</p>
                          </>
                        )}
                      </div>
                      <span className="text-sm text-primary font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        View Plans <ArrowRight className="w-4 h-4" />
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
              <h3 className="text-xl font-semibold text-foreground mb-2">No results found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
