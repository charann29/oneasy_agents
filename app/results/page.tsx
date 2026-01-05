'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/lib/supabase/client';

interface GeneratedDocument {
  type: string;
  content: string;
  wordCount: number;
  charCount: number;
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');

  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<string>('company_profile');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const documentTabs = [
    { id: 'company_profile', name: 'Company Profile', icon: '🏢' },
    { id: 'business_plan', name: 'Business Plan', icon: '📋' },
    { id: 'financial_model', name: 'Financial Model', icon: '📊' },
    { id: 'pitch_deck', name: 'Pitch Deck', icon: '🎯' },
    { id: 'before_after_analysis', name: 'Analysis', icon: '📈' },
  ];

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided');
      setLoading(false);
      return;
    }

    // Try to load documents from localStorage first
    loadDocumentsFromCache();
  }, [sessionId]);

  const loadDocumentsFromCache = () => {
    try {
      const cached = localStorage.getItem(`generated_docs_${sessionId}`);
      if (cached) {
        const data = JSON.parse(cached);
        setDocuments(data.documents);
        setLoading(false);
      } else {
        // No cache, need to generate
        setLoading(false);
      }
    } catch (err) {
      console.error('Error loading cached documents:', err);
      setLoading(false);
    }
  };

  const generateDocuments = async () => {
    setGenerating(true);
    setError(null);

    try {
      let answers = null;

      // 1. Try Supabase first (most reliable)
      if (sessionId && sessionId !== 'new') {
        const { data } = await (supabase
          .from('questionnaire_sessions') as any)
          .select('answers')
          .eq('id', sessionId)
          .single();

        if (data?.answers) {
          answers = data.answers;
        }
      }

      // 2. Fallback to localStorage
      if (!answers) {
        let storedState = localStorage.getItem('questionnaire_state');
        if (!storedState) {
          storedState = localStorage.getItem('ca_backup_state');
        }
        if (storedState) {
          const state = JSON.parse(storedState);
          answers = state.answers;
        }
      }

      if (!answers) {
        throw new Error('No questionnaire data found. Please complete the questionnaire first.');
      }

      // Call generation API
      const response = await fetch('/api/generate-documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          answers: answers,
        }),
      });

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Generation failed');
      }

      // Cache the documents
      localStorage.setItem(`generated_docs_${sessionId}`, JSON.stringify(result.data));

      setDocuments(result.data.documents);
      setGenerating(false);
    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate documents');
      setGenerating(false);
    }
  };

  const downloadMarkdown = (docType: string) => {
    const doc = documents.find(d => d.type === docType);
    if (!doc) return;

    const blob = new Blob([doc.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docType}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAllAsZip = async () => {
    // This would call the export engine to create a ZIP
    alert('ZIP download coming soon! For now, download individual documents.');
  };

  const selectedDocument = documents.find(d => d.type === selectedDoc);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📚 Your Business Plan</h1>
              <p className="mt-1 text-sm text-gray-500">Professional documents generated by AI</p>
            </div>
            {documents.length > 0 && (
              <div className="flex gap-3">
                <button
                  onClick={generateDocuments}
                  disabled={generating}
                  className="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-md disabled:opacity-50"
                >
                  {generating ? '⏳ Generating...' : '🔄 Regenerate with AI'}
                </button>
                <button
                  onClick={downloadAllAsZip}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md"
                >
                  📦 Download All (ZIP)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* No documents state */}
        {documents.length === 0 && !error && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Generate Your Business Plan?
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Transform your questionnaire responses into professional business planning documents including:
              Company Profile, Business Plan, Financial Model, Pitch Deck, and Strategic Analysis.
            </p>
            <button
              onClick={generateDocuments}
              disabled={generating}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Generating Documents...
                </span>
              ) : (
                '✨ Generate Documents'
              )}
            </button>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-red-900 mb-2">Generation Error</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={generateDocuments}
              className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Documents tabs and viewer */}
        {documents.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Tabs */}
            <div className="border-b border-gray-200 bg-gray-50">
              <nav className="flex overflow-x-auto">
                {documentTabs.map((tab) => {
                  const doc = documents.find(d => d.type === tab.id);
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedDoc(tab.id)}
                      className={`
                        flex-shrink-0 px-6 py-4 text-sm font-medium border-b-2 transition-colors
                        ${selectedDoc === tab.id
                          ? 'border-blue-600 text-blue-600 bg-white'
                          : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                        }
                      `}
                    >
                      <span className="flex items-center gap-2">
                        <span>{tab.icon}</span>
                        <span>{tab.name}</span>
                        {doc && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            {Math.round(doc.wordCount / 1000)}K words
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Document viewer */}
            {selectedDocument && (
              <div>
                {/* Document actions */}
                <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">{selectedDocument.wordCount.toLocaleString()}</span> words
                    {' · '}
                    <span className="font-semibold">{selectedDocument.charCount.toLocaleString()}</span> characters
                  </div>
                  <button
                    onClick={() => downloadMarkdown(selectedDoc)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    <span>⬇️</span>
                    <span>Download Markdown</span>
                  </button>
                </div>

                {/* Document content */}
                <div className="p-8 prose prose-lg max-w-none overflow-auto" style={{ maxHeight: '70vh' }}>
                  <ReactMarkdown>{selectedDocument.content}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
