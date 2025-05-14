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
      setError('Speech synthesis is not supported in this browser.');
      return;
    }
    
    setError(null);
    
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    
    utterance.onstart = () => {
      setIsSpeaking(true);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    utterance.onerror = (event) => {
      setError(`Speech synthesis error: ${event.error}`);
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