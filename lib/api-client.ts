import axios, { type AxiosError } from 'axios';

const ensureV1 = (url: string) => {
  if (url.endsWith('/api/V1')) return url;
  if (url.endsWith('/')) return `${url}api/V1`;
  return `${url}/api/V1`;
};

const API_URL = ensureV1(process.env.NEXT_PUBLIC_API_URL || 'https://esim-projects-web-test-api.bhnrgc.easypanel.host/api/V1');
const WEB_API_URL = ensureV1(process.env.NEXT_PUBLIC_WEB_API_URL || 'https://esim-projects-web-test-api.bhnrgc.easypanel.host/api/V1');

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

// Session ID management for guest carts
export const getCartSessionId = (): string => {
  if (typeof window === 'undefined') return '';
  let sessionId = localStorage.getItem('cart_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('cart_session_id', sessionId);
  }
  return sessionId;
};

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export const webApi = axios.create({
  baseURL: WEB_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Silently ignore aborted requests (AbortController)
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    if (error.response) {
      const { data, status } = error.response;

      // Token expired or invalid — clear auth state and notify the app
      if (status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        localStorage.removeItem('guest_token');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:expired'));
        }
      }

      const message = (data as any)?.message || error.message;
      const details = (data as any)?.errors || null;

      return Promise.reject(new ApiError(message, status, details));
    }
    console.error("Network/Unknown API Error:", error.message);
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

  // 🔥 ADDED: Cart Session ID for Guest Carts
  const sessionId = getCartSessionId();
  if (sessionId) {
    config.headers['Cart-Session-ID'] = sessionId;
  }

  // Locale detection from URL path or Cookie
  if (typeof window !== 'undefined') {
    let locale = window.location.pathname.split('/')[1];
    if (!locale || !['en', 'tr'].includes(locale)) {
      // Fallback: Check NEXT_LOCALE cookie or Default to 'en'
      const match = document.cookie.match(/NEXT_LOCALE=([^;]+)/);
      locale = match ? match[1] : 'en';
    }

    if (locale && ['en', 'tr'].includes(locale)) {
      config.headers['x-lang'] = locale;
    }
  }

  return config;
});

webApi.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // 🔥 ADDED: Cart Session ID for Web API too
  const sessionId = getCartSessionId();
  if (sessionId) {
    config.headers['Cart-Session-ID'] = sessionId;
  }

  // Locale detection from URL path or Cookie
  if (typeof window !== 'undefined') {
    let locale = window.location.pathname.split('/')[1];
    if (!locale || !['en', 'tr'].includes(locale)) {
      // Fallback: Check NEXT_LOCALE cookie or Default to 'en'
      const match = document.cookie.match(/NEXT_LOCALE=([^;]+)/);
      locale = match ? match[1] : 'en';
    }

    if (locale && ['en', 'tr'].includes(locale)) {
      config.headers['x-lang'] = locale;
    }
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
