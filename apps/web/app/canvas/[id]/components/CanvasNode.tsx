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

function stripLeadingEmoji(title: string): string {
  return title.replace(/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\s]+/gu, '').trim() || title
}

const ACTIONS = [
  { id: 'research',       label: 'Research', icon: '◎', accent: '#0891b2' },
  { id: 'improve',        label: 'Enhance',  icon: '◈', accent: '#7c3aed' },
  { id: 'expand',         label: 'Expand',   icon: '◇', accent: '#059669' },
  { id: 'generate-tasks', label: 'Tasks',    icon: '□', accent: '#d97706' },
] as const

const CanvasNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as NodeData
  const { title, content, meta, onAction, hasResearch } = nodeData
  const [expanded, setExpanded] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [actionHover, setActionHover] = useState<string | null>(null)

  const rawContent = typeof content === 'string'
    ? content
    : typeof content === 'object' && content !== null
    ? JSON.stringify(content, null, 2)
    : ''

  const displayContent = cleanMarkdown(rawContent)
  const previewText = displayContent.slice(0, 200)
  const hasMore = displayContent.length > 200
  const cleanTitle = stripLeadingEmoji(title)

  const doAction = (action: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (onAction) onAction(action, nodeData.id)
  }

  const c = meta.color
  const isActive = selected || hovered

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setActionHover(null) }}
      style={{
        width: 340,
        borderRadius: 16,
        background: selected
          ? 'rgba(15,15,32,0.99)'
          : hovered
          ? 'rgba(13,13,28,0.98)'
          : 'rgba(10,10,22,0.96)',
        border: `1px solid ${selected ? `${c}99` : hovered ? `${c}44` : 'rgba(255,255,255,0.08)'}`,
        boxShadow: selected
          ? `0 0 0 2px ${c}30, 0 24px 60px rgba(0,0,0,0.85), 0 0 40px ${c}18`
          : hovered
          ? `0 20px 50px rgba(0,0,0,0.75), 0 0 24px ${c}10`
          : '0 6px 24px rgba(0,0,0,0.5)',
        transform: selected
          ? 'scale(1.022) translateY(-4px)'
          : hovered
          ? 'scale(1.008) translateY(-2px)'
          : 'scale(1)',
        transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Inter', system-ui, sans-serif",
        backdropFilter: 'blur(32px) saturate(200%)',
        userSelect: 'none',
        cursor: 'grab',
      }}
    >
      {/* ── Connection handles ── */}
      {[
        { type: 'target' as const, pos: Position.Left,   style: { left: -6 } },
        { type: 'source' as const, pos: Position.Right,  style: { right: -6 } },
        { type: 'target' as const, pos: Position.Top,    style: { top: -6 } },
        { type: 'source' as const, pos: Position.Bottom, style: { bottom: -6 } },
      ].map(({ type, pos, style }, i) => (
        <Handle
          key={i}
          type={type}
          position={pos}
          style={{
            background: c,
            width: 10, height: 10,
            border: `2px solid #07070f`,
            borderRadius: '50%',
            opacity: isActive ? 1 : 0,
            transition: 'opacity 0.18s, transform 0.18s',
            transform: isActive ? 'scale(1.3)' : 'scale(1)',
            boxShadow: isActive ? `0 0 8px ${c}` : 'none',
            ...style,
          }}
        />
      ))}

      {/* ── Top accent stripe with gradient ── */}
      <div style={{
        height: 2.5,
        background: `linear-gradient(90deg, ${c} 0%, ${c}80 50%, transparent 100%)`,
        opacity: isActive ? 1 : 0.6,
        transition: 'opacity 0.2s',
      }} />

      {/* ── Left accent bar ── */}
      <div style={{
        position: 'absolute',
        left: 0, top: 2.5, bottom: 0,
        width: 2.5,
        background: `linear-gradient(180deg, ${c} 0%, ${c}40 60%, transparent 100%)`,
        opacity: isActive ? 0.9 : 0.45,
        transition: 'opacity 0.2s',
        borderRadius: '0 0 0 16px',
      }} />

      {/* ── Glow orb behind icon ── */}
      <div style={{
        position: 'absolute',
        top: -20, left: 8,
        width: 80, height: 80,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${c}15 0%, transparent 70%)`,
        pointerEvents: 'none',
        opacity: isActive ? 1 : 0.5,
        transition: 'opacity 0.3s',
      }} />

      {/* ── Header ── */}
      <div style={{
        padding: '14px 14px 12px 18px',
        display: 'flex', alignItems: 'flex-start', gap: 12,
        position: 'relative',
      }}>
        {/* Icon badge */}
        <div style={{
          width: 36, height: 36, flexShrink: 0,
          borderRadius: 10,
          background: `${c}18`,
          border: `1px solid ${c}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, color: c, fontWeight: 800,
          boxShadow: `0 0 12px ${c}20, inset 0 1px 0 ${c}25`,
          transition: 'all 0.2s',
          ...(isActive ? { boxShadow: `0 0 18px ${c}35, inset 0 1px 0 ${c}30`, background: `${c}22` } : {}),
        }}>
          {meta.icon}
        </div>

        {/* Label + title block */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Category badge row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
            <span style={{
              fontSize: 8.5, fontWeight: 800,
              color: c,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              background: `${c}15`,
              padding: '2px 7px',
              borderRadius: 4,
              border: `1px solid ${c}28`,
              whiteSpace: 'nowrap',
            }}>
              {meta.label}
            </span>
            {hasResearch && (
              <span style={{
                fontSize: 8.5, padding: '2px 6px',
                borderRadius: 4,
                background: 'rgba(8,145,178,0.12)',
                color: '#22d3ee',
                border: '1px solid rgba(8,145,178,0.28)',
                fontWeight: 800, letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}>
                Researched
              </span>
            )}
          </div>

          {/* Title */}
          <div style={{
            fontSize: 13.5, fontWeight: 700,
            color: 'rgba(255,255,255,0.95)',
            lineHeight: 1.3, letterSpacing: '-0.018em',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            paddingRight: 4,
          }}>
            {cleanTitle}
          </div>
        </div>

        {/* Expand/collapse button */}
        <button
          onMouseDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); setExpanded(!expanded) }}
          title={expanded ? 'Collapse' : 'Expand'}
          style={{
            width: 22, height: 22, flexShrink: 0,
            background: expanded ? `${c}20` : 'rgba(255,255,255,0.05)',
            border: `1px solid ${expanded ? `${c}40` : 'rgba(255,255,255,0.09)'}`,
            borderRadius: 6, cursor: 'pointer',
            color: expanded ? c : 'rgba(255,255,255,0.45)',
            fontSize: 11, fontWeight: 900,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement
            el.style.background = `${c}28`
            el.style.borderColor = `${c}55`
            el.style.color = c
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement
            el.style.background = expanded ? `${c}20` : 'rgba(255,255,255,0.05)'
            el.style.borderColor = expanded ? `${c}40` : 'rgba(255,255,255,0.09)'
            el.style.color = expanded ? c : 'rgba(255,255,255,0.45)'
          }}
        >
          {expanded ? '−' : '+'}
        </button>
      </div>

      {/* ── Divider ── */}
      <div style={{
        height: 1,
        background: `linear-gradient(90deg, ${c}20 0%, rgba(255,255,255,0.06) 40%, transparent 100%)`,
        marginLeft: 18,
      }} />

      {/* ── Content body ── */}
      <div style={{
        padding: '11px 16px 11px 18px',
        maxHeight: expanded ? 300 : 88,
        overflow: 'hidden',
        transition: 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
      }}>
        {displayContent ? (
          <>
            <p style={{
              margin: 0,
              fontSize: 12.5,
              lineHeight: 1.68,
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
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 32,
                background: `linear-gradient(transparent, rgba(10,10,22,0.97))`,
                pointerEvents: 'none',
              }} />
            )}
          </>
        ) : (
          <p style={{
            margin: 0, fontSize: 12,
            color: 'rgba(255,255,255,0.22)',
            fontStyle: 'italic', lineHeight: 1.5,
          }}>
            No content yet — click Enhance to generate with AI
          </p>
        )}
      </div>

      {/* ── Action bar ── */}
      <div style={{
        padding: '8px 14px 10px 18px',
        borderTop: '1px solid rgba(255,255,255,0.045)',
        background: 'rgba(0,0,0,0.3)',
        display: 'flex', gap: 5, alignItems: 'center',
      }}>
        {ACTIONS.map(({ id, label, icon, accent }) => {
          const isHov = actionHover === id
          return (
            <button
              key={id}
              onMouseDown={e => e.stopPropagation()}
              onClick={e => doAction(id, e)}
              onMouseEnter={() => setActionHover(id)}
              onMouseLeave={() => setActionHover(null)}
              title={label}
              style={{
                flex: 1,
                fontSize: 10.5,
                fontWeight: 700,
                padding: '5px 4px',
                borderRadius: 7,
                background: isHov ? `${accent}28` : `${accent}10`,
                border: `1px solid ${isHov ? `${accent}55` : `${accent}22`}`,
                color: isHov ? accent : `${accent}bb`,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 3,
                letterSpacing: '0.01em',
                fontFamily: 'inherit',
                transition: 'all 0.13s ease',
                transform: isHov ? 'translateY(-1px)' : 'none',
              }}
            >
              <span style={{ fontSize: 9, fontWeight: 900 }}>{icon}</span>
              {label}
            </button>
          )
        })}

        {/* Delete */}
        <button
          onMouseDown={e => e.stopPropagation()}
          onClick={e => doAction('delete', e)}
          title="Delete node"
          style={{
            width: 26, height: 26, flexShrink: 0,
            fontSize: 12, borderRadius: 7,
            background: actionHover === 'delete' ? 'rgba(220,38,38,0.22)' : 'rgba(220,38,38,0.07)',
            border: `1px solid ${actionHover === 'delete' ? 'rgba(220,38,38,0.55)' : 'rgba(220,38,38,0.18)'}`,
            color: actionHover === 'delete' ? '#f87171' : 'rgba(248,113,113,0.5)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.13s ease',
          }}
          onMouseEnter={() => setActionHover('delete')}
          onMouseLeave={() => setActionHover(null)}
        >
          ×
        </button>
      </div>
    </div>
  )
})

CanvasNode.displayName = 'CanvasNode'
export default CanvasNode
