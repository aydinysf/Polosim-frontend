"use client";

import { useState, useEffect } from "react";
import { Signal, Clock, ShoppingCart, Star, ArrowUpDown, ChevronDown, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslations, useLocale } from "next-intl";
import { productService, type Product } from "@/lib/services/productService";
import { useCart } from "@/lib/cart-context";
import { getLocalizedText, getProductData, getProductValidity, getProductSpeed, isBestSeller, getProductName } from "@/lib/product-helpers";
import { getImageUrl, getFlagFromISO } from "@/lib/api-client";
import { Link } from "@/i18n/routing";

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
    <section className="py-[72px] px-[5%] bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-6">
          <div className="text-center md:text-left">
            <div className="inline-block bg-[rgba(201,168,76,0.15)] text-[var(--gold)] border border-[rgba(201,168,76,0.3)] rounded-full px-4 py-1.5 text-[12px] font-bold tracking-[0.5px] uppercase mb-4">
              {t('labels.bestSeller')}
            </div>
            <h2 className="text-[32px] font-extrabold text-[var(--text-dark)] leading-tight">
              {tc('hotspot')} {t('labels.dataPlan')}
            </h2>
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
              {[
                { key: "all", label: t('filters.all') },
                { key: "bestSeller", label: t('filters.bestSellers') },
                { key: "europe", label: "Europe" },
                { key: "asia", label: "Asia" },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setFilter(item.key as any)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === item.key
                      ? "bg-[var(--gold)] text-white shadow-lg"
                      : "bg-[var(--gray-bg)] text-[var(--gray-text)] hover:bg-[var(--gray-mid)] border border-transparent"
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="relative min-w-[160px]">
              <button
                onClick={() => setSortMenuOpen(!sortMenuOpen)}
                onBlur={() => setTimeout(() => setSortMenuOpen(false), 150)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-[var(--gray-bg)] text-[var(--gray-text)] hover:bg-[var(--gray-mid)] border border-transparent transition-all w-full justify-between"
              >
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4" />
                  <span className="truncate">{sortOptions.find((opt) => opt.key === sortBy)?.label}</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform shrink-0 ${sortMenuOpen ? "rotate-180" : ""}`} />
              </button>
              {sortMenuOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[var(--gray-mid)] rounded-xl shadow-xl overflow-hidden z-50">
                  {sortOptions.map((option) => (
                    <button
                      key={option.key}
                      onClick={() => {
                        setSortBy(option.key);
                        setSortMenuOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-[var(--gray-bg)] transition-colors ${sortBy === option.key ? "text-[var(--gold)] font-bold" : "text-[var(--text-dark)]"
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
            <Loader2 className="w-8 h-8 animate-spin text-[var(--gold)]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredPlans.map((plan) => {
              const name = getProductName(plan, locale);
              const data = getProductData(plan);
              const validity = getProductValidity(plan, t);
              const speed = getProductSpeed(plan);
              const bestSeller = isBestSeller(plan);

              return (
                <div
                  key={plan.id}
                  className="group relative overflow-hidden rounded-2xl border-[1.5px] border-[var(--gray-mid)] bg-white transition-all duration-200 hover:border-[var(--gold)] hover:translate-y-[-2px] hover:shadow-md cursor-pointer"
                >
                  {bestSeller && (
                    <div className="absolute top-3 right-3 z-10">
                      <Badge className="bg-[rgba(201,168,76,0.15)] text-[var(--gold)] border border-[rgba(201,168,76,0.3)] hover:bg-[rgba(201,168,76,0.2)]">
                        <Star className="w-3 h-3 mr-1 fill-[var(--gold)]" />
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
                        <h3 className="font-bold text-[var(--text-dark)] truncate max-w-[150px] leading-tight">{name}</h3>
                        <p className="text-2xl font-extrabold text-[var(--gold)] tracking-tight">{data}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-5">
                      <div className="flex items-center gap-2 text-sm text-[var(--gray-text)] font-medium">
                        <Clock className="w-4 h-4 text-[var(--gold)]" />
                        <span>{validity}</span>
                      </div>
                      {speed && (
                        <div className="flex items-center gap-2 text-sm text-[var(--gray-text)] font-medium">
                          <Signal className="w-4 h-4 text-[var(--gold)]" />
                          <span>{speed}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-[var(--gray-mid)]">
                      <div>
                        <span className="text-2xl font-extrabold text-[var(--text-dark)]">€{plan.price}</span>
                      </div>
                      <Button
                        size="sm"
                        className={`rounded-xl px-5 h-10 font-bold transition-all shadow-sm ${addedToCart === plan.id ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-[var(--gold)] hover:bg-[var(--gold-light)] text-white"}`}
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
          <Link 
            href="/plans"
            className="inline-flex items-center px-8 py-3 border-[1.5px] border-[var(--gray-mid)] rounded-3xl bg-white text-[var(--text-dark)] font-['Sora'] font-bold text-[15px] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-all no-underline"
          >
            {th('viewAllDestinations')}
          </Link>
        </div>
      </div>
    </section>
  );
}
