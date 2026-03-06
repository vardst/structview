import { useRef, useCallback } from 'react'
import { useDocumentStore } from '@/store/document-store'
import { useUIStore } from '@/store/ui-store'
import { useCodeMirror } from '@/hooks/use-codemirror'
import { CODE_DEBOUNCE_MS } from '@/lib/constants'

export function CodePanel() {
  const containerRef = useRef<HTMLDivElement>(null)
  const content = useDocumentStore(s => s.content)
  const format = useDocumentStore(s => s.format)
  const setContent = useDocumentStore(s => s.setContent)
  const setFocusedPanel = useUIStore(s => s.setFocusedPanel)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = useCallback((value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setContent(value)
    }, CODE_DEBOUNCE_MS)
  }, [setContent])

  useCodeMirror({
    container: containerRef.current,
    content,
    format,
    onChange: handleChange,
  })

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-hidden"
      onClick={() => setFocusedPanel('code')}
    />
  )
}
