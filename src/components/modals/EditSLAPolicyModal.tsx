'use client';

import React, { useState, useEffect } from 'react';
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
import { Clock } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { CATEGORIES } from '@/data/categories';

export function EditSLAPolicyModal() {
  const { activeModal, modalData, closeModal, addToast } = useUIStore();

  const isOpen = activeModal === 'edit_sla_policy';
  const categoryId = modalData?.categoryId as string | undefined;
  const category = categoryId ? CATEGORIES.find(c => c.id === categoryId) : null;

  const [formData, setFormData] = useState({
    urgent: 4,
    high: 8,
    medium: 24,
    low: 48,
  });

  useEffect(() => {
    if (category) {
      setFormData({
        urgent: category.slaHours.urgent,
        high: category.slaHours.high,
        medium: category.slaHours.medium,
        low: category.slaHours.low,
      });
    }
  }, [category]);

  const handleClose = () => {
    closeModal();
  };

  const handleSubmit = () => {
    // In a real app, this would update the backend
    // For the prototype, we just show a toast
    addToast({
      type: 'success',
      title: 'SLA Policy Updated',
      message: `SLA hours for ${category?.name} have been saved.`,
    });

    handleClose();
  };

  if (!category) return null;

  const priorities = ['urgent', 'high', 'medium', 'low'] as const;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary-500" />
            Edit SLA Policy
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <p className="font-medium text-slate-900">{category.name}</p>
            <p className="text-sm text-slate-500 mt-1">{category.description}</p>
          </div>

          <div className="space-y-4">
            <Label>Target Resolution Hours by Priority</Label>
            <div className="grid grid-cols-2 gap-4">
              {priorities.map((priority) => (
                <div key={priority} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        priority === 'urgent' ? 'danger' :
                        priority === 'high' ? 'warning' :
                        priority === 'medium' ? 'secondary' : 'outline'
                      }
                      size="sm"
                      className="capitalize"
                    >
                      {priority}
                    </Badge>
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      min={1}
                      max={168}
                      value={formData[priority]}
                      onChange={(e) => setFormData({
                        ...formData,
                        [priority]: parseInt(e.target.value) || 1
                      })}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                      hours
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-xs text-blue-700">
              <strong>Note:</strong> Changes to SLA policies will apply to new cases only.
              Existing cases will retain their original SLA targets.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
