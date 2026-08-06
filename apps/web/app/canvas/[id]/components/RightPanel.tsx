'use client'
import { useState, useEffect } from 'react'

type Tab = 'content' | 'edit' | 'research' | 'actions' | 'tasks'

interface RightPanelProps {
  node: any
  onClose: () => void
  onAction: (action: string, nodeId: string, extraData?: any) => Promise<any>
  onUpdateNode: (nodeId: string, updates: { title?: string; content?: string }) => void
  initialTab?: Tab
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

// Convert raw markdown to clean readable text for display
function renderMarkdown(raw: string): string {
  return raw
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`{1,3}([^`]+)`{1,3}/g, '$1')
    .replace(/^>\s*/gm, '')
    .replace(/^[-*+]\s/gm, '\u2022 ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\|[^\n]+\|/g, '')
    .replace(/^[-|]{3,}/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}


const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'content', icon: '📄', label: 'Details' },
  { id: 'actions', icon: '⚡', label: 'AI Tools' },
  { id: 'tasks', icon: '✅', label: 'Tasks' },
  { id: 'research', icon: '🔬', label: 'Research' },
  { id: 'edit', icon: '✏️', label: 'Edit' },
]

const AI_ACTIONS = [
  {
    action: 'improve',
    icon: '⚡',
    label: 'Enhance Content',
    desc: 'AI rewrites content to be strategic, detailed, and actionable',
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.08)',
    border: 'rgba(167,139,250,0.2)',
  },
  {
    action: 'expand',
    icon: '🌿',
    label: 'Expand to Sub-Nodes',
    desc: 'Generate 3–5 connected child nodes that break this idea down',
    color: '#6ee7b7',
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.2)',
  },
  {
    action: 'simplify',
    icon: '✂️',
    label: 'Simplify & Condense',
    desc: 'Cut down to the most critical points in under 100 words',
    color: '#fde68a',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.2)',
  },
  {
    action: 'generate-tasks',
    icon: '🗂',
    label: 'Generate Action Tasks',
    desc: 'Extract concrete to-do items with priorities and effort estimates',
    color: '#22d3ee',
    bg: 'rgba(6,182,212,0.08)',
    border: 'rgba(6,182,212,0.2)',
  },
]

function renderFormattedText(text: string, accentColor: string) {
  if (!text) return null
  const lines = text.split('\n')
  return lines.map((line, i) => {
    const trimmed = line.trim()
    if (!trimmed) return <div key={i} style={{ height: 4 }} />
    const headerMatch = trimmed.match(/^\*\*([^*]+)\*\*:?$/) || trimmed.match(/^##\s+(.+)/)
    if (headerMatch || (trimmed.endsWith(':') && trimmed.length < 65 && !trimmed.startsWith('•') && !trimmed.startsWith('-'))) {
      const label = headerMatch ? headerMatch[1] : trimmed.replace(/:$/, '')
      return (
        <div key={i} style={{ fontWeight: 800, color: '#f3f4f6', fontSize: 12.5, marginTop: 8, marginBottom: 2 }}>
          {renderInline(label)}
        </div>
      )
    }
    if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
      const raw = trimmed.replace(/^[•\-\*]\s*/, '')
      return (
        <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 4, paddingLeft: 2 }}>
          <span style={{ color: accentColor, flexShrink: 0, fontWeight: 900 }}>•</span>
          <div style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, fontSize: 12 }}>{renderInline(raw)}</div>
        </div>
      )
    }
    return <div key={i} style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, fontSize: 12, marginBottom: 3 }}>{renderInline(trimmed)}</div>
  })
}

function renderInline(str: string) {
  const parts = str.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**') ? <strong key={i} style={{ color: '#fff', fontWeight: 700 }}>{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>
  )
}

export default function RightPanel({ node, onClose, onAction, onUpdateNode, initialTab }: RightPanelProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [tasks, setTasks] = useState<Array<{
    id: string; title: string; description: string; priority: string; effort: string; completed?: boolean
  }>>([])
  const [activeTab, setActiveTab] = useState<Tab>(initialTab || 'content')
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState('medium')
  const [title, setTitle] = useState(node?.title || '')
  const [content, setContent] = useState(
    typeof node?.content === 'string' ? node.content : JSON.stringify(node?.content || '', null, 2)
  )
  const [researchQuery, setResearchQuery] = useState(node?.title || '')
  const [researchLoading, setResearchLoading] = useState(false)
  const [researchResult, setResearchResult] = useState<any>(null)
  const [researchError, setResearchError] = useState<string | null>(null)
  const [lastActionResult, setLastActionResult] = useState<{ action: string; content?: string; count?: number; tasks?: any[] } | null>(null)

  useEffect(() => {
    setTitle(node?.title || '')
    const newContent = typeof node?.content === 'string' ? node.content : JSON.stringify(node?.content || '', null, 2)
    setContent(newContent)
    setResearchQuery(node?.title || '')
  }, [node?.id, node?.title, node?.content])

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3200)
  }

  const handleAction = async (action: string) => {
    setActionLoading(action)
    setLastActionResult(null)
    try {
      const result = await onAction(action, node.id)
      if (action === 'generate-tasks' && result?.tasks) {
        const formatted = result.tasks.map((t: any, idx: number) => ({
          id: `t_${Date.now()}_${idx}`,
          title: t.title,
          description: t.description || '',
          priority: t.priority || 'medium',
          effort: t.effort || '1d',
          completed: false,
        }))
        setTasks(formatted)
        setLastActionResult({ action, count: formatted.length, tasks: formatted })
        showToast(`✅ ${formatted.length} tasks generated!`)
      } else if (action === 'improve') {
        const newContent = result?.content || ''
        if (newContent) {
          setContent(newContent)
          onUpdateNode(node.id, { content: newContent })
          setLastActionResult({ action, content: newContent })
        }
        showToast('⚡ Content enhanced with AI!')
      } else if (action === 'simplify') {
        const newContent = result?.content || ''
        if (newContent) {
          setContent(newContent)
          onUpdateNode(node.id, { content: newContent })
          setLastActionResult({ action, content: newContent })
        }
        showToast('✂️ Content condensed to key points!')
      } else if (action === 'expand') {
        setLastActionResult({ action, count: result?.count || 3 })
        showToast('🌿 Sub-nodes added to canvas!')
      }
    } catch (e: any) {
      showToast(`⚠️ ${e.message || 'Action failed'}`, 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleSaveEdit = () => {
    onUpdateNode(node.id, { title: title.trim(), content: content.trim() })
    setActiveTab('content')
    showToast('✓ Changes saved!', 'success')
  }

  const runResearch = async () => {
    if (!researchQuery.trim()) return
    setResearchLoading(true)
    setResearchError(null)
    try {
      const token = localStorage.getItem('mc_token') || ''
      const res = await fetch(`${API_URL}/api/v1/research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ query: researchQuery.trim() }),
      })
      if (!res.ok) throw new Error(`Research failed (${res.status})`)
      const data = await res.json()
      setResearchResult(data)
      showToast('🔬 Research complete!', 'info')
    } catch (e: any) {
      setResearchError(e.message || 'Research failed')
    } finally {
      setResearchLoading(false)
    }
  }

  const attachResearch = () => {
    if (!researchResult) return
    const base = content && content !== 'No content provided for this node yet.'
      ? content
      : `### ${node.title}\n\n`
    const appended = `${base}\n\n---\n\n### 🔬 AI Research (${new Date().toLocaleDateString()})\n\n${researchResult.answer}\n\n${researchResult.sources?.length ? '**Sources:**\n' + researchResult.sources.map((s: any) => `- [${s.title || s.url}](${s.url})`).join('\n') : ''}`
    onUpdateNode(node.id, { content: appended })
    setContent(appended)
    setActiveTab('content')
    showToast('🔬 Research attached to node!', 'info')
  }

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return
    setTasks(prev => [...prev, {
      id: `t_${Date.now()}`,
      title: newTaskTitle.trim(),
      description: 'Custom task',
      priority: newTaskPriority,
      effort: '1d',
      completed: false,
    }])
    setNewTaskTitle('')
    showToast('Task added!', 'info')
  }

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  // Use local content state for display — stays in sync via useEffect + direct setContent calls
  const contentStr = content || (typeof node.content === 'string' ? node.content : JSON.stringify(node.content, null, 2))

  const completedCount = tasks.filter(t => t.completed).length
  const progressPct = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0
  const nodeColor = node.meta?.color || '#6366f1'

  // Toast colors
  const toastColors = {
    success: { bg: 'rgba(16,185,129,0.92)', icon: '✓' },
    error: { bg: 'rgba(239,68,68,0.92)', icon: '!' },
    info: { bg: 'rgba(99,102,241,0.92)', icon: 'i' },
  }

  return (
    <div
      className="animate-slide-right"
      style={{
        position: 'absolute', right: 0, top: 0, bottom: 0,
        width: 'min(420px, 100vw)',
        background: 'rgba(7,7,18,0.98)',
        borderLeft: `1px solid ${nodeColor}45`,
        zIndex: 25, display: 'flex', flexDirection: 'column',
        backdropFilter: 'blur(40px) saturate(200%)',
        boxShadow: `-30px 0 80px rgba(0,0,0,0.85), -5px 0 35px ${nodeColor}20`,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Top color accent */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${nodeColor}, transparent)`,
      }} />

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'absolute', top: 16, left: 16, right: 16, zIndex: 50,
          padding: '10px 16px', background: toastColors[toast.type].bg,
          borderRadius: 10, fontSize: 12.5, fontWeight: 600, color: 'white',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', gap: 8,
          animation: 'fadeIn 0.2s ease',
        }}>
          <span style={{
            width: 18, height: 18, borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 900, flexShrink: 0,
          }}>
            {toastColors[toast.type].icon}
          </span>
          {toast.msg}
        </div>
      )}

      {/* Panel Header */}
      <div style={{
        padding: '20px 18px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: `linear-gradient(160deg, ${nodeColor}12 0%, transparent 60%)`,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 14,
            background: `${nodeColor}1c`,
            border: `1.5px solid ${nodeColor}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, flexShrink: 0,
            boxShadow: `0 4px 16px ${nodeColor}18`,
          }}>
            {node.meta?.icon || '📌'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center',
              fontSize: 10, fontWeight: 800, color: nodeColor,
              textTransform: 'uppercase', letterSpacing: '0.09em',
              background: `${nodeColor}16`,
              padding: '3px 10px',
              borderRadius: 20,
              border: `1px solid ${nodeColor}28`,
              marginBottom: 7,
            }}>
              {node.meta?.label || node.type}
            </div>
            <div style={{
              fontSize: 16, fontWeight: 800,
              color: 'rgba(255,255,255,0.96)',
              lineHeight: 1.25,
              letterSpacing: '-0.015em',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical' as const,
            }}>
              {node.title}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
              color: 'rgba(255,255,255,0.5)', borderRadius: 8,
              cursor: 'pointer', fontSize: 16, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
          >
            ×
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(0,0,0,0.3)',
        overflowX: 'auto',
      }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, minWidth: 60,
              padding: '11px 4px 9px',
              background: 'none', border: 'none',
              cursor: 'pointer',
              fontSize: 10, fontWeight: activeTab === tab.id ? 700 : 500,
              color: activeTab === tab.id ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.35)',
              borderBottom: `2px solid ${activeTab === tab.id ? nodeColor : 'transparent'}`,
              transition: 'all 0.2s',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            }}
          >
            <span style={{ fontSize: 14 }}>{tab.icon}</span>
            <span style={{ letterSpacing: '0.03em', textTransform: 'uppercase' }}>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px' }}>

        {/* ── CONTENT TAB ── */}
        {activeTab === 'content' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Quick action strip */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => handleAction('improve')}
                disabled={!!actionLoading}
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: 8, cursor: actionLoading ? 'not-allowed' : 'pointer',
                  background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)',
                  color: '#a78bfa', fontSize: 11.5, fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  transition: 'all 0.15s',
                }}
              >
                {actionLoading === 'improve'
                  ? <span className="spinner" style={{ width: 13, height: 13 }} />
                  : <><span>⚡</span> AI Enhance</>
                }
              </button>
              <button
                onClick={() => setActiveTab('edit')}
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
                  color: 'rgba(255,255,255,0.6)', fontSize: 11.5, fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <span>✏️</span> Edit
              </button>
            </div>

            {/* Content block */}
            <div style={{
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 12, padding: 16,
              minHeight: 120,
            }}>
              {contentStr && contentStr !== 'No content provided for this node yet.' ? (
                <div style={{ fontSize: 13, lineHeight: 1.85, color: 'rgba(255,255,255,0.85)' }}>
                  {renderMarkdown(contentStr).split('\n').map((line, i) => {
                    const trimmed = line.trim()
                    if (!trimmed) return <div key={i} style={{ height: 6 }} />

                    // Header / Title line ending in colon or key concept
                    if (trimmed.endsWith(':') && trimmed.length < 70) {
                      return (
                        <div key={i} style={{
                          fontWeight: 700, color: '#f3f4f6', fontSize: 13.5,
                          marginTop: 10, marginBottom: 4, letterSpacing: '-0.01em',
                          display: 'flex', alignItems: 'center', gap: 6,
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: nodeColor, display: 'inline-block' }} />
                          {trimmed}
                        </div>
                      )
                    }

                    // Bullet point
                    if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
                      const text = trimmed.replace(/^[•\-]\s*/, '')
                      return (
                        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, paddingLeft: 2 }}>
                          <span style={{ color: nodeColor, flexShrink: 0, fontWeight: 700, fontSize: 14 }}>•</span>
                          <span style={{ color: 'rgba(255,255,255,0.88)' }}>{text}</span>
                        </div>
                      )
                    }

                    return <p key={i} style={{ margin: '0 0 6px', color: 'rgba(255,255,255,0.85)' }}>{trimmed}</p>
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '28px 16px' }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>{node.meta?.icon || '📌'}</div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 18, lineHeight: 1.6 }}>
                    No content yet. Generate strategic AI content or write your own notes.
                  </p>
                  <button
                    onClick={() => handleAction('improve')}
                    disabled={!!actionLoading}
                    style={{
                      padding: '9px 20px', borderRadius: 8, cursor: 'pointer', border: 'none',
                      background: `linear-gradient(135deg, ${nodeColor}, ${nodeColor}bb)`,
                      color: 'white', fontSize: 12.5, fontWeight: 600,
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    {actionLoading === 'improve'
                      ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Generating...</>
                      : <><span>⚡</span> Auto-Generate with AI</>
                    }
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── AI TOOLS TAB ── */}
        {activeTab === 'actions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
              AI-Powered Actions
            </div>
            {AI_ACTIONS.map(({ action, icon, label, desc, color, bg, border }) => (
              <button
                key={action}
                onClick={() => handleAction(action)}
                disabled={!!actionLoading}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px',
                  background: actionLoading === action ? `${bg.replace('0.08', '0.14')}` : bg,
                  border: `1px solid ${border}`,
                  borderRadius: 12, cursor: actionLoading ? 'not-allowed' : 'pointer',
                  opacity: actionLoading && actionLoading !== action ? 0.4 : 1,
                  textAlign: 'left', transition: 'all 0.2s ease', width: '100%',
                }}
              >
                <div style={{
                  width: 42, height: 42, borderRadius: 10,
                  background: `${color}15`, border: `1px solid ${color}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, flexShrink: 0,
                }}>
                  {actionLoading === action
                    ? <span className="spinner" style={{ width: 20, height: 20, display: 'inline-block' }} />
                    : icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color, marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{desc}</div>
                </div>
                {!actionLoading && (
                  <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 14, flexShrink: 0 }}>›</span>
                )}
              </button>
            ))}

            {/* Action Result Card */}
            {lastActionResult && (
              <div style={{
                marginTop: 12, padding: '16px', borderRadius: 14,
                background: 'rgba(10,10,24,0.96)',
                border: '1px solid rgba(99,102,241,0.35)',
                animation: 'fadeIn 0.25s ease',
                boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#a78bfa', display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <span>✦</span> AI Output ({lastActionResult.action})
                  </div>
                  <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7', fontWeight: 700 }}>
                    ✓ Applied
                  </span>
                </div>

                {lastActionResult.content && (
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, maxHeight: 200, overflowY: 'auto', background: 'rgba(0,0,0,0.35)', padding: 12, borderRadius: 10, marginBottom: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                    {renderFormattedText(lastActionResult.content, '#a78bfa')}
                  </div>
                )}

                {lastActionResult.count && (
                  <div style={{ fontSize: 12, color: '#6ee7b7', fontWeight: 600, marginBottom: 12, background: 'rgba(16,185,129,0.08)', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(16,185,129,0.2)' }}>
                    ✨ Generated {lastActionResult.count} connected components on the canvas!
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setActiveTab('content')}
                    style={{
                      flex: 1, padding: '8px 12px', borderRadius: 8,
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
                      border: '1px solid rgba(99,102,241,0.4)',
                      color: '#c4b5fd', fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
                    }}
                  >
                    View Details Tab →
                  </button>
                  {lastActionResult.action === 'generate-tasks' && (
                    <button
                      onClick={() => setActiveTab('tasks')}
                      style={{
                        padding: '8px 14px', borderRadius: 8,
                        background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
                        color: '#6ee7b7', fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
                      }}
                    >
                      Go to Tasks ({lastActionResult.count}) →
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TASKS TAB ── */}
        {activeTab === 'tasks' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Progress summary */}
            {tasks.length > 0 && (
              <div style={{
                padding: '14px 16px',
                background: 'rgba(16,185,129,0.06)',
                border: '1px solid rgba(16,185,129,0.15)',
                borderRadius: 12,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: '#6ee7b7' }}>Task Progress</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                    {completedCount} / {tasks.length} done
                  </span>
                </div>
                <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${progressPct}%`,
                    background: 'linear-gradient(90deg, #10b981, #06b6d4)',
                    borderRadius: 3, transition: 'width 0.4s ease',
                  }} />
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 6, textAlign: 'right' }}>
                  {progressPct}% complete
                </div>
              </div>
            )}

            {/* Add task row */}
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                type="text"
                placeholder="Add a task..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddTask() }}
                style={{
                  flex: 1, padding: '9px 12px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  borderRadius: 8, color: 'white', fontSize: 12,
                  outline: 'none', fontFamily: 'inherit',
                }}
              />
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value)}
                style={{
                  background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.09)',
                  color: 'rgba(255,255,255,0.7)', borderRadius: 8, fontSize: 11,
                  padding: '0 8px', fontFamily: 'inherit', cursor: 'pointer',
                }}
              >
                <option value="high">High</option>
                <option value="medium">Med</option>
                <option value="low">Low</option>
              </select>
              <button
                onClick={handleAddTask}
                style={{
                  padding: '8px 14px', borderRadius: 8, border: 'none',
                  background: `linear-gradient(135deg, ${nodeColor}, ${nodeColor}bb)`,
                  color: 'white', fontSize: 16, cursor: 'pointer', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                +
              </button>
            </div>

            {/* AI generate button */}
            <button
              onClick={() => handleAction('generate-tasks')}
              disabled={!!actionLoading}
              style={{
                width: '100%', padding: '10px', borderRadius: 8, cursor: actionLoading ? 'not-allowed' : 'pointer',
                background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)',
                color: '#22d3ee', fontSize: 12, fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.15s',
              }}
            >
              {actionLoading === 'generate-tasks'
                ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Generating tasks...</>
                : <><span>🗂</span> Auto-Generate AI Tasks</>
              }
            </button>

            {/* Task list */}
            {tasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: 'rgba(255,255,255,0.3)' }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>📋</div>
                <div style={{ fontSize: 12.5, lineHeight: 1.6 }}>
                  No tasks yet. Add one above or click<br />"Auto-Generate AI Tasks"
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {tasks.map((task) => {
                  const priorityColor = task.priority === 'high' ? '#fca5a5' : task.priority === 'medium' ? '#fde68a' : '#86efac'
                  const priorityBg = task.priority === 'high' ? 'rgba(239,68,68,0.12)' : task.priority === 'medium' ? 'rgba(245,158,11,0.12)' : 'rgba(34,197,94,0.12)'
                  return (
                    <div
                      key={task.id}
                      style={{
                        padding: '12px 14px',
                        background: task.completed ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${task.completed ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.07)'}`,
                        borderRadius: 10, transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <button
                          onClick={() => toggleTask(task.id)}
                          style={{
                            width: 18, height: 18, borderRadius: 4, flexShrink: 0, cursor: 'pointer',
                            border: `2px solid ${task.completed ? '#10b981' : 'rgba(255,255,255,0.2)'}`,
                            background: task.completed ? '#10b981' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 10, color: 'white', transition: 'all 0.15s', marginTop: 2,
                          }}
                        >
                          {task.completed ? '✓' : ''}
                        </button>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: task.description ? 4 : 0 }}>
                            <span style={{
                              fontSize: 12.5, fontWeight: 600,
                              color: task.completed ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.9)',
                              textDecoration: task.completed ? 'line-through' : 'none',
                              lineHeight: 1.3,
                            }}>
                              {task.title}
                            </span>
                            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                              <span style={{
                                fontSize: 9, padding: '2px 6px', borderRadius: 4,
                                fontWeight: 700, textTransform: 'uppercase',
                                background: priorityBg, color: priorityColor,
                              }}>
                                {task.priority}
                              </span>
                              <button
                                onClick={() => deleteTask(task.id)}
                                style={{
                                  fontSize: 10, padding: '1px 5px', borderRadius: 4,
                                  background: 'rgba(239,68,68,0.08)', border: 'none',
                                  color: 'rgba(239,68,68,0.6)', cursor: 'pointer',
                                }}
                              >
                                ×
                              </button>
                            </div>
                          </div>
                          {task.description && task.description !== 'Custom task' && (
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
                              {task.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── RESEARCH TAB ── */}
        {activeTab === 'research' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{
                display: 'block', fontSize: 11, fontWeight: 700,
                color: '#22d3ee', textTransform: 'uppercase', letterSpacing: '0.08em',
                marginBottom: 8,
              }}>
                🔬 AI Deep Research
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  placeholder="e.g. Market size for meal delivery apps..."
                  value={researchQuery}
                  onChange={(e) => setResearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') runResearch() }}
                  style={{
                    flex: 1, padding: '10px 12px',
                    background: 'rgba(6,182,212,0.06)',
                    border: '1px solid rgba(6,182,212,0.2)',
                    borderRadius: 8, color: 'white', fontSize: 12.5, outline: 'none',
                    fontFamily: 'inherit',
                  }}
                />
                <button
                  onClick={runResearch}
                  disabled={researchLoading || !researchQuery.trim()}
                  style={{
                    padding: '8px 16px', borderRadius: 8, border: 'none',
                    background: researchLoading ? 'rgba(6,182,212,0.3)' : 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                    color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  {researchLoading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : '→'}
                </button>
              </div>
            </div>

            {researchError && (
              <div style={{
                padding: '12px 14px', background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10,
                fontSize: 12, color: '#fca5a5',
              }}>
                ⚠️ {researchError}
              </div>
            )}

            {!researchResult && !researchLoading && !researchError && (
              <div style={{
                textAlign: 'center', padding: '36px 20px',
                background: 'rgba(6,182,212,0.04)', border: '1px solid rgba(6,182,212,0.1)',
                borderRadius: 12,
              }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>🔬</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>
                  Enter a topic above to fetch market insights,<br />competitor data, and strategic analysis.
                </div>
              </div>
            )}

            {researchResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Confidence badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#22d3ee', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Research Analysis
                  </span>
                  {researchResult.confidence && (
                    <span style={{
                      fontSize: 11, fontWeight: 700,
                      background: 'rgba(16,185,129,0.12)',
                      color: '#6ee7b7', padding: '3px 10px', borderRadius: 20,
                    }}>
                      {(researchResult.confidence * 100).toFixed(0)}% confidence
                    </span>
                  )}
                </div>

                {/* Answer block */}
                <div style={{
                  background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.15)',
                  borderRadius: 12, padding: '16px', fontSize: 12.5, lineHeight: 1.8,
                  color: 'rgba(255,255,255,0.82)', whiteSpace: 'pre-wrap',
                }}>
                  {researchResult.answer}
                </div>

                {/* Sources */}
                {researchResult.sources?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                      Sources
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {researchResult.sources.slice(0, 4).map((s: any, i: number) => (
                        <a
                          key={i}
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            padding: '7px 11px', background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.06)', borderRadius: 7,
                            color: '#a78bfa', fontSize: 11.5, textDecoration: 'none',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            display: 'block',
                          }}
                        >
                          🔗 {s.title || s.url}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attach button */}
                <button
                  onClick={attachResearch}
                  style={{
                    width: '100%', padding: '11px', borderRadius: 10, border: 'none',
                    background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                    color: 'white', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  ➕ Attach Research to Node
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── EDIT TAB ── */}
        {activeTab === 'edit' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{
                display: 'block', fontSize: 11, fontWeight: 700,
                color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase',
                letterSpacing: '0.07em', marginBottom: 6,
              }}>
                Node Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                  color: 'white', fontSize: 13, outline: 'none', fontFamily: 'inherit',
                  boxSizing: 'border-box' as const,
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block', fontSize: 11, fontWeight: 700,
                color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase',
                letterSpacing: '0.07em', marginBottom: 6,
              }}>
                Content (Markdown)
              </label>
              <textarea
                rows={14}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                  color: 'rgba(255,255,255,0.85)', fontSize: 12, lineHeight: 1.7,
                  resize: 'vertical', outline: 'none', fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  boxSizing: 'border-box' as const,
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setActiveTab('content')}
                style={{
                  flex: 1, padding: '10px', borderRadius: 8, cursor: 'pointer',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
                  color: 'rgba(255,255,255,0.6)', fontSize: 12.5, fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                style={{
                  flex: 2, padding: '10px', borderRadius: 8, cursor: 'pointer', border: 'none',
                  background: `linear-gradient(135deg, ${nodeColor}, ${nodeColor}bb)`,
                  color: 'white', fontSize: 12.5, fontWeight: 700,
                }}
              >
                ✓ Save Changes
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
