import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { OpenAiService } from './providers/openai.service';
import { GeminiService } from './providers/gemini.service';

@Module({
  controllers: [AiController],
  providers: [AiService, OpenAiService, GeminiService],
  exports: [AiService],
})
export class AiModule {}
