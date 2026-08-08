'use client'
import { useCallback, useEffect, useRef, useState, Suspense } from 'react'
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  type Connection,
  type Edge,
  type Node,
  Panel,
  useReactFlow,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import CanvasNode from './components/CanvasNode'
import AIPanel from './components/AIPanel'
import RightPanel from './components/RightPanel'
import AICopilotModal from './components/AICopilotModal'
import PresentationMode from './components/PresentationMode'
import CanvasAuditWidget from './components/CanvasAuditWidget'
import ExportModal from './components/ExportModal'
import ConnectNodesModal from './components/ConnectNodesModal'
import ScenarioSimulatorModal from './components/ScenarioSimulatorModal'

const nodeTypes = { canvasNode: CanvasNode }

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

const NODE_TYPE_META: Record<string, { icon: string; color: string; label: string }> = {
  idea:           { icon: '◆', color: '#6366f1', label: 'Idea' },
  problem:        { icon: '◉', color: '#dc2626', label: 'Problem' },
  solution:       { icon: '◈', color: '#059669', label: 'Solution' },
  target_users:   { icon: '◎', color: '#d97706', label: 'Target Users' },
  market_research:{ icon: '▲', color: '#0891b2', label: 'Market Research' },
  competitor:     { icon: '◇', color: '#7c3aed', label: 'Competitors' },
  business_model: { icon: '▣', color: '#6366f1', label: 'Business Model' },
  revenue:        { icon: '◆', color: '#059669', label: 'Revenue' },
  tech_stack:     { icon: '⬡', color: '#2563eb', label: 'Tech Stack' },
  architecture:   { icon: '⬢', color: '#4f46e5', label: 'Architecture' },
  marketing:      { icon: '▸', color: '#d97706', label: 'Marketing' },
  budget:         { icon: '◈', color: '#0891b2', label: 'Budget' },
  roadmap:        { icon: '▶', color: '#7c3aed', label: 'Roadmap' },
  risks:          { icon: '△', color: '#dc2626', label: 'Risks' },
  swot:           { icon: '◫', color: '#0891b2', label: 'SWOT' },
  pitch_deck:     { icon: '▷', color: '#d97706', label: 'Pitch Deck' },
  tasks:          { icon: '□', color: '#059669', label: 'Tasks' },
  research:       { icon: '◉', color: '#0891b2', label: 'Research' },
  insight:        { icon: '◎', color: '#7c3aed', label: 'Insight' },
  text:           { icon: '─', color: '#64748b', label: 'Text' },
}

function getMeta(type: string) {
  return NODE_TYPE_META[type] || { icon: '📌', color: '#6366f1', label: type || 'Node' }
}

