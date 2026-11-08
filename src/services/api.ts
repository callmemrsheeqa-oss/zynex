/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChatMessage, AssistantPersona, GeminiModelPreference } from '../types/chat';

export interface ChatApiOptions {
  persona?: AssistantPersona;
  model?: GeminiModelPreference;
  customInstruction?: string;
}

export interface ServerStatusResponse {
  status: string;
  configured: boolean;
  connected: boolean;
  reason?: string;
  defaultModel: string;
  supportedModels: string[];
  name: string;
  version: string;
}

export interface StreamCompletionResult {
  text: string;
  ttft?: number;
  totalDuration?: number;
  model?: string;
}

/**
 * Checks server health and Gemini API key status
 */
export async function checkServerStatus(): Promise<ServerStatusResponse> {
  try {
    const res = await fetch('/api/status');
    if (!res.ok) {
      throw new Error(`Server returned status ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    return {
      status: 'error',
      configured: false,
      connected: false,
      reason: 'Cannot reach the ZYNEX server.',
      defaultModel: 'gemini-3.1-flash-lite',
      supportedModels: ['gemini-3.1-flash-lite', 'gemini-3.8-flash'],
      name: 'ZYNEX',
      version: '1.0.0',
    };
  }
}

/**
 * Stream chat completion from the server via SSE with performance metrics
 */
export async function streamChatCompletion({
  messages,
  options,
  onChunk,
  signal,
}: {
  messages: ChatMessage[];
  options?: ChatApiOptions;
  onChunk: (chunk: string) => void;
  signal?: AbortSignal;
}): Promise<StreamCompletionResult> {
  const clientStartTime = Date.now();
  const selectedModel = options?.model || 'gemini-3.1-flash-lite';

  console.log(
    `[PERF][Client] Request initiated for model=${selectedModel} at ${new Date(clientStartTime).toISOString()}`
  );

  const payload = {
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    model: selectedModel,
    persona: options?.persona || 'balanced',
    customInstruction: options?.customInstruction,
  };

  const response = await fetch('/api/chat/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    let errorMsg = `Server error (${response.status})`;
    try {
      const errorJson = await response.json();
      if (errorJson.error) {
        errorMsg = errorJson.error;
      }
    } catch {
      // Non-JSON response
    }
    throw new Error(errorMsg);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Unable to read streaming response from server.');
  }

  const decoder = new TextDecoder('utf-8');
  let accumulatedText = '';
  let buffer = '';
  let clientFirstChunkTime: number | null = null;
  let serverTtft: number | undefined;
  let serverTotalDuration: number | undefined;
  let serverModel: string | undefined;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;

      const dataStr = trimmed.slice(6);
      let parsed: any;
      try {
        parsed = JSON.parse(dataStr);
      } catch {
        continue; // ignore a malformed line
      }

      {
        if (parsed.error) {
          throw new Error(parsed.error);
        }

        if (parsed.text) {
          if (clientFirstChunkTime === null) {
            clientFirstChunkTime = Date.now();
            const clientTtft = clientFirstChunkTime - clientStartTime;
            console.log(
              `[PERF][Client] First chunk received in ${clientTtft}ms [model=${selectedModel}]`
            );
          }
          accumulatedText += parsed.text;
          onChunk(parsed.text);
        }

        if (parsed.done) {
          serverTtft = parsed.ttft;
          serverTotalDuration = parsed.totalDuration;
          serverModel = parsed.model;

          const clientTotalDuration = Date.now() - clientStartTime;
          console.log(
            `[PERF][Client] Stream completed in ${clientTotalDuration}ms (Server Duration: ${serverTotalDuration}ms, Server TTFT: ${serverTtft}ms) [model=${serverModel || selectedModel}]`
          );

          return {
            text: accumulatedText,
            ttft: serverTtft,
            totalDuration: serverTotalDuration || clientTotalDuration,
            model: serverModel || selectedModel,
          };
        }
      }
    }
  }

  // The stream closed without a "done" message: the reply is incomplete
  throw new Error('The response was interrupted before it finished. Please try again.');
}
