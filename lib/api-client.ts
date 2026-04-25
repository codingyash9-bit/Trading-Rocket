/**
 * Centralized API Client for Trading Rocket
 * Handles authentication headers, error handling, and standardized requests.
 */

const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "TR_PROD_SECRET_KEY_2026";

export interface ApiResponse<T = any> {
  data: T | null;
  error: string | null;
  status: number;
  success: boolean;
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const status = response.status;
  const success = response.ok;
  
  try {
    const data = await response.json();
    if (!success) {
      return {
        data: null,
        error: data.detail || data.error || `Request failed with status ${status}`,
        status,
        success: false,
      };
    }
    return {
      data,
      error: null,
      status,
      success: true,
    };
  } catch (err) {
    if (!success) {
      return {
        data: null,
        error: `Request failed with status ${status}`,
        status,
        success: false,
      };
    }
    return {
      data: null,
      error: "Failed to parse response",
      status,
      success: false,
    };
  }
}

export const api = {
  get: async <T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
    const response = await fetch(url, {
      ...options,
      method: "GET",
      headers: {
        "X-API-Key": API_KEY,
        "Accept": "application/json",
        ...options.headers,
      },
    });
    return handleResponse<T>(response);
  },

  post: async <T>(url: string, body: any, options: RequestInit = {}): Promise<ApiResponse<T>> => {
    const isFormData = body instanceof FormData;
    const response = await fetch(url, {
      ...options,
      method: "POST",
      headers: {
        "X-API-Key": API_KEY,
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        "Accept": "application/json",
        ...options.headers,
      },
      body: isFormData ? body : JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },

  put: async <T>(url: string, body: any, options: RequestInit = {}): Promise<ApiResponse<T>> => {
    const response = await fetch(url, {
      ...options,
      method: "PUT",
      headers: {
        "X-API-Key": API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...options.headers,
      },
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },

  delete: async <T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
    const response = await fetch(url, {
      ...options,
      method: "DELETE",
      headers: {
        "X-API-Key": API_KEY,
        "Accept": "application/json",
        ...options.headers,
      },
    });
    return handleResponse<T>(response);
  },
};
