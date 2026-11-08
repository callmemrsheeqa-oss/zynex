/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles } from 'lucide-react';

export const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex w-full justify-start py-3.5 animate-in fade-in duration-200">
      <div className="flex w-full max-w-3xl gap-3.5">
        {/* Avatar */}
        <div className="flex-shrink-0 pt-0.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-violet-500 text-white shadow-sm ring-2 ring-indigo-50 animate-pulse">
            <Sparkles className="h-4 w-4" />
          </div>
        </div>

        {/* Loading Card */}
        <div className="flex flex-col items-start min-w-0 max-w-[88%]">
          <div className="mb-1 flex items-center gap-2 px-1 text-[11px] font-medium text-slate-400">
            <span>ZYNEX</span>
            <span>•</span>
            <span className="text-indigo-600 font-semibold animate-pulse">Thinking...</span>
          </div>

          <div className="rounded-2xl rounded-tl-sm border border-slate-200/80 bg-white px-5 py-4 text-slate-900 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] ring-1 ring-slate-100">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="ml-2 text-xs font-medium text-slate-400 select-none">
                Crafting response...
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
