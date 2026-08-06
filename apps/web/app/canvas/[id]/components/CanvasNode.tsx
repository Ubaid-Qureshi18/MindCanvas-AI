'use client'
import { memo, useState } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'

interface NodeData {
  id: string
  type: string
  title: string
  content: string
  meta: { icon: string; color: string; label: string }
  onAction?: (action: string, nodeId: string) => void
  hasResearch?: boolean
}

// Strip markdown symbols so content reads cleanly
function cleanMarkdown(raw: string): string {
  return raw
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`{1,3}([^`]+)`{1,3}/g, '$1')
    .replace(/^>\s*/gm, '')
    .replace(/^[-*+]\s+/gm, '• ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\|[^\n]+\|/g, '')       // remove table rows
    .replace(/^[-|=]{3,}/gm, '')      // remove table dividers
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

const CanvasNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as NodeData
  const { title, content, meta, onAction, hasResearch } = nodeData
  const [expanded, setExpanded] = useState(false)
  const [hovered, setHovered] = useState(false)

  const rawContent = typeof content === 'string'
    ? content
    : typeof content === 'object' && content !== null
    ? JSON.stringify(content, null, 2)
    : ''

  const displayContent = cleanMarkdown(rawContent)
  const previewText = displayContent.slice(0, 140)
  const hasMore = displayContent.length > 140

  const doAction = (action: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (onAction) onAction(action, nodeData.id)
  }

  const isActive = selected || hovered
  const c = meta.color

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 350,
        borderRadius: 22,
        background: selected
          ? `linear-gradient(145deg, rgba(20,20,44,0.98) 0%, rgba(12,12,28,0.96) 100%)`
          : hovered
          ? `linear-gradient(145deg, rgba(18,18,38,0.96) 0%, rgba(10,10,24,0.95) 100%)`
          : `linear-gradient(145deg, rgba(14,14,30,0.94) 0%, rgba(8,8,18,0.93) 100%)`,
        border: selected
          ? `2px solid ${c}`
          : hovered
          ? `1.5px solid ${c}aa`
          : `1px solid rgba(255,255,255,0.12)`,
        boxShadow: selected
          ? `0 0 0 3px ${c}35, 0 28px 70px rgba(0,0,0,0.85), 0 0 40px ${c}45`
          : hovered
          ? `0 20px 52px rgba(0,0,0,0.75), 0 0 30px ${c}30`
          : `0 10px 36px rgba(0,0,0,0.6)`,
        transform: selected
          ? 'scale(1.035) translateY(-5px)'
          : hovered
          ? 'scale(1.02) translateY(-4px)'
          : 'scale(1)',
        transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        backdropFilter: 'blur(36px) saturate(220%)',
        userSelect: 'none',
      }}
    >
      {/* Handles */}
      {[
        { type: 'target' as const, pos: Position.Left,   style: { left: -5 } },
        { type: 'source' as const, pos: Position.Right,  style: { right: -5 } },
        { type: 'target' as const, pos: Position.Top,    style: { top: -5 } },
        { type: 'source' as const, pos: Position.Bottom, style: { bottom: -5 } },
      ].map(({ type, pos, style }, i) => (
        <Handle
          key={i}
          type={type}
          position={pos}
          style={{
            background: c,
            width: 10, height: 10,
            border: `2px solid #06060e`,
            borderRadius: '50%',
            opacity: isActive ? 1 : 0,
            transition: 'opacity 0.18s, transform 0.18s',
            transform: isActive ? 'scale(1.2)' : 'scale(1)',
            boxShadow: `0 0 10px ${c}`,
            ...style,
          }}
        />
      ))}

      {/* Top glowing color bar */}
      <div style={{
        height: 5,
        background: `linear-gradient(90deg, ${c} 0%, ${c}88 60%, transparent 100%)`,
        boxShadow: `0 0 12px ${c}aa`,
      }} />

      {/* Card Header */}
      <div style={{
        padding: '14px 16px 12px',
        background: `linear-gradient(160deg, ${c}20 0%, transparent 70%)`,
        borderBottom: `1px solid rgba(255,255,255,0.07)`,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        {/* Glowing Icon Avatar */}
        <div style={{
          width: 42, height: 42,
          borderRadius: 14,
          background: `linear-gradient(135deg, ${c}30 0%, ${c}10 100%)`,
          border: `1.5px solid ${c}50`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, flexShrink: 0,
          boxShadow: `0 4px 16px ${c}35`,
        }}>
          {meta.icon}
        </div>

        {/* Type + Title */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Category Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{
              fontSize: 9.5, fontWeight: 900,
              color: c,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              background: `linear-gradient(90deg, ${c}25 0%, ${c}12 100%)`,
              padding: '3px 10px',
              borderRadius: 20,
              border: `1px solid ${c}45`,
              whiteSpace: 'nowrap',
              boxShadow: `0 2px 8px ${c}20`,
            }}>
              {meta.label}
            </span>
            {hasResearch && (
              <span style={{
                fontSize: 9, padding: '2px 8px',
                borderRadius: 20,
                background: 'rgba(6,182,212,0.18)',
                color: '#22d3ee',
                border: '1px solid rgba(6,182,212,0.35)',
                fontWeight: 800,
                boxShadow: '0 0 10px rgba(6,182,212,0.3)',
              }}>
                🔬 Deep Research
              </span>
            )}
          </div>

          {/* Title */}
          <div style={{
            fontSize: 15,
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.25,
            letterSpacing: '-0.015em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {title}
          </div>
        </div>

        {/* Expand button */}
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
          style={{
            width: 26, height: 26,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 10,
            color: 'rgba(255,255,255,0.6)',
            flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)'
            ;(e.currentTarget as HTMLElement).style.color = '#ffffff'
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'
            ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'
          }}
        >
          {expanded ? '▲' : '▼'}
        </button>
      </div>

      {/* Content */}
      <div style={{
        padding: '12px 16px',
        maxHeight: expanded ? 280 : 84,
        overflow: 'hidden',
        transition: 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
      }}>
        {displayContent ? (
          <>
            <p style={{
              margin: 0,
              fontSize: 12.5,
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.85)',
              fontWeight: 400,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              {expanded ? displayContent : previewText}
              {!expanded && hasMore && (
                <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 700 }}>…</span>
              )}
            </p>
            {/* Fade gradient when collapsed */}
            {!expanded && hasMore && (
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 32,
                background: 'linear-gradient(transparent, rgba(10,10,24,0.99))',
                pointerEvents: 'none',
              }} />
            )}
          </>
        ) : (
          <p style={{
            margin: 0,
            fontSize: 12,
            color: 'rgba(255,255,255,0.3)',
            fontStyle: 'italic',
            lineHeight: 1.5,
          }}>
            Click to open — use AI Copilot to generate node details
          </p>
        )}
      </div>

      {/* Action Bar */}
      <div style={{
        padding: '8px 12px',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(0,0,0,0.35)',
        display: 'flex',
        gap: 4,
        alignItems: 'center',
      }}>
        {([
          { action: 'research',       emoji: '🔬', label: 'Research', color: '#22d3ee' },
          { action: 'improve',        emoji: '⚡', label: 'Enhance',  color: '#a78bfa' },
          { action: 'expand',         emoji: '🌿', label: 'Expand',   color: '#6ee7b7' },
          { action: 'generate-tasks', emoji: '✅', label: 'Tasks',    color: '#fde68a' },
        ] as const).map(({ action, emoji, label, color }) => (
          <button
            key={action}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => doAction(action, e)}
            title={label}
            style={{
              flex: 1,
              fontSize: 11,
              fontWeight: 800,
              padding: '6px 6px',
              borderRadius: 8,
              background: `${color}16`,
              border: `1px solid ${color}35`,
              color,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              lineHeight: 1,
              fontFamily: 'inherit',
              transition: 'all 0.18s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = `${color}30`
              ;(e.currentTarget as HTMLElement).style.borderColor = `${color}80`
              ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px) scale(1.05)'
              ;(e.currentTarget as HTMLElement).style.boxShadow = `0 4px 16px ${color}45`
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = `${color}16`
              ;(e.currentTarget as HTMLElement).style.borderColor = `${color}35`
              ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0) scale(1)'
              ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
            }}
          >
            <span style={{ fontSize: 12 }}>{emoji}</span>
            <span>{label}</span>
          </button>
        ))}

        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => doAction('delete', e)}
          title="Delete Node"
          style={{
            width: 28, height: 28,
            flexShrink: 0,
            fontSize: 12,
            borderRadius: 8,
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.25)',
            color: '#fca5a5',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.18s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.25)'
            ;(e.currentTarget as HTMLElement).style.borderColor = '#ef4444'
            ;(e.currentTarget as HTMLElement).style.color = '#ffffff'
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'
            ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.25)'
            ;(e.currentTarget as HTMLElement).style.color = '#fca5a5'
          }}
        >
          ✕
        </button>
      </div>
    </div>
  )
})

CanvasNode.displayName = 'CanvasNode'
export default CanvasNode
