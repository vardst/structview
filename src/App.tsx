import { useEffect, useCallback, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { useDocumentStore } from '@/store/document-store'
import { useUIStore, type PanelId } from '@/store/ui-store'
import { useSchemaStore } from '@/store/schema-store'
import { useKeyboard } from '@/hooks/use-keyboard'
import { useDropZone } from '@/hooks/use-drop-zone'
import { decodeFromUrl } from '@/lib/url-codec'
import { TreePanel } from '@/panels/tree-panel'
import { CodePanel } from '@/panels/code-panel'
import { FormPanel } from '@/panels/form-panel'
import { Toolbar } from '@/ui/toolbar'
import { StatusBar } from '@/ui/status-bar'
import { HistoryDrawer } from '@/ui/history-drawer'
import { KeyboardHelp } from '@/ui/keyboard-help'
import { SchemaPicker } from '@/ui/schema-picker'

function PanelHeader({ title, panelId }: { title: string; panelId: PanelId }) {
  const focusedPanel = useUIStore(s => s.focusedPanel)
  const isFocused = focusedPanel === panelId

  return (
    <div className={cn(
      'h-7 flex items-center px-3 border-b text-xs font-medium shrink-0',
      isFocused
        ? 'bg-accent text-accent-foreground border-primary/30'
        : 'bg-muted/50 text-muted-foreground border-border'
    )}>
      {title}
    </div>
  )
}

function ResizeHandle({ onResize }: { onResize: (delta: number) => void }) {
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX
    const handleMouseMove = (ev: MouseEvent) => {
      onResize(ev.clientX - startX)
    }
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [onResize])

  return (
    <div
      className="w-1 cursor-col-resize hover:bg-primary/20 active:bg-primary/40 transition-colors shrink-0"
      onMouseDown={handleMouseDown}
    />
  )
}

export default function App() {
  const loadDocument = useDocumentStore(s => s.loadDocument)
  const parsed = useDocumentStore(s => s.parsed)
  const schema = useSchemaStore(s => s.schema)
  const validateData = useSchemaStore(s => s.validateData)
  const visiblePanels = useUIStore(s => s.visiblePanels)
  const { isDragging, dropHandlers } = useDropZone()

  const [panelWidths, setPanelWidths] = useState({ tree: 33, code: 34, form: 33 })
  const widthsRef = useRef(panelWidths)
  useEffect(() => { widthsRef.current = panelWidths }, [panelWidths])

  useKeyboard()

  // Load from URL hash on mount
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (hash) {
      const result = decodeFromUrl(hash)
      if (result) {
        loadDocument(result.content, result.format)
      }
    }
  }, [loadDocument])

  // Auto-validate when data or schema changes
  useEffect(() => {
    if (schema && parsed !== null && parsed !== undefined) {
      validateData(parsed)
    }
  }, [parsed, schema, validateData])

  const panelOrder: PanelId[] = ['tree', 'code', 'form']
  const activePanels = panelOrder.filter(p => visiblePanels.has(p))

  const makeResizeHandler = useCallback((leftPanel: PanelId, rightPanel: PanelId) => {
    let startWidths: typeof panelWidths

    return (delta: number) => {
      if (!startWidths) {
        startWidths = { ...widthsRef.current }
      }
      const containerWidth = document.getElementById('panel-container')?.clientWidth ?? 1000
      const deltaPercent = (delta / containerWidth) * 100

      const newLeft = Math.max(15, Math.min(70, startWidths[leftPanel] + deltaPercent))
      const newRight = Math.max(15, Math.min(70, startWidths[rightPanel] - deltaPercent))

      setPanelWidths(prev => ({
        ...prev,
        [leftPanel]: newLeft,
        [rightPanel]: newRight,
      }))
    }
  }, [])

  const renderPanel = (panelId: PanelId) => {
    const panels: Record<PanelId, { title: string; component: React.ReactNode }> = {
      tree: { title: 'Tree', component: <TreePanel /> },
      code: { title: 'Code', component: <CodePanel /> },
      form: { title: 'Form', component: <FormPanel /> },
    }
    const { title, component } = panels[panelId]
    const width = activePanels.length === 1 ? 100 : panelWidths[panelId]

    return (
      <div
        key={panelId}
        className="flex flex-col overflow-hidden"
        style={{ width: `${width}%` }}
      >
        <PanelHeader title={title} panelId={panelId} />
        {component}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full" {...dropHandlers}>
      <Toolbar />

      <div id="panel-container" className="flex flex-1 overflow-hidden relative">
        {activePanels.map((panelId, i) => (
          <div key={panelId} className="contents">
            {renderPanel(panelId)}
            {i < activePanels.length - 1 && (
              <ResizeHandle
                onResize={makeResizeHandler(activePanels[i], activePanels[i + 1])}
              />
            )}
          </div>
        ))}
      </div>

      <StatusBar />

      {/* Overlays */}
      <HistoryDrawer />
      <KeyboardHelp />
      <SchemaPicker />

      {/* Drag-drop overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/10 border-2 border-dashed border-primary pointer-events-none">
          <div className="bg-card px-6 py-4 rounded-lg shadow-xl">
            <p className="text-sm font-medium text-foreground">Drop JSON or YAML file here</p>
          </div>
        </div>
      )}
    </div>
  )
}
