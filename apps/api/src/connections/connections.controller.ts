import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ConnectionsService, CreateConnectionDto } from './connections.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('connections')
@UseGuards(JwtAuthGuard)
export class ConnectionsController {
  constructor(private readonly connectionsService: ConnectionsService) {}

  @Get('canvas/:canvasId')
  findByCanvas(@Param('canvasId') canvasId: string) {
    return this.connectionsService.findByCanvas(canvasId);
  }

  @Post()
  create(@Body() dto: CreateConnectionDto) {
    return this.connectionsService.create(dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.connectionsService.remove(id);
  }
}
