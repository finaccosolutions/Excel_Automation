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
         }
         
         IMPORTANT:
         1. If the request requires macros, use operation: "create_vba"
         2. If it's a simple formula, use operation: "add_formula"
         3. For button creation, use operation: "add_button"
         4. Make sure the code is properly formatted and includes error handling`
      );

      const response = result.response.text();
      try {
        // Remove any markdown code block formatting if present
        const cleanedResponse = response.replace(/```json\n?|```/g, '').trim();
        const parsed = JSON.parse(cleanedResponse);
        
        if (!parsed.operation || !parsed.content) {
          throw new Error('Invalid AI response format');
        }

        // Validate operation type
        if (!['create_vba', 'add_formula', 'add_button'].includes(parsed.operation)) {
          throw new Error('Invalid operation type');
        }

        // Generate Excel file with the code
        await generateExcelFile(parsed.operation, parsed.content);

        return {
          vbaCode: parsed.vbaCode,
          response: parsed.explanation
        };
      } catch (error) {
        if (error.message.includes('Failed to generate Excel file')) {
          throw new Error('Failed to create Excel file. Please try again.');
        }
        throw new Error(`Failed to process AI response: ${error.message}`);
      }
    } catch (error) {
      console.error('Error generating VBA code:', error);
      throw error;
    }
  };

  return { generateVbaCode };
};