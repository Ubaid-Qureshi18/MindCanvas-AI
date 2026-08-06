import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AiService } from './ai.service';
import { GenerateCanvasDto } from './dto/generate-canvas.dto';
import { ChatDto } from './dto/chat.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /** POST /api/v1/ai/generate-canvas */
  @Post('generate-canvas')
  generateCanvas(@Request() req, @Body() dto: GenerateCanvasDto) {
    return this.aiService.generateCanvas(req.user.id, dto);
  }

  /** POST /api/v1/ai/chat */
  @Post('chat')
  chat(@Body() dto: ChatDto) {
    return this.aiService.chat(dto.message, dto.context || '');
  }
}
