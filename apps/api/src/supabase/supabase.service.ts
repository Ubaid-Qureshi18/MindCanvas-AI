import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase Service
 * Gracefully handles missing keys so the API boots even without Supabase configured.
 * All DB calls will throw clearly when keys are absent.
 */
@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);
  private supabaseAdmin: SupabaseClient | null = null;
  private supabaseClient: SupabaseClient | null = null;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const url = this.configService.get<string>('supabase.url');
    const serviceRoleKey = this.configService.get<string>('supabase.serviceRoleKey');
    const anonKey = this.configService.get<string>('supabase.anonKey');

    if (!url) {
      this.logger.warn('SUPABASE_URL not set — database features disabled');
      return;
    }

    if (serviceRoleKey) {
      this.supabaseAdmin = createClient(url, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      this.logger.log('Supabase admin client initialized ✓');
    } else {
      this.logger.warn('SUPABASE_SERVICE_ROLE_KEY not set — using anon key for admin client');
      // Fallback: use anon key so the app boots (RLS will still apply)
      if (anonKey) {
        this.supabaseAdmin = createClient(url, anonKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });
      }
    }

    if (anonKey) {
      this.supabaseClient = createClient(url, anonKey);
      this.logger.log('Supabase anon client initialized ✓');
    }
  }

  get admin(): SupabaseClient {
    if (!this.supabaseAdmin) {
      throw new Error(
        'Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file.',
      );
    }
    return this.supabaseAdmin;
  }

  get client(): SupabaseClient {
    if (!this.supabaseClient) {
      throw new Error(
        'Supabase anon client not initialized. Set SUPABASE_URL and SUPABASE_ANON_KEY.',
      );
    }
    return this.supabaseClient;
  }

  get isConfigured(): boolean {
    return this.supabaseAdmin !== null;
  }

  getAuthenticatedClient(accessToken: string): SupabaseClient {
    const url = this.configService.get<string>('supabase.url');
    const anonKey = this.configService.get<string>('supabase.anonKey');
    if (!url || !anonKey) throw new Error('Supabase not configured');
    return createClient(url, anonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });
  }
}
