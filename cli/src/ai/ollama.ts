import type { AIFix, DebugContext } from '../types.js';
import type { AIProvider } from './adapter.js';
import { parseAIResponse } from './adapter.js';
import { SYSTEM_PROMPT, buildUserPrompt } from './prompts.js';

export class OllamaProvider implements AIProvider {
  name = 'ollama';
  private model: string;
  private baseUrl: string;

  constructor(model?: string, baseUrl?: string) {
    this.model = model || 'llama3.2:3b';
    this.baseUrl = baseUrl || 'http://localhost:11434';
  }

  async diagnose(ctx: DebugContext): Promise<AIFix> {
    const body = {
      model: this.model,
      stream: false,
      format: 'json',
      system: SYSTEM_PROMPT,
      prompt: buildUserPrompt(ctx),
    };

    const res = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Ollama API error (${res.status}): ${err}. Is Ollama running?`);
    }

    const data = await res.json() as any;
    const text = data.response || '';
    return parseAIResponse(text);
  }
}
