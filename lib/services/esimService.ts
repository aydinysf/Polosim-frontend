import { api } from "../api-client";

export interface EsimUsage {
  iccid: string;
  total_data_mb: number;
  used_data_mb: number;
  remaining_data_mb: number;
  usage_percentage: number;
  expires_at: string;
  days_remaining: number;
  status: "active" | "expired" | "depleted";
}

export interface EsimInfo {
  iccid: string;
  qr_code_url?: string;
  qr_code_data?: string;
  activation_code?: string;
  sm_dp_address?: string;
  status: "pending" | "active" | "expired" | "cancelled";
  product: {
    id: number;
    name: string;
    data_amount: string;
    validity_days: number;
  };
  country?: {
    id: number;
    name: string;
    flag_url?: string;
  };
  region?: {
    id: number;
    name: string;
  };
  activated_at?: string;
  expires_at?: string;
  created_at: string;
}

export const esimService = {
  async getUsage(iccid: string): Promise<EsimUsage> {
    const response = await api.get<EsimUsage>(`/esim/usage/${iccid}`);
    return response.data;
  },

  async getAll(): Promise<EsimInfo[]> {
    const response = await api.get<EsimInfo[]>("/esim");
    return response.data;
  },

  async getByIccid(iccid: string): Promise<EsimInfo> {
    const response = await api.get<EsimInfo>(`/esim/${iccid}`);
    return response.data;
  },
};
