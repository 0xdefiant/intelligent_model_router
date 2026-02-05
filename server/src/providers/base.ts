import type { Expense, ExtractionResult, TaskType } from '../shared';

export interface AnomalyExplanation {
  explanation: string;
  confidence: number;
}

export interface ComplianceEvaluation {
  status: 'pass' | 'fail' | 'warning';
  rulesEvaluated: Array<{ ruleId: string; ruleName: string; passed: boolean; reason: string }>;
  summary: string;
}

export abstract class AIProvider {
  abstract name: string;

  abstract extractExpenseData(input: string, taskType: TaskType): Promise<ExtractionResult>;
  abstract analyzeAnomaly(expense: Expense, context: Expense[]): Promise<AnomalyExplanation>;
  abstract evaluatePolicy(expense: Expense, policyText: string): Promise<ComplianceEvaluation>;

  abstract estimateCost(inputTokens: number, outputTokens: number): number;
}
