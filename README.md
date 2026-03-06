# StructView

[![CI](https://github.com/vardst/structview/actions/workflows/ci.yml/badge.svg)](https://github.com/vardst/structview/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A visual JSON/YAML editor with three synced panels — tree view, code editor, and schema-aware form — designed for power users who think in structured data.

**[Live Demo](https://vardst.github.io/structview/)** | **[GitHub](https://github.com/vardst/structview)**

## Features

- **Three synced panels** — Tree, Code (CodeMirror 6), and Form panels stay in sync. Edit in any panel; changes propagate instantly.
- **JSON/YAML toggle** — Switch formats with one click. Your data is preserved perfectly.
- **Keyboard-first UX** — Ctrl+Z/Y undo/redo, Ctrl+1/2/3 panel focus, Delete/Ctrl+D for tree ops, `?` for shortcut reference.
- **Schema validation** — Load or auto-infer JSON Schema. Validation errors appear in all three panels.
- **Full undo/redo** — Human-readable change log with per-change descriptions ("Changed /users/0/name from 'Bob' to 'Alice'").
- **Import/export** — Drag-drop files, paste from clipboard, download as JSON or YAML.
- **URL sharing** — Compress documents into shareable URL hashes via LZ-string.
- **Dark/light/system themes** — Persisted to localStorage.
- **Type-colored tree** — String (emerald), number (blue), boolean (amber), null (gray), object (violet), array (cyan).

## Quick Start

```bash
git clone https://github.com/vardst/structview.git
cd structview
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173).

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm test` | Run unit tests (90 tests) |
| `pnpm test:watch` | Tests in watch mode |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript check |

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS v4 |
| Code Editor | CodeMirror 6 |
| YAML | `yaml` v2 |
| Validation | Ajv 8 (JSON Schema Draft 2020-12) |
| State | Zustand |
| URL Sharing | lz-string |
| Testing | Vitest |

## Architecture

```
              Document Store (Zustand)
              ─────────────────────────
              content: string    (raw text)
              parsed: object     (JS object)
              selectedPath: string
              undoStack / redoStack

     ┌──────────────┼──────────────┐
     ▼              ▼              ▼
 Tree Panel    Code Panel     Form Panel
 reads parsed  reads content  reads parsed +
 writes via    writes via     selectedPath
 updateAtPath  setContent     writes via
               (debounced)    updateAtPath
```

## Project Structure

```
src/
├── core/           # Pure logic (no React, fully testable)
│   ├── types.ts
│   ├── parser.ts
│   ├── serializer.ts
│   ├── path-utils.ts
│   ├── diff.ts
│   ├── schema-inference.ts
│   └── validator.ts
├── store/          # Zustand stores
│   ├── document-store.ts
│   ├── ui-store.ts
│   └── schema-store.ts
├── hooks/          # React hooks
├── panels/         # Tree, Code, Form panels
├── ui/             # Toolbar, status bar, dialogs
└── lib/            # Utilities
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `?` | Show keyboard help |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |
| `Ctrl+1/2/3` | Focus Tree/Code/Form |
| `Ctrl+H` | Toggle history |
| `Ctrl+Shift+F` | Toggle JSON/YAML |
| `Delete` | Delete selected node |
| `Ctrl+D` | Duplicate selected node |
| `Double-click` | Edit value in tree |

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Commit your changes
4. Push and open a PR

## License

[MIT](LICENSE)
