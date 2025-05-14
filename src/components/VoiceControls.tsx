import React from 'react';
import { Mic, MicOff, Square } from 'lucide-react';
import { Language } from '../types';

interface VoiceControlsProps {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  onCancelSpeech: () => void;
  language: Language;
}

const VoiceControls: React.FC<VoiceControlsProps> = ({
  isListening,
  isSpeaking,
  isProcessing,
  onStartListening,
  onStopListening,
  onCancelSpeech,
  language
}) => {
  const handlePrimaryButtonClick = () => {
    if (isListening) {
      onStopListening();
    } else if (isSpeaking) {
      onCancelSpeech();
    } else {
      onStartListening();
    }
  };

  const getButtonState = () => {
    if (isListening) return 'listening';
    if (isProcessing) return 'processing';
    if (isSpeaking) return 'speaking';
    return 'idle';
  };

  const buttonState = getButtonState();

  const getButtonStyles = () => {
    switch (buttonState) {
      case 'listening':
        return {
          bgColor: 'bg-red-500 hover:bg-red-600',
          icon: <Square className="h-6 w-6" />
        };
      case 'processing':
        return {
          bgColor: 'bg-yellow-500 hover:bg-yellow-600',
          icon: <div className="h-6 w-6 flex items-center justify-center">
                 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
               </div>
        };
      case 'speaking':
        return {
          bgColor: 'bg-green-500 hover:bg-green-600',
          icon: <Square className="h-6 w-6" />
        };
      default:
        return {
          bgColor: 'bg-blue-600 hover:bg-blue-700',
          icon: <Mic className="h-6 w-6" />
        };
    }
  };

  const { bgColor, icon } = getButtonStyles();

  const getStatusText = () => {
    if (language === 'en') {
      switch (buttonState) {
        case 'idle': return "Click to speak";
        case 'listening': return "Listening... Click to stop";
        case 'processing': return "Processing...";
        case 'speaking': return "Speaking... Click to stop";
      }
    } else {
      switch (buttonState) {
        case 'idle': return "انقر للتحدث";
        case 'listening': return "جاري الاستماع... انقر للتوقف";
        case 'processing': return "جاري المعالجة...";
        case 'speaking': return "جاري التحدث... انقر للتوقف";
      }
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 bg-white shadow-md">
      <div className="flex justify-center items-center">
        <button
          onClick={handlePrimaryButtonClick}
          className={`${bgColor} text-white p-4 rounded-full transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          aria-label={isListening ? 'Stop listening' : 'Start listening'}
        >
          {icon}
        </button>
        
        <div className="absolute bottom-24 text-sm text-gray-600" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {getStatusText()}
        </div>
      </div>
    </div>
  );
};

export default VoiceControls;