import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

const DEFAULT_MODEL = 'gemini-3.1-flash-lite';
const SUPPORTED_MODELS = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
const STREAM_TIMEOUT_MS = 60_000; // overall limit for one streamed reply
const STATUS_CACHE_MS = 60_000; // how long a live API check is reused

function resolveModel(requested?: string): string {
  return requested && SUPPORTED_MODELS.includes(requested) ? requested : DEFAULT_MODEL;
}

app.use(express.json({ limit: '1mb' }));

function logPerf(msg: string) {
  console.log(msg);
}

// Helper to get GoogleGenAI client with standard User-Agent header
function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  return new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Concise, high-signal system instruction to minimize prompt token overhead
function buildSystemInstruction(persona?: string, customInstruction?: string): string {
  let basePrompt =
    'You are ZYNEX, a fast, intelligent, and helpful personal assistant. Respond directly, clearly, and accurately using clean Markdown. Structure answers well and avoid unnecessary filler.';

  switch (persona) {
    case 'concise':
      basePrompt +=
        ' Maintain an ultra-concise tone. Prioritize brevity and high signal-to-noise ratio with compact bullet points.';
      break;
    case 'creative':
      basePrompt +=
        ' Adopt an engaging, creative tone. Offer inventive ideas, analogies, and fresh viewpoints.';
      break;
    case 'technical':
      basePrompt +=
        ' Adopt an expert engineering tone. Provide rigorous explanations and concise code snippets with language tags.';
      break;
    case 'balanced':
    default:
      basePrompt +=
        ' Maintain a professional, balanced tone. Be clear, insightful, and easy to read.';
      break;
  }

  if (customInstruction?.trim()) {
    basePrompt += `\nUser instructions: ${customInstruction.trim()}`;
  }

  return basePrompt;
}

// Convert conversation messages into Gemini format with context windowing (last 10 messages)
function formatMessagesForGemini(
  messages: Array<{ role: string; content: string }>,
  maxHistoryTurns = 10
): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> {
  const validMessages = messages.filter(
    (m) => m && typeof m.content === 'string' && m.content.trim().length > 0
  );

  // Window history to preserve relevant recent context without inflating token latency
  const windowed =
    validMessages.length > maxHistoryTurns
      ? validMessages.slice(-maxHistoryTurns)
      : validMessages;

  const formatted: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  for (const msg of windowed) {
    const role: 'user' | 'model' =
      msg.role === 'model' || msg.role === 'assistant' ? 'model' : 'user';

    // Gemini requires conversation to begin with a 'user' turn
    if (formatted.length === 0 && role === 'model') {
      continue;
    }

    formatted.push({
      role,
      parts: [{ text: msg.content.trim() }],
    });
  }

  return formatted;
}

// Translate raw API errors into helpful user messages
function formatUserFriendlyError(error: any): string {
  const msg = error?.message || '';
  if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
    return 'Rate limit reached or quota exhausted. Please wait a moment and try again.';
  }
  if (
    msg.includes('403') ||
    msg.includes('PERMISSION_DENIED') ||
    msg.includes('API_KEY_INVALID')
  ) {
    return 'Authentication error: Invalid or missing GEMINI_API_KEY. Please check the GEMINI_API_KEY value in your .env file.';
  }
  if (
    msg.includes('500') ||
    msg.includes('503') ||
    msg.includes('504') ||
    msg.includes('UNAVAILABLE')
  ) {
    return 'Google Gemini services are temporarily experiencing heavy load. Please retry in a few seconds.';
  }
  return msg || 'An error occurred while communicating with ZYNEX.';
}

function isTemporaryError(err: any): boolean {
  const status = err?.status || err?.statusCode || 0;
  const msg: string = err?.message || '';
  return (
    status === 429 ||
    status === 500 ||
    status === 503 ||
    status === 504 ||
    msg.includes('429') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('UNAVAILABLE')
  );
}

