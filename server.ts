import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import type { ScriptRelease } from './src/types/script.ts';
import {
  FALLBACK_FREE_MODELS,
  buildRgbSystemPrompt,
  extractFreeModelIds,
  pickRandomFreeModel,
  validateChatMessages,
} from './src/utils/chatConfig.ts';
import { INITIAL_RELEASES } from './src/utils/scriptData.ts';
import { DEFAULT_SCRIPT_VERSION } from './src/utils/officialScript.ts';

const PORT = Number(process.env.PORT || 3000);
const OPENROUTER_CHAT_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODELS_URL = 'https://openrouter.ai/api/v1/models';

let cachedFreeModels: string[] = [...FALLBACK_FREE_MODELS];
let lastModelsFetchMs = 0;
const MODEL_CACHE_TTL_MS = 10 * 60 * 1000;

async function getFreeOpenRouterModels(apiKey: string): Promise<string[]> {
  const now = Date.now();
  if (now - lastModelsFetchMs < MODEL_CACHE_TTL_MS && cachedFreeModels.length > 0) {
    return cachedFreeModels;
  }

  try {
    const response = await fetch(OPENROUTER_MODELS_URL, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(5000),
    });
    if (response.ok) {
      const payload = (await response.json()) as {
        data?: Array<{ id?: string; pricing?: { prompt?: string; completion?: string } }>;
      };
      if (Array.isArray(payload.data)) {
        cachedFreeModels = extractFreeModelIds(payload.data);
        lastModelsFetchMs = now;
      }
    }
  } catch {
    // Keep fallback free models if model catalog lookup times out
  }

  return cachedFreeModels;
}

async function queryOpenRouterModel(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<{ ok: boolean; reply?: string; status?: number; errorText?: string }> {
  const response = await fetch(OPENROUTER_CHAT_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-Title': 'RGB Script Hub',
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      max_tokens: 450,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
    }),
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    return { ok: false, status: response.status, errorText };
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const reply = data.choices?.[0]?.message?.content?.trim();
  if (!reply) {
    return { ok: false, status: 502, errorText: 'Empty response from model.' };
  }

  return { ok: true, reply };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '64kb' }));

  app.post('/api/chat', async (req, res) => {
    const apiKey = process.env.RGB?.trim();
    if (!apiKey) {
      res.status(503).json({
        error: "OpenRouter secret 'RGB' is not configured on the server.",
      });
      return;
    }

    const body = req.body as {
      messages?: unknown;
      releases?: ScriptRelease[];
      latestVersion?: string;
    };

    const validation = validateChatMessages(body?.messages);
    if (!validation.valid || !validation.sanitized) {
      res.status(400).json({ error: validation.error ?? 'Invalid request.' });
      return;
    }

    const releases =
      Array.isArray(body?.releases) && body.releases.length > 0
        ? body.releases
        : INITIAL_RELEASES;
    const latestVersion =
      typeof body?.latestVersion === 'string' && body.latestVersion.trim()
        ? body.latestVersion.trim()
        : DEFAULT_SCRIPT_VERSION;

    const systemPrompt = buildRgbSystemPrompt(releases, latestVersion);
    const freeModels = await getFreeOpenRouterModels(apiKey);

    const attempted: string[] = [];
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const model = pickRandomFreeModel(freeModels, attempted);
      attempted.push(model);

      try {
        const result = await queryOpenRouterModel(
          apiKey,
          model,
          systemPrompt,
          validation.sanitized
        );
        if (result.ok && result.reply) {
          res.json({
            reply: result.reply,
            model,
          });
          return;
        }
      } catch {
        // Try another random free model
      }
    }

    res.status(502).json({
      error: 'Free OpenRouter models are currently busy. Please try again in a moment.',
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(import.meta.dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found. Run npm run build first.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RGB server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start RGB server:', err);
  process.exit(1);
});
