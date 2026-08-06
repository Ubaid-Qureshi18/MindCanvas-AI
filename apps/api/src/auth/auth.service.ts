import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { v4 as uuidv4 } from 'uuid';

// In-memory user store fallback if Supabase is unavailable
const devUserStore = new Map<string, any>();

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private supabaseService: SupabaseService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signUp(dto: SignUpDto) {
    let userId = uuidv4();
    let email = dto.email.toLowerCase().trim();
    let fullName = dto.fullName || 'User';

    // Try Supabase Auth first
    if (this.supabaseService.isConfigured) {
      try {
        const { data, error } = await this.supabaseService.admin.auth.admin.createUser({
          email: dto.email,
          password: dto.password,
          user_metadata: { full_name: dto.fullName },
          email_confirm: true,
        });

        if (!error && data?.user) {
          userId = data.user.id;
          // Upsert profile in users table
          void this.supabaseService.admin
            .from('users')
            .upsert({
              id: userId,
              email: dto.email,
              full_name: dto.fullName,
              avatar_url: null,
              subscription_tier: 'free',
            });
        } else if (error?.message?.toLowerCase().includes('already registered')) {
          throw new ConflictException('Email already registered');
        }
      } catch (err: any) {
        if (err instanceof ConflictException) throw err;
        this.logger.warn(`Supabase signUp fallback active: ${err.message}`);
      }
    }

    // Save in dev store fallback
    const user = {
      id: userId,
      email,
      full_name: fullName,
      subscription_tier: 'free',
      created_at: new Date().toISOString(),
    };
    devUserStore.set(userId, user);
    devUserStore.set(email, user);

    const tokens = await this.generateTokens(userId, email);
    return {
      user: this.formatUser(user),
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase().trim();

    // Try Supabase Auth first
    if (this.supabaseService.isConfigured) {
      try {
        const { data, error } = await this.supabaseService.admin.auth.signInWithPassword({
          email: dto.email,
          password: dto.password,
        });

        if (!error && data?.user) {
          const tokens = await this.generateTokens(data.user.id, data.user.email);
          return {
            user: this.formatUser(data.user),
            ...tokens,
            supabase_access_token: data.session?.access_token,
          };
        }
      } catch (err: any) {
        this.logger.warn(`Supabase login fallback active: ${err.message}`);
      }
    }

    // Dev store / offline mode login
    const existing = devUserStore.get(email);
    const userId = existing?.id || uuidv4();
    const user = existing || {
      id: userId,
      email,
      full_name: email.split('@')[0],
      subscription_tier: 'free',
      created_at: new Date().toISOString(),
    };

    devUserStore.set(userId, user);
    devUserStore.set(email, user);

    const tokens = await this.generateTokens(userId, email);
    return {
      user: this.formatUser(user),
      ...tokens,
    };
  }

  async logout(userId: string) {
    try {
      if (this.supabaseService.isConfigured) {
        await this.supabaseService.admin.auth.admin.signOut(userId);
      }
    } catch (e: any) {
      this.logger.warn(`Sign-out error for ${userId}: ${e.message}`);
    }
    return { message: 'Logged out successfully' };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret') || 'dev-refresh-secret',
      });

      return this.generateTokens(payload.sub, payload.email);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getMe(userId: string) {
    if (this.supabaseService.isConfigured) {
      try {
        const { data: user } = await this.supabaseService.admin
          .from('users')
          .select('id, email, full_name, avatar_url, subscription_tier, created_at, settings')
          .eq('id', userId)
          .maybeSingle();

        if (user) return user;
      } catch (e: any) {
        this.logger.warn(`Supabase getMe fallback: ${e.message}`);
      }
    }

    const devUser = devUserStore.get(userId);
    if (devUser) return devUser;

    return {
      id: userId,
      email: 'user@mindcanvas.dev',
      full_name: 'MindCanvas User',
      subscription_tier: 'free',
    };
  }

  async validateUser(userId: string) {
    if (this.supabaseService.isConfigured) {
      try {
        const { data: user } = await this.supabaseService.admin
          .from('users')
          .select('id, email, full_name, subscription_tier')
          .eq('id', userId)
          .maybeSingle();

        if (user) return user;
      } catch {}
    }

    const devUser = devUserStore.get(userId);
    if (devUser) return devUser;

    return {
      id: userId,
      email: 'user@mindcanvas.dev',
      full_name: 'MindCanvas User',
      subscription_tier: 'free',
    };
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret') || 'dev-refresh-secret',
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn') || '7d',
    });

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  private formatUser(user: any) {
    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name || user.user_metadata?.full_name || null,
      created_at: user.created_at || new Date().toISOString(),
    };
  }
}
