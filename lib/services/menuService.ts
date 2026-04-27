import { api } from "../api-client";

export interface MenuItem {
  id: number;
  title: string;
  url: string;
  target?: string;
  order: number;
  children?: MenuItem[];
  icon?: string;
  key?: string; // For i18n keys if needed
}

export interface Menu {
  id: number;
  name: string;
  handle: string;
  items: MenuItem[];
}

export const menuService = {
  async getMenu(handle: string, lang: string = "en"): Promise<Menu> {
    const response = await api.get<Menu>(`/menus/${handle}`, {
      headers: {
        'x-lang': lang,
        'Cache-Control': 'no-cache',
      },
      params: {
        _t: Date.now(), // Cache buster — her istekte taze veri al
      },
    });
    return (response.data as any).data;
  }
};
