import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { v4 as uuidv4 } from 'uuid';

export class CreateConnectionDto {
  canvas_id: string;
  source_node_id: string;
  target_node_id: string;
  label?: string;
  type?: string;
  metadata?: Record<string, any>;
}

const devConnectionStore = new Map<string, any>();

@Injectable()
export class ConnectionsService {
  private readonly logger = new Logger(ConnectionsService.name);

  constructor(private supabase: SupabaseService) {}

  async findByCanvas(canvasId: string) {
    if (this.supabase.isConfigured) {
      try {
        const { data } = await this.supabase.admin
          .from('connections')
          .select('*')
          .eq('canvas_id', canvasId);
        if (data) return data;
      } catch (e: any) {
        this.logger.warn(`Supabase findByCanvas connections fallback: ${e.message}`);
      }
    }
    return Array.from(devConnectionStore.values()).filter((c) => c.canvas_id === canvasId);
  }

  async create(dto: CreateConnectionDto) {
    const connId = uuidv4();
    const newConn = {
      id: connId,
      canvas_id: dto.canvas_id,
      source_node_id: dto.source_node_id,
      target_node_id: dto.target_node_id,
      label: dto.label || null,
      type: dto.type || 'default',
      metadata: dto.metadata || {},
      created_at: new Date().toISOString(),
    };

    if (this.supabase.isConfigured) {
      try {
        const { data } = await this.supabase.admin
          .from('connections')
          .insert({
            id: connId,
            canvas_id: dto.canvas_id,
            source_node_id: dto.source_node_id,
            target_node_id: dto.target_node_id,
            label: dto.label,
            type: dto.type || 'default',
            metadata: dto.metadata || {},
          })
          .select()
          .single();
        if (data) {
          devConnectionStore.set(data.id, data);
          return data;
        }
      } catch (e: any) {
        this.logger.warn(`Supabase create connection fallback: ${e.message}`);
      }
    }

    devConnectionStore.set(connId, newConn);
    return newConn;
  }

  async remove(connectionId: string) {
    if (this.supabase.isConfigured) {
      try {
        await this.supabase.admin.from('connections').delete().eq('id', connectionId);
      } catch {}
    }
    devConnectionStore.delete(connectionId);
    return { message: 'Connection deleted' };
  }
}
