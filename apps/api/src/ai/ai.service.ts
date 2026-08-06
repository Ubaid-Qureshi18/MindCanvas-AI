import { Injectable, Logger } from '@nestjs/common';
import { OpenAiService } from './providers/openai.service';
import { GeminiService } from './providers/gemini.service';
import { SupabaseService } from '../supabase/supabase.service';
import { GenerateCanvasDto } from './dto/generate-canvas.dto';
import { v4 as uuidv4 } from 'uuid';

export interface CanvasGenerationResult {
  canvas_title: string;
  nodes: GeneratedNode[];
  connections: GeneratedConnection[];
}

export interface GeneratedNode {
  id: string;
  type: string;
  title: string;
  content: string;
  position: { x: number; y: number };
  width: number;
  height: number;
  metadata: Record<string, any>;
}

export interface GeneratedConnection {
  source: string;
  target: string;
  label?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CANVAS GENERATION — Ultra-detailed system prompt
// ─────────────────────────────────────────────────────────────────────────────
const CANVAS_SYSTEM_PROMPT = `You are BuildBeyond AI — the world's most precise startup and product strategist.
Your job is to transform a user's idea into a razor-sharp, 100% actionable strategic canvas.

CRITICAL QUALITY RULES — violating any of these = failure:
1. Every node must be SPECIFIC to the actual idea — never generic filler or templates.
2. Use REAL numbers: market sizes in $ figures, pricing in actual dollars, timelines in concrete weeks/months.
3. Name REAL tools, companies, frameworks: not "a popular framework" but "Next.js 15", not "a payment processor" but "Stripe".
4. Every sentence must be immediately useful — a founder reading it should be able to act on it TODAY.
5. NEVER write sentences like "Define your X" or "Consider Y" — actually DEFINE it and CONSIDER it FOR THEM based on their specific idea.
6. Minimum 120 words per node content. Dense with facts, numbers, and named specifics.
7. Plain text only — absolutely NO markdown symbols like ** or ## or -- in the content field.

Content quality bar per node type:
- idea: Crisp description of what the product does, who it's for, and the single most powerful value proposition
- problem: Specific user pain with estimated annual cost/time lost, who has it (job title, company type), why current solutions fail
- solution: The unique mechanism, the "aha moment" (when does new user feel value — within how many minutes?), 10x advantage vs 3 named competitors
- target_users: Named personas with job titles, company sizes, buying authority, annual tooling budget, top 3 frustrations verbatim
- market_research: TAM/SAM/SOM in dollar figures, CAGR %, top 3 growth drivers with evidence, best source to cite
- competitor: Name 5+ real competitors, their pricing, G2 rating, biggest weakness, and exact reason to choose you over each
- business_model: Exact pricing tiers with dollar amounts, projected MRR at Month 3/6/12/24, CAC target, LTV, payback period
- tech_stack: Specific versions of every tool justified, monthly infra cost at 1K/10K/100K users, build vs buy decisions
- roadmap: Week-by-week milestones for first 90 days with specific success metrics per week, then quarterly for year 1
- marketing: Named channels with estimated CAC per channel, exact launch sequence, 3 growth tactics specific to this exact idea
- revenue: Specific pricing per tier, revenue projections Month 1/3/6/12/24, break-even point, expansion revenue strategy
- risks: 5 specific risks with probability %, impact score 1-10, and a concrete mitigation action with an owner and deadline
- swot: 4 strengths, 4 weaknesses, 4 opportunities, 4 threats — each with a specific, factual justification

Respond ONLY with valid JSON matching this EXACT schema (no markdown, no backticks, no explanation outside the JSON):
{
  "canvas_title": "Concise 4-8 word title for the idea",
  "nodes": [
    {
      "id": "node_1",
      "type": "idea",
      "title": "Specific descriptive title (not generic)",
      "content": "120+ word plain text content. No markdown symbols. Specific to THIS idea.",
      "position": { "x": 450, "y": 220 },
      "width": 380,
      "height": 240,
      "metadata": {}
    }
  ],
  "connections": [
    { "source": "node_1", "target": "node_2", "label": "relationship verb" }
  ]
}

EXACT layout positions to use:
node_1 (idea): x:450, y:220
node_2 (problem): x:80, y:80
node_3 (solution): x:860, y:80
node_4 (target_users): x:80, y:380
node_5 (business_model): x:860, y:380
node_6 (market_research): x:450, y:80
node_7 (competitor): x:450, y:560
node_8 (tech_stack): x:80, y:640
node_9 (roadmap): x:860, y:640
node_10 (marketing): x:80, y:940
node_11 (revenue): x:860, y:940
node_12 (risks): x:450, y:940
node_13 (swot): x:450, y:1220
node_14 (tasks): x:80, y:1220
node_15 (insight): x:860, y:1220

Generate exactly 15 nodes. ALL connections must use valid node IDs. Minimum 12 connections.`;


@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private openai: OpenAiService,
    private gemini: GeminiService,
    private supabase: SupabaseService,
  ) {}

  async generateCanvas(userId: string, dto: GenerateCanvasDto): Promise<CanvasGenerationResult> {
    const jobId = uuidv4();

    // Log AI job — completely non-critical, never let it crash generateCanvas
    this.logJob(jobId, userId, dto.canvasId, dto.prompt).catch(() => {});

    try {
      let result: CanvasGenerationResult;


      const userPrompt = `Generate a comprehensive, highly specific BuildBeyond canvas for this idea:

"${dto.prompt}"

${dto.context ? `Additional context from the user: ${dto.context}\n\n` : ''}IMPORTANT: Every single node must be specific to THIS exact idea. Use real competitor names, real pricing benchmarks for this market, real tools used in this space, and real numbers. Do NOT use generic placeholders. A founder reading any node should immediately recognize it was written specifically for "${dto.prompt}" — not for any other startup.`;

      if (this.openai.isAvailable) {
        result = await this.openai.generateJSON<CanvasGenerationResult>(CANVAS_SYSTEM_PROMPT, userPrompt);
      } else if (this.gemini.isAvailable) {
        result = await this.gemini.generateJSON<CanvasGenerationResult>(CANVAS_SYSTEM_PROMPT, userPrompt);
      } else {
        result = this.getDemoCanvas(dto.prompt);
      }

      // Validate result shape
      if (!result || !Array.isArray(result.nodes)) {
        this.logger.warn('AI returned invalid structure, using demo canvas');
        result = this.getDemoCanvas(dto.prompt);
      }

      // Assign real UUIDs and build id map
      const idMap: Record<string, string> = {};
      result.nodes = result.nodes.map((node) => {
        const newId = uuidv4();
        idMap[node.id || uuidv4()] = newId;
        return { ...node, id: newId };
      });

      // Remap connections
      result.connections = (result.connections || [])
        .map((conn) => ({
          source: idMap[conn.source] || conn.source,
          target: idMap[conn.target] || conn.target,
          label: conn.label,
        }))
        .filter((c) => c.source && c.target && c.source !== c.target);

      this.updateJobStatus(jobId, 'completed').catch(() => {});
      return result;
    } catch (error: any) {
      this.logger.error('generateCanvas failed, returning demo canvas', error.message);
      this.updateJobStatus(jobId, 'failed').catch(() => {});
      // Instead of crashing — return demo canvas so UI still works
      return this.getDemoCanvas(dto.prompt);
    }
  }

  async regenerateNode(node: any): Promise<{ content: string }> {
    const prompt = `You are a world-class startup advisor. Improve this canvas node to be dramatically more specific and valuable.

Node type: ${node.type}
Title: ${node.title}
Current content: ${String(node.content || '').slice(0, 800)}

Rewrite requirements:
- Keep the same topic but make every sentence 3x more specific
- Replace any vague claims with real numbers, named tools, specific actions
- If it mentions a market: give a dollar figure. If it mentions competitors: name them. If it mentions pricing: give exact numbers.
- Write in clear plain text — NO markdown symbols like ** or ## at all
- Minimum 130 words, maximum 220 words
- Every sentence must be actionable or data-backed — no filler phrases like "it is important to" or "you should consider"

Return ONLY valid JSON: { "content": "improved content here" }`;

    const systemMsg = 'You are a precision startup strategist. Rewrite this canvas node with maximum specificity. Every claim needs a number or a name. Return only valid JSON with a single "content" field.';

    try {
      if (this.openai.isAvailable) {
        return this.openai.generateJSON<{ content: string }>(systemMsg, prompt);
      }
      if (this.gemini.isAvailable) {
        return this.gemini.generateJSON<{ content: string }>(systemMsg, prompt);
      }
    } catch (e: any) {
      this.logger.error('regenerateNode failed', e.message);
    }
    return { content: node.content || '' };
  }

  async expandNode(node: any): Promise<{ children: GeneratedNode[] }> {
    const prompt = `Break down this strategic canvas node into 4 highly specific, distinct sub-components.

Parent node:
Type: ${node.type}
Title: ${node.title}
Content: ${String(node.content || '').slice(0, 600)}

Generate 4 child nodes. Each must:
- Cover a DIFFERENT, non-overlapping sub-aspect of the parent topic
- Be immediately actionable with real specifics — numbers, named tools, timelines
- Contain minimum 90 words of dense, useful content
- Use plain text only (no ** or ## symbols)
- Have a type from: idea, problem, solution, target_users, market_research, competitor, business_model, revenue, tech_stack, architecture, marketing, budget, roadmap, risks, swot, tasks, research, insight

Return ONLY valid JSON:
{
  "children": [
    { "id": "child_1", "type": "insight", "title": "Specific focused title", "content": "90+ word dense content here", "position": {"x":0,"y":0}, "width": 360, "height": 240, "metadata": {} }
  ]
}`;

    const systemMsg = 'You are a precision business analyst. Break this node into 4 distinct, highly specific sub-components. Each must contain real numbers and named tools. Return only valid JSON with a "children" array.';

    try {
      if (this.openai.isAvailable) {
        return this.openai.generateJSON<{ children: GeneratedNode[] }>(systemMsg, prompt);
      }
      if (this.gemini.isAvailable) {
        return this.gemini.generateJSON<{ children: GeneratedNode[] }>(systemMsg, prompt);
      }
    } catch (e: any) {
      this.logger.error('expandNode failed', e.message);
    }
    return { children: [] };
  }

  async improveNode(node: any): Promise<{ content: string }> {
    return this.regenerateNode(node);
  }

  async simplifyNode(node: any): Promise<{ content: string }> {
    const prompt = `Distill this canvas node into a crisp 60-80 word executive summary.
Keep only: the single most important insight, the most critical number, and the top immediate action.
Strip everything else. Plain text only — no markdown symbols.

Title: ${node.title}
Content: ${String(node.content || '').slice(0, 800)}

Return ONLY valid JSON: { "content": "60-80 word executive summary" }`;

    const systemMsg = 'You are an expert at distilling strategy to its essence. Create a crisp 60-80 word executive summary. Return only valid JSON with a "content" field.';

    try {
      if (this.openai.isAvailable) {
        return this.openai.generateJSON<{ content: string }>(systemMsg, prompt);
      }
      if (this.gemini.isAvailable) {
        return this.gemini.generateJSON<{ content: string }>(systemMsg, prompt);
      }
    } catch (e: any) {
      this.logger.error('simplifyNode failed', e.message);
    }
    return { content: node.content || '' };
  }

  async generateTasks(node: any): Promise<Array<{ title: string; description: string; priority: string; effort: string }>> {
    const prompt = `Generate 6 concrete, immediately executable tasks for this canvas node.
Each task must be something a founder can literally start this week — not vague goals.

Node: ${node.title} (type: ${node.type})
Context: ${String(node.content || '').slice(0, 600)}

Task generation rules:
- Title must start with an action verb: Research, Build, Write, Call, Set up, Launch, Test, Measure, Contact, Deploy...
- Description: exactly what to do, how to do it, and what "done" looks like (specific outcome)
- Priority: high = blocks everything else or creates revenue, medium = important but not blocking, low = optimization
- Effort: 1d=8hrs focused work, 3d=3 full working days, 1w=5 days, 2w=10 days
- Make them specific to THIS node's content — not generic startup tasks

Return ONLY valid JSON:
{
  "tasks": [
    { "title": "Verb + specific action", "description": "Exactly what to do and what done looks like", "priority": "high|medium|low", "effort": "1d|3d|1w|2w" }
  ]
}`;

    const systemMsg = 'Generate 6 concrete, immediately executable tasks. Make them specific to the node content. Return only valid JSON with a "tasks" array.';

    try {
      const src = this.openai.isAvailable ? this.openai : this.gemini.isAvailable ? this.gemini : null;
      if (src) {
        const result = await src.generateJSON<{ tasks: any[] }>(systemMsg, prompt);
        return result?.tasks || [];
      }
    } catch (e: any) {
      this.logger.error('generateTasks failed', e.message);
    }
    return [];
  }

  async chat(message: string, context: string): Promise<string> {
    const systemPrompt = `You are BuildBeyond AI — a seasoned startup advisor and product strategist. You have deep expertise across SaaS, fintech, marketplaces, consumer apps, and deep tech.

You have full context of the user's startup canvas:
${context.slice(0, 2000)}

Response style and rules:
- Be direct and specific — give real answers with numbers and names, not frameworks to "consider"
- Use concrete specifics: named competitors, specific tools, realistic timelines, dollar figures
- If asked about risks: give probability estimates (e.g., "40% chance") and concrete mitigation steps with owners
- If asked about marketing: give channel-specific CAC estimates and exact tactics for THIS startup
- If asked about fundraising: give realistic valuation ranges, check sizes, and specific investor names for this stage/market
- If asked about tech: give specific architecture decisions with clear trade-offs, not generic advice
- Format: short paragraphs or numbered steps — NO walls of text, no generic startup advice
- Max 280 words per response — dense and actionable
- End every response with: "Next step: [1 specific thing the founder should do TODAY]"`;  

    try {
      if (this.openai.isAvailable) return this.openai.generateText(systemPrompt, message);
      if (this.gemini.isAvailable) return this.gemini.generateText(systemPrompt, message);
    } catch (e: any) {
      this.logger.error('chat failed', e.message);
    }
    return 'AI is not configured. Please add OPENAI_API_KEY or GEMINI_API_KEY to your apps/api/.env file to enable AI features.';
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  private async logJob(jobId: string, userId: string, canvasId: string | undefined, prompt: string) {
    if (!this.supabase.isConfigured) return;
    await this.supabase.admin.from('ai_jobs').insert({
      id: jobId,
      user_id: userId,
      canvas_id: canvasId || null,
      type: 'generate_canvas',
      status: 'processing',
      input: { prompt },
    });
  }

  private async updateJobStatus(jobId: string, status: string) {
    if (!this.supabase.isConfigured) return;
    await this.supabase.admin.from('ai_jobs').update({ status }).eq('id', jobId);
  }


  getDemoCanvas(prompt: string): CanvasGenerationResult {
    const p = (prompt || 'Startup Idea').trim();
    const title = p.length > 55 ? p.slice(0, 55) + '...' : p;
    const lower = p.toLowerCase();

    // Detect domain
    const isLegal = lower.includes('legal') || lower.includes('contract') || lower.includes('law');
    const isFood = lower.includes('food') || lower.includes('meal') || lower.includes('pet') || lower.includes('restaurant');
    const isFinance = lower.includes('finance') || lower.includes('accounting') || lower.includes('tax') || lower.includes('money') || lower.includes('bank');
    const isAI = lower.includes('ai') || lower.includes('gpt') || lower.includes('copilot') || lower.includes('llm') || lower.includes('agent');

    const problemText = isLegal
      ? `Small business founders and agency owners lose an estimated $14,000 per year in legal consultation fees or unknowingly sign unfavorable contracts with hidden liability clauses, auto-renewals, and non-competes. 68% of SMBs sign vendor contracts without professional legal review due to high hourly billing rates ($350-$600/hr).`
      : isFood
      ? `Consumers and pet owners waste over 8 hours per month sourcing specialized nutrition and waste $600/yr on ill-fitting subscription food plans. Independent suppliers lack direct-to-consumer digital channels to retain high-LTV customers.`
      : isFinance
      ? `SMB owners and freelancers waste 10+ hours per month manually categorizing receipts, tracking overdue invoices, and calculating tax liabilities, leading to an average of $3,800 in missed tax deductions annually.`
      : `Target users lose 6-10 hours per week relying on manual, fragmented tools to execute "${p}". Existing solutions are bloated, expensive ($300+/mo), and fail to automate core repetitive tasks for mid-market users.`;

    const solutionText = isLegal
      ? `BuildBeyond Legal Review Engine: An AI-powered contract analysis platform that parses PDF/Word agreements in under 30 seconds. Automatically flags 15+ risk categories (indemnification, termination fees, IP transfer), highlights red flags in red, and generates one-click lawyer-approved redline suggestions.`
      : isFood
      ? `Direct AI Personalization Engine for "${p}": Delivers custom nutrition profiles, automated recurring delivery schedules, and zero-friction mobile order management with 2-day doorstep fulfillment.`
      : isFinance
      ? `Automated Financial Copilot: Real-time transaction reconciliation, automated invoice reminders via WhatsApp/Email, and instant tax-deduction discovery using OCR receipt scanning.`
      : `A streamlined 10x solution for "${p}": Combines real-time intelligence, automated workflow triggers, and intuitive UI to reduce task execution time from hours to under 3 minutes.`;

    const targetUsersText = isLegal
      ? `Primary ICP: In-house legal counsels, marketing agency founders (10-50 employees), real estate brokerages, and freelance procurement managers who review 5+ contracts per week and have an annual software budget of $5,000-$20,000.`
      : `Primary ICP: Tech-savvy urban professionals aged 25-45 with high disposable income who value time savings and premium quality for "${p}".`;

    const competitorsText = isLegal
      ? `Direct Competitors: (1) Ironclad ($15,000+/yr — complex enterprise focus), (2) Lexion ($8,000/yr), (3) Robin AI ($5,000/yr), (4) Manual Law Firms ($400/hr). Positioning: We provide instant SMB contract auditing at $79/mo with zero setup time.`
      : isFinance
      ? `Direct Competitors: (1) QuickBooks ($30-90/mo — complex UI), (2) Xero ($35/mo), (3) FreshBooks ($19-55/mo), (4) Excel Spreadsheets. Positioning: 100% automated AI reconciliation with zero manual data entry.`
      : `Key Competitors in this space: (1) Legacy Enterprise Tool ($200+/mo), (2) Niche SaaS Player ($49/mo), (3) DIY Spreadsheets / Manual Process. Positioning: 10x faster execution powered by AI workflows for "${p}".`;

    const businessModelText = `Tier 1 Starter: $29/mo (up to 15 credits/mo, basic export).\nTier 2 Pro: $89/mo (100 credits/mo, team collaboration, advanced AI analysis, priority support).\nTier 3 Enterprise: $299-799/mo (custom API access, SSO, dedicated account manager).\nUnit Economics Target: LTV of $2,136 assuming 24-month retention. CAC target < $450 with a 6-month payback period.`;

    const techStackText = isAI || isLegal
      ? `Frontend: Next.js 15 App Router, React 19, TypeScript, TailwindCSS.\nBackend: NestJS, PostgreSQL (Supabase), Redis for queue management.\nAI Pipeline: OpenAI GPT-4o / Gemini 2.0 Flash + LangChain for document chunking + PDF.js OCR parsing.\nInfrastructure: Vercel (web), Railway (API), Supabase (database & auth).`
      : `Frontend: Next.js 15, React 19, TypeScript.\nBackend: NestJS Node.js API + Supabase PostgreSQL.\nInfrastructure: Vercel, Railway, Supabase Auth & Storage.`;

    const roadmapText = `Month 1 (Days 1-30): MVP Launch — Core workflow for "${p}", basic auth, payment integration via Stripe, 20 beta users.\nMonth 2 (Days 31-60): Product Refinement — Add team seats, export functionality, closed user group feedback loops.\nMonth 3 (Days 61-90): Monetization & Growth — Public ProductHunt launch, SEO content push, reach $5,000 MRR with 60 paying users.`;

    const marketingText = `Channel 1 — Founder-Led Content: Weekly teardowns and case studies on LinkedIn & Twitter/X for "${p}".\nChannel 2 — Niche Community Seeding: Direct outreach in targeted Reddit, Slack, and Discord founder communities.\nChannel 3 — Cold Email Outbound: Targeted campaigns to 500 verified ICP leads per month.\nChannel 4 — SEO & Organic Landing Pages: Target high-intent commercial keywords.`;

    const revenueText = `Month 1: $580 MRR (20 Starter users).\nMonth 3: $3,560 MRR (40 Pro users + 10 Starter users).\nMonth 6: $14,200 MRR (120 Pro users + 15 Enterprise users).\nMonth 12: $48,000 MRR (450 Pro users + 30 Enterprise users).\nBreak-Even Target: Month 5 at $9,500 MRR covering infra and co-founder stipends.`;

    const risksText = `1. Customer Acquisition Friction (Probability: 40%, Impact: 8/10) -> Mitigation: Offer 14-day free trial with 3 free audits.\n2. AI Accuracy / Hallucination (Probability: 25%, Impact: 9/10) -> Mitigation: Human-in-the-loop verification option + strict RAG context boundary.\n3. Large Incumbent Copycats (Probability: 30%, Impact: 6/10) -> Mitigation: Rapid product velocity & specialized vertical workflow integration.`;

    return {
      canvas_title: title,
      nodes: [
        { id: 'n1', type: 'idea', title: '💡 Core Concept', content: `Project Idea: ${p}\n\nStrategic Vision: A state-of-the-art platform designed to transform "${p}" into a high-growth scalable product. Focuses on frictionless onboarding, automated core workflows, and clear monetization paths.`, position: { x: 450, y: 220 }, width: 440, height: 240, metadata: {} },
        { id: 'n2', type: 'problem', title: '🎯 Problem Statement', content: problemText, position: { x: 80, y: 80 }, width: 380, height: 260, metadata: {} },
        { id: 'n3', type: 'solution', title: '✨ Unique Solution', content: solutionText, position: { x: 860, y: 80 }, width: 380, height: 280, metadata: {} },
        { id: 'n4', type: 'target_users', title: '👥 Target Users (ICP)', content: targetUsersText, position: { x: 80, y: 380 }, width: 380, height: 280, metadata: {} },
        { id: 'n5', type: 'business_model', title: '💼 Business Model', content: businessModelText, position: { x: 860, y: 380 }, width: 380, height: 300, metadata: {} },
        { id: 'n6', type: 'market_research', title: '📈 Market Opportunity', content: `Market Sizing for "${p}":\n• TAM: $8.4B Global Market\n• SAM: $1.2B Serviceable Addressable Segment\n• SOM: $15M Realistic Year 2 Capture\n\nGrowth Drivers: 22% CAGR driven by rapid digital transformation, AI automation adoption, and rising operational cost pressures.`, position: { x: 450, y: 80 }, width: 380, height: 280, metadata: {} },
        { id: 'n7', type: 'competitor', title: '⚔️ Competitive Landscape', content: competitorsText, position: { x: 450, y: 560 }, width: 380, height: 300, metadata: {} },
        { id: 'n8', type: 'tech_stack', title: '🛠 Technical Architecture', content: techStackText, position: { x: 80, y: 640 }, width: 380, height: 300, metadata: {} },
        { id: 'n9', type: 'roadmap', title: '🗺 90-Day Execution Roadmap', content: roadmapText, position: { x: 860, y: 640 }, width: 380, height: 320, metadata: {} },
        { id: 'n10', type: 'marketing', title: '📣 Go-To-Market Strategy', content: marketingText, position: { x: 80, y: 940 }, width: 380, height: 320, metadata: {} },
        { id: 'n11', type: 'revenue', title: '💰 Revenue Projections', content: revenueText, position: { x: 860, y: 940 }, width: 380, height: 320, metadata: {} },
        { id: 'n12', type: 'risks', title: '⚠️ Key Risks & Mitigations', content: risksText, position: { x: 450, y: 940 }, width: 380, height: 340, metadata: {} },
      ],
      connections: [
        { source: 'n1', target: 'n2', label: 'solves' },
        { source: 'n1', target: 'n3', label: 'via' },
        { source: 'n1', target: 'n6', label: 'validated by' },
        { source: 'n2', target: 'n3', label: 'solved by' },
        { source: 'n3', target: 'n8', label: 'built on' },
        { source: 'n3', target: 'n5', label: 'monetized via' },
        { source: 'n4', target: 'n10', label: 'reached by' },
        { source: 'n5', target: 'n11', label: 'projects to' },
        { source: 'n6', target: 'n7', label: 'reveals' },
        { source: 'n7', target: 'n3', label: 'differentiates' },
        { source: 'n8', target: 'n9', label: 'enables' },
        { source: 'n9', target: 'n12', label: 'must avoid' },
        { source: 'n10', target: 'n11', label: 'drives' },
        { source: 'n1', target: 'n4', label: 'serves' },
      ],
    };
  }
}
