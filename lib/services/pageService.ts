import { api } from "../api-client";

export interface Page {
  id: number;
  title: string;
  slug: string;
  content: string; // This could be HTML or structured text
  meta_title?: string;
  meta_description?: string;
  is_active: boolean;
  updated_at: string;
}

export const pageService = {
  async getPage(slug: string, lang: string = "en"): Promise<Page> {
    const response = await api.get<Page>(`/pages/${slug}?lang=${lang}`);
    return response.data;
  },

  async getAllPages(): Promise<Page[]> {
    const response = await api.get<Page[]>("/pages");
    return response.data;
  },
};
