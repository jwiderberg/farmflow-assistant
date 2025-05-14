import { useState, useCallback, useRef, useEffect } from 'react';

const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState('en-US');
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState<boolean | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  const checkMicrophonePermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      setHasMicrophonePermission(result.state === 'granted');
      
      result.addEventListener('change', () => {
        setHasMicrophonePermission(result.state === 'granted');
      });
    } catch (error) {
      // Fallback to getUserMedia for browsers that don't support permissions API
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setHasMicrophonePermission(true);
      } catch (err) {
        setHasMicrophonePermission(false);
        const errorMessage = language.startsWith('ar')
          ? 'لم يتم منح إذن الوصول إلى الميكروفون'
          : 'Microphone permission not granted';
        setError(errorMessage);
      }
    }
  };

  useEffect(() => {
    checkMicrophonePermission();
  }, []);
  
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      const errorMessage = language.startsWith('ar')
        ? 'التعرف على الكلام غير مدعوم في هذا المتصفح'
        : 'Speech recognition is not supported in this browser.';
      setError(errorMessage);
      return;
    }

    // Clean up previous instance
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onend = null;
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognitionAPI();
    
    if (recognitionRef.current) {
      // Set the correct language code for Arabic
      const langCode = language.startsWith('ar') ? 'ar-SA' : 'en-US';
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = langCode;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setTranscript(transcript);
      };
      
      recognitionRef.current.onerror = (event) => {
        let errorMessage = `Speech recognition error: ${event.error}`;
        if (language.startsWith('ar')) {
          switch (event.error) {
            case 'no-speech':
              errorMessage = 'لم يتم اكتشاف أي كلام';
              break;
            case 'network':
              errorMessage = 'خطأ في الشبكة';
              break;
            case 'not-allowed':
              errorMessage = 'لم يتم السماح باستخدام الميكروفون';
              break;
            case 'aborted':
              errorMessage = 'تم إيقاف التسجيل';
              break;
            default:
              errorMessage = 'حدث خطأ في التعرف على الكلام';
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
        if (isListening) {
          recognitionRef.current.abort();
        }
      }
    };
  }, [language, isListening]);
  
  const startListening = useCallback(async () => {
    if (!hasMicrophonePermission) {
      await checkMicrophonePermission();
      if (!hasMicrophonePermission) {
        return;
      }
    }

    setError(null);
    setTranscript('');
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        const errorMessage = language.startsWith('ar')
          ? 'فشل في بدء التعرف على الكلام'
          : 'Failed to start speech recognition';
        setError(errorMessage);
        console.error(err);
      }
    }
  }, [language, hasMicrophonePermission]);
  
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
    setLanguage,
    hasMicrophonePermission
  };
};

export default useSpeechRecognition;