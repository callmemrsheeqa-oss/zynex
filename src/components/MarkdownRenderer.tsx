/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { marked } from 'marked';
import { Check, Copy, Terminal } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

interface CodeBlockProps {
  language: string;
  code: string;
}

function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const displayLang = language.trim() || 'code';

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-slate-700/60 bg-slate-900 text-slate-100 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-2 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Terminal className="h-3.5 w-3.5 text-indigo-400" />
          <span className="font-mono uppercase tracking-wider text-[11px] font-semibold text-slate-400">
            {displayLang}
          </span>
        </div>
        <button
          onClick={handleCopy}
          type="button"
          aria-label="Copy code to clipboard"
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto p-4 text-[13px] leading-relaxed">
        <pre className="font-mono whitespace-pre text-slate-100">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Parse code blocks with regex: ```lang\ncode\n```
  const parts: Array<{ type: 'text' | 'code'; content: string; language?: string }> = [];

  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: content.substring(lastIndex, match.index),
      });
    }

    parts.push({
      type: 'code',
      language: match[1] || '',
      content: match[2],
    });

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      content: content.substring(lastIndex),
    });
  }

  // Configure marked for safe HTML formatting
  marked.setOptions({
    gfm: true,
    breaks: true,
  });

  return (
    <div className="markdown-body space-y-2">
      {parts.map((part, index) => {
        if (part.type === 'code') {
          return (
            <CodeBlock
              key={`code-${index}`}
              language={part.language || 'text'}
              code={part.content.replace(/\n$/, '')}
            />
          );
        }

        const html = marked.parse(part.content) as string;
        return (
          <div
            key={`text-${index}`}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}
    </div>
  );
};
