'use client'
import { useState, useMemo, useRef, useEffect } from 'react'

interface RoadmapTask {
  id: string
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'done'
  priority: 'high' | 'medium' | 'low'
  tag?: string
}

interface RoadmapPhase {
  id: string
  label: string
  shortLabel: string
  duration: string
  gradient: string
  accent: string
  borderColor: string
  milestone: string
  tasks: RoadmapTask[]
}

interface RoadmapModalProps {
  canvasTitle: string
  nodes: any[]
  onClose: () => void
}

const PRIORITY_META = {
  high:   { color: '#f87171', bg: 'rgba(239,68,68,0.12)', label: 'High' },
  medium: { color: '#fbbf24', bg: 'rgba(245,158,11,0.12)', label: 'Med' },
  low:    { color: '#6ee7b7', bg: 'rgba(52,211,153,0.1)', label: 'Low' },
}

const STATUS_META = {
  'todo':        { color: '#64748b', icon: '○', label: 'To Do' },
  'in-progress': { color: '#f59e0b', icon: '◑', label: 'In Progress' },
  'done':        { color: '#10b981', icon: '●', label: 'Done' },
}

function buildPhases(nodes: any[], title: string): RoadmapPhase[] {
  const t = (title || 'This Project').replace(/[^\w\s\-]/g, '').trim().slice(0, 40)
  const sol  = nodes.find(n => ['solution','unique_solution'].includes(n.data?.type))?.data?.content?.slice(0,80) || 'core product solution'
  const tech = nodes.find(n => n.data?.type === 'tech_stack')?.data?.content?.slice(0,80) || 'Next.js, Node.js, Supabase'
  const mkt  = nodes.find(n => n.data?.type === 'marketing')?.data?.content?.slice(0,80) || 'Product Hunt, LinkedIn outreach'
  const rev  = nodes.find(n => n.data?.type === 'revenue')?.data?.content?.slice(0,80) || 'Freemium to Pro conversion'

  return [
    {
      id: 'phase-1', label: 'Discovery & Foundation', shortLabel: 'Discovery',
      duration: 'Weeks 1–4', milestone: 'Problem–Solution Fit',
      gradient: 'linear-gradient(135deg,rgba(99,102,241,0.18),rgba(99,102,241,0.06))',
      accent: '#818cf8', borderColor: 'rgba(99,102,241,0.3)',
      tasks: [
        { id: 'p1t1', title: 'Define Problem & ICP Profile', description: `Run 15+ discovery interviews. Map pain-point severity for "${t}".`, status: 'done', priority: 'high', tag: 'Research' },
        { id: 'p1t2', title: 'Competitive Landscape Analysis', description: 'Map 5 competitors, identify 2 defensible moats and key whitespace opportunities.', status: 'done', priority: 'high', tag: 'Strategy' },
        { id: 'p1t3', title: 'Technical Architecture Design', description: `Finalize stack: ${tech.slice(0,60)}. Define API contracts and DB schema.`, status: 'in-progress', priority: 'high', tag: 'Engineering' },
        { id: 'p1t4', title: 'Team Roles & Sprint Structure', description: 'Define RACI matrix, sprint cadence, and communication channels.', status: 'in-progress', priority: 'medium', tag: 'Ops' },
        { id: 'p1t5', title: 'Brand Identity & Design System', description: 'Create color palette, typography scale, component library, and brand voice guide.', status: 'todo', priority: 'medium', tag: 'Design' },
      ],
    },
    {
      id: 'phase-2', label: 'MVP Build', shortLabel: 'MVP',
      duration: 'Weeks 5–10', milestone: 'First Working Build',
      gradient: 'linear-gradient(135deg,rgba(124,58,237,0.18),rgba(124,58,237,0.06))',
      accent: '#a78bfa', borderColor: 'rgba(124,58,237,0.3)',
      tasks: [
        { id: 'p2t1', title: 'Core Feature Implementation v0.1', description: `Build: ${sol.slice(0,70)}. Ship 3 working user flows.`, status: 'in-progress', priority: 'high', tag: 'Engineering' },
        { id: 'p2t2', title: 'Auth, Onboarding & Session Management', description: 'Implement secure signup, email validation, session persistence, and password reset.', status: 'todo', priority: 'high', tag: 'Engineering' },
        { id: 'p2t3', title: 'UI Polish & Responsive Breakpoints', description: 'Ensure perfect rendering on mobile (≤480px), tablet (≤768px), and desktop. Implement micro-animations.', status: 'todo', priority: 'high', tag: 'Design' },
        { id: 'p2t4', title: 'Analytics & Funnel Instrumentation', description: 'Wire Amplitude/Mixpanel: track signup, activation, feature usage, and drop-off events.', status: 'todo', priority: 'medium', tag: 'Data' },
        { id: 'p2t5', title: 'Internal QA & Bug Triage', description: 'Structured P1/P2/P3 bug classification. Cross-browser QA across Chrome, Safari, Firefox.', status: 'todo', priority: 'medium', tag: 'QA' },
      ],
    },
    {
      id: 'phase-3', label: 'Beta & GTM Launch', shortLabel: 'Launch',
      duration: 'Weeks 11–16', milestone: 'Public Beta Live',
      gradient: 'linear-gradient(135deg,rgba(5,150,105,0.18),rgba(5,150,105,0.06))',
      accent: '#34d399', borderColor: 'rgba(5,150,105,0.3)',
      tasks: [
        { id: 'p3t1', title: 'Closed Beta — 50 Design Partners', description: 'Onboard ICP users. Collect structured NPS, session recordings, and friction map.', status: 'todo', priority: 'high', tag: 'Growth' },
        { id: 'p3t2', title: 'GTM Channel Activation', description: mkt.slice(0,90) || 'Launch Product Hunt, LinkedIn, targeted cold email to 200 qualified leads.', status: 'todo', priority: 'high', tag: 'Marketing' },
        { id: 'p3t3', title: 'Pricing & Stripe Paywall Integration', description: rev.slice(0,90) || 'Set up freemium limits, pro plan, and enterprise tier with Stripe billing.', status: 'todo', priority: 'medium', tag: 'Revenue' },
        { id: 'p3t4', title: 'Press & Thought Leadership', description: 'Publish 3 founder essays. Pitch TechCrunch, Hacker News, and relevant newsletters.', status: 'todo', priority: 'low', tag: 'PR' },
        { id: 'p3t5', title: 'Referral & Viral Loop Mechanics', description: 'Build in-product referral system. A/B test invite flows to optimize viral coefficient > 1.2.', status: 'todo', priority: 'medium', tag: 'Growth' },
      ],
    },
    {
      id: 'phase-4', label: 'Scale & Fundraise', shortLabel: 'Scale',
      duration: 'Months 5–9', milestone: '$1M ARR',
      gradient: 'linear-gradient(135deg,rgba(217,119,6,0.16),rgba(217,119,6,0.06))',
      accent: '#fbbf24', borderColor: 'rgba(217,119,6,0.3)',
      tasks: [
        { id: 'p4t1', title: 'Seed Round Fundraise ($1–3M)', description: 'Build investor deck, 3-year financial model, and cap table. Target 50 VC warm intros.', status: 'todo', priority: 'high', tag: 'Finance' },
        { id: 'p4t2', title: 'Enterprise Tier & API Platform', description: 'Ship enterprise plan: SSO, audit logs, API access, SLA, team admin roles.', status: 'todo', priority: 'medium', tag: 'Product' },
        { id: 'p4t3', title: 'Scale to 500 Paying Customers', description: 'Drive freemium→paid conversion to 8%+. Reach $25K MRR milestone.', status: 'todo', priority: 'high', tag: 'Growth' },
        { id: 'p4t4', title: 'International Expansion & i18n', description: 'EU/APAC market entry: GDPR compliance, local payment methods, i18n string layer.', status: 'todo', priority: 'low', tag: 'Strategy' },
        { id: 'p4t5', title: 'Strategic Partnerships & BD', description: 'Lock in 3 integration partnerships and 2 co-marketing agreements with ecosystem players.', status: 'todo', priority: 'medium', tag: 'Biz Dev' },
      ],
    },
  ]
}

