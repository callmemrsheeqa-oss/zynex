/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, ShieldCheck, Trash2, Sliders, Type, Bot, Cpu } from 'lucide-react';
import { AppSettings, AssistantPersona, FontSizePreference } from '../types/chat';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onClearAllConversations: () => void;
  isConnected: boolean;
  statusReason?: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onClearAllConversations,
  isConnected,
  statusReason,
}) => {
  if (!isOpen) return null;

  const personas: Array<{ id: AssistantPersona; label: string; desc: string }> = [
    {
      id: 'balanced',
      label: 'Balanced',
      desc: 'Warm, clear, and comprehensive responses.',
    },
    {
      id: 'concise',
      label: 'Concise',
      desc: 'Direct, brief, high signal-to-noise ratio.',
    },
    {
      id: 'creative',
      label: 'Creative',
      desc: 'Imaginative ideas, rich analogies, and concepts.',
    },
    {
      id: 'technical',
      label: 'Technical',
      desc: 'Engineering depth, code standards, and accuracy.',
    },
  ];

  const fontSizes: Array<{ id: FontSizePreference; label: string }> = [
    { id: 'compact', label: 'Compact' },
    { id: 'standard', label: 'Standard' },
    { id: 'comfortable', label: 'Comfortable' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-indigo-600" />
            <h3 className="font-semibold text-slate-900 text-base">Assistant Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="max-h-[75vh] overflow-y-auto p-6 space-y-6">
          {/* Persona selector */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              <Bot className="h-4 w-4 text-indigo-600" />
              <span>Assistant Persona</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {personas.map((p) => {
                const isSelected = settings.persona === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onUpdateSettings({ ...settings, persona: p.id })}
                    className={`rounded-xl p-3 text-left border transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-semibold ${isSelected ? 'text-indigo-900' : 'text-slate-900'}`}>
                        {p.label}
                      </span>
                      {isSelected && (
                        <span className="h-2 w-2 rounded-full bg-indigo-600" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">{p.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gemini Model selection */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              <Cpu className="h-4 w-4 text-indigo-600" />
              <span>Gemini Model Engine</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => onUpdateSettings({ ...settings, model: 'gemini-3.1-flash-lite' })}
                className={`rounded-xl p-3 text-left border transition-all ${
                  settings.model === 'gemini-3.1-flash-lite'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-semibold ${settings.model === 'gemini-3.1-flash-lite' ? 'text-indigo-900' : 'text-slate-900'}`}>
                    3.1 Flash Lite
                  </span>
                  {settings.model === 'gemini-3.1-flash-lite' && (
                    <span className="h-2 w-2 rounded-full bg-indigo-600" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Ultra-fast, sub-second streaming for real-time interaction.
                </p>
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ ...settings, model: 'gemini-3.8-flash' })}
                className={`rounded-xl p-3 text-left border transition-all ${
                  settings.model === 'gemini-3.8-flash'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-semibold ${settings.model === 'gemini-3.8-flash' ? 'text-indigo-900' : 'text-slate-900'}`}>
                    3.8 Flash
                  </span>
                  {settings.model === 'gemini-3.8-flash' && (
                    <span className="h-2 w-2 rounded-full bg-indigo-600" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Deeper reasoning for complex problems. Slower to start replying.
                </p>
              </button>
            </div>
          </div>
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              <Type className="h-4 w-4 text-indigo-600" />
              <span>Message Font Size</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {fontSizes.map((f) => {
                const isSelected = settings.fontSize === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => onUpdateSettings({ ...settings, fontSize: f.id })}
                    className={`rounded-xl py-2 px-3 text-center border text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Instruction */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Custom Instructions (Optional)
            </label>
            <textarea
              rows={3}
              value={settings.customInstruction}
              onChange={(e) =>
                onUpdateSettings({ ...settings, customInstruction: e.target.value })
              }
              placeholder="e.g. Always include code examples in TypeScript; format answers as concise summaries..."
              className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Injected into ZYNEX's system instructions to tailor every response.
            </p>
          </div>

          {/* Security & API Status */}
          <div className="rounded-xl border border-slate-200/90 bg-slate-50/60 p-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 mb-1">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Server-Side Security</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              API requests are routed through the secure Node.js backend. Your Google Gemini
              credentials remain server-side and are never exposed to browser scripts.
            </p>
            <div className="mt-2.5 flex items-center justify-between border-t border-slate-200/70 pt-2 text-[11px]">
              <span className="text-slate-500">API Key Status:</span>
              <span
                className={`font-semibold ${
                  isConnected ? 'text-emerald-600' : 'text-amber-600'
                }`}
              >
                {isConnected
                  ? `Connected (${settings.model === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : 'Gemini 3.1 Flash Lite'})`
                  : statusReason || 'Not connected'}
              </span>
            </div>
          </div>

          {/* Danger Zone: Clear all conversations */}
          <div className="border-t border-slate-100 pt-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-rose-500 mb-2">
              Data Management
            </label>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete all saved conversations? This cannot be undone.')) {
                  onClearAllConversations();
                  onClose();
                }
              }}
              className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/50 px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-100/60 transition-colors"
            >
              <Trash2 className="h-4 w-4 text-rose-600" />
              <span>Clear All Conversations from Browser</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
