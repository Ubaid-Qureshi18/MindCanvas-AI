'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

const ROTATING_WORDS = ['startup', 'product', 'system', 'strategy', 'company', 'idea']

const FEATURES = [
  { icon: '⚡', title: 'Instant Canvas Generation', desc: 'Enter one prompt. Get a full interconnected canvas in seconds — business model, tech stack, roadmap, and more.', color: '#6366f1', glow: 'rgba(99,102,241,0.3)' },
  { icon: '🧠', title: 'Multi-Agent AI Swarm', desc: '10 specialized AI agents work together: Business Strategist, Tech Architect, Marketing Expert, Investor Reviewer, and more.', color: '#8b5cf6', glow: 'rgba(139,92,246,0.3)' },
  { icon: '🔬', title: 'Deep Research Engine', desc: 'Powered by Tavily, Exa, Firecrawl, and SerpAPI — real-time market data, competitor analysis, and industry trends.', color: '#06b6d4', glow: 'rgba(6,182,212,0.3)' },
  { icon: '🤝', title: 'Real-Time Collaboration', desc: "See your team's cursors live. Edit together with CRDT conflict resolution. Think together at the speed of thought.", color: '#10b981', glow: 'rgba(16,185,129,0.3)' },
  { icon: '🎨', title: 'Infinite 3D Canvas', desc: 'Zoom, pan, group, and link nodes on a limitless canvas. Organize complexity into breathtaking 3D clarity.', color: '#ec4899', glow: 'rgba(236,72,153,0.3)' },
  { icon: '📊', title: 'Presentation Mode', desc: 'Auto-generate slides from your canvas. Present live. Export to PowerPoint, PDF, or PNG in one click.', color: '#f59e0b', glow: 'rgba(245,158,11,0.3)' },
]

const NODE_TYPES = [
  { type: 'idea', label: '💡 Idea', color: '#6366f1' },
  { type: 'problem', label: '🎯 Problem', color: '#ef4444' },
  { type: 'solution', label: '✨ Solution', color: '#10b981' },
  { type: 'target_users', label: '👥 Target Users', color: '#f59e0b' },
  { type: 'market_research', label: '📈 Market Research', color: '#06b6d4' },
  { type: 'competitor', label: '⚔️ Competitors', color: '#ec4899' },
  { type: 'business_model', label: '💼 Business Model', color: '#8b5cf6' },
  { type: 'tech_stack', label: '🛠 Tech Stack', color: '#3b82f6' },
  { type: 'roadmap', label: '🗺 Roadmap', color: '#a78bfa' },
  { type: 'risks', label: '⚠️ Risks', color: '#ef4444' },
  { type: 'pitch_deck', label: '🎤 Pitch Deck', color: '#f59e0b' },
  { type: 'tasks', label: '✅ Tasks', color: '#10b981' },
]

const PRICING = [
  { tier: 'Free', price: '$0', period: 'forever', color: '#6366f1', features: ['3 canvases', '50 AI requests/mo', 'Basic canvas generation', 'Export to Markdown'] },
  { tier: 'Pro', price: '$19', period: '/month', color: '#8b5cf6', highlight: true, features: ['Unlimited canvases', '500 AI requests/mo', 'All AI agents', 'Research engine', 'Export PDF/PNG/PPTX', 'Priority support'] },
  { tier: 'Team', price: '$49', period: '/seat/month', color: '#06b6d4', features: ['Everything in Pro', 'Real-time collaboration', 'Team templates', 'Admin controls', 'Usage analytics'] },
  { tier: 'Enterprise', price: 'Custom', period: '', color: '#10b981', features: ['Everything in Team', 'SSO / SAML', 'Audit logs', 'Dedicated AI models', 'On-premise option', 'SLA guarantee'] },
]

