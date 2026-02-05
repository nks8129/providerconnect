'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Filter, Phone, Mail, Calendar, User, Clock, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useInteractionsStore } from '@/stores/interactions-store';
import { useProvidersStore } from '@/stores/providers-store';
import { useUIStore } from '@/stores/ui-store';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import type { InteractionType, Sentiment } from '@/types';

export default function InteractionsPage() {
  const { interactions } = useInteractionsStore();
  const { providers } = useProvidersStore();
  const { openModal } = useUIStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<{
    type: InteractionType[];
    sentiment: Sentiment[];
  }>({
    type: [],
    sentiment: [],
  });

  // Filter interactions
  const filteredInteractions = useMemo(() => {
    let result = interactions;

    // Search filter
    if (searchQuery.length >= 2) {
      const query = searchQuery.toLowerCase();
      result = result.filter((i) => {
        const provider = providers.find((p) => p.id === i.providerId);
        return (
          i.summary.toLowerCase().includes(query) ||
          i.notes.toLowerCase().includes(query) ||
          provider?.name.toLowerCase().includes(query) ||
          provider?.npi.includes(query)
        );
      });
    }

    // Type filter
    if (filters.type.length > 0) {
      result = result.filter((i) => filters.type.includes(i.type));
    }

    // Sentiment filter
    if (filters.sentiment.length > 0) {
      result = result.filter((i) => filters.sentiment.includes(i.sentiment));
    }

    // Sort by date descending
    return result.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
  }, [interactions, searchQuery, filters, providers]);

  const hasActiveFilters = filters.type.length > 0 || filters.sentiment.length > 0;

  const toggleType = (type: InteractionType) => {
    setFilters((prev) => ({
      ...prev,
      type: prev.type.includes(type)
        ? prev.type.filter((t) => t !== type)
        : [...prev.type, type],
    }));
  };

  const toggleSentiment = (sentiment: Sentiment) => {
    setFilters((prev) => ({
      ...prev,
      sentiment: prev.sentiment.includes(sentiment)
        ? prev.sentiment.filter((s) => s !== sentiment)
        : [...prev.sentiment, sentiment],
    }));
  };

  const clearFilters = () => {
    setFilters({ type: [], sentiment: [] });
  };

  const getInteractionIcon = (type: InteractionType) => {
    switch (type) {
      case 'call':
        return <Phone className="w-5 h-5 text-blue-600" />;
      case 'email':
        return <Mail className="w-5 h-5 text-green-600" />;
      case 'meeting':
        return <User className="w-5 h-5 text-purple-600" />;
      case 'outreach':
        return <Calendar className="w-5 h-5 text-orange-600" />;
      default:
        return <Clock className="w-5 h-5 text-slate-600" />;
    }
  };

  const getInteractionColor = (type: InteractionType) => {
    switch (type) {
      case 'call':
        return 'bg-blue-100';
      case 'email':
        return 'bg-green-100';
      case 'meeting':
        return 'bg-purple-100';
      case 'outreach':
        return 'bg-orange-100';
      default:
        return 'bg-slate-100';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Interaction Log</h1>
            <p className="text-sm text-slate-500 mt-1">
              {filteredInteractions.length} interaction{filteredInteractions.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button onClick={() => openModal('create_interaction')}>
            <Phone className="w-4 h-4 mr-2" />
            Log Interaction
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search interactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={cn(hasActiveFilters && 'border-primary-500')}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="default" size="sm" className="ml-2">
                    {filters.type.length + filters.sentiment.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Type</DropdownMenuLabel>
              {(['call', 'email', 'meeting', 'outreach'] as InteractionType[]).map((type) => (
                <DropdownMenuCheckboxItem
                  key={type}
                  checked={filters.type.includes(type)}
                  onCheckedChange={() => toggleType(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Sentiment</DropdownMenuLabel>
              {(['positive', 'neutral', 'negative', 'frustrated'] as Sentiment[]).map((sentiment) => (
                <DropdownMenuCheckboxItem
                  key={sentiment}
                  checked={filters.sentiment.includes(sentiment)}
                  onCheckedChange={() => toggleSentiment(sentiment)}
                >
                  {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
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
                    Clear all filters
                  </Button>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Interaction List */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {filteredInteractions.map((interaction) => {
            const provider = providers.find((p) => p.id === interaction.providerId);

            return (
              <Card key={interaction.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                        getInteractionColor(interaction.type)
                      )}
                    >
                      {getInteractionIcon(interaction.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium capitalize">
                              {interaction.direction} {interaction.type}
                            </p>
                            <Badge variant={interaction.sentiment as any} size="sm">
                              {interaction.sentiment}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            {format(new Date(interaction.occurredAt), 'MMM d, yyyy h:mm a')}
                            {interaction.duration > 0 && ` • ${interaction.duration} min`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {interaction.caseId && (
                            <Link href={`/cases?selected=${interaction.caseId}`}>
                              <Badge variant="outline" size="sm" className="cursor-pointer hover:bg-slate-100">
                                {interaction.caseId}
                              </Badge>
                            </Link>
                          )}
                        </div>
                      </div>

                      {provider && (
                        <Link href={`/providers/${provider.id}`}>
                          <div className="flex items-center gap-2 mt-2 text-sm text-primary-600 hover:text-primary-700">
                            <User className="w-4 h-4" />
                            {provider.name}
                            <span className="text-slate-400">• NPI: {provider.npi}</span>
                          </div>
                        </Link>
                      )}

                      <p className="text-sm mt-2">{interaction.summary}</p>
                      {interaction.notes && (
                        <p className="text-sm text-slate-600 mt-2">{interaction.notes}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredInteractions.length === 0 && (
            <div className="text-center py-12">
              <Phone className="w-12 h-12 mx-auto mb-4 text-slate-200" />
              <p className="text-slate-500">No interactions found</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
