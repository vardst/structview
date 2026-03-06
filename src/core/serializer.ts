import YAML from 'yaml'
import type { JsonValue } from './types'
import type { DataFormat } from '@/lib/constants'

export function toJSON(data: JsonValue, indent = 2): string {
  return JSON.stringify(data, null, indent)
}

export function toYAML(data: JsonValue, indent = 2): string {
  return YAML.stringify(data, { indent, lineWidth: 0 })
}

export function serialize(data: JsonValue, format: DataFormat, indent = 2): string {
  return format === 'json' ? toJSON(data, indent) : toYAML(data, indent)
}
