'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

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
    const [user, setUser] = useState<User | null>(null)
    const router = useRouter();

    useEffect(() => {
        const client = createClient();

        const { data: { subscription } } = client.auth.onAuthStateChange((event: any, session: any) => {
            setUser(session?.user ?? null);
        });

        client.auth.getSession().then(({ data: { session } }) => {
            console.log('[AuthWrapper] Session check:', { hasSession: !!session, userId: session?.user?.id });
            setUser(session?.user ?? null);
            setLoading(false);
        }).catch((error) => {
            console.error('[AuthWrapper] Session fetch error:', error);
            setLoading(false);
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    // Redirect if auth requirement not met
    useEffect(() => {
        if (!loading && requireAuth && !user) {
            router.push(redirectTo)
        }
    }, [loading, user, requireAuth, redirectTo, router])

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

    if (requireAuth && !user) {
        return null // Will redirect via useEffect
    }

    return <>{children}</>
}
