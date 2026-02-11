import type { Config } from '../types.js';
import type { AIProvider } from './adapter.js';
import { ClaudeProvider } from './claude.js';
import { OpenAIProvider } from './openai.js';
import { OllamaProvider } from './ollama.js';
import { autoDetectProvider } from '../config.js';

const DEFAULT_MODELS: Record<string, string> = {
  // Free providers (prioritized)
  ollama: 'llama3.2:3b',
  local: 'llama3.2:3b',
  groq: 'llama-3.3-70b-versatile',
  gemini: 'gemini-2.0-flash',
  // Paid providers
  claude: 'claude-sonnet-4-5-20250929',
  anthropic: 'claude-sonnet-4-5-20250929',
  openai: 'gpt-4o-mini',
  gpt: 'gpt-4o-mini',
  openrouter: 'anthropic/claude-sonnet-4-5-20250929',
};

const PROVIDER_URLS: Record<string, string> = {
  groq: 'https://api.groq.com/openai/v1',
  gemini: 'https://generativelanguage.googleapis.com/v1beta/openai',
  openrouter: 'https://openrouter.ai/api/v1',
};

// Models that belong to each provider family
const MODEL_FAMILIES: Record<string, RegExp> = {
  claude: /^claude-/,
  openai: /^(gpt-|o1|o3|chatgpt)/,
  ollama: /^(llama|mistral|codellama|phi|gemma|qwen)/,
  groq: /^(llama|mixtral|gemma|whisper)/,
  gemini: /^gemini/,
  openrouter: /\//,
};

function isModelForProvider(model: string, provider: string): boolean {
  const canonical = provider.replace('anthropic', 'claude').replace('gpt', 'openai').replace('local', 'ollama');
  const family = MODEL_FAMILIES[canonical];
  if (!family) return true;
  return family.test(model);
}

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
      if (!apiKey) throw new Error('Claude requires an API key. Run: snapfix config set ai.apiKey YOUR_KEY\nOr set ANTHROPIC_API_KEY env var.');
      return new ClaudeProvider(apiKey, model, maxTokens);

    case 'openai':
    case 'gpt':
      if (!apiKey) throw new Error('OpenAI requires an API key. Run: snapfix config set ai.apiKey YOUR_KEY\nOr set OPENAI_API_KEY env var.');
      return new OpenAIProvider(apiKey, model, maxTokens, baseUrl);

    case 'groq':
      if (!apiKey) throw new Error('Groq requires a free API key. Get one at https://console.groq.com (free)\nThen: export GROQ_API_KEY=your_key');
      return new OpenAIProvider(apiKey, model || 'llama-3.3-70b-versatile', maxTokens, PROVIDER_URLS.groq);

    case 'gemini':
    case 'google':
      if (!apiKey) throw new Error('Gemini requires a free API key. Get one at https://aistudio.google.com (free)\nThen: export GEMINI_API_KEY=your_key');
      return new OpenAIProvider(apiKey, model || 'gemini-2.0-flash', maxTokens, PROVIDER_URLS.gemini);

    case 'openrouter':
      if (!apiKey) throw new Error('OpenRouter requires an API key. Set OPENROUTER_API_KEY env var.');
      return new OpenAIProvider(apiKey, model || 'anthropic/claude-sonnet-4-5-20250929', maxTokens, PROVIDER_URLS.openrouter);

    case 'ollama':
    case 'local':
      return new OllamaProvider(model, baseUrl);

    default:
      throw new Error(`Unknown AI provider: ${provider}. Use: ollama (free), groq (free), gemini (free), openai, claude, or openrouter`);
  }
}

export function createProviderFromConfig(config: Config, overrides?: {
  provider?: string;
  key?: string;
  model?: string;
}): AIProvider {
  let provider = overrides?.provider || config.ai.provider;
  let apiKey = overrides?.key || config.ai.apiKey;
  let model = overrides?.model || config.ai.model;

  // Auto-detect provider from env if no key configured
  if (!apiKey && provider !== 'ollama' && provider !== 'local') {
    const detected = autoDetectProvider();
    if (detected) {
      provider = detected.provider;
      apiKey = detected.key;
      model = ''; // reset model to get correct default
    }
  }

  // Fix model mismatch: if model doesn't belong to this provider, use default
  if (model && !isModelForProvider(model, provider)) {
    model = DEFAULT_MODELS[provider] || '';
  }

  // Use default model if none set
  if (!model) {
    model = DEFAULT_MODELS[provider] || '';
  }

  return createProvider(provider, apiKey, model, config.ai.maxTokens, config.ai.baseUrl);
}

export type { AIProvider } from './adapter.js';
