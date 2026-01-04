'use client'

import { useState, useEffect } from 'react'
import { Question, QuestionType } from '@/lib/schemas/questions'
import { VoiceInput } from './VoiceInput'
import { FileUpload, UploadedFile } from './FileUpload'
import { SuggestionPicker } from './SuggestionPicker'
import { AlertCircle } from 'lucide-react'

interface QuestionCardProps {
  question: Question
  value: any
  onChange: (value: any) => void
  userContext: Record<string, any>
  onValidation?: (isValid: boolean, errors: string[]) => void
  className?: string
}

export function QuestionCard({
  question,
  value,
  onChange,
  userContext,
  onValidation,
  className = ''
}: QuestionCardProps) {
  const [inputValue, setInputValue] = useState(value || '')
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    setInputValue(value || '')
  }, [value])

  const handleChange = (newValue: any) => {
    setInputValue(newValue)
    onChange(newValue)

    // Basic validation for required fields
    if (question.required && (!newValue || (typeof newValue === 'string' && newValue.trim() === ''))) {
      setValidationErrors(['This field is required'])
      onValidation?.(false, ['This field is required'])
    } else {
      setValidationErrors([])
      onValidation?.(true, [])
    }
  }

  const handleVoiceTranscription = (text: string) => {
    const newValue = inputValue ? `${inputValue} ${text}` : text
    handleChange(newValue)
  }

  const handleSuggestionSelect = (suggestion: string) => {
    handleChange(suggestion)
    setShowSuggestions(false)
  }

  const handleFileUpload = (files: UploadedFile[]) => {
    onChange(files)
  }

  const renderInput = () => {
    switch (question.type) {
      case 'text':
        return (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder={question.placeholder}
            className="
              w-full px-4 py-3 rounded-lg border border-gray-300
              focus:border-blue-500 focus:ring-2 focus:ring-blue-200
              transition-all duration-200 outline-none
            "
            required={question.required}
          />
        )

      case 'textarea':
        return (
          <textarea
            value={inputValue}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder={question.placeholder}
            rows={4}
            className="
              w-full px-4 py-3 rounded-lg border border-gray-300
              focus:border-blue-500 focus:ring-2 focus:ring-blue-200
              transition-all duration-200 outline-none resize-none
            "
            required={question.required}
          />
        )

      case 'number':
        return (
          <input
            type="number"
            value={inputValue}
            onChange={(e) => handleChange(parseFloat(e.target.value) || 0)}
            placeholder={question.placeholder}
            className="
              w-full px-4 py-3 rounded-lg border border-gray-300
              focus:border-blue-500 focus:ring-2 focus:ring-blue-200
              transition-all duration-200 outline-none
            "
            required={question.required}
          />
        )

      case QuestionType.CHOICE:
        return (
          <div className="flex flex-col gap-2">
            {question.options?.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleChange(option.value)}
                className={`
                  flex flex-col items-start p-4 rounded-lg border-2
                  transition-all duration-200 text-left
                  ${inputValue === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                  }
                `}
              >
                <span className="font-medium text-gray-900">{option.label}</span>
                {option.description && (
                  <span className="text-sm text-gray-600 mt-1">{option.description}</span>
                )}
              </button>
            ))}
          </div>
        )

      case QuestionType.MULTI_SELECT:
        return (
          <div className="flex flex-col gap-2">
            {question.options?.map((option) => {
              const selected = Array.isArray(inputValue) && inputValue.includes(option.value)

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    const currentValues = Array.isArray(inputValue) ? inputValue : []
                    const newValues = selected
                      ? currentValues.filter(v => v !== option.value)
                      : [...currentValues, option.value]
                    handleChange(newValues)
                  }}
                  className={`
                    flex items-start gap-3 p-4 rounded-lg border-2
                    transition-all duration-200 text-left
                    ${selected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-blue-300'
                    }
                  `}
                >
                  <div className={`
                    w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5
                    ${selected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}
                  `}>
                    {selected && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>

                  <div className="flex-1">
                    <span className="font-medium text-gray-900">{option.label}</span>
                    {option.description && (
                      <span className="text-sm text-gray-600 block mt-1">{option.description}</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )

      case QuestionType.LIST:
        return <FileUpload onFileUpload={handleFileUpload} />

      default:
        return null
    }
  }

  return (
    <div className={`flex flex-col gap-4 p-6 bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {/* Question Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold text-gray-900">
          {question.question}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </h2>

        {question.description && (
          <p className="text-sm text-gray-600">{question.description}</p>
        )}
      </div>

      {/* Input Field */}
      <div className="flex flex-col gap-4">
        {renderInput()}

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              {validationErrors.map((error, index) => (
                <p key={index} className="text-sm text-red-600">{error}</p>
              ))}
            </div>
          </div>
        )}

        {/* AI Suggestions */}
        {showSuggestions && (question.type === QuestionType.TEXT || question.type === QuestionType.TEXTAREA) && (
          <SuggestionPicker
            questionId={question.id}
            partialAnswer={inputValue}
            userContext={userContext}
            onSelect={handleSuggestionSelect}
          />
        )}

        {/* Voice Input */}
        {question.type !== QuestionType.LIST && (
          <VoiceInput
            onTranscription={handleVoiceTranscription}
            language="en"
          />
        )}

        {/* File Upload for supporting documents */}
        {question.type !== QuestionType.LIST && (
          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Upload supporting documents (optional)
            </p>
            <FileUpload onFileUpload={handleFileUpload} maxFiles={3} />
          </div>
        )}
      </div>
    </div>
  )
}
