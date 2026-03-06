import { useState, useCallback, useRef, useEffect } from 'react'
import { cn } from '@/lib/cn'
import { TYPE_COLORS } from '@/lib/constants'
import type { JsonValue, NodeType } from '@/core/types'
import { getNodeType, getNodePreview, getNodeChildCount } from '@/core/types'
import { useDocumentStore } from '@/store/document-store'
import { useUIStore } from '@/store/ui-store'
import {
  ChevronRight, ChevronDown, Plus, Trash2, Copy, Pencil, MoreHorizontal,
} from 'lucide-react'

function renderTypeBadge(type: NodeType) {
  const colors = TYPE_COLORS[type]
  return (
    <span className={cn(
      'inline-flex items-center px-1.5 py-0 text-[10px] font-medium rounded',
      colors.bg, colors.text
    )}>
      {type}
    </span>
  )
}

interface TreeNodeProps {
  path: string
  nodeKey: string | number
  value: JsonValue
  depth: number
}

function TreeNode({ path, nodeKey, value, depth }: TreeNodeProps) {
  const type = getNodeType(value)
  const childCount = getNodeChildCount(value)
  const hasChildren = childCount > 0

  const selectedPath = useUIStore(s => s.selectedPath)
  const expandedPaths = useUIStore(s => s.expandedPaths)
  const toggleExpanded = useUIStore(s => s.toggleExpanded)
  const setSelectedPath = useUIStore(s => s.setSelectedPath)

  const updateAtPath = useDocumentStore(s => s.updateAtPath)
  const deleteAtPath = useDocumentStore(s => s.deleteAtPath)
  const duplicateAtPath = useDocumentStore(s => s.duplicateAtPath)
  const addChildAtPath = useDocumentStore(s => s.addChildAtPath)

  const isExpanded = expandedPaths.has('__all__') || expandedPaths.has(path)
  const isSelected = selectedPath === path

  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const [showMenu, setShowMenu] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  useEffect(() => {
    if (!showMenu) return
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showMenu])

  const startEditing = useCallback(() => {
    if (type === 'object' || type === 'array') return
    setEditValue(value === null ? '' : String(value))
    setEditing(true)
  }, [type, value])

  const commitEdit = useCallback(() => {
    setEditing(false)
    if (type === 'string') {
      updateAtPath(path, editValue)
    } else if (type === 'number') {
      const num = Number(editValue)
      if (!isNaN(num)) updateAtPath(path, num)
    } else if (type === 'boolean') {
      updateAtPath(path, editValue === 'true')
    } else if (type === 'null') {
      if (editValue) updateAtPath(path, editValue)
    }
  }, [type, editValue, path, updateAtPath])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      commitEdit()
    } else if (e.key === 'Escape') {
      setEditing(false)
    }
  }, [commitEdit])

  const renderValue = () => {
    if (editing) {
      if (type === 'boolean') {
        return (
          <select
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            className="h-6 text-xs px-1 py-0 border rounded bg-background text-foreground"
          >
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        )
      }
      return (
        <input
          ref={inputRef}
          type={type === 'number' ? 'number' : 'text'}
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          className="h-6 text-xs px-1.5 py-0 border rounded bg-background text-foreground min-w-[100px]"
        />
      )
    }

    if (type === 'object' || type === 'array') {
      return (
        <span className="text-xs text-muted-foreground">
          {getNodePreview(value)}
        </span>
      )
    }

    return (
      <span
        className={cn('text-xs cursor-pointer hover:underline', TYPE_COLORS[type].text)}
        onDoubleClick={startEditing}
      >
        {getNodePreview(value)}
      </span>
    )
  }

  const renderChildren = () => {
    if (!hasChildren || !isExpanded) return null

    if (Array.isArray(value)) {
      return value.map((item, i) => (
        <TreeNode
          key={`${path}/${i}`}
          path={`${path}/${i}`}
          nodeKey={i}
          value={item}
          depth={depth + 1}

        />
      ))
    }

    if (value !== null && typeof value === 'object') {
      const entries = Object.entries(value)
      return entries.map(([k, v]) => (
        <TreeNode
          key={`${path}/${k}`}
          path={`${path}/${k}`}
          nodeKey={k}
          value={v}
          depth={depth + 1}

        />
      ))
    }

    return null
  }

  return (
    <div>
      <div
        className={cn(
          'group flex items-center gap-1 px-1 py-0.5 cursor-pointer rounded-sm text-sm relative',
          isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
        )}
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
        onClick={() => setSelectedPath(path)}
        onDoubleClick={startEditing}
      >
        {/* Expand/collapse toggle */}
        <span
          className="w-4 h-4 flex items-center justify-center flex-shrink-0"
          onClick={(e) => { e.stopPropagation(); if (hasChildren) toggleExpanded(path) }}
        >
          {hasChildren ? (
            isExpanded
              ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          ) : null}
        </span>

        {/* Key name */}
        <span className="text-xs font-medium text-foreground truncate max-w-[140px]">
          {typeof nodeKey === 'number' ? `[${nodeKey}]` : nodeKey}
        </span>

        <span className="text-muted-foreground text-xs">:</span>

        {/* Type badge */}
        {renderTypeBadge(type)}

        {/* Value */}
        <span className="flex-1 truncate ml-1">
          {renderValue()}
        </span>

        {/* Action buttons */}
        <span className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 flex-shrink-0">
          {(type === 'object' || type === 'array') && (
            <button
              className="p-0.5 hover:bg-accent rounded"
              onClick={(e) => { e.stopPropagation(); addChildAtPath(path) }}
              title="Add child"
            >
              <Plus className="w-3 h-3" />
            </button>
          )}
          <button
            className="p-0.5 hover:bg-accent rounded relative"
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }}
            title="More actions"
          >
            <MoreHorizontal className="w-3 h-3" />
          </button>
        </span>

        {/* Context menu */}
        {showMenu && (
          <div
            ref={menuRef}
            className="absolute right-0 top-full z-50 bg-popover border border-border rounded-md shadow-md py-1 min-w-[140px]"
          >
            {type !== 'object' && type !== 'array' && (
              <button
                className="w-full text-left px-3 py-1 text-xs hover:bg-accent flex items-center gap-2"
                onClick={(e) => { e.stopPropagation(); setShowMenu(false); startEditing() }}
              >
                <Pencil className="w-3 h-3" /> Edit value
              </button>
            )}
            <button
              className="w-full text-left px-3 py-1 text-xs hover:bg-accent flex items-center gap-2"
              onClick={(e) => { e.stopPropagation(); setShowMenu(false); duplicateAtPath(path) }}
            >
              <Copy className="w-3 h-3" /> Duplicate
            </button>
            <button
              className="w-full text-left px-3 py-1 text-xs hover:bg-accent text-red-600 dark:text-red-400 flex items-center gap-2"
              onClick={(e) => { e.stopPropagation(); setShowMenu(false); deleteAtPath(path) }}
            >
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          </div>
        )}
      </div>

      {renderChildren()}
    </div>
  )
}

export function TreePanel() {
  const parsed = useDocumentStore(s => s.parsed)
  const parseError = useDocumentStore(s => s.parseError)
  const setFocusedPanel = useUIStore(s => s.setFocusedPanel)

  if (parseError) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 text-sm text-destructive">
        <div className="text-center">
          <p className="font-medium">Parse Error</p>
          <p className="text-xs mt-1 text-muted-foreground">{parseError}</p>
        </div>
      </div>
    )
  }

  if (parsed === null || parsed === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 text-sm text-muted-foreground">
        Empty document
      </div>
    )
  }

  const type = getNodeType(parsed)
  const isContainer = type === 'object' || type === 'array'

  return (
    <div
      className="flex-1 overflow-auto p-2"
      onClick={() => setFocusedPanel('tree')}
    >
      {isContainer ? (
        <TreeNode
          path=""
          nodeKey={type === 'array' ? '(root)' : '(root)'}
          value={parsed}
          depth={0}

        />
      ) : (
        <TreeNode
          path=""
          nodeKey="(value)"
          value={parsed}
          depth={0}

        />
      )}
    </div>
  )
}
