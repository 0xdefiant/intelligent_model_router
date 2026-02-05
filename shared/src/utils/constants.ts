import { ProviderName } from '../types/ai-provider';

export const PROVIDER_PRICING: Record<ProviderName, { inputPer1k: number; outputPer1k: number }> = {
  [ProviderName.GROQ]: { inputPer1k: 0.00005, outputPer1k: 0.00008 },
  [ProviderName.CEREBRAS]: { inputPer1k: 0.0001, outputPer1k: 0.0001 },
  [ProviderName.ANTHROPIC]: { inputPer1k: 0.003, outputPer1k: 0.015 },
  [ProviderName.OPENAI]: { inputPer1k: 0.005, outputPer1k: 0.015 },
};

export const PROVIDER_DISPLAY_NAMES: Record<ProviderName, string> = {
  [ProviderName.GROQ]: 'Groq',
  [ProviderName.CEREBRAS]: 'Cerebras',
  [ProviderName.ANTHROPIC]: 'Anthropic (Claude)',
  [ProviderName.OPENAI]: 'OpenAI (GPT-4)',
};

export const PROVIDER_COLORS: Record<ProviderName, string> = {
  [ProviderName.GROQ]: '#F55036',
  [ProviderName.CEREBRAS]: '#6366F1',
  [ProviderName.ANTHROPIC]: '#D4A574',
  [ProviderName.OPENAI]: '#10A37F',
};
