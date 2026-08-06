'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface CommandPaletteProps {
  onClose: () => void
  onGenerate: (prompt: string) => void
  canvasTitle?: string
}

const COMMANDS = [
  { id: 'generate', icon: '✦', label: 'Generate canvas from prompt', action: 'generate' },
  { id: 'dashboard', icon: '🏠', label: 'Go to Dashboard', action: 'nav:/dashboard' },
  { id: 'export-md', icon: '📄', label: 'Export as Markdown', action: 'export:markdown' },
  { id: 'export-json', icon: '📦', label: 'Export as JSON', action: 'export:json' },
  { id: 'fit', icon: '🔍', label: 'Fit canvas to view', action: 'fit' },
  { id: 'new-canvas', icon: '➕', label: 'Create new canvas', action: 'nav:/dashboard' },
]

export default function CommandPalette({ onClose, onGenerate, canvasTitle }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const [showPromptInput, setShowPromptInput] = useState(false)
  const [prompt, setPrompt] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => { inputRef.current?.focus() }, [])

  const filtered = COMMANDS.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))

  const handleSelect = (cmd: typeof COMMANDS[0]) => {
    if (cmd.action === 'generate') {
      setShowPromptInput(true)
      return
    }
    if (cmd.action.startsWith('nav:')) {
      router.push(cmd.action.slice(4))
      onClose()
      return
    }
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') setSelected((s) => Math.min(s + 1, filtered.length - 1))
    if (e.key === 'ArrowUp') setSelected((s) => Math.max(s - 1, 0))
    if (e.key === 'Enter') { filtered[selected] && handleSelect(filtered[selected]) }
    if (e.key === 'Escape') onClose()
  }

  const handleGenerate = () => {
    if (prompt.trim()) {
      onGenerate(prompt.trim())
      onClose()
    }
  }

  return (
    <div className="cmd-palette-overlay" onClick={onClose}>
      <div className="cmd-palette" onClick={(e) => e.stopPropagation()}>
        {!showPromptInput ? (
          <>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 16 }}>⌘</span>
              <input
                ref={inputRef}
                type="text"
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'white', fontSize: 15 }}
                placeholder="Search commands..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelected(0) }}
                onKeyDown={handleKeyDown}
              />
              <kbd style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>ESC</kbd>
            </div>
            <div style={{ maxHeight: 360, overflowY: 'auto' }}>
              {filtered.map((cmd, i) => (
                <button
                  key={cmd.id}
                  onClick={() => handleSelect(cmd)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '11px 16px',
                    background: i === selected ? 'rgba(99,102,241,0.15)' : 'transparent',
                    border: 'none', textAlign: 'left', cursor: 'pointer', color: 'rgba(255,255,255,0.8)', fontSize: 14,
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={() => setSelected(i)}
                >
                  <span style={{ fontSize: 16, width: 22, textAlign: 'center' }}>{cmd.icon}</span>
                  {cmd.label}
                </button>
              ))}
              {filtered.length === 0 && (
                <div style={{ padding: '32px 16px', textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>No commands found</div>
              )}
            </div>
          </>
        ) : (
          <div style={{ padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>✦ Generate Canvas from Prompt</div>
            <input
              autoFocus
              type="text"
              className="input"
              style={{ marginBottom: 12 }}
              placeholder="Describe your idea..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleGenerate(); if (e.key === 'Escape') setShowPromptInput(false) }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowPromptInput(false)} className="btn-secondary" style={{ flex: 1 }}>Back</button>
              <button onClick={handleGenerate} className="btn-primary" style={{ flex: 2 }}>Generate →</button>
            </div>
          </div>
        )}
        <div style={{ padding: '8px 16px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 16, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>ESC Close</span>
        </div>
      </div>
    </div>
  )
}
