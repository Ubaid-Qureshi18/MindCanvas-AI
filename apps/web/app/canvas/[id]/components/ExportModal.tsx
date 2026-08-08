'use client'
import { useState } from 'react'

interface ExportModalProps {
  canvasTitle: string
  nodes: any[]
  edges: any[]
  onClose: () => void
}

export default function ExportModal({ canvasTitle, nodes, edges, onClose }: ExportModalProps) {
  const [copied, setCopied] = useState(false)

  const cleanText = (t: string) => (t || '').replace(/[*#_~`]/g, '').trim()

  const generateMarkdown = () => {
    let md = `# Executive Strategic Summary: ${canvasTitle}\n\n`
    md += `*Generated on ${new Date().toLocaleDateString()} with MindCanvas Intelligence*\n\n`
    md += `---\n\n`

    nodes.forEach((n, idx) => {
      const meta = n.data?.meta || { icon: '✦', label: 'Node' }
      md += `### ${idx + 1}. ${n.data?.title || 'Untitled'}\n`
      md += `**Category:** ${meta.label}\n\n`
      md += `${cleanText(n.data?.content || '')}\n\n`
      md += `---\n\n`
    })
    return md
  }

  const generateJSON = () => {
    const cleanNodes = nodes.map((n) => ({
      id: n.id,
      type: n.data?.type || 'idea',
      title: n.data?.title || 'Untitled',
      content: n.data?.content || '',
      position: n.position || { x: 0, y: 0 },
    }))
    const cleanEdges = edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label || '',
    }))
    return JSON.stringify({
      canvasTitle,
      exportedAt: new Date().toISOString(),
      nodeCount: cleanNodes.length,
      nodes: cleanNodes,
      connections: cleanEdges,
    }, null, 2)
  }

  const generateHTML = () => {
    let bodyHtml = ''
    nodes.forEach((n, idx) => {
      const meta = n.data?.meta || { icon: '✦', label: 'Node' }
      bodyHtml += `
        <div style="background:#111126; border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:20px; margin-bottom:16px;">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
            <span style="font-size:16px; color:#818cf8;">✦</span>
            <span style="font-weight:bold; font-size:16px; color:#ffffff;">${idx + 1}. ${n.data?.title || 'Untitled'}</span>
            <span style="background:rgba(99,102,241,0.2); color:#a78bfa; font-size:11px; padding:2px 8px; border-radius:12px; margin-left:auto;">${meta.label}</span>
          </div>
          <p style="color:#d1d5db; font-size:13px; line-height:1.7; margin:0; white-space:pre-wrap;">${cleanText(n.data?.content || '')}</p>
        </div>
      `
    })

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${canvasTitle} — Executive Briefing</title>
  <style>
    body { font-family: 'Inter', system-ui, sans-serif; background: #080810; color: #ffffff; padding: 40px; max-width: 900px; margin: 0 auto; }
    h1 { font-size: 26px; margin-bottom: 6px; color: #ffffff; }
    p.subtitle { color: #818cf8; font-size: 13px; margin: 0 0 24px; }
  </style>
</head>
<body>
  <h1>Executive Strategic Briefing: ${canvasTitle}</h1>
  <p class="subtitle">Generated on ${new Date().toLocaleDateString()} by MindCanvas AI Workspace</p>
  ${bodyHtml}
</body>
</html>`
  }

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateMarkdown())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
        zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, backdropFilter: 'blur(16px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 560, borderRadius: 20,
          padding: 32, background: 'rgba(12,12,28,0.99)',
          border: '1px solid rgba(255,255,255,0.11)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.9)',
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'white', margin: 0, letterSpacing: '-0.02em' }}>Export Canvas Report</h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: '4px 0 0' }}>Download or share {canvasTitle}</p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)',
              fontSize: 15, cursor: 'pointer', width: 30, height: 30, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {/* Markdown */}
          <div style={{
            padding: 16, borderRadius: 12,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>Executive Markdown (.md)</div>
              <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Formatted document with sections and notes</div>
            </div>
            <button
              onClick={() => downloadFile(generateMarkdown(), `${canvasTitle.toLowerCase().replace(/\s+/g, '-')}-report.md`, 'text/markdown')}
              style={{ padding: '7px 14px', borderRadius: 8, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Download
            </button>
          </div>

          {/* HTML */}
          <div style={{
            padding: 16, borderRadius: 12,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>HTML Briefing (.html)</div>
              <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Self-contained web report for executive distribution</div>
            </div>
            <button
              onClick={() => downloadFile(generateHTML(), `${canvasTitle.toLowerCase().replace(/\s+/g, '-')}-briefing.html`, 'text/html')}
              style={{ padding: '7px 14px', borderRadius: 8, background: 'rgba(5,150,105,0.15)', border: '1px solid rgba(5,150,105,0.3)', color: '#6ee7b7', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Download
            </button>
          </div>

          {/* JSON */}
          <div style={{
            padding: 16, borderRadius: 12,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>JSON Raw Schema (.json)</div>
              <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Complete node graph data payload</div>
            </div>
            <button
              onClick={() => downloadFile(generateJSON(), `${canvasTitle.toLowerCase().replace(/\s+/g, '-')}-data.json`, 'application/json')}
              style={{ padding: '7px 14px', borderRadius: 8, background: 'rgba(217,119,6,0.15)', border: '1px solid rgba(217,119,6,0.3)', color: '#fde68a', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Download
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={copyToClipboard}
            style={{ flex: 1, padding: '11px', borderRadius: 10, background: copied ? 'rgba(5,150,105,0.2)' : 'rgba(255,255,255,0.06)', border: `1px solid ${copied ? 'rgba(5,150,105,0.4)' : 'rgba(255,255,255,0.1)'}`, color: copied ? '#34d399' : 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            {copied ? '✓ Copied Markdown' : 'Copy Markdown to Clipboard'}
          </button>
          <button
            onClick={onClose}
            style={{ padding: '11px 20px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
