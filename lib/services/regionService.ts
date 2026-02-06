import { api } from "../api-client";
import type { Country } from "./countryService";

export interface Region {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  image_url?: string;
  countries_count?: number;
  starting_price?: number;
  countries?: Country[];
}

export const regionService = {
  async getAll(): Promise<Region[]> {
    const response = await api.get<Region[]>("/regions");
    return response.data;
  },

  async getPopular(): Promise<Region[]> {
    const response = await api.get<Region[]>("/regions/popular");
    return response.data;
  },

  async getById(id: number): Promise<Region> {
    const response = await api.get<Region>(`/regions/${id}`);
    return response.data;
  },

  async getBySlug(slug: string): Promise<Region> {
    const response = await api.get<Region>(`/regions/slug/${slug}`);
    return response.data;
  },
};
