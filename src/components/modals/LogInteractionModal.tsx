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
import { Search, Building2, User, Phone, Mail, Video, Calendar, Check } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { useInteractionsStore } from '@/stores/interactions-store';
import { useProvidersStore } from '@/stores/providers-store';
import { useCasesStore } from '@/stores/cases-store';
import { useAppStore } from '@/stores/app-store';
import { generateId } from '@/lib/utils';
import type { InteractionType, InteractionDirection, Sentiment } from '@/types';
import { cn } from '@/lib/utils';

const INTERACTION_TYPES = [
  { id: 'call', label: 'Phone Call', icon: Phone },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'meeting', label: 'Meeting', icon: Video },
  { id: 'outreach', label: 'Outreach', icon: Calendar },
];

const SENTIMENT_OPTIONS = [
  { id: 'positive', label: 'Positive', color: 'bg-green-100 text-green-700 border-green-200' },
  { id: 'neutral', label: 'Neutral', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { id: 'negative', label: 'Negative', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { id: 'frustrated', label: 'Frustrated', color: 'bg-red-100 text-red-700 border-red-200' },
];

export function LogInteractionModal() {
  const { activeModal, modalData, closeModal, addToast } = useUIStore();
  const { addInteraction } = useInteractionsStore();
  const { providers, searchProviders } = useProvidersStore();
  const { cases } = useCasesStore();
  const { currentUser } = useAppStore();

  const [step, setStep] = useState(1);
  const [providerSearch, setProviderSearch] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string | null>(
    (modalData?.providerId as string) || null
  );
  const [formData, setFormData] = useState({
    type: 'call' as InteractionType,
    direction: 'inbound' as InteractionDirection,
    caseId: (modalData?.caseId as string) || '',
    duration: 5,
    sentiment: 'neutral' as Sentiment,
    summary: '',
    structuredNotes: {
      reason: '',
      providerReported: '',
      whatWeChecked: '',
      whatWeAdvised: '',
      followUp: '',
      followUpOwner: null as string | null,
      followUpDueDate: null as string | null,
    },
  });

  const isOpen = activeModal === 'create_interaction';

  const handleClose = () => {
    setStep(1);
    setProviderSearch('');
    setSelectedProvider(null);
    setFormData({
      type: 'call',
      direction: 'inbound',
      caseId: '',
      duration: 5,
      sentiment: 'neutral',
      summary: '',
      structuredNotes: {
        reason: '',
        providerReported: '',
        whatWeChecked: '',
        whatWeAdvised: '',
        followUp: '',
        followUpOwner: null,
        followUpDueDate: null,
      },
    });
    closeModal();
  };

  const searchResults = providerSearch.length >= 2
    ? searchProviders(providerSearch).slice(0, 5)
    : [];

  const selectedProviderData = selectedProvider
    ? providers.find(p => p.id === selectedProvider)
    : null;

  const providerCases = selectedProvider
    ? cases.filter(c => c.providerId === selectedProvider && c.status !== 'closed')
    : [];

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
    setStep(2);
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    if (!selectedProvider) return;

    addInteraction({
      providerId: selectedProvider,
      caseId: formData.caseId || null,
      type: formData.type,
      direction: formData.direction,
      channel: formData.type,
      occurredAt: new Date().toISOString(),
      duration: formData.duration,
      participants: [currentUser?.name || 'Unknown'],
      summary: formData.summary,
      notes: '',
      structuredNotes: formData.type === 'call' ? formData.structuredNotes : null,
      sentiment: formData.sentiment,
      attachments: [],
      createdBy: currentUser?.id || '',
    });

    addToast({
      type: 'success',
      title: 'Interaction Logged',
      message: `${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)} interaction has been logged.`,
    });

    handleClose();
  };

  const canProceed = () => {
    if (step === 1) return !!selectedProvider;
    if (step === 2) return !!formData.type;
    if (step === 3) return !!formData.summary || !!formData.structuredNotes.reason;
    return false;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Log Interaction
            <Badge variant="secondary" size="sm">Step {step} of 3</Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex items-center gap-2 py-2">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                  step >= s
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-100 text-slate-400'
                )}
              >
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={cn(
                    'flex-1 h-1 rounded',
                    step > s ? 'bg-blue-500' : 'bg-slate-200'
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Select Provider */}
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

            {selectedProviderData && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
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
                  <Badge variant="success" size="sm">Selected</Badge>
                </div>
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="border rounded-lg divide-y max-h-[250px] overflow-auto">
                {searchResults.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => handleProviderSelect(provider.id)}
                    className={cn(
                      'w-full p-3 text-left hover:bg-slate-50 transition-colors',
                      selectedProvider === provider.id && 'bg-blue-50'
                    )}
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
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Interaction Type & Details */}
        {step === 2 && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Interaction Type</Label>
              <div className="grid grid-cols-4 gap-2">
                {INTERACTION_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setFormData({ ...formData, type: type.id as InteractionType })}
                      className={cn(
                        'p-3 rounded-lg border text-center transition-colors',
                        formData.type === type.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Direction</Label>
                <Select
                  value={formData.direction}
                  onValueChange={(value) => setFormData({ ...formData, direction: value as InteractionDirection })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inbound">Inbound (from provider)</SelectItem>
                    <SelectItem value="outbound">Outbound (to provider)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  min={1}
                  max={120}
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            {providerCases.length > 0 && (
              <div className="space-y-2">
                <Label>Link to Case (optional)</Label>
                <Select
                  value={formData.caseId || 'none'}
                  onValueChange={(value) => setFormData({ ...formData, caseId: value === 'none' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a case to link" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No case linked</SelectItem>
                    {providerCases.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.id} - {c.title.slice(0, 40)}...
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Sentiment</Label>
              <div className="flex gap-2">
                {SENTIMENT_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setFormData({ ...formData, sentiment: option.id as Sentiment })}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
                      formData.sentiment === option.id
                        ? option.color
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Notes */}
        {step === 3 && (
          <div className="space-y-4 py-4">
            {formData.type === 'call' ? (
              <>
                <div className="space-y-2">
                  <Label>Reason for Call *</Label>
                  <Input
                    placeholder="Why did the provider call?"
                    value={formData.structuredNotes.reason}
                    onChange={(e) => setFormData({
                      ...formData,
                      structuredNotes: { ...formData.structuredNotes, reason: e.target.value }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>What Provider Reported</Label>
                  <Textarea
                    placeholder="Provider's description of the issue..."
                    value={formData.structuredNotes.providerReported}
                    onChange={(e) => setFormData({
                      ...formData,
                      structuredNotes: { ...formData.structuredNotes, providerReported: e.target.value }
                    })}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>What We Checked</Label>
                  <Textarea
                    placeholder="Systems/information reviewed..."
                    value={formData.structuredNotes.whatWeChecked}
                    onChange={(e) => setFormData({
                      ...formData,
                      structuredNotes: { ...formData.structuredNotes, whatWeChecked: e.target.value }
                    })}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>What We Advised</Label>
                  <Textarea
                    placeholder="Resolution or guidance provided..."
                    value={formData.structuredNotes.whatWeAdvised}
                    onChange={(e) => setFormData({
                      ...formData,
                      structuredNotes: { ...formData.structuredNotes, whatWeAdvised: e.target.value }
                    })}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Follow-up Needed</Label>
                  <Input
                    placeholder="Any follow-up actions required?"
                    value={formData.structuredNotes.followUp}
                    onChange={(e) => setFormData({
                      ...formData,
                      structuredNotes: { ...formData.structuredNotes, followUp: e.target.value }
                    })}
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label>Summary *</Label>
                <Textarea
                  placeholder="Describe the interaction..."
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  rows={6}
                />
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={step === 1 ? handleClose : handleBack}>
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          {step < 3 ? (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!canProceed()}>
              Log Interaction
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
