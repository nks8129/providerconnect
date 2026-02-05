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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { FileText, Search, Copy, Check } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { useAppStore, emailTemplates, resolutionTemplates } from '@/stores/app-store';
import { cn } from '@/lib/utils';

type TemplateType = 'email' | 'resolution';

export function ApplyTemplateModal() {
  const { activeModal, modalData, closeModal, addToast } = useUIStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<TemplateType>('email');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const isOpen = activeModal === 'apply_template';
  const caseId = modalData?.caseId as string | undefined;

  const handleClose = () => {
    setSearchQuery('');
    setCopiedId(null);
    closeModal();
  };

  const getContent = (template: any, type: TemplateType) => {
    if (type === 'email') {
      return template.body || '';
    }
    return template.suggestedResolution || '';
  };

  const allTemplates = [
    ...emailTemplates.map(t => ({ ...t, type: 'email' as const, content: t.body })),
    ...resolutionTemplates.map(t => ({ ...t, type: 'resolution' as const, content: t.suggestedResolution })),
  ];

  const filteredTemplates = allTemplates.filter(t => {
    const matchesType = t.type === selectedType;
    const matchesSearch = searchQuery.length < 2 ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.content && t.content.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    addToast({
      type: 'success',
      title: 'Template Copied',
      message: 'Template content copied to clipboard',
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApply = (template: typeof allTemplates[0]) => {
    // Copy to clipboard
    navigator.clipboard.writeText(template.content);

    addToast({
      type: 'success',
      title: 'Template Applied',
      message: `${template.name} has been copied to your clipboard`,
    });

    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-500" />
            Apply Template
            {caseId && (
              <Badge variant="secondary" size="sm">{caseId}</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Type Selector */}
          <div className="flex gap-2">
            <Button
              variant={selectedType === 'email' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('email')}
            >
              Email Templates
            </Button>
            <Button
              variant={selectedType === 'resolution' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('resolution')}
            >
              Resolution Templates
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Template List */}
          <ScrollArea className="h-[300px] rounded-lg border">
            <div className="p-2 space-y-2">
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No templates found</p>
                </div>
              ) : (
                filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="p-3 rounded-lg border border-slate-200 hover:border-primary-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">{template.name}</p>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {template.content.slice(0, 100)}...
                        </p>
                        <div className="flex gap-1 mt-2">
                          {template.category && (
                            <Badge variant="secondary" size="sm">{template.category}</Badge>
                          )}
                          {template.type === 'email' && 'tone' in template && template.tone && (
                            <Badge variant="outline" size="sm">{template.tone}</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleCopy(template.content, template.id)}
                        >
                          {copiedId === template.id ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleApply(template)}
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
