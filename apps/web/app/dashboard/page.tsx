'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

interface Canvas {
  id: string
  title: string
  description: string
  updated_at: string
  created_at: string
  node_count?: number
}

const QUICK_PROMPTS = [
  'Build a SaaS startup for remote teams',
  'Launch an AI-powered e-commerce platform',
  'Create a sustainable food delivery service',
  'Design a healthcare telemedicine app',
  'Build a Web3 gaming platform',
  'Launch a B2B analytics dashboard',
]

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [canvases, setCanvases] = useState<Canvas[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [prompt, setPrompt] = useState(searchParams.get('prompt') || '')
  const [newTitle, setNewTitle] = useState('')
  const [showNewModal, setShowNewModal] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('mc_token')
    if (!token) {
      router.push('/auth/signin')
      return
    }
    const userData = localStorage.getItem('mc_user')
    if (userData) {
      try { setUser(JSON.parse(userData)) } catch {}
    }
    loadCanvases()
  }, [])

  useEffect(() => {
    if (searchParams.get('prompt')) {
      setPrompt(searchParams.get('prompt') || '')
      setShowNewModal(true)
    }
  }, [searchParams])

  const getToken = () => localStorage.getItem('mc_token') || ''
  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  })

  const ensureWorkspace = async (): Promise<string | null> => {
    const cached = localStorage.getItem('mc_workspace_id') || 'ws_demo_1'
    try {
      const wsRes = await fetch(`${API_URL}/api/v1/workspaces`, { headers: authHeaders() })
      if (wsRes.status === 401) { router.push('/auth/signin'); return null }
      if (wsRes.ok) {
        const workspaces = await wsRes.json()
        if (workspaces && workspaces.length > 0) {
          localStorage.setItem('mc_workspace_id', workspaces[0].id)
          return workspaces[0].id
        }
      }
      localStorage.setItem('mc_workspace_id', cached)
      return cached
    } catch {
      localStorage.setItem('mc_workspace_id', cached)
      return cached
    }
  }

  const loadCanvases = async () => {
    setLoading(true)
    setError(null)
    try {
      const workspaceId = await ensureWorkspace()
      if (!workspaceId) return
      let data: any[] = []
      try {
        const canvasRes = await fetch(`${API_URL}/api/v1/canvases/workspace/${workspaceId}`, { headers: authHeaders() })
        if (canvasRes.status === 401) { router.push('/auth/signin'); return }
        if (canvasRes.ok) {
          data = await canvasRes.json()
        }
      } catch {}

      if (!Array.isArray(data) || data.length === 0) {
        // Check local storage canvases
        const local = localStorage.getItem('mc_local_canvases')
        if (local) {
          try { data = JSON.parse(local) } catch {}
        }
      }

      setCanvases(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setError(err.message || 'Failed to load canvases')
    } finally {
      setLoading(false)
    }
  }

  const createCanvas = async () => {
    const title = newTitle.trim() || prompt.trim() || 'Untitled Canvas'
    setCreating(true)
    setError(null)
    let newCanvasId = `canvas_${Date.now()}`
    try {
      let workspaceId = localStorage.getItem('mc_workspace_id') || 'ws_demo_1'
      try {
        const res = await fetch(`${API_URL}/api/v1/canvases/workspace/${workspaceId}`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ title, description: prompt || '' }),
        })
        if (res.ok) {
          const canvas = await res.json()
          newCanvasId = canvas.id
        }
      } catch {}

      // Always ensure local backup canvas exists
      const local = localStorage.getItem('mc_local_canvases')
      let list = local ? JSON.parse(local) : []
      const newCanvasObj = {
        id: newCanvasId,
        title,
        description: prompt || '',
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      }
      list = [newCanvasObj, ...list.filter((c: any) => c.id !== newCanvasId)]
      localStorage.setItem('mc_local_canvases', JSON.stringify(list))

      setShowNewModal(false)
      if (prompt) {
        router.push(`/canvas/${newCanvasId}?prompt=${encodeURIComponent(prompt)}`)
      } else {
        router.push(`/canvas/${newCanvasId}`)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  const deleteCanvas = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Delete this canvas? This cannot be undone.')) return
    try {
      await fetch(`${API_URL}/api/v1/canvases/${id}`, { method: 'DELETE', headers: authHeaders() })
      setCanvases((prev) => prev.filter((c) => c.id !== id))
    } catch (e) {
      console.error('delete error:', e)
    }
  }

  const signOut = () => {
    localStorage.clear()
    router.push('/')
  }

  const timeAgo = (dateStr: string) => {
    if (!dateStr) return 'just now'
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  const PALETTE = ['#6366f1', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#a78bfa']
  const getColor = (title: string) => PALETTE[title.charCodeAt(0) % PALETTE.length]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#07070f' }}>

      {/* ── Topbar ── */}
      <header style={{
        height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 28px', position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(9,9,20,0.98)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(24px)',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'linear-gradient(135deg,#6366f1,#7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'white',
            boxShadow: '0 0 16px rgba(99,102,241,0.35)',
          }}>✦</div>
          <span style={{ fontWeight: 800, fontSize: 17, color: 'white', letterSpacing: '-0.03em' }}>MindCanvas</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 12px', borderRadius: 8,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: 'linear-gradient(135deg,#6366f1,#ec4899)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: 'white',
              }}>
                {(user.full_name || user.email || '?')[0].toUpperCase()}
              </div>
              <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.full_name || user.email}
              </span>
            </div>
          )}
          <button
            onClick={signOut}
            style={{
              padding: '6px 14px', borderRadius: 7, cursor: 'pointer',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.5)', fontSize: 12.5,
              fontFamily: 'inherit',
            }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main style={{ flex: 1, maxWidth: 1200, margin: '0 auto', width: '100%', padding: '44px 28px' }}>

        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              Workspace
            </div>
            <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 6, color: 'white', letterSpacing: '-0.02em' }}>
              Your Canvases
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 14 }}>
              {loading
                ? 'Loading your workspace...'
                : canvases.length === 0
                ? 'Create your first AI-powered canvas'
                : `${canvases.length} canvas${canvases.length !== 1 ? 'es' : ''} in your workspace`}
            </p>
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            style={{
              padding: '10px 20px', borderRadius: 9, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white', fontSize: 13, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
              fontFamily: 'inherit',
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> New Canvas
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            marginBottom: 24, padding: '12px 16px',
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 10, fontSize: 13, color: '#fca5a5',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>!</span> {error}
          </div>
        )}

        {/* Quick Prompts */}
        <div className="glass" style={{
          borderRadius: 16, padding: '16px 22px', marginBottom: 36,
          display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <span style={{ fontSize: 12, color: '#818cf8', fontWeight: 800 }}>✦</span>
            <span style={{ fontSize: 11, color: '#a78bfa', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Quick Templates
            </span>
          </div>
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => { setPrompt(p); setNewTitle(p); setShowNewModal(true) }}
              style={{
                padding: '6px 13px', borderRadius: 8,
                background: 'rgba(99,102,241,0.12)',
                border: '1px solid rgba(99,102,241,0.25)',
                color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s',
                whiteSpace: 'nowrap', fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.28)'
                ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.12)'
                ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Canvas Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="shimmer card-3d" style={{
                height: 190, borderRadius: 16,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
              }} />
            ))}
          </div>
        ) : canvases.length === 0 ? (
          <div
            className="glow-border-3d card-3d"
            style={{
              textAlign: 'center', padding: '80px 32px',
              borderRadius: 24, maxWidth: 600, margin: '40px auto',
            }}
          >
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#818cf8', margin: '0 auto 20px' }}>✦</div>
            <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 12, color: 'white', letterSpacing: '-0.02em' }}>
              No Canvases in Workspace
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 32, fontSize: 14.5, lineHeight: 1.7 }}>
              Create your first strategic canvas — describe an idea<br />and AI will build a complete 12-node visual map.
            </p>
            <button
              onClick={() => setShowNewModal(true)}
              style={{
                padding: '13px 32px', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
                color: 'white', fontSize: 14, fontWeight: 700,
                boxShadow: '0 4px 24px rgba(99,102,241,0.4)',
                fontFamily: 'inherit', letterSpacing: '-0.01em',
              }}
            >
              Create Your First Canvas
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {canvases.map((canvas) => {
              const color = getColor(canvas.title)
              return (
                <Link key={canvas.id} href={`/canvas/${canvas.id}`} style={{ textDecoration: 'none' }}>
                  <div
                    className="card-3d"
                    style={{
                      padding: '22px 24px', height: 195,
                      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                      cursor: 'pointer', position: 'relative', overflow: 'hidden',
                      borderRadius: 18,
                    }}
                  >
                    {/* Accent top line */}
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                      background: `linear-gradient(90deg, ${color}, ${color}80, transparent)`,
                    }} />

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 12,
                          background: `${color}18`, border: `1.5px solid ${color}35`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 15, fontWeight: 800, color: color, flexShrink: 0,
                        }}>
                          ✦
                        </div>
                        <span style={{
                          fontSize: 10.5, fontWeight: 800, color: color,
                          background: `${color}18`, border: `1px solid ${color}30`,
                          padding: '3px 9px', borderRadius: 12,
                          textTransform: 'uppercase', letterSpacing: '0.06em',
                        }}>
                          Active
                        </span>
                      </div>

                      <h3 style={{
                        fontSize: 16, fontWeight: 800, marginBottom: 6,
                        color: 'rgba(255,255,255,0.95)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        letterSpacing: '-0.015em',
                      }}>
                        {canvas.title}
                      </h3>
                      {canvas.description && (
                        <p style={{
                          fontSize: 12.5, color: 'rgba(255,255,255,0.4)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          lineHeight: 1.5,
                        }}>
                          {canvas.description}
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>
                        Updated {timeAgo(canvas.updated_at)}
                      </span>
                      <button
                        onClick={(e) => deleteCanvas(canvas.id, e)}
                        style={{
                          padding: '4px 10px',
                          background: 'rgba(239,68,68,0.08)',
                          border: '1px solid rgba(239,68,68,0.18)',
                          borderRadius: 6, color: '#fca5a5',
                          fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>

      {/* ── New Canvas Modal ── */}
      {showNewModal && (
        <div
          onClick={() => setShowNewModal(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)',
            zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24, backdropFilter: 'blur(10px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              borderRadius: 20, padding: '36px 40px', width: '100%', maxWidth: 540,
              background: 'rgba(10,10,22,0.99)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.7), 0 0 40px rgba(99,102,241,0.08)',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <div style={{ marginBottom: 28 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, color: 'white', marginBottom: 16,
                boxShadow: '0 0 20px rgba(99,102,241,0.35)',
              }}>✦</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, color: 'white', letterSpacing: '-0.01em' }}>
                Create New Canvas
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13.5, lineHeight: 1.6 }}>
                Describe your idea and AI will generate a complete strategic canvas with nodes, connections, and insights.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={{
                  display: 'block', fontSize: 11, fontWeight: 700,
                  color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase',
                  letterSpacing: '0.08em', marginBottom: 7,
                }}>
                  Canvas Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sustainable Fashion Startup"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%', padding: '11px 14px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9,
                    color: 'white', fontSize: 13.5, outline: 'none', fontFamily: 'inherit',
                    boxSizing: 'border-box' as const,
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(99,102,241,0.5)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
              </div>

              <div>
                <label style={{
                  display: 'block', fontSize: 11, fontWeight: 700,
                  color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase',
                  letterSpacing: '0.08em', marginBottom: 7,
                }}>
                  AI Prompt <span style={{ color: 'rgba(255,255,255,0.22)', fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 10.5 }}>(optional — leave blank for empty canvas)</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe your idea in detail for richer AI output..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  style={{
                    width: '100%', padding: '11px 14px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9,
                    color: 'rgba(255,255,255,0.85)', fontSize: 13, outline: 'none',
                    resize: 'vertical', lineHeight: 1.7, fontFamily: 'inherit',
                    boxSizing: 'border-box' as const,
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(99,102,241,0.5)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
              </div>

              {error && (
                <div style={{
                  padding: '10px 14px', background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8,
                  fontSize: 12.5, color: '#fca5a5',
                }}>
                  ⚠️ {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowNewModal(false)}
                  style={{
                    padding: '10px 18px', borderRadius: 8, cursor: 'pointer',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    color: 'rgba(255,255,255,0.55)', fontSize: 13,
                    fontFamily: 'inherit',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={createCanvas}
                  disabled={creating}
                  style={{
                    padding: '10px 22px', borderRadius: 8, border: 'none',
                    cursor: creating ? 'not-allowed' : 'pointer',
                    background: creating ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: 'white', fontSize: 13, fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: 8,
                    fontFamily: 'inherit',
                    boxShadow: creating ? 'none' : '0 4px 16px rgba(99,102,241,0.3)',
                  }}
                >
                  {creating ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Creating...</> : 'Create Canvas'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#07070f', flexDirection: 'column', gap: 16 }}>
        <div className="spinner" style={{ width: 36, height: 36 }} />
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Loading dashboard...</p>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
