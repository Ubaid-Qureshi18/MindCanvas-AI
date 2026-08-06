import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ResearchService } from './research.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsString, IsOptional } from 'class-validator';

class ResearchDto {
  @IsString()
  query: string;

  @IsString()
  @IsOptional()
  intent?: any;
}

class ScrapeDto {
  @IsString()
  url: string;
}

@Controller('research')
@UseGuards(JwtAuthGuard)
export class ResearchController {
  constructor(private readonly researchService: ResearchService) {}

  @Post()
  research(@Body() dto: ResearchDto) {
    return this.researchService.research(dto.query, dto.intent);
  }

  @Post('competitors')
  competitors(@Body() dto: { company: string }) {
    return this.researchService.researchCompetitors(dto.company);
  }

  @Post('market')
  market(@Body() dto: { industry: string }) {
    return this.researchService.researchMarket(dto.industry);
  }

  @Post('scrape')
  scrape(@Body() dto: ScrapeDto) {
    return this.researchService.scrapeWebsite(dto.url);
  }
}
