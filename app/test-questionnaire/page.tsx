'use client'

import { useState, useEffect } from 'react'

export default function TestQuestionnairePage() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return null
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Test Questionnaire Page
                    </h1>
                    <p className="text-gray-600 mb-6">
                        This is a minimal test page to verify the app is working.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-blue-800">
                            ✅ If you can see this, the basic page structure is working!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
