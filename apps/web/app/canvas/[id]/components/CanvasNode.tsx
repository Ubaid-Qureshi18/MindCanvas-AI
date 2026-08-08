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

function cleanMarkdown(raw: string): string {
  return raw
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`{1,3}([^`]+)`{1,3}/g, '$1')
    .replace(/^>\s*/gm, '')
    .replace(/^[-*+]\s+/gm, '• ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\|[^\n]+\|/g, '')
    .replace(/^[-|=]{3,}/gm, '')
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
  const previewText = displayContent.slice(0, 150)
  const hasMore = displayContent.length > 150

  const doAction = (action: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (onAction) onAction(action, nodeData.id)
  }

  const isActive = selected || hovered
  const c = meta.color

  // Derive a softer background tint from the accent color
  const bgBase = selected
    ? 'rgba(16, 16, 34, 0.98)'
    : hovered
    ? 'rgba(14, 14, 30, 0.97)'
    : 'rgba(11, 11, 25, 0.95)'

  const borderColor = selected
    ? `${c}bb`
    : hovered
    ? `${c}66`
    : 'rgba(255,255,255,0.09)'

  const shadow = selected
    ? `0 0 0 2.5px ${c}28, 0 20px 52px rgba(0,0,0,0.8), 0 0 32px ${c}22`
    : hovered
    ? `0 16px 44px rgba(0,0,0,0.7), 0 0 18px ${c}14`
    : '0 8px 28px rgba(0,0,0,0.55)'

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 340,
        borderRadius: 14,
        background: bgBase,
        border: `1px solid ${borderColor}`,
        boxShadow: shadow,
        transform: selected
          ? 'scale(1.025) translateY(-3px)'
          : hovered
          ? 'scale(1.01) translateY(-2px)'
          : 'scale(1)',
        transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Inter', system-ui, sans-serif",
        backdropFilter: 'blur(28px) saturate(180%)',
        userSelect: 'none',
      }}
    >
      {/* Connection handles — appear on hover/select */}
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
            width: 9, height: 9,
            border: `2px solid #07070f`,
            borderRadius: '50%',
            opacity: isActive ? 1 : 0,
            transition: 'opacity 0.18s, transform 0.18s',
            transform: isActive ? 'scale(1.2)' : 'scale(1)',
            ...style,
          }}
        />
      ))}

      {/* Accent top bar */}
      <div style={{
        height: 3,
        background: `linear-gradient(90deg, ${c} 0%, ${c}50 60%, transparent 100%)`,
        opacity: isActive ? 1 : 0.7,
        transition: 'opacity 0.2s',
      }} />

      {/* Header */}
      <div style={{
        padding: '14px 16px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: 11,
      }}>
        {/* Node icon */}
        <div style={{
          width: 38, height: 38,
          borderRadius: 11,
          background: `${c}18`,
          border: `1px solid ${c}35`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, flexShrink: 0,
        }}>
          {meta.icon}
        </div>

        {/* Label + title */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{
              fontSize: 9, fontWeight: 700,
              color: c,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              background: `${c}18`,
              padding: '2px 8px',
              borderRadius: 4,
              border: `1px solid ${c}30`,
              whiteSpace: 'nowrap',
            }}>
              {meta.label}
            </span>
            {hasResearch && (
              <span style={{
                fontSize: 9, padding: '2px 7px',
                borderRadius: 4,
                background: 'rgba(8,145,178,0.14)',
                color: '#22d3ee',
                border: '1px solid rgba(8,145,178,0.3)',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}>
                Research
              </span>
            )}
          </div>

          <div style={{
            fontSize: 13.5,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.92)',
            lineHeight: 1.3,
            letterSpacing: '-0.02em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {title.replace(/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\s]+/gu, '').trim() || title}
          </div>
        </div>

        {/* Expand toggle */}
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
          style={{
            width: 24, height: 24,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 11,
            color: 'rgba(255,255,255,0.45)',
            flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s ease',
            lineHeight: 1,
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.background = 'rgba(255,255,255,0.1)'
            el.style.color = 'rgba(255,255,255,0.8)'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.background = 'rgba(255,255,255,0.05)'
            el.style.color = 'rgba(255,255,255,0.45)'
          }}
        >
          {expanded ? '−' : '+'}
        </button>
      </div>

      {/* Content body */}
      <div style={{
        padding: '12px 16px',
        maxHeight: expanded ? 260 : 78,
        overflow: 'hidden',
        transition: 'max-height 0.32s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
      }}>
        {displayContent ? (
          <>
            <p style={{
              margin: 0,
              fontSize: 12.5,
              lineHeight: 1.72,
              color: 'rgba(255,255,255,0.72)',
              fontWeight: 400,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              {expanded ? displayContent : previewText}
              {!expanded && hasMore && (
                <span style={{ color: 'rgba(255,255,255,0.25)' }}>…</span>
              )}
            </p>
            {!expanded && hasMore && (
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 28,
                background: 'linear-gradient(transparent, rgba(11,11,25,0.98))',
                pointerEvents: 'none',
              }} />
            )}
          </>
        ) : (
          <p style={{
            margin: 0,
            fontSize: 12,
            color: 'rgba(255,255,255,0.22)',
            fontStyle: 'italic',
            lineHeight: 1.5,
          }}>
            No content yet — use AI Copilot to generate details
          </p>
        )}
      </div>

      {/* Action bar */}
      <div style={{
        padding: '8px 12px 10px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(0,0,0,0.25)',
        display: 'flex',
        gap: 5,
        alignItems: 'center',
      }}>
        {([
          { action: 'research',       label: 'Research', color: '#0891b2' },
          { action: 'improve',        label: 'Enhance',  color: '#7c3aed' },
          { action: 'expand',         label: 'Expand',   color: '#059669' },
          { action: 'generate-tasks', label: 'Tasks',    color: '#d97706' },
        ] as const).map(({ action, label, color }) => (
          <button
            key={action}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => doAction(action, e)}
            title={label}
            style={{
              flex: 1,
              fontSize: 10.5,
              fontWeight: 600,
              padding: '5px 4px',
              borderRadius: 6,
              background: `${color}12`,
              border: `1px solid ${color}28`,
              color: `${color}cc`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              letterSpacing: '0.01em',
              fontFamily: 'inherit',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.background = `${color}22`
              el.style.borderColor = `${color}55`
              el.style.color = color
              el.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.background = `${color}12`
              el.style.borderColor = `${color}28`
              el.style.color = `${color}cc`
              el.style.transform = 'translateY(0)'
            }}
          >
            {label}
          </button>
        ))}

        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => doAction('delete', e)}
          title="Delete"
          style={{
            width: 26, height: 26,
            flexShrink: 0,
            fontSize: 12,
            borderRadius: 6,
            background: 'rgba(220,38,38,0.08)',
            border: '1px solid rgba(220,38,38,0.2)',
            color: 'rgba(248,113,113,0.7)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.background = 'rgba(220,38,38,0.2)'
            el.style.borderColor = 'rgba(220,38,38,0.5)'
            el.style.color = '#f87171'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.background = 'rgba(220,38,38,0.08)'
            el.style.borderColor = 'rgba(220,38,38,0.2)'
            el.style.color = 'rgba(248,113,113,0.7)'
          }}
        >
          ×
        </button>
      </div>
    </div>
  )
})

CanvasNode.displayName = 'CanvasNode'
export default CanvasNode
