import { api } from "../api-client";

export interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  image_url?: string;
  button_text?: string;
  button_url?: string;
  position: "hero" | "promo" | "footer";
  is_active: boolean;
  order: number;
  starts_at?: string;
  ends_at?: string;
}

export const bannerService = {
  async getAll(): Promise<Banner[]> {
    const response = await api.get<Banner[]>("/banners");
    return response.data;
  },

  async getByPosition(position: Banner["position"]): Promise<Banner[]> {
    const response = await api.get<Banner[]>(`/banners?position=${position}`);
    return response.data;
  },

  async getHeroBanners(): Promise<Banner[]> {
    return this.getByPosition("hero");
  },

  async getPromoBanners(): Promise<Banner[]> {
    return this.getByPosition("promo");
  },
};
