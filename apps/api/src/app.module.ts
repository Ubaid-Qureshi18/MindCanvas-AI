import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { CanvasesModule } from './canvases/canvases.module';
import { NodesModule } from './nodes/nodes.module';
import { ConnectionsModule } from './connections/connections.module';
import { AiModule } from './ai/ai.module';
import { CollaboratorsModule } from './collaborators/collaborators.module';
import { ExportModule } from './export/export.module';
import { ResearchModule } from './research/research.module';
import { SupabaseModule } from './supabase/supabase.module';
import { GatewayModule } from './gateway/gateway.module';
import appConfig from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: ['.env', '.env.local'],
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    SupabaseModule,
    GatewayModule,
    AuthModule,
    WorkspacesModule,
    CanvasesModule,
    NodesModule,
    ConnectionsModule,
    AiModule,
    CollaboratorsModule,
    ExportModule,
    ResearchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
