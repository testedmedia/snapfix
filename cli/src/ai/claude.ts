import type { AIFix, DebugContext } from '../types.js';
import type { AIProvider } from './adapter.js';
import { parseAIResponse } from './adapter.js';
import { SYSTEM_PROMPT, buildUserPrompt } from './prompts.js';

export class ClaudeProvider implements AIProvider {
  name = 'claude';
  private apiKey: string;
  private model: string;
  private maxTokens: number;

  constructor(apiKey: string, model?: string, maxTokens?: number) {
    this.apiKey = apiKey;
    this.model = model || 'claude-sonnet-4-5-20250929';
    this.maxTokens = maxTokens || 1024;
  }

  async diagnose(ctx: DebugContext): Promise<AIFix> {
    const body = {
      model: this.model,
      max_tokens: this.maxTokens,
      temperature: 0.3,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: buildUserPrompt(ctx) },
      ],
    };

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Claude API error (${res.status}): ${err}`);
    }

    const data = await res.json() as any;
    const text = data.content?.[0]?.text || '';
    return parseAIResponse(text);
  }
}
