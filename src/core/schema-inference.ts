import type { JsonValue, JsonObject } from './types'

interface JsonSchema {
  type?: string | string[]
  properties?: Record<string, JsonSchema>
  items?: JsonSchema | JsonSchema[]
  required?: string[]
  enum?: JsonValue[]
  minimum?: number
  maximum?: number
  minLength?: number
  maxLength?: number
  [key: string]: unknown
}

/**
 * Infer a JSON Schema from sample data.
 */
export function inferSchema(value: JsonValue): JsonSchema {
  if (value === null) {
    return { type: 'null' }
  }

  if (typeof value === 'string') {
    const schema: JsonSchema = { type: 'string' }
    if (isDateString(value)) {
      schema.format = 'date-time'
    } else if (isEmailString(value)) {
      schema.format = 'email'
    } else if (isUriString(value)) {
      schema.format = 'uri'
    }
    return schema
  }

  if (typeof value === 'number') {
    return Number.isInteger(value)
      ? { type: 'integer' }
      : { type: 'number' }
  }

  if (typeof value === 'boolean') {
    return { type: 'boolean' }
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return { type: 'array', items: {} }
    }
    const itemSchemas = value.map(inferSchema)
    const merged = mergeSchemas(itemSchemas)
    return { type: 'array', items: merged }
  }

  // Object
  const obj = value as JsonObject
  const properties: Record<string, JsonSchema> = {}
  const required: string[] = []

  for (const [key, val] of Object.entries(obj)) {
    properties[key] = inferSchema(val)
    if (val !== null && val !== undefined) {
      required.push(key)
    }
  }

  const schema: JsonSchema = { type: 'object', properties }
  if (required.length > 0) {
    schema.required = required
  }
  return schema
}

function mergeSchemas(schemas: JsonSchema[]): JsonSchema {
  if (schemas.length === 0) return {}
  if (schemas.length === 1) return schemas[0]

  const types = new Set(schemas.map(s => s.type).filter(Boolean))
  if (types.size === 1) {
    const first = schemas[0]
    if (first.type === 'object') {
      return mergeObjectSchemas(schemas)
    }
    return first
  }

  // Mixed types — use the first schema as representative
  return schemas[0]
}

function mergeObjectSchemas(schemas: JsonSchema[]): JsonSchema {
  const allKeys = new Set<string>()
  for (const s of schemas) {
    if (s.properties) {
      for (const key of Object.keys(s.properties)) {
        allKeys.add(key)
      }
    }
  }

  const properties: Record<string, JsonSchema> = {}
  const required: string[] = []

  for (const key of allKeys) {
    const keySchemas = schemas
      .map(s => s.properties?.[key])
      .filter((s): s is JsonSchema => s !== undefined)
    properties[key] = mergeSchemas(keySchemas)

    // Required only if present in all schemas
    if (keySchemas.length === schemas.length) {
      required.push(key)
    }
  }

  const schema: JsonSchema = { type: 'object', properties }
  if (required.length > 0) {
    schema.required = required
  }
  return schema
}

function isDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?/.test(value)
}

function isEmailString(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function isUriString(value: string): boolean {
  return /^https?:\/\//.test(value)
}
