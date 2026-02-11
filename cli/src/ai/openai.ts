import type { AIFix, DebugContext } from '../types.js';
import type { AIProvider } from './adapter.js';
import { parseAIResponse } from './adapter.js';
import { SYSTEM_PROMPT, buildUserPrompt } from './prompts.js';

export class OpenAIProvider implements AIProvider {
  name = 'openai';
  private apiKey: string;
  private model: string;
  private maxTokens: number;
  private baseUrl: string;

  constructor(apiKey: string, model?: string, maxTokens?: number, baseUrl?: string) {
    this.apiKey = apiKey;
    this.model = model || 'gpt-4o';
    this.maxTokens = maxTokens || 1024;
    this.baseUrl = baseUrl || 'https://api.openai.com/v1';
  }

  async diagnose(ctx: DebugContext): Promise<AIFix> {
    const body = {
      model: this.model,
      max_tokens: this.maxTokens,
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(ctx) },
      ],
    };

    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI API error (${res.status}): ${err}`);
    }

    const data = await res.json() as any;
    const text = data.choices?.[0]?.message?.content || '';
    return parseAIResponse(text);
  }
}
