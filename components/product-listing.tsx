"use client";

import { useState, useEffect } from "react";
import { Signal, Clock, ShoppingCart, Star, ArrowUpDown, ChevronDown, Loader2, Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslations, useLocale } from "next-intl";
import { productService, type Product } from "@/lib/services/productService";
import { useCart } from "@/lib/cart-context";
import { getLocalizedText, getProductData, getProductValidity, getProductSpeed, isBestSeller, getProductName } from "@/lib/product-helpers";
import { getImageUrl, getFlagFromISO } from "@/lib/api-client";

type SortOption = "popular" | "price-low" | "price-high" | "data-high" | "name-az";

export function ProductListing() {
  const t = useTranslations('Plans');
  const th = useTranslations('Hero');
  const tc = useTranslations('Common');
  const locale = useLocale();
  const { addItem } = useCart();
  
  const [filter, setFilter] = useState<"all" | "bestSeller" | "europe" | "asia">("all");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState<number | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setIsLoading(true);
        const data = await productService.fetchAll();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const sortOptions: { key: SortOption; label: string }[] = [
    { key: "popular", label: t('sort.popular') },
    { key: "price-low", label: t('sort.priceLow') },
    { key: "price-high", label: t('sort.priceHigh') },
    { key: "data-high", label: t('sort.dataHigh') },
    { key: "name-az", label: t('sort.nameAz') },
  ];

  const handleAddToCart = (product: Product) => {
    const name = getProductName(product, locale);
    const data = getProductData(product);
    const validity = getProductValidity(product);
    const speed = getProductSpeed(product);

    addItem({
      id: product.id,
      name,
      description: getLocalizedText(product.description, "", locale) || `${data} Data Plan`,
      priceInCents: Math.round((product.price || 0) * 100),
      flag: product.flag_url || product.country?.flag_url || "",
      data,
      validity,
      speed: speed || "4G/LTE",
      region: getLocalizedText(product.region_name, "", locale),
    });
    setAddedToCart(product.id);
    setTimeout(() => setAddedToCart(null), 2000);
  };

  const filteredPlans = products
    .filter((product) => {
      if (filter === "all") return true;
      if (filter === "bestSeller") return isBestSeller(product);
      const regionName = getLocalizedText(product.region_name || product.region?.name, "").toLowerCase();
      if (filter === "europe") return regionName.includes("europe") || regionName.includes("turkey");
      if (filter === "asia") return regionName.includes("asia");
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return (a.price || 0) - (b.price || 0);
        case "price-high":
          return (b.price || 0) - (a.price || 0);
        case "data-high":
          const aData = parseInt(getProductData(a)) || 0;
          const bData = parseInt(getProductData(b)) || 0;
          return bData - aData;
        case "name-az":
          return getProductName(a, locale).localeCompare(getProductName(b, locale));
        case "popular":
        default:
          return (isBestSeller(b) ? 1 : 0) - (isBestSeller(a) ? 1 : 0);
      }
    });

  return (
    <section className="py-16 sm:py-24 px-4 bg-gray-400">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 sm:mb-12 gap-4 sm:gap-6">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4 text-foreground">
              {tc('hotspot')} {t('labels.dataPlan')}
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg">
              {t('hero.plansDescription')}
            </p>
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-col gap-3 sm:gap-4 w-full md:w-auto">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {[
                { key: "all", label: t('filters.all') },
                { key: "bestSeller", label: t('filters.bestSellers') },
                { key: "europe", label: "Europe" },
                { key: "asia", label: "Asia" },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setFilter(item.key as any)}
                  className={`flex-shrink-0 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${filter === item.key
                      ? "bg-primary text-primary-foreground"
                      : "bg-card/50 text-muted-foreground hover:bg-card border border-border/50"
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <button
                onClick={() => setSortMenuOpen(!sortMenuOpen)}
                onBlur={() => setTimeout(() => setSortMenuOpen(false), 150)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium bg-card/50 text-muted-foreground hover:bg-card border border-border/50 transition-all w-full sm:w-auto justify-between sm:justify-start"
              >
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4" />
                  <span className="truncate">{sortOptions.find((opt) => opt.key === sortBy)?.label}</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform shrink-0 ${sortMenuOpen ? "rotate-180" : ""}`} />
              </button>
              {sortMenuOpen && (
                <div className="absolute top-full left-0 sm:right-0 sm:left-auto mt-2 bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl overflow-hidden z-50 min-w-[180px] w-full sm:w-auto">
                  {sortOptions.map((option) => (
                    <button
                      key={option.key}
                      onClick={() => {
                        setSortBy(option.key);
                        setSortMenuOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-xs sm:text-sm hover:bg-secondary/50 transition-colors ${sortBy === option.key ? "text-primary font-medium" : "text-foreground"
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

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredPlans.map((plan) => {
              const name = getProductName(plan, locale);
              const data = getProductData(plan);
              const validity = getProductValidity(plan, t);
              const speed = getProductSpeed(plan);
              const bestSeller = isBestSeller(plan);

              return (
                <div
                  key={plan.id}
                  className="group relative overflow-hidden rounded-2xl border border-border/50 bg-gray-50/80 dark:bg-gray-900/30 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:bg-gray-100/80 dark:hover:bg-card/50"
                >
                  {bestSeller && (
                    <div className="absolute top-3 right-3 z-10">
                      <Badge className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/30">
                        <Star className="w-3 h-3 mr-1 fill-primary" />
                        {t('labels.bestSeller')}
                      </Badge>
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      {(() => {
                        const raw = plan.country?.flag_url || plan.flag_url || plan.country?.iso_code;
                        const isPath = raw && (raw.includes('.') || raw.includes('/'));
                        const url = isPath ? getImageUrl(raw) : getFlagFromISO(plan.country?.iso_code || plan.flag_url);
                        if (!url) return <span className="text-3xl">🌍</span>;
                        return <img src={url} alt={name} className="w-10 h-7 rounded object-cover" />;
                      })()}
                      <div>
                        <h3 className="font-semibold text-foreground truncate max-w-[150px]">{name}</h3>
                        <p className="text-2xl font-bold text-primary">{data}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-5">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{validity}</span>
                      </div>
                      {speed && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Signal className="w-4 h-4" />
                          <span>{speed}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border/30">
                      <div>
                        <span className="text-2xl font-bold text-foreground">€{plan.price}</span>
                      </div>
                      <Button
                        size="sm"
                        className={`transition-all ${addedToCart === plan.id ? "bg-emerald-500 hover:bg-emerald-500" : "bg-primary hover:bg-primary/90"} text-primary-foreground`}
                        onClick={() => handleAddToCart(plan)}
                      >
                        {addedToCart === plan.id ? (
                          <><Check className="w-4 h-4 mr-2" />{tc('added')}</>
                        ) : (
                          <><ShoppingCart className="w-4 h-4 mr-2" />{t('cta.buy')}</>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="border-border/50 hover:border-primary hover:bg-primary/10 text-foreground bg-transparent" onClick={() => window.location.href = '/plans'}>
            {th('viewAllDestinations')}
          </Button>
        </div>
      </div>
    </section>
  );
}
