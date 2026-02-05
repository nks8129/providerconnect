// ============================================================================
// Interactions Store - Manages interaction logs and operations
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Interaction, InteractionType, Sentiment } from '@/types';
import { STORAGE_KEYS } from '@/lib/storage';
import { generateId } from '@/lib/utils';
import { useAppStore } from './app-store';

interface InteractionsState {
  interactions: Interaction[];
  isHydrated: boolean;

  // Actions
  setHydrated: () => void;
  setInteractions: (interactions: Interaction[]) => void;

  // Interaction CRUD
  addInteraction: (interaction: Omit<Interaction, 'id' | 'createdAt'>) => Interaction;
  updateInteraction: (id: string, updates: Partial<Interaction>) => void;
  deleteInteraction: (id: string) => void;

  // Interaction getters
  getInteraction: (id: string) => Interaction | undefined;
  getInteractionsByProvider: (providerId: string) => Interaction[];
  getInteractionsByCase: (caseId: string) => Interaction[];
  getRecentInteractions: (limit?: number) => Interaction[];
  getFilteredInteractions: (filters: InteractionFilters) => Interaction[];

  // Link to case
  linkToCase: (interactionId: string, caseId: string) => void;
  unlinkFromCase: (interactionId: string) => void;
}

interface InteractionFilters {
  search?: string;
  providerId?: string;
  caseId?: string;
  type?: InteractionType[];
  direction?: Interaction['direction'][];
  sentiment?: Sentiment[];
  dateRange?: {
    start: string | null;
    end: string | null;
  };
}

export const useInteractionsStore = create<InteractionsState>()(
  persist(
    (set, get) => ({
      interactions: [],
      isHydrated: false,

      setHydrated: () => set({ isHydrated: true }),

      setInteractions: (interactions) => set({ interactions }),

      // Interaction CRUD
      addInteraction: (interactionData) => {
        const now = new Date().toISOString();
        const appStore = useAppStore.getState();

        const newInteraction: Interaction = {
          ...interactionData,
          id: generateId('int'),
          createdBy: interactionData.createdBy || appStore.currentUser?.id || 'system',
          createdAt: now,
        };

        set((state) => ({
          interactions: [newInteraction, ...state.interactions],
        }));

        // Add audit event
        appStore.addAuditEvent({
          id: generateId('audit'),
          entityType: 'interaction',
          entityId: newInteraction.id,
          action: 'created',
          actorId: appStore.currentUser?.id || 'system',
          timestamp: now,
          metadata: {
            type: newInteraction.type,
            providerId: newInteraction.providerId,
            caseId: newInteraction.caseId,
          },
          description: `${newInteraction.type} interaction logged`,
        });

        // If linked to a case, add audit event for the case too
        if (newInteraction.caseId) {
          appStore.addAuditEvent({
            id: generateId('audit'),
            entityType: 'case',
            entityId: newInteraction.caseId,
            action: 'interaction_linked',
            actorId: appStore.currentUser?.id || 'system',
            timestamp: now,
            metadata: { interactionId: newInteraction.id, type: newInteraction.type },
            description: `${newInteraction.type} interaction linked to case`,
          });
        }

        return newInteraction;
      },

      updateInteraction: (id, updates) => {
        set((state) => ({
          interactions: state.interactions.map((i) =>
            i.id === id ? { ...i, ...updates } : i
          ),
        }));
      },

      deleteInteraction: (id) => {
        set((state) => ({
          interactions: state.interactions.filter((i) => i.id !== id),
        }));
      },

      // Interaction getters
      getInteraction: (id) => get().interactions.find((i) => i.id === id),

      getInteractionsByProvider: (providerId) =>
        get()
          .interactions.filter((i) => i.providerId === providerId)
          .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()),

      getInteractionsByCase: (caseId) =>
        get()
          .interactions.filter((i) => i.caseId === caseId)
          .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()),

      getRecentInteractions: (limit = 50) =>
        get()
          .interactions.slice()
          .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
          .slice(0, limit),

      getFilteredInteractions: (filters) => {
        let result = get().interactions;

        // Search filter
        if (filters.search) {
          const search = filters.search.toLowerCase();
          result = result.filter(
            (i) =>
              i.summary.toLowerCase().includes(search) ||
              i.notes.toLowerCase().includes(search) ||
              i.participants.some((p) => p.toLowerCase().includes(search))
          );
        }

        // Provider filter
        if (filters.providerId) {
          result = result.filter((i) => i.providerId === filters.providerId);
        }

        // Case filter
        if (filters.caseId) {
          result = result.filter((i) => i.caseId === filters.caseId);
        }

        // Type filter
        if (filters.type && filters.type.length > 0) {
          result = result.filter((i) => filters.type!.includes(i.type));
        }

        // Direction filter
        if (filters.direction && filters.direction.length > 0) {
          result = result.filter((i) => filters.direction!.includes(i.direction));
        }

        // Sentiment filter
        if (filters.sentiment && filters.sentiment.length > 0) {
          result = result.filter((i) => filters.sentiment!.includes(i.sentiment));
        }

        // Date range filter
        if (filters.dateRange?.start) {
          result = result.filter(
            (i) => new Date(i.occurredAt) >= new Date(filters.dateRange!.start!)
          );
        }
        if (filters.dateRange?.end) {
          result = result.filter(
            (i) => new Date(i.occurredAt) <= new Date(filters.dateRange!.end!)
          );
        }

        // Sort by date descending
        return result.sort(
          (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
        );
      },

      // Link operations
      linkToCase: (interactionId, caseId) => {
        const now = new Date().toISOString();
        set((state) => ({
          interactions: state.interactions.map((i) =>
            i.id === interactionId ? { ...i, caseId } : i
          ),
        }));

        // Add audit event
        const appStore = useAppStore.getState();
        appStore.addAuditEvent({
          id: generateId('audit'),
          entityType: 'case',
          entityId: caseId,
          action: 'interaction_linked',
          actorId: appStore.currentUser?.id || 'system',
          timestamp: now,
          metadata: { interactionId },
          description: 'Interaction linked to case',
        });
      },

      unlinkFromCase: (interactionId) => {
        set((state) => ({
          interactions: state.interactions.map((i) =>
            i.id === interactionId ? { ...i, caseId: null } : i
          ),
        }));
      },
    }),
    {
      name: STORAGE_KEYS.INTERACTIONS,
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
