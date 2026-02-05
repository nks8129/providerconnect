import {
  differenceInHours,
  differenceInMinutes,
  addHours,
  parseISO,
  isPast,
  formatDistanceToNow,
} from 'date-fns';
import type { Case, CasePriority, SLAState, SLAPolicy } from '@/types';

// ============================================================================
// Default SLA Configuration
// ============================================================================

export const DEFAULT_SLA_HOURS: Record<CasePriority, number> = {
  urgent: 4,
  high: 8,
  medium: 24,
  low: 72,
};

export const SLA_WARNING_THRESHOLD = 75; // Percentage of time used before showing warning

// ============================================================================
// SLA Calculation Functions
// ============================================================================

/**
 * Calculate the SLA due date based on priority
 */
export function calculateSLADueDate(
  createdAt: string,
  priority: CasePriority,
  categoryHours?: number
): string {
  const hours = categoryHours ?? DEFAULT_SLA_HOURS[priority];
  const created = parseISO(createdAt);
  return addHours(created, hours).toISOString();
}

/**
 * Get the current SLA state for a case
 */
export function getSLAState(caseData: Case): SLAState {
  const { sla, status } = caseData;

  // Resolved or closed cases are always on track (SLA doesn't apply)
  if (status === 'resolved' || status === 'closed') {
    return 'on_track';
  }

  // Paused cases show their state before pause
  if (sla.pausedAt) {
    // Calculate based on time before pause
    const timeUsed = getTimeUsedBeforePause(caseData);
    const totalTime = getTotalSLATime(caseData);
    const percentUsed = (timeUsed / totalTime) * 100;

    if (percentUsed >= 100) return 'breached';
    if (percentUsed >= SLA_WARNING_THRESHOLD) return 'at_risk';
    return 'on_track';
  }

  const now = new Date();
  const dueDate = parseISO(sla.dueAt);

  // Already past due
  if (isPast(dueDate)) {
    return 'breached';
  }

  // Calculate percentage of time used
  const totalHours = getTotalSLATime(caseData);
  const hoursRemaining = differenceInHours(dueDate, now);
  const percentUsed = ((totalHours - hoursRemaining) / totalHours) * 100;

  if (percentUsed >= SLA_WARNING_THRESHOLD) {
    return 'at_risk';
  }

  return 'on_track';
}

/**
 * Get time remaining until SLA breach
 */
export function getTimeRemaining(caseData: Case): {
  hours: number;
  minutes: number;
  isNegative: boolean;
  formatted: string;
} {
  const { sla, status } = caseData;

  // Resolved/closed cases don't have remaining time
  if (status === 'resolved' || status === 'closed') {
    return { hours: 0, minutes: 0, isNegative: false, formatted: 'Resolved' };
  }

  // For paused cases, calculate remaining from pause point
  if (sla.pausedAt) {
    const pauseDate = parseISO(sla.pausedAt);
    const dueDate = parseISO(sla.dueAt);
    const totalMinutes = differenceInMinutes(dueDate, pauseDate);
    const hours = Math.floor(Math.abs(totalMinutes) / 60);
    const minutes = Math.abs(totalMinutes) % 60;
    const isNegative = totalMinutes < 0;

    return {
      hours,
      minutes,
      isNegative,
      formatted: formatTimeRemaining(hours, minutes, isNegative, true),
    };
  }

  const now = new Date();
  const dueDate = parseISO(sla.dueAt);
  const totalMinutes = differenceInMinutes(dueDate, now);
  const hours = Math.floor(Math.abs(totalMinutes) / 60);
  const minutes = Math.abs(totalMinutes) % 60;
  const isNegative = totalMinutes < 0;

  return {
    hours,
    minutes,
    isNegative,
    formatted: formatTimeRemaining(hours, minutes, isNegative),
  };
}

/**
 * Format time remaining as human-readable string
 */
function formatTimeRemaining(
  hours: number,
  minutes: number,
  isNegative: boolean,
  isPaused = false
): string {
  const pauseIndicator = isPaused ? ' (paused)' : '';

  if (isNegative) {
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      return `${days}d overdue${pauseIndicator}`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m overdue${pauseIndicator}`;
    }
    return `${minutes}m overdue${pauseIndicator}`;
  }

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (remainingHours > 0) {
      return `${days}d ${remainingHours}h${pauseIndicator}`;
    }
    return `${days}d${pauseIndicator}`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m${pauseIndicator}`;
  }

  return `${minutes}m${pauseIndicator}`;
}

