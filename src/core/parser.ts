import YAML from 'yaml'
import type { JsonValue, ParseResult } from './types'
import type { DataFormat } from '@/lib/constants'

export function parseJSON(content: string): ParseResult {
  try {
    const data = JSON.parse(content) as JsonValue
    return { success: true, data }
  } catch (e) {
    const err = e as SyntaxError
    const match = err.message.match(/position (\d+)/)
    let line: number | undefined
    let column: number | undefined
    if (match) {
      const pos = parseInt(match[1], 10)
      const lines = content.slice(0, pos).split('\n')
      line = lines.length
      column = lines[lines.length - 1].length + 1
    }
    return { success: false, error: err.message, line, column }
  }
}

export function parseYAML(content: string): ParseResult {
  try {
    const data = YAML.parse(content) as JsonValue
    return { success: true, data: data ?? null }
  } catch (e) {
    const err = e as YAML.YAMLParseError
    return {
      success: false,
      error: err.message,
      line: err.linePos?.[0]?.line,
      column: err.linePos?.[0]?.col,
    }
  }
}

export function parseContent(content: string, format: DataFormat): ParseResult {
  if (!content.trim()) {
    return { success: true, data: null }
  }
  return format === 'json' ? parseJSON(content) : parseYAML(content)
}

export function detectFormat(content: string): DataFormat {
  const trimmed = content.trimStart()
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) return 'json'
  try {
    JSON.parse(content)
    return 'json'
  } catch {
    // Not valid JSON, try YAML
  }
  try {
    YAML.parse(content)
    return 'yaml'
  } catch {
    // Default to JSON
  }
  return 'json'
}
