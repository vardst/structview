import { useState, useCallback, type DragEvent } from 'react'
import { detectFormat } from '@/core/parser'
import { useDocumentStore } from '@/store/document-store'

export function useDropZone() {
  const [isDragging, setIsDragging] = useState(false)
  const loadDocument = useDocumentStore(s => s.loadDocument)

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    const file = files.find(f =>
      f.name.endsWith('.json') ||
      f.name.endsWith('.yaml') ||
      f.name.endsWith('.yml')
    )

    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        const text = reader.result as string
        const format = file.name.endsWith('.json') ? 'json' as const :
          detectFormat(text)
        loadDocument(text, format)
      }
      reader.readAsText(file)
    }
  }, [loadDocument])

  return {
    isDragging,
    dropHandlers: {
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  }
}
