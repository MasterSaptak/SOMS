export const CACHE_FLAGS = {
  // Master switch for the entire offline-first caching layer
  CACHE_ENABLED: false,

  // Module-specific switches (only evaluated if CACHE_ENABLED is true)
  CACHE_PROFILE: false,
  CACHE_TASKS: false,
  CACHE_PROJECTS: false,
  CACHE_EMPLOYEES: false,
  CACHE_ORGANIZATION: false,
  CACHE_HR_SETTINGS: false,
  CACHE_SETTINGS: false,
}

let tempDisabled = false

/**
 * Call this to immediately disable the cache in-memory if a critical 
 * storage error occurs (e.g. QuotaExceeded, VersionMismatch).
 */
export const disableCacheTemporarily = () => {
  console.warn('Cache has been temporarily disabled due to an error.')
  tempDisabled = true
}

/**
 * Helper to check if a specific cache feature is enabled.
 * Returns false immediately if the master switch is off, or if cache is temporarily disabled.
 */
export const isCacheEnabled = (feature: keyof Omit<typeof CACHE_FLAGS, 'CACHE_ENABLED'>) => {
  if (tempDisabled || !CACHE_FLAGS.CACHE_ENABLED) return false
  return CACHE_FLAGS[feature]
}
