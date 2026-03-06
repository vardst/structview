import { describe, it, expect } from 'vitest'
import { describeChange, describeRename, describeDuplicate, describeAddChild, describeFormatChange } from '@/core/diff'

describe('describeChange', () => {
  it('describes addition', () => {
    const desc = describeChange('/name', undefined, 'Alice')
    expect(desc).toContain('Added')
    expect(desc).toContain('/name')
  })

  it('describes deletion', () => {
    const desc = describeChange('/name', 'Alice', undefined)
    expect(desc).toContain('Deleted')
    expect(desc).toContain('/name')
  })

  it('describes value change', () => {
    const desc = describeChange('/name', 'Alice', 'Bob')
    expect(desc).toContain('Changed')
    expect(desc).toContain('Alice')
    expect(desc).toContain('Bob')
  })

  it('describes type change', () => {
    const desc = describeChange('/value', 'hello', 42)
    expect(desc).toContain('type')
  })

  it('uses custom action', () => {
    const desc = describeChange('/x', 1, 2, 'Custom action')
    expect(desc).toBe('Custom action')
  })

  it('handles root path', () => {
    const desc = describeChange('', 1, 2)
    expect(desc).toContain('(root)')
  })
})

describe('describeRename', () => {
  it('describes key rename', () => {
    const desc = describeRename('/parent', 'old', 'new')
    expect(desc).toContain('Renamed')
    expect(desc).toContain('old')
    expect(desc).toContain('new')
  })
})

describe('describeDuplicate', () => {
  it('describes duplication', () => {
    const desc = describeDuplicate('/items/0')
    expect(desc).toContain('Duplicated')
  })
})

describe('describeAddChild', () => {
  it('describes adding to array', () => {
    const desc = describeAddChild('/items')
    expect(desc).toContain('Added')
  })

  it('describes adding key to object', () => {
    const desc = describeAddChild('/config', 'newKey')
    expect(desc).toContain('newKey')
  })
})

describe('describeFormatChange', () => {
  it('describes format change', () => {
    const desc = describeFormatChange('json', 'yaml')
    expect(desc).toContain('JSON')
    expect(desc).toContain('YAML')
  })
})
