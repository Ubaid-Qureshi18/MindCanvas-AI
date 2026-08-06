import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface SerpapiResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
  source?: string;
}

@Injectable()
export class SerpapiService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://serpapi.com/search';

  constructor(private config: ConfigService) {
    this.apiKey = this.config.get<string>('search.serpapi.apiKey') || '';
  }

  get isAvailable(): boolean {
    return !!this.apiKey;
  }

  async search(query: string, options: { engine?: string; num?: number } = {}): Promise<SerpapiResult[]> {
    if (!this.apiKey) return [];

    try {
      const { data } = await axios.get(this.baseUrl, {
        params: {
          api_key: this.apiKey,
          q: query,
          engine: options.engine || 'google',
          num: options.num || 10,
        },
        timeout: 15000,
      });

      return (data.organic_results || []).map((r: any, i: number) => ({
        title: r.title,
        link: r.link,
        snippet: r.snippet,
        position: i + 1,
        source: r.source,
      }));
    } catch (error) {
      console.error('SerpAPI search error:', error.message);
      return [];
    }
  }

  async searchTrends(query: string): Promise<SerpapiResult[]> {
    return this.search(query, { engine: 'google_trends' });
  }

  async searchNews(query: string): Promise<SerpapiResult[]> {
    return this.search(query, { engine: 'google_news' });
  }

  async getKnowledgeGraph(query: string): Promise<any> {
    if (!this.apiKey) return null;

    try {
      const { data } = await axios.get(this.baseUrl, {
        params: { api_key: this.apiKey, q: query, engine: 'google' },
        timeout: 15000,
      });
      return data.knowledge_graph || null;
    } catch {
      return null;
    }
  }
}
