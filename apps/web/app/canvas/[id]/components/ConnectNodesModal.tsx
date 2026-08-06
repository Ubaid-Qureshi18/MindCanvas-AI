'use client'
import { useState } from 'react'

interface ConnectNodesModalProps {
  nodes: any[]
  onConnect: (sourceId: string, targetId: string, label: string, color: string) => void
  onClose: () => void
}

const RELATIONSHIP_TYPES = [
  { id: 'enables', label: 'Enables / Powers', color: '#22d3ee' },
  { id: 'depends_on', label: 'Depends On / Needs', color: '#f97316' },
  { id: 'mitigates', label: 'Mitigates Risk', color: '#10b981' },
  { id: 'drives', label: 'Drives Revenue', color: '#a78bfa' },
  { id: 'competes', label: 'Competes With', color: '#ec4899' },
]

export default function ConnectNodesModal({ nodes, onConnect, onClose }: ConnectNodesModalProps) {
  const [sourceId, setSourceId] = useState(nodes[0]?.id || '')
  const [targetId, setTargetId] = useState(nodes[1]?.id || '')
  const [relType, setRelType] = useState(RELATIONSHIP_TYPES[0].id)
  const [customLabel, setCustomLabel] = useState('')

  const handleCreate = () => {
    if (!sourceId || !targetId || sourceId === targetId) return
    const rel = RELATIONSHIP_TYPES.find((r) => r.id === relType) || RELATIONSHIP_TYPES[0]
    const label = customLabel.trim() || rel.label
    onConnect(sourceId, targetId, label, rel.color)
    onClose()
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
        zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, backdropFilter: 'blur(10px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 460, borderRadius: 20,
          background: 'rgba(10,10,22,0.99)', border: '1px solid rgba(255,255,255,0.1)',
          padding: 32, boxShadow: '0 24px 60px rgba(0,0,0,0.8)',
          animation: 'fadeIn 0.2s ease',
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 800, color: 'white', marginBottom: 6 }}>Connect Canvas Nodes</h2>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>Define a visual relationship between two ideas</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>From Node (Source)</label>
            <select
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              className="input"
              style={{ width: '100%', background: '#0d0d1a' }}
            >
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.data?.meta?.icon} {n.data?.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>To Node (Target)</label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="input"
              style={{ width: '100%', background: '#0d0d1a' }}
            >
              {nodes.map((n) => (
                <option key={n.id} value={n.id} disabled={n.id === sourceId}>
                  {n.data?.meta?.icon} {n.data?.title} {n.id === sourceId ? '(Same Node)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>Relationship Type</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {RELATIONSHIP_TYPES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRelType(r.id)}
                  style={{
                    padding: '6px 12px', borderRadius: 8,
                    background: relType === r.id ? `${r.color}25` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${relType === r.id ? r.color : 'rgba(255,255,255,0.08)'}`,
                    color: relType === r.id ? r.color : 'rgba(255,255,255,0.6)',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
            <button onClick={onClose} className="btn-secondary">Cancel</button>
            <button
              onClick={handleCreate}
              className="btn-primary"
              disabled={!sourceId || !targetId || sourceId === targetId}
            >
              🔗 Connect Nodes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
