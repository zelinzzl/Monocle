const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Global reference to access token and refresh function
let getAccessToken: (() => string | null) | null = null;
let refreshTokenFunction: (() => Promise<boolean>) | null = null;

// Set the token getter and refresh function from auth context
export function setAuthFunctions(
  tokenGetter: () => string | null,
  refreshFunction: () => Promise<boolean>
) {
  getAccessToken = tokenGetter;
  refreshTokenFunction = refreshFunction;
}

// Enhanced fetch with automatic token handling and retry logic
export async function apiFetch(path: string, options: RequestInit = {}) {
  const makeRequest = async (includeAuth = true): Promise<Response> => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> || {}),
    };
    // Add Authorization header if we have an access token and includeAuth is true
    if (includeAuth && getAccessToken) {
      const token = getAccessToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return fetch(`${BASE_URL}${path}`, {
      credentials: "include", // Always include cookies for refresh token
      ...options,
      headers,
    });
  };

  try {
    // First attempt
    let response = await makeRequest();

    // If we get a 401 (unauthorized) and we have a refresh function, try to refresh
    if (response.status === 401 && refreshTokenFunction) {
      console.log('Access token expired, attempting refresh...');
      
      const refreshSuccess = await refreshTokenFunction();
      
      if (refreshSuccess) {
        console.log('Token refreshed successfully, retrying request...');
        // Retry the original request with the new token
        response = await makeRequest();
      } else {
        console.log('Token refresh failed');
        // Refresh failed, return the 401 response
        throw new Error('Authentication failed');
      }
    }

    const isJSON = response.headers.get("content-type")?.includes("application/json");
    const body = isJSON ? await response.json() : await response.text();

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 401) {
        throw new Error('Authentication required');
      } else if (response.status === 403) {
        throw new Error('Access forbidden');
      } else if (response.status === 429) {
        throw new Error('Too many requests. Please try again later.');
      }
      
      throw new Error(body?.error || body?.message || `HTTP ${response.status}: Request failed`);
    }

    return body;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

// Special fetch for authentication endpoints that don't need token retry logic
export async function authApiFetch(path: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    const isJSON = response.headers.get("content-type")?.includes("application/json");
    const body = isJSON ? await response.json() : await response.text();

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Too many requests. Please try again later.');
      }
      throw new Error(body?.error || body?.message || "API request failed");
    }

    return body;
  } catch (error) {
    console.error('Auth API request error:', error);
    throw error;
  }
}