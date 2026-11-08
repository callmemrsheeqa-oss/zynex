/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  PanelLeft,
  Plus,
  Trash2,
  Download,
  Settings,
  Sparkles,
} from 'lucide-react';
import { Conversation, GeminiModelPreference } from '../types/chat';

interface HeaderProps {
  currentConversation: Conversation | null;
  onToggleSidebar: () => void;
  onNewChat: () => void;
  onClearChat: () => void;
  onExportChat: () => void;
  onOpenSettings: () => void;
  isConnected: boolean;
  statusReason?: string;
  model?: GeminiModelPreference;
}

export const Header: React.FC<HeaderProps> = ({
  currentConversation,
  onToggleSidebar,
  onNewChat,
  onClearChat,
  onExportChat,
  onOpenSettings,
  isConnected,
  statusReason,
  model = 'gemini-3.1-flash-lite',
}) => {
  const hasMessages = currentConversation && currentConversation.messages.length > 0;
  const modelLabel = model === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : 'Gemini 3.1 Flash Lite';

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          type="button"
          title="Toggle sidebar"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
        >
          <PanelLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 sm:hidden">
            <Sparkles className="h-4 w-4" />
          </div>
          <h2 className="truncate font-semibold text-slate-800 text-sm md:text-base">
            {currentConversation?.title || 'New Conversation'}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        {/* Gemini API Status Badge */}
        <div
          title={
            isConnected
              ? `${modelLabel} connected`
              : statusReason || 'Gemini API is not connected'
          }
          className="hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border border-slate-200 bg-slate-50"
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <span className="text-slate-600 text-[11px]">
            {isConnected ? modelLabel : 'Not Connected'}
          </span>
        </div>

        {hasMessages && (
          <>
            <button
              onClick={onExportChat}
              type="button"
              title="Export chat as Markdown"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            >
              <Download className="h-4 w-4" />
            </button>

            <button
              onClick={onClearChat}
              type="button"
              title="Clear messages in this chat"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        )}

        <button
          onClick={onNewChat}
          type="button"
          title="New Chat"
          className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New</span>
        </button>

        <button
          onClick={onOpenSettings}
          type="button"
          title="Settings"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};
