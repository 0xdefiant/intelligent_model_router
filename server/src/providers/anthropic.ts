import Anthropic from '@anthropic-ai/sdk';
import type { Expense, ExtractionResult, TaskType } from '../shared';
import { config } from '../config';
import { AIProvider, type AnomalyExplanation, type ComplianceEvaluation } from './base';

export class AnthropicProvider extends AIProvider {
  name = 'anthropic';
  private client: Anthropic;

  constructor() {
    super();
    this.client = new Anthropic({ apiKey: config.anthropicApiKey });
  }

  async extractExpenseData(input: string, _taskType: TaskType): Promise<ExtractionResult> {
    try {
      const response = await this.client.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: `Extract expense data from the following text. Return valid JSON only with this exact shape:
{"expenses": [{"vendor": "...", "amount": 0.00, "currency": "USD", "category": "meals|travel|software|office_supplies|equipment|marketing|professional_services|utilities|other", "description": "...", "date": "YYYY-MM-DD", "submittedBy": "Unknown"}], "confidence": 0.95}

Text:
${input}`,
        }],
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return { expenses: [], confidence: 0, rawText: text };

      const parsed = JSON.parse(jsonMatch[0]);
      return {
        expenses: parsed.expenses || [],
        confidence: parsed.confidence || 0.8,
        rawText: input,
      };
    } catch (err) {
      console.error('[Anthropic] extractExpenseData error:', err);
      throw err;
    }
  }

  async analyzeAnomaly(expense: Expense, context: Expense[]): Promise<AnomalyExplanation> {
    try {
      const response = await this.client.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 512,
        messages: [{
          role: 'user',
          content: `You are a financial auditor. Analyze this expense for anomalies and explain why it was flagged.

Flagged expense: ${JSON.stringify(expense)}

Recent expenses for context: ${JSON.stringify(context.slice(0, 10))}

Provide a concise 2-3 sentence explanation of why this expense is suspicious, from an auditing perspective.`,
        }],
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      return { explanation: text, confidence: 0.85 };
    } catch (err) {
      console.error('[Anthropic] analyzeAnomaly error:', err);
      throw err;
    }
  }

  async evaluatePolicy(expense: Expense, policyText: string): Promise<ComplianceEvaluation> {
    try {
      const response = await this.client.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `Evaluate this expense against the company policy. Return valid JSON only.

Expense: ${JSON.stringify(expense)}

Policy:
${policyText}

Return JSON with this shape:
{"status": "pass|fail|warning", "rulesEvaluated": [{"ruleId": "rule_1", "ruleName": "...", "passed": true, "reason": "..."}], "summary": "One sentence summary"}`,
        }],
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return { status: 'warning', rulesEvaluated: [], summary: 'Could not parse evaluation' };

      return JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.error('[Anthropic] evaluatePolicy error:', err);
      throw err;
    }
  }

  estimateCost(inputTokens: number, outputTokens: number): number {
    return (inputTokens / 1000) * 0.003 + (outputTokens / 1000) * 0.015;
  }
}
