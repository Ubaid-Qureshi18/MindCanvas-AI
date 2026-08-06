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

  const scoreColor = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.15))',
          border: `1px solid ${scoreColor}60`,
          display: 'flex', alignItems: 'center', gap: 7,
          boxShadow: `0 0 16px ${scoreColor}25`,
          transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
          ;(e.currentTarget as HTMLElement).style.boxShadow = `0 0 24px ${scoreColor}40`
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
          ;(e.currentTarget as HTMLElement).style.boxShadow = `0 0 16px ${scoreColor}25`
        }}
      >
        <div style={{
          width: 20, height: 20, borderRadius: '50%',
          background: `${scoreColor}25`, border: `2px solid ${scoreColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 9.5, fontWeight: 900, color: scoreColor,
          boxShadow: `0 0 10px ${scoreColor}`,
        }}>
          {score}%
        </div>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: 700 }}>
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
            className="glow-border-3d card-3d"
            style={{
              position: 'absolute', top: 56, right: 20, width: 340,
              borderRadius: 20, padding: 22,
              boxShadow: '0 24px 60px rgba(0,0,0,0.85), 0 0 35px rgba(99,102,241,0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'white' }}>Canvas Readiness Scorecard</div>
              <span style={{ fontSize: 13, fontWeight: 900, color: scoreColor }}>{score}%</span>
            </div>

            {/* Progress Bar */}
            <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden', marginBottom: 14 }}>
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
                  <div key={p.type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: has ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.4)' }}>
                      <span style={{ color: has ? '#10b981' : '#ef4444', fontWeight: 800 }}>{has ? '✓' : '✕'}</span>
                      <span>{p.label}</span>
                    </div>
                    {!has && (
                      <button
                        onClick={() => { onAutoFillMissing(p.type); setOpen(false) }}
                        style={{
                          padding: '2px 7px', borderRadius: 4,
                          background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                          color: '#818cf8', fontSize: 10, fontWeight: 700, cursor: 'pointer',
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
                  width: '100%', padding: '8px', borderRadius: 8, border: 'none',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: 'white', fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
                }}
              >
                ✨ Auto-Complete Missing Component
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