/**
 * Get total SLA time in hours for a case
 */
export function getTotalSLATime(caseData: Case): number {
  const created = parseISO(caseData.createdAt);
  const due = parseISO(caseData.sla.dueAt);
  return differenceInHours(due, created);
}

/**
 * Get time used before pause (for paused cases)
 */
function getTimeUsedBeforePause(caseData: Case): number {
  if (!caseData.sla.pausedAt) return 0;
  const created = parseISO(caseData.createdAt);
  const paused = parseISO(caseData.sla.pausedAt);
  return differenceInHours(paused, created);
}

/**
 * Calculate new due date after resuming from pause
 */
export function calculateResumedDueDate(caseData: Case): string {
  if (!caseData.sla.pausedAt) return caseData.sla.dueAt;

  const now = new Date();
  const pausedAt = parseISO(caseData.sla.pausedAt);
  const originalDue = parseISO(caseData.sla.dueAt);

  // Time remaining when paused
  const remainingAtPause = differenceInMinutes(originalDue, pausedAt);

  // Add remaining time to now
  return addHours(now, remainingAtPause / 60).toISOString();
}

/**
 * Get SLA percentage used
 */
export function getSLAPercentageUsed(caseData: Case): number {
  const { sla, status, createdAt } = caseData;

  if (status === 'resolved' || status === 'closed') {
    return 0;
  }

  const created = parseISO(createdAt);
  const due = parseISO(sla.dueAt);
  const totalHours = differenceInHours(due, created);

  let effectiveNow: Date;
  if (sla.pausedAt) {
    effectiveNow = parseISO(sla.pausedAt);
  } else {
    effectiveNow = new Date();
  }

  const hoursUsed = differenceInHours(effectiveNow, created);
  const percentage = (hoursUsed / totalHours) * 100;

  return Math.min(Math.max(percentage, 0), 150); // Cap at 150% for display
}

/**
 * Get the appropriate SLA policy for a case
 */
export function getApplicableSLAPolicy(
  policies: SLAPolicy[],
  category: string,
  priority: CasePriority,
  lob?: string,
  subcategory?: string
): SLAPolicy | null {
  // Sort by specificity (most specific first)
  const sortedPolicies = policies
    .filter((p) => p.isActive)
    .sort((a, b) => {
      let aScore = 0;
      let bScore = 0;

      if (a.category === category) aScore += 10;
      if (b.category === category) bScore += 10;
      if (a.subcategory === subcategory) aScore += 5;
      if (b.subcategory === subcategory) bScore += 5;
      if (a.priority === priority) aScore += 3;
      if (b.priority === priority) bScore += 3;
      if (a.lob === lob) aScore += 2;
      if (b.lob === lob) bScore += 2;

      return bScore - aScore;
    });

  // Find best match
  return sortedPolicies.find(
    (p) =>
      p.category === category &&
      p.priority === priority &&
      (!p.lob || p.lob === lob) &&
      (!p.subcategory || p.subcategory === subcategory)
  ) || sortedPolicies[0] || null;
}

/**
 * Format SLA due date for display
 */
export function formatSLADueDate(dueAt: string): string {
  const due = parseISO(dueAt);
  return formatDistanceToNow(due, { addSuffix: true });
}

/**
 * Check if SLA is about to breach (within warning threshold)
 */
export function isSLAAtRisk(caseData: Case): boolean {
  return getSLAState(caseData) === 'at_risk';
}

/**
 * Check if SLA has breached
 */
export function isSLABreached(caseData: Case): boolean {
  return getSLAState(caseData) === 'breached';
}

/**
 * Get SLA stats for a collection of cases
 */
export function getSLAStats(cases: Case[]): {
  total: number;
  onTrack: number;
  atRisk: number;
  breached: number;
  complianceRate: number;
} {
  const activeCases = cases.filter(
    (c) => c.status !== 'resolved' && c.status !== 'closed'
  );

  const stats = activeCases.reduce(
    (acc, c) => {
      const state = getSLAState(c);
      acc[state]++;
      return acc;
    },
    { on_track: 0, at_risk: 0, breached: 0 }
  );

  const total = activeCases.length;
  const complianceRate = total > 0 ? ((stats.on_track + stats.at_risk) / total) * 100 : 100;

  return {
    total,
    onTrack: stats.on_track,
    atRisk: stats.at_risk,
    breached: stats.breached,
    complianceRate,
  };
}
