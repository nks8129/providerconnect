'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  FileText,
  Lightbulb,
  AlertTriangle,
  Copy,
  Check,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui-store';
import { useCasesStore } from '@/stores/cases-store';

export function AssistPanel() {
  const isOpen = useUIStore((state) => state.assistPanelOpen);
  const context = useUIStore((state) => state.assistPanelContext);
  const loading = useUIStore((state) => state.assistPanelLoading);
  const toggle = useUIStore((state) => state.toggleAssistPanel);
  const setLoading = useUIStore((state) => state.setAssistLoading);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerate = () => {
    setLoading(true);
    // Simulate AI generation delay
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <aside className="w-80 border-l border-slate-200 bg-slate-50 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary-500" />
          <span className="font-semibold text-sm">AI Assist</span>
          <Badge variant="secondary" size="sm">Beta</Badge>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={toggle}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-4 space-y-4">
          {/* Context-aware content */}
          {context?.caseId ? (
            <CaseAssistContent
              context={context}
              loading={loading}
              onGenerate={handleGenerate}
              onCopy={handleCopy}
              copiedId={copiedId}
            />
          ) : context?.providerId ? (
            <ProviderAssistContent context={context} />
          ) : (
            <GlobalAssistContent />
          )}
        </div>
      </div>
    </aside>
  );
}