const TAG_COLORS: Record<string, string> = {
  Research: '#818cf8', Strategy: '#a78bfa', Engineering: '#38bdf8', Ops: '#94a3b8',
  Design: '#f472b6', Growth: '#34d399', Marketing: '#fbbf24', Revenue: '#6ee7b7',
  PR: '#fb923c', Data: '#22d3ee', QA: '#f87171', Finance: '#fde68a',
  Product: '#c084fc', 'Biz Dev': '#fdba74',
}

export default function RoadmapModal({ canvasTitle, nodes, onClose }: RoadmapModalProps) {
  const initPhases = useMemo(() => buildPhases(nodes, canvasTitle), [nodes, canvasTitle])
  const [tasks, setTasks] = useState<Record<string, RoadmapTask[]>>(
    () => Object.fromEntries(initPhases.map(p => [p.id, p.tasks]))
  )
  const [activePhase, setActivePhase] = useState(initPhases[0].id)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newPriority, setNewPriority] = useState<'high'|'medium'|'low'>('medium')
  const [newTag, setNewTag] = useState('Engineering')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const addInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (showAddForm) addInputRef.current?.focus() }, [showAddForm])

  const phase = initPhases.find(p => p.id === activePhase)!
  const allTasks = Object.values(tasks).flat()
  const totalDone = allTasks.filter(t => t.status === 'done').length
  const totalAll = allTasks.length
  const pct = totalAll > 0 ? Math.round((totalDone / totalAll) * 100) : 0

  const phaseTasks = (tasks[activePhase] || []).filter(t =>
    filterStatus === 'all' ? true : t.status === filterStatus
  )

  const cycleStatus = (id: string) => {
    const order: RoadmapTask['status'][] = ['todo', 'in-progress', 'done']
    setTasks(prev => ({
      ...prev,
      [activePhase]: (prev[activePhase] || []).map(t =>
        t.id === id ? { ...t, status: order[(order.indexOf(t.status) + 1) % 3] } : t
      )
    }))
  }

  const deleteTask = (id: string) => {
    setTasks(prev => ({ ...prev, [activePhase]: (prev[activePhase] || []).filter(t => t.id !== id) }))
  }

  const saveEdit = (id: string) => {
    if (!editTitle.trim()) { setEditingId(null); return }
    setTasks(prev => ({
      ...prev,
      [activePhase]: (prev[activePhase] || []).map(t => t.id === id ? { ...t, title: editTitle.trim() } : t)
    }))
    setEditingId(null)
  }

  const addTask = () => {
    if (!newTitle.trim()) return
    const task: RoadmapTask = {
      id: `custom-${Date.now()}`, title: newTitle.trim(),
      description: newDesc.trim() || 'Custom milestone added to this phase.',
      status: 'todo', priority: newPriority, tag: newTag,
    }
    setTasks(prev => ({ ...prev, [activePhase]: [...(prev[activePhase] || []), task] }))
    setNewTitle(''); setNewDesc(''); setNewPriority('medium'); setNewTag('Engineering'); setShowAddForm(false)
  }

  const phaseStats = (pid: string) => {
    const pt = tasks[pid] || []
    const done = pt.filter(t => t.status === 'done').length
    return { done, total: pt.length, pct: pt.length > 0 ? Math.round((done / pt.length) * 100) : 0 }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 600,
        background: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(20px)',
        display: 'flex', alignItems: 'stretch',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <style>{`
        @keyframes rmSlideIn { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
        @keyframes rmFadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .rm-task-card:hover { background: rgba(255,255,255,0.055) !important; border-color: rgba(255,255,255,0.13) !important; }
        .rm-task-card:hover .rm-task-actions { opacity: 1 !important; }
        .rm-phase-tab:hover { background: rgba(255,255,255,0.05) !important; }
        .rm-status-btn:hover { opacity: 0.85; }
        .rm-add-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 1060, marginLeft: 'auto',
          height: '100%', background: '#0a0a1a',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          animation: 'rmSlideIn 0.28s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        {/* ── Header ── */}
        <div style={{
          padding: '18px 24px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', gap: 16,
          flexShrink: 0, background: 'rgba(255,255,255,0.012)',
        }}>
          {/* Icon */}
          <div style={{
            width: 38, height: 38, borderRadius: 11, flexShrink: 0,
            background: 'linear-gradient(135deg,#6366f1,#7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, color: 'white', fontWeight: 900,
            boxShadow: '0 0 20px rgba(99,102,241,0.45)',
          }}>▶</div>

          {/* Title */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: 'white', margin: 0, letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Product Roadmap
            </h2>
            <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.4)', margin: '2px 0 0', fontWeight: 500 }}>
              {canvasTitle} · AI-generated execution plan · {totalAll} tasks
            </p>
          </div>

          {/* Overall progress ring */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <div style={{ position: 'relative', width: 52, height: 52 }}>
              <svg width="52" height="52" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="26" cy="26" r="20" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
                <circle
                  cx="26" cy="26" r="20" fill="none"
                  stroke={pct >= 75 ? '#34d399' : pct >= 40 ? '#fbbf24' : '#818cf8'}
                  strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * 20}`}
                  strokeDashoffset={`${2 * Math.PI * 20 * (1 - pct / 100)}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: 'white', lineHeight: 1 }}>{pct}%</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>{totalDone}/{totalAll} done</div>
              <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{totalAll - totalDone} remaining</div>
            </div>

            <button
              onClick={onClose}
              style={{
                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
                color: 'rgba(255,255,255,0.5)', fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.15)'; (e.currentTarget as HTMLElement).style.color = '#f87171' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)' }}
            >✕</button>
          </div>
        </div>

        {/* ── Phase Timeline Rail ── */}
        <div style={{
          display: 'flex', alignItems: 'stretch',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0, overflowX: 'auto', background: 'rgba(0,0,0,0.2)',
        }}>
          {initPhases.map((p, i) => {
            const st = phaseStats(p.id)
            const isActive = p.id === activePhase
            return (
              <button
                key={p.id}
                className="rm-phase-tab"
                onClick={() => { setActivePhase(p.id); setShowAddForm(false); setFilterStatus('all') }}
                style={{
                  flex: 1, minWidth: 140, padding: '12px 16px', textAlign: 'left',
                  background: isActive ? p.gradient : 'transparent',
                  border: 'none', borderBottom: isActive ? `2px solid ${p.accent}` : '2px solid transparent',
                  borderRight: i < initPhases.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  cursor: 'pointer', transition: 'all 0.18s ease',
                  fontFamily: 'inherit', position: 'relative',
                }}
              >
                {/* Phase number dot */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: isActive ? p.accent : 'rgba(255,255,255,0.1)',
                    color: isActive ? '#0a0a1a' : 'rgba(255,255,255,0.4)',
                    fontSize: 10, fontWeight: 900,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{i + 1}</div>
                  <span style={{ fontSize: 11, color: isActive ? p.accent : 'rgba(255,255,255,0.35)', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    {p.shortLabel}
                  </span>
                </div>

                <div style={{ fontSize: 11, color: isActive ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.45)', fontWeight: 600, marginBottom: 3 }}>
                  {p.duration}
                </div>

                {/* Progress bar */}
                <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.07)', overflow: 'hidden', marginTop: 6 }}>
                  <div style={{ height: '100%', width: `${st.pct}%`, background: p.accent, borderRadius: 2, transition: 'width 0.4s ease' }} />
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 4, fontWeight: 600 }}>{st.done}/{st.total}</div>
              </button>
            )
          })}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* ── Phase Subheader ── */}
          <div style={{
            padding: '14px 24px 12px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0, flexWrap: 'wrap', gap: 10,
            background: phase.gradient,
          }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: 'white', margin: 0, letterSpacing: '-0.015em' }}>
                {phase.label}
              </h3>
              <p style={{ fontSize: 11.5, color: phase.accent, margin: '3px 0 0', fontWeight: 600 }}>
                Milestone: {phase.milestone}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {/* Filter buttons */}
              {(['all', 'todo', 'in-progress', 'done'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  style={{
                    padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
                    background: filterStatus === s ? phase.accent : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${filterStatus === s ? 'transparent' : 'rgba(255,255,255,0.09)'}`,
                    color: filterStatus === s ? '#0a0a1a' : 'rgba(255,255,255,0.5)',
                    fontSize: 11, fontWeight: 700, transition: 'all 0.15s', fontFamily: 'inherit',
                  }}
                >
                  {s === 'all' ? 'All' : s === 'in-progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}

              {/* Add Task button */}
              <button
                className="rm-add-btn"
                onClick={() => setShowAddForm(!showAddForm)}
                style={{
                  padding: '5px 14px', borderRadius: 7, border: 'none',
                  background: phase.accent, color: '#0a0a1a',
                  fontSize: 11.5, fontWeight: 800, cursor: 'pointer',
                  transition: 'all 0.15s ease', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                + Add Task
              </button>
            </div>
          </div>

          {/* ── Add Task Form ── */}
          {showAddForm && (
            <div style={{
              padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)',
              background: 'rgba(255,255,255,0.02)', flexShrink: 0,
              animation: 'rmFadeUp 0.2s ease',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <input
                  ref={addInputRef}
                  type="text"
                  placeholder="Task title..."
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTask()}
                  style={{
                    padding: '9px 13px', borderRadius: 8, gridColumn: '1 / -1',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
                    color: 'white', fontSize: 13.5, outline: 'none', fontFamily: 'inherit',
                  }}
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  style={{
                    padding: '8px 12px', borderRadius: 8,
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    color: 'white', fontSize: 12.5, outline: 'none', fontFamily: 'inherit',
                  }}
                />
                <select
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  style={{
                    padding: '8px 12px', borderRadius: 8,
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    color: 'white', fontSize: 12.5, outline: 'none', fontFamily: 'inherit', cursor: 'pointer',
                  }}
                >
                  {Object.keys(TAG_COLORS).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Priority:</span>
                {(['high', 'medium', 'low'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setNewPriority(p)}
                    style={{
                      padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                      background: newPriority === p ? PRIORITY_META[p].color : 'rgba(255,255,255,0.06)',
                      color: newPriority === p ? '#000' : 'rgba(255,255,255,0.5)',
                      fontSize: 11.5, fontWeight: 700, fontFamily: 'inherit', transition: 'all 0.15s',
                    }}
                  >{PRIORITY_META[p].label}</button>
                ))}
                <div style={{ flex: 1 }} />
                <button onClick={() => setShowAddForm(false)} style={{ padding: '6px 12px', borderRadius: 7, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.45)', fontSize: 11.5, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Cancel
                </button>
                <button onClick={addTask} style={{ padding: '6px 16px', borderRadius: 7, border: 'none', background: 'linear-gradient(135deg,#6366f1,#7c3aed)', color: 'white', fontSize: 11.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Add Task
                </button>
              </div>
            </div>
          )}

          {/* ── Tasks Grid ── */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '18px 24px',
            display: 'flex', flexDirection: 'column', gap: 9,
          }}>
            {phaseTasks.length === 0 && (
              <div style={{
                textAlign: 'center', padding: '64px 24px',
                color: 'rgba(255,255,255,0.25)', fontSize: 13.5,
              }}>
                <div style={{ fontSize: 32, marginBottom: 12, color: 'rgba(255,255,255,0.15)' }}>▶</div>
                {filterStatus !== 'all'
                  ? `No ${filterStatus === 'in-progress' ? 'in-progress' : filterStatus} tasks in this phase.`
                  : 'No tasks yet — click '}
                {filterStatus === 'all' && <span style={{ color: phase.accent, fontWeight: 700 }}>+ Add Task</span>}
                {filterStatus === 'all' && ' to begin.'}
              </div>
            )}

            {phaseTasks.map((task, idx) => {
              const sm = STATUS_META[task.status]
              const pm = PRIORITY_META[task.priority]
              const tagColor = TAG_COLORS[task.tag || ''] || '#818cf8'
              const isEditing = editingId === task.id
              return (
                <div
                  key={task.id}
                  className="rm-task-card"
                  style={{
                    padding: '13px 16px', borderRadius: 12,
                    background: task.status === 'done' ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.035)',
                    border: `1px solid ${task.status === 'done' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.09)'}`,
                    transition: 'all 0.15s ease', cursor: 'default',
                    opacity: task.status === 'done' ? 0.72 : 1,
                    animation: `rmFadeUp 0.2s ease ${idx * 0.03}s both`,
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    {/* Status toggle */}
                    <button
                      title="Click to cycle: To Do → In Progress → Done"
                      onClick={() => cycleStatus(task.id)}
                      style={{
                        width: 24, height: 24, borderRadius: 7, flexShrink: 0,
                        background: `${sm.color}20`, border: `1.5px solid ${sm.color}60`,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, color: sm.color, fontWeight: 900,
                        transition: 'all 0.15s', marginTop: 1,
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = `${sm.color}35`)}
                      onMouseLeave={e => (e.currentTarget.style.background = `${sm.color}20`)}
                    >
                      {sm.icon}
                    </button>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Title row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 5 }}>
                        {isEditing ? (
                          <input
                            autoFocus
                            value={editTitle}
                            onChange={e => setEditTitle(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') saveEdit(task.id); if (e.key === 'Escape') setEditingId(null) }}
                            onBlur={() => saveEdit(task.id)}
                            style={{
                              flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(99,102,241,0.5)',
                              borderRadius: 6, color: 'white', fontSize: 13, padding: '3px 8px',
                              outline: 'none', fontFamily: 'inherit', fontWeight: 700,
                            }}
                          />
                        ) : (
                          <span
                            style={{
                              fontSize: 13.5, fontWeight: 700,
                              color: task.status === 'done' ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.9)',
                              textDecoration: task.status === 'done' ? 'line-through' : 'none',
                              cursor: 'text', flex: 1,
                            }}
                            onDoubleClick={() => { setEditingId(task.id); setEditTitle(task.title) }}
                            title="Double-click to edit"
                          >
                            {task.title}
                          </span>
                        )}

                        {/* Badges */}
                        {task.tag && (
                          <span style={{ padding: '2px 7px', borderRadius: 5, background: `${tagColor}18`, color: tagColor, fontSize: 10.5, fontWeight: 700, flexShrink: 0 }}>
                            {task.tag}
                          </span>
                        )}
                        <span style={{ padding: '2px 7px', borderRadius: 5, background: pm.bg, color: pm.color, fontSize: 10.5, fontWeight: 700, flexShrink: 0 }}>
                          {pm.label}
                        </span>
                        <span style={{ padding: '2px 7px', borderRadius: 5, background: `${sm.color}15`, color: sm.color, fontSize: 10.5, fontWeight: 700, flexShrink: 0 }}>
                          {sm.label}
                        </span>
                      </div>

                      {/* Description */}
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.42)', margin: 0, lineHeight: 1.65 }}>
                        {task.description}
                      </p>
                    </div>

                    {/* Actions (visible on hover via CSS) */}
                    <div className="rm-task-actions" style={{ display: 'flex', gap: 4, flexShrink: 0, opacity: 0, transition: 'opacity 0.15s' }}>
                      <button
                        onClick={() => { setEditingId(task.id); setEditTitle(task.title) }}
                        style={{ width: 26, height: 26, borderRadius: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.45)', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Edit title"
                      >✎</button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        style={{ width: 26, height: 26, borderRadius: 6, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Delete task"
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.18)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                      >✕</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── Footer Stats Bar ── */}
          <div style={{
            padding: '10px 24px', borderTop: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(0,0,0,0.15)', flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
          }}>
            {(['done', 'in-progress', 'todo'] as const).map(s => {
              const count = (tasks[activePhase] || []).filter(t => t.status === s).length
              const sm = STATUS_META[s]
              return (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, color: sm.color, fontWeight: 900 }}>{sm.icon}</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>{sm.label}</span>
                  <span style={{ fontSize: 11, color: sm.color, fontWeight: 800 }}>{count}</span>
                </div>
              )
            })}
            <div style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>
              Double-click any task title to edit inline
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