const TESTIMONIALS = [
  { name: 'Sarah Chen', role: 'Founder & CEO', company: 'TechFlow AI', avatar: '👩‍💼', text: 'MindCanvas replaced 3 tools for us. We built our entire Series A pitch deck directly from the canvas in 20 minutes.' },
  { name: 'Marcus Reid', role: 'Product Director', company: 'Scaleworks', avatar: '👨‍💻', text: 'The AI agents are insanely good. I asked about competitor positioning and got a full matrix with pricing data in seconds.' },
  { name: 'Priya Kapoor', role: 'Startup Advisor', company: 'Venture Labs', avatar: '👩‍🔬', text: 'I recommend this to every founder I work with. The 3D canvas visualization alone is worth it — it changes how you think.' },
]

export default function LandingPage() {
  const [wordIndex, setWordIndex] = useState(0)
  const [prompt, setPrompt] = useState('')
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = setInterval(() => setWordIndex(i => (i + 1) % ROTATING_WORDS.length), 2200)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [])

  const handleTryPrompt = () => {
    if (prompt.trim()) window.location.href = `/dashboard?prompt=${encodeURIComponent(prompt)}`
    else window.location.href = '/dashboard'
  }

  return (
    <div style={{ minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes floatBg { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(60px,-40px) scale(1.1); } 66% { transform: translate(-40px,60px) scale(0.95); } }
        @keyframes orbit { from { transform: rotate(0deg) translateX(160px) rotate(0deg); } to { transform: rotate(360deg) translateX(160px) rotate(-360deg); } }
        @keyframes orbit2 { from { transform: rotate(120deg) translateX(120px) rotate(-120deg); } to { transform: rotate(480deg) translateX(120px) rotate(-480deg); } }
        @keyframes orbit3 { from { transform: rotate(240deg) translateX(100px) rotate(-240deg); } to { transform: rotate(600deg) translateX(100px) rotate(-600deg); } }
        @keyframes float3d { 0%,100% { transform: translateY(0px) rotateZ(0deg); } 50% { transform: translateY(-16px) rotateZ(2deg); } }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes scanline { 0%,100% { opacity:0.3; } 50% { opacity:0.7; } }
        @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes pulseRing { 0% { transform: scale(1); opacity:0.8; } 100% { transform: scale(1.6); opacity:0; } }
        @keyframes counterUp { from { opacity:0; transform:scale(0.85); } to { opacity:1; transform:scale(1); } }
        .feature-card:hover { transform: translateY(-8px) rotateX(4deg) scale(1.02) !important; }
        .feature-card { transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1); }
        .pricing-card:hover { transform: translateY(-10px) scale(1.03) !important; }
        .pricing-card { transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        .node-pill:hover { transform: translateY(-4px) scale(1.06) !important; filter: brightness(1.2); }
        .node-pill { transition: all 0.2s ease; }
        .cta-btn:hover { transform: translateY(-3px) scale(1.05); box-shadow: 0 12px 40px rgba(99,102,241,0.6) !important; }
        .cta-btn { transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1); }
        .testimonial-card:hover { transform: translateY(-6px) rotateX(3deg); }
        .testimonial-card { transition: all 0.3s ease; }
        .nav-link:hover { color: white !important; background: rgba(255,255,255,0.08) !important; }
        .nav-link { transition: all 0.15s ease; }
      `}</style>

      {/* ── DEEP SPACE BACKGROUND ── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        {/* Animated gradient orbs */}
        <div style={{ position: 'absolute', width: 900, height: 900, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)', top: -200, left: -300, animation: 'floatBg 22s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.09) 0%, transparent 70%)', bottom: -100, right: -200, animation: 'floatBg 28s ease-in-out infinite reverse' }} />
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)', top: '40%', right: '10%', animation: 'floatBg 18s ease-in-out 5s infinite' }} />
        {/* Subtle grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)', backgroundSize: '60px 60px', maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)' }} />
        {/* Mouse-reactive glow */}
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)', left: mousePos.x - 300, top: mousePos.y - 300, pointerEvents: 'none', transition: 'left 0.8s ease, top 0.8s ease' }} />
      </div>

      {/* ── NAV ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(8,8,20,0.85)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 4px 30px rgba(0,0,0,0.5)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 0 20px rgba(99,102,241,0.5)' }}>🧠</div>
          <span style={{ fontWeight: 900, fontSize: 19, letterSpacing: '-0.04em', color: 'white' }}>Mind<span style={{ background: 'linear-gradient(135deg,#a78bfa,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Canvas</span></span>
        </Link>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {['Features', 'Pricing', 'Docs'].map(item => (
            <a key={item} href="#" className="nav-link" style={{ padding: '7px 14px', borderRadius: 8, color: 'rgba(255,255,255,0.55)', fontSize: 13.5, fontWeight: 600, textDecoration: 'none' }}>{item}</a>
          ))}
          <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
          <Link href="/auth/signin" className="nav-link" style={{ padding: '7px 14px', borderRadius: 8, color: 'rgba(255,255,255,0.7)', fontSize: 13.5, fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
          <Link href="/auth/signup" style={{ padding: '8px 18px', borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', fontSize: 13.5, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 20px rgba(99,102,241,0.4)', transition: 'all 0.2s ease' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(99,102,241,0.6)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(99,102,241,0.4)' }}>
            Get Started Free ✨
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section ref={heroRef} style={{ position: 'relative', zIndex: 1, maxWidth: 1180, margin: '0 auto', padding: '120px 24px 80px', textAlign: 'center' }}>

        {/* 3D Orbital decoration — top right */}
        <div style={{ position: 'absolute', top: 60, right: 80, width: 240, height: 240, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(99,102,241,0.15)' }} />
          <div style={{ position: 'absolute', inset: 30, borderRadius: '50%', border: '1px solid rgba(139,92,246,0.12)' }} />
          <div style={{ position: 'absolute', inset: 0, animation: 'orbit 12s linear infinite' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#6366f1', boxShadow: '0 0 15px #6366f1' }} />
          </div>
          <div style={{ position: 'absolute', inset: 0, animation: 'orbit2 8s linear infinite' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#ec4899', boxShadow: '0 0 12px #ec4899' }} />
          </div>
          <div style={{ position: 'absolute', inset: 0, animation: 'orbit3 16s linear infinite' }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#06b6d4', boxShadow: '0 0 10px #06b6d4' }} />
          </div>
        </div>

        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 22px', borderRadius: 9999, background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(236,72,153,0.12))', border: '1.5px solid rgba(167,139,250,0.4)', fontSize: 13, color: '#c4b5fd', fontWeight: 700, marginBottom: 40, boxShadow: '0 0 40px rgba(139,92,246,0.2)', animation: 'fadeInUp 0.6s ease forwards' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981', display: 'inline-block', animation: 'scanline 2s ease-in-out infinite' }} />
          AI-Powered · Infinite 3D Canvas · Multi-Agent Intelligence · Real-Time
        </div>

        {/* H1 */}
        <h1 style={{ fontSize: 'clamp(52px,8vw,96px)', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1.02, marginBottom: 24, animation: 'fadeInUp 0.7s 0.1s ease both' }}>
          Turn your{' '}
          <span key={wordIndex} style={{ display: 'inline-block', background: 'linear-gradient(135deg, #6366f1 0%, #a78bfa 40%, #ec4899 100%)', backgroundSize: '200% 200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'gradientShift 3s ease infinite, fadeInUp 0.4s ease' }}>
            {ROTATING_WORDS[wordIndex]}
          </span>
          <br />into an executable 3D workspace.
        </h1>

        <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.62)', maxWidth: 680, margin: '0 auto 60px', lineHeight: 1.75, fontWeight: 400, animation: 'fadeInUp 0.8s 0.2s ease both' }}>
          MindCanvas is the AI visual workspace that thinks with you — generating interconnected 3D nodes for every strategic dimension of your idea, instantly.
        </p>

        {/* 3D Prompt Hero Box */}
        <div style={{ margin: '0 auto 60px', width: '100%', maxWidth: 740, position: 'relative', animation: 'fadeInUp 0.9s 0.3s ease both' }}>
          {/* Glow behind the box */}
          <div style={{ position: 'absolute', inset: -2, borderRadius: 28, background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899, #06b6d4)', opacity: 0.6, filter: 'blur(20px)', zIndex: 0 }} />
          <div style={{ position: 'relative', zIndex: 1, background: 'rgba(8,8,22,0.96)', borderRadius: 26, padding: '24px 26px', border: '1px solid rgba(167,139,250,0.3)', boxShadow: '0 30px 80px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.1)' }}>
            <div style={{ position: 'relative', marginBottom: 14 }}>
              <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 18, zIndex: 1 }}>✨</span>
              <input
                type="text"
                placeholder='Try: "Build an AI Legal Auditor" or "Create a B2B SaaS startup"'
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleTryPrompt()}
                style={{ width: '100%', padding: '18px 200px 18px 50px', borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(167,139,250,0.3)', color: 'white', fontSize: 15, outline: 'none', fontFamily: "'Inter', sans-serif", boxSizing: 'border-box', transition: 'all 0.2s ease' }}
                onFocus={e => { e.target.style.borderColor = 'rgba(167,139,250,0.7)'; e.target.style.boxShadow = '0 0 30px rgba(139,92,246,0.2)' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(167,139,250,0.3)'; e.target.style.boxShadow = 'none' }}
              />
              <button
                onClick={handleTryPrompt}
                className="cta-btn"
                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', padding: '11px 22px', borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899)', border: 'none', color: 'white', fontSize: 13.5, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 24px rgba(99,102,241,0.45)', whiteSpace: 'nowrap' }}>
                Generate Canvas →
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              {[
                { label: '🚀 AI Legal Auditor', p: 'AI Legal Auditor for SMB contract review' },
                { label: '🤖 SaaS Platform', p: 'B2B SaaS startup for remote team collaboration' },
                { label: '🛒 DTC Subscriptions', p: 'DTC personalized nutrition subscriptions' },
                { label: '💼 FinTech Copilot', p: 'Automated accounting for freelancers' },
              ].map(item => (
                <button key={item.label} onClick={() => { setPrompt(item.p); window.location.href = `/dashboard?prompt=${encodeURIComponent(item.p)}` }}
                  style={{ padding: '5px 13px', borderRadius: 16, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', color: 'rgba(255,255,255,0.8)', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.22)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.1)'; (e.currentTarget as HTMLElement).style.transform = '' }}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3D Stats */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, flexWrap: 'wrap', animation: 'fadeInUp 1s 0.4s ease both' }}>
          {[
            { value: '10K+', label: 'Canvases Created', color: '#6366f1' },
            { value: '50+', label: 'Node Types', color: '#8b5cf6' },
            { value: '<3s', label: 'Generation Time', color: '#06b6d4' },
            { value: '99.9%', label: 'Uptime SLA', color: '#10b981' },
          ].map(stat => (
            <div key={stat.value} style={{ padding: '16px 30px', borderRadius: 20, textAlign: 'center', background: `${stat.color}12`, border: `1px solid ${stat.color}30`, boxShadow: `0 8px 30px rgba(0,0,0,0.4), 0 0 20px ${stat.color}15`, backdropFilter: 'blur(16px)', minWidth: 140, animation: 'counterUp 0.6s ease' }}>
              <div style={{ fontSize: 34, fontWeight: 900, background: `linear-gradient(135deg, ${stat.color}, white)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stat.value}</div>
              <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.45)', marginTop: 4, fontWeight: 600 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div style={{ position: 'relative', zIndex: 1, overflow: 'hidden', padding: '30px 0', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'linear-gradient(90deg, rgba(0,0,0,0.5), rgba(8,8,20,0.3), rgba(0,0,0,0.5))' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 120, background: 'linear-gradient(90deg, #080810, transparent)', zIndex: 2 }} />
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 120, background: 'linear-gradient(-90deg, #080810, transparent)', zIndex: 2 }} />
        <div style={{ display: 'flex', gap: 14, animation: 'marquee 30s linear infinite', width: 'max-content' }}>
          {[...NODE_TYPES, ...NODE_TYPES].map((node, i) => (
            <div key={i} className="node-pill" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 14, background: `${node.color}18`, border: `1px solid ${node.color}40`, color: node.color, fontSize: 13.5, fontWeight: 700, whiteSpace: 'nowrap', boxShadow: `0 4px 20px ${node.color}20`, cursor: 'default' }}>
              {node.label}
            </div>
          ))}
        </div>
      </div>

      {/* ── 3D HOLOGRAPHIC CANVAS PREVIEW ── */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 1180, margin: '110px auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>✦ Live Preview</div>
          <h2 style={{ fontSize: 52, fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 16 }}>
            See your idea <span style={{ background: 'linear-gradient(135deg,#6366f1,#a78bfa,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>come alive</span>
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.5)', maxWidth: 500, margin: '0 auto' }}>From a single prompt to a fully connected strategic workspace in under 3 seconds.</p>
        </div>

        {/* 3D Tilted Canvas Frame */}
        <div style={{ perspective: 1400 }}>
          <div style={{ borderRadius: 28, overflow: 'hidden', position: 'relative', transform: 'rotateX(9deg) rotateY(-4deg) scale(1.01)', boxShadow: '0 60px 140px rgba(0,0,0,0.95), 0 0 80px rgba(99,102,241,0.2)', border: '1px solid rgba(167,139,250,0.25)', transition: 'transform 0.5s ease' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'rotateX(3deg) rotateY(-1deg) scale(1.02)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'rotateX(9deg) rotateY(-4deg) scale(1.01)'}>
            {/* Window chrome */}
            <div style={{ padding: '14px 22px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(6,6,18,0.98)' }}>
              {['#ef4444', '#f59e0b', '#10b981'].map(c => <div key={c} style={{ width: 13, height: 13, borderRadius: '50%', background: c }} />)}
              <div style={{ marginLeft: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', animation: 'scanline 2s ease-in-out infinite' }} />
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: 700 }}>🧠 MindCanvas 3D Workspace — AI Legal Auditor Startup</span>
              </div>
            </div>
            {/* Canvas body */}
            <div style={{ padding: 40, position: 'relative', minHeight: 460, overflow: 'hidden', background: 'linear-gradient(145deg, rgba(6,6,20,0.99), rgba(8,8,24,0.98))', backgroundImage: 'linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
              {[
                { label: '💡 Core Concept', x: 370, y: 30, color: '#6366f1', size: 'large' },
                { label: '🎯 Problem Statement', x: 40, y: 20, color: '#ef4444', size: 'med' },
                { label: '✨ Unique Solution', x: 700, y: 20, color: '#10b981', size: 'med' },
                { label: '👥 Target Users (ICP)', x: 40, y: 200, color: '#f59e0b', size: 'med' },
                { label: '💼 Business Model', x: 700, y: 200, color: '#8b5cf6', size: 'med' },
                { label: '📈 Market Research', x: 180, y: 340, color: '#06b6d4', size: 'small' },
                { label: '🛠 Tech Architecture', x: 550, y: 340, color: '#3b82f6', size: 'small' },
              ].map((node, idx) => (
                <div key={node.label} style={{ position: 'absolute', left: node.x, top: node.y, padding: node.size === 'large' ? '14px 24px' : node.size === 'med' ? '11px 18px' : '8px 14px', background: `linear-gradient(135deg, ${node.color}22, ${node.color}10)`, border: `1.5px solid ${node.color}55`, borderRadius: 16, fontSize: node.size === 'large' ? 14 : node.size === 'med' ? 13 : 11.5, fontWeight: 800, color: 'white', backdropFilter: 'blur(16px)', whiteSpace: 'nowrap', boxShadow: `0 10px 40px rgba(0,0,0,0.65), 0 0 25px ${node.color}30`, animation: `float3d ${3.5 + idx * 0.4}s ease-in-out ${idx * 0.3}s infinite` }}>
                  {node.label}
                </div>
              ))}
              <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                <defs>
                  <filter id="glow"><feGaussianBlur stdDeviation="2" result="coloredBlur" /><feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                </defs>
                {[[430, 50, 150, 50], [430, 50, 760, 50], [430, 50, 150, 228], [430, 50, 760, 228], [430, 50, 240, 360], [430, 50, 610, 360]].map(([x1, y1, x2, y2], i) => (
                  <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={`rgba(167,139,250,${0.3 + i * 0.04})`} strokeWidth="1.5" strokeDasharray="6 5" filter="url(#glow)" />
                ))}
              </svg>
              <div style={{ position: 'absolute', bottom: 20, right: 24, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', animation: 'scanline 1.5s ease infinite' }} />
                Live 3D Canvas · 12 interconnected nodes · AI-generated
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 1180, margin: '0 auto', padding: '0 24px 110px' }}>
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>✦ Core Features</div>
          <h2 style={{ fontSize: 52, fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 16 }}>
            Built for serious <span style={{ background: 'linear-gradient(135deg,#6366f1,#a78bfa,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>thinkers</span>
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.5)', maxWidth: 520, margin: '0 auto' }}>Every feature designed to help you think faster, deeper, and more clearly.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: 24 }}>
          {FEATURES.map(f => (
            <div key={f.title} className="feature-card" style={{ padding: 36, borderRadius: 24, background: 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))', border: `1px solid ${f.color}25`, boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 30px ${f.glow}10`, backdropFilter: 'blur(20px)', cursor: 'default', transformStyle: 'preserve-3d', perspective: 1000 }}>
              <div style={{ width: 56, height: 56, borderRadius: 18, background: `${f.color}20`, border: `1px solid ${f.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 22, boxShadow: `0 0 24px ${f.glow}` }}>{f.icon}</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: 'white', letterSpacing: '-0.02em' }}>{f.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.58)', fontSize: 14.5, lineHeight: 1.75 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 1180, margin: '0 auto', padding: '0 24px 110px' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>✦ Loved by Builders</div>
          <h2 style={{ fontSize: 52, fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 16 }}>
            Don't take our <span style={{ background: 'linear-gradient(135deg,#6366f1,#a78bfa,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>word for it</span>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: 24 }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={t.name} className="testimonial-card" style={{ padding: 32, borderRadius: 24, background: 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)', transformStyle: 'preserve-3d', cursor: 'default' }}>
              <div style={{ fontSize: 36, marginBottom: 20, filter: 'drop-shadow(0 4px 12px rgba(139,92,246,0.4))' }}>{t.avatar}</div>
              <div style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.82)', lineHeight: 1.75, marginBottom: 24, fontStyle: 'italic' }}>"{t.text}"</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'white' }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{t.role} · {t.company}</div>
                </div>
              </div>
              <div style={{ marginTop: 18, display: 'flex', gap: 4 }}>
                {[...Array(5)].map((_, i) => <span key={i} style={{ color: '#f59e0b', fontSize: 14 }}>★</span>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 1180, margin: '0 auto', padding: '0 24px 110px' }}>
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>✦ Pricing</div>
          <h2 style={{ fontSize: 52, fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 16 }}>
            Simple <span style={{ background: 'linear-gradient(135deg,#6366f1,#a78bfa,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>pricing</span>
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.5)' }}>Start free. Scale as you grow. No surprises.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
          {PRICING.map(plan => (
            <div key={plan.tier} className="pricing-card" style={{ borderRadius: 24, padding: 32, position: 'relative', background: plan.highlight ? `linear-gradient(145deg, ${plan.color}22, ${plan.color}10)` : 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))', border: `1.5px solid ${plan.highlight ? plan.color + '60' : 'rgba(255,255,255,0.1)'}`, boxShadow: plan.highlight ? `0 30px 80px rgba(0,0,0,0.7), 0 0 50px ${plan.color}25` : '0 20px 60px rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)' }}>
              {plan.highlight && (
                <div style={{ position: 'absolute', top: -15, left: '50%', transform: 'translateX(-50%)', background: `linear-gradient(135deg, ${plan.color}, #ec4899)`, borderRadius: 9999, padding: '5px 18px', fontSize: 11, fontWeight: 900, color: 'white', letterSpacing: '0.1em', whiteSpace: 'nowrap', boxShadow: `0 4px 20px ${plan.color}50` }}>⭐ MOST POPULAR</div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: plan.color, boxShadow: `0 0 12px ${plan.color}` }} />
                <span style={{ fontSize: 15, fontWeight: 800, color: 'rgba(255,255,255,0.75)' }}>{plan.tier}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 28 }}>
                <span style={{ fontSize: 46, fontWeight: 900, color: 'white', letterSpacing: '-0.04em' }}>{plan.price}</span>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: 600 }}>{plan.period}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.78)', display: 'flex', alignItems: 'center', gap: 9 }}>
                    <span style={{ color: plan.color, fontWeight: 900, fontSize: 15 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup" style={{ display: 'block', textAlign: 'center', padding: '12px 20px', borderRadius: 14, background: plan.highlight ? `linear-gradient(135deg, ${plan.color}, #ec4899)` : 'rgba(255,255,255,0.07)', border: plan.highlight ? 'none' : '1px solid rgba(255,255,255,0.12)', color: 'white', fontSize: 14, fontWeight: 700, textDecoration: 'none', boxShadow: plan.highlight ? `0 6px 24px ${plan.color}40` : 'none', transition: 'all 0.2s ease' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = '' }}>
                {plan.tier === 'Enterprise' ? 'Contact Sales →' : 'Get Started →'}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL 3D CTA ── */}
      <section style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 24px 140px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative' }}>
          {/* Multi-color glow */}
          <div style={{ position: 'absolute', inset: -3, borderRadius: 38, background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899, #06b6d4)', filter: 'blur(24px)', opacity: 0.5 }} />
          <div style={{ position: 'relative', background: 'rgba(8,8,22,0.97)', borderRadius: 36, padding: '72px 48px', border: '1px solid rgba(167,139,250,0.3)', boxShadow: '0 40px 120px rgba(0,0,0,0.95), inset 0 1px 0 rgba(255,255,255,0.08)' }}>
            {/* Floating orbs inside CTA */}
            <div style={{ position: 'absolute', top: 20, left: 30, width: 80, height: 80, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.3), transparent)', animation: 'float3d 5s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.25), transparent)', animation: 'float3d 4s ease-in-out 1s infinite' }} />
            <div style={{ fontSize: 12, fontWeight: 800, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 20 }}>✦ Get Started Today</div>
            <h2 style={{ fontSize: 58, fontWeight: 900, letterSpacing: '-0.05em', marginBottom: 22, color: 'white', lineHeight: 1.05 }}>
              Start thinking <span style={{ background: 'linear-gradient(135deg,#6366f1,#a78bfa,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>smarter</span> today.
            </h2>
            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.58)', marginBottom: 48, lineHeight: 1.75, maxWidth: 500, margin: '0 auto 48px' }}>
              Join thousands of founders, product managers, and engineers building better ideas with MindCanvas 3D.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/auth/signup" className="cta-btn" style={{ padding: '16px 40px', borderRadius: 16, background: 'linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899)', color: 'white', fontSize: 16, fontWeight: 800, textDecoration: 'none', boxShadow: '0 6px 32px rgba(99,102,241,0.5)', display: 'inline-block' }}>
                ✨ Create Your Free Canvas →
              </Link>
              <Link href="/auth/signin" style={{ padding: '16px 32px', borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: 700, textDecoration: 'none', transition: 'all 0.2s ease', display: 'inline-block' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)' }}>
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '40px 24px', background: 'rgba(0,0,0,0.4)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🧠</div>
            <span style={{ fontWeight: 900, fontSize: 16, letterSpacing: '-0.03em', color: 'rgba(255,255,255,0.8)' }}>MindCanvas</span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, fontWeight: 600, textAlign: 'center' }}>
            © 2026 MindCanvas. Built by Ubaid Qureshi And Team · Powered by AI
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy', 'Terms', 'Contact'].map(link => (
              <a key={link} href="#" style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, fontWeight: 600, textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)'}>{link}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
