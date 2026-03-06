import { useCallback, useRef } from 'react'
import { cn } from '@/lib/cn'
import { useDocumentStore } from '@/store/document-store'
import { useUIStore } from '@/store/ui-store'
import { useSchemaStore } from '@/store/schema-store'
import { detectFormat } from '@/core/parser'
import { encodeToUrl } from '@/lib/url-codec'
import {
  Undo2, Redo2, Download, Upload, Share2, History,
  TreePine, Code2, FormInput, Keyboard,
} from 'lucide-react'
import { FormatToggle } from './format-toggle'
import { ThemeToggle } from './theme-toggle'

export function Toolbar() {
  const undo = useDocumentStore(s => s.undo)
  const redo = useDocumentStore(s => s.redo)
  const undoStack = useDocumentStore(s => s.undoStack)
  const redoStack = useDocumentStore(s => s.redoStack)
  const parsed = useDocumentStore(s => s.parsed)
  const content = useDocumentStore(s => s.content)
  const format = useDocumentStore(s => s.format)
  const loadDocument = useDocumentStore(s => s.loadDocument)
  const parseError = useDocumentStore(s => s.parseError)

  const visiblePanels = useUIStore(s => s.visiblePanels)
  const togglePanel = useUIStore(s => s.togglePanel)
  const setShowHistory = useUIStore(s => s.setShowHistory)
  const setShowKeyboardHelp = useUIStore(s => s.setShowKeyboardHelp)
  const setShowSchemaDialog = useUIStore(s => s.setShowSchemaDialog)

  const schema = useSchemaStore(s => s.schema)
  const inferFromData = useSchemaStore(s => s.inferFromData)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImport = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = reader.result as string
      const fmt = file.name.endsWith('.json') ? 'json' as const : detectFormat(text)
      loadDocument(text, fmt)
    }
    reader.readAsText(file)
    e.target.value = ''
  }, [loadDocument])

  const handleExport = useCallback(() => {
    if (parseError) return
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/yaml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `document.${format === 'json' ? 'json' : 'yaml'}`
    a.click()
    URL.revokeObjectURL(url)
  }, [content, format, parseError])

  const handleShare = useCallback(() => {
    const hash = encodeToUrl(content, format)
    const url = `${window.location.origin}${window.location.pathname}#${hash}`
    navigator.clipboard.writeText(url)
  }, [content, format])

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      const fmt = detectFormat(text)
      loadDocument(text, fmt)
    } catch {
      // Clipboard access denied
    }
  }, [loadDocument])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content)
  }, [content])

  const btnClass = 'flex items-center gap-1 h-7 px-2 text-xs rounded hover:bg-accent text-foreground transition-colors'
  const panelBtnClass = (active: boolean) => cn(
    btnClass,
    active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
  )

  return (
    <div className="flex items-center justify-between h-10 px-2 border-b border-border bg-card shrink-0">
      {/* Left: Brand + format */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold tracking-tight text-foreground">StructView</span>
        <div className="w-px h-5 bg-border" />
        <FormatToggle />
      </div>

      {/* Center: Panel toggles */}
      <div className="flex items-center gap-1">
        <button
          className={panelBtnClass(visiblePanels.has('tree'))}
          onClick={() => togglePanel('tree')}
          title="Toggle tree panel (Ctrl+1)"
        >
          <TreePine className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Tree</span>
        </button>
        <button
          className={panelBtnClass(visiblePanels.has('code'))}
          onClick={() => togglePanel('code')}
          title="Toggle code panel (Ctrl+2)"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Code</span>
        </button>
        <button
          className={panelBtnClass(visiblePanels.has('form'))}
          onClick={() => togglePanel('form')}
          title="Toggle form panel (Ctrl+3)"
        >
          <FormInput className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Form</span>
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-0.5">
        <button className={btnClass} onClick={undo} disabled={undoStack.length === 0} title="Undo (Ctrl+Z)">
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button className={btnClass} onClick={redo} disabled={redoStack.length === 0} title="Redo (Ctrl+Shift+Z)">
          <Redo2 className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-5 bg-border mx-1" />

        <button className={btnClass} onClick={handleImport} title="Import file">
          <Upload className="w-3.5 h-3.5" />
        </button>
        <button className={btnClass} onClick={handleExport} title="Export file">
          <Download className="w-3.5 h-3.5" />
        </button>
        <button className={btnClass} onClick={handleCopy} title="Copy to clipboard">
          <Code2 className="w-3.5 h-3.5" />
        </button>
        <button className={btnClass} onClick={handlePaste} title="Paste from clipboard">
          <FormInput className="w-3.5 h-3.5" />
        </button>
        <button className={btnClass} onClick={handleShare} title="Copy shareable URL">
          <Share2 className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-5 bg-border mx-1" />

        <button className={btnClass} onClick={() => setShowHistory(true)} title="History (Ctrl+H)">
          <History className="w-3.5 h-3.5" />
        </button>
        <button
          className={cn(btnClass, schema && 'text-emerald-600 dark:text-emerald-400')}
          onClick={() => {
            if (!schema && !parseError) inferFromData(parsed)
            setShowSchemaDialog(true)
          }}
          title="Schema"
        >
          <span className="text-xs">{ }</span>
        </button>
        <button className={btnClass} onClick={() => setShowKeyboardHelp(true)} title="Keyboard shortcuts (?)">
          <Keyboard className="w-3.5 h-3.5" />
        </button>
        <ThemeToggle />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.yaml,.yml"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
