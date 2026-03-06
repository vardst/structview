import { useUIStore } from '@/store/ui-store'
import { X } from 'lucide-react'

const shortcuts = [
  { category: 'General', items: [
    { keys: '?', description: 'Show keyboard shortcuts' },
    { keys: 'Ctrl+Z', description: 'Undo' },
    { keys: 'Ctrl+Shift+Z', description: 'Redo' },
    { keys: 'Ctrl+H', description: 'Toggle history panel' },
    { keys: 'Ctrl+Shift+F', description: 'Toggle JSON/YAML format' },
  ]},
  { category: 'Panels', items: [
    { keys: 'Ctrl+1', description: 'Focus tree panel' },
    { keys: 'Ctrl+2', description: 'Focus code panel' },
    { keys: 'Ctrl+3', description: 'Focus form panel' },
  ]},
  { category: 'Tree', items: [
    { keys: 'Double-click', description: 'Edit value' },
    { keys: 'Delete', description: 'Delete selected node' },
    { keys: 'Ctrl+D', description: 'Duplicate selected node' },
    { keys: 'Enter', description: 'Confirm edit' },
    { keys: 'Escape', description: 'Cancel edit' },
  ]},
]

export function KeyboardHelp() {
  const show = useUIStore(s => s.showKeyboardHelp)
  const setShow = useUIStore(s => s.setShowKeyboardHelp)

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => setShow(false)} />
      <div className="relative bg-card border border-border rounded-lg shadow-xl w-[420px] max-h-[70vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card">
          <h2 className="text-sm font-semibold text-foreground">Keyboard Shortcuts</h2>
          <button className="p-1 hover:bg-accent rounded" onClick={() => setShow(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          {shortcuts.map(section => (
            <div key={section.category}>
              <h3 className="text-xs font-medium text-muted-foreground mb-2">
                {section.category}
              </h3>
              <div className="space-y-1.5">
                {section.items.map(item => (
                  <div key={item.keys} className="flex items-center justify-between">
                    <span className="text-xs text-foreground">{item.description}</span>
                    <kbd className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded border border-border">
                      {item.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
