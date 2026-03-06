import Ajv from 'ajv'
import type { JsonValue } from './types'
import type { ValidationError } from './types'

const ajv = new Ajv({ allErrors: true, verbose: true })

/**
 * Validate data against a JSON Schema.
 * Returns an array of validation errors (empty if valid).
 */
export function validate(data: JsonValue, schema: Record<string, unknown>): ValidationError[] {
  try {
    const valid = ajv.validate(schema, data)
    if (valid) return []

    return (ajv.errors ?? []).map(err => ({
      path: err.instancePath || '/',
      message: err.message ?? 'Validation error',
      keyword: err.keyword,
    }))
  } catch (e) {
    return [{
      path: '/',
      message: `Schema error: ${(e as Error).message}`,
      keyword: 'schema',
    }]
  }
}

/**
 * Check if a given path has validation errors.
 */
export function errorsAtPath(errors: ValidationError[], path: string): ValidationError[] {
  const normalized = path || '/'
  return errors.filter(e => e.path === normalized || e.path.startsWith(normalized + '/'))
}

/**
 * Compile and cache a schema for repeated validation.
 */
export function compileSchema(schema: Record<string, unknown>) {
  try {
    // Remove any previously cached schema
    ajv.removeSchema('structview-schema')
    return ajv.compile({ ...schema, $id: 'structview-schema' })
  } catch {
    return null
  }
}
