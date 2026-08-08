'use client'
import { useState } from 'react'

interface CanvasAuditWidgetProps {
  nodes: any[]
  onAutoFillMissing: (missingType: string) => void
}

const REQUIRED_PILLARS = [
  { type: 'idea', label: 'Core Idea', weight: 15 },
  { type: 'problem', label: 'Problem Statement', weight: 15 },
  { type: 'solution', label: 'Solution Architecture', weight: 15 },
  { type: 'target_users', label: 'Target Users', weight: 15 },
  { type: 'business_model', label: 'Business & Revenue', weight: 15 },
  { type: 'risks', label: 'Risks & Mitigation', weight: 15 },
  { type: 'roadmap', label: 'Execution Roadmap', weight: 10 },
]

export default function CanvasAuditWidget({ nodes, onAutoFillMissing }: CanvasAuditWidgetProps) {
  const [open, setOpen] = useState(false)

  const existingTypes = new Set(nodes.map((n) => n.data?.type))

  let score = 0
  REQUIRED_PILLARS.forEach((p) => {
    if (existingTypes.has(p.type)) score += p.weight
  })

  const missingPillars = REQUIRED_PILLARS.filter((p) => !existingTypes.has(p.type))
  const scoreColor = score >= 80 ? '#059669' : score >= 50 ? '#d97706' : '#dc2626'
  const scoreBadgeBg = score >= 80 ? 'rgba(5,150,105,0.12)' : score >= 50 ? 'rgba(217,119,6,0.12)' : 'rgba(220,38,38,0.12)'

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          padding: '7px 14px', borderRadius: 8, cursor: 'pointer',
          background: scoreBadgeBg,
          border: `1px solid ${scoreColor}35`,
          display: 'flex', alignItems: 'center', gap: 8,
          transition: 'all 0.18s ease',
          fontFamily: 'inherit',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = `${scoreColor}22`
          ;(e.currentTarget as HTMLElement).style.borderColor = `${scoreColor}60`
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = scoreBadgeBg
          ;(e.currentTarget as HTMLElement).style.borderColor = `${scoreColor}35`
        }}
      >
        <div style={{
          width: 18, height: 18, borderRadius: '50%',
          background: `${scoreColor}20`, border: `1.5px solid ${scoreColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 9, fontWeight: 800, color: scoreColor,
        }}>
          {score}%
        </div>
        <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
          Health Audit
        </span>
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 150 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute', top: 54, right: 20, width: 320,
              borderRadius: 16, padding: 20,
              background: 'rgba(12,12,28,0.98)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.85)',
              backdropFilter: 'blur(24px)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>Canvas Readiness Scorecard</div>
              <span style={{ fontSize: 13, fontWeight: 800, color: scoreColor }}>{score}%</span>
            </div>

            {/* Progress Bar */}
            <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden', marginBottom: 14 }}>
              <div style={{
                height: '100%', width: `${score}%`,
                background: scoreColor, borderRadius: 3, transition: 'width 0.4s ease',
              }} />
            </div>

            {/* Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
              {REQUIRED_PILLARS.map((p) => {
                const has = existingTypes.has(p.type)
                return (
                  <div key={p.type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: has ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.4)' }}>
                      <span style={{ color: has ? '#059669' : '#dc2626', fontWeight: 800 }}>{has ? '✓' : '✕'}</span>
                      <span>{p.label}</span>
                    </div>
                    {!has && (
                      <button
                        onClick={() => { onAutoFillMissing(p.type); setOpen(false) }}
                        style={{
                          padding: '3px 8px', borderRadius: 5,
                          background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.28)',
                          color: '#818cf8', fontSize: 10.5, fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        + Add
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            {missingPillars.length > 0 && (
              <button
                onClick={() => { onAutoFillMissing(missingPillars[0].type); setOpen(false) }}
                style={{
                  width: '100%', padding: '9px', borderRadius: 8, border: 'none',
                  background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
                  color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  letterSpacing: '-0.01em',
                }}
              >
                Auto-complete missing component
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
