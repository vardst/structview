import { describe, it, expect } from 'vitest'
import { inferSchema } from '@/core/schema-inference'

describe('inferSchema', () => {
  it('infers string type', () => {
    expect(inferSchema('hello')).toEqual({ type: 'string' })
  })

  it('infers integer type', () => {
    expect(inferSchema(42)).toEqual({ type: 'integer' })
  })

  it('infers number type for floats', () => {
    expect(inferSchema(3.14)).toEqual({ type: 'number' })
  })

  it('infers boolean type', () => {
    expect(inferSchema(true)).toEqual({ type: 'boolean' })
  })

  it('infers null type', () => {
    expect(inferSchema(null)).toEqual({ type: 'null' })
  })

  it('infers empty array', () => {
    expect(inferSchema([])).toEqual({ type: 'array', items: {} })
  })

  it('infers array of strings', () => {
    const schema = inferSchema(['a', 'b', 'c'])
    expect(schema.type).toBe('array')
  })

  it('infers object schema', () => {
    const schema = inferSchema({ name: 'Alice', age: 30 })
    expect(schema.type).toBe('object')
    expect(schema.properties).toBeDefined()
    expect(schema.properties!.name).toEqual({ type: 'string' })
    expect(schema.properties!.age).toEqual({ type: 'integer' })
  })

  it('detects email format', () => {
    const schema = inferSchema('alice@example.com')
    expect(schema.format).toBe('email')
  })

  it('detects date format', () => {
    const schema = inferSchema('2024-01-15T10:30:00')
    expect(schema.format).toBe('date-time')
  })

  it('detects URI format', () => {
    const schema = inferSchema('https://example.com')
    expect(schema.format).toBe('uri')
  })

  it('infers nested objects', () => {
    const schema = inferSchema({
      user: { name: 'Alice', active: true },
    })
    expect(schema.type).toBe('object')
    expect(schema.properties!.user.type).toBe('object')
  })

  it('includes required fields', () => {
    const schema = inferSchema({ a: 1, b: 'test' })
    expect(schema.required).toContain('a')
    expect(schema.required).toContain('b')
  })
})
