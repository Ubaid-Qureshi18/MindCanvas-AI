import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor(private config: ConfigService) {
    const apiKey = this.config.get<string>('gemini.apiKey');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    } else {
      console.warn('⚠️  GEMINI_API_KEY not configured');
    }
  }

  get isAvailable(): boolean {
    return !!this.genAI;
  }

  async generateJSON<T>(systemPrompt: string, userPrompt: string): Promise<T> {
    if (!this.genAI) {
      throw new Error('Gemini not configured. Set GEMINI_API_KEY.');
    }

    const modelsToTry = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash-exp'];
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        const model = this.genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.7,
            maxOutputTokens: 8192,
          },
          systemInstruction: systemPrompt,
        });

        const result = await model.generateContent(userPrompt);
        const text = result.response.text();

        try {
          return JSON.parse(text) as T;
        } catch {
          const jsonMatch = text.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
          if (jsonMatch) return JSON.parse(jsonMatch[1]) as T;
          throw new Error('Failed to parse Gemini JSON response');
        }
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError || new Error('Failed to generate JSON with Gemini');
  }

  async generateText(systemPrompt: string, userPrompt: string): Promise<string> {
    if (!this.genAI) {
      throw new Error('Gemini not configured. Set GEMINI_API_KEY.');
    }

    const modelsToTry = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash-exp'];
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        const model = this.genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
          systemInstruction: systemPrompt,
        });

        const result = await model.generateContent(userPrompt);
        return result.response.text();
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError || new Error('Failed to generate text with Gemini');
  }
}
