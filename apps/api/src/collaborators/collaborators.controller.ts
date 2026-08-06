import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CollaboratorsService } from './collaborators.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('collaborators')
@UseGuards(JwtAuthGuard)
export class CollaboratorsController {
  constructor(private readonly collaboratorsService: CollaboratorsService) {}

  @Get('workspace/:workspaceId')
  list(@Param('workspaceId') workspaceId: string) {
    return this.collaboratorsService.list(workspaceId);
  }

  @Post()
  add(@Body() dto: { workspace_id: string; user_id: string; role?: string }) {
    return this.collaboratorsService.add(dto.workspace_id, dto.user_id, dto.role);
  }

  @Delete('workspace/:workspaceId/user/:userId')
  remove(@Param('workspaceId') workspaceId: string, @Param('userId') userId: string) {
    return this.collaboratorsService.remove(workspaceId, userId);
  }
}
