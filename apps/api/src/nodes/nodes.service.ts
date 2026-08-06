import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AiService } from '../ai/ai.service';
import { CreateNodeDto } from './dto/create-node.dto';
import { UpdateNodeDto } from './dto/update-node.dto';
import { v4 as uuidv4 } from 'uuid';

const devNodeStore = new Map<string, any>();

@Injectable()
export class NodesService {
  private readonly logger = new Logger(NodesService.name);

  constructor(
    private supabase: SupabaseService,
    private aiService: AiService,
  ) {}

  async findByCanvas(canvasId: string) {
    if (this.supabase.isConfigured) {
      try {
        const { data } = await this.supabase.admin
          .from('nodes')
          .select('*')
          .eq('canvas_id', canvasId)
          .order('created_at', { ascending: true });

        if (data) return data;
      } catch (e: any) {
        this.logger.warn(`Supabase findByCanvas nodes fallback: ${e.message}`);
      }
    }

    return Array.from(devNodeStore.values()).filter((n) => n.canvas_id === canvasId);
  }

  async create(canvasId: string, userId: string, dto: CreateNodeDto) {
    const nodeId = uuidv4();
    const newNode = {
      id: nodeId,
      canvas_id: canvasId,
      type: dto.type || 'idea',
      title: dto.title,
      content: dto.content || '',
      position_x: dto.position?.x ?? 0,
      position_y: dto.position?.y ?? 0,
      width: dto.width || 360,
      height: dto.height || 240,
      metadata: dto.metadata || {},
      style: dto.style || {},
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (this.supabase.isConfigured) {
      try {
        const { data } = await this.supabase.admin
          .from('nodes')
          .insert({
            id: nodeId,
            canvas_id: canvasId,
            type: dto.type || 'idea',
            title: dto.title,
            content: dto.content || '',
            position_x: dto.position?.x ?? 0,
            position_y: dto.position?.y ?? 0,
            width: dto.width || 360,
            height: dto.height || 240,
            metadata: dto.metadata || {},
            style: dto.style || {},
            created_by: userId,
          })
          .select()
          .single();

        if (data) {
          devNodeStore.set(data.id, data);
          return data;
        }
      } catch (e: any) {
        this.logger.warn(`Supabase create node fallback: ${e.message}`);
      }
    }

    devNodeStore.set(nodeId, newNode);
    return newNode;
  }

  async findOne(nodeId: string) {
    if (this.supabase.isConfigured) {
      try {
        const { data } = await this.supabase.admin
          .from('nodes')
          .select('*')
          .eq('id', nodeId)
          .maybeSingle();

        if (data) return data;
      } catch {}
    }

    const devNode = devNodeStore.get(nodeId);
    if (devNode) return devNode;

    throw new NotFoundException(`Node ${nodeId} not found`);
  }

  async update(nodeId: string, userId: string, dto: UpdateNodeDto) {
    let existing: any;
    try {
      existing = await this.findOne(nodeId);
    } catch {
      existing = { id: nodeId, content: '', title: 'Node' };
    }

    const updatePayload: Record<string, any> = {
      ...existing,
      updated_at: new Date().toISOString(),
    };

    if (dto.title !== undefined) updatePayload.title = dto.title;
    if (dto.content !== undefined) updatePayload.content = dto.content;
    if (dto.position !== undefined) {
      updatePayload.position_x = dto.position.x;
      updatePayload.position_y = dto.position.y;
    }
    if (dto.width !== undefined) updatePayload.width = dto.width;
    if (dto.height !== undefined) updatePayload.height = dto.height;

    if (this.supabase.isConfigured) {
      try {
        await this.supabase.admin
          .from('nodes')
          .update(updatePayload)
          .eq('id', nodeId);
      } catch {}
    }

    devNodeStore.set(nodeId, updatePayload);
    return updatePayload;
  }

  async remove(nodeId: string) {
    if (this.supabase.isConfigured) {
      try {
        await this.supabase.admin.from('nodes').delete().eq('id', nodeId);
      } catch {}
    }

    devNodeStore.delete(nodeId);
    return { message: 'Node deleted' };
  }

  async expand(nodeId: string, userId: string) {
    let node: any;
    try { node = await this.findOne(nodeId) } catch { node = { id: nodeId, canvas_id: 'default', position_x: 400, position_y: 200, title: 'Node' } }

    const expanded = await this.aiService.expandNode(node);

    const childNodes = [];
    for (let i = 0; i < (expanded.children || []).length; i++) {
      const child = expanded.children[i];
      try {
        const childNode = await this.create(node.canvas_id, userId, {
          type: child.type as any,
          title: child.title,
          content: child.content,
          position: {
            x: (node.position_x || 0) + 420,
            y: (node.position_y || 0) + i * 260,
          },
          width: child.width || 340,
          height: child.height || 220,
        });
        childNodes.push(childNode);
      } catch (e: any) {
        this.logger.warn(`Failed to create child node: ${e.message}`);
      }
    }

    return { parent: node, children: childNodes };
  }

  async improve(nodeId: string, userId: string) {
    let node: any;
    try { node = await this.findOne(nodeId) } catch { node = { id: nodeId, title: 'Node', content: '' } }
    const improved = await this.aiService.improveNode(node);
    return this.update(nodeId, userId, { content: improved.content });
  }

  async simplify(nodeId: string, userId: string) {
    let node: any;
    try { node = await this.findOne(nodeId) } catch { node = { id: nodeId, title: 'Node', content: '' } }
    const simplified = await this.aiService.simplifyNode(node);
    return this.update(nodeId, userId, { content: simplified.content });
  }

  async generateTasks(nodeId: string) {
    let node: any;
    try { node = await this.findOne(nodeId) } catch { node = { id: nodeId, title: 'Node', content: '' } }
    const tasks = await this.aiService.generateTasks(node);
    return { node, tasks };
  }
}
