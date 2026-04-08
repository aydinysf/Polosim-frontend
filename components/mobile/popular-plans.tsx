"use client";

import { useState, useEffect } from "react";
import { ChevronRight, Star, Loader2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { productService, type Product } from "@/lib/services/productService";
import { getLocalizedText, getProductData, getProductValidity, isBestSeller, getProductName } from "@/lib/product-helpers";
import { getImageUrl, getFlagFromISO } from "@/lib/api-client";
import { useCart } from "@/lib/cart-context";

export function PopularPlans() {
  const t = useTranslations('Hero');
  const tp = useTranslations('Plans');
  const locale = useLocale();
  const { addItem } = useCart();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPopular() {
      try {
        setIsLoading(true);
        const data = await productService.fetchAll();
        // Filter best sellers or just take top 6
        const popular = data.filter(isBestSeller).slice(0, 6);
        setProducts(popular.length > 0 ? popular : data.slice(0, 6));
      } catch (error) {
        console.error("Failed to fetch popular plans:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPopular();
  }, []);

  const handleAddToCart = (product: Product) => {
    const name = getProductName(product, locale);
    const data = getProductData(product);
    const validity = getProductValidity(product);

    addItem({
      id: product.id,
      name,
      description: getLocalizedText(product.description, "", locale) || `${data} Data Plan`,
      priceInCents: Math.round((product.price || 0) * 100),
      flag: product.flag_url || product.country?.flag_url || "",
      data,
      validity,
      speed: "4G/LTE",
      region: getLocalizedText(product.region_name, "", locale),
    });
    // Redirect to checkout or just show feedback (mobile usually goes to checkout)
    window.location.href = `/${locale}/checkout`;
  };

  if (isLoading) {
    return (
      <div className="py-8 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="py-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="text-base font-semibold text-foreground">{t('popularRegions')}</h2>
        <button 
          className="flex items-center gap-1 text-xs text-primary font-medium"
          onClick={() => window.location.href = `/${locale}/plans`}
        >
          {t('viewAll')}
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Horizontal scroll */}
      <div 
        className="flex gap-3 px-4 overflow-x-auto pb-2 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((plan) => {
          const name = getProductName(plan, locale);
          const data = getProductData(plan);
          const validity = getProductValidity(plan);
          const rating = (4.5 + Math.random() * 0.5).toFixed(1); // Mock rating as API doesn't have it

          return (
            <button
              key={plan.id}
              onClick={() => handleAddToCart(plan)}
              className="flex-shrink-0 w-36 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-sm transition-all text-left"
            >
              {/* Flag & Rating */}
              <div className="flex items-start justify-between mb-2">
                {(() => {
                  const raw = plan.country?.flag_url || plan.flag_url || plan.country?.iso_code;
                  const isPath = raw && (raw.includes('.') || raw.includes('/'));
                  const url = isPath ? getImageUrl(raw) : getFlagFromISO(plan.country?.iso_code || plan.flag_url);
                  if (!url) return <span className="text-2xl">🌍</span>;
                  return <img src={url} alt={name} className="w-8 h-6 rounded object-cover shadow-sm" />;
                })()}
                <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600">
                  <Star className="w-3 h-3 fill-current" />
                  <span className="text-[10px] font-medium">{rating}</span>
                </div>
              </div>

              {/* Info */}
              <p className="text-sm font-semibold text-foreground truncate">{name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{data} / {validity}</p>

              {/* Price */}
              <div className="mt-2 pt-2 border-t border-border/50">
                <span className="text-base font-bold text-primary">€{plan.price}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
