'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { CaseList } from '@/components/cases/CaseList';
import { CaseDetail } from '@/components/cases/CaseDetail';
import { useCasesStore } from '@/stores/cases-store';
import { useUIStore } from '@/stores/ui-store';

export default function CasesPage() {
  const searchParams = useSearchParams();
  const { cases, selectedCaseId, selectCase } = useCasesStore();
  const { setAssistContext } = useUIStore();

  // Handle URL params for case selection
  useEffect(() => {
    const selected = searchParams.get('selected');
    if (selected) {
      selectCase(selected);
    }
  }, [searchParams, selectCase]);

  // Update assist panel context when case is selected
  useEffect(() => {
    if (selectedCaseId) {
      const selectedCase = cases.find((c) => c.id === selectedCaseId);
      if (selectedCase) {
        setAssistContext({
          caseId: selectedCaseId,
          classification: {
            category: selectedCase.category.replace('cat_', '').replace('_', ' '),
            subcategory: selectedCase.subcategory.replace('sub_', '').replace('_', ' '),
            confidence: 85,
            reasoning: 'Based on keywords in the case title and summary',
          },
          suggestedActions: [
            { id: '1', type: 'task', title: 'Verify provider information', description: 'Check demographics', priority: 'high' },
            { id: '2', type: 'task', title: 'Review case details', description: 'Look up in system', priority: 'high' },
            { id: '3', type: 'note', title: 'Document interaction', description: 'Add conversation notes', priority: 'medium' },
          ],
          similarCases: [
            { caseId: 'CS-24123', title: 'Similar inquiry from another provider', category: selectedCase.category, similarity: 82, resolution: 'Resolved with information' },
            { caseId: 'CS-24098', title: 'Related payment issue', category: 'Claims', similarity: 71 },
          ],
          slaRiskReason: selectedCase.sla.pausedAt
            ? 'SLA is currently paused - waiting on provider'
            : undefined,
        });
      }
    } else {
      setAssistContext(null);
    }
  }, [selectedCaseId, cases, setAssistContext]);

  const selectedCase = cases.find((c) => c.id === selectedCaseId);

  return (
    <div className="h-full flex">
      {/* Case List - Left Panel */}
      <div className="w-96 border-r border-slate-200 bg-white flex flex-col">
        <CaseList />
      </div>

      {/* Case Detail - Right Panel */}
      <div className="flex-1 bg-slate-50 overflow-auto">
        {selectedCase ? (
          <CaseDetail caseData={selectedCase} />
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500">
            <div className="text-center">
              <svg
                className="w-16 h-16 mx-auto mb-4 opacity-20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-sm">Select a case to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
