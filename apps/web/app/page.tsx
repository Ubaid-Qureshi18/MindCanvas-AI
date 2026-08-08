'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

const ROTATING_WORDS = ['startup', 'product', 'strategy', 'system', 'idea', 'team']

const FEATURES = [
  {
    num: '01',
    title: 'Instant Canvas Generation',
    desc: 'One prompt generates a complete strategic workspace — business model, tech stack, roadmap, risks, and more — in under 3 seconds.',
    accent: '#6366f1',
  },
  {
    num: '02',
    title: 'Multi-Agent AI Intelligence',
    desc: 'Ten specialized AI agents work in parallel: Business Strategist, Tech Architect, Market Analyst, Investor Reviewer, and more.',
    accent: '#7c3aed',
  },
  {
    num: '03',
    title: 'Live Research Engine',
    desc: 'Real-time market data, competitor analysis, and industry trends from Tavily, Exa, Firecrawl, and SerpAPI — all embedded in your canvas.',
    accent: '#0891b2',
  },
  {
    num: '04',
    title: 'Real-Time Collaboration',
    desc: 'See your team thinking alongside you. Live cursors, CRDT conflict resolution, and instant node sync across every workspace.',
    accent: '#059669',
  },
  {
    num: '05',
    title: 'Infinite Visual Canvas',
    desc: 'Zoom, pan, group, and connect nodes on a limitless canvas. Turn complexity into visual clarity with drag-and-drop precision.',
    accent: '#7c3aed',
  },
  {
    num: '06',
    title: 'Presentation & Export',
    desc: 'Auto-generate slides from your canvas. Export to PowerPoint, PDF, or PNG. Present live directly from your workspace.',
    accent: '#d97706',
  },
]

const NODE_LABELS = [
  { label: 'Idea', color: '#6366f1' },
  { label: 'Problem', color: '#dc2626' },
  { label: 'Solution', color: '#059669' },
  { label: 'Target Users', color: '#d97706' },
  { label: 'Market Research', color: '#0891b2' },
  { label: 'Competitors', color: '#7c3aed' },
  { label: 'Business Model', color: '#6366f1' },
  { label: 'Tech Stack', color: '#2563eb' },
  { label: 'Roadmap', color: '#7c3aed' },
  { label: 'Risks', color: '#dc2626' },
  { label: 'Pitch Deck', color: '#d97706' },
  { label: 'Tasks', color: '#059669' },
]

const PRICING = [
  {
    tier: 'Starter',
    price: '$0',
    period: 'forever',
    color: '#6366f1',
    features: ['3 canvases', '50 AI requests / mo', 'Canvas generation', 'Export to Markdown'],
  },
  {
    tier: 'Pro',
    price: '$19',
    period: '/ month',
    color: '#7c3aed',
    highlight: true,
    features: ['Unlimited canvases', '500 AI requests / mo', 'All AI agents', 'Research engine', 'Export PDF · PNG · PPTX', 'Priority support'],
  },
  {
    tier: 'Team',
    price: '$49',
    period: '/ seat / month',
    color: '#0891b2',
    features: ['Everything in Pro', 'Real-time collaboration', 'Team templates', 'Admin dashboard', 'Usage analytics'],
  },
  {
    tier: 'Enterprise',
    price: 'Custom',
    period: '',
    color: '#059669',
    features: ['Everything in Team', 'SSO & SAML', 'Audit logs', 'Dedicated AI models', 'On-premise option', 'SLA guarantee'],
  },
]

const TESTIMONIALS = [
  {
    name: 'Sarah Chen',
    role: 'Founder & CEO',
    company: 'TechFlow AI',
    initials: 'SC',
    color: '#6366f1',
    text: 'MindCanvas replaced three tools for us. We built our entire Series A pitch deck from the canvas in 20 minutes.',
  },
  {
    name: 'Marcus Reid',
    role: 'Product Director',
    company: 'Scaleworks',
    initials: 'MR',
    color: '#7c3aed',
    text: 'The AI agents are genuinely impressive. I asked about competitor positioning and got a full matrix with real pricing data in seconds.',
  },
  {
    name: 'Priya Kapoor',
    role: 'Startup Advisor',
    company: 'Venture Labs',
    initials: 'PK',
    color: '#0891b2',
    text: "I recommend this to every founder I mentor. The visual canvas alone changes how they think about their business.",
  },
]