function isKeyConfigured(): boolean {
  const apiKey = process.env.GEMINI_API_KEY;
  return Boolean(apiKey && apiKey.trim() !== '' && apiKey !== 'MY_GEMINI_API_KEY');
}

// Live check (cached) so "connected" means the key really works, not just that it exists
let statusCache: { connected: boolean; reason?: string; at: number } | null = null;

async function checkGeminiConnection(): Promise<{ connected: boolean; reason?: string }> {
  if (!isKeyConfigured()) {
    return { connected: false, reason: 'GEMINI_API_KEY is missing.' };
  }
  if (statusCache && Date.now() - statusCache.at < STATUS_CACHE_MS) {
    return { connected: statusCache.connected, reason: statusCache.reason };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    await getGenAIClient().models.get({
      model: DEFAULT_MODEL,
      config: { abortSignal: controller.signal },
    });
    statusCache = { connected: true, at: Date.now() };
  } catch (err: any) {
    const reason = controller.signal.aborted
      ? 'Gemini API did not respond in time.'
      : formatUserFriendlyError(err);
    statusCache = { connected: false, reason, at: Date.now() };
  } finally {
    clearTimeout(timer);
  }
  return { connected: statusCache.connected, reason: statusCache.reason };
}

// Check configuration + live connection status
app.get('/api/status', async (_req: Request, res: Response) => {
  const { connected, reason } = await checkGeminiConnection();
  res.json({
    status: 'ok',
    configured: isKeyConfigured(),
    connected,
    reason,
    defaultModel: DEFAULT_MODEL,
    supportedModels: SUPPORTED_MODELS,
    name: 'ZYNEX',
    version: '1.0.0',
  });
});

// Stream Gemini chat response using Server-Sent Events (SSE)
app.post('/api/chat/stream', async (req: Request, res: Response) => {
  const reqStartTime = Date.now();
  const { messages, persona, customInstruction, model: requestedModel } = req.body;

  const targetModel = resolveModel(requestedModel);

  logPerf(
    `[PERF][Server] Request received for model=${targetModel} (${messages?.length || 0} messages) at ${new Date(reqStartTime).toISOString()}`
  );

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Messages array is required and must not be empty.' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_GEMINI_API_KEY') {
    res.status(400).json({
      error:
        'GEMINI_API_KEY is not configured on the server. Please add GEMINI_API_KEY to the .env file and restart the server.',
    });
    return;
  }

  // Format and window conversation context (last 10 turns max)
  const geminiContents = formatMessagesForGemini(messages, 10);
  if (geminiContents.length === 0) {
    res.status(400).json({ error: 'No valid user message found in the conversation.' });
    return;
  }

  // Set headers for SSE stream
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // One controller cancels the Gemini request on timeout OR when the browser disconnects
  const controller = new AbortController();
  let timedOut = false;
  const timeoutTimer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, STREAM_TIMEOUT_MS);

  res.on('close', () => {
    if (!res.writableEnded) {
      logPerf('[PERF][Server] Client disconnected, cancelling Gemini request.');
      controller.abort();
    }
  });

  const systemInstruction = buildSystemInstruction(persona, customInstruction);
  const config: any = { systemInstruction, abortSignal: controller.signal };
  if (targetModel === 'gemini-3.8-flash') {
    config.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
  }

  const maxRetries = 2;
  let attempt = 0;
  let firstChunkTime: number | null = null;
  let chunkCount = 0;

  try {
    const ai = getGenAIClient();

    while (true) {
      try {
        const responseStream = await ai.models.generateContentStream({
          model: targetModel,
          contents: geminiContents,
          config,
        });

        for await (const chunk of responseStream) {
          const text = chunk.text;
          if (text) {
            chunkCount++;
            if (firstChunkTime === null) {
              firstChunkTime = Date.now();
              logPerf(
                `[PERF][Server] TTFT: ${firstChunkTime - reqStartTime}ms [model=${targetModel}]`
              );
            }
            res.write(`data: ${JSON.stringify({ text })}\n\n`);
          }
        }
        break; // finished successfully
      } catch (err: any) {
        attempt++;
        // Retry only temporary errors, and only if nothing was sent to the user yet
        if (!controller.signal.aborted && isTemporaryError(err) && chunkCount === 0 && attempt <= maxRetries) {
          const backoffMs = Math.pow(2, attempt) * 600;
          console.warn(
            `[PERF][Server] Temporary error (${err?.status || err?.message}). Retry ${attempt}/${maxRetries} in ${backoffMs}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
          continue;
        }
        throw err;
      }
    }

    const totalDuration = Date.now() - reqStartTime;
    const ttft = firstChunkTime !== null ? firstChunkTime - reqStartTime : totalDuration;
    logPerf(
      `[PERF][Server] Completed in ${totalDuration}ms (TTFT: ${ttft}ms, ${chunkCount} chunks) [model=${targetModel}]`
    );
    res.write(
      `data: ${JSON.stringify({ done: true, ttft, totalDuration, model: targetModel })}\n\n`
    );
    res.end();
  } catch (error: any) {
    const totalDuration = Date.now() - reqStartTime;
    if (!timedOut && controller.signal.aborted) {
      // Browser left; nothing to send
      logPerf(`[PERF][Server] Stream cancelled by client after ${totalDuration}ms.`);
      if (!res.writableEnded) res.end();
      return;
    }
    console.error(`[PERF][Server] Error after ${totalDuration}ms:`, error?.message || error);
    const friendlyError = timedOut
      ? 'The response took too long and was stopped. Please try again.'
      : formatUserFriendlyError(error);
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ error: friendlyError })}\n\n`);
      res.end();
    }
  } finally {
    clearTimeout(timeoutTimer);
  }
});

