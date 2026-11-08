/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Sparkles, Cpu, Layers, ShieldCheck, Zap } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-violet-500 text-white shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base">About ZYNEX</h3>
              <p className="text-[11px] text-slate-400">Personal Assistant Platform</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-600 leading-relaxed max-h-[70vh] overflow-y-auto">
          <p className="text-slate-700 text-sm">
            <strong className="text-slate-900">ZYNEX</strong> is a full-stack personal assistant built with React, Node.js, and powered by the latest Google Gemini API. Designed with a clean, distraction-free light aesthetic and intuitive conversational ergonomics.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <div className="flex items-center gap-2 font-semibold text-slate-900 mb-1">
                <Cpu className="h-4 w-4 text-indigo-600" />
                <span>Google Gemini 3.8 Flash</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Ultra-fast inference with deep contextual reasoning for coding, writing, and problem-solving.
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <div className="flex items-center gap-2 font-semibold text-slate-900 mb-1">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Server-Side Security</span>
              </div>
              <p className="text-[11px] text-slate-500">
                All API keys remain securely guarded in the backend environment and never touch the client.
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <div className="flex items-center gap-2 font-semibold text-slate-900 mb-1">
                <Zap className="h-4 w-4 text-amber-500" />
                <span>Real-Time Streaming</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Server-Sent Events deliver lightning-fast responses as they are generated.
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <div className="flex items-center gap-2 font-semibold text-slate-900 mb-1">
                <Layers className="h-4 w-4 text-blue-600" />
                <span>Local Storage Privacy</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Your chats are preserved directly in your browser without external database tracking.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 text-[11px] text-indigo-900">
            <strong>Key Features:</strong>
            <ul className="list-disc list-inside mt-1.5 space-y-0.5 text-indigo-800">
              <li>Multi-turn contextual reasoning & follow-up conversations</li>
              <li>Markdown rendering with syntax-highlighted code blocks & 1-click copy</li>
              <li>Speech synthesis (read response aloud)</li>
              <li>Multiple customizable assistant personas (Balanced, Concise, Creative, Technical)</li>
              <li>Export conversations to formatted Markdown</li>
              <li>Responsive layout optimized for mobile, tablet, and desktop</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-3 flex justify-between items-center text-[11px] text-slate-400">
          <span>ZYNEX v1.0.0</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
