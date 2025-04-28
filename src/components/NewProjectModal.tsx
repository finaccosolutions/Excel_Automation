import React, { useState, useEffect } from 'react';
import { X, FileSpreadsheet } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginModal from './Auth/LoginModal';
import ApiKeyModal from './Auth/ApiKeyModal';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const { createNewProject } = useProject();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      if (!user) {
        setShowLoginModal(true);
      } else if (!user.geminiApiKey) {
        setShowApiKeyModal(true);
      }
    }
  }, [isOpen, user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (!user.geminiApiKey) {
      setShowApiKeyModal(true);
      return;
    }

    if (title.trim()) {
      createNewProject(title, description);
      navigate('/chat');
      onClose();
      // Reset form
      setTitle('');
      setDescription('');
    }
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    if (!user?.geminiApiKey) {
      setShowApiKeyModal(true);
    }
  };

  const handleApiKeySuccess = () => {
    setShowApiKeyModal(false);
    // Continue with project creation if title is set
    if (title.trim()) {
      handleSubmit(new Event('submit') as unknown as React.FormEvent);
    }
  };

  if (!isOpen) return null;

  if (showLoginModal) {
    return <LoginModal isOpen={true} onClose={() => {
      setShowLoginModal(false);
      onClose();
    }} />;
  }

  if (showApiKeyModal) {
    return <ApiKeyModal 
      isOpen={true} 
      onClose={() => {
        setShowApiKeyModal(false);
        onClose();
      }}
      onSuccess={handleApiKeySuccess}
    />;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden animate-fade-in-up">
        <div className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <FileSpreadsheet className="h-5 w-5 mr-2" />
            <h3 className="font-semibold">Create New Excel VBA Project</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-100 transition-colors p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Project Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="E.g., Inventory Management Macro"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Project Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Briefly describe what this Excel VBA tool will do..."
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              disabled={!title.trim()}
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProjectModal;