import { describe, it, expect } from 'vitest'
import { validate, errorsAtPath } from '@/core/validator'

describe('validate', () => {
  const schema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      age: { type: 'number', minimum: 0 },
    },
    required: ['name'],
  }

  it('returns empty array for valid data', () => {
    const errors = validate({ name: 'Alice', age: 30 }, schema)
    expect(errors).toEqual([])
  })

  it('returns errors for missing required field', () => {
    const errors = validate({ age: 30 }, schema)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].keyword).toBe('required')
  })

  it('returns errors for wrong type', () => {
    const errors = validate({ name: 42 }, schema)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].keyword).toBe('type')
  })

  it('returns errors for constraint violation', () => {
    const errors = validate({ name: 'Alice', age: -1 }, schema)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].keyword).toBe('minimum')
  })

  it('handles invalid schema gracefully', () => {
    const errors = validate({}, { type: 'invalid' as string })
    // Ajv may or may not error; either way should not throw
    expect(Array.isArray(errors)).toBe(true)
  })
})

describe('errorsAtPath', () => {
  const errors = [
    { path: '/name', message: 'should be string', keyword: 'type' },
    { path: '/users/0/age', message: 'should be number', keyword: 'type' },
    { path: '/users/1/age', message: 'should be number', keyword: 'type' },
  ]

  it('filters errors for exact path', () => {
    expect(errorsAtPath(errors, '/name')).toHaveLength(1)
  })

  it('filters errors for parent path', () => {
    expect(errorsAtPath(errors, '/users')).toHaveLength(2)
  })

  it('returns empty for non-matching path', () => {
    expect(errorsAtPath(errors, '/email')).toHaveLength(0)
  })
})