// Non-streaming fallback endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  const reqStartTime = Date.now();
  const { messages, persona, customInstruction, model: requestedModel } = req.body;

  const targetModel = resolveModel(requestedModel);

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Messages array is required and must not be empty.' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_GEMINI_API_KEY') {
    res.status(400).json({
      error:
        'GEMINI_API_KEY is not configured on the server. Please add GEMINI_API_KEY to the .env file and restart the server.',
    });
    return;
  }

  const geminiContents = formatMessagesForGemini(messages, 10);
  if (geminiContents.length === 0) {
    res.status(400).json({ error: 'No valid user message found in the conversation.' });
    return;
  }

  try {
    const ai = getGenAIClient();
    const systemInstruction = buildSystemInstruction(persona, customInstruction);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), STREAM_TIMEOUT_MS);
    const config: any = {
      systemInstruction,
      abortSignal: controller.signal,
    };

    if (targetModel === 'gemini-3.8-flash') {
      config.thinkingConfig = {
        thinkingLevel: ThinkingLevel.LOW,
      };
    }

    let response;
    try {
      response = await ai.models.generateContent({
      model: targetModel,
      contents: geminiContents,
      config,
      });
    } finally {
      clearTimeout(timer);
    }

    const totalDuration = Date.now() - reqStartTime;
    console.log(
      `[PERF][Server] Non-streaming response completed in ${totalDuration}ms [model=${targetModel}]`
    );

    res.json({
      text: response.text || '',
      model: targetModel,
      totalDuration,
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({
      error: formatUserFriendlyError(error),
    });
  }
});

// Mount Vite or serve static files
async function startServer() {
  // When bundled (npm run build), this file lives inside dist/ next to index.html
  const isBundled = path.basename(__dirname) === 'dist';
  const isProduction = process.env.NODE_ENV === 'production' || isBundled;

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = isBundled ? __dirname : path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ZYNEX Server] Running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[ZYNEX Server] Failed to start:', err);
  process.exit(1);
});
