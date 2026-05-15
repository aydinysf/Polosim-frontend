import { api } from "../api-client";

export interface PageTranslation {
  title: string;
  content?: string;
  seo_title?: string;
  seo_description?: string;
}

export interface Page {
  id: number;
  title: string;
  slug: string;
  url: string;
  content: string;
  seo_title?: string;
  seo_description?: string;
  show_in_menu?: boolean;
  show_in_footer?: boolean;
  sort_order?: number;
  gallery_id?: number | null;
  translations?: Record<string, PageTranslation>;
  is_active?: boolean;
  updated_at: string;
}

export const pageService = {
  async getPage(slug: string, locale: string = "tr"): Promise<Page> {
    const response = await api.get<Page>(`/pages/${slug}`, {
      params: {
        locale,
        _t: Date.now(),
      },
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    return (response.data as any).data;
  },

  /**
   * Get all active pages.
   * filter: 'menu' = show_in_menu=true, 'footer' = show_in_footer=true
   */
  async getAllPages(locale: string = "tr", filter?: 'menu' | 'footer'): Promise<Page[]> {
    const params: Record<string, string> = { locale };
    if (filter) params.filter = filter;
    const response = await api.get<Page[]>("/pages", { params });
    return (response.data as any).data;
  },
};
