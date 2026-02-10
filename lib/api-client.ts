const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.ezgiselyazilim.com.tr/api/V1";
const STORAGE_BASE_URL = API_BASE_URL.split('/api')[0];

export function getImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("//")) return path;

  // Clean the path and the base URL
  const cleanPath = path.startsWith("/") ? path.substring(1) : path;
  return `${STORAGE_BASE_URL}/${cleanPath}`;
}

export function getFlagFromISO(isoCode: string | null | undefined): string | null {
  if (!isoCode || isoCode.length !== 2) return null;
  return `https://flagcdn.com/w80/${isoCode.toLowerCase()}.png`;
}

// Token management
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("auth_token", token);
}

export function removeAuthToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("auth_token");
}

// Session ID for guest cart
export function getSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("cart_session_id");
}

export function setSessionId(sessionId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("cart_session_id", sessionId);
}

// API Error class
export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  session_id?: string;
  meta?: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
    links?: unknown[];
    path?: string;
  };
  links?: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

// Main fetch function
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  // Remove trailing slash from base URL and leading slash from endpoint to avoid double slashes
  const baseUrl = API_BASE_URL.replace(/\/+$/, "");
  const cleanEndpoint = endpoint.replace(/^\/+/, "");
  const url = `${baseUrl}/${cleanEndpoint}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...options.headers,
  };

  // Add auth token if available
  const token = getAuthToken();
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  // Add session ID for cart operations
  const sessionId = getSessionId();
  if (sessionId) {
    (headers as Record<string, string>)["X-Session-ID"] = sessionId;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    // Save session_id if returned
    if (data.session_id) {
      setSessionId(data.session_id);
    }

    if (!response.ok) {
      let errorMessage = data.message || "An error occurred";

      // Laravel validation errors often come in a nested 'errors' object
      if (data.errors && typeof data.errors === 'object') {
        const errorValues = Object.values(data.errors);
        if (errorValues.length > 0) {
          const firstError = errorValues[0];
          if (Array.isArray(firstError) && firstError.length > 0) {
            errorMessage = firstError[0];
          }
        }
      } else if (data.error) {
        errorMessage = data.error;
      }

      throw new ApiError(
        errorMessage,
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : "Network error",
      0
    );
  }
}

// HTTP method helpers
export const api = {
  get: <T>(endpoint: string, config?: RequestInit) =>
    apiFetch<T>(endpoint, { method: "GET", ...config }),

  post: <T>(endpoint: string, body?: unknown, config?: RequestInit) =>
    apiFetch<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
      ...config,
    }),

  put: <T>(endpoint: string, body?: unknown, config?: RequestInit) =>
    apiFetch<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
      ...config,
    }),

  delete: <T>(endpoint: string, body?: unknown, config?: RequestInit) =>
    apiFetch<T>(endpoint, {
      method: "DELETE",
      body: body ? JSON.stringify(body) : undefined,
      ...config,
    }),
};
