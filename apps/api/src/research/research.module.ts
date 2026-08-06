import { Module } from '@nestjs/common';
import { ResearchController } from './research.controller';
import { ResearchService } from './research.service';
import { TavilyService } from './providers/tavily.service';
import { ExaService } from './providers/exa.service';
import { FirecrawlService } from './providers/firecrawl.service';
import { SerpapiService } from './providers/serpapi.service';
import { OpenAiService } from '../ai/providers/openai.service';
import { GeminiService } from '../ai/providers/gemini.service';

@Module({
  controllers: [ResearchController],
  providers: [ResearchService, TavilyService, ExaService, FirecrawlService, SerpapiService, OpenAiService, GeminiService],
  exports: [ResearchService],
})
export class ResearchModule {}
