/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  loadStoredConversations,
  saveStoredConversations,
  loadStoredActiveId,
  saveStoredActiveId,
  loadStoredSettings,
  saveStoredSettings,
  createNewConversation,
  generateTitleFromMessage,
  exportConversationToMarkdown,
} from './services/storage';
import { checkServerStatus, streamChatCompletion } from './services/api';
import { Conversation, ChatMessage as ChatMessageType, AppSettings } from './types/chat';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { WelcomeView } from './components/WelcomeView';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { LoadingIndicator } from './components/LoadingIndicator';
import { SettingsModal } from './components/SettingsModal';
import { AboutModal } from './components/AboutModal';
import { ChevronDown } from 'lucide-react';

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(loadStoredSettings());
  const [isConnected, setIsConnected] = useState(true);
  const [statusReason, setStatusReason] = useState<string | undefined>(undefined);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize conversations from localStorage and check backend status
  useEffect(() => {
    const storedConvs = loadStoredConversations();
    const storedActiveId = loadStoredActiveId();

    if (storedConvs.length > 0) {
      setConversations(storedConvs);
      if (storedActiveId && storedConvs.some((c) => c.id === storedActiveId)) {
        setActiveId(storedActiveId);
      } else {
        setActiveId(storedConvs[0].id);
      }
    } else {
      const initial = createNewConversation();
      setConversations([initial]);
      setActiveId(initial.id);
      saveStoredConversations([initial]);
      saveStoredActiveId(initial.id);
    }

    // Check server status
    checkServerStatus().then((status) => {
      setIsConnected(status.connected);
      setStatusReason(status.reason);
    });
  }, []);

  // Persist conversations to localStorage
  useEffect(() => {
    if (conversations.length > 0) {
      saveStoredConversations(conversations);
    }
  }, [conversations]);

  // Persist active conversation id
  useEffect(() => {
    saveStoredActiveId(activeId);
  }, [activeId]);

  // Settings update handler
  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
  };

  const currentConversation = conversations.find((c) => c.id === activeId) || null;

  // Auto-scroll to bottom of chat
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    scrollToBottom('smooth');
  }, [currentConversation?.messages.length, isLoading, scrollToBottom]);

  // Track scroll position to show floating "scroll to bottom" button
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;
    setShowScrollBottom(distanceToBottom > 160);
  };

  // Stop any active generation
  const handleStopGenerating = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    if (activeId) {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== activeId) return c;
          const messages = [...c.messages];
          if (messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
            messages[messages.length - 1] = {
              ...messages[messages.length - 1],
              isStreaming: false,
            };
          }
          return { ...c, messages };
        })
      );
    }
  }, [activeId]);

  // Start a fresh new chat
  const handleNewChat = () => {
    if (isLoading) {
      handleStopGenerating();
    }
    setInput('');

    // If current conversation is already blank, keep it and focus input
    if (currentConversation && currentConversation.messages.length === 0) {
      textareaRef.current?.focus();
      return;
    }

    const newConv = createNewConversation();
    const updated = [newConv, ...conversations];
    setConversations(updated);
    setActiveId(newConv.id);
    saveStoredConversations(updated);
    saveStoredActiveId(newConv.id);

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  const handleSelectConversation = (id: string) => {
    if (isLoading) {
      handleStopGenerating();
    }
    setActiveId(id);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c))
    );
  };

  const handleDeleteConversation = (id: string) => {
    if (isLoading && activeId === id) {
      handleStopGenerating();
    }
    const remaining = conversations.filter((c) => c.id !== id);
    if (remaining.length === 0) {
      const fallback = createNewConversation();
      setConversations([fallback]);
      setActiveId(fallback.id);
    } else {
      setConversations(remaining);
      if (activeId === id) {
        setActiveId(remaining[0].id);
      }
    }
  };

  const handleClearCurrentChat = () => {
    if (!activeId) return;
    if (isLoading) {
      handleStopGenerating();
    }
    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, messages: [], updatedAt: Date.now() } : c))
    );
  };

  const handleClearAllConversations = () => {
    if (isLoading) {
      handleStopGenerating();
    }
    const fresh = createNewConversation();
    setConversations([fresh]);
    setActiveId(fresh.id);
    saveStoredConversations([fresh]);
    saveStoredActiveId(fresh.id);
  };

  const handleExportCurrentChat = () => {
    if (currentConversation) {
      exportConversationToMarkdown(currentConversation);
    }
  };

  // Populate suggestion card prompt into the input area for user to tweak
  const handlePopulateInput = (prompt: string) => {
    setInput(prompt);
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(prompt.length, prompt.length);
    }, 50);
  };

  // Send a message to ZYNEX
  const handleSend = async (textToSend: string) => {
    const cleanText = textToSend.trim();
    if (!cleanText || isLoading) return;

    setInput('');

    // Ensure we have an active conversation
    let convId = activeId;
    let targetConv = currentConversation;

    if (!convId || !targetConv) {
      const created = createNewConversation(generateTitleFromMessage(cleanText));
      convId = created.id;
      targetConv = created;
      setConversations((prev) => [created, ...prev]);
      setActiveId(created.id);
    }

    const userMessage: ChatMessageType = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: cleanText,
      timestamp: Date.now(),
    };

    const assistantMessageId = `msg_ast_${Date.now() + 1}`;
    const initialAssistantMessage: ChatMessageType = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    const updatedMessages = [...targetConv.messages, userMessage, initialAssistantMessage];

    // Auto-update conversation title from the first prompt
    const isFirstMessage = targetConv.messages.length === 0;
    const newTitle = isFirstMessage ? generateTitleFromMessage(cleanText) : targetConv.title;

    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? {
              ...c,
              title: newTitle,
              messages: updatedMessages,
              updatedAt: Date.now(),
            }
          : c
      )
    );

    setIsLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let accumulatedContent = '';

    try {
      // Build conversation context turns for the backend
      const contextMessages = [...targetConv.messages, userMessage];

      await streamChatCompletion({
        messages: contextMessages,
        options: {
          model: settings.model,
          persona: settings.persona,
          customInstruction: settings.customInstruction,
        },
        signal: controller.signal,
        onChunk: (chunk) => {
          accumulatedContent += chunk;
          setConversations((prev) =>
            prev.map((c) => {
              if (c.id !== convId) return c;
              const msgs = [...c.messages];
              const targetIdx = msgs.findIndex((m) => m.id === assistantMessageId);
              if (targetIdx !== -1) {
                msgs[targetIdx] = {
                  ...msgs[targetIdx],
                  content: accumulatedContent,
                  isStreaming: true,
                };
              }
              return { ...c, messages: msgs };
            })
          );
        },
      });

      // Streaming finished successfully
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== convId) return c;
          const msgs = [...c.messages];
          const targetIdx = msgs.findIndex((m) => m.id === assistantMessageId);
          if (targetIdx !== -1) {
            msgs[targetIdx] = {
              ...msgs[targetIdx],
              content: accumulatedContent,
              isStreaming: false,
            };
          }
          return { ...c, messages: msgs, updatedAt: Date.now() };
        })
      );
      setIsConnected(true);
      setStatusReason(undefined);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return;
      }
      console.error('Failed to generate response:', err);
      const errorMessage =
        err?.message || 'An error occurred while communicating with the assistant.';

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== convId) return c;
          const msgs = [...c.messages];
          const targetIdx = msgs.findIndex((m) => m.id === assistantMessageId);
          if (targetIdx !== -1) {
            msgs[targetIdx] = {
              ...msgs[targetIdx],
              content:
                accumulatedContent ||
                'I was unable to complete this response. Please check your network connection and try again.',
              isStreaming: false,
              error: errorMessage,
            };
          }
          return { ...c, messages: msgs };
        })
      );
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Retry the last turn
  const handleRetry = () => {
    if (!currentConversation || currentConversation.messages.length === 0 || isLoading) return;

    const msgs = currentConversation.messages;
    let lastUserMsgIdx = -1;
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === 'user') {
        lastUserMsgIdx = i;
        break;
      }
    }

    if (lastUserMsgIdx === -1) return;

    const userPrompt = msgs[lastUserMsgIdx].content;
    const trimmedMessages = msgs.slice(0, lastUserMsgIdx);

    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, messages: trimmedMessages } : c))
    );

    setTimeout(() => {
      handleSend(userPrompt);
    }, 50);
  };

  const isCurrentChatEmpty = !currentConversation || currentConversation.messages.length === 0;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Collapsible Sidebar */}
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onRenameConversation={handleRenameConversation}
        onDeleteConversation={handleDeleteConversation}
        onExportConversation={exportConversationToMarkdown}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((prev) => !prev)}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Chat Interface */}
      <div className="flex flex-1 flex-col h-full min-w-0 bg-white">
        {/* Sticky Header */}
        <Header
          currentConversation={currentConversation}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onNewChat={handleNewChat}
          onClearChat={handleClearCurrentChat}
          onExportChat={handleExportCurrentChat}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isConnected={isConnected}
          statusReason={statusReason}
          model={settings.model}
        />

        {/* Scrollable Conversation Canvas */}
        <main
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 md:px-6 relative"
        >
          {isCurrentChatEmpty ? (
            <WelcomeView
              onSelectSuggestion={(prompt) => handleSend(prompt)}
              onPopulateInput={handlePopulateInput}
            />
          ) : (
            <div className="mx-auto max-w-3xl py-6 space-y-2">
              {currentConversation.messages.map((msg, index) => {
                const isLastAssistant =
                  msg.role === 'assistant' &&
                  index === currentConversation.messages.length - 1;

                // If this is the last assistant message and it's still waiting for its first chunk, show LoadingIndicator
                if (isLastAssistant && isLoading && !msg.content) {
                  return <LoadingIndicator key={msg.id} />;
                }

                return (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    fontSize={settings.fontSize}
                    isLastAssistantMessage={isLastAssistant}
                    onRetry={handleRetry}
                  />
                );
              })}

              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}

          {/* Floating Scroll-to-Bottom Button */}
          {showScrollBottom && (
            <button
              onClick={() => scrollToBottom('smooth')}
              type="button"
              aria-label="Scroll to newest messages"
              className="sticky bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-lg backdrop-blur-xs hover:bg-slate-50 transition-all z-20 cursor-pointer"
            >
              <ChevronDown className="h-3.5 w-3.5" />
              <span>Scroll to bottom</span>
            </button>
          )}
        </main>

        {/* Chat Input Dock */}
        <footer className="border-t border-slate-100 bg-white/80 backdrop-blur-md">
          <ChatInput
            input={input}
            setInput={setInput}
            onSend={handleSend}
            isLoading={isLoading}
            onStop={handleStopGenerating}
            inputRef={textareaRef}
          />
        </footer>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onClearAllConversations={handleClearAllConversations}
        isConnected={isConnected}
        statusReason={statusReason}
      />

      {/* About ZYNEX Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
    </div>
  );
}
