import { api } from "../api-client";
import type { Product } from "./productService";

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  product: Product;
}

export interface Cart {
  id: number;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  coupon_code?: string;
}

export const cartService = {
  async getCart(): Promise<Cart> {
    const response = await api.get<Cart>("/cart");
    return response.data;
  },

  async addItem(productId: number, quantity: number = 1): Promise<Cart> {
    const response = await api.post<Cart>("/cart/items", {
      product_id: productId,
      quantity,
    });
    return response.data;
  },

  async updateItemQuantity(itemId: number, quantity: number): Promise<Cart> {
    const response = await api.put<Cart>(`/cart/items/${itemId}`, {
      quantity,
    });
    return response.data;
  },

  async removeItem(itemId: number): Promise<Cart> {
    const response = await api.delete<Cart>(`/cart/items/${itemId}`);
    return response.data;
  },

  async clearCart(): Promise<void> {
    await api.delete("/cart");
  },

  async applyCoupon(code: string): Promise<Cart> {
    const response = await api.post<Cart>("/cart/coupon", { code });
    return response.data;
  },

  async removeCoupon(): Promise<Cart> {
    const response = await api.delete<Cart>("/cart/coupon");
    return response.data;
  },
};
