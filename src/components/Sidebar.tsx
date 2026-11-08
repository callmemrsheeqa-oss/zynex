/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X,
  Settings,
  Info,
  Search,
  PanelLeftClose,
  Download,
} from 'lucide-react';
import { Conversation } from '../types/chat';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onDeleteConversation: (id: string) => void;
  onExportConversation: (conv: Conversation) => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeId,
  onSelectConversation,
  onNewChat,
  onRenameConversation,
  onDeleteConversation,
  onExportConversation,
  onOpenSettings,
  onOpenAbout,
  isOpen,
  onToggle,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startEditing = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditingTitle(conv.title);
  };

  const handleSaveRename = (id: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (editingTitle.trim()) {
      onRenameConversation(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteId(id);
  };

  const confirmDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteConversation(id);
    setConfirmDeleteId(null);
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteId(null);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-xs lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200/90 bg-white transition-all duration-300 ease-in-out lg:static ${
          isOpen
            ? 'w-72 translate-x-0 shadow-xl lg:shadow-none opacity-100'
            : '-translate-x-full lg:translate-x-0 lg:w-0 lg:border-r-0 lg:opacity-0 lg:overflow-hidden'
        }`}
      >
        <div className="flex h-full w-72 flex-col">
          {/* Header Branding */}
          <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-violet-500 text-white shadow-sm ring-2 ring-indigo-50">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 tracking-tight">ZYNEX</span>
                  <span className="rounded-full bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-600 border border-indigo-100">
                    Assistant
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Intelligent Personal Chatbot</p>
              </div>
            </div>

            {/* Collapse toggle button */}
            <button
              onClick={onToggle}
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>

          {/* New Chat Button */}
          <div className="p-3">
            <button
              onClick={() => {
                onNewChat();
                if (window.innerWidth < 1024) onClose();
              }}
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-indigo-700 hover:to-blue-700 active:scale-[0.99] transition-all shadow-indigo-100"
            >
              <Plus className="h-4 w-4" />
              <span>New Chat</span>
            </button>
          </div>

          {/* Search bar */}
          {conversations.length > 2 && (
            <div className="px-3 pb-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search chats..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-7 text-xs text-slate-700 placeholder-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Recent Conversations List */}
          <div className="flex-1 overflow-y-auto px-2 py-1">
            <div className="px-2 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Recent Conversations
            </div>

            {filteredConversations.length === 0 ? (
              <div className="px-3 py-8 text-center">
                <MessageSquare className="mx-auto h-8 w-8 text-slate-300 stroke-[1.5]" />
                <p className="mt-2 text-xs font-medium text-slate-500">
                  {searchQuery ? 'No matching conversations' : 'No chats yet'}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  {searchQuery ? 'Try a different search keyword' : 'Start a new conversation above'}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredConversations.map((conv) => {
                  const isActive = conv.id === activeId;
                  const isEditing = editingId === conv.id;
                  const isDeleting = confirmDeleteId === conv.id;

                  if (isEditing) {
                    return (
                      <form
                        key={conv.id}
                        onSubmit={(e) => handleSaveRename(conv.id, e)}
                        className="flex items-center gap-1 rounded-xl bg-indigo-50/70 p-1.5 border border-indigo-200"
                      >
                        <input
                          type="text"
                          autoFocus
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="flex-1 rounded-md border-0 bg-white px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <button
                          type="submit"
                          title="Save title"
                          className="rounded p-1 text-emerald-600 hover:bg-emerald-50"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelRename}
                          title="Cancel"
                          className="rounded p-1 text-slate-400 hover:bg-slate-100"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </form>
                    );
                  }

                  if (isDeleting) {
                    return (
                      <div
                        key={conv.id}
                        className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50/80 p-2 text-xs text-rose-900"
                      >
                        <span className="truncate pr-1 text-[11px] font-medium">Delete chat?</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => confirmDelete(conv.id, e)}
                            className="rounded bg-rose-600 px-2 py-0.5 text-[11px] font-semibold text-white hover:bg-rose-700"
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={cancelDelete}
                            className="rounded bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:bg-slate-100 border border-slate-200"
                          >
                            No
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={conv.id}
                      onClick={() => {
                        onSelectConversation(conv.id);
                        if (window.innerWidth < 1024) onClose();
                      }}
                      role="button"
                      tabIndex={0}
                      className={`group relative flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors cursor-pointer select-none ${
                        isActive
                          ? 'bg-indigo-50/80 font-medium text-indigo-900 border border-indigo-100/80'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                      }`}
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-2.5">
                        <MessageSquare
                          className={`h-3.5 w-3.5 flex-shrink-0 ${
                            isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                          }`}
                        />
                        <span className="truncate">{conv.title}</span>
                      </div>

                      {/* Action buttons (Rename, Export, Delete) */}
                      <div className="ml-1 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => startEditing(conv, e)}
                          title="Rename conversation"
                          className="rounded p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onExportConversation(conv);
                          }}
                          title="Export as Markdown"
                          className="rounded p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700"
                        >
                          <Download className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteClick(conv.id, e)}
                          title="Delete conversation"
                          className="rounded p-1 text-slate-400 hover:bg-rose-100 hover:text-rose-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Navigation (Settings & About) */}
          <div className="border-t border-slate-100 p-2 space-y-0.5 bg-slate-50/50">
            <button
              onClick={onOpenSettings}
              type="button"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <Settings className="h-4 w-4 text-slate-400" />
              <span>Settings</span>
            </button>
            <button
              onClick={onOpenAbout}
              type="button"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <Info className="h-4 w-4 text-slate-400" />
              <span>About ZYNEX</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
