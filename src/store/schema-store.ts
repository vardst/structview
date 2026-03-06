import { create } from 'zustand'
import type { ValidationError } from '@/core/types'
import { validate } from '@/core/validator'
import { inferSchema } from '@/core/schema-inference'
import type { JsonValue } from '@/core/types'

interface SchemaState {
  schema: Record<string, unknown> | null
  errors: ValidationError[]
  schemaSource: 'none' | 'loaded' | 'inferred'

  // Actions
  loadSchema: (schema: Record<string, unknown>) => void
  inferFromData: (data: JsonValue) => void
  clearSchema: () => void
  validateData: (data: JsonValue) => void
}

export const useSchemaStore = create<SchemaState>((set, get) => ({
  schema: null,
  errors: [],
  schemaSource: 'none',

  loadSchema: (schema: Record<string, unknown>) => {
    set({ schema, schemaSource: 'loaded', errors: [] })
  },

  inferFromData: (data: JsonValue) => {
    const schema = inferSchema(data) as Record<string, unknown>
    set({ schema, schemaSource: 'inferred', errors: [] })
  },

  clearSchema: () => {
    set({ schema: null, errors: [], schemaSource: 'none' })
  },

  validateData: (data: JsonValue) => {
    const { schema } = get()
    if (!schema) {
      set({ errors: [] })
      return
    }
    const errors = validate(data, schema)
    set({ errors })
  },
}))
