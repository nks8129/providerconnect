'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Mail,
  Users,
  MousePointer,
  Eye,
  AlertTriangle,
  Calendar,
  Target,
} from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { useAppStore } from '@/stores/app-store';
import { format } from 'date-fns';

export function EmailBlastDetailModal() {
  const { activeModal, modalData, closeModal } = useUIStore();
  const { emailBlasts } = useAppStore();

  const isOpen = activeModal === 'email_blast_detail';
  const blastId = modalData?.blastId as string | undefined;
  const blast = blastId ? emailBlasts.find(b => b.id === blastId) : null;

  const handleClose = () => {
    closeModal();
  };

  if (!blast) return null;

  const openRate = blast.recipientCount > 0
    ? ((blast.metrics.opens / blast.recipientCount) * 100).toFixed(1)
    : '0';

  const clickRate = blast.metrics.opens > 0
    ? ((blast.metrics.clicks / blast.metrics.opens) * 100).toFixed(1)
    : '0';

  const bounceRate = blast.recipientCount > 0
    ? ((blast.metrics.bounces / blast.recipientCount) * 100).toFixed(1)
    : '0';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary-500" />
            Email Blast Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Header Info */}
          <div className="p-4 bg-slate-50 rounded-lg space-y-3">
            <h3 className="font-semibold text-lg">{blast.title}</h3>
            <p className="text-sm text-slate-600">Subject: {blast.subject}</p>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(blast.sentAt), 'MMM d, yyyy h:mm a')}
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {blast.recipientCount.toLocaleString()} recipients
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">{blast.audienceSegment}</Badge>
              <Badge variant="secondary">{blast.lob}</Badge>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-4 gap-3">
            <div className="p-3 bg-blue-50 rounded-lg text-center">
              <Eye className="w-5 h-5 mx-auto mb-1 text-blue-600" />
              <p className="text-xl font-bold text-blue-700">{blast.metrics.opens.toLocaleString()}</p>
              <p className="text-xs text-blue-600">Opens ({openRate}%)</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg text-center">
              <MousePointer className="w-5 h-5 mx-auto mb-1 text-green-600" />
              <p className="text-xl font-bold text-green-700">{blast.metrics.clicks.toLocaleString()}</p>
              <p className="text-xs text-green-600">Clicks ({clickRate}%)</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg text-center">
              <AlertTriangle className="w-5 h-5 mx-auto mb-1 text-orange-600" />
              <p className="text-xl font-bold text-orange-700">{blast.metrics.bounces.toLocaleString()}</p>
              <p className="text-xs text-orange-600">Bounces ({bounceRate}%)</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg text-center">
              <Target className="w-5 h-5 mx-auto mb-1 text-red-600" />
              <p className="text-xl font-bold text-red-700">{blast.metrics.unsubscribes}</p>
              <p className="text-xs text-red-600">Unsubscribes</p>
            </div>
          </div>

          {/* Email Content Preview */}
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-2">Email Content</h4>
            <ScrollArea className="h-[200px] rounded-lg border bg-white p-4">
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm text-slate-600">
                  {blast.content}
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Performance Summary */}
          <div className="p-3 bg-slate-50 rounded-lg">
            <h4 className="text-sm font-medium text-slate-700 mb-2">Performance Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Delivery Rate</span>
                <span className="font-medium">
                  {((blast.recipientCount - blast.metrics.bounces) / blast.recipientCount * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Engagement Rate</span>
                <span className="font-medium">
                  {blast.recipientCount > 0
                    ? ((blast.metrics.clicks / blast.recipientCount) * 100).toFixed(2)
                    : '0'}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Click-to-Open Rate</span>
                <span className="font-medium">{clickRate}%</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
