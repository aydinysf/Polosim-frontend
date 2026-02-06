import { api } from "../api-client";

export interface AffiliateDashboard {
  total_earnings: number;
  pending_earnings: number;
  available_balance: number;
  total_referrals: number;
  active_referrals: number;
  conversion_rate: number;
  referral_code: string;
  referral_url: string;
}

export interface AffiliateLedger {
  id: number;
  type: "commission" | "withdrawal" | "bonus";
  amount: number;
  status: "pending" | "approved" | "paid" | "rejected";
  description?: string;
  order_id?: number;
  created_at: string;
}

export interface AffiliateCoupon {
  id: number;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  usage_count: number;
  max_usage?: number;
  expires_at?: string;
  is_active: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export const affiliateService = {
  async getDashboard(): Promise<AffiliateDashboard> {
    const response = await api.get<AffiliateDashboard>("/affiliate/dashboard");
    return response.data;
  },

  async getLedgers(page: number = 1): Promise<PaginatedResponse<AffiliateLedger>> {
    const response = await api.get<PaginatedResponse<AffiliateLedger>>(
      `/affiliate/ledgers?page=${page}`
    );
    return response.data;
  },

  async getCoupons(): Promise<AffiliateCoupon[]> {
    const response = await api.get<AffiliateCoupon[]>("/affiliate/coupons");
    return response.data;
  },

  async requestWithdrawal(amount: number): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>("/affiliate/withdraw", { amount });
    return response.data;
  },
};
