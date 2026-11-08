/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from 'react';
import { ArrowUp, Square, X } from 'lucide-react';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: (text: string) => void;
  isLoading: boolean;
  onStop?: () => void;
  placeholder?: string;
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  onSend,
  isLoading,
  onStop,
  placeholder = 'Ask ZYNEX anything...',
  inputRef,
}) => {
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = inputRef || internalRef;

  // Auto-resize textarea height based on content up to 180px
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 180)}px`;
    }
  }, [input, textareaRef]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input.trim()) {
        onSend(input);
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading && onStop) {
      onStop();
      return;
    }
    if (input.trim()) {
      onSend(input);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4 pt-1">
      <form
        onSubmit={handleFormSubmit}
        className="relative rounded-2xl border border-slate-200/90 bg-white shadow-lg shadow-slate-100/70 transition-all focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100/80"
      >
        <div className="flex items-end px-3 py-2.5">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full resize-none border-0 bg-transparent px-2 py-1 text-sm md:text-[15px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-0 max-h-[180px] leading-relaxed"
          />

          <div className="flex items-center gap-1.5 pl-2 flex-shrink-0">
            {input.trim() && !isLoading && (
              <button
                type="button"
                onClick={() => setInput('')}
                title="Clear input"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {isLoading ? (
              <button
                type="button"
                onClick={onStop}
                title="Stop generating"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                title="Send message (Enter)"
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all shadow-sm focus:outline-none ${
                  input.trim()
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 active:scale-95 shadow-indigo-200 cursor-pointer'
                    : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                }`}
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Footer shortcuts info */}
        <div className="flex items-center justify-between border-t border-slate-100/90 px-4 py-1.5 text-[11px] text-slate-400 select-none">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">Enter</kbd> to send
            </span>
            <span>
              <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">Shift + Enter</kbd> for new line
            </span>
          </div>
          <span className="hidden sm:inline text-slate-400 font-medium">
            ZYNEX Assistant
          </span>
        </div>
      </form>
      <div className="mt-2 text-center text-[11px] text-slate-400 select-none">
        ZYNEX can assist with coding, writing, reasoning, and problem solving.
      </div>
    </div>
  );
};
