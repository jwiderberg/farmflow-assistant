import { OpenAIResponse } from '../types';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export const getAIResponse = async (message: string, language: 'en' | 'ar', imageData?: string): Promise<string> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key is missing. Please add it to your .env file.');
  }

  const systemMessage = `You are an expert on crops and farming in Kuwait, with detailed knowledge on soil, watering, growing season and maximizing yields for different types of crops. ${
    imageData ? 'When analyzing images, focus on identifying plants, soil conditions, signs of disease or pest problems, and provide specific recommendations for Kuwait\'s climate.' : ''
  } If the user asks you questions about anything not related to crops and farming in Kuwait, kindly remind them of your area of expertise and suggest they use Google instead. ALWAYS respond in ${language === 'en' ? 'English' : 'Arabic'} regardless of the input language.`;
  
  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemMessage
          },
          {
            role: 'user',
            content: imageData ? [
              { type: 'text', text: message },
              { type: 'image_url', image_url: { url: imageData } }
            ] : message
          }
        ],
        max_tokens: 150
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to get response from OpenAI');
    }
    
    const data: OpenAIResponse = await response.json();
    return data.choices[0]?.message.content.trim() || '';
    
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`OpenAI API error: ${error.message}`);
    }
    throw new Error('Unknown error occurred while calling OpenAI API');
  }
};