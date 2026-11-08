/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Conversation, AppSettings } from '../types/chat';

const STORAGE_KEY_CONVERSATIONS = 'astra_ai_conversations_v1';
const STORAGE_KEY_ACTIVE_ID = 'astra_ai_active_id_v1';
const STORAGE_KEY_SETTINGS = 'astra_ai_settings_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  persona: 'balanced',
  model: 'gemini-3.1-flash-lite',
  customInstruction: '',
  fontSize: 'standard',
};

export function loadStoredConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONVERSATIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to load conversations from localStorage:', error);
    return [];
  }
}

export function saveStoredConversations(conversations: Conversation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(conversations));
  } catch (error) {
    console.error('Failed to save conversations to localStorage:', error);
  }
}

export function loadStoredActiveId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
  } catch {
    return null;
  }
}

export function saveStoredActiveId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEY_ACTIVE_ID);
    }
  } catch (error) {
    console.error('Failed to save active conversation id:', error);
  }
}

export function loadStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings to localStorage:', error);
  }
}

export function createNewConversation(initialTitle = 'New Chat'): Conversation {
  return {
    id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    title: initialTitle,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function generateTitleFromMessage(content: string): string {
  const clean = content.replace(/\n+/g, ' ').trim();
  if (clean.length <= 40) return clean;
  return clean.slice(0, 38).trim() + '…';
}

export function exportConversationToMarkdown(conv: Conversation): void {
  const header = `# ${conv.title}\n*Exported from ZYNEX on ${new Date().toLocaleString()}*\n\n---\n\n`;
  const body = conv.messages
    .map((m) => {
      const speaker = m.role === 'user' ? '### 👤 User' : '### ✦ ZYNEX';
      const time = new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `${speaker} (${time})\n\n${m.content}\n\n---`;
    })
    .join('\n\n');

  const fullContent = header + body;
  const blob = new Blob([fullContent], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${conv.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
