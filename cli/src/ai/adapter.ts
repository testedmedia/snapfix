import type { AIFix, DebugContext } from '../types.js';

export interface AIProvider {
  name: string;
  diagnose(ctx: DebugContext): Promise<AIFix>;
}

export function parseAIResponse(raw: string): AIFix {
  // Strip markdown code fences if present
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  try {
    const parsed = JSON.parse(cleaned);
    return {
      diagnosis: parsed.diagnosis || 'Unable to determine root cause',
      fix_command: parsed.fix_command || '',
      fix_explanation: parsed.fix_explanation || '',
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
      risk: ['low', 'medium', 'high'].includes(parsed.risk) ? parsed.risk : 'medium',
      alternative: parsed.alternative || undefined,
    };
  } catch {
    // If AI returned plain text instead of JSON, try to extract a command
    const cmdMatch = cleaned.match(/`([^`]+)`/);
    return {
      diagnosis: cleaned.slice(0, 200),
      fix_command: cmdMatch ? cmdMatch[1] : '',
      fix_explanation: 'AI returned non-JSON response, extracted best guess',
      confidence: 0.3,
      risk: 'medium',
    };
  }
}
