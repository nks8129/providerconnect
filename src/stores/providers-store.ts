// ============================================================================
// Providers Store - Manages provider data and operations
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Provider, Address, Contact } from '@/types';
import { STORAGE_KEYS } from '@/lib/storage';
import { generateId } from '@/lib/utils';

interface ProvidersState {
  providers: Provider[];
  isHydrated: boolean;
  searchQuery: string;
  selectedProviderId: string | null;

  // Actions
  setHydrated: () => void;
  setProviders: (providers: Provider[]) => void;

  // Provider CRUD
  addProvider: (provider: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>) => Provider;
  updateProvider: (id: string, updates: Partial<Provider>) => void;
  deleteProvider: (id: string) => void;

  // Provider getters
  getProvider: (id: string) => Provider | undefined;
  getProviderByNPI: (npi: string) => Provider | undefined;
  getProviderByTaxId: (taxId: string) => Provider | undefined;
  searchProviders: (query: string) => Provider[];
  getFilteredProviders: (filters: ProviderFilters) => Provider[];

  // Address operations
  addAddress: (providerId: string, address: Omit<Address, 'id'>) => void;
  updateAddress: (providerId: string, addressId: string, updates: Partial<Address>) => void;
  deleteAddress: (providerId: string, addressId: string) => void;

  // Contact operations
  addContact: (providerId: string, contact: Omit<Contact, 'id'>) => void;
  updateContact: (providerId: string, contactId: string, updates: Partial<Contact>) => void;
  deleteContact: (providerId: string, contactId: string) => void;

  // Notes & Tags
  updateNotes: (providerId: string, notes: string) => void;
  addTag: (providerId: string, tag: string) => void;
  removeTag: (providerId: string, tag: string) => void;

  // UI state
  setSearchQuery: (query: string) => void;
  selectProvider: (id: string | null) => void;
}

interface ProviderFilters {
  search?: string;
  type?: Provider['type'][];
  state?: string[];
  specialty?: string[];
  lob?: string[];
  networkStatus?: Provider['networkStatus'][];
  credentialingStatus?: Provider['credentialingStatus'][];
}

