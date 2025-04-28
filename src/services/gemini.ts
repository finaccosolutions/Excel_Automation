import { GoogleGenerativeAI } from '@google/generative-ai';
import { Message } from '../types';

export const createGeminiChat = (apiKey: string) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const generateVbaCode = async (prompt: string, history: Message[]) => {
    try {
      const chat = model.startChat({
        history: history.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: msg.content,
        })),
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      });

      const result = await chat.sendMessage(
        `You are an Excel VBA expert. Create VBA code for the following requirement: ${prompt}. 
         Provide your response in the following format:
         {
           "vbaCode": "the complete VBA code",
           "explanation": "detailed explanation of how to use the code"
         }`
      );

      const response = result.response.text();
      try {
        const parsed = JSON.parse(response);
        return {
          vbaCode: parsed.vbaCode,
          response: parsed.explanation
        };
      } catch {
        // If response is not valid JSON, return a default format
        return {
          vbaCode: response.match(/```vba([\s\S]*?)```/)?.[1] || response,
          response: "Here's the VBA code I generated based on your requirements. You can copy this code into the VBA editor in Excel."
        };
      }
    } catch (error) {
      console.error('Error generating VBA code:', error);
      throw error; // Propagate the original error for better error handling
    }
  };

  return { generateVbaCode };
};