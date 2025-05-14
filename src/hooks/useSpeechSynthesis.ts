import { useState, useCallback, useEffect } from 'react';

const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState('en-US');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const speechSynthesisAvailable = 'speechSynthesis' in window;
  
  useEffect(() => {
    if (speechSynthesisAvailable) {
      const updateVoices = () => {
        setVoices(window.speechSynthesis.getVoices());
      };
      
      window.speechSynthesis.onvoiceschanged = updateVoices;
      updateVoices();
      
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, [speechSynthesisAvailable]);
  
  const speak = useCallback((text: string) => {
    if (!speechSynthesisAvailable) {
      setError('Speech synthesis is not supported in this browser.');
      return;
    }
    
    setError(null);
    
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Find appropriate voice for the language
    const isArabic = language.startsWith('ar');
    let voice = voices.find(v => v.lang.startsWith(isArabic ? 'ar' : 'en'));
    
    if (!voice && isArabic) {
      // Fallback to any Arabic voice
      voice = voices.find(v => v.lang.startsWith('ar'));
    }
    
    if (voice) {
      utterance.voice = voice;
    }
    utterance.lang = language;
    
    utterance.onstart = () => {
      setIsSpeaking(true);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    utterance.onerror = (event) => {
      const errorMessage = isArabic
        ? 'عذراً، حدث خطأ أثناء التحدث'
        : `Speech synthesis error: ${event.error}`;
      setError(errorMessage);
      setIsSpeaking(false);
    };
    
    window.speechSynthesis.speak(utterance);
  }, [speechSynthesisAvailable, language, voices]);
  
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