import { useState, useCallback } from 'react'
import { cn } from '@/lib/cn'
import { TYPE_COLORS } from '@/lib/constants'
import type { JsonValue, JsonObject, NodeType } from '@/core/types'
import { getNodeType } from '@/core/types'
import { getAtPath } from '@/core/path-utils'
import { useDocumentStore } from '@/store/document-store'
import { useUIStore } from '@/store/ui-store'
import { useSchemaStore } from '@/store/schema-store'
import { errorsAtPath } from '@/core/validator'
import { Plus, Trash2 } from 'lucide-react'

function renderTypeSelect(currentType: NodeType, onChange: (type: NodeType) => void) {
  return (
    <select
      value={currentType}
      onChange={e => onChange(e.target.value as NodeType)}
      className="h-7 text-xs px-1.5 py-0 border rounded bg-background text-foreground"
    >
      <option value="string">string</option>
      <option value="number">number</option>
      <option value="boolean">boolean</option>
      <option value="null">null</option>
      <option value="object">object</option>
      <option value="array">array</option>
    </select>
  )
}

function getDefaultForType(type: NodeType): JsonValue {
  switch (type) {
    case 'string': return ''
    case 'number': return 0
    case 'boolean': return false
    case 'null': return null
    case 'object': return {}
    case 'array': return []
  }
}

interface FieldEditorProps {
  path: string
  fieldKey: string
  value: JsonValue
}

function FieldEditor({ path, fieldKey, value }: FieldEditorProps) {
  const type = getNodeType(value)
  const updateAtPath = useDocumentStore(s => s.updateAtPath)
  const deleteAtPath = useDocumentStore(s => s.deleteAtPath)
  const errors = useSchemaStore(s => s.errors)
  const fieldErrors = errorsAtPath(errors, path)
  const hasError = fieldErrors.length > 0

  const handleTypeChange = useCallback((newType: NodeType) => {
    updateAtPath(path, getDefaultForType(newType), `Changed type of ${fieldKey} to ${newType}`)
  }, [path, fieldKey, updateAtPath])

  const renderInput = () => {
    switch (type) {
      case 'string':
        return (
          <input
            type="text"
            value={value as string}
            onChange={e => updateAtPath(path, e.target.value)}
            className={cn(
              'h-7 text-xs px-1.5 py-0 border rounded bg-background text-foreground flex-1',
              hasError && 'border-red-500'
            )}
          />
        )
      case 'number':
        return (
          <input
            type="number"
            value={value as number}
            onChange={e => {
              const num = parseFloat(e.target.value)
              if (!isNaN(num)) updateAtPath(path, num)
            }}
            className={cn(
              'h-7 text-xs px-1.5 py-0 border rounded bg-background text-foreground flex-1',
              hasError && 'border-red-500'
            )}
          />
        )
      case 'boolean':
        return (
          <label className="flex items-center gap-2 flex-1">
            <input
              type="checkbox"
              checked={value as boolean}
              onChange={e => updateAtPath(path, e.target.checked)}
              className="h-4 w-4 rounded border"
            />
            <span className="text-xs text-muted-foreground">{String(value)}</span>
          </label>
        )
      case 'null':
        return <span className="text-xs text-muted-foreground italic flex-1">null</span>
      default:
        return <span className="text-xs text-muted-foreground flex-1">(complex)</span>
    }
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className={cn(
          'text-xs font-medium min-w-[80px] truncate',
          TYPE_COLORS[type].text
        )}>
          {fieldKey}
        </span>
        {renderTypeSelect(type, handleTypeChange)}
        {renderInput()}
        <button
          onClick={() => deleteAtPath(path)}
          className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive"
          title="Delete field"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
      {hasError && (
        <div className="text-[10px] text-red-500 ml-[80px]">
          {fieldErrors.map((e, i) => <p key={i}>{e.message}</p>)}
        </div>
      )}
    </div>
  )
}

export function FormPanel() {
  const parsed = useDocumentStore(s => s.parsed)
  const parseError = useDocumentStore(s => s.parseError)
  const addChildAtPath = useDocumentStore(s => s.addChildAtPath)
  const selectedPath = useUIStore(s => s.selectedPath)
  const setFocusedPanel = useUIStore(s => s.setFocusedPanel)
  const [newKeyName, setNewKeyName] = useState('')

  if (parseError) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 text-sm text-destructive">
        <p>Fix parse errors to use the form editor</p>
      </div>
    )
  }

  const selected = getAtPath(parsed, selectedPath)
  if (selected === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 text-sm text-muted-foreground">
        <p>Select a node in the tree to edit</p>
      </div>
    )
  }

  const type = getNodeType(selected)

  const handleAddChild = useCallback(() => {
    if (type === 'object') {
      addChildAtPath(selectedPath, newKeyName || undefined)
      setNewKeyName('')
    } else if (type === 'array') {
      addChildAtPath(selectedPath)
    }
  }, [type, selectedPath, newKeyName, addChildAtPath])

  const renderFields = () => {
    if (type === 'object') {
      const obj = selected as JsonObject
      const entries = Object.entries(obj)
      if (entries.length === 0) {
        return <p className="text-xs text-muted-foreground italic">Empty object</p>
      }
      return entries.map(([key, val]) => (
        <FieldEditor
          key={key}
          path={selectedPath ? `${selectedPath}/${key}` : `/${key}`}
          fieldKey={key}
          value={val}
        />
      ))
    }

    if (type === 'array') {
      const arr = selected as JsonValue[]
      if (arr.length === 0) {
        return <p className="text-xs text-muted-foreground italic">Empty array</p>
      }
      return arr.map((item, i) => (
        <FieldEditor
          key={i}
          path={selectedPath ? `${selectedPath}/${i}` : `/${i}`}
          fieldKey={`[${i}]`}
          value={item}
        />
      ))
    }

    // Primitive value
    return (
      <FieldEditor
        path={selectedPath}
        fieldKey="value"
        value={selected}
      />
    )
  }

  return (
    <div
      className="flex-1 overflow-auto p-3 space-y-3"
      onClick={() => setFocusedPanel('form')}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-foreground">
            {selectedPath || '(root)'}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {type} {type === 'object' ? `(${Object.keys(selected as JsonObject).length} keys)` :
              type === 'array' ? `(${(selected as JsonValue[]).length} items)` : ''}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {renderFields()}
      </div>

      {(type === 'object' || type === 'array') && (
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          {type === 'object' && (
            <input
              type="text"
              placeholder="Key name"
              value={newKeyName}
              onChange={e => setNewKeyName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddChild() }}
              className="h-7 text-xs px-1.5 py-0 border rounded bg-background text-foreground flex-1"
            />
          )}
          <button
            onClick={handleAddChild}
            className="flex items-center gap-1 h-7 px-2 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            <Plus className="w-3 h-3" />
            Add {type === 'object' ? 'key' : 'item'}
          </button>
        </div>
      )}
    </div>
  )
}
