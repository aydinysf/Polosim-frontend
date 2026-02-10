import { api } from "../api-client";
import type { Product } from "./productService";

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  product: Product;
}

export interface EsimDetails {
  iccid: string;
  qr_code_url?: string;
  qr_code_data?: string;
  activation_code?: string;
  sm_dp_address?: string;
  status: "pending" | "active" | "expired" | "cancelled";
  activated_at?: string;
  expires_at?: string;
}

export interface Order {
  id: number;
  order_number: string;
  status: "pending" | "processing" | "completed" | "failed" | "refunded";
  payment_status: "pending" | "paid" | "failed" | "refunded";
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  items: OrderItem[];
  esim_details?: EsimDetails[];
  created_at: string;
  updated_at: string;
}

export const orderService = {
  async getAll(): Promise<Order[]> {
    try {
      const response = await api.get<any>("/orders");
      
      // API response structure can vary - handle different formats
      if (Array.isArray(response.data)) {
        return response.data; // Direct array in data property
      } else if (response.data && Array.isArray(response.data.data)) {
        return response.data.data; // Laravel paginated response { data: [...] }
      } else if (response.data && Array.isArray(response.data.orders)) {
        return response.data.orders; // Custom orders property
      } else if (Array.isArray(response)) {
        return response; // Direct array response (unlikely but possible)
      }
      
      console.warn("Unexpected orders API response format:", response);
      return []; // Return empty array if format is unexpected
    } catch (error: any) {
      if (error?.status === 401) {
        // User is not authenticated, return empty array instead of throwing
        console.warn("User not authenticated - returning empty orders array");
        return [];
      }
      // Re-throw other errors
      throw error;
    }
  },

  async getById(id: number): Promise<Order> {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  },

  async getByOrderNumber(orderNumber: string): Promise<Order> {
    const response = await api.get<Order>(`/orders/number/${orderNumber}`);
    return response.data;
  },
};
