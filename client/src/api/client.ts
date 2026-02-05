const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  authenticate: (password: string) =>
    request<{ authenticated: boolean }>('/auth', {
      method: 'POST',
      body: JSON.stringify({ password }),
    }),

  // Health
  health: () => request<{ status: string; providers: any[]; availableProviders: string[] }>('/health'),

  // Router
  routeFile: async (file: File, taskType?: string) => {
    const form = new FormData();
    form.append('file', file);
    if (taskType) form.append('taskType', taskType);
    const res = await fetch(`${BASE}/route`, { method: 'POST', body: form });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || 'Route failed');
    }
    return res.json();
  },

  // Metrics
  getMetrics: () => request<any>('/metrics'),
  getMetricsHistory: (limit = 50) => request<any>(`/metrics/history?limit=${limit}`),

  // Anomaly
  detectAnomalies: () => request<any>('/anomaly/detect', { method: 'POST' }),
  getAnomalyFlags: (severity?: string) =>
    request<any>(`/anomaly/flags${severity ? `?severity=${severity}` : ''}`),
  explainAnomaly: (flagId: string) =>
    request<any>(`/anomaly/explain`, { method: 'POST', body: JSON.stringify({ flagId }) }),

  // Policy
  setPolicy: (policyText: string) =>
    request<any>('/policy/set', { method: 'POST', body: JSON.stringify({ policyText }) }),
  evaluateExpense: (expenseId: string) =>
    request<any>('/policy/evaluate', { method: 'POST', body: JSON.stringify({ expenseId }) }),
  policyChat: (message: string, history: any[] = []) =>
    request<any>('/policy/chat', { method: 'POST', body: JSON.stringify({ message, history }) }),

  // Expenses
  getExpenses: (page = 1, limit = 50) => request<any>(`/expenses?page=${page}&limit=${limit}`),
  uploadExpenses: async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${BASE}/expenses/upload`, { method: 'POST', body: form });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || 'Upload failed');
    }
    return res.json();
  },
};
