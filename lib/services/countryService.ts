import { api } from "../api-client";

export interface Country {
  id: number;
  name: string;
  slug: string;
  iso_code: string;
  flag_url?: string;
  image_url?: string;
  region_id?: number;
  is_popular?: boolean;
  products_count?: number;
  starting_price?: number;
}

export const countryService = {
  async getAll(): Promise<Country[]> {
    const response = await api.get<any>("/countries");
    if (!response.data) return [];
    return Array.isArray(response.data) ? response.data : (response.data.data || []);
  },

  async getPopular(): Promise<Country[]> {
    try {
      const response = await api.get<any>("/countries/popular");
      if (!response.data) return [];
      return Array.isArray(response.data) ? response.data : (response.data.data || []);
    } catch {
      // Fallback to all countries if popular endpoint fails
      const allCountries = await this.getAll();
      return allCountries.filter((c) => c.is_popular).slice(0, 8);
    }
  },

  async getById(id: number): Promise<Country> {
    const response = await api.get<Country>(`/countries/${id}`);
    return response.data;
  },

  async getBySlug(slug: string): Promise<Country> {
    const response = await api.get<Country>(`/countries/slug/${slug}`);
    return response.data;
  },
};
