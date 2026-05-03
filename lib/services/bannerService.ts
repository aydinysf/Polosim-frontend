import { api } from "../api-client";

export interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  image_url: string;
  link?: string;
  position: number;
}

export const bannerService = {
  async getBanners(position?: string, lang: string = "en"): Promise<Banner[]> {
    const response = await api.get("/banners", {
      params: {
        position,
        lang,
        _t: Date.now(), // Cache buster
      },
    });
    return (response.data as any).data;
  },
};
