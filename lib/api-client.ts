import axios, { type AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mobil-api.polosim.com/api/V1';
const WEB_API_URL = process.env.NEXT_PUBLIC_WEB_API_URL || 'https://web-api.polosim.com/api/V1';

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly details: any;

  constructor(message: string, statusCode: number, details: any = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const webApi = axios.create({
  baseURL: WEB_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const { data, status } = error.response;
      const message = (data as any)?.message || error.message;
      const details = (data as any)?.errors || null;

      // Detaylı loglama (Hata teşhisi için)
      if (status === 422) {
        console.error('422 Unprocessable Entity - Detaylar:', JSON.stringify(data, null, 2));
      }

      return Promise.reject(new ApiError(message, status, details));
    }
    return Promise.reject(new ApiError(error.message, 500));
  }
);

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('auth_token') || localStorage.getItem('guest_token');
};

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

webApi.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

export function getImageUrl(path?: string): string {
  if (!path) {
    return ""; // Return a default or empty string if path is not provided
  }
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) {
    return path;
  }
  return `${API_URL.replace('/api/V1', '')}/storage/${path}`;
}

export function getFlagFromISO(isoCode?: string | null): string | null {
  if (!isoCode || isoCode.length !== 2) {
    return null;
  }
  return `https://flagcdn.com/w40/${isoCode.toLowerCase()}.png`;
}
