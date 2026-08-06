'use client'
import { useState, useEffect, useRef } from 'react'

interface ScenarioSimulatorModalProps {
  canvasTitle: string
  nodes: any[]
  onClose: () => void
  onApplyInsights: (insights: any[]) => void
}

const PRESET_SCENARIOS = [
  { id: 'scale', icon: '🚀', title: 'Hyper-Scale (10x Growth)', subtitle: 'Viral growth & global expansion', desc: 'Simulate viral growth, enterprise adoption, and global expansion across all revenue streams.', color: '#10b981', glow: 'rgba(16,185,129,0.35)', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.3)', tag: 'GROWTH' },
  { id: 'pivot', icon: '🔄', title: 'Strategic Pivot', subtitle: 'SMB to Enterprise re-positioning', desc: 'Shift target customer profile from self-serve SMBs to Mid-Market and Enterprise with ACV $15K+.', color: '#a78bfa', glow: 'rgba(167,139,250,0.35)', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.3)', tag: 'STRATEGY' },
  { id: 'bear', icon: '🛡️', title: 'Bear Market / Price War', subtitle: 'Defend margin and unit economics', desc: 'Simulate a major competitor launching a free tier or aggressive budget cuts in your market.', color: '#f59e0b', glow: 'rgba(245,158,11,0.35)', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.3)', tag: 'DEFENSE' },
  { id: 'ai_threat', icon: '⚡', title: 'Big Tech Competitor Entry', subtitle: 'Google or Microsoft entering market', desc: 'Simulate Google or Microsoft launching a built-in competing feature at zero marginal cost.', color: '#ef4444', glow: 'rgba(239,68,68,0.35)', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.3)', tag: 'THREAT' },
  { id: 'fundraise', icon: '💎', title: 'Series A Fundraise', subtitle: '$5M to $15M raise strategy', desc: 'Model your business for a Series A raise — metrics, narrative, investor targeting, and valuation.', color: '#06b6d4', glow: 'rgba(6,182,212,0.35)', bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.3)', tag: 'FUNDING' },
  { id: 'ai_first', icon: '🧠', title: 'AI-First Transformation', subtitle: 'Rebuild product with AI at core', desc: 'Simulate rebuilding your core product with AI agents, LLM pipelines, and automation-first workflows.', color: '#8b5cf6', glow: 'rgba(139,92,246,0.35)', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.3)', tag: 'INNOVATION' },
]

const RESULT_TABS = [
  { id: 'overview', label: '📊 Overview', short: 'Overview' },
  { id: 'actions', label: '⚡ Action Plan', short: 'Actions' },
  { id: 'financial', label: '💰 Financial', short: 'Financial' },
  { id: 'risks', label: '⚠️ Risk Matrix', short: 'Risks' },
]

