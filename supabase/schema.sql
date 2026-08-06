-- ============================================================
-- MindCanvas — Complete Supabase PostgreSQL Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ── Users ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free','pro','team','enterprise')),
  settings JSONB DEFAULT '{}',
  onboarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Service role full access to users" ON public.users USING (true) WITH CHECK (true);

-- ── Organizations ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  settings JSONB DEFAULT '{}',
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- ── Workspaces ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  settings JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

-- ── Collaborators ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner','admin','editor','viewer')),
  invited_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

ALTER TABLE public.collaborators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Collaborators visible to workspace members" ON public.collaborators FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.collaborators c WHERE c.workspace_id = collaborators.workspace_id AND c.user_id = auth.uid())
);
CREATE POLICY "Service role full access to collaborators" ON public.collaborators USING (true) WITH CHECK (true);

-- ── Canvases ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.canvases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Canvas',
  description TEXT,
  created_by UUID NOT NULL REFERENCES public.users(id),
  thumbnail_url TEXT,
  settings JSONB DEFAULT '{"background":"#080810","grid":true}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active','archived','deleted')),
  node_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.canvases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Canvas visible to workspace collaborators" ON public.canvases FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.collaborators c WHERE c.workspace_id = canvases.workspace_id AND c.user_id = auth.uid())
);
CREATE POLICY "Service role full access to canvases" ON public.canvases USING (true) WITH CHECK (true);

CREATE INDEX idx_canvases_workspace ON public.canvases(workspace_id);
CREATE INDEX idx_canvases_updated ON public.canvases(updated_at DESC);

-- ── Nodes ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  canvas_id UUID NOT NULL REFERENCES public.canvases(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'idea',
  title TEXT NOT NULL,
  content TEXT,
  position_x FLOAT DEFAULT 0,
  position_y FLOAT DEFAULT 0,
  width FLOAT DEFAULT 360,
  height FLOAT DEFAULT 240,
  metadata JSONB DEFAULT '{}',
  style JSONB DEFAULT '{}',
  created_by UUID REFERENCES public.users(id),
  parent_node_id UUID REFERENCES public.nodes(id) ON DELETE SET NULL,
  is_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Nodes visible via canvas access" ON public.nodes FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.canvases ca
    JOIN public.collaborators co ON co.workspace_id = ca.workspace_id
    WHERE ca.id = nodes.canvas_id AND co.user_id = auth.uid()
  )
);
CREATE POLICY "Service role full access to nodes" ON public.nodes USING (true) WITH CHECK (true);

CREATE INDEX idx_nodes_canvas ON public.nodes(canvas_id);
CREATE INDEX idx_nodes_type ON public.nodes(type);

-- ── Node Versions ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.node_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  node_id UUID NOT NULL REFERENCES public.nodes(id) ON DELETE CASCADE,
  content TEXT,
  action TEXT DEFAULT 'updated',
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.node_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access to node_versions" ON public.node_versions USING (true) WITH CHECK (true);

CREATE INDEX idx_node_versions_node ON public.node_versions(node_id);

-- ── Connections ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  canvas_id UUID NOT NULL REFERENCES public.canvases(id) ON DELETE CASCADE,
  source_node_id UUID NOT NULL REFERENCES public.nodes(id) ON DELETE CASCADE,
  target_node_id UUID NOT NULL REFERENCES public.nodes(id) ON DELETE CASCADE,
  label TEXT,
  type TEXT DEFAULT 'default',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(canvas_id, source_node_id, target_node_id)
);

ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access to connections" ON public.connections USING (true) WITH CHECK (true);

CREATE INDEX idx_connections_canvas ON public.connections(canvas_id);

-- ── AI Jobs ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  canvas_id UUID REFERENCES public.canvases(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
  input JSONB DEFAULT '{}',
  output JSONB,
  error TEXT,
  provider TEXT,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ai_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access to ai_jobs" ON public.ai_jobs USING (true) WITH CHECK (true);

CREATE INDEX idx_ai_jobs_user ON public.ai_jobs(user_id);
CREATE INDEX idx_ai_jobs_status ON public.ai_jobs(status);

-- ── Activity Logs ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  canvas_id UUID REFERENCES public.canvases(id) ON DELETE SET NULL,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access to activity_logs" ON public.activity_logs USING (true) WITH CHECK (true);

CREATE INDEX idx_activity_logs_user ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_canvas ON public.activity_logs(canvas_id);

-- ── Exports ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  canvas_id UUID NOT NULL REFERENCES public.canvases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  format TEXT NOT NULL CHECK (format IN ('pdf','png','pptx','markdown','json')),
  storage_url TEXT,
  file_size INTEGER,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.exports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access to exports" ON public.exports USING (true) WITH CHECK (true);

-- ── Comments ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  node_id UUID NOT NULL REFERENCES public.nodes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access to comments" ON public.comments USING (true) WITH CHECK (true);

-- ── Notifications ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  metadata JSONB DEFAULT '{}',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role full access to notifications" ON public.notifications USING (true) WITH CHECK (true);

-- ── Auto-update updated_at trigger ───────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['users','workspaces','canvases','nodes','ai_jobs','comments'] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%s_updated ON public.%s', t, t);
    EXECUTE format('CREATE TRIGGER trg_%s_updated BEFORE UPDATE ON public.%s FOR EACH ROW EXECUTE FUNCTION update_updated_at()', t, t);
  END LOOP;
END $$;

-- ── Full-text search index ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_nodes_fts ON public.nodes USING gin(to_tsvector('english', coalesce(title,'') || ' ' || coalesce(content,'')));
CREATE INDEX IF NOT EXISTS idx_canvases_fts ON public.canvases USING gin(to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,'')));

-- Done! ✅
SELECT 'MindCanvas schema created successfully' AS status;
