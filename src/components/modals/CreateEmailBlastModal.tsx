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
import { Mail, Send } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { useAppStore } from '@/stores/app-store';
import { LINES_OF_BUSINESS } from '@/data/categories';
import { generateId } from '@/lib/utils';

const AUDIENCE_SEGMENTS = [
  'All Providers',
  'Primary Care',
  'Specialists',
  'Facilities',
  'New Providers',
  'High Volume',
  'Inactive Providers',
];

export function CreateEmailBlastModal() {
  const { activeModal, closeModal, addToast } = useUIStore();
  const { addEmailBlast } = useAppStore();

  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    content: '',
    lob: '',
    audienceSegment: '',
  });

  const isOpen = activeModal === 'create_outreach';

  const handleClose = () => {
    setFormData({
      title: '',
      subject: '',
      content: '',
      lob: '',
      audienceSegment: '',
    });
    closeModal();
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.subject || !formData.content) return;

    // Simulate recipient count based on audience segment
    const recipientCounts: Record<string, number> = {
      'All Providers': 2500,
      'Primary Care': 450,
      'Specialists': 380,
      'Facilities': 120,
      'New Providers': 85,
      'High Volume': 200,
      'Inactive Providers': 150,
    };

    const recipientCount = recipientCounts[formData.audienceSegment] || 500;

    addEmailBlast({
      id: generateId('blast'),
      title: formData.title,
      subject: formData.subject,
      content: formData.content,
      audienceSegment: formData.audienceSegment,
      lob: formData.lob,
      sentAt: new Date().toISOString(),
      recipientIds: [], // Simulated - in production would be actual provider IDs
      recipientCount,
      metrics: {
        opens: 0,
        clicks: 0,
        bounces: 0,
        unsubscribes: 0,
      },
      createdBy: '',
      createdAt: new Date().toISOString(),
    });

    addToast({
      type: 'success',
      title: 'Email Blast Sent',
      message: `"${formData.title}" has been sent to ${recipientCount} recipients.`,
    });

    handleClose();
  };

  const canSubmit = formData.title && formData.subject && formData.content;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary-500" />
            Create Email Blast
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Campaign Title *</Label>
            <Input
              id="title"
              placeholder="Internal campaign name"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Subject Line */}
          <div className="space-y-2">
            <Label htmlFor="subject">Email Subject *</Label>
            <Input
              id="subject"
              placeholder="Subject line recipients will see"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />
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

          {/* Email Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Email Content *</Label>
            <Textarea
              id="content"
              placeholder="Write the email content..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={8}
            />
            <p className="text-xs text-slate-500">
              This is a simplified editor. In production, this would be a rich text editor.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            <Send className="w-4 h-4 mr-2" />
            Send Email Blast
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
