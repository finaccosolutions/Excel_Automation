import React, { useState, useEffect, useRef } from 'react';
import { Message } from '../../types';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { createGeminiChat } from '../../services/gemini';
import { useNavigate } from 'react-router-dom';

const ChatContainer: React.FC = () => {
  const { currentProject, addMessage, updateVbaCode } = useProject();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    // Only show API key modal if user has no API key
    if (!user.geminiApiKey && !showApiKeyModal) {
      setShowApiKeyModal(true);
      const apiKeyButton = document.querySelector('[data-testid="api-key-button"]');
      if (apiKeyButton instanceof HTMLElement) {
        apiKeyButton.click();
      }
    }
  }, [user, navigate, showApiKeyModal]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentProject?.messages]);

  const handleSendMessage = async (content: string) => {
    if (!user?.geminiApiKey) {
      return;
    }

    addMessage(content, 'user');
    setIsLoading(true);

    try {
      const gemini = createGeminiChat(user.geminiApiKey);
      const { vbaCode, response } = await gemini.generateVbaCode(
        content,
        currentProject?.messages || []
      );

      addMessage(response, 'assistant');
      updateVbaCode(vbaCode);
    } catch (error) {
      console.error('Error generating VBA code:', error);
      const errorMessage = error instanceof Error 
        ? `${error.message}. Please ensure your API key is valid and has access to the Gemini API.`
        : 'An unexpected error occurred while generating VBA code. Please check your API key and try again.';
      
      addMessage(
        `Sorry, I couldn't generate VBA code: ${errorMessage}`,
        'assistant'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-1 overflow-y-auto p-4">
        {currentProject?.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500 max-w-md">
              <h3 className="font-medium text-lg mb-2">Welcome to Excel VBA Generator</h3>
              <p>
                Describe your Excel automation needs and I'll generate VBA code for you. For example, try:
              </p>
              <ul className="mt-3 text-left space-y-2">
                <li className="bg-blue-50 p-2 rounded-md hover:bg-blue-100 cursor-pointer transition-colors">
                  "I need a macro to sort data in column A"
                </li>
                <li className="bg-blue-50 p-2 rounded-md hover:bg-blue-100 cursor-pointer transition-colors">
                  "Create a function to calculate average of cells B2:B10"
                </li>
                <li className="bg-blue-50 p-2 rounded-md hover:bg-blue-100 cursor-pointer transition-colors">
                  "I need a userform to input customer data"
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <>
            {currentProject?.messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput 
        onSendMessage={handleSendMessage} 
        isLoading={isLoading} 
        disabled={!user.geminiApiKey}
      />
    </div>
  );
};

export default ChatContainer;