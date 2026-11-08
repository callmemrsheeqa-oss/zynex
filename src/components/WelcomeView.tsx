/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Sparkles,
  BookOpen,
  PenLine,
  Lightbulb,
  Wrench,
  ArrowUpRight,
  Edit3,
} from 'lucide-react';
import { SuggestionPrompt } from '../types/chat';

interface WelcomeViewProps {
  onSelectSuggestion: (prompt: string) => void;
  onPopulateInput: (prompt: string) => void;
}

const SUGGESTIONS: SuggestionPrompt[] = [
  {
    id: 'explain',
    category: 'explain',
    title: 'Explain a complex topic',
    description: 'Break down quantum computing, neural networks, or economic inflation in intuitive terms.',
    prompt: 'Explain quantum computing in simple, intuitive terms. What are qubits, superposition, and how will it change cryptography and computing in the real world?',
  },
  {
    id: 'write',
    category: 'write',
    title: 'Help me write something',
    description: 'Draft compelling emails, project proposals, essays, or professional communications.',
    prompt: 'Help me draft an engaging, professional product launch announcement email for our new productivity tool. Keep it concise, inspiring, and with a strong call-to-action.',
  },
  {
    id: 'ideas',
    category: 'ideas',
    title: 'Generate creative ideas',
    description: 'Brainstorm innovative app features, naming ideas, gift concepts, or business strategies.',
    prompt: 'Brainstorm 5 innovative, practical mobile app concepts that leverage AI to help individuals build sustainable daily habits. Include unique value propositions for each.',
  },
  {
    id: 'problem',
    category: 'problem',
    title: 'Help me solve a problem',
    description: 'Debug code, structure complex business decisions, or troubleshoot technical architectures.',
    prompt: 'I am experiencing performance bottlenecks in a web app with frequent re-renders and slow API calls. Walk me through a systematic troubleshooting framework to identify and resolve the issue.',
  },
];

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  onSelectSuggestion,
  onPopulateInput,
}) => {
  const getCategoryIcon = (category: SuggestionPrompt['category']) => {
    switch (category) {
      case 'explain':
        return <BookOpen className="h-5 w-5 text-blue-600" />;
      case 'write':
        return <PenLine className="h-5 w-5 text-indigo-600" />;
      case 'ideas':
        return <Lightbulb className="h-5 w-5 text-amber-500" />;
      case 'problem':
        return <Wrench className="h-5 w-5 text-emerald-600" />;
    }
  };

  const getCategoryBadge = (category: SuggestionPrompt['category']) => {
    switch (category) {
      case 'explain':
        return 'bg-blue-50 text-blue-700 border-blue-200/60';
      case 'write':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/60';
      case 'ideas':
        return 'bg-amber-50 text-amber-800 border-amber-200/60';
      case 'problem':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200/60';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center px-4 py-8 md:py-14 text-center max-w-4xl mx-auto">
      {/* ZYNEX Glow Icon */}
      <div className="relative mb-5">
        <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 blur-xl opacity-80" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-slate-200/80 shadow-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-violet-500 text-white shadow-inner">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Headings */}
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-2">
        How can I help you today?
      </h1>
      <p className="text-base sm:text-lg text-slate-500 max-w-md mb-8 sm:mb-10">
        Your intelligent personal assistant.
      </p>

      {/* Four Suggestion Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full max-w-2xl text-left">
        {SUGGESTIONS.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectSuggestion(item.prompt)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectSuggestion(item.prompt);
              }
            }}
            className="group relative flex flex-col justify-between p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-50/60 transition-all text-left duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-xl border ${getCategoryBadge(item.category)}`}>
                  {getCategoryIcon(item.category)}
                </div>

                <div className="flex items-center gap-1">
                  {/* Action to populate without sending */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPopulateInput(item.prompt);
                    }}
                    title="Populate into input box to edit"
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                  >
                    <Edit3 className="h-3 w-3" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>

                  <div className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                    <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </div>

              <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors text-sm mb-1">
                {item.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="mt-3.5 pt-2.5 border-t border-slate-100/90 flex items-center justify-between text-[11px] font-semibold text-indigo-600">
              <span className="group-hover:translate-x-0.5 transition-transform">Click to ask ZYNEX</span>
              <span>→</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