export default function LandingPage() {
  const [wordIndex, setWordIndex] = useState(0)
  const [prompt, setPrompt] = useState('')
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = setInterval(() => setWordIndex(i => (i + 1) % ROTATING_WORDS.length), 2400)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handler, { passive: true })
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  const go = (p?: string) => {
    const q = p || prompt
    window.location.href = q.trim() ? `/dashboard?prompt=${encodeURIComponent(q.trim())}` : '/dashboard'
  }

  return (
    <div style={{ minHeight: '100vh', overflowX: 'hidden', background: '#05050d', fontFamily: "'Inter', system-ui, sans-serif", color: 'rgba(255,255,255,0.92)' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300;0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;0,14..32,800;0,14..32,900&display=swap');
        @keyframes blobDrift { 0%,100% { transform:translate(0,0) scale(1); } 40% { transform:translate(55px,-35px) scale(1.05); } 70% { transform:translate(-30px,45px) scale(0.97); } }
        @keyframes wordSwap  { 0% { opacity:0; transform:translateY(8px); } 15%,85% { opacity:1; transform:translateY(0); } 100% { opacity:0; transform:translateY(-8px); } }
        @keyframes marquee   { from { transform:translateX(0); } to { transform:translateX(-50%); } }
        @keyframes fadeInUp  { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulseSpot { 0%,100% { opacity:0.5; } 50% { opacity:1; } }
        .feat-card:hover { border-color: rgba(99,102,241,0.25) !important; box-shadow: 0 12px 40px rgba(0,0,0,0.55) !important; transform: translateY(-3px) !important; }
        .feat-card { transition: all 0.25s ease; }
        .price-card:hover { transform: translateY(-4px) !important; }
        .price-card { transition: all 0.25s ease; }
        .testi-card:hover { border-color: rgba(255,255,255,0.1) !important; transform: translateY(-3px); }
        .testi-card { transition: all 0.25s ease; }
        .prompt-input:focus { border-color: rgba(99,102,241,0.6) !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.1), 0 12px 40px rgba(0,0,0,0.6) !important; outline: none; }
        .prompt-input { transition: all 0.2s ease; }
        .pill:hover { transform: translateY(-2px); background: rgba(255,255,255,0.07) !important; }
        .pill { transition: all 0.18s ease; }
        .nav-link:hover { color: rgba(255,255,255,0.85) !important; background: rgba(255,255,255,0.06) !important; }
        .nav-link { transition: all 0.15s ease; }
        .cta-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(99,102,241,0.5) !important; }
        .cta-primary { transition: all 0.2s ease; }
      `}</style>

      {/* Background blobs */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: 900, height: 900, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 65%)', top: -300, left: -300, animation: 'blobDrift 28s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 65%)', bottom: -200, right: -200, animation: 'blobDrift 34s ease-in-out infinite reverse' }} />
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(8,145,178,0.05) 0%, transparent 65%)', top: '45%', right: '8%', animation: 'blobDrift 22s ease-in-out 6s infinite' }} />
        {/* Grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(99,102,241,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.035) 1px, transparent 1px)', backgroundSize: '64px 64px', maskImage: 'radial-gradient(ellipse 70% 70% at 50% 40%, black 30%, transparent 100%)' }} />
        {/* Mouse glow */}
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)', left: mousePos.x - 250, top: mousePos.y - 250, transition: 'left 0.9s ease, top 0.9s ease' }} />
      </div>

      {/* Navigation */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, height: 60, padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(5,5,13,0.88)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, #6366f1, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, boxShadow: '0 0 16px rgba(99,102,241,0.4)' }}>✦</div>
          <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.04em', color: 'white' }}>MindCanvas</span>
        </Link>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {['Features', 'Pricing', 'Docs'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} className="nav-link" style={{ padding: '6px 13px', borderRadius: 7, color: 'rgba(255,255,255,0.48)', fontSize: 13.5, fontWeight: 500, textDecoration: 'none' }}>{item}</a>
          ))}
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)', margin: '0 6px' }} />
          <Link href="/auth/signin" className="nav-link" style={{ padding: '6px 13px', borderRadius: 7, color: 'rgba(255,255,255,0.6)', fontSize: 13.5, fontWeight: 500, textDecoration: 'none' }}>Sign In</Link>
          <Link href="/auth/signup" className="cta-primary" style={{ padding: '7px 17px', borderRadius: 8, background: 'linear-gradient(135deg, #6366f1, #7c3aed)', color: 'white', fontSize: 13.5, fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 18px rgba(99,102,241,0.38)', letterSpacing: '-0.01em' }}>
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section ref={heroRef} style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '104px 24px 80px', textAlign: 'center' }}>

        {/* Status badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 9999, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', fontSize: 12.5, color: 'rgba(167,139,250,0.9)', fontWeight: 600, marginBottom: 44, letterSpacing: '0.01em', animation: 'fadeInUp 0.5s ease' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', display: 'inline-block', animation: 'pulseSpot 2s ease-in-out infinite' }} />
          AI-powered · Multi-agent · Real-time collaboration
        </div>

        {/* Headline */}
        <h1 style={{ fontSize: 'clamp(48px, 7.5vw, 88px)', fontWeight: 900, letterSpacing: '-0.055em', lineHeight: 1.02, marginBottom: 26, animation: 'fadeInUp 0.6s 0.05s ease both' }}>
          Turn your{' '}
          <span key={wordIndex} style={{ display: 'inline-block', background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 60%, #c4b5fd 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'wordSwap 2.4s ease' }}>
            {ROTATING_WORDS[wordIndex]}
          </span>
          <br />into a live 3D workspace.
        </h1>

        <p style={{ fontSize: 19, color: 'rgba(255,255,255,0.52)', maxWidth: 620, margin: '0 auto 56px', lineHeight: 1.75, fontWeight: 400, animation: 'fadeInUp 0.7s 0.1s ease both' }}>
          MindCanvas is the AI visual workspace that generates fully interconnected strategic canvases from a single prompt — in seconds.
        </p>

        {/* Prompt box */}
        <div style={{ margin: '0 auto 52px', width: '100%', maxWidth: 700, position: 'relative', animation: 'fadeInUp 0.8s 0.15s ease both' }}>
          <div style={{ position: 'relative', background: 'rgba(10,10,24,0.97)', borderRadius: 18, padding: '3px', border: '1px solid rgba(99,102,241,0.3)', boxShadow: '0 24px 64px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)' }}>
            <div style={{ position: 'relative', padding: '4px' }}>
              <input
                type="text"
                placeholder='e.g. "AI-powered legal auditor for SMB contracts"'
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && go()}
                className="prompt-input"
                style={{ width: '100%', padding: '16px 176px 16px 20px', borderRadius: 13, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', fontSize: 15, fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
              <button
                onClick={() => go()}
                className="cta-primary"
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', padding: '10px 22px', borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #7c3aed)', border: 'none', color: 'white', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '-0.01em', boxShadow: '0 4px 18px rgba(99,102,241,0.4)' }}>
                Generate canvas →
              </button>
            </div>
            {/* Quick prompts */}
            <div style={{ display: 'flex', gap: 6, padding: '4px 8px 8px', flexWrap: 'wrap' }}>
              {[
                { label: 'AI Legal Tech', p: 'AI-powered legal auditor for SMB contract review' },
                { label: 'SaaS Analytics', p: 'B2B analytics platform for remote engineering teams' },
                { label: 'FinTech Copilot', p: 'Automated accounting software for freelancers' },
                { label: 'Health Platform', p: 'Telemedicine platform for underserved communities' },
              ].map(item => (
                <button key={item.label} onClick={() => go(item.p)} className="pill"
                  style={{ padding: '4px 12px', borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)', fontSize: 11.5, fontWeight: 500, cursor: 'pointer', letterSpacing: '0.01em' }}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap', animation: 'fadeInUp 0.9s 0.2s ease both' }}>
          {[
            { value: '10K+', label: 'Canvases created' },
            { value: '50+', label: 'Node types' },
            { value: '< 3s', label: 'Generation time' },
            { value: '99.9%', label: 'Uptime SLA' },
          ].map(stat => (
            <div key={stat.value} style={{ padding: '14px 28px', borderRadius: 14, textAlign: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', minWidth: 130 }}>
              <div style={{ fontSize: 30, fontWeight: 900, color: 'white', letterSpacing: '-0.04em', lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.38)', marginTop: 5, fontWeight: 500, letterSpacing: '0.02em' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Node type marquee */}
      <div style={{ position: 'relative', zIndex: 1, overflow: 'hidden', padding: '22px 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 100, background: 'linear-gradient(90deg, #05050d, transparent)', zIndex: 2 }} />
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 100, background: 'linear-gradient(-90deg, #05050d, transparent)', zIndex: 2 }} />
        <div style={{ display: 'flex', gap: 10, animation: 'marquee 28s linear infinite', width: 'max-content' }}>
          {[...NODE_LABELS, ...NODE_LABELS].map((node, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 16px', borderRadius: 8, background: `${node.color}0f`, border: `1px solid ${node.color}28`, color: `${node.color}bb`, fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', letterSpacing: '0.01em' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: node.color, display: 'inline-block', flexShrink: 0, opacity: 0.8 }} />
              {node.label}
            </div>
          ))}
        </div>
      </div>

      {/* Canvas preview */}
      <section id="features" style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '100px auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontSize: 11.5, fontWeight: 700, color: 'rgba(99,102,241,0.9)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>Live Preview</p>
          <h2 style={{ fontSize: 46, fontWeight: 900, letterSpacing: '-0.045em', color: 'white', marginBottom: 14 }}>
            See your idea{' '}
            <span style={{ background: 'linear-gradient(135deg, #818cf8, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              come to life
            </span>
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.45)', maxWidth: 480, margin: '0 auto' }}>From a single sentence to a fully connected strategic workspace in seconds.</p>
        </div>

        {/* Tilted browser frame */}
        <div style={{ perspective: 1400 }}>
          <div
            style={{ borderRadius: 18, overflow: 'hidden', position: 'relative', transform: 'rotateX(7deg) rotateY(-2deg)', boxShadow: '0 48px 100px rgba(0,0,0,0.9), 0 0 60px rgba(99,102,241,0.12)', border: '1px solid rgba(255,255,255,0.1)', transition: 'transform 0.45s ease' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'rotateX(2deg) rotateY(0deg)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'rotateX(7deg) rotateY(-2deg)'}
          >
            {/* Window chrome */}
            <div style={{ padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(8,8,20,0.99)' }}>
              {['#ef4444', '#f59e0b', '#10b981'].map(c => <div key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c, opacity: 0.7 }} />)}
              <span style={{ marginLeft: 12, fontSize: 12, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>MindCanvas — AI Legal Auditor Workspace</span>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#34d399', animation: 'pulseSpot 2s ease-in-out infinite' }} />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>Live · 7 nodes · AI-generated</span>
              </div>
            </div>
            {/* Canvas body */}
            <div style={{ padding: 36, position: 'relative', minHeight: 400, overflow: 'hidden', background: '#07070f', backgroundImage: 'linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
              {[
                { label: 'Core Concept', x: 320, y: 22, color: '#6366f1', size: 'lg' },
                { label: 'Problem Statement', x: 20, y: 16, color: '#dc2626', size: 'md' },
                { label: 'Unique Solution', x: 630, y: 16, color: '#059669', size: 'md' },
                { label: 'Target Users', x: 20, y: 190, color: '#d97706', size: 'md' },
                { label: 'Business Model', x: 630, y: 190, color: '#7c3aed', size: 'md' },
                { label: 'Market Research', x: 155, y: 320, color: '#0891b2', size: 'sm' },
                { label: 'Tech Architecture', x: 490, y: 320, color: '#2563eb', size: 'sm' },
              ].map((node, idx) => {
                const sizes = { lg: { p: '12px 20px', f: 13.5 }, md: { p: '10px 16px', f: 12.5 }, sm: { p: '8px 14px', f: 11.5 } }
                const s = sizes[node.size as keyof typeof sizes]
                return (
                  <div key={node.label} style={{ position: 'absolute', left: node.x, top: node.y, padding: s.p, background: `${node.color}12`, border: `1px solid ${node.color}35`, borderRadius: 11, fontSize: s.f, fontWeight: 700, color: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', whiteSpace: 'nowrap', boxShadow: `0 8px 28px rgba(0,0,0,0.55)`, letterSpacing: '-0.01em', animation: `fadeInUp ${0.4 + idx * 0.08}s ${idx * 0.06}s ease both` }}>
                    <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: node.color, marginRight: 7, verticalAlign: 'middle', opacity: 0.9 }} />
                    {node.label}
                  </div>
                )
              })}
              {/* Connection lines */}
              <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.45 }}>
                {[[390, 44, 130, 42], [390, 44, 680, 42], [390, 44, 130, 210], [390, 44, 680, 210], [390, 44, 215, 334], [390, 44, 550, 334]].map(([x1,y1,x2,y2], i) => (
                  <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(124,58,237,0.5)" strokeWidth="1.5" strokeDasharray="5 5" />
                ))}
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '0 24px 100px' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p style={{ fontSize: 11.5, fontWeight: 700, color: 'rgba(99,102,241,0.9)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>Core Features</p>
          <h2 style={{ fontSize: 46, fontWeight: 900, letterSpacing: '-0.045em', color: 'white', marginBottom: 14 }}>
            Built for serious{' '}
            <span style={{ background: 'linear-gradient(135deg, #818cf8, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>thinkers</span>
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.42)', maxWidth: 480, margin: '0 auto' }}>Every feature designed to help you think faster, deeper, and more clearly.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
          {FEATURES.map(f => (
            <div key={f.title} className="feat-card" style={{ padding: '32px 28px', borderRadius: 16, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: `${f.accent}88`, letterSpacing: '0.08em', fontVariantNumeric: 'tabular-nums' }}>{f.num}</span>
                <div style={{ height: 1, flex: 1, background: `linear-gradient(90deg, ${f.accent}40, transparent)` }} />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: 'white', letterSpacing: '-0.025em', marginBottom: 12, lineHeight: 1.25 }}>{f.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.75, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '0 24px 100px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontSize: 11.5, fontWeight: 700, color: 'rgba(99,102,241,0.9)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>Testimonials</p>
          <h2 style={{ fontSize: 46, fontWeight: 900, letterSpacing: '-0.045em', color: 'white' }}>
            Trusted by{' '}
            <span style={{ background: 'linear-gradient(135deg, #818cf8, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>builders</span>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="testi-card" style={{ padding: '28px 26px', borderRadius: 16, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 18 }}>
                {[...Array(5)].map((_, i) => <span key={i} style={{ color: '#d97706', fontSize: 13 }}>★</span>)}
              </div>
              <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.75)', lineHeight: 1.75, marginBottom: 24, fontStyle: 'italic', margin: '0 0 24px' }}>"{t.text}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: `${t.color}22`, border: `1px solid ${t.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: t.color, flexShrink: 0 }}>{t.initials}</div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{t.role} · {t.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '0 24px 100px' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p style={{ fontSize: 11.5, fontWeight: 700, color: 'rgba(99,102,241,0.9)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>Pricing</p>
          <h2 style={{ fontSize: 46, fontWeight: 900, letterSpacing: '-0.045em', color: 'white', marginBottom: 14 }}>
            Simple, honest{' '}
            <span style={{ background: 'linear-gradient(135deg, #818cf8, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>pricing</span>
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.42)' }}>Start free. Scale without surprises.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {PRICING.map(plan => (
            <div key={plan.tier} className="price-card" style={{ borderRadius: 16, padding: '28px 24px', position: 'relative', background: plan.highlight ? `linear-gradient(145deg, ${plan.color}14, ${plan.color}08)` : 'rgba(255,255,255,0.025)', border: `1px solid ${plan.highlight ? plan.color + '44' : 'rgba(255,255,255,0.08)'}`, boxShadow: plan.highlight ? `0 20px 60px rgba(0,0,0,0.55), 0 0 30px ${plan.color}18` : 'none', backdropFilter: 'blur(12px)' }}>
              {plan.highlight && (
                <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: `linear-gradient(135deg, ${plan.color}, #6366f1)`, borderRadius: 9999, padding: '4px 16px', fontSize: 10, fontWeight: 800, color: 'white', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>MOST POPULAR</div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: plan.color }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.65)' }}>{plan.tier}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 24 }}>
                <span style={{ fontSize: 40, fontWeight: 900, color: 'white', letterSpacing: '-0.04em' }}>{plan.price}</span>
                {plan.period && <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>{plan.period}</span>}
              </div>
              <ul style={{ listStyle: 'none', margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 9 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 9 }}>
                    <span style={{ color: plan.color, fontWeight: 900, fontSize: 14, flexShrink: 0 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup" style={{ display: 'block', textAlign: 'center', padding: '11px 18px', borderRadius: 10, background: plan.highlight ? `linear-gradient(135deg, ${plan.color}, #6366f1)` : 'rgba(255,255,255,0.06)', border: plan.highlight ? 'none' : '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 13.5, fontWeight: 600, textDecoration: 'none', letterSpacing: '-0.01em', transition: 'all 0.2s', boxShadow: plan.highlight ? `0 4px 20px ${plan.color}40` : 'none' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.88'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}>
                {plan.tier === 'Enterprise' ? 'Contact sales' : 'Get started'}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 24px 120px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '72px 48px', borderRadius: 24, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.18)', backdropFilter: 'blur(20px)', boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}>
          <p style={{ fontSize: 11.5, fontWeight: 700, color: 'rgba(99,102,241,0.9)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 20 }}>Get Started</p>
          <h2 style={{ fontSize: 50, fontWeight: 900, letterSpacing: '-0.05em', color: 'white', marginBottom: 20, lineHeight: 1.05 }}>
            Start thinking<br />
            <span style={{ background: 'linear-gradient(135deg, #818cf8, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>smarter today.</span>
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.48)', marginBottom: 44, lineHeight: 1.75 }}>
            Join thousands of founders and product teams building better ideas with MindCanvas.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/signup" className="cta-primary" style={{ padding: '14px 36px', borderRadius: 12, background: 'linear-gradient(135deg, #6366f1, #7c3aed)', color: 'white', fontSize: 15, fontWeight: 700, textDecoration: 'none', boxShadow: '0 6px 28px rgba(99,102,241,0.45)', letterSpacing: '-0.01em', display: 'inline-block' }}>
              Create your free canvas
            </Link>
            <Link href="/auth/signin" style={{ padding: '14px 28px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)', fontSize: 15, fontWeight: 600, textDecoration: 'none', display: 'inline-block', transition: 'all 0.2s ease', letterSpacing: '-0.01em' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.09)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'}>
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '32px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg, #6366f1, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>✦</div>
            <span style={{ fontWeight: 800, fontSize: 14, color: 'rgba(255,255,255,0.7)', letterSpacing: '-0.03em' }}>MindCanvas</span>
          </div>
          <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.25)', margin: 0 }}>
            © 2026 MindCanvas · Built by Ubaid Qureshi and team
          </p>
          <div style={{ display: 'flex', gap: 18 }}>
            {['Privacy', 'Terms', 'Contact'].map(link => (
              <a key={link} href="#" style={{ color: 'rgba(255,255,255,0.28)', fontSize: 12.5, fontWeight: 500, textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.65)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.28)'}>{link}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
