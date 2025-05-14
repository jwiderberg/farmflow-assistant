import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import useSpeechSynthesis from '../hooks/useSpeechSynthesis';
import { getAIResponse } from '../services/openai';
import VoiceControls from './VoiceControls';
import ConversationDisplay from './ConversationDisplay';
import CameraCapture from './CameraCapture';
import { Message, Language } from '../types';
import { Languages } from 'lucide-react';

const VoiceAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  
  const { 
    isListening, 
    transcript, 
    error: speechRecognitionError, 
    startListening, 
    stopListening,
    setLanguage: setSpeechLanguage 
  } = useSpeechRecognition();
  
  const { 
    isSpeaking, 
    error: speechSynthesisError, 
    speak, 
    cancel,
    setLanguage: setSynthesisLanguage
  } = useSpeechSynthesis();

  const toggleLanguage = () => {
    const newLanguage: Language = language === 'en' ? 'ar' : 'en';
    setLanguage(newLanguage);
    setSpeechLanguage(newLanguage === 'en' ? 'en-US' : 'ar-SA');
    setSynthesisLanguage(newLanguage === 'en' ? 'en-US' : 'ar-SA');
  };

  const handleImageCapture = async (imageData: string) => {
    setCurrentImage(imageData);
    const message = language === 'en' 
      ? 'Please analyze this image and provide farming advice specific to Kuwait.'
      : 'يرجى تحليل هذه الصورة وتقديم نصائح زراعية خاصة بالكويت.';
    
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: message,
      image: imageData
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    
    try {
      const aiResponse = await getAIResponse(message, language, imageData);
      
      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: aiResponse
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      speak(aiResponse);
      
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred');
      }
      console.error(error);
    } finally {
      setIsProcessing(false);
      setCurrentImage(null);
    }
  };

  const processTranscript = useCallback(async (text: string) => {
    if (!text.trim()) return;
    
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: text
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    
    try {
      const aiResponse = await getAIResponse(text, language);
      
      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: aiResponse
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      speak(aiResponse);
      
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred');
      }
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  }, [speak, language]);
  
  useEffect(() => {
    if (transcript && !isListening) {
      processTranscript(transcript);
    }
  }, [transcript, isListening, processTranscript]);
  
  useEffect(() => {
    if (speechRecognitionError) {
      setError(speechRecognitionError);
    } else if (speechSynthesisError) {
      setError(speechSynthesisError);
    }
  }, [speechRecognitionError, speechSynthesisError]);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="bg-white p-4 shadow-sm border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-medium text-gray-800">
            {language === 'en' ? 'Voice Assistant' : 'المساعد الصوتي'}
          </h1>
          <div className="flex items-center gap-2">
            <CameraCapture onCapture={handleImageCapture} language={language} />
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-1 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
            >
              <Languages className="h-4 w-4" />
              <span>{language === 'en' ? 'العربية' : 'English'}</span>
            </button>
          </div>
        </div>
      </header>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {error}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <ConversationDisplay 
        messages={messages} 
        isProcessing={isProcessing}
        language={language}
      />
      
      <VoiceControls 
        isListening={isListening}
        isSpeaking={isSpeaking}
        isProcessing={isProcessing}
        onStartListening={startListening}
        onStopListening={stopListening}
        onCancelSpeech={cancel}
        language={language}
      />
    </div>
  );
};

export default VoiceAssistant;