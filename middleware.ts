import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function middleware(req: NextRequest) {
    // Validate environment variables at runtime
    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('[Middleware] Missing Supabase environment variables')
        return NextResponse.next()
    }

    let response = NextResponse.next({
        request: {
            headers: req.headers,
        },
    })

    // Create Supabase client for middleware
    const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                get(name: string) {
                    return req.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    req.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: req.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    req.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: req.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    const {
        data: { session },
    } = await supabase.auth.getSession()

    // Protected routes that require authentication
    const protectedRoutes = ['/questionnaire-chat', '/complete']
    const isProtectedRoute = protectedRoutes.some(route =>
        req.nextUrl.pathname.startsWith(route)
    )

    // If accessing protected route without session, redirect to home
    if (isProtectedRoute && !session) {
        const redirectUrl = req.nextUrl.clone()
        redirectUrl.pathname = '/'
        redirectUrl.searchParams.set('redirect', req.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
    }

    // Let client-side handle OAuth callback and redirect
    // Don't auto-redirect from home to prevent loop with OAuth callback

    return response
}

export const config = {
    matcher: ['/', '/questionnaire-chat/:path*', '/complete/:path*']
}
