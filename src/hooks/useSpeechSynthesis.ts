import { useState, useCallback } from 'react';

const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState('en-US');
  
  const speechSynthesisAvailable = 'speechSynthesis' in window;
  
  if (!speechSynthesisAvailable) {
    setError('Speech synthesis is not supported in this browser.');
  }
  
  const speak = useCallback((text: string) => {
    if (!speechSynthesisAvailable) {
      const errorMessage = language === 'ar-SA'
        ? 'خاصية تحويل النص إلى كلام غير مدعومة في هذا المتصفح'
        : 'Speech synthesis is not supported in this browser.';
      setError(errorMessage);
      return;
    }
    
    setError(null);
    
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    
    // Find an appropriate voice for Arabic
    if (language === 'ar-SA') {
      const voices = window.speechSynthesis.getVoices();
      const arabicVoice = voices.find(voice => 
        voice.lang.startsWith('ar') || voice.lang === 'ar-SA'
      );
      if (arabicVoice) {
        utterance.voice = arabicVoice;
      }
    }
    
    utterance.onstart = () => {
      setIsSpeaking(true);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    utterance.onerror = (event) => {
      const errorMessage = language === 'ar-SA'
        ? `خطأ في تحويل النص إلى كلام: ${event.error}`
        : `Speech synthesis error: ${event.error}`;
      setError(errorMessage);
      setIsSpeaking(false);
    };
    
    window.speechSynthesis.speak(utterance);
  }, [speechSynthesisAvailable, language]);
  
  const cancel = useCallback(() => {
    if (speechSynthesisAvailable && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [speechSynthesisAvailable]);
  
  return {
    isSpeaking,
    error,
    speak,
    cancel,
    setLanguage
  };
};

export default useSpeechSynthesis;