import type { Product } from "./services/productService";

export function getLocalizedText(value: unknown, fallback = "", locale?: string): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const obj = value as Record<string, string>;
    if (locale && obj[locale]) return obj[locale];
    return obj.en || obj.tr || Object.values(obj)[0] || fallback;
  }
  return fallback;
}

// Helper to extract product data from various API field names (including nested features)
export function getProductData(product: Product): string {
  const features = product.features as Record<string, unknown> | undefined;
  if (features?.data_label) return String(features.data_label);
  if (features?.data_raw_mb) return `${features.data_raw_mb} MB`;
  return product.data_amount || product.data || product.dataAmount || "N/A";
}

// Helper to extract validity from various API field names (including nested features)
export function getProductValidity(product: Product): string {
  const features = product.features as Record<string, unknown> | undefined;
  if (features?.duration_days) return `${features.duration_days} Days`;
  if (product.validity) {
    if (typeof product.validity === "string") return product.validity;
    if (typeof product.validity === "number") return `${product.validity} Days`;
  }
  if (product.validity_days) return `${product.validity_days} Days`;
  if (product.validityDays) return `${product.validityDays} Days`;
  if (product.day) return `${product.day} Days`;
  if (product.days) return `${product.days} Days`;
  return "N/A";
}

// Helper to extract speed from various API field names (including nested features)
export function getProductSpeed(product: Product): string | undefined {
  const features = product.features as Record<string, unknown> | undefined;
  if (features?.speed) return String(features.speed);
  if (features?.network_type) return String(features.network_type);
  return product.speed || product.network || product.network_type;
}

// Helper to extract throttle speed
export function getProductThrottleSpeed(product: Product): string | undefined {
  const features = product.features as Record<string, unknown> | undefined;
  if (features?.throttle_speed) return String(features.throttle_speed);
  return product.throttle_speed || product.throttleSpeed;
}

// Helper to check if hotspot is allowed (including nested features)
export function isHotspotAllowed(product: Product): boolean {
  const features = product.features as Record<string, unknown> | undefined;
  if (features?.allow_hotspot === true) return true;
  return product.hotspot === true || product.hotspot_allowed === true;
}

// Helper to check instant activation
export function hasInstantActivation(product: Product): boolean {
  const features = product.features as Record<string, unknown> | undefined;
  if (features?.instant_activation === true) return true;
  return product.instant_activation === true || product.instantActivation === true;
}

// Helper to check best seller status
export function isBestSeller(product: Product): boolean {
  return product.is_best_seller === true || product.isBestSeller === true || product.is_featured === true;
}

// Helper to get product name
export function getProductName(product: Product, locale?: string): string {
  return getLocalizedText(product.country_name, "", locale) || 
         getLocalizedText(product.country?.name, "", locale) || 
         getLocalizedText(product.region?.name, "", locale) ||
         getLocalizedText(product.name, "", locale) || 
         "eSIM Plan";
}

// Helper to get coverage area
export function getCoverageArea(product: Product): string | undefined {
  const features = product.features as Record<string, unknown> | undefined;
  if (features?.coverage_area) return String(features.coverage_area);
  return undefined;
}
