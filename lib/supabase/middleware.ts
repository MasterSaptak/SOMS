import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Missing Supabase environment variables. Bypassing middleware auth check.')
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isPublicRoute = request.nextUrl.pathname.startsWith('/login') || 
                        request.nextUrl.pathname.startsWith('/signup')

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If user is logged in, we should check their role to route them properly
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'employee'
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
    const isEmployeeRoute = request.nextUrl.pathname.startsWith('/employee')

    if (isPublicRoute) {
      // Redirect away from login if already logged in
      const url = request.nextUrl.clone()
      url.pathname = role === 'admin' ? '/admin' : '/employee'
      return NextResponse.redirect(url)
    }

    if (role === 'employee' && isAdminRoute) {
      // Employees cannot access admin routes
      const url = request.nextUrl.clone()
      url.pathname = '/employee'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
