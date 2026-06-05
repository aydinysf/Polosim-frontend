"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { regionService, type Region } from "@/lib/services/regionService";
import { productService, type Product } from "@/lib/services/productService";
import { getLocalizedText, getProductData, getProductValidity, getProductSpeed, isBestSeller, getProductName } from "@/lib/product-helpers";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SearchHeader } from "@/components/search-header";
import { Loader2, ShoppingCart, Check, ChevronLeft, ChevronRight, Globe, ArrowUpDown, ChevronDown, SlidersHorizontal } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { getImageUrl, getFlagFromISO } from "@/lib/api-client";

const dataFilterOptions = [
  { label: "1GB", value: "1GB" },
  { label: "2GB", value: "2GB" },
  { label: "3GB", value: "3GB" },
  { label: "5GB", value: "5GB" },
  { label: "10GB", value: "10GB" },
  { label: "20GB", value: "20GB" },
  { label: "30GB", value: "30GB" },
  { label: "50GB", value: "50GB" },
  { label: "Unlimited", value: "Unlimited" },
];

export default function RegionPage() {
  const params = useParams();
  const id = params.id as string;
  const locale = useLocale();
  const t = useTranslations('Plans');
  const tc = useTranslations('Common');
  const th = useTranslations('Hero');
  const { items, addItem, removeItem } = useCart();

  const [region, setRegion] = useState<Region | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters and Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [filterData, setFilterData] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("popular");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const sortOptions = [
    { key: "popular", label: t('sort.popular') },
    { key: "price_asc", label: t('sort.priceLow') },
    { key: "price_desc", label: t('sort.priceHigh') },
    { key: "name_asc", label: t('sort.nameAz') },
  ];

  useEffect(() => {
    if (!id) return;
    
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        let regionData: Region;
        const cleanSlug = id.toLowerCase().replace(/-\d+$/, '');
        
        if (isNaN(Number(cleanSlug))) {
          // If it is a string slug, fetch all regions and match by slug
          const allRegs = await regionService.getAll();
          const matched = allRegs.find(r => r.slug === cleanSlug);
          if (matched) {
            regionData = await regionService.getById(matched.id);
          } else {
            // Fallback: try by slug or default to first region if none found
            try {
              regionData = await regionService.getBySlug(cleanSlug);
            } catch {
              if (allRegs.length > 0) {
                regionData = await regionService.getById(allRegs[0].id);
              } else {
                throw new Error("Region not found");
              }
            }
          }
        } else {
          regionData = await regionService.getById(Number(cleanSlug));
        }

        const actualRegion = (regionData as any).data || regionData;
        setRegion(actualRegion);
        
        // Fetch all products for the region up to 100 to filter locally
        const productsData = await productService.getAll({
          region_id: actualRegion.id,
          per_page: 100,
        });
        setAllProducts(productsData.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to load region data");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [id]);

  // Frontend Filtering and Sorting
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...allProducts];

    const parseDataAmount = (dataStr: string): number => {
      if (!dataStr) return 0;
      const lower = dataStr.toLowerCase().replace(/\s/g, "");
      if (lower.includes("unlimited")) return 999999999;
      const num = parseFloat(lower);
      if (isNaN(num)) return 0;
      if (lower.includes("gb")) return num * 1024;
      if (lower.includes("mb")) return num;
      return num;
    };

    if (filterData) {
      result = result.filter(p => {
        const data = getProductData(p);
        if (filterData === 'Unlimited') return data.toLowerCase() === 'unlimited';
        return data.includes(filterData);
      });
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "price_asc": return (a.price || 0) - (b.price || 0);
        case "price_desc": return (b.price || 0) - (a.price || 0);
        case "name_asc": return getProductName(a, locale).localeCompare(getProductName(b, locale));
        case "popular":
        default: return (parseDataAmount(getProductData(a)) - parseDataAmount(getProductData(b))) || ((a.price || 0) - (b.price || 0));
      }
    });

    return result;
  }, [allProducts, filterData, sortBy, locale]);

  // Pagination
  const pageSize = 10;
  const totalPages = Math.ceil(filteredAndSortedProducts.length / pageSize) || 1;
  const paginatedProducts = filteredAndSortedProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const handleToggleCart = (product: Product) => {
    const isItemInCart = items.some(item => item.id === product.id);
    if (isItemInCart) {
      removeItem(product.id);
    } else {
      const name = getProductName(product, locale);
      const data = getProductData(product);
      const validity = getProductValidity(product, t);
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
        region: getLocalizedText(product.region_name || product.region?.name, "", locale) || (region ? getLocalizedText(region.name, "", locale) : ""),
      });
    }
  };

  const regionName = region ? getLocalizedText(region.name, "", locale) : "Loading...";
  
  const regionIconUrl = region?.icon || region?.image_url 
    ? getImageUrl(region.image_url || region.icon) 
    : null;

  return (
    <main className="min-h-screen bg-[#F5F7FA]">
      <Navbar />
      
      <SearchHeader 
        title={regionName} 
        subtitle={region?.countries ? t('results.regionsCount', { count: region.countries.length }) : ""}
        icon={regionIconUrl ? (
          <img src={regionIconUrl} alt={regionName} className="w-full h-full object-cover rounded-full" />
        ) : (
          <Globe className="w-8 h-8 text-white/80" />
        )}
      />

      <section className="pb-24 px-4 pt-12">
        <div className="max-w-7xl mx-auto">
          
          {isLoading && !region && (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--gold)]" />
            </div>
          )}

          {error && (
            <div className="text-center py-20 text-red-500">
              <p>{error}</p>
            </div>
          )}

          <div className="mb-12 sticky top-[160px] z-40 bg-[#F5F7FA]/95 backdrop-blur-md pt-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pt-6 sm:border-none border-b border-[var(--gray-mid)]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[var(--navy)]">
                {region?.countries && region.countries.length > 0 
                  ? t('labels.regionCountries', { region: regionName, count: region.countries.length })
                  : regionName
                }
              </h3>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${showFilters ? 'bg-[var(--gold)] text-white' : 'bg-white border border-[var(--gray-mid)] text-[var(--navy)] hover:border-[var(--gold)] hover:text-[var(--gold)] shadow-sm'}`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                {t('labels.advancedSearch')}
              </button>
            </div>

            {region && region.countries && region.countries.length > 0 && (
              <div className="mb-2">
                <div className="flex flex-wrap gap-3 max-h-[140px] overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--gray-mid)] scrollbar-track-transparent pr-2 pb-2">
                  {region.countries.map(country => (
                    <div key={country.id} className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-[var(--gray-mid)] shadow-sm hover:border-[var(--gold)] transition-colors cursor-default">
                      {country.flag_url ? (
                        <img src={getImageUrl(country.flag_url)} alt={getLocalizedText(country.name, "", locale)} className="w-7 h-5 object-cover flag-wave" />
                      ) : country.iso_code ? (
                        <img src={getFlagFromISO(country.iso_code)!} alt={getLocalizedText(country.name, "", locale)} className="w-7 h-5 object-cover flag-wave" />
                      ) : (
                        <Globe className="w-5 h-5 text-[var(--gray-text)]" />
                      )}
                      <span className="text-sm font-medium text-[var(--navy)]">{getLocalizedText(country.name, "", locale)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Filters & Sorting Area (Expandable) */}
            {showFilters && (
              <div className="mt-4 mb-2 p-4 sm:p-6 bg-white rounded-2xl shadow-sm border border-[var(--gray-mid)]">
                 <div className="flex flex-col lg:flex-row gap-6 justify-between lg:items-center">
                    <div className="flex flex-col sm:flex-row gap-6">
                       {/* Data Filter */}
                       <div className="space-y-2">
                          <label className="text-xs font-semibold text-[var(--gray-text)] uppercase tracking-wider">{t('filters.dataAmount')}</label>
                          <div className="flex flex-wrap gap-2">
                             <button
                               onClick={() => { setFilterData(null); setCurrentPage(1); }}
                               className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                 !filterData ? 'bg-[var(--gold)] text-white shadow-sm' : 'bg-[#F5F7FA] text-[var(--navy)] hover:bg-[var(--gray-mid)] border border-[var(--gray-mid)]'
                               }`}
                             >
                               {t('filters.any')}
                             </button>
                             {dataFilterOptions.map(opt => (
                               <button
                                 key={opt.value}
                                 onClick={() => { setFilterData(filterData === opt.value ? null : opt.value); setCurrentPage(1); }}
                                 className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                   filterData === opt.value ? 'bg-[var(--gold)] text-white shadow-sm' : 'bg-[#F5F7FA] text-[var(--navy)] hover:bg-[var(--gray-mid)] border border-[var(--gray-mid)]'
                                 }`}
                               >
                                 {opt.label}
                               </button>
                             ))}
                          </div>
                       </div>
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative flex-shrink-0 self-start lg:self-center">
                      <label className="text-xs font-semibold text-[var(--gray-text)] uppercase tracking-wider mb-2 block lg:hidden">Sort By</label>
                      <button
                        onClick={() => setSortMenuOpen(!sortMenuOpen)}
                        onBlur={() => setTimeout(() => setSortMenuOpen(false), 150)}
                        className="inline-flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-[#F5F7FA] border border-[var(--gray-mid)] text-[var(--navy)] hover:border-[var(--gold)] transition-all min-w-[200px]"
                      >
                        <div className="flex items-center gap-2">
                          <ArrowUpDown className="w-4 h-4 text-[var(--gold)]" />
                          {sortOptions.find((opt) => opt.key === sortBy)?.label}
                        </div>
                        <ChevronDown className={`w-4 h-4 text-[var(--gray-text)] transition-transform ${sortMenuOpen ? "rotate-180" : ""}`} />
                      </button>
                      {sortMenuOpen && (
                        <div className="absolute top-full right-0 mt-2 bg-white border border-[var(--gray-mid)] rounded-xl shadow-lg overflow-hidden z-50 min-w-[220px]">
                          {sortOptions.map((option) => (
                            <button
                              key={option.key}
                              onClick={() => { setSortBy(option.key); setCurrentPage(1); setSortMenuOpen(false); }}
                              className={`w-full px-4 py-3 text-left text-sm hover:bg-[#F5F7FA] transition-colors ${
                                sortBy === option.key ? "text-[var(--gold)] font-semibold" : "text-[var(--navy)]"
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
            )}
          </div>


          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-bold text-[var(--navy)]">{th('plansAvailable')}</h3>
             <span className="text-sm text-[var(--gray-text)]">{t('results.plansCount', { count: filteredAndSortedProducts.length })}</span>
          </div>

          {isLoading && allProducts.length === 0 ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--gold)]" />
            </div>
          ) : filteredAndSortedProducts.length > 0 ? (
            <div>
              {/* Product List Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredAndSortedProducts.map((product) => {
                  const data = getProductData(product);
                  const validity = getProductValidity(product, t);

                  const isItemInCart = items.some(item => item.id === product.id);

                  return (
                    <div
                      key={product.id}
                      onClick={() => handleToggleCart(product)}
                      className={`bg-[var(--navy-light)] rounded-2xl border px-6 py-4 flex items-center justify-between transition-all shadow-sm cursor-pointer ${
                        isItemInCart
                          ? "border-[var(--gold)]"
                          : "border-transparent hover:border-[var(--gold)]"
                      }`}
                    >
                      <div className="flex flex-col gap-1">
                         <div className="flex items-center gap-2">
                           {regionIconUrl ? (
                             <img src={regionIconUrl} alt={regionName} className="w-7 h-5 object-cover flag-wave" />
                           ) : (
                             <Globe className="w-5 h-5 text-white/90" />
                           )}
                           <span className="text-xs font-semibold text-white/90 uppercase tracking-wider truncate max-w-[150px]" title={regionName}>
                             {regionName}
                           </span>
                         </div>
                         <div className="flex items-center gap-3">
                            <span className="text-sm font-extrabold text-white flex items-baseline">
                              {data.toLowerCase().includes('unlimited') || isNaN(parseFloat(data))
                                ? data
                                : Math.floor(parseFloat(data.replace(/GB/g, '').replace(/MB/g, '')) || 0)}
                              {!(data.toLowerCase().includes('unlimited') || isNaN(parseFloat(data))) && (
                                <span className="text-sm font-extrabold text-white ml-1">
                                  {data.includes('GB') ? 'GB' : data.includes('MB') ? 'MB' : ''}
                                </span>
                              )}
                            </span>
                            <span className="text-sm font-medium text-white/90">{validity}</span>
                         </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                         <span className="text-sm font-extrabold text-white tracking-tight">
                            €{product.price?.toFixed(2) || '0.00'}
                         </span>
                         <button
                           onClick={(e) => { e.stopPropagation(); handleToggleCart(product); }}
                           className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                             isItemInCart
                               ? "bg-[var(--gold)] border-[var(--gold)] text-white"
                               : "bg-white/20 border-white text-transparent hover:border-[var(--gold)] hover:text-[var(--gold)]"
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

              {/* Pagination removed */}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-[var(--gray-mid)] shadow-sm">
              <h4 className="text-xl font-bold text-[var(--navy)] mb-2">{t('empty.title')}</h4>
              <p className="text-[var(--gray-text)]">{t('empty.description')}</p>
            </div>
          )}



        </div>
      </section>

      <Footer />
    </main>
  );
}
