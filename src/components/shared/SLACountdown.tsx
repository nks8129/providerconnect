'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { getSLAState, getTimeRemaining } from '@/lib/sla';
import type { Case } from '@/types';
import { cn } from '@/lib/utils';

interface SLACountdownProps {
  caseData: Case;
  className?: string;
  showLabel?: boolean;
}

export function SLACountdown({ caseData, className, showLabel = false }: SLACountdownProps) {
  const [, setTick] = useState(0);

  // Update every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, []);

  // Don't show for resolved/closed cases
  if (caseData.status === 'resolved' || caseData.status === 'closed') {
    return null;
  }

  const slaState = getSLAState(caseData);
  const timeRemaining = getTimeRemaining(caseData);

  return (
    <Badge
      variant={slaState as any}
      className={cn('shrink-0 tabular-nums', className)}
    >
      {showLabel && 'SLA: '}
      {timeRemaining.formatted}
    </Badge>
  );
}

// Hook for using SLA data with real-time updates
export function useSLACountdown(caseData: Case | null) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!caseData) return;

    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 60000);

    return () => clearInterval(interval);
  }, [caseData]);

  if (!caseData || caseData.status === 'resolved' || caseData.status === 'closed') {
    return null;
  }

  return {
    state: getSLAState(caseData),
    timeRemaining: getTimeRemaining(caseData),
    tick,
  };
}
