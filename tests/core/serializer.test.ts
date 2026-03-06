import { describe, it, expect } from 'vitest'
import { toJSON, toYAML, serialize } from '@/core/serializer'

describe('toJSON', () => {
  it('serializes object with indent', () => {
    const result = toJSON({ a: 1, b: 'hello' })
    expect(JSON.parse(result)).toEqual({ a: 1, b: 'hello' })
    expect(result).toContain('\n')
  })

  it('serializes array', () => {
    expect(JSON.parse(toJSON([1, 2, 3]))).toEqual([1, 2, 3])
  })

  it('serializes null', () => {
    expect(toJSON(null)).toBe('null')
  })

  it('respects custom indent', () => {
    const result = toJSON({ a: 1 }, 4)
    expect(result).toContain('    ')
  })
})

describe('toYAML', () => {
  it('serializes object', () => {
    const result = toYAML({ name: 'test', value: 42 })
    expect(result).toContain('name: test')
    expect(result).toContain('value: 42')
  })

  it('serializes array', () => {
    const result = toYAML([1, 2, 3])
    expect(result).toContain('- 1')
    expect(result).toContain('- 2')
    expect(result).toContain('- 3')
  })
})

describe('serialize', () => {
  it('uses JSON for json format', () => {
    const result = serialize({ a: 1 }, 'json')
    expect(result.trim().startsWith('{')).toBe(true)
  })

  it('uses YAML for yaml format', () => {
    const result = serialize({ a: 1 }, 'yaml')
    expect(result).toContain('a: 1')
  })
})
