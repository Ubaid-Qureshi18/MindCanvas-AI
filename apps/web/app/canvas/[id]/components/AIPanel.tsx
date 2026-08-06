'use client'
import { useState, useRef } from 'react'

interface AIPanelProps {
  onGenerate: (prompt: string) => void
  generating: boolean
}

const CATEGORIZED_PROMPTS = [
  { label: '🚀 SaaS', prompt: 'Build a B2B SaaS startup for remote team collaboration & automated workflow tracking' },
  { label: '🤖 AI App', prompt: 'Launch an AI-powered legal document auditor with instant risk highlighting' },
  { label: '🛒 E-Commerce', prompt: 'Create a hyper-personalized DTC food & nutrition subscription platform' },
  { label: '💼 FinTech', prompt: 'Design an automated accounting & tax optimization platform for freelancers' },
  { label: '🏥 Health', prompt: 'Build a telemedicine platform connecting patients to specialized medical experts' },
]

export default function AIPanel({ onGenerate, generating }: AIPanelProps) {
  const [prompt, setPrompt] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (customPrompt?: string) => {
    const textToUse = (customPrompt || prompt).trim()
    if (textToUse && !generating) {
      onGenerate(textToUse)
      setPrompt('')
      setShowSuggestions(false)
    }
  }

  const handleEnhancePrompt = () => {
    if (!prompt.trim()) return
    const p = prompt.trim()
    const enhanced = `Launch an innovative platform for "${p}" targeted at high-growth teams and early adopters. Includes automated onboarding, tiered subscription pricing ($29-$299/mo), integration with core industry tools, and a clear 90-day GTM execution roadmap.`
    setPrompt(enhanced)
  }

  return (
    <div className="ai-panel">
      {showSuggestions && (
        <div style={{
          position: 'absolute', bottom: '100%', left: 0, right: 0, marginBottom: 10,
          background: 'rgba(11,11,24,0.98)', border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: 16, overflow: 'hidden', backdropFilter: 'blur(24px)',
          boxShadow: '0 16px 40px rgba(0,0,0,0.7), 0 0 30px rgba(99,102,241,0.15)',
          padding: 12, display: 'flex', flexDirection: 'column', gap: 6,
          animation: 'fadeIn 0.15s ease',
        }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '2px 8px 6px' }}>
            ⚡ Quick Start Templates
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {CATEGORIZED_PROMPTS.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  setPrompt(item.prompt)
                  setShowSuggestions(false)
                  inputRef.current?.focus()
                }}
                style={{
                  padding: '6px 12px', borderRadius: 8,
                  background: 'rgba(99,102,241,0.1)',
                  border: '1px solid rgba(99,102,241,0.22)',
                  color: 'rgba(255,255,255,0.85)', fontSize: 11.5, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.22)'
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.45)'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.1)'
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.22)'
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 18, zIndex: 1 }}>
          {generating ? <span className="spinner" style={{ width: 18, height: 18 }} /> : '✦'}
        </span>
        <input
          ref={inputRef}
          type="text"
          className="ai-prompt-input"
          style={{ paddingLeft: 48, paddingRight: prompt.trim().length > 3 ? 210 : 135 }}
          placeholder={generating ? 'Building strategic canvas...' : 'Describe an idea (e.g., AI legal auditor)...'}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 220)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit()
            if (e.key === 'Escape') setShowSuggestions(false)
          }}
          disabled={generating}
        />
        <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 6 }}>
          {prompt.trim().length > 3 && !generating && (
            <button
              onClick={handleEnhancePrompt}
              title="Enhance prompt with AI details"
              style={{
                padding: '6px 11px', borderRadius: 8,
                background: 'rgba(167,139,250,0.14)',
                border: '1px solid rgba(167,139,250,0.3)',
                color: '#c4b5fd', fontSize: 11.5, fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              ✨ Enhance
            </button>
          )}
          <button
            onClick={() => handleSubmit()}
            className="btn-primary"
            disabled={!prompt.trim() || generating}
            style={{ padding: '7px 16px', fontSize: 13, fontWeight: 700 }}
          >
            {generating ? 'Generating...' : 'Generate →'}
          </button>
        </div>
      </div>
    </div>
  )
}

