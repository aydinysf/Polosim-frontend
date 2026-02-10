import { api, setAuthToken, removeAuthToken, getAuthToken } from "../api-client";

export { getAuthToken, setAuthToken };

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
  wallet_balance?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const setUser = (user: User | null) => {
  if (typeof window !== "undefined") {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }
};

export const getUserFromStorage = (): User | null => {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }
  return null;
};

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<any>("/login", credentials);

    // API'nin token'ı doğrudan mı yoksa data nesnesi içinde mi döndürdüğünü kontrol et
    const authData = response.data || response;

    if (authData && authData.token) {
      setAuthToken(authData.token);
      setUser(authData.user);
      return authData as AuthResponse;
    }

    // Beklenmedik bir yanıt formatı varsa hata fırlat
    throw new Error("Authentication failed: Invalid response structure from API.");
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<any>("/register", data);

    // Check if token is directly in response or nested in data
    const authData = response.data || response;

    if (authData && authData.token) {
      setAuthToken(authData.token);
      setUser(authData.user);
      return authData as AuthResponse;
    }

    return authData;
  },

  async verifyEmail(email: string, code: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>("/verify-email", { email, verification_code: code });
    return response.data;
  },

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>("/resend-verification", { email });
    return response.data;
  },

  async getUser(): Promise<User> {
    const user = getUserFromStorage();
    if (user) {
      return Promise.resolve(user);
    }
    return Promise.reject("No user found");
  },

  logout(): void {
    removeAuthToken();
    setUser(null);
  },

  isAuthenticated(): boolean {
    return getAuthToken() !== null;
  },
};
