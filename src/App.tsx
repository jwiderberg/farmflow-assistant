import React from 'react';
import VoiceAssistant from './components/VoiceAssistant';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md h-[600px] bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
        <VoiceAssistant />
      </div>
    </div>
  );
}

export default App;