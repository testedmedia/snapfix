import type { Config } from '../types.js';
import type { AIProvider } from './adapter.js';
import { ClaudeProvider } from './claude.js';
import { OpenAIProvider } from './openai.js';
import { OllamaProvider } from './ollama.js';

export function createProvider(
  provider: string,
  apiKey: string,
  model?: string,
  maxTokens?: number,
  baseUrl?: string
): AIProvider {
  switch (provider) {
    case 'claude':
    case 'anthropic':
      if (!apiKey) throw new Error('Claude requires an API key. Run: snapfix config set ai.apiKey YOUR_KEY');
      return new ClaudeProvider(apiKey, model, maxTokens);

    case 'openai':
    case 'gpt':
      if (!apiKey) throw new Error('OpenAI requires an API key. Run: snapfix config set ai.apiKey YOUR_KEY');
      return new OpenAIProvider(apiKey, model, maxTokens, baseUrl);

    case 'ollama':
    case 'local':
      return new OllamaProvider(model, baseUrl);

    default:
      throw new Error(`Unknown AI provider: ${provider}. Use: claude, openai, or ollama`);
  }
}

const DEFAULT_MODELS: Record<string, string> = {
  claude: 'claude-sonnet-4-5-20250929',
  anthropic: 'claude-sonnet-4-5-20250929',
  openai: 'gpt-4o',
  gpt: 'gpt-4o',
  ollama: 'llama3.2:3b',
  local: 'llama3.2:3b',
};

export function createProviderFromConfig(config: Config, overrides?: {
  provider?: string;
  key?: string;
  model?: string;
}): AIProvider {
  const provider = overrides?.provider || config.ai.provider;
  const apiKey = overrides?.key || config.ai.apiKey;
  // Use override model, or if config model doesn't match provider, use provider default
  let model = overrides?.model || config.ai.model;
  const defaultModel = DEFAULT_MODELS[provider] || 'llama3.2';
  if (!model || (provider === 'ollama' && model.startsWith('claude-')) || (provider === 'claude' && model.startsWith('gpt-'))) {
    model = defaultModel;
  }
  return createProvider(provider, apiKey, model, config.ai.maxTokens, config.ai.baseUrl);
}

export type { AIProvider } from './adapter.js';