function buildEnhancedNodeContent(title: string, type: string, existingContent: string): string {
  const cleanTitle = title.replace(/[*#_~]/g, '').trim()
  const origSnippet = existingContent && existingContent !== 'No content provided for this node yet.'
    ? `\n\n**Original Note Context:**\n${existingContent.slice(0, 300)}`
    : ''

  switch (type) {
    case 'idea':
      return `## Strategic Blueprint: ${cleanTitle}\n\n• **Core Value Proposition**: Highly scalable solution designed to resolve critical domain friction for targeted user cohorts.\n• **Ideal Customer Profile (ICP)**: Forward-thinking teams and individual power users seeking automated workflow efficiency.\n• **Primary Differentiation**: 10x faster execution cycle with integrated AI intelligence and real-time visual collaboration.\n• **Monetization Engine**: Freemium self-serve tier ($0 → $19/mo) expanding into multi-seat team contracts ($49/seat/mo).\n• **90-Day Execution Priority**: Launch MVP waitlist, secure 50 active design partners, and achieve Week-4 retention above 35%.${origSnippet}`
    case 'problem':
      return `## Friction & Impact Assessment: ${cleanTitle}\n\n• **Core Bottleneck**: Current legacy tools require manual context switching, leading to 4+ hours of wasted productive time per team member weekly.\n• **Financial & Operational Cost**: Estimated $12,000+ annual productivity loss per employee in uncoordinated rework and delayed releases.\n• **Affected Stakeholders**: Product leads, engineering directors, startup founders, and cross-functional project teams.\n• **Validation Metric**: 78% of surveyed domain experts confirm this is a Top 3 operational headache needing immediate software intervention.${origSnippet}`
    case 'solution':
      return `## Architecture & Solution Blueprint: ${cleanTitle}\n\n• **System Capabilities**: Automated visual node generation, contextual AI copilot analysis, and one-click export to pitch presentations.\n• **Key Workflow**: Input single-sentence prompt → AI agent swarm analyzes domain → Infinite visual workspace populates in <3s.\n• **Competitive Advantage**: Zero design friction with interactive drag-and-drop canvas logic and deep RAG knowledge integration.\n• **Success Metrics**: Time-to-first-canvas under 10 seconds; NPS score > 60 among active weekly workspaces.${origSnippet}`
    case 'target_users':
    case 'market_research':
      return `## ICP & Market Dynamics: ${cleanTitle}\n\n• **Primary Persona**: Technical Founders, Product Directors, & Strategic Consultants managing complex multi-variable initiatives.\n• **Total Addressable Market (TAM)**: $14.2B global visual collaboration & AI productivity software market growing at 22% CAGR.\n• **Behavioral Triggers**: Frustration with static document silos, slow team alignment cycles, and manual slide deck creation.\n• **Acquisition Channels**: Organic SEO thought leadership, ProductHunt launches, and viral team invite referral loops.${origSnippet}`
    case 'tech_stack':
    case 'architecture':
      return `## Technical Architecture Spec: ${cleanTitle}\n\n• **Frontend Layer**: Next.js 14+ (App Router), TypeScript, ReactFlow (@xyflow/react), Tailwind CSS for responsive UI.\n• **Backend & AI Layer**: Node.js microservices, PostgreSQL with pgvector, OpenAI GPT-4o + Claude 3.5 Sonnet agent pipeline.\n• **Infrastructure**: Vercel Edge Hosting, Supabase Managed Database with Row-Level Security, Cloudflare CDN protection.\n• **Performance Standards**: API P95 latency < 180ms, 99.95% uptime SLA guarantee, and zero-data-loss CRDT state sync.${origSnippet}`
    default:
      return `## Strategic Enhancement: ${cleanTitle}\n\n• **Executive Summary**: High-priority strategic directive designed to maximize team alignment and operational throughput.\n• **Key Objectives**: (1) Streamline core execution workflow, (2) Eliminate manual friction points, (3) Track quantifiable KPI outcomes.\n• **Implementation Roadmap**: Phase 1 audit & spec signoff → Phase 2 integration & testing → Phase 3 team rollout.\n• **Expected ROI**: 35%+ increase in team velocity and 50% reduction in alignment overhead.${origSnippet}`
  }
}


function CanvasWorkspaceContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const canvasId = params.id as string

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [canvas, setCanvas] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [selectedNodeAction, setSelectedNodeAction] = useState<string | null>(null)

  // Search filter
  const [searchQuery, setSearchQuery] = useState('')

  // Add custom node modal
  const [showAddNodeModal, setShowAddNodeModal] = useState(false)
  const [newNodeType, setNewNodeType] = useState('idea')
  const [newNodeTitle, setNewNodeTitle] = useState('')
  const [newNodeContent, setNewNodeContent] = useState('')

  // 5 New Top-Tier Feature Modals
  const [showCopilot, setShowCopilot] = useState(false)
  const [showPresentation, setShowPresentation] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [showSimulator, setShowSimulator] = useState(false)

  const didGenerate = useRef(false)
  // Use a ref so makeFlowNode always calls the LATEST handleNodeAction (avoids stale closure)
  const handleNodeActionRef = useRef<(action: string, nodeId: string) => Promise<any>>(async () => {})

  const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('mc_token') || '' : '')
  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  })

  // Helper to construct a ReactFlow node object with onAction callback
  const makeFlowNode = useCallback((n: any): Node => {
    return {
      id: n.id,
      type: 'canvasNode',
      position: {
        x: n.position_x ?? n.position?.x ?? Math.random() * 800,
        y: n.position_y ?? n.position?.y ?? Math.random() * 500,
      },
      data: {
        id: n.id,
        type: n.type || 'idea',
        title: n.title || 'Untitled',
        content: n.content || '',
        meta: getMeta(n.type),
        // Use ref wrapper to avoid stale closure - always calls latest handler
        onAction: (action: string, nodeId: string) => handleNodeActionRef.current(action, nodeId),
        hasResearch: n.content?.includes('🔬 Deep Research') || n.type === 'research',
      },
      width: n.width || 360,
      height: n.height || 240,
    }
  }, []) // stable - uses ref to call latest handler

  const makeFlowEdge = (c: any, idx: number): Edge => {
    const src = c.source_node_id || c.source
    const tgt = c.target_node_id || c.target
    return {
      id: c.id || `e-${src}-${tgt}-${idx}`,
      source: src,
      target: tgt,
      type: 'smoothstep',
      animated: true,
      style: { stroke: 'rgba(167,139,250,0.55)', strokeWidth: 2 },
    }
  }

  // ──────────────────────────────── Load canvas ───────────────────────────────
  const loadCanvas = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = getToken()
      if (!token) {
        // Create seamless guest token if none
        localStorage.setItem('mc_token', `token_guest_${Date.now()}`)
      }

      let data: any = null
      try {
        const res = await fetch(`${API_URL}/api/v1/canvases/${canvasId}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        })
        if (res.ok) data = await res.json()
      } catch {}

      if (!data || !Array.isArray(data.nodes) || data.nodes.length === 0) {
        // Look up local storage title or default to AI Legal Auditor demo
        const localCanvases = localStorage.getItem('mc_local_canvases')
        const list = localCanvases ? JSON.parse(localCanvases) : []
        const found = list.find((c: any) => c.id === canvasId)
        const demo = getLocalDemoCanvas(found?.title || 'AI Legal Auditor')
        data = {
          id: canvasId,
          title: found?.title || demo.canvas_title || 'AI Legal Auditor',
          description: found?.description || '',
          nodes: demo.nodes,
          connections: demo.connections,
        }
      }

      setCanvas(data)
      setNodes((data.nodes || []).map(makeFlowNode))
      setEdges((data.connections || []).map(makeFlowEdge))
    } catch (err: any) {
      const demo = getLocalDemoCanvas('AI Legal Auditor')
      setCanvas({ id: canvasId, title: 'AI Legal Auditor', nodes: demo.nodes, connections: demo.connections })
      setNodes(demo.nodes.map(makeFlowNode))
      setEdges(demo.connections.map(makeFlowEdge))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadCanvas() }, [canvasId])

  // Auto-generate from URL prompt
  useEffect(() => {
    const prompt = searchParams.get('prompt')
    if (prompt && !didGenerate.current && !loading && !generating) {
      if (nodes.length === 0) {
        didGenerate.current = true
        generateCanvas(prompt)
      }
    }
  }, [loading])

  // Keyboard shortcut Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setError(null)
        setSelectedNodeId(null)
        setShowAddNodeModal(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // ──────────────────────────────── Generate ──────────────────────────────────
  const generateCanvas = async (prompt: string) => {
    if (generating || !prompt.trim()) return
    setGenerating(true)
    setError(null)

    try {
      let aiResult: any = null
      try {
        const res = await fetch(`${API_URL}/api/v1/ai/generate-canvas`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ prompt: prompt.trim(), canvasId }),
        })
        if (res.ok) {
          aiResult = await res.json()
        }
      } catch {}

      if (!aiResult || !Array.isArray(aiResult.nodes) || aiResult.nodes.length === 0) {
        // Rich local fallback generation
        aiResult = getLocalDemoCanvas(prompt.trim())
      }

      const { nodes: rawNodes = [], connections: rawConns = [], canvas_title } = aiResult

      const flowNodes = rawNodes.map(makeFlowNode)
      const flowEdges = rawConns.map(makeFlowEdge)
      setNodes(flowNodes)
      setEdges(flowEdges)

      if (canvas_title) {
        setCanvas((prev: any) => ({ ...prev, title: canvas_title }))
      }

      setSaveStatus('saved')

      // Save to local cache in background
      try {
        const localCanvases = localStorage.getItem('mc_local_canvases')
        let list = localCanvases ? JSON.parse(localCanvases) : []
        const updated = {
          id: canvasId,
          title: canvas_title || prompt.trim(),
          description: prompt.trim(),
          updated_at: new Date().toISOString(),
        }
        list = [updated, ...list.filter((c: any) => c.id !== canvasId)]
        localStorage.setItem('mc_local_canvases', JSON.stringify(list))
      } catch {}

    } catch (err: any) {
      const fallback = getLocalDemoCanvas(prompt.trim())
      setNodes(fallback.nodes.map(makeFlowNode))
      setEdges(fallback.connections.map(makeFlowEdge))
      if (fallback.canvas_title) setCanvas((prev: any) => ({ ...prev, title: fallback.canvas_title }))
    } finally {
      setGenerating(false)
    }
  }

  // ──────────────────────────────── Node Actions ──────────────────────────────
  const handleNodeAction = async (action: string, nodeId: string): Promise<any> => {
    setSelectedNodeId(nodeId)

    if (action === 'delete') {
      if (confirm('Delete this node?')) {
        setNodes((nds) => nds.filter((n) => n.id !== nodeId))
        setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId))
        setSelectedNodeId(null)
        try {
          await fetch(`${API_URL}/api/v1/nodes/${nodeId}`, {
            method: 'DELETE',
            headers: authHeaders(),
          })
        } catch {}
      }
      return
    }

    if (action === 'research') {
      // Open right panel and auto-navigate to research tab
      setSelectedNodeId(nodeId)
      setSelectedNodeAction('research')
      return
    }

    const targetNode = nodes.find((n) => n.id === nodeId)
    const nodeTitle = targetNode?.data?.title || 'Node'
    const nodeContent = String(targetNode?.data?.content || '')

    if (action === 'expand') {
      try {
        const res = await fetch(`${API_URL}/api/v1/nodes/${nodeId}/expand`, {
          method: 'POST',
          headers: authHeaders(),
        }).catch(() => null)

        let childList: any[] = []
        if (res && res.ok) {
          const data = await res.json()
          childList = data.children || data.subNodes || data.nodes || []
        }

        if (!childList || childList.length === 0) {
          childList = [
            {
              id: `node_sub_1_${Date.now()}`,
              type: 'solution',
              title: `${nodeTitle} — Core Architecture`,
              content: `Technical & operational blueprint for ${nodeTitle}. Primary focus on high throughput, modular extensibility, and low-latency response cycles.`,
            },
            {
              id: `node_sub_2_${Date.now()}`,
              type: 'tasks',
              title: `${nodeTitle} — Key Deliverables`,
              content: `Concrete deliverable milestones: (1) Architecture audit & spec signoff, (2) Automated workflow integration, (3) E2E QA testing & performance benchmarking.`,
            },
            {
              id: `node_sub_3_${Date.now()}`,
              type: 'risks',
              title: `${nodeTitle} — Risk & Mitigation`,
              content: `Risk mitigation protocol for ${nodeTitle}. Rating: Moderate. Strategy: Continuous health monitoring, automated fallback routines, and strict SLA bounds.`,
            },
          ]
        }

        const px = targetNode?.position.x || 400
        const py = targetNode?.position.y || 200

        const newFlowNodes: Node[] = []
        const newFlowEdges: Edge[] = []

        childList.forEach((child: any, idx: number) => {
          const childNode = makeFlowNode({
            ...child,
            position: { x: px + 420, y: py + idx * 240 },
          })
          newFlowNodes.push(childNode)
          newFlowEdges.push({
            id: `e-${nodeId}-${childNode.id}`,
            source: nodeId,
            target: childNode.id,
            label: 'sub-component',
            type: 'smoothstep',
            style: { stroke: 'rgba(167,139,250,0.5)', strokeWidth: 1.5 },
          })
        })

        setNodes((nds) => [...nds, ...newFlowNodes])
        setEdges((eds) => [...eds, ...newFlowEdges])
        return { success: true, count: childList.length }
      } catch (e: any) {
        console.error('expand error:', e)
      }
      return
    }

    if (action === 'improve') {
      try {
        const res = await fetch(`${API_URL}/api/v1/nodes/${nodeId}/improve`, {
          method: 'POST',
          headers: authHeaders(),
        }).catch(() => null)

        let improvedContent = ''
        if (res && res.ok) {
          const updated = await res.json()
          improvedContent = updated.content
        }

        if (!improvedContent || improvedContent.length < 20) {
          improvedContent = buildEnhancedNodeContent(
            String(targetNode?.data?.title || 'Node'),
            String(targetNode?.data?.type || 'idea'),
            String(nodeContent || '')
          )
        }

        updateNodeData(nodeId, { content: improvedContent })
        return { content: improvedContent }
      } catch (e: any) {
        console.error('improve error:', e)
      }
      return
    }

    if (action === 'simplify') {
      try {
        const res = await fetch(`${API_URL}/api/v1/nodes/${nodeId}/simplify`, {
          method: 'POST',
          headers: authHeaders(),
        }).catch(() => null)

        let simplifiedContent = ''
        if (res && res.ok) {
          const updated = await res.json()
          simplifiedContent = updated.content
        }

        if (!simplifiedContent || simplifiedContent.length < 20) {
          const title = targetNode?.data?.title || 'Node'
          const cleanBody = nodeContent.replace(/[*#_~]/g, '').trim()
          const snippet = cleanBody.split('.')[0] || cleanBody
          simplifiedContent = `## Executive Summary: ${title}\n\n• **Core Concept**: ${snippet.slice(0, 160)}.\n• **Strategic Value**: High-leverage component designed to accelerate time-to-market and reduce execution risk.\n• **Primary KPI**: 40%+ improvement in operational throughput.\n• **Immediate Action**: Review weekly milestones and assign owner.`
        }

        updateNodeData(nodeId, { content: simplifiedContent })
        return { content: simplifiedContent }
      } catch (e: any) {
        console.error('simplify error:', e)
      }
      return
    }

    if (action === 'generate-tasks') {
      try {
        const res = await fetch(`${API_URL}/api/v1/nodes/${nodeId}/generate-tasks`, {
          method: 'POST',
          headers: authHeaders(),
        }).catch(() => null)

        if (res && res.ok) {
          const data = await res.json()
          return data
        }

        const title = targetNode?.data?.title || 'Node'
        return {
          tasks: [
            { title: `Audit & finalize technical spec for ${title}`, description: 'Review core parameters, verify dependencies, and validate compatibility with overall system architecture.', priority: 'high', effort: '1d' },
            { title: `Build functional prototype for ${title}`, description: 'Implement primary logic layer, design UI mockups, and connect data handlers.', priority: 'high', effort: '3d' },
            { title: `Set up automated testing & telemetry for ${title}`, description: 'Create unit test suites, edge case verification scripts, and error monitoring alerts.', priority: 'medium', effort: '2d' },
            { title: `Conduct security & compliance review for ${title}`, description: 'Perform access control checks, audit data permissions, and document compliance status.', priority: 'medium', effort: '1d' },
            { title: `Deploy to staging & conduct user acceptance test`, description: 'Run staging deployment, gather user feedback, and log optimization tickets.', priority: 'low', effort: '1d' },
          ],
        }
      } catch (e: any) {
        console.error('generate-tasks error:', e)
      }
      return
    }
  }

  // Keep ref in sync with the latest handleNodeAction
  useEffect(() => {
    handleNodeActionRef.current = handleNodeAction
  })

  // ──────────────────────── Update Node Content ──────────────────────────────
  const updateNodeData = (nodeId: string, updates: { title?: string; content?: string }) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === nodeId) {
          const newContent = updates.content !== undefined ? updates.content : n.data.content
          const newTitle = updates.title !== undefined ? updates.title : n.data.title
          return {
            ...n,
            data: {
              ...n.data,
              title: newTitle,
              content: newContent,
              hasResearch: typeof newContent === 'string' && newContent.includes('🔬 Deep Research'),
            },
          }
        }
        return n;
      })
    )

    // Save to API
    fetch(`${API_URL}/api/v1/nodes/${nodeId}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(updates),
    }).catch(() => {})
  }

  // ──────────────────────── Add Node from AI Copilot / Scorecard ──────────────────────
  const handleAddCopilotNode = (title: string, content: string, type: string = 'idea') => {
    const newId = `node_${Date.now()}`
    const rawNode = {
      id: newId,
      canvas_id: canvasId,
      type,
      title,
      content,
      position: { x: 250 + Math.random() * 200, y: 200 + Math.random() * 150 },
      width: 360,
      height: 240,
    }
    const flowNode = makeFlowNode(rawNode)
    setNodes((nds) => [...nds, flowNode])
    try {
      fetch(`${API_URL}/api/v1/nodes/canvas/${canvasId}`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(rawNode),
      })
    } catch {}
  }

  const handleCustomConnect = (sourceId: string, targetId: string, label: string, color: string) => {
    const newEdge: Edge = {
      id: `e-${sourceId}-${targetId}-${Date.now()}`,
      source: sourceId,
      target: targetId,
      label,
      type: 'smoothstep',
      style: { stroke: color || 'rgba(99,102,241,0.6)', strokeWidth: 2 },
      labelStyle: { fill: color || '#a78bfa', fontSize: 11, fontWeight: 700 },
    }
    setEdges((eds) => addEdge(newEdge, eds))
  }

  // ──────────────────────── Add Custom Node ─────────────────────────────────
  const handleAddCustomNode = async () => {
    if (!newNodeTitle.trim()) return
    const newId = `node_${Date.now()}`
    const rawNode = {
      id: newId,
      canvas_id: canvasId,
      type: newNodeType,
      title: newNodeTitle.trim(),
      content: newNodeContent.trim() || 'Custom canvas node created by user.',
      position: { x: 300 + Math.random() * 200, y: 200 + Math.random() * 150 },
      width: 360,
      height: 240,
    }

    const flowNode = makeFlowNode(rawNode)
    setNodes((nds) => [...nds, flowNode])
    setShowAddNodeModal(false)
    setNewNodeTitle('')
    setNewNodeContent('')

    // Save to API
    try {
      await fetch(`${API_URL}/api/v1/nodes/canvas/${canvasId}`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(rawNode),
      })
    } catch {}
  }

  // ──────────────────────── Auto-Arrange Layout ──────────────────────────────
  const autoArrangeLayout = () => {
    const cols = 3
    const spacingX = 460
    const spacingY = 320
    const startX = 60
    const startY = 60

    setNodes((nds) => {
      const arranged = nds.map((n, i) => {
        const col = i % cols
        const row = Math.floor(i / cols)
        return {
          ...n,
          position: {
            x: startX + col * spacingX,
            y: startY + row * spacingY,
          },
        }
      })

      // Persist all positions to API in background
      arranged.forEach((n) => {
        fetch(`${API_URL}/api/v1/nodes/${n.id}`, {
          method: 'PATCH',
          headers: authHeaders(),
          body: JSON.stringify({ position: n.position }),
        }).catch(() => {})
      })

      return arranged
    })
  }

  // ──────────────────────── Export Canvas ────────────────────────────────────
  const exportCanvasMarkdown = () => {
    const title = canvas?.title || 'Canvas Export'
    let md = `# ${title}\n\n*Generated with MindCanvas*\n\n---\n\n`

    nodes.forEach((n: any, idx: number) => {
      md += `## ${idx + 1}. ${n.data.meta?.icon || '📌'} ${n.data.title}\n`
      md += `**Type:** ${n.data.meta?.label || n.data.type}\n\n`
      md += `${n.data.content}\n\n---\n\n`
    })

    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ──────────────────────── Node drag position save ─────────────────────────
  const onNodeDragStop = useCallback((_: any, node: Node) => {
    // Persist position to API after drag
    fetch(`${API_URL}/api/v1/nodes/${node.id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ position: node.position }),
    }).catch(() => {})
  }, [canvasId])

  // ──────────────────────── Connect nodes ────────────────────────────────────
  const onConnect = useCallback(async (params: Connection) => {
    if (!params.source || !params.target) return
    const newEdge: Edge = {
      ...params,
      id: `e-${params.source}-${params.target}-${Date.now()}`,
      type: 'smoothstep',
      style: { stroke: 'rgba(99,102,241,0.5)', strokeWidth: 1.5 },
    }
    setEdges((eds) => addEdge(newEdge, eds))
    try {
      await fetch(`${API_URL}/api/v1/connections`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ canvas_id: canvasId, source_node_id: params.source, target_node_id: params.target }),
      })
    } catch {}
  }, [canvasId])

  const selectedNode = nodes.find((n) => n.id === selectedNodeId)

  // Search: used only for visual highlighting, NOT for filtering nodes from the graph
  const filteredNodeIds = searchQuery.trim()
    ? new Set(
        nodes
          .filter((n: any) => {
            const q = searchQuery.toLowerCase()
            return (
              n.data.title?.toLowerCase().includes(q) ||
              String(n.data.content || '').toLowerCase().includes(q) ||
              n.data.meta?.label?.toLowerCase().includes(q)
            )
          })
          .map((n) => n.id)
      )
    : null

  // ──────────────────────────────── Render ──────────────────────────────────
  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: '#06060e' }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Loading visual workspace...</p>
      </div>
    )
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#06060e' }}>
      {/* ── Topbar ── */}
      <header style={{
        height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', position: 'relative', zIndex: 10,
        background: 'rgba(9,9,20,0.98)', borderBottom: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(24px)', gap: 12, overflowX: 'auto',
      }}>
        {/* Left: nav + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <Link
            href="/dashboard"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              color: 'rgba(255,255,255,0.45)', textDecoration: 'none',
              fontSize: 12.5, fontWeight: 600, transition: 'color 0.2s',
              padding: '5px 10px', borderRadius: 7,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              whiteSpace: 'nowrap',
            }}
          >
            ← Dashboard
          </Link>
          <span style={{ color: 'rgba(255,255,255,0.12)', fontSize: 18 }}>|</span>
          <span style={{
            fontWeight: 700, fontSize: 14,
            color: 'rgba(255,255,255,0.9)',
            maxWidth: 320,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {(canvas?.title || 'Canvas').trim()}
          </span>
        </div>

        {/* Center: Search */}
        <div style={{ flex: 1, maxWidth: 300, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'rgba(255,255,255,0.28)', pointerEvents: 'none', fontWeight: 700 }}>⌕</span>
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '7px 12px 7px 30px',
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${searchQuery ? 'rgba(99,102,241,0.45)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 8, color: 'white', fontSize: 12,
              outline: 'none', fontFamily: 'inherit',
              boxSizing: 'border-box' as const,
              transition: 'border-color 0.2s',
            }}
          />
          {filteredNodeIds && (
            <span style={{
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              fontSize: 10, fontWeight: 700, color: '#a78bfa',
              background: 'rgba(99,102,241,0.15)', padding: '2px 6px', borderRadius: 10,
              pointerEvents: 'none',
            }}>
              {filteredNodeIds.size}/{nodes.length}
            </span>
          )}
        </div>

        {/* Right: actions & features */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {/* AI status badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '5px 12px', borderRadius: 8,
            background: 'rgba(99,102,241,0.09)',
            border: '1px solid rgba(99,102,241,0.22)',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', display: 'inline-block', flexShrink: 0 }} />
            <span style={{ fontSize: 11.5, fontWeight: 600, color: 'rgba(167,139,250,0.85)', letterSpacing: '0.01em' }}>
              AI Active
            </span>
          </div>

          {/* Feature 3: Health Scorecard */}
          <CanvasAuditWidget
            nodes={nodes}
            onAutoFillMissing={(missingType) => {
              const meta = getMeta(missingType)
              handleAddCopilotNode(`${meta.label} Analysis`, `Generated strategic ${meta.label.toLowerCase()} component for your canvas.`, missingType)
            }}
          />

          {/* AI Copilot */}
          <button
            onClick={() => setShowCopilot(true)}
            style={{
              padding: '7px 14px', borderRadius: 8, cursor: 'pointer',
              background: 'rgba(99,102,241,0.12)',
              border: '1px solid rgba(99,102,241,0.3)',
              color: '#a5b4fc', fontSize: 12.5, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.18s ease',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.2)'; (e.currentTarget as HTMLElement).style.color = '#c7d2fe' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.12)'; (e.currentTarget as HTMLElement).style.color = '#a5b4fc' }}
          >
            AI Copilot
          </button>

          {/* AI Simulator */}
          <button
            onClick={() => setShowSimulator(true)}
            style={{
              padding: '7px 14px', borderRadius: 8, cursor: 'pointer',
              background: 'rgba(5,150,105,0.1)',
              border: '1px solid rgba(5,150,105,0.3)',
              color: '#6ee7b7', fontSize: 12.5, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.18s ease',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(5,150,105,0.18)'; (e.currentTarget as HTMLElement).style.color = '#a7f3d0' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(5,150,105,0.1)'; (e.currentTarget as HTMLElement).style.color = '#6ee7b7' }}
          >
            Simulator
          </button>

          {/* Pitch Deck */}
          <button
            onClick={() => setShowPresentation(true)}
            style={{
              padding: '7px 14px', borderRadius: 8, cursor: 'pointer',
              background: 'rgba(217,119,6,0.1)',
              border: '1px solid rgba(217,119,6,0.28)',
              color: '#fbbf24', fontSize: 12.5, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.18s ease',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(217,119,6,0.18)'; (e.currentTarget as HTMLElement).style.color = '#fde68a' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(217,119,6,0.1)'; (e.currentTarget as HTMLElement).style.color = '#fbbf24' }}
          >
            Pitch Deck
          </button>

          {/* Add Node */}
          <button
            onClick={() => setShowAddNodeModal(true)}
            style={{
              padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
              color: 'white', fontSize: 12.5, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
              transition: 'all 0.18s ease',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 22px rgba(99,102,241,0.5)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(99,102,241,0.35)'; (e.currentTarget as HTMLElement).style.transform = '' }}
          >
            + Add node
          </button>

          {/* Export */}
          <button
            onClick={() => setShowExportModal(true)}
            style={{
              padding: '7px 13px', borderRadius: 8, cursor: 'pointer',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.11)',
              color: 'rgba(255,255,255,0.65)', fontSize: 12.5, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.18s ease',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.09)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.85)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.65)' }}
          >
            Export
          </button>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 10,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.09)',
          }}>
            <span style={{ fontSize: 10, color: saveStatus === 'saved' ? '#10b981' : saveStatus === 'saving' ? '#f59e0b' : 'rgba(255,255,255,0.3)', fontWeight: 900 }}>
              {saveStatus === 'saved' ? '●' : saveStatus === 'saving' ? '◌' : '○'}
            </span>
            <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>
              {saveStatus === 'saved' ? 'Saved' : saveStatus === 'saving' ? 'Saving...' : 'Unsaved'}
            </span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>·</span>
            <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>{nodes.length} nodes</span>
          </div>
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div style={{
          padding: '9px 18px', background: 'rgba(220,38,38,0.08)', borderBottom: '1px solid rgba(220,38,38,0.18)',
          fontSize: 12.5, color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 14, fontWeight: 700 }}>!</span> {error}</span>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: 'rgba(248,113,113,0.7)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '0 4px' }}>×</button>
        </div>
      )}

      {/* ── Canvas Main View ── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDragStop={onNodeDragStop}
          onConnect={onConnect}
          onNodeClick={(_, node) => setSelectedNodeId(node.id)}
          onPaneClick={() => setSelectedNodeId(null)}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.18, maxZoom: 0.85 }}
          minZoom={0.05}
          maxZoom={2.5}
          style={{ background: '#06060e' }}
          defaultEdgeOptions={{
            type: 'smoothstep',
            style: { stroke: 'rgba(99,102,241,0.55)', strokeWidth: 2 },
            animated: false,
          }}
          proOptions={{ hideAttribution: true }}
          deleteKeyCode="Delete"
        >
          <Background
            variant={BackgroundVariant.Lines}
            color="rgba(255,255,255,0.03)"
            gap={40}
            style={{ opacity: 1 }}
          />
          <MiniMap
            style={{ background: '#0c0c1e', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}
            nodeColor={(n: any) => getMeta(n.data?.type).color}
            maskColor="rgba(6,6,14,0.8)"
          />
          <Controls
            style={{
              background: 'rgba(12,12,24,0.96)', borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.09)', backdropFilter: 'blur(16px)',
            }}
          />

          {/* Floating Tools Panel */}
          <Panel position="top-right">
            <div style={{
              display: 'flex', gap: 5, padding: 5,
              background: 'rgba(9,9,20,0.95)',
              border: '1px solid rgba(255,255,255,0.09)', borderRadius: 10,
              backdropFilter: 'blur(20px)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            }}>
              <button
                onClick={autoArrangeLayout}
                title="Auto arrange nodes"
                style={{
                  padding: '6px 12px', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7,
                  color: 'rgba(255,255,255,0.7)', fontSize: 11, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 5, fontWeight: 500,
                  transition: 'all 0.15s',
                }}
              >
                ⊞ Auto Arrange
              </button>

              {/* Feature 5: Visual Node Connector */}
              <button
                onClick={() => setShowConnectModal(true)}
                title="Create custom connection between nodes"
                style={{
                  padding: '6px 12px', background: 'rgba(99,102,241,0.12)',
                  border: '1px solid rgba(99,102,241,0.25)', borderRadius: 7,
                  color: '#a78bfa', fontSize: 11, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600,
                  transition: 'all 0.15s',
                }}
              >
                🔗 Link Nodes
              </button>
            </div>
          </Panel>

          {/* Generating overlay */}
          {generating && (
            <Panel position="top-center">
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 22px',
                background: 'rgba(9,9,20,0.98)', border: '1px solid rgba(99,102,241,0.35)',
                borderRadius: 12, backdropFilter: 'blur(24px)',
                boxShadow: '0 0 40px rgba(99,102,241,0.2), 0 4px 20px rgba(0,0,0,0.4)',
              }}>
                <div className="spinner" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>✦ AI is building your canvas...</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Generating nodes and connections</div>
                </div>
              </div>
            </Panel>
          )}

          {/* Empty state — 3D Glassmorphic Container */}
          {!generating && nodes.length === 0 && (
            <Panel position="top-center">
              <div
                className="glow-border-3d card-3d"
                style={{
                  textAlign: 'center', padding: '36px 40px',
                  maxWidth: 520, borderRadius: 24, marginTop: 40,
                }}
              >
                <div className="brain-float-3d" style={{ fontSize: 64, marginBottom: 14 }}>🧠</div>
                <h2 style={{ fontSize: 24, fontWeight: 900, color: 'white', marginBottom: 8, letterSpacing: '-0.02em' }}>
                  Your Strategic Canvas is Ready
                </h2>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, marginBottom: 20 }}>
                  Describe your startup or product idea in the prompt bar below,<br />or select a 1-click template to generate a complete visual map.
                </p>

                {/* 1-Click Starter Templates */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
                  {[
                    { label: '🚀 AI Legal Auditor', prompt: 'AI Legal Auditor for SMB contract review' },
                    { label: '🤖 SaaS Collaboration', prompt: 'B2B SaaS startup for remote team collaboration' },
                    { label: '🛒 DTC Nutrition Subscriptions', prompt: 'DTC personalized nutrition and food subscriptions' },
                    { label: '💼 Freelancer Financial Copilot', prompt: 'Automated accounting and tax optimization for freelancers' },
                  ].map((t) => (
                    <button
                      key={t.label}
                      onClick={() => generateCanvas(t.prompt)}
                      style={{
                        padding: '7px 14px', borderRadius: 20,
                        background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
                        color: '#c4b5fd', fontSize: 11.5, fontWeight: 600,
                        cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.25)'
                        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.12)'
                        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                  <button
                    onClick={() => generateCanvas(canvas?.title && canvas.title !== 'Canvas' ? canvas.title : 'AI Legal Auditor')}
                    style={{
                      padding: '11px 22px', borderRadius: 10, border: 'none', cursor: 'pointer',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)',
                      color: 'white', fontSize: 13, fontWeight: 800,
                      boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
                    }}
                  >
                    ✨ Build Canvas Map
                  </button>
                  <button
                    onClick={() => setShowAddNodeModal(true)}
                    className="btn-secondary"
                    style={{ padding: '11px 18px', fontSize: 13, fontWeight: 600 }}
                  >
                    + Add Node Manually
                  </button>
                </div>
              </div>
            </Panel>
          )}
        </ReactFlow>

        {/* Selected Node Right Detail Panel */}
        {selectedNode && (
          <RightPanel
            node={{
              id: selectedNode.id,
              type: selectedNode.data.type,
              title: selectedNode.data.title,
              content: selectedNode.data.content,
              meta: selectedNode.data.meta,
            }}
            initialTab={selectedNodeAction === 'research' ? 'research' : undefined}
            onClose={() => { setSelectedNodeId(null); setSelectedNodeAction(null) }}
            onAction={handleNodeAction}
            onUpdateNode={updateNodeData}
          />
        )}
      </div>

      {/* ── AI Prompt Bar ── */}
      <AIPanel onGenerate={generateCanvas} generating={generating} />

      {/* ── Add Custom Node Modal ── */}
      {showAddNodeModal && (
        <div
          onClick={() => setShowAddNodeModal(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backdropFilter: 'blur(8px)' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-strong"
            style={{ borderRadius: 20, padding: 32, width: '100%', maxWidth: 480 }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6, color: 'white' }}>Add Custom Node</h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginBottom: 20 }}>Create a new node on your visual canvas</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.65)', marginBottom: 6 }}>Node Type</label>
                <select
                  value={newNodeType}
                  onChange={(e) => setNewNodeType(e.target.value)}
                  className="input"
                  style={{ width: '100%', background: '#0d0d1a' }}
                >
                  {Object.entries(NODE_TYPE_META).map(([type, meta]) => (
                    <option key={type} value={type}>
                      {meta.icon} {meta.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.65)', marginBottom: 6 }}>Node Title</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. AI Customer Service Bot"
                  value={newNodeTitle}
                  onChange={(e) => setNewNodeTitle(e.target.value)}
                  autoFocus
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.65)', marginBottom: 6 }}>Content (optional)</label>
                <textarea
                  className="input"
                  rows={4}
                  placeholder="Describe the details for this node..."
                  value={newNodeContent}
                  onChange={(e) => setNewNodeContent(e.target.value)}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
                <button onClick={() => setShowAddNodeModal(false)} className="btn-secondary">Cancel</button>
                <button onClick={handleAddCustomNode} className="btn-primary" disabled={!newNodeTitle.trim()}>
                  ✨ Add Node
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ── Feature 1: AI Copilot Modal ── */}
      {showCopilot && (
        <AICopilotModal
          canvasTitle={canvas?.title || 'Canvas'}
          nodes={nodes}
          onClose={() => setShowCopilot(false)}
          onAddNode={handleAddCopilotNode}
        />
      )}

      {/* ── Feature 2: Presentation Mode ── */}
      {showPresentation && (
        <PresentationMode
          canvasTitle={canvas?.title || 'Canvas'}
          nodes={nodes}
          onClose={() => setShowPresentation(false)}
        />
      )}

      {/* ── Feature 4: Export Modal ── */}
      {showExportModal && (
        <ExportModal
          canvasTitle={canvas?.title || 'Canvas'}
          nodes={nodes}
          edges={edges}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {/* ── Feature 5: Connect Nodes Modal ── */}
      {showConnectModal && (
        <ConnectNodesModal
          nodes={nodes}
          onConnect={handleCustomConnect}
          onClose={() => setShowConnectModal(false)}
        />
      )}

      {/* ── Feature 6: AI Scenario Simulator ── */}
      {showSimulator && (
        <ScenarioSimulatorModal
          canvasTitle={canvas?.title || 'Canvas'}
          nodes={nodes}
          onClose={() => setShowSimulator(false)}
          onApplyInsights={(insights) => {
            insights.forEach(ins => handleAddCopilotNode(ins.title, ins.content, ins.type))
            setShowSimulator(false)
          }}
        />
      )}
    </div>
  )
}

export default function CanvasWorkspace() {
  return (
    <Suspense
      fallback={
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080810', flexDirection: 'column', gap: 16 }}>
          <div className="spinner" style={{ width: 40, height: 40 }} />
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>Loading workspace...</p>
        </div>
      }
    >
      <CanvasWorkspaceContent />
    </Suspense>
  )
}

function getLocalDemoCanvas(prompt: string) {
  const p = (prompt || 'Startup Idea').trim()
  const title = p.length > 55 ? p.slice(0, 55) + '...' : p
  const lower = p.toLowerCase()

  const isLegal = lower.includes('legal') || lower.includes('contract') || lower.includes('law')
  const isFood = lower.includes('food') || lower.includes('meal') || lower.includes('pet') || lower.includes('restaurant')
  const isFinance = lower.includes('finance') || lower.includes('accounting') || lower.includes('tax') || lower.includes('money')

  const problemText = isLegal
    ? `SMB owners lose an estimated $14,000 per year in legal consultation fees or unknowingly sign unfavorable contracts with hidden liability clauses and auto-renewals. 68% sign contracts without review due to $350-$600/hr law firm rates.`
    : isFood
    ? `Consumers waste over 8 hours per month sourcing specialized nutrition and $600/yr on ill-fitting subscription food plans. Independent suppliers lack direct digital channels.`
    : isFinance
    ? `SMB owners waste 10+ hours per month manually categorizing receipts and tracking overdue invoices, leading to $3,800 in missed tax deductions annually.`
    : `Target users lose 6-10 hours per week relying on manual, fragmented tools to execute "${p}". Existing solutions are expensive ($300+/mo) and fail to automate core tasks.`

  const solutionText = isLegal
    ? `AI Contract Review Engine: Parses PDF/Word agreements in under 30 seconds. Automatically flags 15+ risk categories, highlights red flags, and generates one-click lawyer-approved redlines.`
    : isFood
    ? `Direct AI Personalization Engine for "${p}": Custom nutrition profiles, automated recurring deliveries, and zero-friction order management.`
    : isFinance
    ? `Automated Financial Copilot: Real-time transaction reconciliation, automated invoice reminders via WhatsApp/Email, and instant tax-deduction discovery.`
    : `A streamlined 10x solution for "${p}": Combines real-time intelligence, automated workflow triggers, and intuitive UI to cut execution time to under 3 minutes.`

  return {
    canvas_title: title,
    nodes: [
      { id: 'n1', type: 'idea', title: 'Core Concept', content: `Project Idea: ${p}\n\nStrategic Vision: A state-of-the-art platform designed to transform "${p}" into a high-growth product. Focuses on frictionless onboarding, automated core workflows, and clear monetization.`, position: { x: 500, y: 60 }, width: 360, height: 240, metadata: {} },
      { id: 'n2', type: 'problem', title: 'Problem Statement', content: problemText, position: { x: 60, y: 60 }, width: 360, height: 260, metadata: {} },
      { id: 'n3', type: 'solution', title: 'Unique Solution', content: solutionText, position: { x: 940, y: 60 }, width: 360, height: 280, metadata: {} },
      { id: 'n4', type: 'target_users', title: 'Target Users (ICP)', content: `Primary ICP: Founders, product leads, and team managers aged 25-45 who require rapid execution and maximum productivity for "${p}".`, position: { x: 60, y: 360 }, width: 360, height: 260, metadata: {} },
      { id: 'n6', type: 'market_research', title: 'Market Opportunity', content: `Market Sizing for "${p}":\n• TAM: $8.4B Global Market\n• SAM: $1.2B Addressable Segment\n• SOM: $15M Realistic Year 2 Capture\nGrowth Rate: 22% CAGR driven by AI automation adoption.`, position: { x: 500, y: 360 }, width: 360, height: 260, metadata: {} },
      { id: 'n7', type: 'competitor', title: 'Competitive Landscape', content: `Key Competitors: (1) Legacy Enterprise Tool ($200+/mo), (2) Niche Player ($49/mo), (3) DIY Spreadsheets. Our Advantage: 10x faster execution powered by AI workflows for "${p}".`, position: { x: 940, y: 360 }, width: 360, height: 280, metadata: {} },
      { id: 'n8', type: 'tech_stack', title: 'Technical Architecture', content: `Frontend: Next.js 15, React 19, TypeScript, TailwindCSS.\nBackend: NestJS Node.js API, PostgreSQL (Supabase), Redis.\nInfrastructure: Vercel, Railway, Supabase Auth.`, position: { x: 60, y: 660 }, width: 360, height: 280, metadata: {} },
      { id: 'n5', type: 'business_model', title: 'Business Model', content: `Tier 1 Starter: $29/mo (basic features).\nTier 2 Pro: $89/mo (advanced AI analysis, priority support).\nTier 3 Enterprise: $299/mo (SSO, custom API access).\nTarget LTV: $2,100+ with 6-month CAC payback.`, position: { x: 500, y: 660 }, width: 360, height: 280, metadata: {} },
      { id: 'n11', type: 'revenue', title: 'Revenue Projections', content: `Month 1: $580 MRR (20 users).\nMonth 3: $3,560 MRR.\nMonth 6: $14,200 MRR.\nMonth 12: $48,000 MRR. Break-even targeted at Month 5.`, position: { x: 940, y: 660 }, width: 360, height: 280, metadata: {} },
      { id: 'n10', type: 'marketing', title: 'Go-To-Market Strategy', content: `Channel 1: Founder-led LinkedIn/X build-in-public content.\nChannel 2: Cold outbound to 200 verified ICP leads per month.\nChannel 3: High-intent commercial SEO landing pages.`, position: { x: 60, y: 960 }, width: 360, height: 280, metadata: {} },
      { id: 'n9', type: 'roadmap', title: '90-Day Execution Roadmap', content: `Month 1: Core MVP launch for "${p}", payments, auth.\nMonth 2: User feedback loops, export tools, team seats.\nMonth 3: Public ProductHunt launch, SEO push, target $5,000 MRR.`, position: { x: 500, y: 960 }, width: 360, height: 280, metadata: {} },
      { id: 'n12', type: 'risks', title: 'Key Risks & Mitigations', content: `1. User Friction (Prob: 35%, Impact: 8/10) -> 14-day free trial with hands-on onboarding.\n2. AI Accuracy (Prob: 20%, Impact: 7/10) -> Strict RAG context boundary.\n3. Competitors (Prob: 25%, Impact: 6/10) -> High shipping velocity.`, position: { x: 940, y: 960 }, width: 360, height: 280, metadata: {} },
    ],
    connections: [
      { source: 'n1', target: 'n2' },
      { source: 'n1', target: 'n3' },
      { source: 'n1', target: 'n6' },
      { source: 'n2', target: 'n3' },
      { source: 'n3', target: 'n8' },
      { source: 'n3', target: 'n5' },
      { source: 'n4', target: 'n10' },
      { source: 'n5', target: 'n11' },
      { source: 'n6', target: 'n7' },
      { source: 'n7', target: 'n3' },
      { source: 'n8', target: 'n9' },
      { source: 'n9', target: 'n12' },
    ],
  }
}
