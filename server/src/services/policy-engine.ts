import type { Expense, PolicyRule, ComplianceResult, ChatMessage } from '../shared';
import { ProviderName } from '../shared';
import { v4 as uuid } from 'uuid';
import { getAvailableProvider, getProviderRegistry } from '../providers';

export async function parsePolicy(policyText: string): Promise<PolicyRule[]> {
  const provider = getAvailableProvider();
  if (!provider) {
    // Fallback: basic parsing
    return policyText
      .split('\n')
      .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
      .map((line, i) => ({
        id: `rule_${i + 1}`,
        category: 'all',
        constraint: line.replace(/^[-*]\s*/, '').trim(),
        parameters: {},
      }));
  }

  try {
    const result = await provider.evaluatePolicy(
      { id: 'parse', date: '', vendor: '', amount: 0, currency: 'USD', category: 'other', description: 'Policy parse request', submittedBy: '' },
      `Parse the following policy text into structured rules. For each rule, identify the category it applies to and the constraint. Return your response as a JSON array of rules.\n\nPolicy:\n${policyText}`
    );

    // If the provider returned rules, map them
    if (result.rulesEvaluated?.length) {
      return result.rulesEvaluated.map((r, i) => ({
        id: r.ruleId || `rule_${i + 1}`,
        category: 'all',
        constraint: r.ruleName || r.reason,
        parameters: {},
      }));
    }
  } catch (err) {
    console.error('[PolicyEngine] parsePolicy error:', err);
  }

  // Fallback
  return policyText
    .split('\n')
    .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
    .map((line, i) => ({
      id: `rule_${i + 1}`,
      category: 'all',
      constraint: line.replace(/^[-*]\s*/, '').trim(),
      parameters: {},
    }));
}

export async function evaluateExpenseAgainstPolicy(
  expense: Expense,
  rules: PolicyRule[],
  policyText: string
): Promise<ComplianceResult> {
  // Prefer OpenAI for function calling, fall back to any provider
  const registry = getProviderRegistry();
  const provider = registry.get(ProviderName.OPENAI) || getAvailableProvider();

  if (!provider) {
    return {
      expenseId: expense.id,
      status: 'warning',
      rulesEvaluated: [],
      summary: 'No AI provider available for policy evaluation.',
    };
  }

  try {
    const result = await provider.evaluatePolicy(expense, policyText);
    return {
      expenseId: expense.id,
      status: result.status,
      rulesEvaluated: result.rulesEvaluated,
      summary: result.summary,
    };
  } catch (err) {
    console.error('[PolicyEngine] evaluate error:', err);
    return {
      expenseId: expense.id,
      status: 'warning',
      rulesEvaluated: [],
      summary: 'Error evaluating policy compliance.',
    };
  }
}

export async function chatWithPolicyAgent(
  message: string,
  history: ChatMessage[],
  expenses: Expense[],
  rules: PolicyRule[],
  policyText: string
): Promise<{ reply: string; evaluations?: ComplianceResult[] }> {
  const provider = getAvailableProvider();
  if (!provider) {
    return { reply: 'No AI provider is configured. Please set up at least one API key in your .env file.' };
  }

  try {
    // Build context for the chat
    const expensesSummary = expenses.slice(0, 10).map(e =>
      `- ${e.vendor}: $${e.amount.toFixed(2)} (${e.category}, ${e.date})`
    ).join('\n');

    const chatContext = `You are an expense policy compliance agent. Answer questions about expense policy compliance.

Active Policy:
${policyText || 'No policy set'}

Recent Expenses:
${expensesSummary || 'No expenses loaded'}

Rules:
${rules.map(r => `- ${r.constraint}`).join('\n') || 'No parsed rules'}

Previous conversation:
${history.map(m => `${m.role}: ${m.content}`).join('\n')}

User: ${message}

Respond helpfully about expense policy compliance. If the user asks to evaluate a specific expense, provide your analysis.`;

    const result = await provider.evaluatePolicy(
      { id: 'chat', date: '', vendor: '', amount: 0, currency: 'USD', category: 'other', description: message, submittedBy: '' },
      chatContext
    );

    return {
      reply: result.summary || 'I can help you with expense policy questions. Try asking about specific expenses or policy rules.',
      evaluations: result.rulesEvaluated?.length ? [{
        expenseId: 'chat',
        status: result.status,
        rulesEvaluated: result.rulesEvaluated,
        summary: result.summary,
      }] : undefined,
    };
  } catch (err) {
    console.error('[PolicyEngine] chat error:', err);
    return { reply: 'I encountered an error processing your request. Please try again.' };
  }
}
