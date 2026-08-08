'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface CommandPaletteProps {
  onClose: () => void
  onGenerate: (prompt: string) => void
  canvasTitle?: string
}

const COMMANDS = [
  { id: 'generate', icon: '✦', label: 'Generate new canvas from prompt', action: 'generate' },
  { id: 'dashboard', icon: '✦', label: 'Go to Dashboard workspace', action: 'nav:/dashboard' },
  { id: 'export-md', icon: '✦', label: 'Export canvas as Markdown report', action: 'export:markdown' },
  { id: 'export-json', icon: '✦', label: 'Export canvas as JSON backup', action: 'export:json' },
  { id: 'fit', icon: '✦', label: 'Zoom & fit canvas view', action: 'fit' },
  { id: 'new-canvas', icon: '✦', label: 'Create fresh canvas', action: 'nav:/dashboard' },
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
              <span style={{ color: '#818cf8', fontSize: 14, fontWeight: 700 }}>⌘</span>
              <input
                ref={inputRef}
                type="text"
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'white', fontSize: 14, fontFamily: 'inherit' }}
                placeholder="Type a command or search..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelected(0) }}
                onKeyDown={handleKeyDown}
              />
              <kbd style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, fontSize: 10.5, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>ESC</kbd>
            </div>
            <div style={{ maxHeight: 340, overflowY: 'auto' }}>
              {filtered.map((cmd, i) => (
                <button
                  key={cmd.id}
                  onClick={() => handleSelect(cmd)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '11px 16px',
                    background: i === selected ? 'rgba(99,102,241,0.15)' : 'transparent',
                    border: 'none', textAlign: 'left', cursor: 'pointer', color: 'rgba(255,255,255,0.85)', fontSize: 13.5,
                    transition: 'background 0.1s', fontFamily: 'inherit',
                  }}
                  onMouseEnter={() => setSelected(i)}
                >
                  <span style={{ fontSize: 14, width: 20, textAlign: 'center', color: '#818cf8' }}>{cmd.icon}</span>
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
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'white' }}>✦ Generate Canvas from Prompt</div>
            <input
              autoFocus
              type="text"
              className="input"
              style={{ marginBottom: 12, width: '100%', padding: '11px 14px', borderRadius: 9, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 13.5, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
              placeholder="Describe your startup or product idea..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleGenerate(); if (e.key === 'Escape') setShowPromptInput(false) }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowPromptInput(false)} style={{ flex: 1, padding: '9px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontSize: 12.5, cursor: 'pointer', fontFamily: 'inherit' }}>Back</button>
              <button onClick={handleGenerate} style={{ flex: 2, padding: '9px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#6366f1,#7c3aed)', color: 'white', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Generate →</button>
            </div>
          </div>
        )}
        <div style={{ padding: '8px 16px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 16, fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>ESC Close</span>
        </div>
      </div>
    </div>
  )
}
