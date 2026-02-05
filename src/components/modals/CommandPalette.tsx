'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Inbox,
  Users,
  MessageSquare,
  FileText,
  Plus,
  Home,
  BarChart3,
  Settings,
  BookOpen,
} from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { useCasesStore } from '@/stores/cases-store';
import { useProvidersStore } from '@/stores/providers-store';
import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';

interface CommandItem {
  id: string;
  type: 'navigation' | 'action' | 'case' | 'provider' | 'article';
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
  keywords?: string[];
}

export function CommandPalette() {
  const router = useRouter();
  const { activeModal, closeModal, openModal } = useUIStore();
  const { cases } = useCasesStore();
  const { providers } = useProvidersStore();
  const { knowledgeArticles } = useAppStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const isOpen = activeModal === 'command_palette';

  // Navigation commands
  const navigationCommands: CommandItem[] = [
    { id: 'nav-home', type: 'navigation', title: 'Go to Home', icon: <Home className="w-4 h-4" />, action: () => router.push('/home'), keywords: ['dashboard', 'command center'] },
    { id: 'nav-cases', type: 'navigation', title: 'Go to Cases', icon: <Inbox className="w-4 h-4" />, action: () => router.push('/cases'), keywords: ['queue', 'work'] },
    { id: 'nav-providers', type: 'navigation', title: 'Go to Providers', icon: <Users className="w-4 h-4" />, action: () => router.push('/providers'), keywords: ['directory'] },
    { id: 'nav-interactions', type: 'navigation', title: 'Go to Interactions', icon: <MessageSquare className="w-4 h-4" />, action: () => router.push('/interactions'), keywords: ['calls', 'emails'] },
    { id: 'nav-reports', type: 'navigation', title: 'Go to Reports', icon: <BarChart3 className="w-4 h-4" />, action: () => router.push('/reports'), keywords: ['analytics', 'dashboard'] },
    { id: 'nav-knowledge', type: 'navigation', title: 'Go to Knowledge Base', icon: <BookOpen className="w-4 h-4" />, action: () => router.push('/knowledge'), keywords: ['articles', 'help'] },
    { id: 'nav-admin', type: 'navigation', title: 'Go to Admin', icon: <Settings className="w-4 h-4" />, action: () => router.push('/admin'), keywords: ['settings', 'config'] },
  ];

  // Action commands
  const actionCommands: CommandItem[] = [
    { id: 'action-new-case', type: 'action', title: 'Create New Case', icon: <Plus className="w-4 h-4" />, action: () => openModal('create_case'), keywords: ['add', 'new'] },
    { id: 'action-log-interaction', type: 'action', title: 'Log Interaction', icon: <MessageSquare className="w-4 h-4" />, action: () => openModal('create_interaction'), keywords: ['call', 'email', 'log'] },
  ];

  // Dynamic search results
  const getSearchResults = useCallback((): CommandItem[] => {
    if (!query || query.length < 2) {
      return [...actionCommands, ...navigationCommands];
    }

    const lowerQuery = query.toLowerCase();
    const results: CommandItem[] = [];

    // Search cases
    const matchingCases = cases
      .filter(c =>
        c.id.toLowerCase().includes(lowerQuery) ||
        c.title.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 5)
      .map(c => ({
        id: `case-${c.id}`,
        type: 'case' as const,
        title: c.id,
        subtitle: c.title,
        icon: <Inbox className="w-4 h-4" />,
        action: () => router.push(`/cases?selected=${c.id}`),
      }));
    results.push(...matchingCases);

    // Search providers
    const matchingProviders = providers
      .filter(p =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.npi.includes(query)
      )
      .slice(0, 5)
      .map(p => ({
        id: `provider-${p.id}`,
        type: 'provider' as const,
        title: p.name,
        subtitle: `NPI: ${p.npi}`,
        icon: <Users className="w-4 h-4" />,
        action: () => router.push(`/providers/${p.id}`),
      }));
    results.push(...matchingProviders);

    // Search knowledge articles
    const matchingArticles = knowledgeArticles
      .filter(a =>
        a.title.toLowerCase().includes(lowerQuery) ||
        a.tags.some(t => t.toLowerCase().includes(lowerQuery))
      )
      .slice(0, 3)
      .map(a => ({
        id: `article-${a.id}`,
        type: 'article' as const,
        title: a.title,
        subtitle: a.category,
        icon: <FileText className="w-4 h-4" />,
        action: () => router.push(`/knowledge?article=${a.id}`),
      }));
    results.push(...matchingArticles);

    // Filter navigation and actions
    const matchingNav = navigationCommands.filter(c =>
      c.title.toLowerCase().includes(lowerQuery) ||
      c.keywords?.some(k => k.toLowerCase().includes(lowerQuery))
    );
    const matchingActions = actionCommands.filter(c =>
      c.title.toLowerCase().includes(lowerQuery) ||
      c.keywords?.some(k => k.toLowerCase().includes(lowerQuery))
    );

    results.push(...matchingActions, ...matchingNav);

    return results;
  }, [query, cases, providers, knowledgeArticles, router, openModal]);

  const results = getSearchResults();

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        results[selectedIndex].action();
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  // Reset on query change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Global Cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          closeModal();
        } else {
          openModal('command_palette');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, openModal, closeModal]);

  const handleClose = () => {
    setQuery('');
    setSelectedIndex(0);
    closeModal();
  };

  const getTypeLabel = (type: CommandItem['type']) => {
    switch (type) {
      case 'case': return 'Case';
      case 'provider': return 'Provider';
      case 'article': return 'Article';
      case 'action': return 'Action';
      case 'navigation': return 'Navigate';
      default: return '';
    }
  };

  const getTypeColor = (type: CommandItem['type']) => {
    switch (type) {
      case 'case': return 'bg-blue-100 text-blue-700';
      case 'provider': return 'bg-purple-100 text-purple-700';
      case 'article': return 'bg-green-100 text-green-700';
      case 'action': return 'bg-orange-100 text-orange-700';
      case 'navigation': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[550px] p-0 gap-0 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center border-b px-4">
          <Search className="w-4 h-4 text-slate-400 mr-3" />
          <Input
            placeholder="Search cases, providers, or type a command..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 px-0 py-4"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-slate-100 px-1.5 font-mono text-[10px] font-medium text-slate-600">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-auto p-2">
          {results.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No results found</p>
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => {
                    item.action();
                    handleClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                    selectedIndex === index
                      ? 'bg-blue-50 text-blue-900'
                      : 'hover:bg-slate-50'
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center',
                    selectedIndex === index ? 'bg-blue-100' : 'bg-slate-100'
                  )}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    {item.subtitle && (
                      <p className="text-xs text-slate-500 truncate">{item.subtitle}</p>
                    )}
                  </div>
                  <Badge className={cn('text-[10px]', getTypeColor(item.type))} size="sm">
                    {getTypeLabel(item.type)}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-2 flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px]">↑↓</kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px]">↵</kbd>
            Select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px]">esc</kbd>
            Close
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
