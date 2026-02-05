export interface PolicyRule {
  id: string;
  category: string;
  constraint: string;
  parameters: Record<string, unknown>;
}

export interface ComplianceResult {
  expenseId: string;
  status: 'pass' | 'fail' | 'warning';
  rulesEvaluated: PolicyRuleResult[];
  summary: string;
}

export interface PolicyRuleResult {
  ruleId: string;
  ruleName: string;
  passed: boolean;
  reason: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  evaluations?: ComplianceResult[];
  timestamp: string;
}
