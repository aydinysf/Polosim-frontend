export interface Product {
  id: number;
  name: string;
  description: string;
  priceInCents: number;
  flag: string;
  data: string;
  validity: string;
  speed: string;
  bestSeller?: boolean;
  region?: string;
}

export const PRODUCTS: Product[] = [];
