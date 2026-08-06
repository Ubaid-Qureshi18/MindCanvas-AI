import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CollaboratorsService {
  constructor(private supabase: SupabaseService) {}

  async add(workspaceId: string, userId: string, role: string = 'viewer') {
    const { data, error } = await this.supabase.admin
      .from('collaborators')
      .upsert({ id: uuidv4(), workspace_id: workspaceId, user_id: userId, role })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async remove(workspaceId: string, userId: string) {
    const { error } = await this.supabase.admin
      .from('collaborators')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
    return { message: 'Collaborator removed' };
  }

  async list(workspaceId: string) {
    const { data, error } = await this.supabase.admin
      .from('collaborators')
      .select('*, users(id, email, full_name, avatar_url)')
      .eq('workspace_id', workspaceId);
    if (error) throw new Error(error.message);
    return data;
  }
}
