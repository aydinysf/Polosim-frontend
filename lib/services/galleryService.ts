import { api } from "../api-client";

export interface GalleryItem {
  id: number;
  title?: string;
  description?: string;
  image_url: string;
  order: number;
}

export interface Gallery {
  id: number;
  name: string;
  slug: string;
  items: GalleryItem[];
}

export const galleryService = {
  async getAllGalleries(): Promise<Gallery[]> {
    const response = await api.get<Gallery[]>("/galleries");
    return response.data;
  },

  async getGallery(slug: string): Promise<Gallery> {
    const response = await api.get<Gallery>(`/galleries/${slug}`);
    return response.data;
  }
};
