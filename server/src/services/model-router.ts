import { ProviderName, TaskType, type TaskComplexity, type RoutingDecision, type ExtractionResult } from '../shared';
import { v4 as uuid } from 'uuid';
import { getProviderRegistry, isProviderAvailable } from '../providers';
import { store } from '../store/memory-store';

const ROUTING_TABLE: Record<TaskType, { primary: ProviderName; fallback: ProviderName }> = {
  [TaskType.SIMPLE_RECEIPT]: { primary: ProviderName.GROQ, fallback: ProviderName.CEREBRAS },
  [TaskType.COMPLEX_INVOICE]: { primary: ProviderName.ANTHROPIC, fallback: ProviderName.OPENAI },
  [TaskType.POLICY_COMPLIANCE]: { primary: ProviderName.OPENAI, fallback: ProviderName.ANTHROPIC },
  [TaskType.ANOMALY_EXPLANATION]: { primary: ProviderName.ANTHROPIC, fallback: ProviderName.GROQ },
};

const RATIONALE: Record<ProviderName, Record<TaskType, string>> = {
  [ProviderName.GROQ]: {
    [TaskType.SIMPLE_RECEIPT]: 'lowest latency and cost for straightforward extraction',
    [TaskType.COMPLEX_INVOICE]: 'fast processing with good accuracy',
    [TaskType.POLICY_COMPLIANCE]: 'fast compliance checks',
    [TaskType.ANOMALY_EXPLANATION]: 'quick anomaly explanations',
  },
  [ProviderName.CEREBRAS]: {
    [TaskType.SIMPLE_RECEIPT]: 'low-latency alternative for simple tasks',
    [TaskType.COMPLEX_INVOICE]: 'fast processing fallback',
    [TaskType.POLICY_COMPLIANCE]: 'fast compliance fallback',
    [TaskType.ANOMALY_EXPLANATION]: 'quick explanation fallback',
  },
  [ProviderName.ANTHROPIC]: {
    [TaskType.SIMPLE_RECEIPT]: 'high accuracy for receipt parsing',
    [TaskType.COMPLEX_INVOICE]: 'highest accuracy for multi-line item parsing and ambiguous formatting',
    [TaskType.POLICY_COMPLIANCE]: 'strong reasoning for compliance evaluation',
    [TaskType.ANOMALY_EXPLANATION]: 'best reasoning for detailed anomaly analysis',
  },
  [ProviderName.OPENAI]: {
    [TaskType.SIMPLE_RECEIPT]: 'reliable receipt extraction',
    [TaskType.COMPLEX_INVOICE]: 'strong structured data extraction',
    [TaskType.POLICY_COMPLIANCE]: 'native function calling for structured compliance evaluation',
    [TaskType.ANOMALY_EXPLANATION]: 'detailed anomaly reasoning',
  },
};

export function classifyTask(input: {
  text?: string;
  fileName?: string;
  fileSize?: number;
  taskTypeHint?: TaskType;
}): TaskComplexity {
  if (input.taskTypeHint) {
    return { type: input.taskTypeHint, score: 0.5, signals: ['User-specified task type'] };
  }

  const signals: string[] = [];
  let score = 0;

  if (input.fileName?.endsWith('.csv')) {
    signals.push('CSV file detected');
    score += 0.3;
    if (input.text) {
      const rowCount = input.text.split('\n').length;
      if (rowCount > 20) {
        score += 0.3;
        signals.push(`${rowCount} rows`);
      }
    }
  }

  if (input.fileName && /\.(png|jpg|jpeg|webp|gif)$/i.test(input.fileName)) {
    signals.push('Image receipt');
    score += 0.1;
    if (input.fileSize && input.fileSize > 500 * 1024) {
      score += 0.4;
      signals.push('Large image, likely multi-page');
    }
  }

  if (input.text) {
    const lineCount = input.text.split('\n').length;
    if (lineCount > 15) {
      score += 0.3;
      signals.push(`${lineCount} lines of text`);
    }
    if (/tax|discount|subtotal|line item/i.test(input.text)) {
      score += 0.2;
      signals.push('Complex line items detected');
    }
  }

  const type = score < 0.3 ? TaskType.SIMPLE_RECEIPT : TaskType.COMPLEX_INVOICE;
  return { type, score, signals };
}

