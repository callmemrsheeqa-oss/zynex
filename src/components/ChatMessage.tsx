/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  User,
  Copy,
  Check,
  RotateCw,
  AlertCircle,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { ChatMessage as ChatMessageType, FontSizePreference } from '../types/chat';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatMessageProps {
  message: ChatMessageType;
  fontSize: FontSizePreference;
  onRetry?: () => void;
  isLastAssistantMessage?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  fontSize,
  onRetry,
  isLastAssistantMessage,
}) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message.content);
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const fontSizeClass =
    fontSize === 'compact'
      ? 'text-xs md:text-sm'
      : fontSize === 'comfortable'
      ? 'text-base md:text-[17px]'
      : 'text-sm md:text-[15px]';

  return (
    <div
      className={`group w-full py-3.5 transition-colors ${
        isUser ? 'flex justify-end' : 'flex justify-start'
      }`}
    >
      <div
        className={`flex w-full max-w-3xl gap-3.5 ${
          isUser ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        {/* Avatar */}
        <div className="flex-shrink-0 pt-0.5">
          {isUser ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-slate-700 to-slate-900 text-white shadow-sm ring-2 ring-white">
              <User className="h-4 w-4" />
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-violet-500 text-white shadow-sm ring-2 ring-indigo-50">
              <Sparkles className="h-4 w-4" />
            </div>
          )}
        </div>

        {/* Message Bubble Container */}
        <div className={`flex flex-col min-w-0 ${isUser ? 'items-end' : 'items-start'} max-w-[88%]`}>
          {/* Header Name & Timestamp */}
          <div className="mb-1 flex items-center gap-2 px-1 text-[11px] font-medium text-slate-400">
            <span>{isUser ? 'You' : 'ZYNEX'}</span>
            <span>•</span>
            <span>{formattedTime}</span>
          </div>

          {/* Bubble Card */}
          <div
            className={`relative rounded-2xl px-4 py-3 shadow-sm transition-all ${
              isUser
                ? 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-tr-sm selection:bg-indigo-300 selection:text-indigo-950'
                : 'bg-white border border-slate-200/80 text-slate-900 rounded-tl-sm ring-1 ring-slate-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)]'
            }`}
          >
            {/* Error banner if message failed */}
            {message.error && (
              <div className="mb-3 flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-600" />
                <div className="flex-1">
                  <p className="font-semibold">Unable to complete response</p>
                  <p className="mt-0.5 text-rose-700">{message.error}</p>
                </div>
              </div>
            )}

            {/* Content */}
            <div className={`${fontSizeClass} ${isUser ? 'whitespace-pre-wrap leading-relaxed' : ''}`}>
              {isUser ? (
                message.content
              ) : (
                <>
                  <MarkdownRenderer content={message.content} />
                  {message.isStreaming && (
                    <span className="inline-flex items-center ml-1">
                      <span className="inline-block h-4 w-1.5 animate-pulse rounded-full bg-indigo-500"></span>
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Assistant Action Bar (Copy, Speak, Retry) */}
          {!isUser && (
            <div className="mt-1.5 flex items-center gap-1 px-1 text-slate-400 opacity-90 transition-opacity">
              <button
                onClick={handleCopy}
                type="button"
                title="Copy response"
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              {'speechSynthesis' in window && message.content && (
                <button
                  onClick={handleSpeak}
                  type="button"
                  title={isSpeaking ? 'Stop reading' : 'Read aloud'}
                  className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors ${
                    isSpeaking
                      ? 'bg-indigo-50 text-indigo-600 font-medium'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                  }`}
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="h-3.5 w-3.5" />
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-3.5 w-3.5" />
                      <span>Listen</span>
                    </>
                  )}
                </button>
              )}

              {isLastAssistantMessage && onRetry && (
                <button
                  onClick={onRetry}
                  type="button"
                  title="Retry generation"
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                  <span>Retry</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
