// ============================================================================
// Cases Store - Manages case state and operations
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Case, CaseStatus, CasePriority, CaseTask, FilterState, SavedView, AuditEvent } from '@/types';
import { STORAGE_KEYS } from '@/lib/storage';
import { generateId, generateCaseId } from '@/lib/utils';
import { getSLAState, calculateSLADueDate } from '@/lib/sla';
import { useAppStore } from './app-store';

interface CasesState {
  cases: Case[];
  isHydrated: boolean;

  // Filters and views
  currentFilters: FilterState;
  savedViews: SavedView[];
  selectedCaseId: string | null;

  // Actions
  setHydrated: () => void;
  setCases: (cases: Case[]) => void;

  // Case CRUD
  addCase: (caseData: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>) => Case;
  updateCase: (id: string, updates: Partial<Case>) => void;
  deleteCase: (id: string) => void;

  // Case getters
  getCase: (id: string) => Case | undefined;
  getCasesByProvider: (providerId: string) => Case[];
  getCasesByAssignee: (assigneeId: string) => Case[];
  getCasesByStatus: (status: CaseStatus) => Case[];
  getOpenCases: () => Case[];
  getFilteredCases: (filters?: Partial<FilterState>) => Case[];

  // Case operations
  assignCase: (id: string, assigneeId: string) => void;
  updateStatus: (id: string, status: CaseStatus) => void;
  updatePriority: (id: string, priority: CasePriority) => void;
  pauseSLA: (id: string, reason: string) => void;
  resumeSLA: (id: string) => void;
  resolveCase: (id: string, resolution: Case['resolution']) => void;

  // Task operations
  addTask: (caseId: string, title: string) => void;
  completeTask: (caseId: string, taskId: string) => void;
  deleteTask: (caseId: string, taskId: string) => void;

  // Tag operations
  addTag: (caseId: string, tag: string) => void;
  removeTag: (caseId: string, tag: string) => void;

  // Filter operations
  setFilters: (filters: Partial<FilterState>) => void;
  clearFilters: () => void;
  selectCase: (id: string | null) => void;

  // Saved views
  saveView: (view: Omit<SavedView, 'id'>) => void;
  deleteView: (id: string) => void;

  // Stats
  getStats: () => {
    total: number;
    open: number;
    inProgress: number;
    pendingProvider: number;
    resolved: number;
    breached: number;
    atRisk: number;
    unassigned: number;
  };
}

const defaultFilters: FilterState = {
  search: '',
  status: [],
  priority: [],
  category: [],
  subcategory: [],
  lob: [],
  assignee: [],
  team: [],
  channel: [],
  slaState: [],
  dateRange: { start: null, end: null },
};

const defaultSavedViews: SavedView[] = [
  {
    id: 'view_my_queue',
    name: 'My Queue',
    filters: {},
    sortBy: 'updatedAt',
    sortOrder: 'desc',
    isDefault: true,
    createdBy: 'system',
  },
  {
    id: 'view_unassigned',
    name: 'Unassigned',
    filters: { assignee: ['unassigned'] },
    sortBy: 'createdAt',
    sortOrder: 'asc',
    isDefault: false,
    createdBy: 'system',
  },
  {
    id: 'view_breaching',
    name: 'Breaching SLA',
    filters: { slaState: ['breached', 'at_risk'] },
    sortBy: 'updatedAt',
    sortOrder: 'asc',
    isDefault: false,
    createdBy: 'system',
  },
];

