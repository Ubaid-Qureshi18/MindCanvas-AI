import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenAiService {
  private client: OpenAI | null = null;

  constructor(private config: ConfigService) {
    const apiKey = this.config.get<string>('openai.apiKey');
    if (apiKey) {
      this.client = new OpenAI({ apiKey });
    } else {
      console.warn('⚠️  OPENAI_API_KEY not configured');
    }
  }

  get isAvailable(): boolean {
    return !!this.client;
  }

  async generateJSON<T>(systemPrompt: string, userPrompt: string, model = 'gpt-4o'): Promise<T> {
    if (!this.client) {
      throw new Error('OpenAI not configured. Set OPENAI_API_KEY.');
    }

    const response = await this.client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 8192,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Empty response from OpenAI');

    return JSON.parse(content) as T;
  }

  async generateText(systemPrompt: string, userPrompt: string, model = 'gpt-4o'): Promise<string> {
    if (!this.client) {
      throw new Error('OpenAI not configured. Set OPENAI_API_KEY.');
    }

    const response = await this.client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    });

    return response.choices[0]?.message?.content || '';
  }

  async streamText(
    systemPrompt: string,
    userPrompt: string,
    onChunk: (chunk: string) => void,
  ): Promise<void> {
    if (!this.client) throw new Error('OpenAI not configured');

    const stream = await this.client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) onChunk(delta);
    }
  }
}
