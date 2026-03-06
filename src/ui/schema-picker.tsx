import { useState, useCallback } from 'react'
import { useUIStore } from '@/store/ui-store'
import { useSchemaStore } from '@/store/schema-store'
import { useDocumentStore } from '@/store/document-store'
import { X } from 'lucide-react'

export function SchemaPicker() {
  const show = useUIStore(s => s.showSchemaDialog)
  const setShow = useUIStore(s => s.setShowSchemaDialog)
  const schema = useSchemaStore(s => s.schema)
  const schemaSource = useSchemaStore(s => s.schemaSource)
  const loadSchema = useSchemaStore(s => s.loadSchema)
  const inferFromData = useSchemaStore(s => s.inferFromData)
  const clearSchema = useSchemaStore(s => s.clearSchema)
  const validateData = useSchemaStore(s => s.validateData)
  const parsed = useDocumentStore(s => s.parsed)
  const errors = useSchemaStore(s => s.errors)

  const [schemaText, setSchemaText] = useState('')

  const handleLoad = useCallback(() => {
    try {
      const parsed = JSON.parse(schemaText)
      loadSchema(parsed)
    } catch {
      // Invalid JSON
    }
  }, [schemaText, loadSchema])

  const handleInfer = useCallback(() => {
    if (parsed !== null && parsed !== undefined) {
      inferFromData(parsed)
    }
  }, [parsed, inferFromData])

  const handleValidate = useCallback(() => {
    if (parsed !== null && parsed !== undefined) {
      validateData(parsed)
    }
  }, [parsed, validateData])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => setShow(false)} />
      <div className="relative bg-card border border-border rounded-lg shadow-xl w-[560px] max-h-[80vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card">
          <h2 className="text-sm font-semibold text-foreground">JSON Schema</h2>
          <button className="p-1 hover:bg-accent rounded" onClick={() => setShow(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Status: {schemaSource === 'none' ? 'No schema' :
                schemaSource === 'inferred' ? 'Inferred from data' : 'Loaded'}
            </span>
            {schema && (
              <button
                className="text-xs text-destructive hover:underline"
                onClick={clearSchema}
              >
                Clear
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              className="h-7 px-3 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
              onClick={handleInfer}
            >
              Infer from Data
            </button>
            <button
              className="h-7 px-3 text-xs bg-secondary text-secondary-foreground rounded hover:bg-secondary/80"
              onClick={handleValidate}
              disabled={!schema}
            >
              Validate Now
            </button>
          </div>

          {/* Manual schema input */}
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Paste JSON Schema
            </label>
            <textarea
              value={schemaText}
              onChange={e => setSchemaText(e.target.value)}
              placeholder='{"type": "object", "properties": {...}}'
              className="w-full h-32 text-xs font-mono p-2 border rounded bg-background text-foreground resize-none"
            />
            <button
              className="mt-1 h-7 px-3 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
              onClick={handleLoad}
            >
              Load Schema
            </button>
          </div>

          {/* Current schema display */}
          {schema && (
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Current Schema
              </label>
              <pre className="text-[11px] font-mono p-2 bg-muted rounded border max-h-48 overflow-auto">
                {JSON.stringify(schema, null, 2)}
              </pre>
            </div>
          )}

          {/* Validation errors */}
          {errors.length > 0 && (
            <div>
              <label className="text-xs font-medium text-destructive block mb-1">
                Validation Errors ({errors.length})
              </label>
              <div className="space-y-1">
                {errors.map((err, i) => (
                  <div key={i} className="text-xs bg-destructive/10 text-destructive p-2 rounded">
                    <span className="font-mono">{err.path}</span>: {err.message}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
