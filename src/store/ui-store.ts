import { create } from 'zustand'

export type PanelId = 'tree' | 'code' | 'form'
export type Theme = 'light' | 'dark' | 'system'

interface UIState {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  visiblePanels: Set<PanelId>
  focusedPanel: PanelId
  selectedPath: string
  expandedPaths: Set<string>
  searchQuery: string
  showHistory: boolean
  showKeyboardHelp: boolean
  showSchemaDialog: boolean

  // Actions
  setTheme: (theme: Theme) => void
  togglePanel: (panel: PanelId) => void
  setFocusedPanel: (panel: PanelId) => void
  setSelectedPath: (path: string) => void
  toggleExpanded: (path: string) => void
  expandPath: (path: string) => void
  collapsePath: (path: string) => void
  expandAll: () => void
  collapseAll: () => void
  setSearchQuery: (query: string) => void
  setShowHistory: (show: boolean) => void
  setShowKeyboardHelp: (show: boolean) => void
  setShowSchemaDialog: (show: boolean) => void
}

function getResolvedTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return theme
}

function applyTheme(resolved: 'light' | 'dark') {
  document.documentElement.classList.toggle('dark', resolved === 'dark')
}

export const useUIStore = create<UIState>((set, get) => {
  const savedTheme = (localStorage.getItem('structview-theme') as Theme) ?? 'dark'
  const resolved = getResolvedTheme(savedTheme)
  // Apply on load
  setTimeout(() => applyTheme(resolved), 0)

  return {
    theme: savedTheme,
    resolvedTheme: resolved,
    visiblePanels: new Set<PanelId>(['tree', 'code', 'form']),
    focusedPanel: 'tree',
    selectedPath: '',
    expandedPaths: new Set<string>(['']),
    searchQuery: '',
    showHistory: false,
    showKeyboardHelp: false,
    showSchemaDialog: false,

    setTheme: (theme: Theme) => {
      const resolved = getResolvedTheme(theme)
      localStorage.setItem('structview-theme', theme)
      applyTheme(resolved)
      set({ theme, resolvedTheme: resolved })
    },

    togglePanel: (panel: PanelId) => {
      const { visiblePanels } = get()
      const next = new Set(visiblePanels)
      if (next.has(panel)) {
        if (next.size > 1) next.delete(panel) // Keep at least one panel
      } else {
        next.add(panel)
      }
      set({ visiblePanels: next })
    },

    setFocusedPanel: (panel: PanelId) => set({ focusedPanel: panel }),

    setSelectedPath: (path: string) => {
      // Auto-expand parents
      const { expandedPaths } = get()
      const next = new Set(expandedPaths)
      const segments = path.split('/').filter(Boolean)
      let current = ''
      for (const seg of segments) {
        current += '/' + seg
        next.add(current)
      }
      next.add('') // Always expand root
      set({ selectedPath: path, expandedPaths: next })
    },

    toggleExpanded: (path: string) => {
      const { expandedPaths } = get()
      const next = new Set(expandedPaths)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      set({ expandedPaths: next })
    },

    expandPath: (path: string) => {
      const { expandedPaths } = get()
      set({ expandedPaths: new Set([...expandedPaths, path]) })
    },

    collapsePath: (path: string) => {
      const { expandedPaths } = get()
      const next = new Set(expandedPaths)
      next.delete(path)
      set({ expandedPaths: next })
    },

    expandAll: () => {
      // Will be populated by tree traversal
      set({ expandedPaths: new Set<string>(['__all__']) })
    },

    collapseAll: () => {
      set({ expandedPaths: new Set<string>(['']) })
    },

    setSearchQuery: (query: string) => set({ searchQuery: query }),
    setShowHistory: (show: boolean) => set({ showHistory: show }),
    setShowKeyboardHelp: (show: boolean) => set({ showKeyboardHelp: show }),
    setShowSchemaDialog: (show: boolean) => set({ showSchemaDialog: show }),
  }
})
