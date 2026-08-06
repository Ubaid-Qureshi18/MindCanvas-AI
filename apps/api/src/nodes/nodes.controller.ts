import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, Request,
} from '@nestjs/common';
import { NodesService } from './nodes.service';
import { CreateNodeDto } from './dto/create-node.dto';
import { UpdateNodeDto } from './dto/update-node.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('nodes')
@UseGuards(JwtAuthGuard)
export class NodesController {
  constructor(private readonly nodesService: NodesService) {}

  @Get('canvas/:canvasId')
  findByCanvas(@Param('canvasId') canvasId: string) {
    return this.nodesService.findByCanvas(canvasId);
  }

  @Post('canvas/:canvasId')
  create(
    @Request() req,
    @Param('canvasId') canvasId: string,
    @Body() dto: CreateNodeDto,
  ) {
    return this.nodesService.create(canvasId, req.user.id, dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nodesService.findOne(id);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() dto: UpdateNodeDto) {
    return this.nodesService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nodesService.remove(id);
  }

  @Post(':id/expand')
  expand(@Request() req, @Param('id') id: string) {
    return this.nodesService.expand(id, req.user.id);
  }

  @Post(':id/improve')
  improve(@Request() req, @Param('id') id: string) {
    return this.nodesService.improve(id, req.user.id);
  }

  @Post(':id/simplify')
  simplify(@Request() req, @Param('id') id: string) {
    return this.nodesService.simplify(id, req.user.id);
  }

  @Post(':id/generate-tasks')
  generateTasks(@Param('id') id: string) {
    return this.nodesService.generateTasks(id);
  }
}
