import { useState, useCallback, useRef, useEffect } from 'react';

const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState('en-US');
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const checkMicrophonePermission = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      if (error instanceof Error) {
        const errorMessage = language === 'ar-SA'
          ? 'لم يتم السماح باستخدام الميكروفون. يرجى منح الإذن في إعدادات المتصفح.'
          : 'Microphone access denied. Please allow microphone access in your browser settings.';
        setError(errorMessage);
      }
      return false;
    }
  };
  
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }
    
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    // Create a new instance when language changes
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    
    recognitionRef.current = new SpeechRecognitionAPI();
    
    if (recognitionRef.current) {
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setTranscript(transcript);
      };
      
      recognitionRef.current.onerror = (event) => {
        let errorMessage = `Speech recognition error: ${event.error}`;
        if (language === 'ar-SA') {
          if (event.error === 'no-speech') {
            errorMessage = 'لم يتم اكتشاف أي كلام';
          } else if (event.error === 'network') {
            errorMessage = 'خطأ في الشبكة';
          } else if (event.error === 'not-allowed') {
            errorMessage = 'لم يتم السماح باستخدام الميكروفون';
          }
        }
        setError(errorMessage);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      }
    };
  }, [language]);
  
  const startListening = useCallback(async () => {
    setError(null);
    setTranscript('');
    
    const hasMicrophoneAccess = await checkMicrophonePermission();
    if (!hasMicrophoneAccess) {
      return;
    }
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        const errorMessage = language === 'ar-SA' 
          ? 'فشل في بدء التعرف على الكلام'
          : 'Failed to start speech recognition';
        setError(errorMessage);
        console.error(err);
      }
    }
  }, [language]);
  
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);
  
  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    setLanguage
  };
};

export default useSpeechRecognition;