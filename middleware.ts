import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Routes that are public and don't require auth
const PUBLIC_ROUTES = ['/login', '/signup', '/forgot-password', '/auth', '/setup']

// Routes that require specific roles (handled at page level via ProtectedRoute,
// but we protect admin-only paths at the edge here)
const ADMIN_ONLY_PREFIXES = ['/admin']
const RECEPTION_PREFIXES = ['/reception']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Run Supabase session refresh (required for auth cookie management)
  const response = await updateSession(request)

  // 2. Inject organization context header from cookie for server components
  const activeOrgId = request.cookies.get('soms-active-org')?.value
  if (activeOrgId) {
    try {
      const parsed = JSON.parse(activeOrgId)
      if (parsed?.state?.activeOrganizationId) {
        response.headers.set('x-org-id', parsed.state.activeOrganizationId)
      }
    } catch {
      // ignore malformed cookie
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

