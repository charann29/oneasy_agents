'use client'

import { useState, useRef, DragEvent } from 'react'
import { Upload, File, X, Loader2 } from 'lucide-react'
import axios from 'axios'

interface FileUploadProps {
  onFileUpload: (files: UploadedFile[]) => void
  maxFiles?: number
  maxSizeMB?: number
  acceptedTypes?: string[]
  className?: string
}

export interface UploadedFile {
  name: string
  size: number
  type: string
  url: string
}

export function FileUpload({
  onFileUpload,
  maxFiles = 5,
  maxSizeMB = 10,
  acceptedTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.png', '.jpg', '.jpeg'],
  className = ''
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState('')

  const inputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): boolean => {
    const maxBytes = maxSizeMB * 1024 * 1024

    if (file.size > maxBytes) {
      setError(`File ${file.name} is too large. Maximum size is ${maxSizeMB}MB.`)
      return false
    }

    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!acceptedTypes.includes(extension)) {
      setError(`File type ${extension} is not accepted. Allowed: ${acceptedTypes.join(', ')}`)
      return false
    }

    return true
  }

  const handleFiles = async (fileList: FileList) => {
    setError('')

    const newFiles = Array.from(fileList)

    if (files.length + newFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`)
      return
    }

    const validFiles = newFiles.filter(validateFile)

    if (validFiles.length === 0) return

    setUploading(true)

    try {
      // Upload to your backend
      const uploadPromises = validFiles.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)

        // This would be your actual upload endpoint
        // For now, create a local URL
        const url = URL.createObjectURL(file)

        return {
          name: file.name,
          size: file.size,
          type: file.type,
          url
        }
      })

      const uploadedFiles = await Promise.all(uploadPromises)
      const allFiles = [...files, ...uploadedFiles]

      setFiles(allFiles)
      onFileUpload(allFiles)
    } catch (err) {
      setError('Upload failed. Please try again.')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
    onFileUpload(newFiles)
  }

  const handleDrag = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6
          transition-all duration-200
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}
          ${uploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:border-blue-400'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-2 text-center">
          {uploading ? (
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          ) : (
            <Upload className="w-8 h-8 text-gray-400" />
          )}

          <div>
            <p className="text-sm font-medium text-gray-700">
              {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {acceptedTypes.join(', ')} (max {maxSizeMB}MB each)
            </p>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {files.length > 0 && (
        <div className="flex flex-col gap-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <File className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile(index)
                }}
                className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
