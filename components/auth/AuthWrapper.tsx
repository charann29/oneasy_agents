'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

interface AuthWrapperProps {
    children: React.ReactNode
    requireAuth?: boolean
    redirectTo?: string
}

export default function AuthWrapper({
    children,
    requireAuth = true,
    redirectTo = '/'
}: AuthWrapperProps) {
    const [loading, setLoading] = useState(true)
    const [authenticated, setAuthenticated] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession()

                if (error) {
                    console.error('Auth check error:', error)
                    setAuthenticated(false)
                } else {
                    setAuthenticated(!!session)
                }
            } catch (err) {
                console.error('Session check failed:', err)
                setAuthenticated(false)
            } finally {
                setLoading(false)
            }
        }

        checkAuth()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setAuthenticated(!!session)

            if (event === 'SIGNED_OUT') {
                router.push('/')
            } else if (event === 'SIGNED_IN' && requireAuth) {
                setLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [requireAuth, router])

    // Redirect if auth requirement not met
    useEffect(() => {
        if (!loading && requireAuth && !authenticated) {
            router.push(redirectTo)
        }
    }, [loading, authenticated, requireAuth, redirectTo, router])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    <p className="text-slate-600 font-medium">Verifying authentication...</p>
                </div>
            </div>
        )
    }

    if (requireAuth && !authenticated) {
        return null // Will redirect via useEffect
    }

    return <>{children}</>
}
