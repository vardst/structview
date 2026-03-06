import { useEffect } from 'react'
import { useDocumentStore } from '@/store/document-store'
import { useUIStore } from '@/store/ui-store'

export function useKeyboard() {
  const undo = useDocumentStore(s => s.undo)
  const redo = useDocumentStore(s => s.redo)
  const deleteNode = useDocumentStore(s => s.deleteAtPath)
  const duplicateNode = useDocumentStore(s => s.duplicateAtPath)
  const selectedPath = useUIStore(s => s.selectedPath)
  const setShowKeyboardHelp = useUIStore(s => s.setShowKeyboardHelp)
  const setShowHistory = useUIStore(s => s.setShowHistory)
  const setFocusedPanel = useUIStore(s => s.setFocusedPanel)
  const toggleFormat = useDocumentStore(s => s.toggleFormat)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey
      const target = e.target as HTMLElement
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' ||
        target.getAttribute('contenteditable') === 'true' ||
        target.closest('.cm-editor')

      // Global shortcuts (always work)
      if (e.key === '?' && !mod && !isInput) {
        e.preventDefault()
        setShowKeyboardHelp(true)
        return
      }

      if (mod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
        return
      }

      if (mod && e.key === 'z' && e.shiftKey) {
        e.preventDefault()
        redo()
        return
      }

      if (mod && e.key === 'y') {
        e.preventDefault()
        redo()
        return
      }

      // Panel focus shortcuts
      if (mod && e.key === '1') {
        e.preventDefault()
        setFocusedPanel('tree')
        return
      }
      if (mod && e.key === '2') {
        e.preventDefault()
        setFocusedPanel('code')
        return
      }
      if (mod && e.key === '3') {
        e.preventDefault()
        setFocusedPanel('form')
        return
      }

      if (mod && e.key === 'h') {
        e.preventDefault()
        setShowHistory(true)
        return
      }

      if (mod && e.shiftKey && e.key === 'F') {
        e.preventDefault()
        toggleFormat()
        return
      }

      // Tree-only shortcuts (when not in an input)
      if (isInput) return

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedPath) {
          e.preventDefault()
          deleteNode(selectedPath)
        }
        return
      }

      if (mod && e.key === 'd') {
        if (selectedPath) {
          e.preventDefault()
          duplicateNode(selectedPath)
        }
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, deleteNode, duplicateNode, selectedPath, setShowKeyboardHelp, setShowHistory, setFocusedPanel, toggleFormat])
}