export const useProvidersStore = create<ProvidersState>()(
  persist(
    (set, get) => ({
      providers: [],
      isHydrated: false,
      searchQuery: '',
      selectedProviderId: null,

      setHydrated: () => set({ isHydrated: true }),

      setProviders: (providers) => set({ providers }),

      // Provider CRUD
      addProvider: (providerData) => {
        const now = new Date().toISOString();
        const newProvider: Provider = {
          ...providerData,
          id: generateId('prov'),
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          providers: [newProvider, ...state.providers],
        }));

        return newProvider;
      },

      updateProvider: (id, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          providers: state.providers.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: now } : p
          ),
        }));
      },

      deleteProvider: (id) => {
        set((state) => ({
          providers: state.providers.filter((p) => p.id !== id),
          selectedProviderId: state.selectedProviderId === id ? null : state.selectedProviderId,
        }));
      },

      // Provider getters
      getProvider: (id) => get().providers.find((p) => p.id === id),

      getProviderByNPI: (npi) => get().providers.find((p) => p.npi === npi),

      getProviderByTaxId: (taxId) => get().providers.find((p) => p.taxId === taxId),

      searchProviders: (query) => {
        if (!query || query.length < 2) return [];

        const lowerQuery = query.toLowerCase().trim();
        return get().providers.filter(
          (p) =>
            p.name.toLowerCase().includes(lowerQuery) ||
            p.npi.includes(lowerQuery) ||
            p.taxId.includes(lowerQuery) ||
            p.contacts.some((c) => c.name.toLowerCase().includes(lowerQuery)) ||
            p.addresses.some((a) =>
              `${a.city} ${a.state}`.toLowerCase().includes(lowerQuery)
            )
        );
      },

      getFilteredProviders: (filters) => {
        let result = get().providers;

        // Search filter
        if (filters.search && filters.search.length >= 2) {
          const search = filters.search.toLowerCase();
          result = result.filter(
            (p) =>
              p.name.toLowerCase().includes(search) ||
              p.npi.includes(search) ||
              p.taxId.includes(search)
          );
        }

        // Type filter
        if (filters.type && filters.type.length > 0) {
          result = result.filter((p) => filters.type!.includes(p.type));
        }

        // State filter
        if (filters.state && filters.state.length > 0) {
          result = result.filter((p) =>
            p.addresses.some((a) => filters.state!.includes(a.state))
          );
        }

        // Specialty filter
        if (filters.specialty && filters.specialty.length > 0) {
          result = result.filter((p) =>
            p.specialties.some((s) => filters.specialty!.includes(s))
          );
        }

        // LOB filter
        if (filters.lob && filters.lob.length > 0) {
          result = result.filter((p) =>
            p.lobs.some((l) => filters.lob!.includes(l))
          );
        }

        // Network status filter
        if (filters.networkStatus && filters.networkStatus.length > 0) {
          result = result.filter((p) => filters.networkStatus!.includes(p.networkStatus));
        }

        // Credentialing status filter
        if (filters.credentialingStatus && filters.credentialingStatus.length > 0) {
          result = result.filter((p) =>
            filters.credentialingStatus!.includes(p.credentialingStatus)
          );
        }

        return result;
      },

      // Address operations
      addAddress: (providerId, address) => {
        const now = new Date().toISOString();
        const newAddress: Address = {
          ...address,
          id: generateId('addr'),
        };

        set((state) => ({
          providers: state.providers.map((p) =>
            p.id === providerId
              ? { ...p, addresses: [...p.addresses, newAddress], updatedAt: now }
              : p
          ),
        }));
      },

      updateAddress: (providerId, addressId, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          providers: state.providers.map((p) =>
            p.id === providerId
              ? {
                  ...p,
                  addresses: p.addresses.map((a) =>
                    a.id === addressId ? { ...a, ...updates } : a
                  ),
                  updatedAt: now,
                }
              : p
          ),
        }));
      },

      deleteAddress: (providerId, addressId) => {
        const now = new Date().toISOString();
        set((state) => ({
          providers: state.providers.map((p) =>
            p.id === providerId
              ? {
                  ...p,
                  addresses: p.addresses.filter((a) => a.id !== addressId),
                  updatedAt: now,
                }
              : p
          ),
        }));
      },

      // Contact operations
      addContact: (providerId, contact) => {
        const now = new Date().toISOString();
        const newContact: Contact = {
          ...contact,
          id: generateId('contact'),
        };

        set((state) => ({
          providers: state.providers.map((p) =>
            p.id === providerId
              ? { ...p, contacts: [...p.contacts, newContact], updatedAt: now }
              : p
          ),
        }));
      },

      updateContact: (providerId, contactId, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          providers: state.providers.map((p) =>
            p.id === providerId
              ? {
                  ...p,
                  contacts: p.contacts.map((c) =>
                    c.id === contactId ? { ...c, ...updates } : c
                  ),
                  updatedAt: now,
                }
              : p
          ),
        }));
      },

      deleteContact: (providerId, contactId) => {
        const now = new Date().toISOString();
        set((state) => ({
          providers: state.providers.map((p) =>
            p.id === providerId
              ? {
                  ...p,
                  contacts: p.contacts.filter((c) => c.id !== contactId),
                  updatedAt: now,
                }
              : p
          ),
        }));
      },

      // Notes & Tags
      updateNotes: (providerId, notes) => {
        const now = new Date().toISOString();
        set((state) => ({
          providers: state.providers.map((p) =>
            p.id === providerId ? { ...p, notes, updatedAt: now } : p
          ),
        }));
      },

      addTag: (providerId, tag) => {
        const now = new Date().toISOString();
        set((state) => ({
          providers: state.providers.map((p) =>
            p.id === providerId && !p.tags.includes(tag)
              ? { ...p, tags: [...p.tags, tag], updatedAt: now }
              : p
          ),
        }));
      },

      removeTag: (providerId, tag) => {
        const now = new Date().toISOString();
        set((state) => ({
          providers: state.providers.map((p) =>
            p.id === providerId
              ? { ...p, tags: p.tags.filter((t) => t !== tag), updatedAt: now }
              : p
          ),
        }));
      },

      // UI state
      setSearchQuery: (query) => set({ searchQuery: query }),

      selectProvider: (id) => set({ selectedProviderId: id }),
    }),
    {
      name: STORAGE_KEYS.PROVIDERS,
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
