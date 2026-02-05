'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Filter, Grid, List, User, Phone, MapPin, Inbox, X } from 'lucide-react';
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
import { useProvidersStore } from '@/stores/providers-store';
import { useCasesStore } from '@/stores/cases-store';
import { useInteractionsStore } from '@/stores/interactions-store';
import { SPECIALTIES, US_STATES, LINES_OF_BUSINESS } from '@/data/categories';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Provider } from '@/types';

export default function ProvidersPage() {
  const { providers } = useProvidersStore();
  const { cases } = useCasesStore();
  const { interactions } = useInteractionsStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<{
    type: Provider['type'][];
    state: string[];
    networkStatus: Provider['networkStatus'][];
  }>({
    type: [],
    state: [],
    networkStatus: [],
  });

  // Filter providers
  const filteredProviders = useMemo(() => {
    let result = providers;

    // Search filter
    if (searchQuery.length >= 2) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.npi.includes(query) ||
          p.taxId.includes(query) ||
          p.addresses.some((a) => `${a.city} ${a.state}`.toLowerCase().includes(query))
      );
    }

    // Type filter
    if (filters.type.length > 0) {
      result = result.filter((p) => filters.type.includes(p.type));
    }

    // State filter
    if (filters.state.length > 0) {
      result = result.filter((p) =>
        p.addresses.some((a) => filters.state.includes(a.state))
      );
    }

    // Network status filter
    if (filters.networkStatus.length > 0) {
      result = result.filter((p) => filters.networkStatus.includes(p.networkStatus));
    }

    return result;
  }, [providers, searchQuery, filters]);

  // Get provider stats
  const getProviderStats = (providerId: string) => {
    const providerCases = cases.filter((c) => c.providerId === providerId);
    const openCases = providerCases.filter(
      (c) => c.status !== 'resolved' && c.status !== 'closed'
    ).length;
    const lastInteraction = interactions
      .filter((i) => i.providerId === providerId)
      .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())[0];

    return { openCases, lastInteraction };
  };

  const hasActiveFilters = filters.type.length > 0 || filters.state.length > 0 || filters.networkStatus.length > 0;

  const toggleType = (type: Provider['type']) => {
    setFilters((prev) => ({
      ...prev,
      type: prev.type.includes(type)
        ? prev.type.filter((t) => t !== type)
        : [...prev.type, type],
    }));
  };

  const toggleState = (state: string) => {
    setFilters((prev) => ({
      ...prev,
      state: prev.state.includes(state)
        ? prev.state.filter((s) => s !== state)
        : [...prev.state, state],
    }));
  };

  const toggleNetworkStatus = (status: Provider['networkStatus']) => {
    setFilters((prev) => ({
      ...prev,
      networkStatus: prev.networkStatus.includes(status)
        ? prev.networkStatus.filter((s) => s !== status)
        : [...prev.networkStatus, status],
    }));
  };

  const clearFilters = () => {
    setFilters({ type: [], state: [], networkStatus: [] });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Provider Directory</h1>
            <p className="text-sm text-slate-500 mt-1">
              {filteredProviders.length} provider{filteredProviders.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon-sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon-sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search by name, NPI, or Tax ID..."
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
                    {filters.type.length + filters.state.length + filters.networkStatus.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Provider Type</DropdownMenuLabel>
              {(['individual', 'group', 'facility'] as Provider['type'][]).map((type) => (
                <DropdownMenuCheckboxItem
                  key={type}
                  checked={filters.type.includes(type)}
                  onCheckedChange={() => toggleType(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>State</DropdownMenuLabel>
              {US_STATES.map((state) => (
                <DropdownMenuCheckboxItem
                  key={state.code}
                  checked={filters.state.includes(state.code)}
                  onCheckedChange={() => toggleState(state.code)}
                >
                  {state.name}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Network Status</DropdownMenuLabel>
              {(['active', 'pending', 'terminated'] as Provider['networkStatus'][]).map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={filters.networkStatus.includes(status)}
                  onCheckedChange={() => toggleNetworkStatus(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
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

      {/* Provider Grid/List */}
      <ScrollArea className="flex-1 p-4">
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-3'
          )}
        >
          {filteredProviders.map((provider) => {
            const stats = getProviderStats(provider.id);
            const primaryAddress = provider.addresses.find((a) => a.isPrimary) || provider.addresses[0];
            const primaryContact = provider.contacts.find((c) => c.isPrimary) || provider.contacts[0];

            return (
              <Link key={provider.id} href={`/providers/${provider.id}`}>
                <Card className="hover:shadow-card-hover transition-shadow cursor-pointer">
                  <CardContent className={cn('p-4', viewMode === 'list' && 'flex items-center gap-4')}>
                    <div className={cn('flex items-start gap-3', viewMode === 'list' && 'flex-1')}>
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900 truncate">{provider.name}</p>
                          <Badge variant={provider.networkStatus as any} size="sm">
                            {provider.networkStatus}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <span>NPI: {provider.npi}</span>
                          <span>•</span>
                          <span className="capitalize">{provider.type}</span>
                        </div>
                      </div>
                    </div>

                    {viewMode === 'grid' && (
                      <>
                        <div className="mt-3 space-y-2 text-sm text-slate-600">
                          {primaryAddress && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-slate-400" />
                              {primaryAddress.city}, {primaryAddress.state}
                            </div>
                          )}
                          {primaryContact && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-slate-400" />
                              {primaryContact.phone}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                          <div className="flex items-center gap-1 text-sm">
                            <Inbox className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600">
                              {stats.openCases} open case{stats.openCases !== 1 ? 's' : ''}
                            </span>
                          </div>
                          {stats.lastInteraction && (
                            <span className="text-xs text-slate-400">
                              Last: {formatDistanceToNow(new Date(stats.lastInteraction.occurredAt), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                      </>
                    )}

                    {viewMode === 'list' && (
                      <div className="flex items-center gap-6 text-sm">
                        {primaryAddress && (
                          <div className="flex items-center gap-1 text-slate-500">
                            <MapPin className="w-4 h-4" />
                            {primaryAddress.city}, {primaryAddress.state}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-slate-500">
                          <Inbox className="w-4 h-4" />
                          {stats.openCases} open
                        </div>
                        {stats.lastInteraction && (
                          <span className="text-xs text-slate-400">
                            Last: {formatDistanceToNow(new Date(stats.lastInteraction.occurredAt), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}

          {filteredProviders.length === 0 && (
            <div className="col-span-full text-center py-12">
              <User className="w-12 h-12 mx-auto mb-4 text-slate-200" />
              <p className="text-slate-500">No providers found</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
