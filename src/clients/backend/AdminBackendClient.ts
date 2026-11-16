export class AdminBackendClient {
  constructor(private readonly baseUrl: string, private readonly serviceToken: string) {}

  async login(username: string, password: string): Promise<unknown> {
    return this.post('/internal/v1/auth/login', { username, password });
  }

  async refresh(refreshToken: string): Promise<unknown> {
    return this.post('/internal/v1/auth/refresh', { refreshToken });
  }

  async listLugares(token: string): Promise<unknown> {
    return this.get('/internal/v1/admin/lugares', token);
  }

  async createLugar(token: string, body: unknown): Promise<unknown> {
    return this.post('/internal/v1/admin/lugares', body, token);
  }

  async updateLugar(token: string, id: number, body: unknown): Promise<unknown> {
    return this.put(`/internal/v1/admin/lugares/${id}`, body, token);
  }

  async deleteLugar(token: string, id: number): Promise<void> {
    await this.request(`/internal/v1/admin/lugares/${id}`, 'DELETE', undefined, token);
  }

  async audit(token: string): Promise<unknown> {
    return this.get('/internal/v1/admin/auditoria', token);
  }

  private async get(path: string, token: string): Promise<unknown> {
    return this.request(path, 'GET', undefined, token);
  }

  private async post(path: string, body: unknown, token?: string): Promise<unknown> {
    return this.request(path, 'POST', body, token);
  }

  private async put(path: string, body: unknown, token?: string): Promise<unknown> {
    return this.request(path, 'PUT', body, token);
  }

  private async request(path: string, method: string, body?: unknown, token?: string): Promise<unknown> {
    const response = await fetch(new URL(path, this.baseUrl), {
      method,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-Service-Token': this.serviceToken, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) throw new Error(`Backend respondió ${response.status}`);
    if (method === 'DELETE') return undefined;
    return response.json();
  }
}