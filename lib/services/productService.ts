import { api } from "../api-client";

// Multilingual field type
type MultiLang = string | { en?: string; tr?: string };

export interface Product {
  id: number;
  name: MultiLang;
  slug?: string;
  title?: MultiLang;
  description?: MultiLang;
  
  // Data amount - various possible field names from API
  data_amount?: string; // e.g., "10GB", "500 MB"
  data?: string;
  dataAmount?: string;
  
  // Validity - various possible field names
  validity_days?: number;
  validity?: string | number; // e.g., "30 Days" or 30
  validityDays?: number;
  day?: number;
  days?: number;
  
  // Speed and network
  speed?: string; // e.g., "4G / 5G", "5G/LTE"
  network?: string;
  network_type?: string;
  
  // After throttle speed
  throttle_speed?: string; // e.g., "128kbps"
  throttleSpeed?: string;
  
  // Price
  price: number;
  original_price?: number;
  currency?: string;
  
  // Features (can be nested object from API)
  hotspot?: boolean;
  hotspot_allowed?: boolean;
  instant_activation?: boolean;
  instantActivation?: boolean;
  is_featured?: boolean;
  features?: {
    data_raw_mb?: number;
    data_label?: string;
    duration_days?: number;
    speed?: string;
    network_type?: string;
    throttle_speed?: string;
    allow_hotspot?: boolean;
    instant_activation?: boolean;
    coverage_area?: string;
  } | string[] | MultiLang[];
  
  // Formatted fields from API
  price_formatted?: string;
  rating?: {
    average: number;
    count: number;
  };
  stock_status?: string;
  
  // Relations
  country_id?: number;
  country_name?: MultiLang;
  region_id?: number;
  region_name?: MultiLang;
  flag_url?: string;
  
  // Flags
  is_best_seller?: boolean;
  is_popular?: boolean;
  isBestSeller?: boolean;
  isPopular?: boolean;
  
  // Nested objects
  country?: {
    id: number;
    name: MultiLang;
    flag_url?: string;
    iso_code?: string;
  };
  region?: {
    id: number;
    name: MultiLang;
    icon?: string;
  };
}

export interface ProductFilters {
  country_id?: number;
  region_id?: number;
  is_best_seller?: boolean;
  min_price?: number;
  max_price?: number;
  sort_by?: "price_asc" | "price_desc" | "popular" | "data_amount";
}

export const productService = {
  async getAll(filters?: ProductFilters): Promise<Product[]> {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.country_id) params.append("country_id", filters.country_id.toString());
      if (filters.region_id) params.append("region_id", filters.region_id.toString());
      if (filters.is_best_seller) params.append("is_best_seller", "true");
      if (filters.min_price) params.append("min_price", filters.min_price.toString());
      if (filters.max_price) params.append("max_price", filters.max_price.toString());
      if (filters.sort_by) params.append("sort_by", filters.sort_by);
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/products?${queryString}` : "/products";
    
    const response = await api.get<Product[]>(endpoint);
    return response.data;
  },

  async getByCountry(countryId: number): Promise<Product[]> {
    const response = await api.get<Product[]>(`/products?country_id=${countryId}`);
    return response.data;
  },

  async getByRegion(regionId: number): Promise<Product[]> {
    const response = await api.get<Product[]>(`/products?region_id=${regionId}`);
    return response.data;
  },

  async getByRegionSlug(slug: string): Promise<Product[]> {
    // Try to fetch by region slug - the API might support this
    const response = await api.get<Product[]>(`/regions/${slug}/products`);
    return response.data;
  },

  async getById(id: number): Promise<Product> {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  async getBestSellers(): Promise<Product[]> {
    const response = await api.get<Product[]>("/products?is_best_seller=true");
    return response.data;
  },
};
