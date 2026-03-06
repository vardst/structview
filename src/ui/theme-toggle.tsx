import { useUIStore } from '@/store/ui-store'
import { Sun, Moon, Monitor } from 'lucide-react'

export function ThemeToggle() {
  const theme = useUIStore(s => s.theme)
  const setTheme = useUIStore(s => s.setTheme)

  const next = () => {
    if (theme === 'light') setTheme('dark')
    else if (theme === 'dark') setTheme('system')
    else setTheme('light')
  }

  return (
    <button
      className="flex items-center gap-1 h-7 px-2 text-xs rounded hover:bg-accent text-foreground transition-colors"
      onClick={next}
      title={`Theme: ${theme}`}
    >
      {theme === 'light' && <Sun className="w-3.5 h-3.5" />}
      {theme === 'dark' && <Moon className="w-3.5 h-3.5" />}
      {theme === 'system' && <Monitor className="w-3.5 h-3.5" />}
    </button>
  )
}
