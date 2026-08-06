import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface FirecrawlResult {
  url: string;
  markdown: string;
  title: string;
  description: string;
  links: string[];
}

@Injectable()
export class FirecrawlService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.firecrawl.dev/v1';

  constructor(private config: ConfigService) {
    this.apiKey = this.config.get<string>('search.firecrawl.apiKey') || '';
  }

  get isAvailable(): boolean {
    return !!this.apiKey;
  }

  async scrapeUrl(url: string): Promise<FirecrawlResult | null> {
    if (!this.apiKey) return null;

    try {
      const { data } = await axios.post(
        `${this.baseUrl}/scrape`,
        { url, formats: ['markdown'], onlyMainContent: true },
        {
          headers: { Authorization: `Bearer ${this.apiKey}` },
          timeout: 30000,
        },
      );

      return {
        url,
        markdown: data.data?.markdown || '',
        title: data.data?.metadata?.title || '',
        description: data.data?.metadata?.description || '',
        links: data.data?.links || [],
      };
    } catch (error) {
      console.error('Firecrawl scrape error:', error.message);
      return null;
    }
  }

  async crawlWebsite(url: string, maxPages = 5): Promise<FirecrawlResult[]> {
    if (!this.apiKey) return [];

    try {
      // Start crawl job
      const { data: crawlJob } = await axios.post(
        `${this.baseUrl}/crawl`,
        { url, limit: maxPages, scrapeOptions: { formats: ['markdown'] } },
        { headers: { Authorization: `Bearer ${this.apiKey}` }, timeout: 10000 },
      );

      // Poll for results (simplified — production should use webhooks)
      await new Promise((r) => setTimeout(r, 5000));

      const { data: results } = await axios.get(
        `${this.baseUrl}/crawl/${crawlJob.id}`,
        { headers: { Authorization: `Bearer ${this.apiKey}` }, timeout: 15000 },
      );

      return (results.data || []).map((page: any) => ({
        url: page.metadata?.sourceURL || url,
        markdown: page.markdown || '',
        title: page.metadata?.title || '',
        description: page.metadata?.description || '',
        links: page.links || [],
      }));
    } catch (error) {
      console.error('Firecrawl crawl error:', error.message);
      return [];
    }
  }
}
