/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  error?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export type AssistantPersona = 'balanced' | 'concise' | 'creative' | 'technical';

export type FontSizePreference = 'compact' | 'standard' | 'comfortable';

export type GeminiModelPreference = 'gemini-3.1-flash-lite' | 'gemini-3.8-flash';

export interface AppSettings {
  persona: AssistantPersona;
  model: GeminiModelPreference;
  customInstruction: string;
  fontSize: FontSizePreference;
}

export interface SuggestionPrompt {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: 'explain' | 'write' | 'ideas' | 'problem';
}
