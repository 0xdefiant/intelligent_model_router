export enum ProviderName {
  GROQ = 'groq',
  ANTHROPIC = 'anthropic',
  OPENAI = 'openai',
  CEREBRAS = 'cerebras',
}

export enum TaskType {
  SIMPLE_RECEIPT = 'simple_receipt',
  COMPLEX_INVOICE = 'complex_invoice',
  POLICY_COMPLIANCE = 'policy_compliance',
  ANOMALY_EXPLANATION = 'anomaly_explanation',
}

export interface TaskComplexity {
  type: TaskType;
  score: number;
  signals: string[];
}

export interface RoutingDecision {
  provider: ProviderName;
  reason: string;
  complexity: TaskComplexity;
  fallback?: ProviderName;
}

export interface ProviderMetrics {
  provider: ProviderName;
  totalRequests: number;
  avgLatencyMs: number;
  avgCostUsd: number;
  successRate: number;
  p95LatencyMs: number;
}

export interface RequestMetric {
  id: string;
  timestamp: string;
  provider: ProviderName;
  taskType: TaskType;
  latencyMs: number;
  costUsd: number;
  inputTokens: number;
  outputTokens: number;
  success: boolean;
}

export interface ProviderStatus {
  provider: ProviderName;
  available: boolean;
  reason?: string;
}

export interface ExtractionResult {
  expenses: import('./expense').Expense[];
  rawText?: string;
  confidence: number;
}
