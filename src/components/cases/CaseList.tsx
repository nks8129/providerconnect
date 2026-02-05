'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, ChevronDown, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCasesStore } from '@/stores/cases-store';
import { useProvidersStore } from '@/stores/providers-store';
import { useAppStore } from '@/stores/app-store';
import { getSLAState, getTimeRemaining } from '@/lib/sla';
import { SLACountdown } from '@/components/shared/SLACountdown';
import { CATEGORIES } from '@/data/categories';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import type { CaseStatus, CasePriority } from '@/types';

const savedViews = [
  { id: 'all', name: 'All Cases', filters: {} },
  { id: 'my_queue', name: 'My Queue', filters: { assignee: ['me'] } },
  { id: 'unassigned', name: 'Unassigned', filters: { assignee: ['unassigned'] } },
  { id: 'breaching', name: 'Breaching SLA', filters: { slaState: ['at_risk', 'breached'] } },
];

export function CaseList() {
  const { cases, selectedCaseId, selectCase, currentFilters, setFilters, clearFilters } = useCasesStore();
  const { providers } = useProvidersStore();
  const { currentUser, users } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState('all');

  // Filter and sort cases
  const filteredCases = useMemo(() => {
    let result = cases;

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((c) => {
        const provider = providers.find((p) => p.id === c.providerId);
        return (
          c.id.toLowerCase().includes(query) ||
          c.title.toLowerCase().includes(query) ||
          provider?.name.toLowerCase().includes(query) ||
          provider?.npi.includes(query)
        );
      });
    }

    // Apply view filters
    const view = savedViews.find((v) => v.id === activeView);
    if (view?.filters.assignee?.includes('me')) {
      result = result.filter((c) => c.assigneeId === currentUser?.id);
    } else if (view?.filters.assignee?.includes('unassigned')) {
      result = result.filter((c) => !c.assigneeId);
    } else if (view?.filters.slaState) {
      result = result.filter((c) => {
        const state = getSLAState(c);
        return view.filters.slaState?.includes(state);
      });
    }

    // Apply status filter
    if (currentFilters.status.length > 0) {
      result = result.filter((c) => currentFilters.status.includes(c.status));
    }

    // Apply priority filter
    if (currentFilters.priority.length > 0) {
      result = result.filter((c) => currentFilters.priority.includes(c.priority));
    }

    // Apply category filter
    if (currentFilters.category.length > 0) {
      result = result.filter((c) => currentFilters.category.includes(c.category));
    }

    // Sort by updated date (most recent first)
    result = result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return result;
  }, [cases, searchQuery, activeView, currentFilters, currentUser, providers]);

  const hasActiveFilters = currentFilters.status.length > 0 || currentFilters.priority.length > 0 || currentFilters.category.length > 0;

  const toggleStatus = (status: CaseStatus) => {
    const newStatuses = currentFilters.status.includes(status)
      ? currentFilters.status.filter((s) => s !== status)
      : [...currentFilters.status, status];
    setFilters({ status: newStatuses });
  };

  const togglePriority = (priority: CasePriority) => {
    const newPriorities = currentFilters.priority.includes(priority)
      ? currentFilters.priority.filter((p) => p !== priority)
      : [...currentFilters.priority, priority];
    setFilters({ priority: newPriorities });
  };

  const toggleCategory = (category: string) => {
    const newCategories = currentFilters.category.includes(category)
      ? currentFilters.category.filter((c) => c !== category)
      : [...currentFilters.category, category];
    setFilters({ category: newCategories });
  };

  return (
    <>
      {/* Header with Search */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search cases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className={cn(hasActiveFilters && 'border-primary-500')}>
                <Filter className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              {(['open', 'in_progress', 'pending_provider', 'resolved', 'closed'] as CaseStatus[]).map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={currentFilters.status.includes(status)}
                  onCheckedChange={() => toggleStatus(status)}
                >
                  {status.replace('_', ' ')}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Priority</DropdownMenuLabel>
              {(['urgent', 'high', 'medium', 'low'] as CasePriority[]).map((priority) => (
                <DropdownMenuCheckboxItem
                  key={priority}
                  checked={currentFilters.priority.includes(priority)}
                  onCheckedChange={() => togglePriority(priority)}
                >
                  {priority}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Category</DropdownMenuLabel>
              {CATEGORIES.slice(0, 5).map((category) => (
                <DropdownMenuCheckboxItem
                  key={category.id}
                  checked={currentFilters.category.includes(category.id)}
                  onCheckedChange={() => toggleCategory(category.id)}
                >
                  {category.name}
                </DropdownMenuCheckboxItem>
              ))}
              {hasActiveFilters && (
                <>
                  <DropdownMenuSeparator />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={clearFilters}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear filters
                  </Button>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Saved Views */}
        <div className="flex gap-1 mt-3 overflow-x-auto">
          {savedViews.map((view) => (
            <Button
              key={view.id}
              variant={activeView === view.id ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActiveView(view.id)}
              className="shrink-0 text-xs"
            >
              {view.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Case Count */}
      <div className="px-4 py-2 text-xs text-slate-500 border-b border-slate-200">
        {filteredCases.length} case{filteredCases.length !== 1 ? 's' : ''}
      </div>

      {/* Case List */}
      <ScrollArea className="flex-1">
        <div className="divide-y divide-slate-100">
          {filteredCases.map((caseItem) => {
            const provider = providers.find((p) => p.id === caseItem.providerId);
            const assignee = users.find((u) => u.id === caseItem.assigneeId);
            const isSelected = selectedCaseId === caseItem.id;

            return (
              <div
                key={caseItem.id}
                onClick={() => selectCase(caseItem.id)}
                className={cn(
                  'p-4 cursor-pointer transition-colors hover:bg-slate-50',
                  isSelected && 'bg-primary-50 border-l-2 border-l-primary-500'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {/* Case ID and Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-primary-600">
                        {caseItem.id}
                      </span>
                      <Badge variant={caseItem.status as any} size="sm">
                        {caseItem.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant={caseItem.priority as any} size="sm">
                        {caseItem.priority}
                      </Badge>
                    </div>

                    {/* Title */}
                    <p className="text-sm font-medium text-slate-900 mt-1 line-clamp-2">
                      {caseItem.title}
                    </p>

                    {/* Provider */}
                    <p className="text-xs text-slate-500 mt-1 truncate">
                      {provider?.name || 'Unknown Provider'}
                    </p>

                    {/* Meta info */}
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                      <span>{formatDistanceToNow(new Date(caseItem.updatedAt), { addSuffix: true })}</span>
                      {assignee && (
                        <>
                          <span>•</span>
                          <span>{assignee.name.split(' ')[0]}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* SLA Badge - real-time countdown */}
                  <SLACountdown caseData={caseItem} />
                </div>
              </div>
            );
          })}

          {filteredCases.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              <p className="text-sm">No cases found</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </>
  );
}
