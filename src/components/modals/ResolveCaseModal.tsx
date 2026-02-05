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
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { useCasesStore } from '@/stores/cases-store';
import { useAppStore, dispositionCodes, rootCauses } from '@/stores/app-store';

export function ResolveCaseModal() {
  const { activeModal, modalData, closeModal, addToast } = useUIStore();
  const { getCase, resolveCase } = useCasesStore();

  const [formData, setFormData] = useState({
    rootCause: '',
    disposition: '',
    summary: '',
    prevention: '',
  });

  const isOpen = activeModal === 'resolve_case';
  const caseId = modalData?.caseId as string;
  const caseData = caseId ? getCase(caseId) : null;

  const handleClose = () => {
    setFormData({
      rootCause: '',
      disposition: '',
      summary: '',
      prevention: '',
    });
    closeModal();
  };

  const handleSubmit = () => {
    if (!caseId || !formData.disposition) return;

    resolveCase(caseId, {
      rootCause: formData.rootCause,
      disposition: formData.disposition,
      summary: formData.summary,
      prevention: formData.prevention,
      resolvedAt: null,
      resolvedBy: null,
    });

    addToast({
      type: 'success',
      title: 'Case Resolved',
      message: `Case ${caseId} has been resolved successfully.`,
    });

    handleClose();
  };

  if (!caseData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Resolve Case
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Case Info */}
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono text-blue-600">{caseData.id}</span>
              <Badge variant={caseData.priority as any} size="sm">{caseData.priority}</Badge>
            </div>
            <p className="text-sm font-medium mt-1">{caseData.title}</p>
            <p className="text-xs text-slate-500 mt-1">{caseData.category}</p>
          </div>

          {/* Resolution Form */}
          <div className="space-y-2">
            <Label>Disposition *</Label>
            <Select
              value={formData.disposition}
              onValueChange={(value) => setFormData({ ...formData, disposition: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select disposition code" />
              </SelectTrigger>
              <SelectContent>
                {dispositionCodes.map((code) => (
                  <SelectItem key={code.id} value={code.id}>
                    {code.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Root Cause</Label>
            <Select
              value={formData.rootCause}
              onValueChange={(value) => setFormData({ ...formData, rootCause: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select root cause (optional)" />
              </SelectTrigger>
              <SelectContent>
                {rootCauses.map((cause) => (
                  <SelectItem key={cause.id} value={cause.id}>
                    {cause.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Resolution Summary *</Label>
            <Textarea
              placeholder="Describe how the case was resolved..."
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Prevention Notes</Label>
            <Textarea
              placeholder="How can this issue be prevented in the future?"
              value={formData.prevention}
              onChange={(e) => setFormData({ ...formData, prevention: e.target.value })}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.disposition || !formData.summary}
            className="bg-green-600 hover:bg-green-700"
          >
            Resolve Case
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
