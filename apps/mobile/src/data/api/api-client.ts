import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'subtrack_auth_token';
const USER_KEY = 'subtrack_user_data';

/** Stored user information */
export interface StoredUser {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: string;
}

/**
 * ApiClient — the ONLY place that makes HTTP calls.
 * Used exclusively by the SyncService and AuthService.
 * No UI component ever calls this directly.
 */
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://10.0.2.2:3000') {
    this.baseUrl = baseUrl;
  }

  /** Set the API base URL */
  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  /** Get stored auth token */
  async getToken(): Promise<string | null> {
    return SecureStore.getItemAsync(TOKEN_KEY);
  }

  /** Store auth token */
  async setToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }

  /** Clear auth token (logout) */
  async clearToken(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  }

  /** Store user data */
  async setUser(user: StoredUser): Promise<void> {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  }

  /** Get stored user data */
  async getUser(): Promise<StoredUser | null> {
    const data = await SecureStore.getItemAsync(USER_KEY);
    if (!data) return null;
    return JSON.parse(data) as StoredUser;
  }

  /** Check if user is authenticated */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null;
  }

  /**
   * Login — the only public API call besides sync.
   */
  async login(email: string, password: string): Promise<{
    accessToken: string;
    user: StoredUser;
  }> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Login failed' }));
      throw new Error((error as { message?: string }).message ?? 'Login failed');
    }

    const data = await response.json() as { accessToken: string; user: StoredUser };

    // Store token and user
    await this.setToken(data.accessToken);
    await this.setUser(data.user);

    return data;
  }

  /**
   * Send sync batch — the ONLY data sync HTTP call.
   */
  async syncBatch(operations: Array<{
    entityType: string;
    entityId: string;
    operation: string;
    payload: Record<string, unknown>;
    updatedAt: string;
  }>): Promise<{
    results: Array<{
      entityId: string;
      status: 'SUCCESS' | 'CONFLICT' | 'ERROR';
      serverVersion?: Record<string, unknown>;
      error?: string;
    }>;
  }> {
    const token = await this.getToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${this.baseUrl}/sync/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ operations }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        await this.clearToken();
        throw new Error('Session expired. Please login again.');
      }
      throw new Error(`Sync failed with status ${response.status}`);
    }

    return response.json() as Promise<{
      results: Array<{
        entityId: string;
        status: 'SUCCESS' | 'CONFLICT' | 'ERROR';
        serverVersion?: Record<string, unknown>;
        error?: string;
      }>;
    }>;
  }

  /**
   * Fetch initial data from server (used on first sync after login).
   */
  async fetchEntities(entityType: string): Promise<Record<string, unknown>[]> {
    const token = await this.getToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${this.baseUrl}/${entityType}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        await this.clearToken();
        throw new Error('Session expired. Please login again.');
      }
      throw new Error(`Failed to fetch ${entityType}`);
    }

    return response.json() as Promise<Record<string, unknown>[]>;
  }
}

/** Singleton API client instance */
export const apiClient = new ApiClient();
