import { cn } from '@/lib/cn'
import { useDocumentStore } from '@/store/document-store'
import { useUIStore } from '@/store/ui-store'
import { useSchemaStore } from '@/store/schema-store'
import { getNodeType, getNodeChildCount } from '@/core/types'
import type { JsonValue } from '@/core/types'

function countNodes(value: JsonValue): number {
  if (value === null || typeof value !== 'object') return 1
  if (Array.isArray(value)) {
    return 1 + value.reduce<number>((acc, item) => acc + countNodes(item), 0)
  }
  return 1 + Object.values(value).reduce<number>((acc, val) => acc + countNodes(val), 0)
}

export function StatusBar() {
  const parsed = useDocumentStore(s => s.parsed)
  const format = useDocumentStore(s => s.format)
  const parseError = useDocumentStore(s => s.parseError)
  const dirty = useDocumentStore(s => s.dirty)
  const undoStack = useDocumentStore(s => s.undoStack)

  const selectedPath = useUIStore(s => s.selectedPath)
  const errors = useSchemaStore(s => s.errors)
  const schemaSource = useSchemaStore(s => s.schemaSource)

  const nodeCount = parsed !== null && parsed !== undefined && !parseError
    ? countNodes(parsed) : 0

  const rootType = parsed !== null && parsed !== undefined && !parseError
    ? getNodeType(parsed) : null

  return (
    <div className="flex items-center justify-between h-6 px-3 border-t border-border bg-card text-[11px] text-muted-foreground shrink-0">
      <div className="flex items-center gap-3">
        {/* Format */}
        <span className="font-medium uppercase">{format}</span>

        {/* Parse status */}
        {parseError ? (
          <span className="text-destructive flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
            Error
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Valid
          </span>
        )}

        {/* Root type */}
        {rootType && (
          <span>{rootType} ({getNodeChildCount(parsed)})</span>
        )}

        {/* Node count */}
        {nodeCount > 0 && <span>{nodeCount} nodes</span>}
      </div>

      <div className="flex items-center gap-3">
        {/* Selected path */}
        {selectedPath && (
          <span className="font-mono text-[10px] max-w-[200px] truncate">
            {selectedPath}
          </span>
        )}

        {/* Schema status */}
        {schemaSource !== 'none' && (
          <span className={cn(
            errors.length > 0 ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400'
          )}>
            Schema: {errors.length > 0 ? `${errors.length} errors` : 'valid'}
          </span>
        )}

        {/* Dirty indicator */}
        {dirty && <span>Modified</span>}

        {/* Undo count */}
        {undoStack.length > 0 && (
          <span>{undoStack.length} change{undoStack.length !== 1 ? 's' : ''}</span>
        )}
      </div>
    </div>
  )
}
