import api from '../api-client';

export interface WalletTopupPayload {
  amount: number;
  currency: string;
  provider: 'paypal';
}

export interface WalletTopupResponse {
  action: 'redirect';
  url: string;
  transaction_id: string;
}

export const walletService = {
  topup: async (payload: WalletTopupPayload): Promise<WalletTopupResponse> => {
    const response = await api.post<WalletTopupResponse>('/wallet/topup', payload);
    return response.data;
  },
};
