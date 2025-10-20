
import { GoogleGenAI, Modality } from "@google/genai";
import { AspectRatio } from '../types';

const getAiClient = (userApiKey?: string | null) => {
  const apiKey = userApiKey || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API 密钥未配置。请在设置中输入您的 API 密钥。");
  }
  return new GoogleGenAI({ apiKey });
};


export const generateInspirationPrompt = async (userApiKey?: string | null): Promise<string> => {
  const ai = getAiClient(userApiKey);
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    // A very specific prompt to ask for a single, unformatted line of text.
    contents: '生成一个用于AI图像生成的富有想象力的提示。要求：简短、具体、充满视觉细节。直接返回提示文本，不要包含任何介绍性文字、标题、编号、引号或markdown格式。',
  });
  
  const text = response.text.trim();
  
  // Take the first line of the response, just in case the model adds extra newlines.
  const firstLine = text.split('\n')[0];

  // Clean up the line: remove potential list markers, quotes, and trailing parenthetical translations.
  return firstLine
    .replace(/^\s*(\d+\.|-|\*)\s*/, '') // Remove list markers like "1. " or "- "
    .replace(/["“”*]/g, '')             // Remove quotes and asterisks for bolding
    .replace(/\s*\(.*\)\s*$/, '')      // Remove trailing English translations in parentheses
    .trim();
};

export const optimizePrompt = async (currentPrompt: string, userApiKey?: string | null): Promise<string> => {
  if (!currentPrompt.trim()) {
    return currentPrompt;
  }
  const ai = getAiClient(userApiKey);
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `重写并增强这个AI图像生成提示词，使其更详细、生动、有效。添加关于风格、光照和构图的具体细节。只返回增强后的提示词。提示词：“${currentPrompt}”`,
  });
  return response.text.trim().replace(/"/g, '').replace(/“/g, '').replace(/”/g, '');
};

export const textToImage = async (prompt: string, aspectRatio: AspectRatio, userApiKey?: string | null): Promise<string> => {
  const ai = getAiClient(userApiKey);
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: prompt },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE],
      imageConfig: {
        aspectRatio: aspectRatio,
      },
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      const base64ImageBytes: string = part.inlineData.data;
      const mimeType = part.inlineData.mimeType;
      return `data:${mimeType};base64,${base64ImageBytes}`;
    }
  }

  throw new Error("图像生成失败或未返回图像。");
};

export const imageToImage = async (prompt: string, image: { dataUrl: string; mimeType: string }, userApiKey?: string | null): Promise<string> => {
  const base64Data = image.dataUrl.split(',')[1];
  const ai = getAiClient(userApiKey);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType: image.mimeType,
          },
        },
        {
          text: prompt,
        },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      const base64ImageBytes: string = part.inlineData.data;
      const mimeType = part.inlineData.mimeType;
      return `data:${mimeType};base64,${base64ImageBytes}`;
    }
  }

  throw new Error("图像生成失败或未返回图像。");
};