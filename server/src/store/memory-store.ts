import type { Expense } from '../shared';
import type { AnomalyFlag } from '../shared';
import type { RequestMetric, ProviderMetrics, ProviderName } from '../shared';
import type { PolicyRule } from '../shared';

class MemoryStore {
  expenses: Map<string, Expense> = new Map();
  anomalyFlags: AnomalyFlag[] = [];
  requestMetrics: RequestMetric[] = [];
  policyRules: PolicyRule[] = [];
  policyText: string = '';

  addExpense(expense: Expense) {
    this.expenses.set(expense.id, expense);
  }

  addExpenses(expenses: Expense[]) {
    for (const e of expenses) {
      this.expenses.set(e.id, e);
    }
  }

  getExpenses(page = 1, limit = 50): { expenses: Expense[]; total: number } {
    const all = Array.from(this.expenses.values());
    const start = (page - 1) * limit;
    return {
      expenses: all.slice(start, start + limit),
      total: all.length,
    };
  }

  deleteExpense(id: string): boolean {
    return this.expenses.delete(id);
  }

  addAnomalyFlag(flag: AnomalyFlag) {
    this.anomalyFlags.push(flag);
  }

  getAnomalyFlags(severity?: string): AnomalyFlag[] {
    if (severity) {
      return this.anomalyFlags.filter(f => f.severity === severity);
    }
    return this.anomalyFlags;
  }

  getAnomalyFlag(id: string): AnomalyFlag | undefined {
    return this.anomalyFlags.find(f => f.id === id);
  }

  recordMetric(metric: RequestMetric) {
    this.requestMetrics.push(metric);
  }

  getMetricsHistory(limit = 50): RequestMetric[] {
    return this.requestMetrics.slice(-limit);
  }

  getAggregatedMetrics(): ProviderMetrics[] {
    const byProvider = new Map<ProviderName, RequestMetric[]>();
    for (const m of this.requestMetrics) {
      const arr = byProvider.get(m.provider) || [];
      arr.push(m);
      byProvider.set(m.provider, arr);
    }

    const result: ProviderMetrics[] = [];
    for (const [provider, metrics] of byProvider) {
      const latencies = metrics.map(m => m.latencyMs).sort((a, b) => a - b);
      const p95Index = Math.floor(latencies.length * 0.95);
      result.push({
        provider,
        totalRequests: metrics.length,
        avgLatencyMs: Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length),
        avgCostUsd: metrics.reduce((a, m) => a + m.costUsd, 0) / metrics.length,
        successRate: metrics.filter(m => m.success).length / metrics.length,
        p95LatencyMs: latencies[p95Index] || latencies[latencies.length - 1] || 0,
      });
    }
    return result;
  }

  setPolicyRules(rules: PolicyRule[]) {
    this.policyRules = rules;
  }

  setPolicyText(text: string) {
    this.policyText = text;
  }
}

export const store = new MemoryStore();
