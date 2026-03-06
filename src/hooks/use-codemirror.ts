import { useEffect, useRef, useCallback } from 'react'
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection, dropCursor } from '@codemirror/view'
import { EditorState, Compartment } from '@codemirror/state'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { json } from '@codemirror/lang-json'
import { yaml } from '@codemirror/lang-yaml'
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching, foldGutter, foldKeymap } from '@codemirror/language'
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search'
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'
import { lintGutter } from '@codemirror/lint'
import type { DataFormat } from '@/lib/constants'

interface UseCodeMirrorOptions {
  container: HTMLDivElement | null
  content: string
  format: DataFormat
  onChange: (value: string) => void
  readOnly?: boolean
}

// Compartment to hot-swap language extensions
const langCompartment = new Compartment()

function getLangExtension(fmt: DataFormat) {
  return fmt === 'json' ? json() : yaml()
}

export function useCodeMirror({ container, content, format, onChange, readOnly }: UseCodeMirrorOptions) {
  const viewRef = useRef<EditorView | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const isExternalUpdate = useRef(false)

  const createExtensions = useCallback(() => [
    lineNumbers(),
    highlightActiveLine(),
    highlightActiveLineGutter(),
    drawSelection(),
    dropCursor(),
    bracketMatching(),
    closeBrackets(),
    foldGutter(),
    autocompletion(),
    highlightSelectionMatches(),
    lintGutter(),
    history(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    langCompartment.of(getLangExtension(format)),
    keymap.of([
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...searchKeymap,
      ...historyKeymap,
      ...foldKeymap,
      ...completionKeymap,
    ]),
    EditorView.updateListener.of(update => {
      if (update.docChanged && !isExternalUpdate.current) {
        onChangeRef.current(update.state.doc.toString())
      }
    }),
    ...(readOnly ? [EditorState.readOnly.of(true)] : []),
    EditorView.theme({
      '&': { height: '100%' },
      '.cm-scroller': { overflow: 'auto' },
    }),
  ], [format, readOnly])

  // Create editor
  useEffect(() => {
    if (!container) return

    const state = EditorState.create({
      doc: content,
      extensions: createExtensions(),
    })

    const view = new EditorView({
      state,
      parent: container,
    })

    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [container])

  // Update content when it changes externally
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const currentContent = view.state.doc.toString()
    if (currentContent !== content) {
      isExternalUpdate.current = true
      view.dispatch({
        changes: {
          from: 0,
          to: currentContent.length,
          insert: content,
        },
      })
      isExternalUpdate.current = false
    }
  }, [content])

  // Reconfigure language on format change
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    view.dispatch({
      effects: langCompartment.reconfigure(getLangExtension(format)),
    })
  }, [format])

  return viewRef
}
