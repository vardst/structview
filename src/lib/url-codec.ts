import LZString from 'lz-string'
import type { DataFormat } from './constants'

export function encodeToUrl(content: string, format: DataFormat): string {
  const payload = JSON.stringify({ f: format, c: content })
  const compressed = LZString.compressToEncodedURIComponent(payload)
  return compressed
}

export function decodeFromUrl(hash: string): { content: string; format: DataFormat } | null {
  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(hash)
    if (!decompressed) return null
    const parsed = JSON.parse(decompressed)
    if (typeof parsed.c !== 'string') return null
    return {
      content: parsed.c,
      format: parsed.f === 'yaml' ? 'yaml' : 'json',
    }
  } catch {
    return null
  }
}