function buildAnalysis(scenarioId: string, title: string, nodes: any[]): Record<string, string> {
  const topNodes = nodes.slice(0, 5).map((n: any) => n.data?.title).filter(Boolean)
  const nodeCtx = topNodes.join(', ') || 'core product nodes'
  const clean = title.replace(/[*#_~]/g, '').trim()

  if (scenarioId === 'scale') return {
    overview: `## Hyper-Scale Simulation: "${clean}"\n\n**Impact Rating: 9.4 / 10 — High Velocity Growth Phase**\n\n• **Distribution Flywheel**: Launch viral referral loops targeting early adopters. Implement automated onboarding sequences and tier-based partner incentives to acquire 10,000 active users in 90 days.\n• **Enterprise Revenue Engine**: Introduce enterprise SLA tiers ($299–$999/month) spanning ${nodeCtx}. Add usage-based billing with automated upsell triggers.\n• **Product Moat**: Build deep workflow automations and native 2-way integrations with 8+ adjacent tools. Target 88%+ Net Revenue Retention.\n• **Infrastructure Readiness**: Pre-provision auto-scaling cloud infrastructure to handle 10x traffic spikes with under 150ms P95 latency.\n• **Global Expansion**: Launch in UK, Canada, Australia using localized pricing parity and regional data residency compliance.`,
    actions: `## 30-Day Hyper-Scale Action Plan\n\n**Week 1 — Foundation**\n• Audit pricing page for enterprise readiness — add annual prepay discount toggle\n• Set up Mixpanel or PostHog funnel tracking for every conversion step\n• Publish 3 case studies from power users with hard ROI numbers\n\n**Week 2 — Acquisition**\n• Activate automated email onboarding sequences (Days 1, 3, 7, 14)\n• Launch ProductHunt campaign with coordinated team upvotes\n• Start cold LinkedIn outbound to 200 ICP decision-makers (VP level and above)\n\n**Week 3 — Revenue**\n• Introduce Enterprise tier with SSO, audit logs, priority support\n• Run 15 discovery calls, convert minimum 3 to annual contracts\n• Implement referral program: 1 month free per successful referral\n\n**Week 4 — Scale Systems**\n• Deploy auto-scaling infrastructure on AWS or Vercel with traffic triggers\n• Hire or contract 1 Customer Success Manager for enterprise accounts\n• Weekly velocity review: CAC, MRR growth, churn, NPS score`,
    financial: `## Financial Impact Model: 10x Scale Scenario\n\n**Current Baseline (Assumed)**\n• MRR: $12,000 → Post-Scale Target: $120,000+\n• Active Users: 500 → Target: 5,000+\n• CAC: $180 → Optimized: $90 via viral loop\n• LTV: $900 → Enhanced: $2,400 annual enterprise\n\n**Revenue Breakdown (Month 12)**\n• Self-Serve ($29/mo): 2,000 users = $58,000 MRR\n• Team Plan ($99/mo): 300 teams = $29,700 MRR\n• Enterprise ($499/mo): 65 accounts = $32,435 MRR\n• **Total Projected MRR: $120,135**\n\n**Unit Economics Targets**\n• Gross Margin: 82%+ (SaaS standard)\n• Payback Period: under 4 months\n• NRR (Net Revenue Retention): 118%+\n• LTV:CAC Ratio: 4.2:1 minimum\n\n**Investment Required**\n• Engineering (3 hires): $240K/year\n• Marketing: $15K/month\n• Infrastructure: $8K/month\n• Total Runway Needed: $580K for 18-month runway`,
    risks: `## Risk Matrix: Hyper-Scale Scenario\n\n**HIGH RISK — Act Now**\n• 🔴 Infrastructure overload during viral spike — Pre-provision 10x capacity buffers, enable auto-scaling 30 days before launch\n• 🔴 Churn spike from enterprise mis-fit — Require POC calls before annual contracts; add dedicated CSM at $30K+ ACV\n\n**MEDIUM RISK — Monitor Closely**\n• 🟡 CAC blowout if paid channels activated prematurely — Organic-first until PMF score above 40; paid ads only after validation\n• 🟡 Talent gap for scaling — Start contractor network now; use Toptal or arc.dev for fast sourcing\n\n**LOW RISK — Watch Quarterly**\n• 🟢 Pricing resistance on enterprise tier — Offer 30-day enterprise trial with success metrics defined upfront\n• 🟢 Competitor response with price cuts — Compete on depth of workflow integration, not price`,
  }

  if (scenarioId === 'pivot') return {
    overview: `## Strategic Pivot Analysis: "${clean}"\n\n**Impact Rating: 8.8 / 10 — Customer and ICP Re-alignment**\n\n• **ICP Shift Target**: Reposition from self-serve SMB users to Mid-Market and Enterprise accounts ($15,000+ ACV). Focus on VP-level and C-suite decision makers.\n• **Enterprise Feature Roadmap**: Add SSO/SAML 2.0, granular RBAC access controls, SOC 2 compliance, and audit logs across ${nodeCtx}.\n• **Outbound Sales Motion**: Build structured 3-touch outbound sequences: Email then LinkedIn then Custom Demo then Trial.\n• **Positioning Narrative Shift**: Evolve from "tool for individuals" to "mission-critical platform for teams" — update all marketing copy.\n• **Retention Bridge**: Maintain self-serve tiers as a self-funding lead generator while sales focuses 80% on enterprise.`,
    actions: `## Strategic Pivot — 30-Day Action Plan\n\n**Week 1 — Signal and Validate**\n• Interview 10 current SMB customers — identify which have grown into mid-market\n• Build enterprise ICP persona: company size 100–500 employees, $50M+ ARR, tech-forward\n• Survey top 5 enterprise prospects on deal-breaker features: SSO, Audit logs, SLA\n\n**Week 2 — Product Readiness**\n• Scope and prioritize SSO/SAML implementation (estimated 2–3 sprint effort)\n• Draft enterprise SLA document: 99.9% uptime, 4-hour response SLA\n• Design enterprise admin dashboard with user management and role assignments\n\n**Week 3 — Go-To-Market**\n• Launch Enterprise Edition landing page for "${clean}"\n• Write 2 enterprise case studies using real power user data\n• Set up Apollo.io for enterprise outbound targeting 500 sequenced contacts\n\n**Week 4 — Pipeline Building**\n• Book 15 discovery calls with target ICP directors this month\n• Define enterprise deal criteria: minimum $10K ACV, annual contract, legal sign-off\n• Present enterprise roadmap to 3 pilot accounts in exchange for paid POC`,
    financial: `## Pivot Financial Model: SMB to Enterprise\n\n**Revenue Mix Before Pivot**\n• SMB ($29/mo avg): 800 customers = $23,200 MRR\n• Churn Rate: 4.2%/month (high — SMB norm)\n• LTV: ~$690 per customer\n\n**Revenue Mix After Pivot (Month 18)**\n• Enterprise ($1,200/mo avg): 45 accounts = $54,000 MRR\n• Retained SMB ($29/mo): 400 accounts = $11,600 MRR\n• Mid-Market ($299/mo): 80 accounts = $23,920 MRR\n• **Total Projected MRR: $89,520 — up 285%**\n\n**Improved Unit Economics**\n• Enterprise Churn: 0.8%/month vs 4.2% SMB\n• Enterprise LTV: $15,000+ vs $690 SMB\n• Sales Cycle: 45–90 days vs 0 days self-serve\n• CAC Enterprise: $2,400 giving 6.25x LTV:CAC ratio\n\n**Investment Required**\n• 1 Enterprise AE: $120K base + $60K OTE\n• SOC 2 Compliance: $30K one-time via Vanta\n• Enterprise Feature Development: $80K\n• Total: ~$290K for 12-month pivot`,
    risks: `## Risk Matrix: Strategic Pivot\n\n**HIGH RISK — Act Now**\n• 🔴 SMB churn accelerates during pivot distraction — Assign 1 team member as SMB caretaker; don't sunset SMB tier for 18 months\n• 🔴 Longer sales cycles (90+ days) create cashflow gap — Close 3 annual enterprise deals upfront; maintain $200K+ operating reserve\n\n**MEDIUM RISK — Monitor Closely**\n• 🟡 Enterprise prospects require features not yet built — Charge for POC early access; use revenue to fund feature development\n• 🟡 Sales talent gap — enterprise selling is a different skill set — Hire 1 experienced enterprise AE with existing network in your vertical\n\n**LOW RISK — Watch Quarterly**\n• 🟢 Brand perception as "SMB tool" — Rebrand with enterprise-focused messaging and new customer logos on homepage\n• 🟢 Compliance costs exceed budget — Use Vanta.com for automated SOC 2 — reduces cost from $120K to $30K`,
  }

  if (scenarioId === 'bear') return {
    overview: `## Bear Market Defense: "${clean}"\n\n**Impact Rating: 8.3 / 10 — Margin Defense and Unit Economics**\n\n• **COGS and Cost Reduction**: Cut infrastructure cost-per-user by 40% using edge caching, serverless API routes, and optimized DB queries across ${nodeCtx}.\n• **Churn Defense**: Offer existing monthly users "2-Months-Free" on annual upgrade. Keep churn strictly below 1.8% with proactive customer health alerts.\n• **Low-CAC Acquisition**: Shift from paid ads to founder-led content, community events, and SEO authority articles. Target CAC below $120.\n• **Competitive Positioning**: Publish a public competitor comparison matrix highlighting speed, dedicated support, and vertical depth.\n• **Lean Operations**: Freeze non-essential SaaS spend, renegotiate vendor contracts, extend runway by 6 months without a new fundraise.`,
    actions: `## Bear Market 30-Day Defense Plan\n\n**Week 1 — Cost Audit**\n• Audit all SaaS subscriptions — cancel anything with less than 70% team usage\n• Negotiate AWS or GCP credits — most providers offer 30–50% startup credits\n• Freeze all contractor and agency spend; consolidate to core team only\n\n**Week 2 — Retention Blitz**\n• Contact top 20% of accounts by revenue — offer pre-paid annual renewal deals\n• Implement customer health score based on usage frequency and last login\n• Auto-trigger CSM outreach within 24 hours when health score drops below 50\n\n**Week 3 — Low-Cost Acquisition**\n• Launch 2 SEO pillar articles targeting high-intent transactional keywords\n• Set up a founder LinkedIn content calendar: 3 posts per week for 90 days\n• Launch community channel on Discord or Slack — seed with 50 power users\n\n**Week 4 — Competitive Moat**\n• Publish "vs Competitor" landing pages with factual feature comparison\n• Be honest about 2 weaknesses — this builds trust with prospects\n• Announce "Price Lock Guarantee" — current pricing locked for 24 months on annual plans`,
    financial: `## Bear Market Financial Defense Model\n\n**Scenario: Competitor Launches Free Tier**\n• Assumed churn impact: +2.1% monthly uplift for 3 months\n• Revenue at risk: ~$8,400 MRR if 15% of SMB base churns\n\n**Defense Targets**\n• Monthly Burn Rate: Reduce from $45K to $28K/month — 38% cut\n• Runway Extension: From 9 months to 16 months without new raise\n• Churn Cap: Hold at less than 2% monthly via retention programs\n\n**Cost-Cutting Breakdown**\n• Infrastructure optimization: -$3,200/month via Cloudflare and caching\n• SaaS audit and cancellations: -$1,800/month\n• Freeze marketing spend pivot to organic: -$6,000/month\n• Contractor reduction: -$5,000/month\n• **Total Monthly Savings: $16,000**\n\n**Revenue Defense Playbook**\n• Annual prepay conversion — 20% of base generates +$34K upfront cash\n• Price lock upsell adds +$8K MRR from loyalty incentives\n• Community-led growth via SEO generates +$3K MRR by Month 4\n• **Net Runway Extension: +7 months**`,
    risks: `## Risk Matrix: Bear Market Defense\n\n**HIGH RISK — Act Now**\n• 🔴 Key talent attrition during cost cuts — Retain top 3 engineers with equity vesting acceleration; be radically transparent about company health\n• 🔴 Churn cascade if one large account churns publicly — Proactively lock in top 10 accounts with 18-month contracts now\n\n**MEDIUM RISK — Monitor Closely**\n• 🟡 Organic content takes 3–6 months to generate leads — Combine with community events and speaking slots for faster visibility\n• 🟡 Competitor free tier commoditizes core features — Build workflow depth and integrations that free tools cannot match at scale\n\n**LOW RISK — Watch Quarterly**\n• 🟢 Customer price sensitivity on annual upsell — Offer 90-day money-back guarantee on annual plans to reduce anxiety\n• 🟢 Investor concern about growth deceleration — Show improving LTV:CAC ratio and gross margin expansion as proof of business quality`,
  }

  if (scenarioId === 'ai_threat') return {
    overview: `## Big Tech Competitor Defense: "${clean}"\n\n**Impact Rating: 8.9 / 10 — Competitive Moat Strategy**\n\n• **Vertical Workflow Depth**: Double down on specialized features in ${nodeCtx} that Big Tech platforms cannot build cost-effectively for broad audiences.\n• **Agility and Support Advantage**: Maintain weekly release velocity and direct founder-to-customer support. Target 68+ NPS vs enterprise competitors.\n• **Ecosystem Lock-In**: Build deep 2-way integrations with 10+ niche tools used daily, creating a 6-month switching barrier.\n• **Community Advocate Moat**: Launch a certified power user program. 1,000 certified advocates create organic word-of-mouth defense.\n• **Narrative Positioning**: Own "built for experts in this vertical" — a purpose-built solution Big Tech cannot customize for your niche.`,
    actions: `## Big Tech Defense 30-Day Action Plan\n\n**Week 1 — Intelligence Gathering**\n• Map exact feature overlap with the competing Big Tech product — identify 100% parity vs 0% parity features\n• Brief your top 50 accounts directly via call or email — communicate your roadmap advantage proactively\n• Monitor social mentions and competitor reviews on G2 and Capterra for talking points\n\n**Week 2 — Product Moat**\n• Ship 2 features that Big Tech competitor cannot build cost-effectively for your vertical\n• Deepen integrations: Add bidirectional sync with 3 tools your ICP uses daily\n• Launch API and webhook capability — let power users build custom workflows\n\n**Week 3 — Community Building**\n• Launch certified power user program with private community access\n• Publish 3 case studies with specific ROI numbers: time saved and revenue generated\n• Run live webinar on how to get 10x more value versus the competitor\n\n**Week 4 — Market Positioning**\n• Update homepage to own the vertical category definitively\n• Create factual "Why we beat [Big Tech product]" comparison page\n• Announce public 6-month product roadmap showing vertical-specific features`,
    financial: `## Big Tech Entry Financial Impact Model\n\n**Revenue at Risk Assessment**\n• Estimated market share loss pessimistic case: 18% of user base in 6 months\n• Revenue at risk: ~$14,000 MRR if 18% churn materializes\n• Mitigation target: Hold churn to less than 6% via retention plays\n\n**Moat Investment Budget**\n• Vertical-specific features via 2 engineers over 4 months: $120K\n• Community platform such as Tribe or Circle: $500/month\n• API and developer ecosystem one-time build: $40K\n• Content and case studies: $8K\n• **Total moat investment: $175K**\n\n**Expected ROI of Moat Strategy**\n• Churn reduction from 18% to 6% saves $9,800 MRR = $117,600/year\n• Community-driven growth adds +$6,000 MRR by Month 6\n• Developer ecosystem leads generate +$4,200 MRR by Month 9\n• **Net ROI: 3.6x on moat investment within 12 months**\n\n**Pricing Response Strategy**\n• Do NOT match Big Tech pricing — compete on value and depth, not price\n• Add a free starter tier to protect top-of-funnel from being vacuumed up`,
    risks: `## Risk Matrix: Big Tech Competitor Entry\n\n**HIGH RISK — Act Now**\n• 🔴 Enterprise customers evaluate switching immediately — Executive sponsor calls to top 20 accounts within 48 hours; offer multi-year lock-in incentives\n• 🔴 Big Tech may poach key engineers — Equity refresh grants plus retention bonuses tied to 18-month vest\n\n**MEDIUM RISK — Monitor Closely**\n• 🟡 Feature parity erodes over 12–18 months — Move faster on niche vertical features; leverage customer feedback loops Big Tech cannot replicate\n• 🟡 Pricing pressure from free bundled alternative — Annual contract customers remain locked in; free tier protects top-of-funnel\n\n**LOW RISK — Watch Quarterly**\n• 🟢 Brand confusion in market — Clarify category leadership through thought leadership content and analyst briefings\n• 🟢 Investor concern about existential risk — Show growing NRR above 110% as proof of defensible installed base`,
  }

  if (scenarioId === 'fundraise') return {
    overview: `## Series A Fundraise Simulation: "${clean}"\n\n**Impact Rating: 9.1 / 10 — Capital Raise Readiness**\n\n• **Target Raise**: $8M–$12M Series A at $40–$60M pre-money valuation (5–7x ARR multiple)\n• **Traction Requirements**: Investors expect $1M+ ARR, 15%+ MoM growth, under 3% monthly churn, and a clear path to $10M ARR.\n• **Narrative Anchor**: Position "${clean}" as the definitive AI-native platform in your vertical — category-defining infrastructure.\n• **Investor Targeting**: Tier 2 funds with $100M–$500M AUM with portfolio in B2B SaaS or AI tooling: Bessemer, Redpoint, OpenView, Craft Ventures.\n• **Data Room Essentials**: P&L, cohort retention curves, pipeline by channel, NPS trends, and an 18-month financial model with 3 scenarios.`,
    actions: `## Fundraise Readiness 30-Day Action Plan\n\n**Week 1 — Build the Data Room**\n• Build investor data room in Notion or Docsend: financial model, cap table, P&L, cohort analysis\n• Prepare 3 financial scenarios: Bear (0% growth), Base (15% MoM), Bull (25% MoM)\n• Document all key metrics: MRR, ARR, churn, LTV, CAC, NRR, gross margin\n\n**Week 2 — Craft the Narrative**\n• Write 2-page investor memo: Problem then Solution then Market then Traction then Team then Ask\n• Design 15-slide pitch deck using the Sequoia format\n• Identify and prepare 3 customer reference calls — investors will call all 3\n\n**Week 3 — Begin Outreach**\n• Build target investor list: 40 funds plus 20 angels relevant to your vertical\n• Get warm intros via existing investors, advisors, and portfolio founders\n• Send first 15 outreach emails and track open rates and response rates in Airtable\n\n**Week 4 — Create Momentum**\n• Run 8–10 first meetings and qualify by follow-up speed and question quality\n• Set artificial deadline — "we are closing in 6 weeks" — to create urgency\n• Negotiate term sheet focusing on valuation, pro-rata rights, and board composition`,
    financial: `## Series A Financial Model\n\n**Raise Structure**\n• Target: $10M Series A\n• Pre-money valuation: $45M (4.5x forward ARR multiple)\n• Post-money: $55M\n• Dilution: ~18.2%\n\n**Use of Proceeds ($10M)**\n• Engineering — 5 senior hires: $3.2M at 32%\n• Sales and Marketing: $2.8M at 28%\n• Customer Success: $1.2M at 12%\n• Product and Design: $800K at 8%\n• G&A and Operations: $600K at 6%\n• Infrastructure and Ops: $400K at 4%\n• Working Capital Buffer: $1M at 10%\n\n**Post-Raise Targets at 18 Months**\n• ARR: $10M+ from assumed $2.5M at raise\n• Headcount: 35 growing to 58 employees\n• Customers: 200 growing to 850 enterprise accounts\n• NRR: 118%+\n• Gross Margin: 80%+\n\n**Investor Return Model**\n• Series B target 24 months post-A: $50M at $200M valuation\n• Series A IRR at Series B: 2.6x in 2 years = 61% IRR`,
    risks: `## Risk Matrix: Series A Fundraise\n\n**HIGH RISK — Act Now**\n• 🔴 Fundraise takes longer than 6 months — drains focus and morale — Start process with 12+ months runway; never raise with less than 6 months runway\n• 🔴 Down round risk if metrics slip during process — Nail Q1 metrics before starting outreach; launch process at a growth peak\n\n**MEDIUM RISK — Monitor Closely**\n• 🟡 Board composition post-raise limits founder control — Negotiate 2 founder seats plus 1 investor seat; avoid giving up board majority at Series A\n• 🟡 Investor mis-alignment on long-term vision — Only take money from investors who deeply understand your vertical; talk to their portfolio founders first\n\n**LOW RISK — Watch Quarterly**\n• 🟢 Dilution exceeds expectations — Run tight process with multiple term sheets; use competition to compress dilution from 25% to 18%\n• 🟢 Legal or compliance issues in due diligence — Run a pre-DD audit 30 days before first meetings; clean up cap table, IP assignments, employee agreements`,
  }

  // ai_first default
  return {
    overview: `## AI-First Transformation: "${clean}"\n\n**Impact Rating: 9.6 / 10 — Innovation and Defensibility**\n\n• **AI-Native Architecture**: Rebuild core workflows with LLM pipelines — replace manual user actions with AI-suggested actions and proactive insights across ${nodeCtx}.\n• **Agent Swarm Integration**: Deploy specialized AI agents for Research, Analysis, Drafting, and Review that work autonomously on user-defined goals.\n• **Zero-Shot Onboarding**: Replace manual setup wizards with conversational AI — user describes their goal; AI builds the entire workspace in under 10 seconds.\n• **Predictive Intelligence**: Surface proactive insights based on canvas data to guide users toward their next best action.\n• **Defensibility via Data Flywheel**: Every AI interaction improves your proprietary models — creating a moat that compounds with usage.`,
    actions: `## AI-First Transformation 30-Day Action Plan\n\n**Week 1 — AI Stack Selection**\n• Select LLM providers: GPT-4o for reasoning, Claude 3.5 for long-context, Gemini Flash for speed and cost\n• Set up LangChain or Vercel AI SDK for streaming responses and tool calling\n• Audit current flows: identify top 5 manual tasks ripe for AI automation across ${nodeCtx}\n\n**Week 2 — Core AI Features**\n• Ship AI Auto-Complete: Suggest next actions as users type in any node\n• Build "AI Explain" feature: single-click context-aware explanation of any node\n• Implement AI Smart Search: semantic search across all canvas nodes using embeddings\n\n**Week 3 — Agent Architecture**\n• Deploy Research Agent: auto-fetches market data, competitor info, and statistics\n• Deploy Analysis Agent: runs SWOT, financial modeling, and risk analysis on canvas data\n• Build Agent Orchestrator: user states a goal; agents collaborate to achieve it\n\n**Week 4 — Polish and Positioning**\n• Add AI confidence scores to all AI-generated content to build user trust\n• Update pricing: add "AI Credits" usage model for heavy AI consumers\n• Launch "AI-First" marketing narrative with benchmark comparisons`,
    financial: `## AI-First Transformation Financial Model\n\n**AI Infrastructure Costs**\n• GPT-4o API: ~$0.015 per 1K tokens — average 2K tokens per user session\n• Cost per active user per month: $0.30–$0.90\n• At 5,000 MAU: $1,500–$4,500/month in AI costs\n• Target AI gross margin: 70%+ via caching and smart model routing\n\n**Revenue Uplift from AI Features**\n• Conversion rate improvement via AI onboarding: +34% industry benchmark\n• Retention improvement: churn drops from 3.2% to 1.8%/month\n• Upsell to AI Power tier at $79/mo: captures 15% of existing base\n\n**AI Tier Pricing Model**\n• Starter — 50 AI credits/mo at $29/mo: basic AI suggestions\n• Pro — 500 AI credits/mo at $79/mo: full agent access\n• Enterprise — unlimited at $299+/mo: custom models and API access\n\n**3-Year AI Revenue Projection**\n• Year 1: $180K ARR as AI features launch\n• Year 2: $890K ARR as AI-first positioning takes hold\n• Year 3: $3.2M ARR as AI moat drives category leadership\n\n**ROI Summary**\n• Development cost: $280K for 4 engineers over 6 months\n• Revenue upside Year 2: $890K\n• Net ROI: 3.2x in 18 months`,
    risks: `## Risk Matrix: AI-First Transformation\n\n**HIGH RISK — Act Now**\n• 🔴 AI hallucinations damage user trust — Add confidence scores, source citations, and human-in-the-loop checkpoints on all AI outputs\n• 🔴 AI API cost blowout at scale — Implement aggressive Redis caching, model routing to cheaper models for simple tasks, hard usage caps per tier\n\n**MEDIUM RISK — Monitor Closely**\n• 🟡 LLM provider dependency on OpenAI outage — Build multi-provider fallback: OpenAI then Anthropic then local model; never rely on single API\n• 🟡 GDPR and data privacy concerns — Ensure data stays in EU region; add opt-out toggle; get DPA agreements with all AI providers\n\n**LOW RISK — Watch Quarterly**\n• 🟢 User resistance to AI-generated content — Frame as "AI-assisted" not "AI-replaced"; always show the human edit layer prominently\n• 🟢 Competitive catch-up from rivals adding AI — Speed of data flywheel growth is your moat — 6-month head start compounds exponentially`,
  }
}

function buildCustomAnalysis(prompt: string, title: string, nodes: any[]): Record<string, string> {
  const clean = title.replace(/[*#_~]/g, '').trim()
  const topNodes = nodes.slice(0, 4).map((n: any) => n.data?.title).filter(Boolean).join(', ') || 'core canvas nodes'
  return {
    overview: `## Custom Scenario: "${prompt}"\n\n**Impact Rating: 8.7 / 10 — Strategic Risk and Opportunity Analysis**\n\n• **Scenario Assessment**: Evaluating "${prompt}" against "${clean}" — analyzing ${topNodes}.\n• **Strategic Opportunity**: First-mover advantage in responding can yield a 6–12 month category leadership window if acted upon decisively.\n• **Operational Vulnerability**: Single points of failure likely exist in onboarding flow and enterprise feature readiness — identify and remediate before scenario materializes.\n• **Market Positioning**: Decisive action on this scenario can yield competitive advantage before competitors recognize the same signal.\n• **Competitive Intelligence**: Monitor competitor responses weekly — use their moves as signal for where to double-down vs where to cede ground.`,
    actions: `## Custom Scenario 30-Day Response Plan\n\n**Week 1 — Intelligence and Assessment**\n• Convene leadership war-room session — map full impact of "${prompt}" across ${topNodes}\n• Quantify revenue at risk and opportunity: best-case vs worst-case MRR delta\n• Assign scenario owner: 1 DRI (Directly Responsible Individual) with full authority to act\n\n**Week 2 — Strategic Response**\n• Select 3 high-leverage countermeasures ranked by impact-to-effort ratio\n• Reallocate 20% of current sprint capacity to scenario response initiatives\n• Brief key stakeholders: board, investors, and top 10 customers proactively\n\n**Week 3 — Execute**\n• Ship top countermeasure with defined success metrics and weekly check-in cadence\n• Launch competitive positioning content: blog post, comparison page, social posts\n• Activate customer retention play: personal outreach to all accounts at churn risk\n\n**Week 4 — Review and Adapt**\n• Measure all KPIs vs baseline — quantify whether countermeasures moved the needle\n• Document learnings in a scenario playbook for future reference\n• Adjust roadmap priorities based on validated signals from this month's experiment`,
    financial: `## Custom Scenario Financial Impact Model\n\n**Revenue Assessment for "${prompt}"**\n• Estimated revenue at risk: 8–22% of current MRR (scenario-dependent)\n• Upside opportunity if scenario is leveraged proactively: +15–35% MRR within 6 months\n• Critical threshold: Maintain gross margin above 70% throughout response phase\n\n**Response Budget Estimate**\n• Engineering countermeasure: $40K–$80K depending on feature scope\n• Marketing and positioning: $12K–$20K across content, ads, and events\n• Customer success retention: $8K for proactive outreach and CSM coverage\n• **Total Response Budget: $60K–$108K**\n\n**Expected Financial Outcomes — 3 Scenarios**\n• 🔴 Pessimistic — no action taken: -18% MRR over 6 months\n• 🟡 Base — partial response executed: Flat MRR, +5% by Month 6\n• 🟢 Optimistic — full response executed: +22% MRR by Month 6, category leadership\n\n**Recommendation**: Invest the $60K–$108K response budget — expected ROI is 3–5x within 12 months based on comparable scenario outcomes.`,
    risks: `## Risk Matrix: Custom Scenario "${prompt}"\n\n**HIGH RISK — Immediate Action Required**\n• 🔴 Revenue concentration risk — if top 3 accounts represent more than 40% of MRR, diversify now before scenario materializes\n• 🔴 Decision paralysis — scenario analysis without committed action plan wastes the opportunity window entirely\n• Mitigation: Set 48-hour decision deadline on top countermeasure; act before competitors recognize the same signal\n\n**MEDIUM RISK — Monitor and Prepare**\n• 🟡 Team bandwidth — responding to scenario while maintaining product velocity is challenging without dedicated squad\n• 🟡 Market timing — moving too early or too late on scenario response can both destroy significant value\n• Mitigation: Dedicated scenario response squad of 2–3 people separate from core roadmap team\n\n**LOW RISK — Track and Communicate**\n• 🟢 Brand perception shift — scenarios often create narrative opportunities if communicated proactively and with confidence\n• 🟢 Investor concern — proactively brief investors before they read about it elsewhere; show you are ahead of the signal`,
  }
}

function renderFormatted(text: string, accentColor: string) {
  if (!text) return null
  return text.split('\n').map((line, i) => {
    const t = line.trim()
    if (!t) return <div key={i} style={{ height: 6 }} />
    const h2 = t.match(/^##\s+(.+)/)
    if (h2) return (
      <div key={i} style={{ fontWeight: 800, color: '#f3f4f6', fontSize: 14, marginTop: 16, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 4, height: 16, borderRadius: 2, background: accentColor, flexShrink: 0, display: 'inline-block' }} />
        {renderInline(h2[1])}
      </div>
    )
    const bold = t.match(/^\*\*([^*]+)\*\*:?$/)
    if (bold || (t.endsWith(':') && t.length < 70 && !t.startsWith('•') && !t.startsWith('-') && !t.startsWith('🔴') && !t.startsWith('🟡') && !t.startsWith('🟢'))) {
      const label = bold ? bold[1] : t.replace(/:$/, '')
      return (
        <div key={i} style={{ fontWeight: 700, color: '#e5e7eb', fontSize: 12.5, marginTop: 12, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ width: 3, height: 13, borderRadius: 2, background: accentColor, flexShrink: 0, display: 'inline-block' }} />
          {renderInline(label)}
        </div>
      )
    }
    if (t.startsWith('•') || t.startsWith('-') || t.startsWith('🔴') || t.startsWith('🟡') || t.startsWith('🟢')) {
      const raw = t.replace(/^[•\-]\s*/, '')
      return (
        <div key={i} style={{ display: 'flex', gap: 9, marginBottom: 7, paddingLeft: 2, alignItems: 'flex-start' }}>
          {!t.startsWith('🔴') && !t.startsWith('🟡') && !t.startsWith('🟢') && (
            <span style={{ color: accentColor, flexShrink: 0, fontWeight: 900, fontSize: 14, lineHeight: '22px' }}>•</span>
          )}
          <div style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, fontSize: 12.5, flex: 1 }}>{renderInline(raw)}</div>
        </div>
      )
    }
    return <p key={i} style={{ margin: '0 0 6px', color: 'rgba(255,255,255,0.78)', lineHeight: 1.7, fontSize: 12.5 }}>{renderInline(t)}</p>
  })
}

function renderInline(str: string) {
  return str.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
    p.startsWith('**') && p.endsWith('**')
      ? <strong key={j} style={{ color: '#ffffff', fontWeight: 700 }}>{p.slice(2, -2)}</strong>
      : <span key={j}>{p}</span>
  )
}

export default function ScenarioSimulatorModal({ canvasTitle, nodes, onClose, onApplyInsights }: ScenarioSimulatorModalProps) {
  const [selectedId, setSelectedId] = useState('scale')
  const [customPrompt, setCustomPrompt] = useState('')
  const [simulating, setSimulating] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [copied, setCopied] = useState(false)
  const [step, setStep] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const bodyRef = useRef<HTMLDivElement>(null)
  const typeRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const cleanTitle = (canvasTitle || 'Canvas').replace(/[*#_~]/g, '').trim()
  const selectedScenario = PRESET_SCENARIOS.find(s => s.id === selectedId) || PRESET_SCENARIOS[0]

  useEffect(() => {
    if (!result) return
    const text = result.tabs[activeTab] || ''
    if (typeRef.current) clearInterval(typeRef.current)
    setDisplayedText('')
    let i = 0
    typeRef.current = setInterval(() => {
      i += 5
      setDisplayedText(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(typeRef.current!)
        setDisplayedText(text)
      }
    }, 10)
    return () => { if (typeRef.current) clearInterval(typeRef.current) }
  }, [result, activeTab])

  const runSimulation = async () => {
    setSimulating(true)
    setResult(null)
    setActiveTab('overview')
    setStep(1)
    await new Promise(r => setTimeout(r, 1600))
    const scenario = PRESET_SCENARIOS.find(s => s.id === selectedId)
    const scenarioName = customPrompt.trim() || scenario?.title || 'Scenario'
    const tabs = customPrompt.trim()
      ? buildCustomAnalysis(customPrompt.trim(), cleanTitle, nodes)
      : buildAnalysis(selectedId, cleanTitle, nodes)
    const ratingMatch = tabs.overview.match(/(\d+\.?\d*)\s*\/\s*10/)
    const rating = ratingMatch ? parseFloat(ratingMatch[1]) : 8.8
    setResult({
      scenario: scenarioName,
      color: scenario?.color || '#10b981',
      glow: scenario?.glow || 'rgba(16,185,129,0.3)',
      icon: scenario?.icon || '🔮',
      tag: scenario?.tag || 'ANALYSIS',
      rating, tabs,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    })
    setSimulating(false)
    setTimeout(() => bodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 100)
  }

  const copyReport = () => {
    if (!result) return
    const full = RESULT_TABS.map(t => result.tabs[t.id]).join('\n\n---\n\n')
    navigator.clipboard.writeText(`Scenario: ${result.scenario}\nCanvas: ${cleanTitle}\n\n${full}`).catch(() => {})
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const isDone = result ? displayedText.length >= (result.tabs[activeTab] || '').length : false

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 350, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(18px)', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @keyframes sc-fade { from { opacity:0; transform: translateY(14px) scale(0.97); } to { opacity:1; transform: translateY(0) scale(1); } }
        @keyframes sc-pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @keyframes sc-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes sc-bar { from{width:0%} to{width:100%} }
        @keyframes sc-tab { from{opacity:0;transform:translateX(10px)} to{opacity:1;transform:translateX(0)} }
        @keyframes sc-glow { 0%,100%{opacity:0.6} 50%{opacity:1} }
        .sc-card { transition: all 0.22s cubic-bezier(0.34,1.56,0.64,1); cursor:pointer; }
        .sc-card:hover { transform: translateY(-3px) scale(1.02); }
        .sc-btn { transition: all 0.15s ease; }
        .sc-btn:hover { filter: brightness(1.2); transform: translateY(-1px); }
        .sc-scroll::-webkit-scrollbar { width:5px; }
        .sc-scroll::-webkit-scrollbar-track { background:transparent; }
        .sc-scroll::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:99px; }
        .sc-tab-btn { transition: all 0.15s ease; cursor:pointer; }
        .sc-tab-btn:hover { background: rgba(255,255,255,0.07) !important; }
        .sc-close:hover { background: rgba(239,68,68,0.15) !important; color: #ef4444 !important; }
      `}</style>

      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 880, maxHeight: '92vh', background: 'linear-gradient(145deg, rgba(8,8,20,0.99) 0%, rgba(10,8,26,0.98) 100%)', border: '1px solid rgba(139,92,246,0.22)', borderRadius: 28, display: 'flex', flexDirection: 'column', boxShadow: '0 32px 100px rgba(0,0,0,0.95), 0 0 80px rgba(139,92,246,0.1), inset 0 1px 0 rgba(255,255,255,0.07)', overflow: 'hidden', animation: 'sc-fade 0.28s cubic-bezier(0.34,1.56,0.64,1)' }}>

        {/* HEADER */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'linear-gradient(90deg, rgba(139,92,246,0.13), rgba(6,182,212,0.07), transparent)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: '0 0 28px rgba(139,92,246,0.55), inset 0 1px 0 rgba(255,255,255,0.3)', flexShrink: 0 }}>🔮</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 17, fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>AI Scenario Simulator</span>
                <span style={{ fontSize: 9.5, fontWeight: 800, color: '#a78bfa', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 5, padding: '2px 7px', letterSpacing: '0.08em' }}>PRO</span>
              </div>
              <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.45)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981', animation: 'sc-pulse 2s ease infinite' }} />
                Stress-testing <strong style={{ color: 'rgba(255,255,255,0.72)' }}>{cleanTitle}</strong>
                <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
                <span>{nodes.length} nodes loaded</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {step === 1 && !simulating && (
              <button className="sc-btn" onClick={() => { setStep(0); setResult(null); setCustomPrompt('') }} style={{ padding: '7px 14px', borderRadius: 9, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>← New Simulation</button>
            )}
            <button className="sc-close" onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>✕</button>
          </div>
        </div>

        {/* PROGRESS BAR */}
        {simulating && (
          <div style={{ height: 3, background: 'rgba(255,255,255,0.04)', overflow: 'hidden', flexShrink: 0 }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #06b6d4, #10b981)', animation: 'sc-bar 1.6s cubic-bezier(0.4,0,0.2,1) forwards' }} />
          </div>
        )}

        {/* BODY */}
        <div ref={bodyRef} className="sc-scroll" style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* ── STEP 0: SCENARIO SELECTOR ── */}
          {step === 0 && (
            <div style={{ animation: 'sc-fade 0.2s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 10.5, fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Select Simulation Scenario</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
              </div>

              {/* 3-col grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 22 }}>
                {PRESET_SCENARIOS.map(s => {
                  const isSel = selectedId === s.id && !customPrompt
                  return (
                    <button key={s.id} className="sc-card" onClick={() => { setSelectedId(s.id); setCustomPrompt('') }}
                      style={{ padding: '16px 14px', borderRadius: 18, textAlign: 'left', border: isSel ? `1.5px solid ${s.border}` : '1px solid rgba(255,255,255,0.07)', background: isSel ? `linear-gradient(135deg, ${s.bg}, rgba(255,255,255,0.025))` : 'rgba(255,255,255,0.025)', boxShadow: isSel ? `0 8px 32px ${s.glow}25, inset 0 1px 0 rgba(255,255,255,0.08)` : '0 2px 12px rgba(0,0,0,0.3)', position: 'relative', overflow: 'hidden' }}>
                      {isSel && <div style={{ position: 'absolute', top: 10, right: 10, width: 18, height: 18, borderRadius: '50%', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'white', fontWeight: 900, boxShadow: `0 0 12px ${s.glow}` }}>✓</div>}
                      {isSel && <div style={{ position: 'absolute', top: -25, right: -25, width: 90, height: 90, borderRadius: '50%', background: `radial-gradient(circle, ${s.glow} 0%, transparent 70%)`, pointerEvents: 'none', animation: 'sc-glow 2.5s ease infinite' }} />}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                        <span style={{ fontSize: 20 }}>{s.icon}</span>
                        <span style={{ fontSize: 9, fontWeight: 800, color: s.color, background: s.bg, border: `1px solid ${s.border}`, borderRadius: 5, padding: '2px 6px', letterSpacing: '0.07em' }}>{s.tag}</span>
                      </div>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: isSel ? s.color : 'rgba(255,255,255,0.88)', marginBottom: 3, lineHeight: 1.3 }}>{s.title}</div>
                      <div style={{ fontSize: 10.5, color: isSel ? 'rgba(255,255,255,0.52)' : 'rgba(255,255,255,0.33)', lineHeight: 1.45, marginBottom: 6 }}>{s.subtitle}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', lineHeight: 1.4 }}>{s.desc}</div>
                    </button>
                  )
                })}
              </div>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                <span style={{ fontSize: 10.5, fontWeight: 700, color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>or enter custom what-if scenario</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
              </div>

              {/* Custom input */}
              <div style={{ position: 'relative', marginBottom: 20 }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none', zIndex: 1 }}>💬</span>
                <input type="text" placeholder="e.g. What if a VC-backed competitor raises $50M next quarter?" value={customPrompt}
                  onChange={e => setCustomPrompt(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') runSimulation() }}
                  style={{ width: '100%', padding: '13px 16px 13px 44px', borderRadius: 13, boxSizing: 'border-box', background: customPrompt ? 'rgba(139,92,246,0.07)' : 'rgba(255,255,255,0.03)', border: `1.5px solid ${customPrompt ? 'rgba(139,92,246,0.42)' : 'rgba(255,255,255,0.08)'}`, color: 'white', fontSize: 13, outline: 'none', fontFamily: 'inherit', transition: 'all 0.2s ease', boxShadow: customPrompt ? '0 0 24px rgba(139,92,246,0.12)' : 'none' }} />
              </div>

              {/* Run button */}
              <button onClick={runSimulation} disabled={simulating}
                style={{ width: '100%', padding: '15px 20px', borderRadius: 16, border: 'none', background: simulating ? 'rgba(139,92,246,0.3)' : `linear-gradient(135deg, ${selectedScenario.color}e0, ${selectedScenario.color}90)`, color: 'white', fontSize: 15, fontWeight: 800, cursor: simulating ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: simulating ? 'none' : `0 6px 32px ${selectedScenario.glow}`, transition: 'all 0.2s ease', letterSpacing: '-0.01em' }}
                onMouseEnter={e => { if (!simulating) (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = '' }}>
                {simulating
                  ? <><div style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.2)', borderTopColor: 'white', borderRadius: '50%', animation: 'sc-spin 0.65s linear infinite' }} />Running AI Simulation...</>
                  : <><span style={{ fontSize: 18 }}>{selectedScenario.icon}</span>Run {customPrompt ? 'Custom' : selectedScenario.title} Simulation<span style={{ fontSize: 12, opacity: 0.65, fontWeight: 500 }}>→</span></>}
              </button>

              {/* Context pill bar */}
              <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Canvas Context — {nodes.length} nodes loaded</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {nodes.slice(0, 10).map((n: any, i: number) => (
                    <span key={i} style={{ fontSize: 10.5, padding: '3px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.42)' }}>{n.data?.meta?.icon || '📌'} {String(n.data?.title || '').slice(0, 22)}</span>
                  ))}
                  {nodes.length > 10 && <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.22)', padding: '3px 6px' }}>+{nodes.length - 10} more</span>}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 1: RESULT VIEW ── */}
          {step === 1 && (
            <div style={{ animation: 'sc-fade 0.28s ease' }}>
              {simulating ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 0', gap: 22 }}>
                  <div style={{ width: 76, height: 76, borderRadius: 24, background: `linear-gradient(135deg, ${selectedScenario.color}28, ${selectedScenario.color}0a)`, border: `2px solid ${selectedScenario.color}48`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, animation: 'sc-glow 1.8s ease infinite' }}>{selectedScenario.icon}</div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 6 }}>Running AI Simulation</div>
                    <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.38)' }}>Analyzing "{cleanTitle}" across {nodes.length} canvas nodes...</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {['Modeling impact', 'Analyzing risks', 'Projecting financials', 'Building action plan'].map((label, i) => (
                      <div key={label} style={{ fontSize: 10.5, padding: '4px 11px', borderRadius: 7, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.35)', animation: `sc-pulse 1.6s ${i * 0.3}s ease-in-out infinite` }}>{label}</div>
                    ))}
                  </div>
                </div>
              ) : result && (
                <>
                  {/* Result header */}
                  <div style={{ padding: '18px 20px', borderRadius: 20, marginBottom: 18, background: `linear-gradient(135deg, ${result.color}12, rgba(0,0,0,0))`, border: `1px solid ${result.color}30`, boxShadow: `0 8px 40px ${result.glow}18` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                        <div style={{ width: 46, height: 46, borderRadius: 14, background: `${result.color}20`, border: `1px solid ${result.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{result.icon}</div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                            <span style={{ fontSize: 12.5, fontWeight: 800, color: result.color, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{result.tag}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, color: '#22c55e', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 5, padding: '1px 6px' }}>COMPLETE</span>
                          </div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>{result.scenario}</div>
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', marginTop: 2 }}>{cleanTitle} · {nodes.length} nodes · {result.timestamp}</div>
                        </div>
                      </div>
                      {/* Impact score */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 20px', borderRadius: 16, background: `${result.color}15`, border: `1px solid ${result.color}30` }}>
                        <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>Impact Score</div>
                        <div style={{ fontSize: 28, fontWeight: 900, color: result.color, lineHeight: 1 }}>{result.rating}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.32)', fontWeight: 600 }}>/10</div>
                        <div style={{ width: 62, height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.08)', marginTop: 8, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${result.rating * 10}%`, background: result.color, borderRadius: 4, transition: 'width 1s ease' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tab navigation */}
                  <div style={{ display: 'flex', gap: 5, marginBottom: 16, padding: '5px', borderRadius: 15, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {RESULT_TABS.map(tab => (
                      <button key={tab.id} className="sc-tab-btn" onClick={() => setActiveTab(tab.id)}
                        style={{ flex: 1, padding: '9px 6px', borderRadius: 11, border: 'none', background: activeTab === tab.id ? `linear-gradient(135deg, ${result.color}28, ${result.color}10)` : 'transparent', color: activeTab === tab.id ? result.color : 'rgba(255,255,255,0.38)', fontSize: 11.5, fontWeight: activeTab === tab.id ? 700 : 500, borderBottom: activeTab === tab.id ? `2px solid ${result.color}` : '2px solid transparent', transition: 'all 0.15s ease', whiteSpace: 'nowrap' }}>
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab content with typewriter */}
                  <div key={activeTab} style={{ padding: '20px 22px', borderRadius: 18, background: 'rgba(255,255,255,0.022)', border: '1px solid rgba(255,255,255,0.07)', minHeight: 220, animation: 'sc-tab 0.22s ease' }}>
                    {renderFormatted(displayedText, result.color)}
                    {!isDone && <span style={{ display: 'inline-block', width: 2, height: 14, background: result.color, marginLeft: 2, animation: 'sc-pulse 0.75s ease infinite', verticalAlign: 'middle' }} />}
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                    <button className="sc-btn" onClick={() => onApplyInsights([{ title: `Scenario: ${result.scenario}`, content: result.tabs.overview, type: 'insight' }])}
                      style={{ flex: 1, minWidth: 160, padding: '11px 16px', borderRadius: 12, border: 'none', background: `linear-gradient(135deg, ${result.color}d0, ${result.color}88)`, color: 'white', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, boxShadow: `0 4px 22px ${result.glow}42` }}>
                      + Add Overview to Canvas
                    </button>
                    <button className="sc-btn" onClick={copyReport}
                      style={{ padding: '11px 16px', borderRadius: 12, background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)', border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}`, color: copied ? '#86efac' : 'rgba(255,255,255,0.7)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
                      {copied ? '✓ Copied' : '⎘ Copy Full Report'}
                    </button>
                    <button className="sc-btn" onClick={() => RESULT_TABS.forEach(t => onApplyInsights([{ title: `${result.scenario} — ${t.short}`, content: result.tabs[t.id], type: 'insight' }]))}
                      style={{ padding: '11px 16px', borderRadius: 12, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', color: '#a78bfa', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
                      📌 Add All 4 Tabs
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
