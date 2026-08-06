import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Exa from 'exa-js';

export interface ExaResult {
  title: string;
  url: string;
  content: string;
  score: number;
  publishedDate?: string;
  author?: string;
}

@Injectable()
export class ExaService {
  private client: Exa | null = null;

  constructor(private config: ConfigService) {
    const apiKey = this.config.get<string>('search.exa.apiKey');
    if (apiKey) {
      this.client = new Exa(apiKey);
    } else {
      console.warn('⚠️  EXA_API_KEY not configured');
    }
  }

  get isAvailable(): boolean {
    return !!this.client;
  }

  async search(query: string, numResults = 8): Promise<ExaResult[]> {
    if (!this.client) return [];

    try {
      const result = await this.client.searchAndContents(query, {
        numResults,
        text: { maxCharacters: 2000 },
      });

      return result.results.map((r: any) => ({
        title: r.title || '',
        url: r.url,
        content: r.text || '',
        score: r.score || 0,
        publishedDate: r.publishedDate,
        author: r.author,
      }));
    } catch (error) {
      console.error('Exa search error:', error.message);
      return [];
    }
  }

  async findSimilar(url: string, numResults = 5): Promise<ExaResult[]> {
    if (!this.client) return [];

    try {
      const result = await this.client.findSimilarAndContents(url, {
        numResults,
        text: { maxCharacters: 1500 },
      });

      return result.results.map((r: any) => ({
        title: r.title || '',
        url: r.url,
        content: r.text || '',
        score: r.score || 0,
      }));
    } catch (error) {
      console.error('Exa findSimilar error:', error.message);
      return [];
    }
  }
}
