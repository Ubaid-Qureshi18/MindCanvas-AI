'use client'
import { useState, useMemo } from 'react'

interface RoadmapTask {
  id: string
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'done'
  priority: 'high' | 'medium' | 'low'
}

interface RoadmapPhase {
  id: string
  label: string
  duration: string
  color: string
  accent: string
  tasks: RoadmapTask[]
}

interface RoadmapModalProps {
  canvasTitle: string
  nodes: any[]
  onClose: () => void
}

const STATUS_COLORS = {
  'todo': { bg: 'rgba(100,116,139,0.15)', border: 'rgba(100,116,139,0.3)', text: '#94a3b8', label: 'To Do' },
  'in-progress': { bg: 'rgba(217,119,6,0.15)', border: 'rgba(217,119,6,0.35)', text: '#fbbf24', label: 'In Progress' },
  'done': { bg: 'rgba(5,150,105,0.15)', border: 'rgba(5,150,105,0.3)', text: '#34d399', label: 'Done' },
}

const PRIORITY_COLORS = {
  'high': { color: '#f87171', label: 'High' },
  'medium': { color: '#fbbf24', label: 'Med' },
  'low': { color: '#6ee7b7', label: 'Low' },
}

function generatePhasesFromNodes(nodes: any[], title: string): RoadmapPhase[] {
  const cleanTitle = (title || 'This Project').replace(/[^\w\s\-]/g, '').trim()

  // Extract key themes from node content
  const ideaNode = nodes.find(n => n.data?.type === 'idea' || n.data?.title?.toLowerCase().includes('concept'))
  const solutionNode = nodes.find(n => n.data?.type === 'solution' || n.data?.title?.toLowerCase().includes('solution'))
  const techNode = nodes.find(n => n.data?.type === 'tech_stack' || n.data?.title?.toLowerCase().includes('tech'))
  const marketingNode = nodes.find(n => n.data?.type === 'marketing' || n.data?.title?.toLowerCase().includes('marketing'))
  const revenueNode = nodes.find(n => n.data?.type === 'revenue' || n.data?.title?.toLowerCase().includes('revenue'))
  const roadmapNode = nodes.find(n => n.data?.type === 'roadmap' || n.data?.title?.toLowerCase().includes('roadmap'))

  const solutionSnippet = solutionNode?.data?.content?.slice(0, 80) || 'core solution'
  const techSnippet = techNode?.data?.content?.slice(0, 80) || 'technical foundation'

  return [
    {
      id: 'phase-1',
      label: 'Phase 1 — Discovery & Foundation',
      duration: 'Weeks 1–4',
      color: 'rgba(99,102,241,0.12)',
      accent: '#818cf8',
      tasks: [
        {
          id: 't1', title: 'Define Problem Statement & ICP',
          description: `Validate core problem hypothesis with 15+ customer interviews. Map pain points for ${cleanTitle}.`,
          status: 'done', priority: 'high',
        },
        {
          id: 't2', title: 'Competitive Intelligence Audit',
          description: 'Complete competitive landscape sweep. Identify 3 primary competitors and 2 market gaps.',
          status: 'done', priority: 'high',
        },
        {
          id: 't3', title: 'Technical Architecture Blueprint',
          description: `Design system architecture. Stack selection: ${techSnippet.slice(0, 60) || 'Next.js, Supabase, Node.js'}.`,
          status: 'in-progress', priority: 'high',
        },
        {
          id: 't4', title: 'Founding Team Roles & Responsibilities',
          description: 'Assign engineering, product, design, and go-to-market ownership across team.',
          status: 'in-progress', priority: 'medium',
        },
      ],
    },
    {
      id: 'phase-2',
      label: 'Phase 2 — MVP Development',
      duration: 'Weeks 5–10',
      color: 'rgba(124,58,237,0.12)',
      accent: '#a78bfa',
      tasks: [
        {
          id: 't5', title: 'Build Core Product Features (v0.1)',
          description: `Implement: ${solutionSnippet.slice(0, 70) || 'primary user-facing feature set'}. Target 3 working flows.`,
          status: 'in-progress', priority: 'high',
        },
        {
          id: 't6', title: 'Auth, Onboarding & User Accounts',
          description: 'Secure signup/signin with email validation, session tokens, and password reset flows.',
          status: 'todo', priority: 'high',
        },
        {
          id: 't7', title: 'Analytics & Event Tracking Setup',
          description: 'Instrument Amplitude / Mixpanel for funnel tracking, session replay, and feature usage heatmaps.',
          status: 'todo', priority: 'medium',
        },
        {
          id: 't8', title: 'Internal QA & Bug Bash Session',
          description: 'Structured cross-browser QA: Chrome, Safari, Firefox, mobile viewports. Log and triage all P1 bugs.',
          status: 'todo', priority: 'medium',
        },
      ],
    },
    {
      id: 'phase-3',
      label: 'Phase 3 — Beta Launch & GTM',
      duration: 'Weeks 11–16',
      color: 'rgba(5,150,105,0.12)',
      accent: '#34d399',
      tasks: [
        {
          id: 't9', title: 'Closed Beta with 50 Design Partners',
          description: 'Onboard ICP users to closed beta. Collect structured NPS scores and churn interviews.',
          status: 'todo', priority: 'high',
        },
        {
          id: 't10', title: 'GTM Channel Activation',
          description: marketingNode?.data?.content?.slice(0, 90) || 'Launch Product Hunt, LinkedIn, and targeted outbound email to first 200 leads.',
          status: 'todo', priority: 'high',
        },
        {
          id: 't11', title: 'Pricing Model & Paywall Integration',
          description: revenueNode?.data?.content?.slice(0, 90) || 'Set up Stripe billing, free tier limits, and pro plan upgrade flow.',
          status: 'todo', priority: 'medium',
        },
        {
          id: 't12', title: 'PR & Thought Leadership Content',
          description: 'Publish 3 founder essays on startup insights. Pitch TechCrunch, The Information, and Hacker News.',
          status: 'todo', priority: 'low',
        },
      ],
    },
    {
      id: 'phase-4',
      label: 'Phase 4 — Scale & Growth',
      duration: 'Months 5–8',
      color: 'rgba(217,119,6,0.1)',
      accent: '#fbbf24',
      tasks: [
        {
          id: 't13', title: 'Series Seed Fundraise ($1–3M)',
          description: 'Prepare investor deck, financial model, and due diligence package. Target 50 warm VC conversations.',
          status: 'todo', priority: 'high',
        },
        {
          id: 't14', title: 'Enterprise Tier & API Access',
          description: 'Build enterprise plan: SSO, audit logs, API rate limits, team admin roles, SLA agreements.',
          status: 'todo', priority: 'medium',
        },
        {
          id: 't15', title: 'Expand to 500 Paying Customers',
          description: 'Drive paid conversion rate to 8%+ from freemium base. Hit $25K MRR milestone.',
          status: 'todo', priority: 'high',
        },
        {
          id: 't16', title: 'International Expansion Research',
          description: 'Evaluate EU, APAC market entry opportunities. GDPR compliance, local payment methods, i18n.',
          status: 'todo', priority: 'low',
        },
      ],
    },
  ]
}

