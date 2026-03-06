import type { JsonValue, JsonObject, JsonArray } from './types'

/**
 * Convert a JSON Pointer string (e.g. "/users/0/name") to path segments.
 */
export function pointerToSegments(pointer: string): string[] {
  if (!pointer || pointer === '/') return []
  return pointer
    .split('/')
    .slice(1)
    .map(s => s.replace(/~1/g, '/').replace(/~0/g, '~'))
}

/**
 * Convert path segments to a JSON Pointer string.
 */
export function segmentsToPointer(segments: string[]): string {
  if (segments.length === 0) return ''
  return '/' + segments.map(s => s.replace(/~/g, '~0').replace(/\//g, '~1')).join('/')
}

/**
 * Get a value at a JSON Pointer path (immutable).
 */
export function getAtPath(root: JsonValue, pointer: string): JsonValue | undefined {
  if (!pointer || pointer === '') return root
  const segments = pointerToSegments(pointer)
  let current: JsonValue = root
  for (const seg of segments) {
    if (current === null || typeof current !== 'object') return undefined
    if (Array.isArray(current)) {
      const idx = parseInt(seg, 10)
      if (isNaN(idx) || idx < 0 || idx >= current.length) return undefined
      current = current[idx]
    } else {
      if (!(seg in current)) return undefined
      current = current[seg]
    }
  }
  return current
}

/**
 * Set a value at a JSON Pointer path (immutable — returns new root).
 */
export function setAtPath(root: JsonValue, pointer: string, value: JsonValue): JsonValue {
  if (!pointer || pointer === '') return value
  const segments = pointerToSegments(pointer)
  return setRecursive(root, segments, 0, value)
}

function setRecursive(current: JsonValue, segments: string[], idx: number, value: JsonValue): JsonValue {
  const seg = segments[idx]
  if (idx === segments.length - 1) {
    // Leaf — set value
    if (Array.isArray(current)) {
      const i = parseInt(seg, 10)
      const copy = [...current]
      copy[i] = value
      return copy
    }
    if (current !== null && typeof current === 'object') {
      return { ...current, [seg]: value }
    }
    return current
  }
  // Recurse
  if (Array.isArray(current)) {
    const i = parseInt(seg, 10)
    const copy = [...current]
    copy[i] = setRecursive(current[i], segments, idx + 1, value)
    return copy
  }
  if (current !== null && typeof current === 'object') {
    return {
      ...current,
      [seg]: setRecursive(current[seg], segments, idx + 1, value),
    }
  }
  return current
}

/**
 * Delete a value at a JSON Pointer path (immutable — returns new root).
 */
export function deleteAtPath(root: JsonValue, pointer: string): JsonValue {
  if (!pointer || pointer === '') return null
  const segments = pointerToSegments(pointer)
  return deleteRecursive(root, segments, 0)
}

function deleteRecursive(current: JsonValue, segments: string[], idx: number): JsonValue {
  const seg = segments[idx]
  if (idx === segments.length - 1) {
    if (Array.isArray(current)) {
      const i = parseInt(seg, 10)
      return current.filter((_, j) => j !== i)
    }
    if (current !== null && typeof current === 'object') {
      const copy = { ...current }
      delete copy[seg]
      return copy
    }
    return current
  }
  if (Array.isArray(current)) {
    const i = parseInt(seg, 10)
    const copy = [...current]
    copy[i] = deleteRecursive(current[i], segments, idx + 1)
    return copy
  }
  if (current !== null && typeof current === 'object') {
    return {
      ...current,
      [seg]: deleteRecursive(current[seg], segments, idx + 1),
    }
  }
  return current
}

/**
 * Insert a value into an array at a given index (immutable).
 */
export function insertAtPath(root: JsonValue, pointer: string, value: JsonValue): JsonValue {
  const segments = pointerToSegments(pointer)
  if (segments.length === 0) return root
  const parentPointer = segmentsToPointer(segments.slice(0, -1))
  const parent = getAtPath(root, parentPointer)
  if (!Array.isArray(parent)) return root
  const idx = parseInt(segments[segments.length - 1], 10)
  const newArray = [...parent]
  newArray.splice(idx, 0, value)
  return setAtPath(root, parentPointer, newArray)
}

/**
 * Rename a key in an object (immutable, preserves order).
 */
export function renameKey(root: JsonValue, pointer: string, newKey: string): JsonValue {
  const segments = pointerToSegments(pointer)
  if (segments.length === 0) return root
  const parentPointer = segmentsToPointer(segments.slice(0, -1))
  const parent = getAtPath(root, parentPointer)
  if (parent === null || typeof parent !== 'object' || Array.isArray(parent)) return root
  const oldKey = segments[segments.length - 1]
  if (oldKey === newKey) return root
  if (newKey in parent) return root // Key already exists
  const entries = Object.entries(parent).map(([k, v]) =>
    k === oldKey ? [newKey, v] as const : [k, v] as const
  )
  return setAtPath(root, parentPointer, Object.fromEntries(entries) as JsonObject)
}

/**
 * Duplicate a node (for arrays: insert copy after; for objects: insert with "_copy" suffix).
 */
export function duplicateAtPath(root: JsonValue, pointer: string): JsonValue {
  const segments = pointerToSegments(pointer)
  if (segments.length === 0) return root
  const value = getAtPath(root, pointer)
  if (value === undefined) return root
  const parentPointer = segmentsToPointer(segments.slice(0, -1))
  const parent = getAtPath(root, parentPointer)
  const cloned = structuredClone(value)
  if (Array.isArray(parent)) {
    const idx = parseInt(segments[segments.length - 1], 10)
    const newArray = [...parent]
    newArray.splice(idx + 1, 0, cloned)
    return setAtPath(root, parentPointer, newArray)
  }
  if (parent !== null && typeof parent === 'object') {
    const key = segments[segments.length - 1]
    let newKey = key + '_copy'
    let i = 2
    while (newKey in parent) {
      newKey = `${key}_copy${i}`
      i++
    }
    const entries = Object.entries(parent)
    const insertIdx = entries.findIndex(([k]) => k === key) + 1
    entries.splice(insertIdx, 0, [newKey, cloned])
    return setAtPath(root, parentPointer, Object.fromEntries(entries) as JsonObject)
  }
  return root
}

/**
 * Add a new child to an object or array.
 */
export function addChild(root: JsonValue, pointer: string, key?: string): JsonValue {
  const target = getAtPath(root, pointer === '' ? '' : pointer)
  if (Array.isArray(target)) {
    const newArray: JsonArray = [...target, '']
    return setAtPath(root, pointer, newArray)
  }
  if (target !== null && typeof target === 'object') {
    const obj = target as JsonObject
    let newKey = key ?? 'newKey'
    let i = 2
    while (newKey in obj) {
      newKey = `${key ?? 'newKey'}${i}`
      i++
    }
    return setAtPath(root, pointer, { ...obj, [newKey]: '' })
  }
  return root
}

/**
 * Get the parent pointer from a pointer.
 */
export function parentPointer(pointer: string): string {
  const segments = pointerToSegments(pointer)
  if (segments.length === 0) return ''
  return segmentsToPointer(segments.slice(0, -1))
}

/**
 * Get the last segment (key or index) from a pointer.
 */
export function lastSegment(pointer: string): string {
  const segments = pointerToSegments(pointer)
  return segments[segments.length - 1] ?? ''
}
