// ============================================================================
// localStorage utilities with type safety and error handling
// ============================================================================

const STORAGE_PREFIX = 'pih_';

export const STORAGE_KEYS = {
  PROVIDERS: `${STORAGE_PREFIX}providers`,
  CASES: `${STORAGE_PREFIX}cases`,
  INTERACTIONS: `${STORAGE_PREFIX}interactions`,
  AUDIT_EVENTS: `${STORAGE_PREFIX}audit_events`,
  OUTREACH_EVENTS: `${STORAGE_PREFIX}outreach_events`,
  EMAIL_BLASTS: `${STORAGE_PREFIX}email_blasts`,
  KNOWLEDGE_ARTICLES: `${STORAGE_PREFIX}knowledge_articles`,
  EMAIL_TEMPLATES: `${STORAGE_PREFIX}email_templates`,
  RESOLUTION_TEMPLATES: `${STORAGE_PREFIX}resolution_templates`,
  USERS: `${STORAGE_PREFIX}users`,
  TEAMS: `${STORAGE_PREFIX}teams`,
  CATEGORIES: `${STORAGE_PREFIX}categories`,
  SLA_POLICIES: `${STORAGE_PREFIX}sla_policies`,
  DISPOSITION_CODES: `${STORAGE_PREFIX}disposition_codes`,
  ROOT_CAUSES: `${STORAGE_PREFIX}root_causes`,
  ASSIGNMENT_RULES: `${STORAGE_PREFIX}assignment_rules`,
  SAVED_VIEWS: `${STORAGE_PREFIX}saved_views`,
  UI_STATE: `${STORAGE_PREFIX}ui_state`,
  CURRENT_USER: `${STORAGE_PREFIX}current_user`,
  INITIALIZED: `${STORAGE_PREFIX}initialized`,
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/**
 * Get an item from localStorage with type safety
 */
export function getStorageItem<T>(key: StorageKey): T | null {
  if (typeof window === 'undefined') return null;

  try {
    const item = localStorage.getItem(key);
    if (item === null) return null;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return null;
  }
}

/**
 * Set an item in localStorage with type safety
 */
export function setStorageItem<T>(key: StorageKey, value: T): boolean {
  if (typeof window === 'undefined') return false;

  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
    // Handle quota exceeded
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded. Consider clearing old data.');
    }
    return false;
  }
}

/**
 * Remove an item from localStorage
 */
export function removeStorageItem(key: StorageKey): boolean {
  if (typeof window === 'undefined') return false;

  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
    return false;
  }
}

/**
 * Clear all application data from localStorage
 */
export function clearAllStorage(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
}

/**
 * Check if the application has been initialized with seed data
 */
export function isInitialized(): boolean {
  return getStorageItem<boolean>(STORAGE_KEYS.INITIALIZED) === true;
}

/**
 * Mark the application as initialized
 */
export function markInitialized(): void {
  setStorageItem(STORAGE_KEYS.INITIALIZED, true);
}

/**
 * Mark the application as not initialized (for reset)
 */
export function markUninitialized(): void {
  setStorageItem(STORAGE_KEYS.INITIALIZED, false);
}

/**
 * Get the current storage usage
 */
export function getStorageUsage(): { used: number; total: number; percentage: number } {
  if (typeof window === 'undefined') {
    return { used: 0, total: 0, percentage: 0 };
  }

  let used = 0;
  for (const key in localStorage) {
    if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
      used += localStorage.getItem(key)?.length || 0;
    }
  }

  // localStorage typically has a 5MB limit
  const total = 5 * 1024 * 1024;
  const percentage = (used / total) * 100;

  return { used, total, percentage };
}

/**
 * Create a Zustand persist storage adapter
 */
export function createPersistStorage<T>(key: StorageKey) {
  return {
    getItem: (): T | null => getStorageItem<T>(key),
    setItem: (value: T): void => {
      setStorageItem(key, value);
    },
    removeItem: (): void => {
      removeStorageItem(key);
    },
  };
}

/**
 * Merge stored data with defaults (useful for migrations)
 */
export function mergeWithDefaults<T extends object>(
  stored: Partial<T> | null,
  defaults: T
): T {
  if (!stored) return defaults;
  return { ...defaults, ...stored };
}
