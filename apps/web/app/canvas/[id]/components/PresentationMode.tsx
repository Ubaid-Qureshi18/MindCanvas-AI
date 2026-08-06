'use client'
import { useState, useEffect } from 'react'

interface PresentationModeProps {
  canvasTitle: string
  nodes: any[]
  onClose: () => void
}

export default function PresentationMode({ canvasTitle, nodes, onClose }: PresentationModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [theme, setTheme] = useState<'neon' | 'glass' | 'minimal'>('neon')

  const total = nodes.length
  const currentNode = nodes[currentIndex]

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        setCurrentIndex((prev) => Math.min(prev + 1, total - 1))
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => Math.max(prev - 1, 0))
      } else if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [total, onClose])

  if (!currentNode) return null

  const meta = currentNode.data?.meta || { icon: '📌', color: '#6366f1', label: 'Node' }
  const title = currentNode.data?.title || 'Untitled Node'
  const rawContent = currentNode.data?.content || ''
  const cleanContent = rawContent.replace(/[*#_~`]/g, '').trim()

  const bgThemes = {
    neon: 'radial-gradient(ellipse at center, rgba(13,13,32,0.98) 0%, #05050c 100%)',
    glass: 'linear-gradient(135deg, #0b0f19 0%, #111827 100%)',
    minimal: '#09090b',
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 400,
      background: bgThemes[theme],
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Inter', system-ui, sans-serif",
      userSelect: 'none',
      animation: 'fadeIn 0.25s ease',
    }}>
      {/* Presentation Top Control Bar */}
      <div style={{
        padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            padding: '4px 10px', borderRadius: 6,
            background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
            color: '#818cf8', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            PITCH DECK MODE
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>
            {canvasTitle.replace(/\s*teaA\s*SaaS.*$/i, '').trim()}
          </span>
        </div>

        {/* Theme + Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,0.05)', padding: 3, borderRadius: 8 }}>
            {(['neon', 'glass', 'minimal'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                style={{
                  padding: '4px 10px', borderRadius: 6, border: 'none',
                  background: theme === t ? '#6366f1' : 'transparent',
                  color: theme === t ? 'white' : 'rgba(255,255,255,0.4)',
                  fontSize: 11, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '6px 14px', borderRadius: 8,
              background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
              color: '#fca5a5', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}
          >
            Exit Presentation (ESC)
          </button>
        </div>
      </div>

      {/* Main Slide Card Area — 3D Holographic Depth */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, perspective: 1200 }}>
        <div
          key={currentNode.id}
          className="glow-border-3d card-3d"
          style={{
            width: '100%', maxWidth: 900, minHeight: 480,
            borderRadius: 28,
            background: 'linear-gradient(145deg, rgba(16,16,38,0.98) 0%, rgba(8,8,22,0.96) 100%)',
            border: `2px solid ${meta.color}`,
            boxShadow: `0 30px 100px rgba(0,0,0,0.85), 0 0 60px ${meta.color}35`,
            padding: 52, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            position: 'relative', overflow: 'hidden',
            transform: 'rotateX(2deg) rotateY(-1deg)',
            backdropFilter: 'blur(36px) saturate(200%)',
          }}
        >
          {/* Top accent glow line */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 6,
            background: `linear-gradient(90deg, ${meta.color}, #ec4899, #6366f1, ${meta.color})`,
          }} />

          {/* Slide Header */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{
                fontSize: 12.5, fontWeight: 900, color: meta.color,
                textTransform: 'uppercase', letterSpacing: '0.12em',
                background: `${meta.color}22`, padding: '6px 16px',
                borderRadius: 20, border: `1.5px solid ${meta.color}40`,
                boxShadow: `0 0 20px ${meta.color}25`,
              }}>
                {meta.icon} {meta.label}
              </span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>
                Slide {currentIndex + 1} of {total}
              </span>
            </div>

            <h1 style={{
              fontSize: 42, fontWeight: 900, color: 'white',
              letterSpacing: '-0.025em', lineHeight: 1.15, marginBottom: 24,
            }}>
              {title}
            </h1>
          </div>

          {/* Slide Content */}
          <div style={{ flex: 1, margin: '20px 0' }}>
            <p style={{
              fontSize: 19, lineHeight: 1.85, color: 'rgba(255,255,255,0.88)',
              whiteSpace: 'pre-wrap', margin: 0, fontWeight: 400,
            }}>
              {cleanContent || 'No details provided for this strategic slide.'}
            </p>
          </div>

          {/* Slide Footer */}
          <div style={{
            paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>
              ⚡ MindCanvas 3D Executive Presentation
            </span>
            <span style={{ fontSize: 13, color: meta.color, fontWeight: 800 }}>
              {meta.label} Phase
            </span>
          </div>
        </div>
      </div>

      {/* Slide Navigation Bottom Toolbar */}
      <div style={{
        padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.4)',
      }}>
        <button
          onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
          disabled={currentIndex === 0}
          style={{
            padding: '10px 20px', borderRadius: 10,
            background: currentIndex === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.1)', color: 'white',
            fontSize: 13, fontWeight: 700, cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
            opacity: currentIndex === 0 ? 0.4 : 1,
          }}
        >
          ← Previous Slide
        </button>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {nodes.map((_, i) => (
            <div
              key={i}
              onClick={() => setCurrentIndex(i)}
              style={{
                width: i === currentIndex ? 24 : 8, height: 8,
                borderRadius: 4,
                background: i === currentIndex ? '#6366f1' : 'rgba(255,255,255,0.2)',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, total - 1))}
          disabled={currentIndex === total - 1}
          style={{
            padding: '10px 24px', borderRadius: 10,
            background: currentIndex === total - 1 ? 'rgba(255,255,255,0.03)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            border: 'none', color: 'white',
            fontSize: 13, fontWeight: 700, cursor: currentIndex === total - 1 ? 'not-allowed' : 'pointer',
            opacity: currentIndex === total - 1 ? 0.4 : 1,
            boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
          }}
        >
          Next Slide →
        </button>
      </div>
    </div>
  )
}
