import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface TavilyResult {
  title: string;
  url: string;
  content: string;
  score: number;
  published_date?: string;
}

@Injectable()
export class TavilyService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.tavily.com';

  constructor(private config: ConfigService) {
    this.apiKey = this.config.get<string>('search.tavily.apiKey') || '';
  }

  get isAvailable(): boolean {
    return !!this.apiKey;
  }

  async search(
    query: string,
    options: {
      searchDepth?: 'basic' | 'advanced';
      includeNews?: boolean;
      maxResults?: number;
      topic?: string;
    } = {},
  ): Promise<TavilyResult[]> {
    if (!this.apiKey) return [];

    try {
      const { data } = await axios.post(
        `${this.baseUrl}/search`,
        {
          api_key: this.apiKey,
          query,
          search_depth: options.searchDepth || 'advanced',
          include_news: options.includeNews || false,
          max_results: options.maxResults || 8,
          topic: options.topic || 'general',
        },
        { timeout: 15000 },
      );

      return (data.results || []).map((r: any) => ({
        title: r.title,
        url: r.url,
        content: r.content,
        score: r.score || 0,
        published_date: r.published_date,
      }));
    } catch (error) {
      console.error('Tavily search error:', error.message);
      return [];
    }
  }

  async searchNews(query: string, maxResults = 5): Promise<TavilyResult[]> {
    return this.search(query, { includeNews: true, topic: 'news', maxResults });
  }
}
