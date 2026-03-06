export const TYPE_COLORS = {
  string: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-300 dark:border-emerald-700' },
  number: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-300 dark:border-blue-700' },
  boolean: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-300 dark:border-amber-700' },
  null: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-500 dark:text-gray-400', border: 'border-gray-300 dark:border-gray-700' },
  object: { bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-700 dark:text-violet-400', border: 'border-violet-300 dark:border-violet-700' },
  array: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-400', border: 'border-cyan-300 dark:border-cyan-700' },
} as const

export const MAX_UNDO_STACK = 100

export const CODE_DEBOUNCE_MS = 300

export const SAMPLE_JSON = `{
  "name": "structview",
  "version": "1.0.0",
  "description": "A visual JSON/YAML editor with three synced panels",
  "features": [
    "Tree view with inline editing",
    "Code editor with syntax highlighting",
    "Schema-aware form panel",
    "JSON/YAML format toggle",
    "Full undo/redo history",
    "Keyboard-first navigation"
  ],
  "settings": {
    "theme": "dark",
    "fontSize": 14,
    "autoSave": true,
    "indentSize": 2
  },
  "users": [
    {
      "id": 1,
      "name": "Alice",
      "email": "alice@example.com",
      "active": true
    },
    {
      "id": 2,
      "name": "Bob",
      "email": "bob@example.com",
      "active": false
    }
  ],
  "metadata": null
}`

export type DataFormat = 'json' | 'yaml'
