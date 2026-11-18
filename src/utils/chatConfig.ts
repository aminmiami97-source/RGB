import type { ScriptRelease } from '../types/script.ts';
import { CREDITS_LINE, EXECUTOR_URLS } from './scriptData.ts';

export const FALLBACK_FREE_MODELS = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemma-3-27b-it:free',
  'mistralai/mistral-small-3.1-24b-instruct:free',
  'qwen/qwen3-coder:free',
  'deepseek/deepseek-r1-0528:free',
  'openrouter/free',
] as const;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function extractFreeModelIds(
  modelsPayload: Array<{
    id?: string;
    pricing?: { prompt?: string; completion?: string };
  }>
): string[] {
  const freeIds = modelsPayload
    .filter((model) => {
      if (!model.id || typeof model.id !== 'string') {
        return false;
      }
      if (model.id.endsWith(':free')) {
        return true;
      }
      return model.pricing?.prompt === '0' && model.pricing?.completion === '0';
    })
    .map((model) => model.id as string);

  return freeIds.length > 0 ? freeIds : [...FALLBACK_FREE_MODELS];
}

export function pickRandomFreeModel(
  candidates: readonly string[],
  exclude: readonly string[] = [],
  randomFn: () => number = Math.random
): string {
  const pool = candidates.filter((id) => !exclude.includes(id));
  const source = pool.length > 0 ? pool : candidates;
  if (source.length === 0) {
    return 'openrouter/free';
  }
  const idx = Math.min(source.length - 1, Math.floor(randomFn() * source.length));
  return source[idx];
}

export function validateChatMessages(
  messages: unknown
): { valid: boolean; sanitized?: ChatMessage[]; error?: string } {
  if (!Array.isArray(messages) || messages.length === 0) {
    return { valid: false, error: 'Please enter a question about the RGB script.' };
  }

  const sanitized: ChatMessage[] = [];
  for (const item of messages.slice(-10)) {
    if (!item || typeof item !== 'object') {
      return { valid: false, error: 'Invalid message format.' };
    }
    const role = (item as { role?: unknown }).role;
    const content = (item as { content?: unknown }).content;
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') {
      return { valid: false, error: 'Invalid message role or content.' };
    }
    const trimmed = content.trim();
    if (!trimmed) {
      return { valid: false, error: 'Message cannot be empty.' };
    }
    if (trimmed.length > 1000) {
      return { valid: false, error: 'Message must be 1000 characters or fewer.' };
    }
    sanitized.push({ role, content: trimmed });
  }

  const last = sanitized[sanitized.length - 1];
  if (!last || last.role !== 'user') {
    return { valid: false, error: 'The latest message must come from the user.' };
  }

  return { valid: true, sanitized };
}

export function buildRgbSystemPrompt(
  releases: ScriptRelease[],
  latestVersion: string
): string {
  const recentHighlights =
    releases.length === 0
      ? `- Official script ${latestVersion} is released and available via Get Script (no additional changelog entries have been logged on the web feed yet).`
      : releases
          .slice(0, 3)
          .map(
            (rel) =>
              `- v${rel.version} (${rel.codename}): ${rel.summary} Changes: ${rel.changes
                .map((c) => `${c.title} [${c.category}]`)
                .join('; ')}`
          )
          .join('\n');

  return [
    'You are the official RGB Script Guide assistant.',
    'STRICT SCOPE RULE: You ONLY answer questions about the RGB (RGB SCRIPTS) Roblox script, its features, release versions, installation/copying via Get Script, Solara and Xeno executor compatibility, download links, and official credits.',
    'If the user asks about ANYTHING outside the RGB script (general programming help, math, news, unrelated games, other scripts, personal advice, recipes, trivia, etc.), politely refuse in 1-2 short sentences and invite them to ask about RGB SCRIPTS features, current version, or Solara and Xeno support.',
    '',
    'Verified RGB Script Facts:',
    `- Script Name: RGB (RGB SCRIPTS)`,
    `- Current Live Version: ${latestVersion}`,
    `- Release Availability: RELEASED & AVAILABLE NOW (users can click "Get Script" anywhere on the site to copy the live Lua script to their clipboard in one click or download the .lua file from the Dashboard).`,
    `- Supported Executors: Solara (${EXECUTOR_URLS.solara}) and Xeno (${EXECUTOR_URLS.xeno}).`,
    `- Key Features in RGB SCRIPTS (${latestVersion}): Plan Selection Menu (FREE plan unlocked forever with Box ESP, Tracer Lines, Health ESP; PRO & MAX tiers shown as coming/locked), Main tab with live Game Info (game icon, game name, and PlaceId via MarketplaceService), Visuals tab with instant Drawing ESP toggles (20 FPS cap and instant hide on toggle-off), Log tab with built-in script changelog (v1.4.0–v1.4.3), Credits tab, draggable window controls (minimize & close), responsive UIScale for mobile/desktop viewports, and real-time script updates synced live from the creator.`,
    `- Credits & Attribution: "${CREDITS_LINE}". Note: RGB5.6 Agrox is an AI model (not a human), and Alex is the human developer.`,
    '',
    'Recent Web Update Feed Notes:',
    recentHighlights,
    '',
    'Keep answers concise, clear, accurate, and friendly. Never invent unverified features or discuss topics unrelated to RGB SCRIPTS.',
  ].join('\n');
}
