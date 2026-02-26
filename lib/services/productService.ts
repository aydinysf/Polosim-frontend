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
  data_amount_mb?: number; // raw MB value from web-api
  data?: string;
  dataAmount?: string;

  // Validity - various possible field names
  validity_days?: number;
  duration_days?: number; // web-api uses this field name
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
  base_price?: number; // web-api uses this
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
  image_url?: string;

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
    image_url?: string;
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
  data_amount?: string; // e.g. "1GB", "3GB", "10GB", "Unlimited"
  validity_days?: number; // e.g. 7, 15, 30
  sort_by?: "price_asc" | "price_desc" | "data_asc" | "data_desc" | "validity_asc" | "validity_desc" | "name_asc" | "name_desc" | "popular";
  page?: number;
  per_page?: number;
}

export interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
  links?: unknown[];
  path?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta?: PaginationMeta;
}

export const productService = {
  async getAll(filters?: ProductFilters): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.country_id) params.append("country_id", filters.country_id.toString());
      if (filters.region_id) params.append("region_id", filters.region_id.toString());
      if (filters.is_best_seller) params.append("is_best_seller", "true");
      if (filters.min_price) params.append("min_price", filters.min_price.toString());
      if (filters.max_price) params.append("max_price", filters.max_price.toString());
      if (filters.data_amount) params.append("data_amount", filters.data_amount);
      if (filters.validity_days) params.append("validity_days", filters.validity_days.toString());
      if (filters.sort_by) params.append("sort_by", filters.sort_by);
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.per_page) params.append("per_page", filters.per_page.toString());
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/products?${queryString}` : "/products";

    const response = await api.get<any>(endpoint);
    const resultData = response.data;
    return {
      data: Array.isArray(resultData) ? resultData : (resultData?.data || []),
      meta: resultData?.meta
    };
  },

  async getByCountry(countryId: number, page: number = 1): Promise<PaginatedResponse<Product>> {
    const response = await api.get<any>(`/products?country_id=${countryId}&page=${page}`);
    const resultData = response.data;
    return {
      data: Array.isArray(resultData) ? resultData : (resultData?.data || []),
      meta: resultData?.meta
    };
  },

  async getByRegion(regionId: number, page: number = 1): Promise<PaginatedResponse<Product>> {
    const response = await api.get<any>(`/products?region_id=${regionId}&page=${page}`);
    const resultData = response.data;
    return {
      data: Array.isArray(resultData) ? resultData : (resultData?.data || []),
      meta: resultData?.meta
    };
  },

  async getByRegionSlug(slug: string, page: number = 1): Promise<PaginatedResponse<Product>> {
    const response = await api.get<any>(`/regions/${slug}/products?page=${page}`);
    const resultData = response.data;
    return {
      data: Array.isArray(resultData) ? resultData : (resultData?.data || []),
      meta: resultData?.meta
    };
  },

  async getById(id: number): Promise<Product> {
    const response = await api.get<any>(`/products/${id}`);
    return response.data?.data || response.data;
  },

  async getBestSellers(page: number = 1): Promise<PaginatedResponse<Product>> {
    const response = await api.get<any>(`/products?is_best_seller=true&page=${page}`);
    const resultData = response.data;
    return {
      data: Array.isArray(resultData) ? resultData : (resultData?.data || []),
      meta: resultData?.meta
    };
  },

  async fetchAll(filters?: ProductFilters): Promise<Product[]> {
    const batchSize = 50;
    const initialFilters = { ...filters, page: 1, per_page: batchSize };

    const firstResponse = await this.getAll(initialFilters);
    let allProducts = [...firstResponse.data];

    const lastPage = firstResponse.meta?.last_page || 1;

    if (lastPage > 1) {
      const promises = [];
      for (let page = 2; page <= lastPage; page++) {
        promises.push(this.getAll({ ...filters, page, per_page: batchSize }));
      }

      try {
        const responses = await Promise.all(promises);
        responses.forEach(response => {
          allProducts = [...allProducts, ...response.data];
        });
      } catch (error) {
        console.error("Error fetching remaining pages:", error);
      }
    }

    return allProducts;
  },
};
