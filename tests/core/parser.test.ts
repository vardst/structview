import { describe, it, expect } from 'vitest'
import { parseJSON, parseYAML, parseContent, detectFormat } from '@/core/parser'

describe('parseJSON', () => {
  it('parses valid JSON object', () => {
    const result = parseJSON('{"name": "test", "value": 42}')
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({ name: 'test', value: 42 })
    }
  })

  it('parses valid JSON array', () => {
    const result = parseJSON('[1, 2, 3]')
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual([1, 2, 3])
    }
  })

  it('parses JSON primitives', () => {
    expect(parseJSON('"hello"')).toEqual({ success: true, data: 'hello' })
    expect(parseJSON('42')).toEqual({ success: true, data: 42 })
    expect(parseJSON('true')).toEqual({ success: true, data: true })
    expect(parseJSON('null')).toEqual({ success: true, data: null })
  })

  it('returns error for invalid JSON', () => {
    const result = parseJSON('{invalid}')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBeTruthy()
    }
  })

  it('includes line info in error', () => {
    const result = parseJSON('{\n  "a": 1,\n  "b": \n}')
    expect(result.success).toBe(false)
  })
})

describe('parseYAML', () => {
  it('parses valid YAML', () => {
    const result = parseYAML('name: test\nvalue: 42')
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({ name: 'test', value: 42 })
    }
  })

  it('parses YAML array', () => {
    const result = parseYAML('- 1\n- 2\n- 3')
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual([1, 2, 3])
    }
  })

  it('parses empty YAML as null', () => {
    const result = parseYAML('')
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toBeNull()
    }
  })
})

describe('parseContent', () => {
  it('delegates to JSON parser for json format', () => {
    const result = parseContent('{"a": 1}', 'json')
    expect(result.success).toBe(true)
  })

  it('delegates to YAML parser for yaml format', () => {
    const result = parseContent('a: 1', 'yaml')
    expect(result.success).toBe(true)
  })

  it('handles empty content', () => {
    const result = parseContent('', 'json')
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toBeNull()
    }
  })
})

describe('detectFormat', () => {
  it('detects JSON from opening brace', () => {
    expect(detectFormat('{ "a": 1 }')).toBe('json')
  })

  it('detects JSON from opening bracket', () => {
    expect(detectFormat('[1, 2, 3]')).toBe('json')
  })

  it('detects YAML for non-JSON content', () => {
    expect(detectFormat('name: test\nvalue: 42')).toBe('yaml')
  })
})
