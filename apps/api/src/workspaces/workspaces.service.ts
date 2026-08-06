import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { v4 as uuidv4 } from 'uuid';

const devWorkspaceStore = new Map<string, any>();

@Injectable()
export class WorkspacesService {
  private readonly logger = new Logger(WorkspacesService.name);

  constructor(private supabase: SupabaseService) {}

  async findAll(userId: string) {
    if (this.supabase.isConfigured) {
      try {
        const { data: collabs } = await this.supabase.admin
          .from('collaborators')
          .select('workspace_id, role')
          .eq('user_id', userId);

        if (collabs && collabs.length > 0) {
          const workspaceIds = collabs.map((c) => c.workspace_id);
          const { data } = await this.supabase.admin
            .from('workspaces')
            .select('id, name, description, owner_id, settings, created_at, updated_at')
            .in('id', workspaceIds)
            .order('updated_at', { ascending: false });

          if (data) return data;
        }
      } catch (e: any) {
        this.logger.warn(`Supabase findAll workspaces fallback: ${e.message}`);
      }
    }

    // Dev store fallback
    const userWs = Array.from(devWorkspaceStore.values()).filter(
      (w) => w.owner_id === userId || w.owner_id === 'default',
    );

    if (userWs.length === 0) {
      // Auto-create default workspace for user
      const defaultWs = {
        id: uuidv4(),
        name: 'My Workspace',
        description: 'Personal workspace',
        owner_id: userId,
        settings: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      devWorkspaceStore.set(defaultWs.id, defaultWs);
      return [defaultWs];
    }

    return userWs;
  }

  async create(userId: string, dto: CreateWorkspaceDto) {
    const workspaceId = uuidv4();
    const newWs = {
      id: workspaceId,
      name: dto.name,
      description: dto.description || '',
      owner_id: userId,
      settings: dto.settings || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (this.supabase.isConfigured) {
      try {
        const { data } = await this.supabase.admin
          .from('workspaces')
          .insert({
            id: workspaceId,
            name: dto.name,
            description: dto.description,
            owner_id: userId,
            settings: dto.settings || {},
          })
          .select()
          .single();

        void this.supabase.admin.from('collaborators').insert({
          id: uuidv4(),
          workspace_id: workspaceId,
          user_id: userId,
          role: 'owner',
        });

        if (data) {
          devWorkspaceStore.set(data.id, data);
          return data;
        }
      } catch (e: any) {
        this.logger.warn(`Supabase create workspace fallback: ${e.message}`);
      }
    }

    devWorkspaceStore.set(workspaceId, newWs);
    return newWs;
  }

  async findOne(workspaceId: string, userId: string) {
    if (this.supabase.isConfigured) {
      try {
        const { data } = await this.supabase.admin
          .from('workspaces')
          .select('id, name, description, owner_id, settings, created_at, updated_at')
          .eq('id', workspaceId)
          .maybeSingle();

        if (data) return data;
      } catch {}
    }

    const devWs = devWorkspaceStore.get(workspaceId);
    if (devWs) return devWs;

    throw new NotFoundException('Workspace not found');
  }

  async update(workspaceId: string, userId: string, dto: UpdateWorkspaceDto) {
    const ws = await this.findOne(workspaceId, userId);
    const updated = { ...ws, ...dto, updated_at: new Date().toISOString() };

    if (this.supabase.isConfigured) {
      try {
        await this.supabase.admin
          .from('workspaces')
          .update({ ...dto, updated_at: new Date().toISOString() })
          .eq('id', workspaceId);
      } catch {}
    }

    devWorkspaceStore.set(workspaceId, updated);
    return updated;
  }

  async remove(workspaceId: string, userId: string) {
    if (this.supabase.isConfigured) {
      try {
        await this.supabase.admin.from('workspaces').delete().eq('id', workspaceId);
      } catch {}
    }

    devWorkspaceStore.delete(workspaceId);
    return { message: 'Workspace deleted' };
  }
}
