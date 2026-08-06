import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateCanvasDto } from './dto/create-canvas.dto';
import { UpdateCanvasDto } from './dto/update-canvas.dto';
import { v4 as uuidv4 } from 'uuid';

const devCanvasStore = new Map<string, any>();

@Injectable()
export class CanvasesService {
  private readonly logger = new Logger(CanvasesService.name);

  constructor(private supabase: SupabaseService) {}

  async findByWorkspace(workspaceId: string, userId: string) {
    if (this.supabase.isConfigured) {
      try {
        const { data } = await this.supabase.admin
          .from('canvases')
          .select('id, title, description, created_by, status, node_count, created_at, updated_at, thumbnail_url')
          .eq('workspace_id', workspaceId)
          .neq('status', 'deleted')
          .order('updated_at', { ascending: false });

        if (data) return data;
      } catch (e: any) {
        this.logger.warn(`Supabase findByWorkspace fallback: ${e.message}`);
      }
    }

    // Dev store fallback
    return Array.from(devCanvasStore.values()).filter(
      (c) => c.workspace_id === workspaceId && c.status !== 'deleted',
    );
  }

  async create(workspaceId: string, userId: string, dto: CreateCanvasDto) {
    const canvasId = uuidv4();
    const newCanvas = {
      id: canvasId,
      workspace_id: workspaceId,
      title: dto.title || 'Untitled Canvas',
      description: dto.description || '',
      created_by: userId,
      thumbnail_url: null,
      settings: dto.settings || { background: '#080810', grid: true },
      status: 'active',
      node_count: 0,
      nodes: [],
      connections: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (this.supabase.isConfigured) {
      try {
        const { data } = await this.supabase.admin
          .from('canvases')
          .insert({
            id: canvasId,
            workspace_id: workspaceId,
            title: dto.title || 'Untitled Canvas',
            description: dto.description,
            created_by: userId,
            thumbnail_url: null,
            settings: dto.settings || { background: '#080810', grid: true },
            status: 'active',
            node_count: 0,
          })
          .select()
          .single();

        if (data) {
          devCanvasStore.set(data.id, { ...data, nodes: [], connections: [] });
          return data;
        }
      } catch (e: any) {
        this.logger.warn(`Supabase create canvas fallback: ${e.message}`);
      }
    }

    devCanvasStore.set(canvasId, newCanvas);
    return newCanvas;
  }

  async findOne(canvasId: string, userId: string) {
    if (this.supabase.isConfigured) {
      try {
        const { data } = await this.supabase.admin
          .from('canvases')
          .select(`
            id, title, description, created_by, status, node_count, created_at, updated_at, settings, workspace_id,
            nodes(*),
            connections(*)
          `)
          .eq('id', canvasId)
          .maybeSingle();

        if (data) return data;
      } catch (e: any) {
        this.logger.warn(`Supabase findOne canvas fallback: ${e.message}`);
      }
    }

    const devCanvas = devCanvasStore.get(canvasId);
    if (devCanvas) return devCanvas;

    // Return auto-generated fallback canvas if requested ID not found in dev store
    const fallbackCanvas = {
      id: canvasId,
      workspace_id: 'default',
      title: 'Canvas',
      description: 'MindCanvas Workspace',
      created_by: userId,
      settings: { background: '#080810', grid: true },
      status: 'active',
      node_count: 0,
      nodes: [],
      connections: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    devCanvasStore.set(canvasId, fallbackCanvas);
    return fallbackCanvas;
  }

  async update(canvasId: string, userId: string, dto: UpdateCanvasDto) {
    const canvas = await this.findOne(canvasId, userId);
    const updated = { ...canvas, ...dto, updated_at: new Date().toISOString() };

    if (this.supabase.isConfigured) {
      try {
        await this.supabase.admin
          .from('canvases')
          .update({ ...dto, updated_at: new Date().toISOString() })
          .eq('id', canvasId);
      } catch {}
    }

    devCanvasStore.set(canvasId, updated);
    return updated;
  }

  async remove(canvasId: string, userId: string) {
    if (this.supabase.isConfigured) {
      try {
        await this.supabase.admin.from('canvases').delete().eq('id', canvasId);
      } catch {}
    }

    devCanvasStore.delete(canvasId);
    return { message: 'Canvas deleted' };
  }
}
