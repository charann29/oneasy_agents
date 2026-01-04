'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import axios from 'axios'

interface SuggestionPickerProps {
  questionId: string
  partialAnswer: string
  userContext: Record<string, any>
  onSelect: (suggestion: string) => void
  debounceMs?: number
  minChars?: number
  className?: string
}

export function SuggestionPicker({
  questionId,
  partialAnswer,
  userContext,
  onSelect,
  debounceMs = 500,
  minChars = 3,
  className = ''
}: SuggestionPickerProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Don't fetch if input is too short
    if (partialAnswer.trim().length < minChars) {
      setSuggestions([])
      return
    }

    // Debounce the API call
    const timeoutId = setTimeout(() => {
      fetchSuggestions()
    }, debounceMs)

    return () => clearTimeout(timeoutId)
  }, [partialAnswer, questionId])

  const fetchSuggestions = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await axios.post('/api/ai/suggestions', {
        questionId,
        partialAnswer: partialAnswer.trim(),
        userContext
      })

      if (response.data.suggestions && Array.isArray(response.data.suggestions)) {
        setSuggestions(response.data.suggestions)
      } else {
        setSuggestions([])
      }
    } catch (err) {
      console.error('Failed to fetch suggestions:', err)
      setError('Could not load suggestions')
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  if (!loading && suggestions.length === 0 && !error) {
    return null
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Sparkles className="w-4 h-4 text-blue-500" />
        <span className="font-medium">AI Suggestions</span>
        {loading && <Loader2 className="w-3 h-3 animate-spin" />}
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {!loading && suggestions.length > 0 && (
        <div className="flex flex-col gap-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onSelect(suggestion)}
              className="
                text-left p-3 rounded-lg border border-gray-200 bg-white
                hover:border-blue-500 hover:bg-blue-50
                transition-all duration-200
                text-sm text-gray-700
              "
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
        </div>
      )}
    </div>
  )
}
