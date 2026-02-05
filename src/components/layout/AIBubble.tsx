'use client';

import React, { useState, useEffect } from 'react';
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
  MessageCircle,
  Minimize2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui-store';
import { useCasesStore } from '@/stores/cases-store';

export function AIBubble() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const context = useUIStore((state) => state.assistPanelContext);
  const loading = useUIStore((state) => state.assistPanelLoading);
  const setLoading = useUIStore((state) => state.setAssistLoading);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleToggle = () => {
    setIsAnimating(true);
    setIsExpanded(!isExpanded);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <>
      {/* Backdrop when expanded */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-300"
          onClick={handleToggle}
        />
      )}

      {/* Main container */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Expanded Panel */}
        <div
          className={cn(
            'absolute bottom-0 right-0 w-[380px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transition-all duration-300 ease-out origin-bottom-right',
            isExpanded
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/20 rounded-lg">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-semibold">AI Assistant</span>
              <Badge className="bg-white/20 text-white text-[10px] px-1.5 py-0">Beta</Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleToggle}
                className="text-white hover:bg-white/20"
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="h-[450px]">
            <div className="p-4 space-y-4">
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
          </ScrollArea>

          {/* Footer */}
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 text-center">
              AI suggestions are for reference only. Always verify before taking action.
            </p>
          </div>
        </div>

        {/* Floating Bubble Button */}
        <button
          onClick={handleToggle}
          className={cn(
            'group relative w-14 h-14 rounded-full shadow-lg transition-all duration-300 ease-out',
            'bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700',
            'flex items-center justify-center',
            isExpanded ? 'scale-0 opacity-0' : 'scale-100 opacity-100',
            isAnimating && 'animate-bounce-subtle'
          )}
        >
          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-full bg-primary-400 animate-ping opacity-20" />

          {/* Icon */}
          <Sparkles className="w-6 h-6 text-white transition-transform group-hover:scale-110" />

          {/* Notification dot when there's context */}
          {context && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <span className="w-2 h-2 bg-white rounded-full" />
            </span>
          )}

          {/* Tooltip */}
          <span className="absolute right-full mr-3 px-3 py-1.5 bg-slate-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            AI Assistant
            <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-2 bg-slate-900 rotate-45" />
          </span>
        </button>
      </div>
    </>
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
  const { addToast, openModal } = useUIStore();
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
      {/* Context Badge */}
      <div className="flex items-center gap-2 p-2 bg-primary-50 rounded-lg">
        <FileText className="w-4 h-4 text-primary-500" />
        <span className="text-sm font-medium text-primary-700">
          Analyzing Case {context.caseId}
        </span>
      </div>

      {/* Classification */}
      {context.classification && (
        <AssistSection title="Auto-Classification" icon={<Lightbulb className="w-4 h-4 text-yellow-500" />}>
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
              className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <div
                className={cn(
                  'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                  action.priority === 'high' && 'bg-red-500',
                  action.priority === 'medium' && 'bg-yellow-500',
                  action.priority === 'low' && 'bg-slate-300'
                )}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{action.title}</p>
                <p className="text-xs text-slate-500">{action.description}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
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
              className="p-2 rounded-lg bg-slate-50 border border-slate-100 hover:border-primary-200 cursor-pointer transition-colors"
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
      <AssistSection title="Quick Actions" icon={<EmailIcon />}>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onGenerate}
            disabled={loading}
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-3 h-3 mr-1" />
                Generate
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => useUIStore.getState().openModal('apply_template', { caseId: context.caseId })}
          >
            <FileText className="w-3 h-3 mr-1" />
            Templates
          </Button>
        </div>
      </AssistSection>
    </>
  );
}

// Provider-specific assist content
function ProviderAssistContent({ context }: { context: any }) {
  return (
    <>
      <div className="flex items-center gap-2 p-2 bg-primary-50 rounded-lg">
        <MessageCircle className="w-4 h-4 text-primary-500" />
        <span className="text-sm font-medium text-primary-700">
          Provider Insights
        </span>
      </div>

      <AssistSection title="Recent Activity" icon={<Lightbulb className="w-4 h-4" />}>
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-xs font-medium text-slate-500">Interactions</p>
            <p className="text-sm mt-1">5 interactions in the last 30 days</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
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

// Global assist content
function GlobalAssistContent() {
  return (
    <>
      <div className="text-center py-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center mb-3">
          <Sparkles className="w-8 h-8 text-primary-500" />
        </div>
        <h3 className="font-semibold text-slate-900">AI Assistant</h3>
        <p className="text-sm text-slate-500 mt-1">
          Select a case or provider to get contextual suggestions
        </p>
      </div>

      <AssistSection title="Quick Insights" icon={<Lightbulb className="w-4 h-4" />}>
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-xs font-medium text-slate-500">Top Drivers This Week</p>
            <div className="space-y-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Claims & Payment</span>
                <span className="text-sm font-medium">42%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '42%' }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Prior Authorization</span>
                <span className="text-sm font-medium">28%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '28%' }} />
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

// Default data
const defaultActions = [
  { id: '1', title: 'Verify provider information', description: 'Check demographics and contact details', priority: 'high' },
  { id: '2', title: 'Review claim details', description: 'Look up specific claim in system', priority: 'high' },
  { id: '3', title: 'Document interaction', description: 'Add notes about this conversation', priority: 'medium' },
];

const defaultSimilarCases = [
  { caseId: 'CS-24123', title: 'Claim denied - missing modifier', similarity: 87, resolution: 'Resubmission with correct modifier' },
  { caseId: 'CS-24098', title: 'Payment not received for claim', similarity: 72, resolution: 'Claim was in pending status' },
];
