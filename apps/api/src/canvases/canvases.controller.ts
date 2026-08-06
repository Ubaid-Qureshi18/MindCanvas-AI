import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, Request,
} from '@nestjs/common';
import { CanvasesService } from './canvases.service';
import { CreateCanvasDto } from './dto/create-canvas.dto';
import { UpdateCanvasDto } from './dto/update-canvas.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('canvases')
@UseGuards(JwtAuthGuard)
export class CanvasesController {
  constructor(private readonly canvasesService: CanvasesService) {}

  @Get('workspace/:workspaceId')
  findByWorkspace(@Request() req, @Param('workspaceId') workspaceId: string) {
    return this.canvasesService.findByWorkspace(workspaceId, req.user.id);
  }

  @Post('workspace/:workspaceId')
  create(
    @Request() req,
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateCanvasDto,
  ) {
    return this.canvasesService.create(workspaceId, req.user.id, dto);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.canvasesService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() dto: UpdateCanvasDto) {
    return this.canvasesService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.canvasesService.remove(id, req.user.id);
  }
}
