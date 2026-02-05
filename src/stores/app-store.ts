// ============================================================================
// Main App Store - Handles initialization and cross-cutting concerns
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Team, KnowledgeArticle, SLAPolicy, OutreachEvent, EmailBlast, AuditEvent } from '@/types';
import { STORAGE_KEYS, clearAllStorage } from '@/lib/storage';
import { generateSeedData } from '@/lib/seed-data';
import { CATEGORIES, LINES_OF_BUSINESS, SPECIALTIES, DISPOSITION_CODES, ROOT_CAUSES } from '@/data/categories';
import { EMAIL_TEMPLATES, RESOLUTION_TEMPLATES } from '@/data/templates';

interface AppState {
  // Initialization
  isInitialized: boolean;

  // Current user (simulated login)
  currentUser: User | null;

  // Reference data
  users: User[];
  teams: Team[];
  knowledgeArticles: KnowledgeArticle[];
  slaPolicies: SLAPolicy[];
  outreachEvents: OutreachEvent[];
  emailBlasts: EmailBlast[];
  auditEvents: AuditEvent[];

  // Actions
  initialize: () => void;
  reset: () => void;
  setCurrentUser: (user: User | null) => void;

  // User actions
  getUser: (id: string) => User | undefined;
  getUsersByTeam: (teamId: string) => User[];
  updateUser: (id: string, updates: Partial<User>) => void;

  // Team actions
  getTeam: (id: string) => Team | undefined;

  // Knowledge actions
  getArticle: (id: string) => KnowledgeArticle | undefined;
  getArticlesByCategory: (category: string) => KnowledgeArticle[];
  searchArticles: (query: string) => KnowledgeArticle[];

  // Outreach actions
  addOutreachEvent: (event: OutreachEvent) => void;
  updateOutreachEvent: (id: string, updates: Partial<OutreachEvent>) => void;
  getOutreachEvent: (id: string) => OutreachEvent | undefined;
  addEmailBlast: (blast: EmailBlast) => void;
  getEmailBlast: (id: string) => EmailBlast | undefined;

  // Audit actions
  addAuditEvent: (event: AuditEvent) => void;
  getAuditEventsForEntity: (entityType: string, entityId: string) => AuditEvent[];
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      isInitialized: false,
      currentUser: null,
      users: [],
      teams: [],
      knowledgeArticles: [],
      slaPolicies: [],
      outreachEvents: [],
      emailBlasts: [],
      auditEvents: [],

      // Initialization
      initialize: () => {
        const state = get();
        if (state.isInitialized && state.users.length > 0) {
          console.log('App already initialized, skipping...');
          return;
        }

        console.log('Generating seed data...');
        const seedData = generateSeedData();

        // Update app store
        set({
          isInitialized: true,
          users: seedData.users,
          teams: seedData.teams,
          knowledgeArticles: seedData.knowledgeArticles,
          slaPolicies: seedData.slaPolicies,
          outreachEvents: seedData.outreachEvents,
          emailBlasts: seedData.emailBlasts,
          auditEvents: seedData.auditEvents,
          currentUser: seedData.users[0],
        });

        // Dynamically import and update other stores to avoid circular dependencies
        import('./cases-store').then(({ useCasesStore }) => {
          console.log('Setting cases:', seedData.cases.length);
          useCasesStore.getState().setCases(seedData.cases);
        });

        import('./providers-store').then(({ useProvidersStore }) => {
          console.log('Setting providers:', seedData.providers.length);
          useProvidersStore.getState().setProviders(seedData.providers);
        });

        import('./interactions-store').then(({ useInteractionsStore }) => {
          console.log('Setting interactions:', seedData.interactions.length);
          useInteractionsStore.getState().setInteractions(seedData.interactions);
        });

        console.log('Initialization complete!');
      },

      reset: () => {
        console.log('Resetting all data...');
        clearAllStorage();

        // Clear the initialized flag
        set({
          isInitialized: false,
          users: [],
          teams: [],
          currentUser: null,
          knowledgeArticles: [],
          slaPolicies: [],
          outreachEvents: [],
          emailBlasts: [],
          auditEvents: [],
        });

        // Reload to reinitialize
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      },

      setCurrentUser: (user) => set({ currentUser: user }),

      // User getters and actions
      getUser: (id) => get().users.find((u) => u.id === id),
      getUsersByTeam: (teamId) => get().users.filter((u) => u.team === teamId),
      updateUser: (id, updates) =>
        set((state) => ({
          users: state.users.map((u) =>
            u.id === id ? { ...u, ...updates } : u
          ),
        })),

      // Team getters
      getTeam: (id) => get().teams.find((t) => t.id === id),

      // Knowledge getters
      getArticle: (id) => get().knowledgeArticles.find((a) => a.id === id),
      getArticlesByCategory: (category) =>
        get().knowledgeArticles.filter((a) => a.category === category),
      searchArticles: (query) => {
        const lowerQuery = query.toLowerCase();
        return get().knowledgeArticles.filter(
          (a) =>
            a.title.toLowerCase().includes(lowerQuery) ||
            a.content.toLowerCase().includes(lowerQuery) ||
            a.tags.some((t) => t.toLowerCase().includes(lowerQuery))
        );
      },

      // Outreach actions
      addOutreachEvent: (event) =>
        set((state) => ({
          outreachEvents: [event, ...state.outreachEvents],
        })),

      updateOutreachEvent: (id, updates) =>
        set((state) => ({
          outreachEvents: state.outreachEvents.map((e) =>
            e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
          ),
        })),

      getOutreachEvent: (id) => get().outreachEvents.find((e) => e.id === id),

      addEmailBlast: (blast) =>
        set((state) => ({
          emailBlasts: [blast, ...state.emailBlasts],
        })),

      getEmailBlast: (id) => get().emailBlasts.find((b) => b.id === id),

      // Audit actions
      addAuditEvent: (event) =>
        set((state) => ({
          auditEvents: [event, ...state.auditEvents],
        })),

      getAuditEventsForEntity: (entityType, entityId) =>
        get().auditEvents.filter(
          (e) => e.entityType === entityType && e.entityId === entityId
        ),
    }),
    {
      name: STORAGE_KEYS.USERS,
      partialize: (state) => ({
        isInitialized: state.isInitialized,
        currentUser: state.currentUser,
        users: state.users,
        teams: state.teams,
        knowledgeArticles: state.knowledgeArticles,
        slaPolicies: state.slaPolicies,
        outreachEvents: state.outreachEvents,
        emailBlasts: state.emailBlasts,
        auditEvents: state.auditEvents,
      }),
    }
  )
);

// Helper hooks for common data access
export const useCurrentUser = () => useAppStore((state) => state.currentUser);
export const useUsers = () => useAppStore((state) => state.users);
export const useTeams = () => useAppStore((state) => state.teams);

// Static data exports (these don't change)
export const categories = CATEGORIES;
export const linesOfBusiness = LINES_OF_BUSINESS;
export const specialties = SPECIALTIES;
export const dispositionCodes = DISPOSITION_CODES;
export const rootCauses = ROOT_CAUSES;
export const emailTemplates = EMAIL_TEMPLATES;
export const resolutionTemplates = RESOLUTION_TEMPLATES;
