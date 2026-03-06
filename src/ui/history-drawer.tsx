import { useDocumentStore } from '@/store/document-store'
import { useUIStore } from '@/store/ui-store'
import { X, Undo2 } from 'lucide-react'

export function HistoryDrawer() {
  const showHistory = useUIStore(s => s.showHistory)
  const setShowHistory = useUIStore(s => s.setShowHistory)
  const undoStack = useDocumentStore(s => s.undoStack)
  const undo = useDocumentStore(s => s.undo)

  if (!showHistory) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => setShowHistory(false)}
      />

      {/* Drawer */}
      <div className="absolute right-0 top-0 bottom-0 w-80 bg-card border-l border-border shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Change History</h2>
          <button
            className="p-1 hover:bg-accent rounded"
            onClick={() => setShowHistory(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-2">
          {undoStack.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">
              No changes yet
            </p>
          ) : (
            <div className="space-y-1">
              {[...undoStack].reverse().map((entry, i) => (
                <div
                  key={undoStack.length - 1 - i}
                  className="flex items-start gap-2 p-2 rounded hover:bg-accent group"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground leading-snug">
                      {entry.description || 'Change'}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {formatTimestamp(entry.timestamp)}
                    </p>
                  </div>
                  {i === 0 && (
                    <button
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-accent rounded"
                      onClick={undo}
                      title="Undo this change"
                    >
                      <Undo2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function formatTimestamp(ts: number): string {
  const diff = Date.now() - ts
  if (diff < 5000) return 'just now'
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  return new Date(ts).toLocaleTimeString()
}
