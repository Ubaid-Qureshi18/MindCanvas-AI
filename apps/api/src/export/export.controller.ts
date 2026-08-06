import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ExportService } from './export.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('export')
@UseGuards(JwtAuthGuard)
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get(':canvasId/markdown')
  exportMarkdown(@Param('canvasId') canvasId: string) {
    return this.exportService.exportMarkdown(canvasId);
  }

  @Get(':canvasId/json')
  exportJson(@Param('canvasId') canvasId: string) {
    return this.exportService.exportJson(canvasId);
  }
}
