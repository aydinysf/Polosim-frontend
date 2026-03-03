import api from '../api-client';

// Tipler
export interface User {
  id: number;
  name: string;
  email: string;
  wallet_balance?: number;
  created_at?: string;
  email_verified_at?: string | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password?: string; // OTP için şifre opsiyonel olabilir
  code?: string;     // OTP kodu
}

export interface RegisterRequest {
  name: string;
  email: string;
  password?: string;
}

export interface CheckoutPayload {
  payment_method: 'stripe';
  product_id: number;
  quantity: number;
  guest_name: string;
  guest_surname: string;
  guest_email: string;
}

// localStorage İşlemleri
export const setAuthToken = (token: string | null) => {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
};

export const setUserToStorage = (user: User | null) => {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
};

export const getUserFromStorage = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userJson = localStorage.getItem('user');
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch (e) {
    return null;
  }
};

// Servis Fonksiyonları
export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/login', credentials);
    if (response.data.token && response.data.user) {
      setAuthToken(response.data.token);
      setUserToStorage(response.data.user);
    }
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/register', data);
    if (response.data.token && response.data.user) {
      setAuthToken(response.data.token);
      setUserToStorage(response.data.user);
    }
    return response.data;
  },

  logout: () => {
    setAuthToken(null);
    setUserToStorage(null);
    // Gerekirse sunucuya da logout isteği gönderilebilir
    // api.post('/logout');
  },

  requestOtp: (email: string) =>
    api.post('/login', { email }),

  verifyOtp: (email: string, code: string) =>
    api.post('/login/verify', { email, code }),

  checkout: (payload: CheckoutPayload) =>
    api.post('/checkout/execute', payload),

  deactivateAccount: async (): Promise<void> => {
    await api.delete('/account');
    setAuthToken(null);
    setUserToStorage(null);
  },
};
