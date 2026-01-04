'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles, LogIn, User, Loader2 } from 'lucide-react'
import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { signInWithGoogle, onAuthStateChange } from '@/lib/auth-helpers'
import { useRouter, useSearchParams } from 'next/navigation'

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-black animate-spin" />
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}

function HomeContent() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [loggingIn, setLoggingIn] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    let mounted = true

    const checkSession = async () => {
      try {
        // Check for OAuth callback indicators
        const hasAuthHash = window.location.hash.includes('access_token')
        const hasAuthCode = searchParams.get('code') !== null
        const isOAuthCallback = hasAuthHash || hasAuthCode

        if (isOAuthCallback) {
          console.log('OAuth callback detected (hash or code), waiting for session processing...')
          // Wait longer for PKCE code exchange
          await new Promise(resolve => setTimeout(resolve, hasAuthCode ? 1500 : 500))
        }

        const client = createClient();
        const { data: { session }, error } = await client.auth.getSession()

        if (error) throw error

        if (!mounted) return

        console.log('Session check result:', session?.user?.email || 'No session')
        setUser(session?.user ?? null)

        // If user is authenticated, redirect to questionnaire
        if (session?.user) {
          console.log('User authenticated, waiting for interaction')
        } else if (isOAuthCallback) {
          // Retry once more if OAuth callback detected but no session yet
          console.log('OAuth callback but no session, retrying in 1.5s...')
          setTimeout(async () => {
            const retryClient = createClient();
            const { data: { session: retrySession } } = await retryClient.auth.getSession();
            if (retrySession?.user && mounted) {
              const redirect = searchParams.get('redirect') || '/chat'
              console.log('Retry successful, redirecting to:', redirect)
              router.push(redirect)
            } else {
              console.error('Retry failed, no session found after OAuth callback')
              setLoading(false)
            }
          }, 1500)
        }
      } catch (error) {
        console.error('Session check error:', error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes
    const authClient = createClient();
    const { data: { subscription } } = authClient.auth.onAuthStateChange(async (event: any, session: any) => {
      console.log('Auth state change:', event, session?.user?.email || 'No user')
      if (!mounted) return

      setUser(session?.user ?? null)

      if (event === 'SIGNED_IN' && session?.user) {
        console.log('SIGNED_IN event, user authenticated')
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [router, searchParams])

  const handleLogin = async () => {
    try {
      setLoggingIn(true)
      const { error } = await signInWithGoogle()

      if (error) throw error
    } catch (error: any) {
      console.error('Login error:', error)
      alert(`Login failed: ${error.message}`)
      setLoggingIn(false)
    }
  }

  const handleStart = () => {
    if (user) {
      router.push('/chat')
    } else {
      handleLogin()
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-black animate-spin" />
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-white relative">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 p-6 flex justify-end items-center max-w-7xl mx-auto z-10">
        <div className="flex items-center gap-4">
          {loggingIn ? (
            <div className="flex items-center gap-2 px-5 py-2.5">
              <Loader2 className="w-4 h-4 animate-spin text-black" />
              <span className="text-sm text-slate-600">Signing in...</span>
            </div>
          ) : (
            <>
              <button
                onClick={handleLogin}
                className="px-4 py-2 text-gray-600 font-medium hover:text-black transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={handleLogin}
                className="px-5 py-2.5 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors shadow-sm flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Sign Up
              </button>
            </>
          )}
        </div>
      </nav>

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Build Your Business Plan in
            <span className="text-black font-extrabold">
              {" "}30 Minutes
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-12">
            AI-powered business planning with voice, text, and WhatsApp
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={handleStart}
              disabled={loggingIn}
              className="
                flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white text-lg
                bg-black
                hover:bg-gray-800
                transition-all duration-200 shadow-lg hover:shadow-xl
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {loggingIn ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Signing in...
                </>
              ) : user ? (
                <>
                  <Sparkles className="w-6 h-6" />
                  Continue to Your Plan
                  <ArrowRight className="w-6 h-6" />
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  Start Your Business Plan
                  <ArrowRight className="w-6 h-6" />
                </>
              )}
            </button>

            <Link
              href="#features"
              className="
                flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-gray-700
                bg-white hover:bg-gray-50 border-2 border-gray-200
                transition-all duration-200 shadow-sm hover:shadow-md
              "
            >
              Learn More
            </Link>
          </div>

          {/* Auth Notice */}
          <div className="mb-12 p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <p className="text-sm text-gray-800 font-medium flex items-center justify-center gap-2">
              <LogIn className="w-4 h-4" />
              Sign in with Google to access the AI Business Planner
            </p>
          </div>

          <div id="features" className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2">Voice Input</h3>
              <p className="text-gray-600">Speak in Hindi, English, Telugu</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="text-xl font-bold mb-2">AI Powered</h3>
              <p className="text-gray-600">Groq + Claude integration</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="text-5xl mb-4">💬</div>
              <h3 className="text-xl font-bold mb-2">WhatsApp Bot</h3>
              <p className="text-gray-600">Complete via WhatsApp</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
