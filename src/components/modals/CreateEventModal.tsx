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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Video, Users, BookOpen } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { useAppStore } from '@/stores/app-store';
import { LINES_OF_BUSINESS } from '@/data/categories';
import { generateId } from '@/lib/utils';
import type { OutreachEventType } from '@/types';
import { cn } from '@/lib/utils';

const EVENT_TYPES = [
  { id: 'webinar', label: 'Webinar', icon: Video, description: 'Online presentation' },
  { id: 'workshop', label: 'Workshop', icon: Users, description: 'Interactive session' },
  { id: 'training', label: 'Training', icon: BookOpen, description: 'Educational program' },
  { id: 'conference', label: 'Conference', icon: Calendar, description: 'Multi-session event' },
];

const AUDIENCE_SEGMENTS = [
  'All Providers',
  'Primary Care',
  'Specialists',
  'Facilities',
  'New Providers',
  'High Volume',
];

export function CreateEventModal() {
  const { activeModal, closeModal, addToast } = useUIStore();
  const { addOutreachEvent, currentUser } = useAppStore();

  const [formData, setFormData] = useState({
    type: 'webinar' as OutreachEventType,
    title: '',
    topic: '',
    description: '',
    lob: '',
    audienceSegment: '',
    date: '',
    time: '',
    duration: 60,
    location: '',
    virtualLink: '',
    maxAttendees: 0,
    notes: '',
  });

  const isOpen = activeModal === 'create_event';

  const handleClose = () => {
    setFormData({
      type: 'webinar',
      title: '',
      topic: '',
      description: '',
      lob: '',
      audienceSegment: '',
      date: '',
      time: '',
      duration: 60,
      location: '',
      virtualLink: '',
      maxAttendees: 0,
      notes: '',
    });
    closeModal();
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.date || !formData.time) return;

    const dateTime = new Date(`${formData.date}T${formData.time}`).toISOString();

    addOutreachEvent({
      id: generateId('event'),
      type: formData.type,
      title: formData.title,
      topic: formData.topic,
      description: formData.description,
      lob: formData.lob,
      audienceSegment: formData.audienceSegment,
      date: dateTime,
      duration: formData.duration,
      location: formData.location || undefined,
      virtualLink: formData.virtualLink || undefined,
      attendeeIds: [],
      maxAttendees: formData.maxAttendees > 0 ? formData.maxAttendees : undefined,
      notes: formData.notes,
      followUpActions: [],
      createdBy: currentUser?.id || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    addToast({
      type: 'success',
      title: 'Event Created',
      message: `${formData.title} has been scheduled.`,
    });

    handleClose();
  };

  const canSubmit = formData.title && formData.date && formData.time;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-500" />
            Create Outreach Event
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          {/* Event Type */}
          <div className="space-y-2">
            <Label>Event Type</Label>
            <div className="grid grid-cols-4 gap-2">
              {EVENT_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setFormData({ ...formData, type: type.id as OutreachEventType })}
                    className={cn(
                      'p-3 rounded-lg border text-center transition-colors',
                      formData.type === type.id
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <Icon className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title & Topic */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Event title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                placeholder="Main topic"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the event..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Date, Time & Duration */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (min)</Label>
              <Input
                id="duration"
                type="number"
                min={15}
                max={480}
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })}
              />
            </div>
          </div>

          {/* LOB & Audience */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Line of Business</Label>
              <Select
                value={formData.lob}
                onValueChange={(value) => setFormData({ ...formData, lob: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select LOB" />
                </SelectTrigger>
                <SelectContent>
                  {LINES_OF_BUSINESS.map((lob) => (
                    <SelectItem key={lob.id} value={lob.id}>
                      {lob.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Select
                value={formData.audienceSegment}
                onValueChange={(value) => setFormData({ ...formData, audienceSegment: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  {AUDIENCE_SEGMENTS.map((seg) => (
                    <SelectItem key={seg} value={seg}>
                      {seg}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location & Virtual Link */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location (optional)</Label>
              <Input
                id="location"
                placeholder="Physical location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="virtualLink">Virtual Link</Label>
              <Input
                id="virtualLink"
                placeholder="https://..."
                value={formData.virtualLink}
                onChange={(e) => setFormData({ ...formData, virtualLink: e.target.value })}
              />
            </div>
          </div>

          {/* Max Attendees & Notes */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxAttendees">Max Attendees (0 = unlimited)</Label>
              <Input
                id="maxAttendees"
                type="number"
                min={0}
                value={formData.maxAttendees}
                onChange={(e) => setFormData({ ...formData, maxAttendees: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            Create Event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
