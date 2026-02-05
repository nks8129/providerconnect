// ============================================================================
// UI Store - Manages UI state (modals, panels, search, etc.)
// ============================================================================

import { create } from 'zustand';
import type { AIAssistContext } from '@/types';

type ModalType =
  | 'create_case'
  | 'create_interaction'
  | 'create_outreach'
  | 'resolve_case'
  | 'assign_case'
  | 'provider_search'
  | 'command_palette'
  | 'apply_template'
  | 'edit_user'
  | 'edit_sla_policy'
  | 'event_detail'
  | 'create_event'
  | 'email_blast_detail'
  | 'tag_provider'
  | null;

interface UIState {
  // Assist Panel
  assistPanelOpen: boolean;
  assistPanelContext: AIAssistContext | null;
  assistPanelLoading: boolean;

  // Modals
  activeModal: ModalType;
  modalData: Record<string, unknown> | null;

  // Global Search
  globalSearchOpen: boolean;
  globalSearchQuery: string;

  // Navigation
  sidebarCollapsed: boolean;

  // Notifications
  notifications: Notification[];

  // Toast messages
  toasts: Toast[];

  // Actions - Assist Panel
  toggleAssistPanel: () => void;
  setAssistPanelOpen: (open: boolean) => void;
  setAssistContext: (context: AIAssistContext | null) => void;
  setAssistLoading: (loading: boolean) => void;

  // Actions - Modals
  openModal: (type: ModalType, data?: Record<string, unknown>) => void;
  closeModal: () => void;

  // Actions - Global Search
  toggleGlobalSearch: () => void;
  setGlobalSearchQuery: (query: string) => void;

  // Actions - Navigation
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Actions - Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;

  // Actions - Toasts
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionLabel?: string;
  actionUrl?: string;
}

interface Toast {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message?: string;
  duration?: number;
}

let toastId = 0;
let notificationId = 0;

export const useUIStore = create<UIState>((set, get) => ({
  // Initial state
  assistPanelOpen: true,
  assistPanelContext: null,
  assistPanelLoading: false,

  activeModal: null,
  modalData: null,

  globalSearchOpen: false,
  globalSearchQuery: '',

  sidebarCollapsed: false,

  notifications: [],
  toasts: [],

  // Assist Panel Actions
  toggleAssistPanel: () =>
    set((state) => ({ assistPanelOpen: !state.assistPanelOpen })),

  setAssistPanelOpen: (open) => set({ assistPanelOpen: open }),

  setAssistContext: (context) => set({ assistPanelContext: context }),

  setAssistLoading: (loading) => set({ assistPanelLoading: loading }),

  // Modal Actions
  openModal: (type, data) =>
    set({ activeModal: type, modalData: data ?? null }),

  closeModal: () => set({ activeModal: null, modalData: null }),

  // Global Search Actions
  toggleGlobalSearch: () =>
    set((state) => ({
      globalSearchOpen: !state.globalSearchOpen,
      globalSearchQuery: state.globalSearchOpen ? '' : state.globalSearchQuery,
    })),

  setGlobalSearchQuery: (query) => set({ globalSearchQuery: query }),

  // Navigation Actions
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  // Notification Actions
  addNotification: (notification) => {
    const id = `notif_${++notificationId}`;
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date().toISOString(),
      read: false,
    };
    set((state) => ({
      notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep max 50
    }));
  },

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearNotifications: () => set({ notifications: [] }),

  // Toast Actions
  addToast: (toast) => {
    const id = `toast_${++toastId}`;
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000,
    };
    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    // Auto-remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, newToast.duration);
    }
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

// Convenience hooks
export const useAssistPanel = () =>
  useUIStore((state) => ({
    isOpen: state.assistPanelOpen,
    context: state.assistPanelContext,
    loading: state.assistPanelLoading,
    toggle: state.toggleAssistPanel,
    setOpen: state.setAssistPanelOpen,
    setContext: state.setAssistContext,
    setLoading: state.setAssistLoading,
  }));

export const useModal = () =>
  useUIStore((state) => ({
    activeModal: state.activeModal,
    modalData: state.modalData,
    open: state.openModal,
    close: state.closeModal,
  }));

export const useGlobalSearch = () =>
  useUIStore((state) => ({
    isOpen: state.globalSearchOpen,
    query: state.globalSearchQuery,
    toggle: state.toggleGlobalSearch,
    setQuery: state.setGlobalSearchQuery,
  }));

export const useToasts = () =>
  useUIStore((state) => ({
    toasts: state.toasts,
    add: state.addToast,
    remove: state.removeToast,
  }));
