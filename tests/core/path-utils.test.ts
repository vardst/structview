import { describe, it, expect } from 'vitest'
import {
  pointerToSegments, segmentsToPointer,
  getAtPath, setAtPath, deleteAtPath,
  insertAtPath, renameKey, duplicateAtPath, addChild,
  parentPointer, lastSegment,
} from '@/core/path-utils'

describe('pointerToSegments', () => {
  it('handles empty pointer', () => {
    expect(pointerToSegments('')).toEqual([])
  })

  it('handles root pointer', () => {
    expect(pointerToSegments('/')).toEqual([])
  })

  it('splits simple path', () => {
    expect(pointerToSegments('/users/0/name')).toEqual(['users', '0', 'name'])
  })

  it('handles escaped characters', () => {
    expect(pointerToSegments('/a~1b/c~0d')).toEqual(['a/b', 'c~d'])
  })
})

describe('segmentsToPointer', () => {
  it('handles empty segments', () => {
    expect(segmentsToPointer([])).toBe('')
  })

  it('joins segments', () => {
    expect(segmentsToPointer(['users', '0', 'name'])).toBe('/users/0/name')
  })

  it('escapes special characters', () => {
    expect(segmentsToPointer(['a/b', 'c~d'])).toBe('/a~1b/c~0d')
  })
})

describe('getAtPath', () => {
  const data = { users: [{ name: 'Alice' }, { name: 'Bob' }], count: 2 }

  it('gets root', () => {
    expect(getAtPath(data, '')).toBe(data)
  })

  it('gets nested object value', () => {
    expect(getAtPath(data, '/count')).toBe(2)
  })

  it('gets array element', () => {
    expect(getAtPath(data, '/users/0')).toEqual({ name: 'Alice' })
  })

  it('gets deep nested value', () => {
    expect(getAtPath(data, '/users/1/name')).toBe('Bob')
  })

  it('returns undefined for missing path', () => {
    expect(getAtPath(data, '/missing')).toBeUndefined()
  })
})

describe('setAtPath', () => {
  it('sets root value', () => {
    expect(setAtPath({ a: 1 }, '', { b: 2 })).toEqual({ b: 2 })
  })

  it('sets nested value', () => {
    const result = setAtPath({ a: { b: 1 } }, '/a/b', 2)
    expect(result).toEqual({ a: { b: 2 } })
  })

  it('is immutable', () => {
    const original = { a: { b: 1 } }
    const result = setAtPath(original, '/a/b', 2)
    expect(original.a.b).toBe(1)
    expect(result).not.toBe(original)
  })

  it('sets array element', () => {
    const result = setAtPath([1, 2, 3], '/1', 99)
    expect(result).toEqual([1, 99, 3])
  })
})

describe('deleteAtPath', () => {
  it('deletes object key', () => {
    const result = deleteAtPath({ a: 1, b: 2 }, '/a')
    expect(result).toEqual({ b: 2 })
  })

  it('deletes array element', () => {
    const result = deleteAtPath([1, 2, 3], '/1')
    expect(result).toEqual([1, 3])
  })

  it('deletes root returns null', () => {
    expect(deleteAtPath({ a: 1 }, '')).toBeNull()
  })

  it('is immutable', () => {
    const original = { a: 1, b: 2 }
    deleteAtPath(original, '/a')
    expect(original).toEqual({ a: 1, b: 2 })
  })
})

describe('insertAtPath', () => {
  it('inserts into array', () => {
    const result = insertAtPath([1, 2, 3], '/1', 99)
    expect(result).toEqual([1, 99, 2, 3])
  })
})

describe('renameKey', () => {
  it('renames object key preserving order', () => {
    const result = renameKey({ a: 1, b: 2, c: 3 }, '/b', 'x')
    expect(Object.keys(result as Record<string, unknown>)).toEqual(['a', 'x', 'c'])
    expect((result as Record<string, unknown>).x).toBe(2)
  })

  it('does nothing if key already exists', () => {
    const data = { a: 1, b: 2 }
    const result = renameKey(data, '/a', 'b')
    expect(result).toEqual(data)
  })
})

describe('duplicateAtPath', () => {
  it('duplicates array element', () => {
    const result = duplicateAtPath([1, 2, 3], '/1') as number[]
    expect(result).toEqual([1, 2, 2, 3])
  })

  it('duplicates object key with suffix', () => {
    const result = duplicateAtPath({ a: 1, b: 2 }, '/a') as Record<string, number>
    expect(Object.keys(result)).toEqual(['a', 'a_copy', 'b'])
    expect(result.a_copy).toBe(1)
  })
})

describe('addChild', () => {
  it('adds to array', () => {
    expect(addChild([1, 2], '')).toEqual([1, 2, ''])
  })

  it('adds to object', () => {
    const result = addChild({ a: 1 }, '') as Record<string, unknown>
    expect(result.a).toBe(1)
    expect('newKey' in result).toBe(true)
  })

  it('adds with custom key name', () => {
    const result = addChild({ a: 1 }, '', 'myKey') as Record<string, unknown>
    expect('myKey' in result).toBe(true)
  })
})

describe('parentPointer', () => {
  it('returns empty for root', () => {
    expect(parentPointer('')).toBe('')
  })

  it('returns parent', () => {
    expect(parentPointer('/a/b/c')).toBe('/a/b')
  })
})

describe('lastSegment', () => {
  it('returns last segment', () => {
    expect(lastSegment('/a/b/c')).toBe('c')
  })
})
