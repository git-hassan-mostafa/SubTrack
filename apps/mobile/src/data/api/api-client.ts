import { LoginResponseDto } from "../../domain";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "subtrack_auth_token";
const USER_KEY = "subtrack_user_data";

/**
 * Stored user information — the same shape returned by the api `/auth/login`
 * endpoint, sourced from the shared `LoginResponseDto` so the wire format and
 * the mobile cache stay in lockstep.
 */
export type StoredUser = LoginResponseDto["user"];

/**
 * ApiClient — the ONLY place that makes HTTP calls.
 * Used exclusively by the SyncService and AuthService.
 * No UI component ever calls this directly.
 */
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = "http://192.168.0.106:3000") {
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
  async login(email: string, password: string): Promise<LoginResponseDto> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: "Login failed" }));
        throw new Error(
          (error as { message?: string }).message ?? "Login failed",
        );
      }

      const data = (await response.json()) as LoginResponseDto;

      // Store token and user
      await this.setToken(data.accessToken);
      await this.setUser(data.user);

      return data;
    } catch (error) {
      console.log(error);
      throw new Error();
    }
  }

  /**
   * Send sync batch — the ONLY data sync HTTP call.
   */
  async syncBatch(
    operations: Array<{
      entityType: string;
      entityId: string;
      operation: string;
      payload: Record<string, unknown>;
      updatedAt: string;
    }>,
  ): Promise<{
    results: Array<{
      entityId: string;
      status: "SUCCESS" | "CONFLICT" | "ERROR";
      serverVersion?: Record<string, unknown>;
      error?: string;
    }>;
  }> {
    const token = await this.getToken();
    if (!token) throw new Error("Not authenticated");

    const response = await fetch(`${this.baseUrl}/sync/batch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ operations }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        await this.clearToken();
        throw new Error("Session expired. Please login again.");
      }
      throw new Error(`Sync failed with status ${response.status}`);
    }

    return response.json() as Promise<{
      results: Array<{
        entityId: string;
        status: "SUCCESS" | "CONFLICT" | "ERROR";
        serverVersion?: Record<string, unknown>;
        error?: string;
      }>;
    }>;
  }

  /**
   * Fetch initial data from server (used on first sync after login).
   *
   * The caller declares the expected row shape via the type parameter — the
   * JSON is not validated at runtime, so this is a structural assertion the
   * caller is responsible for matching to the api wire format.
   */
  async fetchEntities<T = Record<string, unknown>>(
    entityType: string,
  ): Promise<T[]> {
    const token = await this.getToken();
    if (!token) throw new Error("Not authenticated");

    const response = await fetch(`${this.baseUrl}/${entityType}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(response);

    if (!response.ok) {
      if (response.status === 401) {
        await this.clearToken();
        throw new Error("Session expired. Please login again.");
      }
      throw new Error(`Failed to fetch ${entityType}`);
    }

    return response.json() as Promise<T[]>;
  }
}

/** Singleton API client instance */
export const apiClient = new ApiClient();
