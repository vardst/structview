import type { JsonValue } from './types'
import { getNodeType, getNodePreview } from './types'

/**
 * Generate a human-readable description of what changed.
 */
export function describeChange(
  path: string,
  oldValue: JsonValue | undefined,
  newValue: JsonValue | undefined,
  action?: string
): string {
  const displayPath = path || '(root)'

  if (action) return action

  if (oldValue === undefined && newValue !== undefined) {
    return `Added ${displayPath} = ${getNodePreview(newValue, 40)}`
  }

  if (oldValue !== undefined && newValue === undefined) {
    return `Deleted ${displayPath}`
  }

  if (oldValue !== undefined && newValue !== undefined) {
    const oldType = getNodeType(oldValue)
    const newType = getNodeType(newValue)
    if (oldType !== newType) {
      return `Changed type of ${displayPath} from ${oldType} to ${newType}`
    }
    if (typeof oldValue !== 'object' || oldValue === null) {
      return `Changed ${displayPath} from ${getNodePreview(oldValue, 30)} to ${getNodePreview(newValue, 30)}`
    }
    return `Updated ${displayPath}`
  }

  return `Modified ${displayPath}`
}

/**
 * Create a description for a rename operation.
 */
export function describeRename(path: string, oldKey: string, newKey: string): string {
  return `Renamed key "${oldKey}" to "${newKey}" at ${path || '(root)'}`
}

/**
 * Create a description for a duplicate operation.
 */
export function describeDuplicate(path: string): string {
  return `Duplicated ${path || '(root)'}`
}

/**
 * Create a description for adding a child.
 */
export function describeAddChild(path: string, key?: string): string {
  if (key) return `Added key "${key}" to ${path || '(root)'}`
  return `Added item to ${path || '(root)'}`
}

/**
 * Create a description for format change.
 */
export function describeFormatChange(from: string, to: string): string {
  return `Converted format from ${from.toUpperCase()} to ${to.toUpperCase()}`
}