// Case-specific assist content
function CaseAssistContent({
  context,
  loading,
  onGenerate,
  onCopy,
  copiedId,
}: {
  context: any;
  loading: boolean;
  onGenerate: () => void;
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
}) {
  const { updateCase } = useCasesStore();
  const { addToast } = useUIStore();
  const [classificationApplied, setClassificationApplied] = useState(false);
  const [tasksAdded, setTasksAdded] = useState(false);

  const handleApplyClassification = () => {
    if (!context.caseId || !context.classification) return;

    updateCase(context.caseId, {
      category: context.classification.category,
      subcategory: context.classification.subcategory,
    });

    setClassificationApplied(true);
    addToast({
      type: 'success',
      title: 'Classification Applied',
      message: `Case updated to ${context.classification.category}`,
    });
  };

  const handleAddAllTasks = () => {
    if (!context.caseId) return;

    const actions = context.suggestedActions || defaultActions;
    const newTasks = actions.map((action: any) => ({
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: action.title,
      description: action.description,
      status: 'pending' as const,
      priority: action.priority,
      createdAt: new Date().toISOString(),
      dueAt: null,
      assigneeId: null,
    }));

    // Get current case and add tasks
    const currentCase = useCasesStore.getState().getCase(context.caseId);
    if (currentCase) {
      updateCase(context.caseId, {
        tasks: [...(currentCase.tasks || []), ...newTasks],
      });
    }

    setTasksAdded(true);
    addToast({
      type: 'success',
      title: 'Tasks Added',
      message: `${newTasks.length} tasks added to the case`,
    });
  };

  return (
    <>
      {/* Classification */}
      {context.classification && (
        <AssistSection title="Auto-Classification" icon={<Lightbulb className="w-4 h-4" />}>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{context.classification.category}</span>
              <Badge variant="success" size="sm">
                {context.classification.confidence}% confident
              </Badge>
            </div>
            <p className="text-xs text-slate-500">{context.classification.subcategory}</p>
            <p className="text-xs text-slate-600 mt-2">{context.classification.reasoning}</p>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={handleApplyClassification}
              disabled={classificationApplied}
            >
              {classificationApplied ? (
                <>
                  <Check className="w-3 h-3 mr-1" />
                  Applied
                </>
              ) : (
                'Apply Classification'
              )}
            </Button>
          </div>
        </AssistSection>
      )}

      {/* SLA Risk */}
      {context.slaRiskReason && (
        <AssistSection
          title="SLA Risk Analysis"
          icon={<AlertTriangle className="w-4 h-4 text-yellow-500" />}
        >
          <p className="text-sm text-slate-600">{context.slaRiskReason}</p>
        </AssistSection>
      )}

      {/* Suggested Actions */}
      <AssistSection title="Suggested Actions" icon={<ChecklistIcon />}>
        <div className="space-y-2">
          {(context.suggestedActions || defaultActions).map((action: any) => (
            <div
              key={action.id}
              className="flex items-start gap-2 p-2 rounded-lg hover:bg-white cursor-pointer transition-colors"
            >
              <div
                className={cn(
                  'w-2 h-2 rounded-full mt-1.5',
                  action.priority === 'high' && 'bg-red-500',
                  action.priority === 'medium' && 'bg-yellow-500',
                  action.priority === 'low' && 'bg-slate-300'
                )}
              />
              <div className="flex-1">
                <p className="text-sm font-medium">{action.title}</p>
                <p className="text-xs text-slate-500">{action.description}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2"
          onClick={handleAddAllTasks}
          disabled={tasksAdded}
        >
          {tasksAdded ? (
            <>
              <Check className="w-3 h-3 mr-1" />
              Tasks Added
            </>
          ) : (
            'Add All as Tasks'
          )}
        </Button>
      </AssistSection>

      {/* Similar Cases */}
      <AssistSection title="Similar Past Cases" icon={<FileText className="w-4 h-4" />}>
        <div className="space-y-2">
          {(context.similarCases || defaultSimilarCases).map((c: any) => (
            <div
              key={c.caseId}
              className="p-2 rounded-lg bg-white border border-slate-200 hover:border-primary-300 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-primary-600">{c.caseId}</span>
                <Badge variant="secondary" size="sm">{c.similarity}% match</Badge>
              </div>
              <p className="text-sm mt-1 line-clamp-2">{c.title}</p>
              {c.resolution && (
                <p className="text-xs text-green-600 mt-1">Resolved: {c.resolution}</p>
              )}
            </div>
          ))}
        </div>
      </AssistSection>

      {/* Draft Response */}
      <AssistSection title="Draft Response" icon={<EmailIcon />}>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={onGenerate}
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => useUIStore.getState().openModal('apply_template', { caseId: context.caseId })}
            >
              <FileText className="w-4 h-4 mr-2" />
              Templates
            </Button>
          </div>
          {context.draftResponses?.[0] && (
            <div className="relative p-3 rounded-lg bg-white border border-slate-200 text-sm">
              <p className="text-xs font-medium text-slate-500 mb-1">
                Subject: {context.draftResponses[0].subject}
              </p>
              <p className="text-slate-700 whitespace-pre-wrap line-clamp-6">
                {context.draftResponses[0].body}
              </p>
              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onCopy(context.draftResponses[0].body, 'draft')}
                >
                  {copiedId === 'draft' ? (
                    <>
                      <Check className="w-3 h-3 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
                <Button variant="default" size="sm" className="flex-1">
                  Use in Case
                </Button>
              </div>
            </div>
          )}
        </div>
      </AssistSection>
    </>
  );
}

// Provider-specific assist content
function ProviderAssistContent({ context }: { context: any }) {
  return (
    <>
      <AssistSection title="Provider Insights" icon={<Lightbulb className="w-4 h-4" />}>
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-white border border-slate-200">
            <p className="text-xs font-medium text-slate-500">Recent Activity</p>
            <p className="text-sm mt-1">5 interactions in the last 30 days</p>
          </div>
          <div className="p-3 rounded-lg bg-white border border-slate-200">
            <p className="text-xs font-medium text-slate-500">Top Inquiry Types</p>
            <div className="flex flex-wrap gap-1 mt-1">
              <Badge variant="secondary" size="sm">Claims (3)</Badge>
              <Badge variant="secondary" size="sm">Eligibility (2)</Badge>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
            <p className="text-xs font-medium text-yellow-700">Repeat Provider</p>
            <p className="text-sm text-yellow-800 mt-1">
              This provider has contacted us 5 times this month about similar issues.
            </p>
          </div>
        </div>
      </AssistSection>
    </>
  );
}

// Global assist content (no specific context)
function GlobalAssistContent() {
  return (
    <>
      <AssistSection title="Quick Insights" icon={<Sparkles className="w-4 h-4" />}>
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-white border border-slate-200">
            <p className="text-xs font-medium text-slate-500">Top Drivers This Week</p>
            <div className="space-y-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Claims & Payment</span>
                <span className="text-sm font-medium">42%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Prior Authorization</span>
                <span className="text-sm font-medium">28%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Eligibility</span>
                <span className="text-sm font-medium">15%</span>
              </div>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
            <p className="text-xs font-medium text-orange-700">Trend Alert</p>
            <p className="text-sm text-orange-800 mt-1">
              Prior auth inquiries have increased 25% compared to last week.
            </p>
          </div>
        </div>
      </AssistSection>

      <AssistSection title="Suggested Outreach Topics" icon={<Lightbulb className="w-4 h-4" />}>
        <div className="space-y-2">
          <div className="p-2 rounded-lg hover:bg-white cursor-pointer transition-colors">
            <p className="text-sm font-medium">Prior Auth Process Updates</p>
            <p className="text-xs text-slate-500">Based on high inquiry volume</p>
          </div>
          <div className="p-2 rounded-lg hover:bg-white cursor-pointer transition-colors">
            <p className="text-sm font-medium">Portal Navigation Tips</p>
            <p className="text-xs text-slate-500">Many providers have login issues</p>
          </div>
        </div>
      </AssistSection>
    </>
  );
}

// Reusable section component
function AssistSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-slate-700">
        {icon}
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      {children}
      <Separator className="mt-4" />
    </div>
  );
}

// Icon components
function ChecklistIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

// Default data for demo
const defaultActions = [
  { id: '1', title: 'Verify provider information', description: 'Check demographics and contact details', priority: 'high' },
  { id: '2', title: 'Review claim details', description: 'Look up specific claim in system', priority: 'high' },
  { id: '3', title: 'Document interaction', description: 'Add notes about this conversation', priority: 'medium' },
];

const defaultSimilarCases = [
  { caseId: 'CS-24123', title: 'Claim denied - missing modifier on professional claim', similarity: 87, resolution: 'Resubmission with correct modifier' },
  { caseId: 'CS-24098', title: 'Payment not received for claim submitted 2 weeks ago', similarity: 72, resolution: 'Claim was in pending status, released for payment' },
];