export function selectProvider(complexity: TaskComplexity): RoutingDecision {
  const entry = ROUTING_TABLE[complexity.type];
  const primary = isProviderAvailable(entry.primary) ? entry.primary : null;
  const fallback = isProviderAvailable(entry.fallback) ? entry.fallback : null;

  // Find any available provider if neither primary nor fallback is available
  let chosen = primary || fallback;
  if (!chosen) {
    const registry = getProviderRegistry();
    for (const [name] of registry) {
      chosen = name;
      break;
    }
  }

  if (!chosen) {
    throw new Error('No AI providers available. Configure at least one API key in .env');
  }

  const reason = `Task classified as ${complexity.type} (score: ${complexity.score.toFixed(2)}). ` +
    `Routing to ${chosen} for ${RATIONALE[chosen]?.[complexity.type] || 'general processing'}.` +
    (complexity.signals.length ? ` Signals: ${complexity.signals.join(', ')}.` : '');

  return {
    provider: chosen,
    reason,
    complexity,
    fallback: chosen === primary ? fallback || undefined : undefined,
  };
}

export interface RouteResult {
  provider: ProviderName;
  result: ExtractionResult;
  decision: RoutingDecision;
  usedFallback?: boolean;
  latencyMs: number;
  costUsd: number;
}

export async function routeAndExecute(input: {
  text: string;
  fileName?: string;
  fileSize?: number;
  taskTypeHint?: TaskType;
}): Promise<RouteResult> {
  const complexity = classifyTask(input);
  const decision = selectProvider(complexity);
  const registry = getProviderRegistry();

  const startTime = Date.now();
  try {
    const provider = registry.get(decision.provider)!;
    const result = await provider.extractExpenseData(input.text, complexity.type);
    const latencyMs = Date.now() - startTime;
    const costUsd = provider.estimateCost(input.text.length / 4, 500);

    store.recordMetric({
      id: uuid(),
      timestamp: new Date().toISOString(),
      provider: decision.provider,
      taskType: complexity.type,
      latencyMs,
      costUsd,
      inputTokens: Math.round(input.text.length / 4),
      outputTokens: 500,
      success: true,
    });

    // Store extracted expenses
    for (const exp of result.expenses) {
      if (!exp.id) exp.id = uuid();
      store.addExpense(exp);
    }

    return { provider: decision.provider, result, decision, latencyMs, costUsd };
  } catch (err) {
    const latencyMs = Date.now() - startTime;
    store.recordMetric({
      id: uuid(),
      timestamp: new Date().toISOString(),
      provider: decision.provider,
      taskType: complexity.type,
      latencyMs,
      costUsd: 0,
      inputTokens: 0,
      outputTokens: 0,
      success: false,
    });

    // Try fallback
    if (decision.fallback && registry.has(decision.fallback)) {
      const fallbackStart = Date.now();
      const provider = registry.get(decision.fallback)!;
      const result = await provider.extractExpenseData(input.text, complexity.type);
      const fbLatency = Date.now() - fallbackStart;
      const costUsd = provider.estimateCost(input.text.length / 4, 500);

      store.recordMetric({
        id: uuid(),
        timestamp: new Date().toISOString(),
        provider: decision.fallback,
        taskType: complexity.type,
        latencyMs: fbLatency,
        costUsd,
        inputTokens: Math.round(input.text.length / 4),
        outputTokens: 500,
        success: true,
      });

      for (const exp of result.expenses) {
        if (!exp.id) exp.id = uuid();
        store.addExpense(exp);
      }

      return { provider: decision.fallback, result, decision, usedFallback: true, latencyMs: fbLatency, costUsd };
    }
    throw err;
  }
}
