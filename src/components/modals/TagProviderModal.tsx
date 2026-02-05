'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, UserPlus, Building2, User, Calendar, Check } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { useAppStore } from '@/stores/app-store';
import { useProvidersStore } from '@/stores/providers-store';
import { format, isFuture } from 'date-fns';
import { cn } from '@/lib/utils';

export function TagProviderModal() {
  const { activeModal, modalData, closeModal, addToast } = useUIStore();
  const { outreachEvents, updateOutreachEvent, emailBlasts } = useAppStore();
  const { providers, searchProviders } = useProvidersStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(
    (modalData?.providerId as string) || null
  );
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [campaignType, setCampaignType] = useState<'event' | 'blast'>('event');

  const isOpen = activeModal === 'tag_provider';

  // Get available campaigns (events and blasts)
  const upcomingEvents = outreachEvents
    .filter((e) => isFuture(new Date(e.date)))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const searchResults = searchQuery.length >= 2
    ? searchProviders(searchQuery).slice(0, 5)
    : [];

  const selectedProvider = selectedProviderId
    ? providers.find((p) => p.id === selectedProviderId)
    : null;

  const selectedEvent = selectedCampaignId
    ? outreachEvents.find((e) => e.id === selectedCampaignId)
    : null;

  const handleClose = () => {
    setSearchQuery('');
    setSelectedProviderId(null);
    setSelectedCampaignId('');
    closeModal();
  };

  const handleProviderSelect = (providerId: string) => {
    setSelectedProviderId(providerId);
    setSearchQuery('');
  };

  const handleSubmit = () => {
    if (!selectedProviderId || !selectedCampaignId) return;

    const event = outreachEvents.find((e) => e.id === selectedCampaignId);
    if (!event) return;

    // Check if already added
    if (event.attendeeIds.includes(selectedProviderId)) {
      addToast({
        type: 'warning',
        title: 'Already Tagged',
        message: 'This provider is already tagged to this campaign.',
      });
      return;
    }

    updateOutreachEvent(selectedCampaignId, {
      attendeeIds: [...event.attendeeIds, selectedProviderId],
    });

    addToast({
      type: 'success',
      title: 'Provider Tagged',
      message: `${selectedProvider?.name} has been added to ${event.title}.`,
    });

    handleClose();
  };

  const canSubmit = selectedProviderId && selectedCampaignId;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary-500" />
            Tag Provider to Campaign
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Provider Selection */}
          <div className="space-y-2">
            <Label>Select Provider</Label>
            {selectedProvider ? (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border">
                      {selectedProvider.type === 'facility' ? (
                        <Building2 className="w-5 h-5 text-slate-500" />
                      ) : (
                        <User className="w-5 h-5 text-slate-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{selectedProvider.name}</p>
                      <p className="text-xs text-slate-500">NPI: {selectedProvider.npi}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedProviderId(null)}
                  >
                    Change
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search by name, NPI, or Tax ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {searchResults.length > 0 && (
                  <div className="border rounded-lg divide-y max-h-[200px] overflow-auto">
                    {searchResults.map((provider) => (
                      <button
                        key={provider.id}
                        onClick={() => handleProviderSelect(provider.id)}
                        className="w-full p-3 text-left hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                            {provider.type === 'facility' ? (
                              <Building2 className="w-4 h-4 text-slate-500" />
                            ) : (
                              <User className="w-4 h-4 text-slate-500" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{provider.name}</p>
                            <p className="text-xs text-slate-500">
                              NPI: {provider.npi} • {provider.specialties[0]}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Campaign Selection */}
          <div className="space-y-2">
            <Label>Select Campaign</Label>
            <Select
              value={selectedCampaignId}
              onValueChange={setSelectedCampaignId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a campaign..." />
              </SelectTrigger>
              <SelectContent>
                {upcomingEvents.length === 0 ? (
                  <div className="p-3 text-sm text-slate-500 text-center">
                    No upcoming campaigns
                  </div>
                ) : (
                  upcomingEvents.map((event) => {
                    const isAlreadyTagged = selectedProviderId
                      ? event.attendeeIds.includes(selectedProviderId)
                      : false;
                    return (
                      <SelectItem
                        key={event.id}
                        value={event.id}
                        disabled={isAlreadyTagged}
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>{event.title}</span>
                          <span className="text-xs text-slate-400">
                            ({format(new Date(event.date), 'MMM d')})
                          </span>
                          {isAlreadyTagged && (
                            <Check className="w-3 h-3 text-green-500" />
                          )}
                        </div>
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          {selectedProvider && selectedEvent && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>{selectedProvider.name}</strong> will be tagged to{' '}
                <strong>{selectedEvent.title}</strong> on{' '}
                {format(new Date(selectedEvent.date), 'MMM d, yyyy')}.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            <UserPlus className="w-4 h-4 mr-2" />
            Tag Provider
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
