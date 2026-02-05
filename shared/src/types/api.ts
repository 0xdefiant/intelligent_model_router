import type { Expense } from './expense';
import type { ExtractionResult, ProviderMetrics, ProviderName, ProviderStatus, RequestMetric, RoutingDecision } from './ai-provider';
import type { AnomalyFlag } from './anomaly';
import type { ChatMessage, ComplianceResult, PolicyRule } from './policy';

// Router
export interface RouteResponse {
  provider: ProviderName;
  result: ExtractionResult;
  decision: RoutingDecision;
  usedFallback?: boolean;
  latencyMs: number;
}

export interface MetricsResponse {
  providers: ProviderMetrics[];
  statuses: ProviderStatus[];
}

export interface MetricsHistoryResponse {
  history: RequestMetric[];
}

// Anomaly
export interface AnomalyDetectResponse {
  flags: AnomalyFlag[];
}

export interface AnomalyExplainResponse {
  explanation: string;
}

// Policy
export interface PolicySetResponse {
  parsed: PolicyRule[];
}

export interface PolicyEvaluateResponse {
  result: ComplianceResult;
}

export interface PolicyChatResponse {
  reply: string;
  evaluations?: ComplianceResult[];
}

// Expenses
export interface ExpenseListResponse {
  expenses: Expense[];
  total: number;
}

export interface ExpenseUploadResponse {
  expenses: Expense[];
  count: number;
}
