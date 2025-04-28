import { GoogleGenerativeAI } from '@google/generative-ai';
import { Message } from '../types';
import { generateExcelFile } from './excelOperations';

export const createGeminiChat = (apiKey: string) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash"
  });

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
         Return ONLY a plain JSON object (no markdown, no code blocks) with the following structure:
         {
           "vbaCode": "the complete VBA code",
           "explanation": "detailed explanation of how to use the code",
           "operation": "create_vba|add_formula|add_button",
           "content": "the code or configuration"
         }`
      );

      const response = result.response.text();
      try {
        // Remove any markdown code block formatting if present
        const cleanedResponse = response.replace(/```json\n?|```/g, '').trim();
        const parsed = JSON.parse(cleanedResponse);
        
        // Generate Excel file with the code
        const { error } = await generateExcelFile(parsed.operation, parsed.content);
        if (error) {
          throw new Error(error);
        }

        return {
          vbaCode: parsed.vbaCode,
          response: parsed.explanation
        };
      } catch (error) {
        throw new Error(`Failed to process response: ${error.message}`);
      }
    } catch (error) {
      console.error('Error generating VBA code:', error);
      throw error;
    }
  };

  return { generateVbaCode };
};