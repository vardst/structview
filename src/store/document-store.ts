import { create } from 'zustand'
import type { JsonValue } from '@/core/types'
import type { HistoryEntry } from '@/core/types'
import { parseContent } from '@/core/parser'
import { serialize } from '@/core/serializer'
import type { DataFormat } from '@/lib/constants'
import { MAX_UNDO_STACK, SAMPLE_JSON } from '@/lib/constants'
import {
  setAtPath, deleteAtPath, duplicateAtPath, renameKey, addChild, getAtPath,
} from '@/core/path-utils'
import {
  describeChange, describeRename, describeDuplicate, describeAddChild, describeFormatChange,
} from '@/core/diff'

interface DocumentState {
  content: string
  parsed: JsonValue
  format: DataFormat
  parseError: string | null
  dirty: boolean

  undoStack: HistoryEntry[]
  redoStack: HistoryEntry[]

  // Actions
  loadDocument: (content: string, format?: DataFormat) => void
  setContent: (content: string) => void
  setFormat: (format: DataFormat) => void
  toggleFormat: () => void
  updateAtPath: (path: string, value: JsonValue, description?: string) => void
  deleteAtPath: (path: string) => void
  duplicateAtPath: (path: string) => void
  renameKeyAtPath: (path: string, newKey: string) => void
  addChildAtPath: (path: string, key?: string) => void
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
}

function pushHistory(state: DocumentState): { undoStack: HistoryEntry[]; redoStack: HistoryEntry[] } {
  const entry: HistoryEntry = {
    content: state.content,
    parsed: state.parsed,
    description: '',
    timestamp: Date.now(),
  }
  const stack = [...state.undoStack, entry]
  if (stack.length > MAX_UNDO_STACK) stack.shift()
  return { undoStack: stack, redoStack: [] }
}

export const useDocumentStore = create<DocumentState>((set, get) => {
  const initialParsed = JSON.parse(SAMPLE_JSON) as JsonValue

  return {
    content: SAMPLE_JSON,
    parsed: initialParsed,
    format: 'json',
    parseError: null,
    dirty: false,
    undoStack: [],
    redoStack: [],

    loadDocument: (content: string, format?: DataFormat) => {
      const fmt = format ?? 'json'
      const result = parseContent(content, fmt)
      if (result.success) {
        set({
          content,
          parsed: result.data,
          format: fmt,
          parseError: null,
          dirty: false,
          undoStack: [],
          redoStack: [],
        })
      } else {
        set({
          content,
          parseError: result.error,
          format: fmt,
          dirty: false,
          undoStack: [],
          redoStack: [],
        })
      }
    },

    setContent: (content: string) => {
      const state = get()
      const result = parseContent(content, state.format)
      if (result.success) {
        const history = pushHistory(state)
        set({
          content,
          parsed: result.data,
          parseError: null,
          dirty: true,
          ...history,
        })
      } else {
        set({
          content,
          parseError: result.error,
          dirty: true,
        })
      }
    },

    setFormat: (format: DataFormat) => {
      const state = get()
      if (state.parseError) return
      const content = serialize(state.parsed, format)
      const history = pushHistory(state)
      history.undoStack[history.undoStack.length - 1].description =
        describeFormatChange(state.format, format)
      set({
        content,
        format,
        dirty: true,
        ...history,
      })
    },

    toggleFormat: () => {
      const state = get()
      state.setFormat(state.format === 'json' ? 'yaml' : 'json')
    },

    updateAtPath: (path: string, value: JsonValue, description?: string) => {
      const state = get()
      if (state.parseError) return
      const oldValue = getAtPath(state.parsed, path)
      const newParsed = setAtPath(state.parsed, path, value)
      const content = serialize(newParsed, state.format)
      const desc = description ?? describeChange(path, oldValue, value)
      const history = pushHistory(state)
      history.undoStack[history.undoStack.length - 1].description = desc
      set({
        content,
        parsed: newParsed,
        dirty: true,
        ...history,
      })
    },

    deleteAtPath: (path: string) => {
      const state = get()
      if (state.parseError) return
      const desc = describeChange(path, getAtPath(state.parsed, path), undefined)
      const newParsed = deleteAtPath(state.parsed, path)
      const content = serialize(newParsed, state.format)
      const history = pushHistory(state)
      history.undoStack[history.undoStack.length - 1].description = desc
      set({
        content,
        parsed: newParsed,
        dirty: true,
        ...history,
      })
    },

    duplicateAtPath: (path: string) => {
      const state = get()
      if (state.parseError) return
      const newParsed = duplicateAtPath(state.parsed, path)
      const content = serialize(newParsed, state.format)
      const desc = describeDuplicate(path)
      const history = pushHistory(state)
      history.undoStack[history.undoStack.length - 1].description = desc
      set({
        content,
        parsed: newParsed,
        dirty: true,
        ...history,
      })
    },

    renameKeyAtPath: (path: string, newKey: string) => {
      const state = get()
      if (state.parseError) return
      const segments = path.split('/').filter(Boolean)
      const oldKey = segments[segments.length - 1]
      const newParsed = renameKey(state.parsed, path, newKey)
      const content = serialize(newParsed, state.format)
      const desc = describeRename(path, oldKey, newKey)
      const history = pushHistory(state)
      history.undoStack[history.undoStack.length - 1].description = desc
      set({
        content,
        parsed: newParsed,
        dirty: true,
        ...history,
      })
    },

    addChildAtPath: (path: string, key?: string) => {
      const state = get()
      if (state.parseError) return
      const newParsed = addChild(state.parsed, path, key)
      const content = serialize(newParsed, state.format)
      const desc = describeAddChild(path, key)
      const history = pushHistory(state)
      history.undoStack[history.undoStack.length - 1].description = desc
      set({
        content,
        parsed: newParsed,
        dirty: true,
        ...history,
      })
    },

    undo: () => {
      const state = get()
      if (state.undoStack.length === 0) return
      const entry = state.undoStack[state.undoStack.length - 1]
      const redoEntry: HistoryEntry = {
        content: state.content,
        parsed: state.parsed,
        description: entry.description,
        timestamp: Date.now(),
      }
      set({
        content: entry.content,
        parsed: entry.parsed,
        parseError: null,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, redoEntry],
      })
    },

    redo: () => {
      const state = get()
      if (state.redoStack.length === 0) return
      const entry = state.redoStack[state.redoStack.length - 1]
      const undoEntry: HistoryEntry = {
        content: state.content,
        parsed: state.parsed,
        description: entry.description,
        timestamp: Date.now(),
      }
      set({
        content: entry.content,
        parsed: entry.parsed,
        parseError: null,
        undoStack: [...state.undoStack, undoEntry],
        redoStack: state.redoStack.slice(0, -1),
      })
    },

    canUndo: () => get().undoStack.length > 0,
    canRedo: () => get().redoStack.length > 0,
  }
})
