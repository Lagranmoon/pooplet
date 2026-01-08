const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
}

export interface UserListResponse {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
}

export interface SystemConfigResponse {
  key: string;
  value: string;
}

export interface LoginResponse {
  token: string;
  expires_at: number;
  user: User;
}

export interface LogResponse {
  id: string;
  user_id: string;
  timestamp: string;
  difficulty: string;
  note: string;
  created_at: string;
}

export interface StatsResponse {
  today_count: number;
  week_count: number;
  week_avg: number;
  total_count: number;
  streak: number;
  difficulty_map: Record<string, number>;
  date_logs: Record<string, number>;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface CreateLogRequest {
  timestamp: string;
  difficulty: string;
  note?: string;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('pooplet_token', token);
    } else {
      localStorage.removeItem('pooplet_token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('pooplet_token');
    }
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    const result = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(result.token);
    return result;
  }

  async register(data: RegisterRequest): Promise<LoginResponse> {
    const result = await this.request<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(result.token);
    return result;
  }

  logout() {
    this.setToken(null);
  }

  async getProfile(): Promise<User> {
    return this.request<User>('/profile');
  }

  async getLogs(startDate?: string, endDate?: string): Promise<LogResponse[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const query = params.toString();
    return this.request<LogResponse[]>(`/logs${query ? `?${query}` : ''}`);
  }

  async createLog(data: CreateLogRequest): Promise<LogResponse> {
    return this.request<LogResponse>('/logs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getLog(id: string): Promise<LogResponse> {
    return this.request<LogResponse>(`/logs/${id}`);
  }

  async updateLog(id: string, data: Partial<CreateLogRequest>): Promise<LogResponse> {
    return this.request<LogResponse>(`/logs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteLog(id: string): Promise<void> {
    await this.request<void>(`/logs/${id}`, {
      method: 'DELETE',
    });
  }

  async getStats(): Promise<StatsResponse> {
    return this.request<StatsResponse>('/stats');
  }

  // Admin API methods
  async getAllUsers(): Promise<UserListResponse[]> {
    return this.request<UserListResponse[]>('/admin/users');
  }

  async updateUserRole(userId: string, role: UserRole): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  async deleteUser(userId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async createUser(data: CreateUserRequest): Promise<{ message: string; user: UserListResponse; token: string; expires_at: number }> {
    return this.request<{ message: string; user: UserListResponse; token: string; expires_at: number }>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSystemConfig(key: string): Promise<SystemConfigResponse> {
    return this.request<SystemConfigResponse>(`/admin/config/${key}`);
  }

  async setSystemConfig(key: string, value: string): Promise<{ message: string; key: string; value: string }> {
    return this.request<{ message: string; key: string; value: string }>(`/admin/config/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    });
  }
}

export const api = new ApiClient();