export default function RoadmapModal({ canvasTitle, nodes, onClose }: RoadmapModalProps) {
  const phases = useMemo(() => generatePhasesFromNodes(nodes, canvasTitle), [nodes, canvasTitle])

  const [activePhase, setActivePhase] = useState<string>(phases[0].id)
  const [tasks, setTasks] = useState<Record<string, RoadmapTask[]>>(
    () => Object.fromEntries(phases.map(p => [p.id, p.tasks]))
  )
  const [showAddTask, setShowAddTask] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDesc, setNewTaskDesc] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium')

  const phase = phases.find(p => p.id === activePhase)!
  const phaseTasks = tasks[activePhase] || []

  const totalTasks = Object.values(tasks).flat().length
  const doneTasks = Object.values(tasks).flat().filter(t => t.status === 'done').length
  const inProgressTasks = Object.values(tasks).flat().filter(t => t.status === 'in-progress').length
  const progressPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  const cycleStatus = (taskId: string) => {
    const order: RoadmapTask['status'][] = ['todo', 'in-progress', 'done']
    setTasks(prev => ({
      ...prev,
      [activePhase]: (prev[activePhase] || []).map(t =>
        t.id === taskId ? { ...t, status: order[(order.indexOf(t.status) + 1) % 3] } : t
      ),
    }))
  }

  const addTask = () => {
    if (!newTaskTitle.trim()) return
    const newTask: RoadmapTask = {
      id: `custom-${Date.now()}`,
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim() || 'Custom task added to this phase.',
      status: 'todo',
      priority: newTaskPriority,
    }
    setTasks(prev => ({ ...prev, [activePhase]: [...(prev[activePhase] || []), newTask] }))
    setNewTaskTitle(''); setNewTaskDesc(''); setNewTaskPriority('medium'); setShowAddTask(false)
  }

  const deleteTask = (taskId: string) => {
    setTasks(prev => ({ ...prev, [activePhase]: (prev[activePhase] || []).filter(t => t.id !== taskId) }))
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
        zIndex: 500, display: 'flex', alignItems: 'stretch', justifyContent: 'flex-end',
        backdropFilter: 'blur(18px)',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 900, height: '100%',
          background: '#09091a',
          borderLeft: '1px solid rgba(255,255,255,0.09)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '22px 28px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
          background: 'rgba(255,255,255,0.01)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 15, color: 'white', fontWeight: 800,
              boxShadow: '0 0 20px rgba(99,102,241,0.4)',
            }}>▶</div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'white', margin: 0, letterSpacing: '-0.02em' }}>
                Product Roadmap
              </h2>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>
                {canvasTitle} · AI-generated execution plan
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Overall progress */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: progressPct >= 75 ? '#34d399' : progressPct >= 40 ? '#fbbf24' : '#a78bfa', letterSpacing: '-0.02em' }}>
                {progressPct}%
              </div>
              <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>
                {doneTasks}/{totalTasks} complete
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.55)', fontSize: 14, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >✕</button>
          </div>
        </div>

        {/* Global progress bar */}
        <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <div style={{
            height: '100%', width: `${progressPct}%`,
            background: 'linear-gradient(90deg, #6366f1, #7c3aed)',
            transition: 'width 0.4s ease',
          }} />
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Phase sidebar */}
          <div style={{
            width: 210, flexShrink: 0,
            borderRight: '1px solid rgba(255,255,255,0.07)',
            padding: '16px 10px',
            display: 'flex', flexDirection: 'column', gap: 4,
            overflowY: 'auto',
            background: 'rgba(255,255,255,0.01)',
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 10px', marginBottom: 8 }}>
              Phases
            </div>
            {phases.map(p => {
              const phaseDone = (tasks[p.id] || []).filter(t => t.status === 'done').length
              const phaseTotal = (tasks[p.id] || []).length
              const isActive = p.id === activePhase
              return (
                <button
                  key={p.id}
                  onClick={() => setActivePhase(p.id)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '11px 12px', borderRadius: 10,
                    background: isActive ? p.color : 'transparent',
                    border: isActive ? `1px solid ${p.accent}40` : '1px solid transparent',
                    cursor: 'pointer', transition: 'all 0.15s ease',
                    fontFamily: 'inherit',
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: isActive ? 'white' : 'rgba(255,255,255,0.6)', marginBottom: 4, lineHeight: 1.3 }}>
                    {p.label.split(' — ')[1] || p.label}
                  </div>
                  <div style={{ fontSize: 10.5, color: isActive ? p.accent : 'rgba(255,255,255,0.3)', fontWeight: 500, marginBottom: 6 }}>
                    {p.duration}
                  </div>
                  <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${phaseTotal > 0 ? (phaseDone / phaseTotal) * 100 : 0}%`, background: p.accent, transition: 'width 0.3s ease' }} />
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 4, fontWeight: 600 }}>
                    {phaseDone}/{phaseTotal} done
                  </div>
                </button>
              )
            })}

            {/* Stats pills */}
            <div style={{ marginTop: 'auto', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'Done', value: doneTasks, color: '#34d399' },
                { label: 'In Progress', value: inProgressTasks, color: '#fbbf24' },
                { label: 'To Do', value: totalTasks - doneTasks - inProgressTasks, color: '#94a3b8' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{s.label}</span>
                  <span style={{ fontSize: 11, color: s.color, fontWeight: 800 }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Main tasks panel */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Phase header */}
            <div style={{
              padding: '18px 24px 14px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              background: phase.color,
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: 'white', margin: 0, letterSpacing: '-0.015em' }}>
                    {phase.label}
                  </h3>
                  <p style={{ fontSize: 12, color: phase.accent, margin: '3px 0 0', fontWeight: 600 }}>
                    {phase.duration} · {phaseTasks.filter(t => t.status === 'done').length}/{phaseTasks.length} tasks completed
                  </p>
                </div>
                <button
                  onClick={() => setShowAddTask(!showAddTask)}
                  style={{
                    padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: phase.accent,
                    color: '#05050d', fontSize: 12, fontWeight: 800,
                    transition: 'all 0.15s ease', fontFamily: 'inherit',
                  }}
                >
                  + Add Task
                </button>
              </div>
            </div>

            {/* Add task form */}
            {showAddTask && (
              <div style={{
                padding: '16px 24px',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                background: 'rgba(255,255,255,0.025)',
                flexShrink: 0,
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input
                    type="text"
                    autoFocus
                    placeholder="Task title..."
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addTask()}
                    style={{
                      padding: '9px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontSize: 13.5,
                      outline: 'none', fontFamily: 'inherit',
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Description (optional)"
                    value={newTaskDesc}
                    onChange={e => setNewTaskDesc(e.target.value)}
                    style={{
                      padding: '8px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.09)', color: 'white', fontSize: 12.5,
                      outline: 'none', fontFamily: 'inherit',
                    }}
                  />
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Priority:</span>
                    {(['high', 'medium', 'low'] as const).map(p => (
                      <button
                        key={p}
                        onClick={() => setNewTaskPriority(p)}
                        style={{
                          padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                          background: newTaskPriority === p ? PRIORITY_COLORS[p].color : 'rgba(255,255,255,0.06)',
                          color: newTaskPriority === p ? '#000' : 'rgba(255,255,255,0.5)',
                          fontSize: 11.5, fontWeight: 700, fontFamily: 'inherit',
                          transition: 'all 0.15s',
                        }}
                      >{PRIORITY_COLORS[p].label}</button>
                    ))}
                    <div style={{ flex: 1 }} />
                    <button onClick={() => setShowAddTask(false)} style={{ padding: '6px 12px', borderRadius: 7, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.5)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                      Cancel
                    </button>
                    <button onClick={addTask} style={{ padding: '6px 16px', borderRadius: 7, border: 'none', background: 'linear-gradient(135deg,#6366f1,#7c3aed)', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tasks list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {phaseTasks.length === 0 && (
                <div style={{ textAlign: 'center', padding: '48px 24px', color: 'rgba(255,255,255,0.3)', fontSize: 13.5 }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>▶</div>
                  No tasks yet. Click <strong style={{ color: phase.accent }}>+ Add Task</strong> to get started.
                </div>
              )}

              {phaseTasks.map(task => {
                const s = STATUS_COLORS[task.status]
                const pr = PRIORITY_COLORS[task.priority]
                return (
                  <div
                    key={task.id}
                    style={{
                      padding: '14px 16px', borderRadius: 12,
                      background: 'rgba(255,255,255,0.03)',
                      border: `1px solid rgba(255,255,255,${task.status === 'done' ? '0.05' : '0.08'})`,
                      transition: 'all 0.15s ease',
                      opacity: task.status === 'done' ? 0.7 : 1,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      {/* Status toggle */}
                      <button
                        onClick={() => cycleStatus(task.id)}
                        title="Click to cycle status"
                        style={{
                          width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                          background: s.bg, border: `1.5px solid ${s.border}`,
                          cursor: 'pointer', marginTop: 1,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, color: s.text, fontWeight: 900,
                          transition: 'all 0.15s',
                        }}
                      >
                        {task.status === 'done' ? '✓' : task.status === 'in-progress' ? '◌' : ''}
                      </button>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 5 }}>
                          <span style={{
                            fontSize: 13.5, fontWeight: 700, color: task.status === 'done' ? 'rgba(255,255,255,0.45)' : 'white',
                            textDecoration: task.status === 'done' ? 'line-through' : 'none',
                          }}>
                            {task.title}
                          </span>
                          <span style={{ padding: '2px 8px', borderRadius: 6, background: s.bg, border: `1px solid ${s.border}`, color: s.text, fontSize: 10.5, fontWeight: 700 }}>
                            {s.label}
                          </span>
                          <span style={{ padding: '2px 7px', borderRadius: 6, background: 'rgba(255,255,255,0.05)', color: pr.color, fontSize: 10.5, fontWeight: 700 }}>
                            {pr.label}
                          </span>
                        </div>
                        <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.6 }}>
                          {task.description}
                        </p>
                      </div>

                      <button
                        onClick={() => deleteTask(task.id)}
                        style={{
                          background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)',
                          fontSize: 13, cursor: 'pointer', flexShrink: 0, padding: '2px 4px',
                          borderRadius: 4, transition: 'color 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}
                      >✕</button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Bottom tip bar */}
            <div style={{
              padding: '10px 24px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(255,255,255,0.01)',
              display: 'flex', gap: 20, alignItems: 'center',
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>
                Click the checkbox to cycle: To Do → In Progress → Done
              </span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>·</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>
                Tasks auto-generated from your canvas nodes
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
