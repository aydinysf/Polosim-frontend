import re

with open("app/[locale]/plans/page.tsx", "r") as f:
    content = f.read()

# 1. Add SlidersHorizontal to lucide-react imports
content = re.sub(
    r'import \{ ([^}]+) \} from "lucide-react";',
    r'import { \1, SlidersHorizontal } from "lucide-react";',
    content
)

# 2. Make Filter Bar sticky and update Filter Button
filter_pattern = r'<div className="flex flex-col gap-6 mb-8">\s*\{/\* Main Filter Bar \*/\}\s*<div className="bg-white rounded-2xl border border-\[var\(--gray-mid\)\] shadow-sm p-5">'
filter_replacement = """<div className="flex flex-col gap-6 mb-8 sticky top-[160px] z-40">
            {/* Main Filter Bar */}
            <div className="bg-[#F5F7FA]/95 backdrop-blur-md rounded-2xl border border-[var(--gray-mid)] shadow-sm p-4 sm:p-5">"""
content = re.sub(filter_pattern, filter_replacement, content)

filter_btn_pattern = r'''<button
                    onClick=\{.*?\}
                    className=\{`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all \$\{
                      showFilters 
                        \? 'bg-\[var\(--gold\)\] text-white' 
                        : 'bg-white border border-\[var\(--gold\)\] text-\[var\(--gold\)\] hover:bg-\[var\(--gold\)\]/10'
                    \}`\}
                  >
                    <Filter className="w-4 h-4" />
                    \{t\('filters.title'\)\}'''
filter_btn_replacement = """<button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      showFilters 
                        ? 'bg-[var(--gold)] text-white' 
                        : 'bg-white border border-[var(--gray-mid)] text-[var(--navy)] hover:border-[var(--gold)] hover:text-[var(--gold)] shadow-sm'
                    }`}
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    {t('labels.advancedSearch')}"""
content = re.sub(filter_btn_pattern, filter_btn_replacement, content)

# 3. Update Plans Grid (compact horizontal)
plans_grid_pattern = r'<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 gap-y-12 pt-8">.*?</div>\s*</div>\s*</div>\s*\)}'
plans_grid_replacement = """<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {paginatedProducts.map((product) => {
                    const name = getProductName(product, locale);
                    const data = getProductData(product);
                    const validity = getProductValidity(product, t);
                    const speed = getProductSpeed(product);
                    
                    const raw = product.country?.image_url || product.image_url || product.flag_url || product.country?.flag_url;
                    const isPath = raw && (raw.includes('.') || raw.includes('/'));
                    const url = isPath ? getImageUrl(raw) : getFlagFromISO(product.country?.iso_code);

                    return (
                      <div
                        key={product.id}
                        onClick={() => {}}
                        className="bg-white rounded-2xl border border-[var(--gray-mid)] px-6 py-4 flex items-center justify-between hover:border-[var(--gold)] transition-colors shadow-sm cursor-pointer"
                      >
                        <div className="flex flex-col gap-1">
                           <div className="flex items-center gap-2">
                             {url ? (
                               <img src={url} alt={name} className="w-5 h-5 rounded-full object-cover" />
                             ) : (
                               <Globe className="w-5 h-5 text-[var(--gray-text)]" />
                             )}
                             <span className="text-xs font-semibold text-[var(--gray-text)] uppercase tracking-wider truncate max-w-[120px]" title={name}>{name}</span>
                           </div>
                           <div className="flex items-center gap-3">
                              <span className="text-lg sm:text-xl font-extrabold text-[var(--navy)]">{data}</span>
                              <span className="text-sm font-medium text-[var(--gray-text)]">{validity}</span>
                           </div>
                        </div>
                        
                        <div className="flex items-center gap-4 shrink-0">
                           <span className="text-lg sm:text-xl font-extrabold text-[var(--navy)] tracking-tight">
                              €{product.price?.toFixed(2) || '0.00'}
                           </span>
                           <button
                             onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                             className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                               addedToCart === product.id
                                 ? "bg-green-500 border-green-500 text-white"
                                 : "bg-white border-[var(--gray-mid)] text-transparent hover:border-[var(--gold)] hover:text-[var(--gold)]"
                             }`}
                           >
                             {addedToCart === product.id ? (
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
              </div>
            </div>
          )}"""
content = re.sub(plans_grid_pattern, plans_grid_replacement, content, flags=re.DOTALL)

# 4. Update Regions Grid (compact horizontal)
regions_grid_pattern = r'<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 gap-y-12 pt-8">\s*\{filteredRegions\.map\(\(region\) => \{.*?</button>\s*\);\s*\}\)\}\s*</div>'
regions_grid_replacement = """<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                    className="bg-white rounded-2xl border border-[var(--gray-mid)] px-4 py-4 sm:px-6 flex items-center justify-between hover:border-[var(--gold)] transition-colors shadow-sm text-left w-full"
                    onClick={() => {
                      setViewMode("plans");
                      setSelectedRegionId(region.id);
                    }}
                  >
                    <div className="flex items-center gap-4">
                      {url ? (
                         <img src={url} alt={regionName} className="w-10 h-10 rounded-full object-cover shrink-0" />
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
                         <span className="text-[10px] text-[var(--gray-text)] uppercase font-semibold">{t('labels.from', 'Başlangıç')}</span>
                         <span className="text-lg font-extrabold text-[var(--navy)] tracking-tight">€{startingPrice.toFixed(2)}</span>
                      </div>
                      <span className="bg-[var(--navy)] text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-[var(--navy-mid)] transition-colors shrink-0">
                        {t('cta.explore', 'İncele')}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>"""
content = re.sub(regions_grid_pattern, regions_grid_replacement, content, flags=re.DOTALL)

with open("app/[locale]/plans/page.tsx", "w") as f:
    f.write(content)
print("Done")
