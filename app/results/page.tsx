'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { saveAs } from 'file-saver';
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
  const [loadingMessage, setLoadingMessage] = useState('Initializing agents...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!generating) return;
    setLoadingMessage('Initializing Multi-Agent System...');

    const messages = [
      { time: 2000, msg: 'Phase 1: Market Analyst Agents analyzing trends & competition...' },
      { time: 15000, msg: 'Phase 2: Customer Profiler creating personas...' },
      { time: 30000, msg: 'Phase 3: CFO Agent building Financial Models (Cash Flow, P&L)...' },
      { time: 50000, msg: 'Phase 4: Strategist crafting Pitch Deck & Business Plan...' },
      { time: 70000, msg: 'Phase 5: Finalizing documents and formatting output...' },
      { time: 85000, msg: 'Almost there! Polishing final documents...' }
    ];

    const timeouts = messages.map(m => setTimeout(() => setLoadingMessage(m.msg), m.time));
    return () => timeouts.forEach(clearTimeout);
  }, [generating]);

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
      let additionalNotes = null;

      // 1. Try Supabase first (most reliable)
      if (sessionId && sessionId !== 'new') {
        try {
          const { data, error: dbError } = await (supabase
            .from('questionnaire_sessions') as any)
            .select('answers, additional_notes')
            .eq('id', sessionId)
            .maybeSingle(); // Use maybeSingle to avoid 406 error when no rows found

          if (dbError) {
            console.warn('Supabase query error:', dbError.message);
            // Continue to fallback - don't throw
          } else if (data?.answers) {
            answers = data.answers;
            additionalNotes = data.additional_notes || null;
            console.log('✅ Loaded session data from Supabase');
          }
        } catch (supabaseError) {
          console.warn('Supabase fetch failed, will try localStorage:', supabaseError);
          // Continue to localStorage fallback
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

      // 3. Demo mode - use sample data for testing
      if (!answers && (sessionId === 'demo' || sessionId === 'test-browser-flow')) {
        answers = {
          company_name: 'Demo Startup Inc',
          tagline: 'Innovating for Tomorrow',
          industry: 'Technology / SaaS',
          stage: 'Seed Stage',
          founding_date: '2024',
          location: 'San Francisco, CA',
          team_size: '5-10',
          problem_statement: 'Small businesses struggle with complex document generation requiring expensive consultants.',
          solution: 'AI-powered platform that generates professional business documents in minutes.',
          target_market: 'SMBs and startups needing business planning documents',
          business_model: 'SaaS subscription with tiered pricing',
          revenue_streams: 'Monthly subscriptions, enterprise licenses, API access',
          funding_seeking: '$500,000',
          use_of_funds: 'Product development, marketing, team expansion',
          competitors: 'Traditional consulting firms, basic templates',
          competitive_advantage: 'AI-powered, 10x faster, 90% cost reduction',
          traction: '100 beta users, $10k MRR',
          vision: 'Become the go-to platform for AI-powered business documentation'
        };
        console.log('📋 Using demo data for document generation');
      }

      if (!answers) {
        throw new Error('No questionnaire data found. Please complete the questionnaire first.');
      }

      // Call generation API with answers and additional notes
      const response = await fetch('/api/generate-documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          answers: answers,
          additionalNotes: additionalNotes,
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
    if (!doc) {
      alert('Document not found. Please generate documents first.');
      return;
    }

    // Create proper filename
    const docName = documentTabs.find(t => t.id === docType)?.name || docType;
    const safeDocName = docName.replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${safeDocName}_${timestamp}.md`;

    console.log(`Downloading markdown: ${filename}`);

    const blob = new Blob([doc.content], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, filename); // file-saver handles naming correctly
  };

  const downloadAllAsZip = async () => {
    if (documents.length === 0) {
      alert('No documents to download. Please generate documents first.');
      return;
    }

    const btn = document.getElementById('btn-download-zip');
    const originalText = btn?.innerText || '📦 Download All (ZIP)';

    try {
      // Show loading state
      if (btn) {
        btn.innerText = '⏳ Creating ZIP...';
        btn.setAttribute('disabled', 'true');
      }

      // Prepare documents for ZIP
      const docsForZip = documents.map(doc => {
        const tabInfo = documentTabs.find(t => t.id === doc.type);
        return {
          name: tabInfo?.name || doc.type,
          content: doc.content
        };
      });

      console.log(`Creating ZIP with ${docsForZip.length} documents...`);

      // Call ZIP API
      const response = await fetch('/api/download-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documents: docsForZip,
          title: 'Business_Plan_Package',
          formats: ['pdf', 'docx', 'md']
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Server error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      // Get the blob
      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('Downloaded ZIP is empty');
      }

      console.log(`✓ ZIP received: ${blob.size} bytes`);

      // Create filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `Business_Plan_Package_${timestamp}.zip`;

      // Download using file-saver
      saveAs(blob, filename);

      // Success feedback
      if (btn) {
        btn.innerText = '✅ Downloaded!';
        setTimeout(() => {
          btn.innerText = originalText;
          btn.removeAttribute('disabled');
        }, 3000);
      }

    } catch (err: any) {
      console.error('ZIP download error:', err);
      alert(`ZIP download failed: ${err.message}\n\nPlease try downloading individual documents.`);

      // Reset button
      if (btn) {
        btn.innerText = originalText;
        btn.removeAttribute('disabled');
      }
    }
  };

  const downloadFile = async (format: 'pdf' | 'docx' | 'pptx' | 'csv') => {
    const doc = documents.find(d => d.type === selectedDoc);
    if (!doc) {
      alert('Document not found. Please generate documents first.');
      return;
    }

    const btnId = `btn-download-${format}`;
    const btn = document.getElementById(btnId);
    const originalText = btn?.innerText || format.toUpperCase();

    try {
      const docName = documentTabs.find(t => t.id === selectedDoc)?.name || 'Document';
      const safeDocName = docName.replace(/[^a-zA-Z0-9]/g, '_');
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${safeDocName}_${timestamp}.${format}`;

      // Loading feedback
      if (btn) {
        btn.innerText = '⏳ Generating...';
        btn.setAttribute('disabled', 'true');
      }

      console.log(`Downloading ${format}: ${filename}`);

      // Fetch the file from API (expects JSON)
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: format,
          content: doc.content,
          title: docName
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Server error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      // Get the blob
      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('Downloaded file is empty');
      }

      console.log(`✓ Received ${blob.size} bytes`);

      // Use file-saver for guaranteed correct filename
      saveAs(blob, filename);

      // Success feedback
      if (btn) {
        btn.innerText = '✅ Downloaded!';
        setTimeout(() => {
          btn.innerText = originalText;
          btn.removeAttribute('disabled');
        }, 2000);
      }

      // Show notification
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-size: 14px;
        max-width: 350px;
      `;
      notification.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 8px;">📥 Download Started</div>
        <div style="font-size: 12px; opacity: 0.9;">
          Check your Downloads folder<br>
          File should be named with proper title, not UUID
        </div>
      `;
      document.body.appendChild(notification);

      setTimeout(() => {
        notification.style.transition = 'opacity 0.3s';
        notification.style.opacity = '0';
        setTimeout(() => document.body.removeChild(notification), 300);
      }, 4000);

    } catch (e) {
      console.error('Download error:', e);
      const errorMsg = e instanceof Error ? e.message : 'Download failed';
      alert(`Download failed: ${errorMsg}\n\nPlease check:\n1. Server is running\n2. Documents are generated\n3. Browser console for details`);

      // Reset button
      if (btn) {
        btn.innerText = originalText;
        btn.removeAttribute('disabled');
      }
    }
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
                  {generating ? `⏳ ${loadingMessage}` : '🔄 Regenerate with AI'}
                </button>
                <button
                  id="btn-download-zip"
                  onClick={downloadAllAsZip}
                  disabled={generating || documents.length === 0}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
                  {loadingMessage}
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

            {/* No document selected warning */}
            {!selectedDocument && (
              <div className="p-12 text-center bg-yellow-50">
                <div className="text-4xl mb-4">📄</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Document Not Available
                </h3>
                <p className="text-gray-600 mb-4">
                  This document hasn't been generated yet. Click "Generate Documents" or "Regenerate with AI" above.
                </p>
              </div>
            )}

            {/* Document viewer */}
            {selectedDocument && (
              <div>
                {/* Document actions */}
                <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">{selectedDocument.wordCount.toLocaleString()}</span> words
                    {' · '}
                    <span className="font-semibold">{selectedDocument.charCount.toLocaleString()}</span> characters
                    <span className="ml-4 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Ready to download</span>
                  </div>
                  <div className="flex gap-2">
                    {/* PDF Button */}
                    <button
                      id="btn-download-pdf"
                      onClick={() => downloadFile('pdf')}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Download as PDF"
                    >
                      <span>📄</span> PDF
                    </button>

                    {/* DOCX Button (Default for text docs) */}
                    {(selectedDoc !== 'financial_model' && selectedDoc !== 'pitch_deck') && (
                      <button
                        id="btn-download-docx"
                        onClick={() => downloadFile('docx')}
                        className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Download as Word Doc"
                      >
                        <span>📝</span> Word
                      </button>
                    )}

                    {/* PPTX Button (Pitch Deck only) */}
                    {selectedDoc === 'pitch_deck' && (
                      <button
                        id="btn-download-pptx"
                        onClick={() => downloadFile('pptx')}
                        className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 text-sm font-medium flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Download as PowerPoint"
                      >
                        <span>🟧</span> PPT
                      </button>
                    )}

                    {/* CSV Button (Financial Model only) */}
                    {selectedDoc === 'financial_model' && (
                      <button
                        id="btn-download-csv"
                        onClick={() => downloadFile('csv')}
                        className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm font-medium flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Download as Spreadsheets (CSV)"
                      >
                        <span>📊</span> Sheets
                      </button>
                    )}

                    <button
                      onClick={() => downloadMarkdown(selectedDoc)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium flex items-center gap-2 transition"
                      title="Download Raw Markdown"
                    >
                      <span>⬇️</span> MD
                    </button>
                  </div>
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

