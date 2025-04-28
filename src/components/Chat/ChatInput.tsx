import React, { useState, FormEvent } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-white">
      <div className="flex items-center">
        <textarea
          className={`flex-1 border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 min-h-[50px] max-h-[150px] ${
            disabled ? 'bg-gray-100' : ''
          }`}
          placeholder={
            disabled
              ? "Please add your Gemini API key to start generating VBA code"
              : "Describe your Excel VBA requirements..."
          }
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          disabled={isLoading || disabled}
          rows={2}
        />
        <button
          type="submit"
          className={`ml-3 p-2 rounded-full ${
            isLoading || !message.trim() || disabled
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 transition-colors'
          }`}
          disabled={isLoading || !message.trim() || disabled}
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
      {isLoading && (
        <div className="text-sm text-gray-500 mt-2 flex items-center">
          <div className="animate-pulse mr-2">Generating VBA code...</div>
          <div className="flex">
            <div className="h-2 w-2 bg-blue-600 rounded-full mr-1 animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="h-2 w-2 bg-blue-600 rounded-full mr-1 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      )}
      {disabled && (
        <p className="text-sm text-red-500 mt-2">
          Please add your Gemini API key in the settings to start generating VBA code.
        </p>
      )}
    </form>
  );
};

export default ChatInput;