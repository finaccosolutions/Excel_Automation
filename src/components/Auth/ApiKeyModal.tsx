import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Key, 
  X, 
  Info, 
  AlertCircle, 
  Loader2, 
  RefreshCw, 
  Trash2, 
  MessageSquare,
  Home
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user, updateGeminiApiKey } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && user?.geminiApiKey) {
      setApiKey(user.geminiApiKey);
    }
  }, [isOpen, user]);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setError('Please enter an API key');
      return;
    }

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const result = await updateGeminiApiKey(apiKey.trim());
      if (result?.error) {
        throw new Error(result.error);
      }
      setSuccess('API key saved successfully!');
      setTimeout(() => {
        onClose();
        setSuccess('');
        if (onSuccess) {
          onSuccess();
        }
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save API key');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setError('');
    setSuccess('');
    setIsDeleting(true);

    try {
      const result = await updateGeminiApiKey('');
      if (result?.error) {
        throw new Error(result.error);
      }
      setSuccess('API key removed successfully!');
      setApiKey('');
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove API key');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  const existingKey = user?.geminiApiKey;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="max-w-md w-full mx-4">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-25"></div>
          <div className="relative bg-white p-8 rounded-lg shadow-xl border border-gray-100">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Key className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {existingKey ? 'Update Your Gemini API Key' : 'Set Up Your Gemini API Key'}
              </h2>
              <p className="text-gray-600">
                {existingKey 
                  ? 'Update or remove your existing Gemini API key'
                  : 'Enter your Gemini API key to start using the AI assistant'}
              </p>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">How to get your API key:</p>
                  <ol className="list-decimal ml-4 space-y-1">
                    <li>Visit the <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Google AI Studio</a></li>
                    <li>Sign in with your Google account</li>
                    <li>Create a new API key or use an existing one</li>
                    <li>Copy and paste your API key here</li>
                  </ol>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <Info className="w-5 h-5 text-green-500 flex-shrink-0" />
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            )}

            <div className="mb-6">
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                Gemini API Key
              </label>
              <input
                type="password"
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              />
            </div>

            <div className="space-y-4">
              <button
                onClick={handleSave}
                disabled={isLoading || !apiKey.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    {existingKey ? (
                      <>
                        <RefreshCw className="w-5 h-5" />
                        Update API Key
                      </>
                    ) : (
                      <>
                        <Key className="w-5 h-5" />
                        Save API Key
                      </>
                    )}
                  </>
                )}
              </button>

              {existingKey && (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full bg-red-50 text-red-600 font-medium py-3 px-4 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-red-200"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      Delete API Key
                    </>
                  )}
                </button>
              )}

              <div className="flex gap-4 mt-6">
                {existingKey ? (
                  <button
                    onClick={() => {
                      onClose();
                      navigate('/chat');
                    }}
                    className="flex-1 bg-blue-50 text-blue-600 font-medium py-3 px-4 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center gap-2 border border-blue-200"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Go to Chat
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onClose();
                      navigate('/');
                    }}
                    className="flex-1 bg-gray-50 text-gray-600 font-medium py-3 px-4 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center justify-center gap-2 border border-gray-200"
                  >
                    <Home className="w-5 h-5" />
                    Back to Home
                  </button>
                )}
              </div>
            </div>

            <p className="mt-4 text-sm text-gray-500 text-center">
              Your API key will be securely stored and used only for your account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;