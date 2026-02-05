import OpenAI from 'openai';
import type { Expense, ExtractionResult, TaskType } from '../shared';
import { config } from '../config';
import { AIProvider, type AnomalyExplanation, type ComplianceEvaluation } from './base';

export class OpenAIProvider extends AIProvider {
  name = 'openai';
  private client: OpenAI;

  constructor() {
    super();
    this.client = new OpenAI({ apiKey: config.openaiApiKey });
  }

  async extractExpenseData(input: string, _taskType: TaskType): Promise<ExtractionResult> {
    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
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
      console.error('[OpenAI] extractExpenseData error:', err);
      throw err;
    }
  }

  async analyzeAnomaly(expense: Expense, context: Expense[]): Promise<AnomalyExplanation> {
    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 512,
        messages: [{
          role: 'user',
          content: `You are a financial auditor. Analyze this flagged expense and explain why it is suspicious.

Flagged expense: ${JSON.stringify(expense)}
Recent context: ${JSON.stringify(context.slice(0, 10))}

Provide a concise 2-3 sentence explanation.`,
        }],
      });

      return { explanation: response.choices[0].message.content || '', confidence: 0.85 };
    } catch (err) {
      console.error('[OpenAI] analyzeAnomaly error:', err);
      throw err;
    }
  }

  async evaluatePolicy(expense: Expense, policyText: string): Promise<ComplianceEvaluation> {
    try {
      const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
        {
          type: 'function',
          function: {
            name: 'check_amount_limit',
            description: 'Check if expense amount exceeds the limit for its category',
            parameters: {
              type: 'object',
              properties: {
                category: { type: 'string' },
                amount: { type: 'number' },
                limit: { type: 'number' },
                passed: { type: 'boolean' },
                reason: { type: 'string' },
              },
              required: ['category', 'amount', 'limit', 'passed', 'reason'],
            },
          },
        },
        {
          type: 'function',
          function: {
            name: 'check_category_allowed',
            description: 'Check if the expense category is allowed per policy',
            parameters: {
              type: 'object',
              properties: {
                category: { type: 'string' },
                passed: { type: 'boolean' },
                reason: { type: 'string' },
              },
              required: ['category', 'passed', 'reason'],
            },
          },
        },
        {
          type: 'function',
          function: {
            name: 'check_receipt_required',
            description: 'Check if a receipt is required for this expense amount',
            parameters: {
              type: 'object',
              properties: {
                amount: { type: 'number' },
                hasReceipt: { type: 'boolean' },
                passed: { type: 'boolean' },
                reason: { type: 'string' },
              },
              required: ['amount', 'hasReceipt', 'passed', 'reason'],
            },
          },
        },
      ];

      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 1024,
        tools,
        messages: [
          {
            role: 'system',
            content: `You are a policy compliance checker. Evaluate the expense against the policy by calling the available tools. Call each relevant tool to check different aspects of compliance.`,
          },
          {
            role: 'user',
            content: `Expense: ${JSON.stringify(expense)}\n\nPolicy:\n${policyText}`,
          },
        ],
      });

      const toolCalls = response.choices[0].message.tool_calls || [];
      const rulesEvaluated = toolCalls.map((tc, i) => {
        const args = JSON.parse(tc.function.arguments);
        return {
          ruleId: `rule_${i + 1}`,
          ruleName: tc.function.name.replace(/_/g, ' '),
          passed: args.passed,
          reason: args.reason,
        };
      });

      const allPassed = rulesEvaluated.every(r => r.passed);
      const anyFailed = rulesEvaluated.some(r => !r.passed);

      return {
        status: anyFailed ? 'fail' : allPassed ? 'pass' : 'warning',
        rulesEvaluated,
        summary: anyFailed
          ? `Expense violates ${rulesEvaluated.filter(r => !r.passed).length} policy rule(s).`
          : 'Expense complies with all evaluated policy rules.',
      };
    } catch (err) {
      console.error('[OpenAI] evaluatePolicy error:', err);
      throw err;
    }
  }

  estimateCost(inputTokens: number, outputTokens: number): number {
    return (inputTokens / 1000) * 0.005 + (outputTokens / 1000) * 0.015;
  }
}
