import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, Language } from '../types';

interface ConversationDisplayProps {
  messages: Message[];
  isProcessing: boolean;
  language: Language;
}

const ConversationDisplay: React.FC<ConversationDisplayProps> = ({ 
  messages, 
  isProcessing,
  language
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0 && !isProcessing) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-gray-500">
        <p className="text-xl font-light mb-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {language === 'en' 
            ? 'Your conversation will appear here'
            : 'ستظهر محادثتك هنا'}
        </p>
        <p className="text-center" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {language === 'en'
            ? 'Click the microphone button and start speaking to interact with the assistant'
            : 'انقر على زر الميكروفون وابدأ في التحدث للتفاعل مع المساعد'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div 
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div 
            className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl rounded-lg p-3 ${
              message.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-gray-100 text-gray-800 rounded-bl-none'
            }`}
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          >
            {message.image && (
              <img 
                src={message.image} 
                alt="Captured" 
                className="mb-2 rounded-lg max-w-full h-auto"
              />
            )}
            {message.role === 'assistant' ? (
              <ReactMarkdown 
                className="prose prose-sm max-w-none dark:prose-invert"
                components={{
                  p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-2" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal ml-4 mb-2" {...props} />,
                  li: ({node, ...props}) => <li className="mb-1" {...props} />,
                  h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-2" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-2" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-base font-bold mb-2" {...props} />,
                  a: ({node, ...props}) => (
                    <a 
                      className="text-blue-600 hover:underline dark:text-blue-400" 
                      target="_blank"
                      rel="noopener noreferrer"
                      {...props}
                    />
                  ),
                  code: ({node, ...props}) => (
                    <code className="bg-gray-200 dark:bg-gray-700 rounded px-1" {...props} />
                  ),
                  pre: ({node, ...props}) => (
                    <pre className="bg-gray-200 dark:bg-gray-700 rounded p-2 overflow-x-auto" {...props} />
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            ) : (
              message.content
            )}
          </div>
        </div>
      ))}
      
      {isProcessing && (
        <div className="flex justify-start">
          <div className="bg-gray-100 text-gray-800 rounded-lg rounded-bl-none p-3 max-w-xs sm:max-w-sm md:max-w-md">
            <div className="flex space-x-2">
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }}></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }}></div>
            </div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ConversationDisplay;