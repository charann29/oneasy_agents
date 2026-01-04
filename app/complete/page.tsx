import Link from 'next/link';

export default function QuestionnaireCompletePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
            <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-12 text-center">
                {/* Success Icon */}
                <div className="mb-8">
                    <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>

                {/* Congratulations Message */}
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    🎉 Congratulations!
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                    You've completed the CA Business Planner questionnaire!
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-10">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                        <div className="text-3xl font-bold text-blue-600">147</div>
                        <div className="text-sm text-gray-600">Questions Answered</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                        <div className="text-3xl font-bold text-purple-600">11</div>
                        <div className="text-sm text-gray-600">Phases Completed</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                        <div className="text-3xl font-bold text-green-600">100%</div>
                        <div className="text-sm text-gray-600">Profile Complete</div>
                    </div>
                </div>

                {/* Next Steps */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">
                        What's Next?
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Generate your professional business planning documents including:
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm text-left">
                        <div className="flex items-center gap-2">
                            <span className="text-blue-500">📄</span>
                            <span>Company Profile</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-purple-500">📋</span>
                            <span>Business Plan</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-green-500">📊</span>
                            <span>Financial Model</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-red-500">🎯</span>
                            <span>Pitch Deck</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <Link
                        href={`/results?sessionId=${typeof window !== 'undefined' ? localStorage.getItem('ca_session_id') || 'new' : 'new'}`}
                        className="block w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg transform hover:scale-105"
                    >
                        ✨ Generate My Business Plan
                    </Link>

                    <Link
                        href="/questionnaire-chat"
                        className="block w-full px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all"
                    >
                        📝 Review My Answers
                    </Link>
                </div>

                {/* Footer Note */}
                <p className="mt-8 text-sm text-gray-500">
                    Your data is securely saved. You can return anytime to generate or download your documents.
                </p>
            </div>
        </div>
    );
}
