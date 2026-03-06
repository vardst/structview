export type JsonValue = string | number | boolean | null | JsonObject | JsonArray
export type JsonObject = { [key: string]: JsonValue }
export type JsonArray = JsonValue[]

export type NodeType = 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array'

export interface HistoryEntry {
  content: string
  parsed: JsonValue
  description: string
  timestamp: number
}

export interface ValidationError {
  path: string
  message: string
  keyword: string
}

export type ParseResult = {
  success: true
  data: JsonValue
} | {
  success: false
  error: string
  line?: number
  column?: number
}

export function getNodeType(value: JsonValue): NodeType {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  return typeof value as NodeType
}

export function getNodeChildCount(value: JsonValue): number {
  if (value === null || typeof value !== 'object') return 0
  if (Array.isArray(value)) return value.length
  return Object.keys(value).length
}

export function getNodePreview(value: JsonValue, maxLen = 60): string {
  if (value === null) return 'null'
  if (typeof value === 'string') {
    return value.length > maxLen ? `"${value.slice(0, maxLen)}..."` : `"${value}"`
  }
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return `[${value.length} items]`
  const keys = Object.keys(value)
  return `{${keys.length} keys}`
}
