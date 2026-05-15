import { api } from "../api-client";

export interface MenuItem {
  id?: number;
  label?: string;  // Admin panel label override
  title: string;   // Resolved translated title
  url: string;
  slug?: string;   // For CMS pages
  target?: string;
  order?: number;
  children?: MenuItem[];
  icon?: string;
  key?: string; // For i18n keys if needed
  external?: boolean;
  href?: string;   // Fallback for static links
}

export interface Menu {
  id: number;
  name: string;
  handle: string;
  items: MenuItem[];
}

export const menuService = {
  async getMenu(handle: string, lang: string = "tr"): Promise<Menu> {
    const response = await api.get<Menu>(`/menus/${handle}`, {
      headers: {
        'Cache-Control': 'no-cache',
      },
      params: {
        locale: lang,       // Backend reads ?locale= query param
        _t: Date.now(),     // Cache buster — her istekte taze veri al
      },
    });
    return (response.data as any).data;
  }
};
