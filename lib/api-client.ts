function getApiBase(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host !== 'localhost' && host !== '127.0.0.1') {
      return '/api/v1';
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${getApiBase()}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (typeof window !== 'undefined' && !headers.has('Authorization')) {
    const storedToken = window.localStorage.getItem('oasis_access_token');
    if (storedToken) {
      headers.set('Authorization', `Bearer ${storedToken}`);
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: options.credentials || 'include',
  });

  if (!response.ok) {
    let errorDetails: any = { message: `Request failed with status ${response.status}` };
    try {
      errorDetails = await response.json();
    } catch {
      // fallback
    }
    const rawMsg = errorDetails?.error?.message || errorDetails?.message || 'API request failed';
    throw new Error(Array.isArray(rawMsg) ? rawMsg.join(', ') : String(rawMsg));
  }

  const json: ApiResponse<T> = await response.json();
  return json.data;
}
