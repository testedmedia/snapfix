import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import type { Config } from './types.js';

const CONFIG_DIR = join(homedir(), '.snapfix');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');
const REPORTS_DIR = join(CONFIG_DIR, 'reports');

const DEFAULT_CONFIG: Config = {
  ai: {
    provider: 'ollama',
    model: 'llama3.2:3b',
    apiKey: '',
    maxTokens: 1024,
    temperature: 0.3,
  },
  loop: {
    maxLoops: 25,
    autoApply: false,
    timeout: 300_000,
  },
  report: {
    enabled: true,
    dir: REPORTS_DIR,
  },
  ui: {
    verbose: false,
    colors: true,
  },
};

export function ensureConfigDir(): void {
  if (!existsSync(CONFIG_DIR)) mkdirSync(CONFIG_DIR, { recursive: true });
  if (!existsSync(REPORTS_DIR)) mkdirSync(REPORTS_DIR, { recursive: true });
}

export function loadConfig(): Config {
  ensureConfigDir();
  if (!existsSync(CONFIG_FILE)) {
    writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2));
    return { ...DEFAULT_CONFIG };
  }
  try {
    const raw = readFileSync(CONFIG_FILE, 'utf-8');
    const saved = JSON.parse(raw);
    return deepMerge(DEFAULT_CONFIG, saved) as Config;
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveConfig(config: Config): void {
  ensureConfigDir();
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function setConfigValue(key: string, value: string): void {
  const config = loadConfig();
  const parts = key.split('.');
  let obj: any = config;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!(parts[i] in obj)) obj[parts[i]] = {};
    obj = obj[parts[i]];
  }
  const last = parts[parts.length - 1];
  // Auto-parse booleans and numbers
  if (value === 'true') obj[last] = true;
  else if (value === 'false') obj[last] = false;
  else if (!isNaN(Number(value)) && value !== '') obj[last] = Number(value);
  else obj[last] = value;
  saveConfig(config);
}

export function getConfigValue(key: string): any {
  const config = loadConfig();
  const parts = key.split('.');
  let obj: any = config;
  for (const part of parts) {
    if (obj == null || !(part in obj)) return undefined;
    obj = obj[part];
  }
  return obj;
}

export function resolveApiKey(cliKey: string | undefined, config: Config): string {
  if (cliKey) return cliKey;
  if (config.ai.apiKey) return config.ai.apiKey;
  const envMap: Record<string, string> = {
    claude: 'ANTHROPIC_API_KEY',
    anthropic: 'ANTHROPIC_API_KEY',
    openai: 'OPENAI_API_KEY',
    gpt: 'OPENAI_API_KEY',
    groq: 'GROQ_API_KEY',
    gemini: 'GEMINI_API_KEY',
    google: 'GEMINI_API_KEY',
    openrouter: 'OPENROUTER_API_KEY',
    ollama: '',
    local: '',
  };
  const envVar = envMap[config.ai.provider];
  if (envVar && process.env[envVar]) return process.env[envVar]!;
  return '';
}

// Auto-detect the best available provider from env vars (zero config)
// Priority: free providers first, then paid
export function autoDetectProvider(): { provider: string; key: string } | null {
  // Free providers first
  if (process.env.GROQ_API_KEY) return { provider: 'groq', key: process.env.GROQ_API_KEY };
  if (process.env.GEMINI_API_KEY) return { provider: 'gemini', key: process.env.GEMINI_API_KEY };
  // Paid providers as fallback
  if (process.env.OPENROUTER_API_KEY) return { provider: 'openrouter', key: process.env.OPENROUTER_API_KEY };
  if (process.env.OPENAI_API_KEY) return { provider: 'openai', key: process.env.OPENAI_API_KEY };
  if (process.env.ANTHROPIC_API_KEY) return { provider: 'claude', key: process.env.ANTHROPIC_API_KEY };
  return null;
}

function deepMerge(target: any, source: any): any {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === 'object'
    ) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

export { CONFIG_DIR, CONFIG_FILE, REPORTS_DIR };
