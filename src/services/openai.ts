import { OpenAIResponse } from '../types';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export const getAIResponse = async (message: string, language: 'en' | 'ar', imageData?: string): Promise<string> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error(language === 'en' 
      ? 'OpenAI API key is missing. Please add it to your .env file.'
      : 'مفتاح API الخاص بـ OpenAI مفقود. يرجى إضافته إلى ملف .env الخاص بك.');
  }

  const systemMessage = language === 'en'
    ? `You are an expert on crops and farming in Kuwait, with detailed knowledge on soil, watering, growing season and maximizing yields for different types of crops. ${
      imageData ? 'When analyzing images, focus on identifying plants, soil conditions, signs of disease or pest problems, and provide specific recommendations for Kuwait\'s climate.' : ''
    } If the user asks you questions about anything not related to crops and farming in Kuwait, kindly remind them of your area of expertise and suggest they use Google instead. ALWAYS respond in English.`
    : `أنت خبير في المحاصيل والزراعة في الكويت، ولديك معرفة تفصيلية بالتربة والري ومواسم الزراعة وتعظيم المحاصيل لمختلف أنواع المحاصيل. ${
      imageData ? 'عند تحليل الصور، ركز على تحديد النباتات وظروف التربة وعلامات الأمراض أو مشاكل الآفات، وقدم توصيات محددة لمناخ الكويت.' : ''
    } إذا سألك المستخدم أسئلة عن أي شيء لا يتعلق بالمحاصيل والزراعة في الكويت، فذكره بلطف بمجال خبرتك واقترح عليه استخدام Google بدلاً من ذلك. قم دائمًا بالرد باللغة العربية.`;
  
  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
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
        max_tokens: 500
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(language === 'en'
        ? errorData.error?.message || 'Failed to get response from OpenAI'
        : errorData.error?.message || 'فشل في الحصول على رد من OpenAI');
    }
    
    const data: OpenAIResponse = await response.json();
    return data.choices[0]?.message.content.trim() || '';
    
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(language === 'en'
        ? `OpenAI API error: ${error.message}`
        : `خطأ في واجهة برمجة تطبيقات OpenAI: ${error.message}`);
    }
    throw new Error(language === 'en'
      ? 'Unknown error occurred while calling OpenAI API'
      : 'حدث خطأ غير معروف أثناء الاتصال بواجهة برمجة تطبيقات OpenAI');
  }
};