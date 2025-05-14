import { useState, useCallback, useRef, useEffect } from 'react';

const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState('en-US');
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }
    
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
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
        setError(`Speech recognition error: ${event.error}`);
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
      }
    };
  }, [language]);
  
  const startListening = useCallback(() => {
    setError(null);
    setTranscript('');
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        setError('Failed to start speech recognition');
        console.error(err);
      }
    }
  }, []);
  
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