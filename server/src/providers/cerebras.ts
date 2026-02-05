import OpenAI from 'openai';
import type { Expense, ExtractionResult, TaskType } from '../shared';
import { config } from '../config';
import { AIProvider, type AnomalyExplanation, type ComplianceEvaluation } from './base';

export class CerebrasProvider extends AIProvider {
  name = 'cerebras';
  private client: OpenAI;

  constructor() {
    super();
    this.client = new OpenAI({
      apiKey: config.cerebrasApiKey,
      baseURL: 'https://api.cerebras.ai/v1',
    });
  }

  async extractExpenseData(input: string, _taskType: TaskType): Promise<ExtractionResult> {
    try {
      const response = await this.client.chat.completions.create({
        model: 'llama-3.3-70b',
        max_tokens: 2048,
        response_format: { type: 'json_object' },
        messages: [{
          role: 'user',
          content: `Extract expense data from the following text. Return JSON with this shape:
{"expenses": [{"vendor": "...", "amount": 0.00, "currency": "USD", "category": "meals|travel|software|office_supplies|equipment|marketing|professional_services|utilities|other", "description": "...", "date": "YYYY-MM-DD", "submittedBy": "Unknown"}], "confidence": 0.95}

Text:
${input}`,
        }],
      });

      const text = response.choices[0].message.content || '';
      const parsed = JSON.parse(text);
      return { expenses: parsed.expenses || [], confidence: parsed.confidence || 0.8, rawText: input };
    } catch (err) {
      console.error('[Cerebras] extractExpenseData error:', err);
      throw err;
    }
  }

  async analyzeAnomaly(expense: Expense, context: Expense[]): Promise<AnomalyExplanation> {
    try {
      const response = await this.client.chat.completions.create({
        model: 'llama-3.3-70b',
        max_tokens: 512,
        messages: [{
          role: 'user',
          content: `You are a financial auditor. Analyze this flagged expense and explain why it is suspicious in 2-3 sentences.

Flagged expense: ${JSON.stringify(expense)}
Recent context: ${JSON.stringify(context.slice(0, 10))}`,
        }],
      });

      return { explanation: response.choices[0].message.content || '', confidence: 0.75 };
    } catch (err) {
      console.error('[Cerebras] analyzeAnomaly error:', err);
      throw err;
    }
  }

  async evaluatePolicy(expense: Expense, policyText: string): Promise<ComplianceEvaluation> {
    try {
      const response = await this.client.chat.completions.create({
        model: 'llama-3.3-70b',
        max_tokens: 1024,
        response_format: { type: 'json_object' },
        messages: [{
          role: 'user',
          content: `Evaluate this expense against the policy. Return JSON:
{"status": "pass|fail|warning", "rulesEvaluated": [{"ruleId": "rule_1", "ruleName": "...", "passed": true, "reason": "..."}], "summary": "One sentence summary"}

Expense: ${JSON.stringify(expense)}

Policy:
${policyText}`,
        }],
      });

      const text = response.choices[0].message.content || '';
      return JSON.parse(text);
    } catch (err) {
      console.error('[Cerebras] evaluatePolicy error:', err);
      throw err;
    }
  }

  estimateCost(inputTokens: number, outputTokens: number): number {
    return (inputTokens / 1000) * 0.0001 + (outputTokens / 1000) * 0.0001;
  }
}
