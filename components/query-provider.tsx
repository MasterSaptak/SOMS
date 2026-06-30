'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'
import { useBackgroundSync } from '@/lib/cache/cache-sync'

function BackgroundSyncWorker() {
  useBackgroundSync()
  return null
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 30, // 30 seconds — data is considered fresh for 30s
            gcTime: 1000 * 60 * 30, // 30 minutes garbage collection
            refetchOnWindowFocus: true, // Refetch when user returns to tab
            refetchOnMount: true, // Refetch when component mounts with stale data
            refetchOnReconnect: true, // Refetch after network reconnect
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <BackgroundSyncWorker />
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
