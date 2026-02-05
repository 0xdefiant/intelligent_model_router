import dotenv from 'dotenv';
import { ProviderName, type ProviderStatus } from './shared';

// Try loading .env from project root (dev) or current dir (production)
dotenv.config({ path: '../.env' });
dotenv.config({ path: '.env' });

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  groqApiKey: process.env.GROQ_API_KEY || '',
  cerebrasApiKey: process.env.CEREBRAS_API_KEY || '',
  appPassword: process.env.APP_PASSWORD || 'ramp2026',
};

export function getProviderStatuses(): ProviderStatus[] {
  return [
    {
      provider: ProviderName.ANTHROPIC,
      available: !!config.anthropicApiKey,
      reason: config.anthropicApiKey ? undefined : 'ANTHROPIC_API_KEY not set',
    },
    {
      provider: ProviderName.OPENAI,
      available: !!config.openaiApiKey,
      reason: config.openaiApiKey ? undefined : 'OPENAI_API_KEY not set',
    },
    {
      provider: ProviderName.GROQ,
      available: !!config.groqApiKey,
      reason: config.groqApiKey ? undefined : 'GROQ_API_KEY not set',
    },
    {
      provider: ProviderName.CEREBRAS,
      available: !!config.cerebrasApiKey,
      reason: config.cerebrasApiKey ? undefined : 'CEREBRAS_API_KEY not set',
    },
  ];
}