export const useCasesStore = create<CasesState>()(
  persist(
    (set, get) => ({
      cases: [],
      isHydrated: false,
      currentFilters: defaultFilters,
      savedViews: defaultSavedViews,
      selectedCaseId: null,

      setHydrated: () => set({ isHydrated: true }),

      setCases: (cases) => set({ cases }),

      // Case CRUD
      addCase: (caseData) => {
        const now = new Date().toISOString();
        const newCase: Case = {
          ...caseData,
          id: generateCaseId(),
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          cases: [newCase, ...state.cases],
        }));

        // Add audit event
        const appStore = useAppStore.getState();
        appStore.addAuditEvent({
          id: generateId('audit'),
          entityType: 'case',
          entityId: newCase.id,
          action: 'created',
          actorId: appStore.currentUser?.id || 'system',
          timestamp: now,
          metadata: { category: newCase.category, priority: newCase.priority },
          description: `Case created: ${newCase.title}`,
        });

        return newCase;
      },

      updateCase: (id, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: now } : c
          ),
        }));
      },

      deleteCase: (id) => {
        set((state) => ({
          cases: state.cases.filter((c) => c.id !== id),
          selectedCaseId: state.selectedCaseId === id ? null : state.selectedCaseId,
        }));
      },

      // Case getters
      getCase: (id) => get().cases.find((c) => c.id === id),

      getCasesByProvider: (providerId) =>
        get().cases.filter((c) => c.providerId === providerId),

      getCasesByAssignee: (assigneeId) =>
        get().cases.filter((c) => c.assigneeId === assigneeId),

      getCasesByStatus: (status) =>
        get().cases.filter((c) => c.status === status),

      getOpenCases: () =>
        get().cases.filter(
          (c) => c.status !== 'resolved' && c.status !== 'closed'
        ),

      getFilteredCases: (filters) => {
        const appliedFilters = { ...get().currentFilters, ...filters };
        let result = get().cases;

        // Search filter
        if (appliedFilters.search) {
          const search = appliedFilters.search.toLowerCase();
          result = result.filter(
            (c) =>
              c.id.toLowerCase().includes(search) ||
              c.title.toLowerCase().includes(search) ||
              c.summary.toLowerCase().includes(search)
          );
        }

        // Status filter
        if (appliedFilters.status.length > 0) {
          result = result.filter((c) => appliedFilters.status.includes(c.status));
        }

        // Priority filter
        if (appliedFilters.priority.length > 0) {
          result = result.filter((c) => appliedFilters.priority.includes(c.priority));
        }

        // Category filter
        if (appliedFilters.category.length > 0) {
          result = result.filter((c) => appliedFilters.category.includes(c.category));
        }

        // Subcategory filter
        if (appliedFilters.subcategory.length > 0) {
          result = result.filter((c) => appliedFilters.subcategory.includes(c.subcategory));
        }

        // LOB filter
        if (appliedFilters.lob.length > 0) {
          result = result.filter((c) => appliedFilters.lob.includes(c.lob));
        }

        // Assignee filter
        if (appliedFilters.assignee.length > 0) {
          if (appliedFilters.assignee.includes('unassigned')) {
            result = result.filter((c) => !c.assigneeId);
          } else {
            result = result.filter((c) => c.assigneeId && appliedFilters.assignee.includes(c.assigneeId));
          }
        }

        // Team filter
        if (appliedFilters.team.length > 0) {
          result = result.filter((c) => appliedFilters.team.includes(c.teamId));
        }

        // Channel filter
        if (appliedFilters.channel.length > 0) {
          result = result.filter((c) => appliedFilters.channel.includes(c.channel));
        }

        // SLA state filter
        if (appliedFilters.slaState.length > 0) {
          result = result.filter((c) => {
            const state = getSLAState(c);
            return appliedFilters.slaState.includes(state);
          });
        }

        // Date range filter
        if (appliedFilters.dateRange.start) {
          result = result.filter(
            (c) => new Date(c.createdAt) >= new Date(appliedFilters.dateRange.start!)
          );
        }
        if (appliedFilters.dateRange.end) {
          result = result.filter(
            (c) => new Date(c.createdAt) <= new Date(appliedFilters.dateRange.end!)
          );
        }

        return result;
      },

      // Case operations
      assignCase: (id, assigneeId) => {
        const now = new Date().toISOString();
        const caseData = get().getCase(id);
        const previousAssignee = caseData?.assigneeId;

        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === id
              ? { ...c, assigneeId, status: c.status === 'open' ? 'in_progress' : c.status, updatedAt: now }
              : c
          ),
        }));

        // Add audit event
        const appStore = useAppStore.getState();
        appStore.addAuditEvent({
          id: generateId('audit'),
          entityType: 'case',
          entityId: id,
          action: previousAssignee ? 'reassigned' : 'assigned',
          actorId: appStore.currentUser?.id || 'system',
          timestamp: now,
          metadata: { assigneeId, previousAssignee },
          description: `Case ${previousAssignee ? 'reassigned' : 'assigned'} to ${appStore.getUser(assigneeId)?.name || 'team member'}`,
        });
      },

      updateStatus: (id, status) => {
        const now = new Date().toISOString();
        const caseData = get().getCase(id);
        const previousStatus = caseData?.status;

        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === id ? { ...c, status, updatedAt: now } : c
          ),
        }));

        // Add audit event
        const appStore = useAppStore.getState();
        appStore.addAuditEvent({
          id: generateId('audit'),
          entityType: 'case',
          entityId: id,
          action: 'status_changed',
          actorId: appStore.currentUser?.id || 'system',
          timestamp: now,
          metadata: { status, previousStatus },
          description: `Status changed from ${previousStatus} to ${status}`,
        });
      },

      updatePriority: (id, priority) => {
        const now = new Date().toISOString();
        const caseData = get().getCase(id);

        if (!caseData) return;

        // Recalculate SLA with new priority
        const newDueAt = calculateSLADueDate(caseData.createdAt, priority);

        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === id
              ? {
                  ...c,
                  priority,
                  sla: { ...c.sla, dueAt: newDueAt },
                  updatedAt: now,
                }
              : c
          ),
        }));

        // Add audit event
        const appStore = useAppStore.getState();
        appStore.addAuditEvent({
          id: generateId('audit'),
          entityType: 'case',
          entityId: id,
          action: 'priority_changed',
          actorId: appStore.currentUser?.id || 'system',
          timestamp: now,
          metadata: { priority, previousPriority: caseData.priority },
          description: `Priority changed to ${priority}`,
        });
      },

      pauseSLA: (id, reason) => {
        const now = new Date().toISOString();
        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === id
              ? {
                  ...c,
                  status: 'pending_provider' as CaseStatus,
                  sla: { ...c.sla, pausedAt: now, pauseReason: reason },
                  updatedAt: now,
                }
              : c
          ),
        }));

        // Add audit event
        const appStore = useAppStore.getState();
        appStore.addAuditEvent({
          id: generateId('audit'),
          entityType: 'case',
          entityId: id,
          action: 'sla_paused',
          actorId: appStore.currentUser?.id || 'system',
          timestamp: now,
          metadata: { reason },
          description: `SLA paused: ${reason}`,
        });
      },

      resumeSLA: (id) => {
        const now = new Date().toISOString();
        const caseData = get().getCase(id);

        if (!caseData || !caseData.sla.pausedAt) return;

        // Calculate new due date based on paused time
        const pausedMs = new Date(now).getTime() - new Date(caseData.sla.pausedAt).getTime();
        const originalDue = new Date(caseData.sla.dueAt).getTime();
        const newDueAt = new Date(originalDue + pausedMs).toISOString();

        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === id
              ? {
                  ...c,
                  status: 'in_progress' as CaseStatus,
                  sla: {
                    ...c.sla,
                    pausedAt: null,
                    pauseReason: null,
                    dueAt: newDueAt,
                    totalPausedTime: (c.sla.totalPausedTime || 0) + pausedMs,
                  },
                  updatedAt: now,
                }
              : c
          ),
        }));

        // Add audit event
        const appStore = useAppStore.getState();
        appStore.addAuditEvent({
          id: generateId('audit'),
          entityType: 'case',
          entityId: id,
          action: 'sla_resumed',
          actorId: appStore.currentUser?.id || 'system',
          timestamp: now,
          metadata: { newDueAt },
          description: 'SLA resumed',
        });
      },

      resolveCase: (id, resolution) => {
        const now = new Date().toISOString();
        const appStore = useAppStore.getState();

        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === id
              ? {
                  ...c,
                  status: 'resolved' as CaseStatus,
                  resolution: {
                    ...resolution,
                    resolvedAt: now,
                    resolvedBy: appStore.currentUser?.id || null,
                  },
                  updatedAt: now,
                }
              : c
          ),
        }));

        // Add audit event
        appStore.addAuditEvent({
          id: generateId('audit'),
          entityType: 'case',
          entityId: id,
          action: 'resolved',
          actorId: appStore.currentUser?.id || 'system',
          timestamp: now,
          metadata: { disposition: resolution.disposition, rootCause: resolution.rootCause },
          description: 'Case resolved',
        });
      },

      // Task operations
      addTask: (caseId, title) => {
        const now = new Date().toISOString();
        const newTask: CaseTask = {
          id: generateId('task'),
          title,
          completed: false,
          completedAt: null,
          completedBy: null,
          createdAt: now,
        };

        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === caseId
              ? { ...c, tasks: [...c.tasks, newTask], updatedAt: now }
              : c
          ),
        }));

        // Add audit event
        const appStore = useAppStore.getState();
        appStore.addAuditEvent({
          id: generateId('audit'),
          entityType: 'case',
          entityId: caseId,
          action: 'task_added',
          actorId: appStore.currentUser?.id || 'system',
          timestamp: now,
          metadata: { taskId: newTask.id, title },
          description: `Task added: ${title}`,
        });
      },

      completeTask: (caseId, taskId) => {
        const now = new Date().toISOString();
        const appStore = useAppStore.getState();

        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === caseId
              ? {
                  ...c,
                  tasks: c.tasks.map((t) =>
                    t.id === taskId
                      ? {
                          ...t,
                          completed: true,
                          completedAt: now,
                          completedBy: appStore.currentUser?.id || null,
                        }
                      : t
                  ),
                  updatedAt: now,
                }
              : c
          ),
        }));

        // Add audit event
        appStore.addAuditEvent({
          id: generateId('audit'),
          entityType: 'case',
          entityId: caseId,
          action: 'task_completed',
          actorId: appStore.currentUser?.id || 'system',
          timestamp: now,
          metadata: { taskId },
          description: 'Task completed',
        });
      },

      deleteTask: (caseId, taskId) => {
        const now = new Date().toISOString();
        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === caseId
              ? { ...c, tasks: c.tasks.filter((t) => t.id !== taskId), updatedAt: now }
              : c
          ),
        }));
      },

      // Tag operations
      addTag: (caseId, tag) => {
        const now = new Date().toISOString();
        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === caseId && !c.tags.includes(tag)
              ? { ...c, tags: [...c.tags, tag], updatedAt: now }
              : c
          ),
        }));
      },

      removeTag: (caseId, tag) => {
        const now = new Date().toISOString();
        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === caseId
              ? { ...c, tags: c.tags.filter((t) => t !== tag), updatedAt: now }
              : c
          ),
        }));
      },

      // Filter operations
      setFilters: (filters) =>
        set((state) => ({
          currentFilters: { ...state.currentFilters, ...filters },
        })),

      clearFilters: () => set({ currentFilters: defaultFilters }),

      selectCase: (id) => set({ selectedCaseId: id }),

      // Saved views
      saveView: (view) => {
        const newView: SavedView = {
          ...view,
          id: generateId('view'),
        };
        set((state) => ({
          savedViews: [...state.savedViews, newView],
        }));
      },

      deleteView: (id) =>
        set((state) => ({
          savedViews: state.savedViews.filter((v) => v.id !== id),
        })),

      // Stats
      getStats: () => {
        const cases = get().cases;
        const openCases = cases.filter(
          (c) => c.status !== 'resolved' && c.status !== 'closed'
        );

        return {
          total: cases.length,
          open: cases.filter((c) => c.status === 'open').length,
          inProgress: cases.filter((c) => c.status === 'in_progress').length,
          pendingProvider: cases.filter((c) => c.status === 'pending_provider').length,
          resolved: cases.filter((c) => c.status === 'resolved' || c.status === 'closed').length,
          breached: openCases.filter((c) => getSLAState(c) === 'breached').length,
          atRisk: openCases.filter((c) => getSLAState(c) === 'at_risk').length,
          unassigned: openCases.filter((c) => !c.assigneeId).length,
        };
      },
    }),
    {
      name: STORAGE_KEYS.CASES,
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
