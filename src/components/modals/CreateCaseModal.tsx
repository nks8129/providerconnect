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
import { Textarea } from '@/components/ui/textarea';
import { Search, Building2, User, AlertCircle } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { useCasesStore } from '@/stores/cases-store';
import { useProvidersStore } from '@/stores/providers-store';
import { useAppStore, categories, linesOfBusiness } from '@/stores/app-store';
import { calculateSLADueDate } from '@/lib/sla';
import type { CasePriority, CaseChannel } from '@/types';

export function CreateCaseModal() {
  const { activeModal, closeModal, addToast } = useUIStore();
  const { addCase } = useCasesStore();
  const { providers, searchProviders } = useProvidersStore();
  const { currentUser, teams } = useAppStore();

  const [step, setStep] = useState(1);
  const [providerSearch, setProviderSearch] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    subcategory: '',
    priority: 'medium' as CasePriority,
    channel: 'phone' as CaseChannel,
    lob: '',
    summary: '',
  });

  const isOpen = activeModal === 'create_case';

  const handleClose = () => {
    setStep(1);
    setProviderSearch('');
    setSelectedProvider(null);
    setFormData({
      title: '',
      category: '',
      subcategory: '',
      priority: 'medium',
      channel: 'phone',
      lob: '',
      summary: '',
    });
    closeModal();
  };

  const searchResults = providerSearch.length >= 2
    ? searchProviders(providerSearch).slice(0, 5)
    : [];

  const selectedProviderData = selectedProvider
    ? providers.find(p => p.id === selectedProvider)
    : null;

  const selectedCategory = categories.find(c => c.id === formData.category);
  const subcategories = selectedCategory?.subcategories || [];

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
    setStep(2);
  };

  const handleSubmit = () => {
    if (!selectedProvider || !formData.title || !formData.category) {
      return;
    }

    const team = teams.find(t => t.categories.includes(formData.category)) || teams[0];
    const dueAt = calculateSLADueDate(new Date().toISOString(), formData.priority);

    const newCase = addCase({
      providerId: selectedProvider,
      title: formData.title,
      status: 'open',
      priority: formData.priority,
      category: formData.category,
      subcategory: formData.subcategory,
      lob: formData.lob || linesOfBusiness[0]?.id || '',
      channel: formData.channel,
      summary: formData.summary,
      assigneeId: null,
      teamId: team?.id || '',
      sla: {
        dueAt,
        pausedAt: null,
        pauseReason: null,
        totalPausedTime: 0,
      },
      resolution: {
        rootCause: null,
        disposition: null,
        summary: null,
        prevention: null,
        resolvedAt: null,
        resolvedBy: null,
      },
      tasks: [],
      attachments: [],
      tags: [],
      createdBy: currentUser?.id || '',
    });

    addToast({
      type: 'success',
      title: 'Case Created',
      message: `Case ${newCase.id} has been created successfully.`,
    });

    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Create New Case
            <Badge variant="secondary" size="sm">Step {step} of 2</Badge>
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Search Provider</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by name, NPI, or Tax ID..."
                  value={providerSearch}
                  onChange={(e) => setProviderSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="border rounded-lg divide-y max-h-[300px] overflow-auto">
                {searchResults.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => handleProviderSelect(provider.id)}
                    className="w-full p-3 text-left hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                        {provider.type === 'facility' ? (
                          <Building2 className="w-5 h-5 text-slate-500" />
                        ) : (
                          <User className="w-5 h-5 text-slate-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{provider.name}</p>
                        <p className="text-sm text-slate-500">
                          NPI: {provider.npi} • {provider.specialties[0]}
                        </p>
                        <div className="flex gap-1 mt-1">
                          <Badge variant="secondary" size="sm">{provider.type}</Badge>
                          <Badge
                            variant={provider.networkStatus === 'active' ? 'success' : 'warning'}
                            size="sm"
                          >
                            {provider.networkStatus}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {providerSearch.length >= 2 && searchResults.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No providers found matching "{providerSearch}"</p>
              </div>
            )}

            {providerSearch.length < 2 && (
              <div className="text-center py-8 text-slate-500">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Enter at least 2 characters to search</p>
              </div>
            )}
          </div>
        )}

        {step === 2 && selectedProviderData && (
          <div className="space-y-4 py-4">
            {/* Selected Provider */}
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border">
                  {selectedProviderData.type === 'facility' ? (
                    <Building2 className="w-5 h-5 text-slate-500" />
                  ) : (
                    <User className="w-5 h-5 text-slate-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{selectedProviderData.name}</p>
                  <p className="text-sm text-slate-500">NPI: {selectedProviderData.npi}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                  Change
                </Button>
              </div>
            </div>

            {/* Case Details Form */}
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Case Title *</Label>
                <Input
                  id="title"
                  placeholder="Brief description of the issue"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value, subcategory: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Subcategory</Label>
                  <Select
                    value={formData.subcategory}
                    onValueChange={(value) => setFormData({ ...formData, subcategory: value })}
                    disabled={!formData.category}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value as CasePriority })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Channel</Label>
                  <Select
                    value={formData.channel}
                    onValueChange={(value) => setFormData({ ...formData, channel: value as CaseChannel })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="portal">Portal</SelectItem>
                      <SelectItem value="fax">Fax</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
                      {linesOfBusiness.map((lob) => (
                        <SelectItem key={lob.id} value={lob.id}>{lob.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">Summary</Label>
                <Textarea
                  id="summary"
                  placeholder="Detailed description of the inquiry..."
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  rows={4}
                />
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {step === 2 && (
            <Button
              onClick={handleSubmit}
              disabled={!formData.title || !formData.category}
            >
              Create Case
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
