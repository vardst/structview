import { cn } from '@/lib/cn'
import { useDocumentStore } from '@/store/document-store'

export function FormatToggle() {
  const format = useDocumentStore(s => s.format)
  const setFormat = useDocumentStore(s => s.setFormat)
  const parseError = useDocumentStore(s => s.parseError)

  return (
    <div className="flex items-center bg-muted rounded-md p-0.5">
      <button
        className={cn(
          'px-2 py-0.5 text-xs font-medium rounded transition-colors',
          format === 'json'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
        onClick={() => setFormat('json')}
        disabled={!!parseError}
      >
        JSON
      </button>
      <button
        className={cn(
          'px-2 py-0.5 text-xs font-medium rounded transition-colors',
          format === 'yaml'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
        onClick={() => setFormat('yaml')}
        disabled={!!parseError}
      >
        YAML
      </button>
    </div>
  )
}
