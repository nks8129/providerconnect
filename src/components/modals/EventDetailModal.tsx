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
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Link as LinkIcon,
  Search,
  UserPlus,
  Check,
  X,
  Building2,
  User,
} from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { useAppStore } from '@/stores/app-store';
import { useProvidersStore } from '@/stores/providers-store';
import { format, isPast } from 'date-fns';
import { cn } from '@/lib/utils';

export function EventDetailModal() {
  const { activeModal, modalData, closeModal, addToast } = useUIStore();
  const { outreachEvents, updateOutreachEvent } = useAppStore();
  const { providers, searchProviders } = useProvidersStore();

  const [searchQuery, setSearchQuery] = useState('');
  const initialTab = (modalData?.tab as string) || 'details';
  const [activeTab, setActiveTab] = useState(initialTab);

  const isOpen = activeModal === 'event_detail';
  const eventId = modalData?.eventId as string | undefined;
  const event = eventId ? outreachEvents.find(e => e.id === eventId) : null;

  const handleClose = () => {
    setSearchQuery('');
    setActiveTab(initialTab);
    closeModal();
  };

  // Reset activeTab when modal opens with a new tab parameter
  React.useEffect(() => {
    if (isOpen && modalData?.tab) {
      setActiveTab(modalData.tab as string);
    }
  }, [isOpen, modalData?.tab]);

  const searchResults = searchQuery.length >= 2
    ? searchProviders(searchQuery).slice(0, 5)
    : [];

  const attendeeProviders = event
    ? providers.filter(p => event.attendeeIds.includes(p.id))
    : [];

  const handleAddAttendee = (providerId: string) => {
    if (!event || event.attendeeIds.includes(providerId)) return;

    updateOutreachEvent(event.id, {
      attendeeIds: [...event.attendeeIds, providerId],
    });

    const provider = providers.find(p => p.id === providerId);
    addToast({
      type: 'success',
      title: 'Attendee Added',
      message: `${provider?.name} has been added to the event.`,
    });
    setSearchQuery('');
  };

  const handleRemoveAttendee = (providerId: string) => {
    if (!event) return;

    updateOutreachEvent(event.id, {
      attendeeIds: event.attendeeIds.filter(id => id !== providerId),
    });

    addToast({
      type: 'info',
      title: 'Attendee Removed',
      message: 'The provider has been removed from the event.',
    });
  };

  if (!event) return null;

  const isEventPast = isPast(new Date(event.date));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-500" />
            Event Details
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
            <TabsTrigger value="attendees" className="flex-1">
              Attendees ({event.attendeeIds.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            {/* Event Info */}
            <div className="p-4 bg-slate-50 rounded-lg space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{event.title}</h3>
                  <p className="text-sm text-slate-500">{event.topic}</p>
                </div>
                <Badge variant={isEventPast ? 'secondary' : 'success'} className="capitalize">
                  {isEventPast ? 'Completed' : event.type}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(event.date), 'MMM d, yyyy h:mm a')}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="w-4 h-4" />
                  {event.duration} minutes
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Users className="w-4 h-4" />
                  {event.attendeeIds.length} attendees
                  {event.maxAttendees && ` / ${event.maxAttendees} max`}
                </div>
                {event.location && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-4 h-4" />
                    {event.location}
                  </div>
                )}
              </div>

              {event.virtualLink && (
                <div className="flex items-center gap-2 text-sm">
                  <LinkIcon className="w-4 h-4 text-primary-500" />
                  <a
                    href={event.virtualLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline"
                  >
                    Join Virtual Event
                  </a>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-2">Description</h4>
              <p className="text-sm text-slate-600">{event.description}</p>
            </div>

            {/* Audience */}
            <div className="flex gap-4">
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-1">Audience</h4>
                <Badge variant="outline">{event.audienceSegment}</Badge>
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-1">Line of Business</h4>
                <Badge variant="secondary">{event.lob}</Badge>
              </div>
            </div>

            {/* Notes */}
            {event.notes && (
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-2">Notes</h4>
                <p className="text-sm text-slate-600">{event.notes}</p>
              </div>
            )}

            {/* Follow-up Actions */}
            {event.followUpActions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-2">Follow-up Actions</h4>
                <ul className="space-y-1">
                  {event.followUpActions.map((action, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                      <Check className="w-3 h-3 text-green-500" />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </TabsContent>

          <TabsContent value="attendees" className="space-y-4 mt-4">
            {/* Add Attendee Search */}
            {!isEventPast && (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search providers to add..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {searchResults.length > 0 && (
                  <div className="border rounded-lg divide-y max-h-[150px] overflow-auto">
                    {searchResults.map((provider) => {
                      const isAttendee = event.attendeeIds.includes(provider.id);
                      return (
                        <button
                          key={provider.id}
                          onClick={() => !isAttendee && handleAddAttendee(provider.id)}
                          disabled={isAttendee}
                          className={cn(
                            'w-full p-2 text-left flex items-center justify-between transition-colors',
                            isAttendee ? 'bg-slate-50 opacity-50' : 'hover:bg-slate-50'
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {provider.type === 'facility' ? (
                              <Building2 className="w-4 h-4 text-slate-400" />
                            ) : (
                              <User className="w-4 h-4 text-slate-400" />
                            )}
                            <span className="text-sm">{provider.name}</span>
                          </div>
                          {isAttendee ? (
                            <Badge variant="secondary" size="sm">Added</Badge>
                          ) : (
                            <UserPlus className="w-4 h-4 text-primary-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Attendee List */}
            <ScrollArea className="h-[300px]">
              {attendeeProviders.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No attendees registered yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {attendeeProviders.map((provider) => (
                    <div
                      key={provider.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
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
                      {!isEventPast && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleRemoveAttendee(provider.id)}
                        >
                          <X className="w-4 h-4 text-slate-400 hover:text-red-500" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
