import { generateText, generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

export interface AIProviderConfig {
  model?: string;
  temperature?: number;
}

const DEFAULT_MODEL = "gemini-1.5-flash"; // Or gemini-1.5-pro for deep reasoning

/**
 * Basic wrapper around Vercel AI SDK for Gemini to enforce structured output.
 */
export class GeminiProvider {
  private getModel(modelName: string = DEFAULT_MODEL) {
    return google(modelName);
  }

  async generateStructuredData<T>(
    prompt: string,
    schema: z.ZodType<T>,
    config?: AIProviderConfig
  ): Promise<T> {
    const { object } = await generateObject({
      model: this.getModel(config?.model),
      schema: schema,
      prompt: prompt,
      temperature: config?.temperature ?? 0.3, // Lower temp for more structured data
    });
    return object as T;
  }

  async generateTextContent(
    prompt: string,
    config?: AIProviderConfig
  ): Promise<string> {
    const { text } = await generateText({
      model: this.getModel(config?.model),
      prompt: prompt,
      temperature: config?.temperature ?? 0.7,
    });
    return text;
  }
}

export const aiProvider = new GeminiProvider();
