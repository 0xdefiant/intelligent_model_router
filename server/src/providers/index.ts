import { ProviderName } from '../shared';
import { config } from '../config';
import type { AIProvider } from './base';
import { AnthropicProvider } from './anthropic';
import { OpenAIProvider } from './openai';
import { GroqProvider } from './groq';
import { CerebrasProvider } from './cerebras';

let registry: Map<ProviderName, AIProvider> | null = null;

export function getProviderRegistry(): Map<ProviderName, AIProvider> {
  if (registry) return registry;

  registry = new Map();

  if (config.groqApiKey) registry.set(ProviderName.GROQ, new GroqProvider());
  if (config.cerebrasApiKey) registry.set(ProviderName.CEREBRAS, new CerebrasProvider());
  if (config.anthropicApiKey) registry.set(ProviderName.ANTHROPIC, new AnthropicProvider());
  if (config.openaiApiKey) registry.set(ProviderName.OPENAI, new OpenAIProvider());

  return registry;
}

export function getAvailableProvider(preferred?: ProviderName): AIProvider | null {
  const reg = getProviderRegistry();

  if (preferred && reg.has(preferred)) return reg.get(preferred)!;

  // Return first available
  for (const provider of reg.values()) {
    return provider;
  }
  return null;
}

export function isProviderAvailable(name: ProviderName): boolean {
  return getProviderRegistry().has(name);
}
