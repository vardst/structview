import { describe, it, expect } from 'vitest'
import { encodeToUrl, decodeFromUrl } from '@/lib/url-codec'

describe('URL codec', () => {
  it('round-trips JSON content', () => {
    const content = '{"name": "test", "value": 42}'
    const encoded = encodeToUrl(content, 'json')
    const decoded = decodeFromUrl(encoded)
    expect(decoded).not.toBeNull()
    expect(decoded!.content).toBe(content)
    expect(decoded!.format).toBe('json')
  })

  it('round-trips YAML content', () => {
    const content = 'name: test\nvalue: 42'
    const encoded = encodeToUrl(content, 'yaml')
    const decoded = decodeFromUrl(encoded)
    expect(decoded).not.toBeNull()
    expect(decoded!.content).toBe(content)
    expect(decoded!.format).toBe('yaml')
  })

  it('handles empty string', () => {
    const result = decodeFromUrl('')
    expect(result).toBeNull()
  })

  it('handles invalid input', () => {
    const result = decodeFromUrl('not-valid-compressed-data')
    expect(result).toBeNull()
  })

  it('compresses large content', () => {
    const content = JSON.stringify(Array.from({ length: 100 }, (_, i) => ({ id: i, name: `item_${i}` })))
    const encoded = encodeToUrl(content, 'json')
    // Compressed should be shorter than raw content (base64 of content)
    expect(encoded.length).toBeLessThan(content.length)
  })
})
