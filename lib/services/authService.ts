import { api, setAuthToken, removeAuthToken, getAuthToken } from "../api-client";

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
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

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/login", credentials);
    if (response.data.token) {
      setAuthToken(response.data.token);
    }
    return response.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/register", data);
    if (response.data.token) {
      setAuthToken(response.data.token);
    }
    return response.data;
  },

  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>("/verify-email", { token });
    return response.data;
  },

  async getUser(): Promise<User> {
    const response = await api.get<User>("/user");
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post("/logout");
    } finally {
      removeAuthToken();
    }
  },

  isAuthenticated(): boolean {
    return !!getAuthToken();
  },
};
