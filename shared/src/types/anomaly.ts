import type { Expense } from './expense';

export enum AnomalySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum AnomalyType {
  DUPLICATE = 'duplicate',
  ROUND_NUMBER = 'round_number',
  WEEKEND_SPIKE = 'weekend_spike',
  UNUSUAL_AMOUNT = 'unusual_amount',
  FREQUENCY_SPIKE = 'frequency_spike',
  CATEGORY_MISMATCH = 'category_mismatch',
}

export interface AnomalyFlag {
  id: string;
  expenseId: string;
  expense: Expense;
  type: AnomalyType;
  severity: AnomalySeverity;
  confidence: number;
  ruleDetails: string;
  aiExplanation?: string;
  createdAt: string;
}
