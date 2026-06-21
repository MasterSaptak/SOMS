/**
 * Centralized Configuration Module
 * 
 * Acts as the single source of truth for all environment variables, feature flags,
 * global application limits, timeouts, and static configuration constants.
 */

const getEnv = (key: string, defaultValue: string = ''): string => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue
  }
  return defaultValue
}

export const config = {
  // App
  app: {
    env: getEnv('NODE_ENV', 'development'),
    isDev: getEnv('NODE_ENV', 'development') === 'development',
    isProd: getEnv('NODE_ENV') === 'production',
    isTest: getEnv('NODE_ENV') === 'test',
    baseUrl: getEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
  },

  // Supabase
  supabase: {
    url: getEnv('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    // These should only be accessed server-side
    serviceRoleKey: getEnv('SUPABASE_SERVICE_ROLE_KEY'),
  },

  // Storage
  storage: {
    documents: {
      bucketName: 'documents',
      maxSizeBytes: 10 * 1024 * 1024, // 10MB
      allowedMimeTypes: [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]
    },
    avatars: {
      bucketName: 'avatars',
      maxSizeBytes: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
    }
  },

  // Security & Timeouts
  security: {
    cronSecret: getEnv('CRON_SECRET', 'dev-secret-key'),
    sessionTimeoutMs: 1000 * 60 * 60 * 24 * 7, // 7 days
    apiTimeoutMs: 10000, // 10 seconds
  },

  // Feature Flags (Static fallbacks or global toggles)
  features: {
    enableAiCopilot: getEnv('NEXT_PUBLIC_ENABLE_AI_COPILOT', 'true') === 'true',
    enableAuditLogs: true,
    enableRealtimeFeeds: true
  }
} as const
