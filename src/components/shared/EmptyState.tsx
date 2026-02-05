'use client';

import React from 'react';
import {
  Inbox,
  Users,
  MessageSquare,
  FileText,
  Search,
  FolderOpen,
  Calendar,
  BarChart3,
  Settings,
  BookOpen,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      {icon && (
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <div className="text-slate-400">{icon}</div>
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-4">{description}</p>
      {action && (
        <Button onClick={action.onClick} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Pre-configured empty states
export function NoCasesFound({ onCreateCase }: { onCreateCase?: () => void }) {
  return (
    <EmptyState
      icon={<Inbox className="w-8 h-8" />}
      title="No cases found"
      description="There are no cases matching your current filters. Try adjusting your search or create a new case."
      action={onCreateCase ? { label: 'Create Case', onClick: onCreateCase } : undefined}
    />
  );
}

export function NoProvidersFound({ onSearch }: { onSearch?: () => void }) {
  return (
    <EmptyState
      icon={<Users className="w-8 h-8" />}
      title="No providers found"
      description="No providers match your search criteria. Try a different search term."
      action={onSearch ? { label: 'Clear Search', onClick: onSearch } : undefined}
    />
  );
}

export function NoInteractionsFound({ onLogInteraction }: { onLogInteraction?: () => void }) {
  return (
    <EmptyState
      icon={<MessageSquare className="w-8 h-8" />}
      title="No interactions yet"
      description="There are no logged interactions. Start by logging a call, email, or meeting."
      action={onLogInteraction ? { label: 'Log Interaction', onClick: onLogInteraction } : undefined}
    />
  );
}

export function NoSearchResults() {
  return (
    <EmptyState
      icon={<Search className="w-8 h-8" />}
      title="No results found"
      description="We couldn't find anything matching your search. Try different keywords."
    />
  );
}

export function NoArticlesFound() {
  return (
    <EmptyState
      icon={<BookOpen className="w-8 h-8" />}
      title="No articles found"
      description="No knowledge base articles match your search. Try different keywords or browse categories."
    />
  );
}

export function NoDataAvailable() {
  return (
    <EmptyState
      icon={<BarChart3 className="w-8 h-8" />}
      title="No data available"
      description="There's no data to display for the selected time period. Try selecting a different date range."
    />
  );
}

export function NoTasksFound() {
  return (
    <EmptyState
      icon={<FolderOpen className="w-8 h-8" />}
      title="No tasks"
      description="This case has no tasks yet. Add tasks to track work items."
    />
  );
}

export function NoEventsFound({ onCreateEvent }: { onCreateEvent?: () => void }) {
  return (
    <EmptyState
      icon={<Calendar className="w-8 h-8" />}
      title="No upcoming events"
      description="There are no scheduled outreach events. Plan your next provider engagement."
      action={onCreateEvent ? { label: 'Create Event', onClick: onCreateEvent } : undefined}
    />
  );
}

export function NoUsersFound() {
  return (
    <EmptyState
      icon={<Users className="w-8 h-8" />}
      title="No users found"
      description="No team members match your search criteria."
    />
  );
}

export function SelectCasePrompt() {
  return (
    <EmptyState
      icon={<Inbox className="w-8 h-8" />}
      title="Select a case"
      description="Choose a case from the list to view its details, interactions, and take actions."
    />
  );
}

export function SelectProviderPrompt() {
  return (
    <EmptyState
      icon={<Users className="w-8 h-8" />}
      title="Search for a provider"
      description="Enter a provider name, NPI, or specialty to find provider records."
    />
  );
}
