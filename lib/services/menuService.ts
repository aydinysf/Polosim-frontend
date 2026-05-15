import { api } from "../api-client";

export interface MenuItem {
  id?: number;
  label?: string;  // Admin panel label override
  title: string;   // Resolved translated title
  url: string;
  slug?: string;   // For CMS pages
  page_id?: number;
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

/**
 * CMS sayfalarının URL'lerini normalize eder.
 * slug alanı varsa → CMS sayfası → /{slug} formatını garantile.
 */
function normalizeMenuItems(items: MenuItem[]): MenuItem[] {
  return items.map((item) => {
    const normalized = { ...item };

    // Slug varsa → CMS sayfası → /{slug} formatını zorla (/pages/ prefix olmadan)
    if (item.slug) {
      normalized.url = `/${item.slug}`;
    }

    // Alt menü öğelerini de normalize et
    if (item.children && item.children.length > 0) {
      normalized.children = normalizeMenuItems(item.children);
    }

    return normalized;
  });
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

    const data = (response.data as any).data;

    // URL'leri normalize et
    if (data?.items) {
      data.items = normalizeMenuItems(data.items);
    }

    return data;
  }
};

