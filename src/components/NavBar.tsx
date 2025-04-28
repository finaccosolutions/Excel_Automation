import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileSpreadsheet, Menu, X, Home, MessageSquare, FileCode, LogIn, LogOut, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoginModal from './Auth/LoginModal';
import ApiKeyModal from './Auth/ApiKeyModal';

const NavBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <FileSpreadsheet className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">Excel VBA Generator</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className="border-transparent text-gray-500 hover:border-blue-500 hover:text-blue-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                <Home className="mr-1 h-4 w-4" />
                Home
              </Link>
              <Link
                to="/chat"
                className="border-transparent text-gray-500 hover:border-blue-500 hover:text-blue-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                <MessageSquare className="mr-1 h-4 w-4" />
                Chat
              </Link>
              <Link
                to="/projects"
                className="border-transparent text-gray-500 hover:border-blue-500 hover:text-blue-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                <FileCode className="mr-1 h-4 w-4" />
                Projects
              </Link>
            </div>
          </div>
          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            {user ? (
              <>
                <button
                  onClick={() => setIsApiKeyModalOpen(true)}
                  className="text-gray-500 hover:text-blue-700 flex items-center text-sm font-medium"
                  data-testid="api-key-button"
                >
                  <Key className="mr-1 h-4 w-4" />
                  {user.geminiApiKey ? 'Update API Key' : 'Add API Key'}
                </button>
                <button
                  onClick={() => signOut()}
                  className="text-gray-500 hover:text-blue-700 flex items-center text-sm font-medium"
                >
                  <LogOut className="mr-1 h-4 w-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="text-gray-500 hover:text-blue-700 flex items-center text-sm font-medium"
              >
                <LogIn className="mr-1 h-4 w-4" />
                Sign In
              </button>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="sm:hidden bg-white">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="text-gray-600 hover:bg-gray-50 block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center">
                <Home className="mr-2 h-5 w-5" />
                Home
              </div>
            </Link>
            <Link
              to="/chat"
              className="text-gray-600 hover:bg-gray-50 block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" />
                Chat
              </div>
            </Link>
            <Link
              to="/projects"
              className="text-gray-600 hover:bg-gray-50 block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center">
                <FileCode className="mr-2 h-5 w-5" />
                Projects
              </div>
            </Link>
            {user ? (
              <>
                <button
                  onClick={() => {
                    setIsApiKeyModalOpen(true);
                    setIsOpen(false);
                  }}
                  className="text-gray-600 hover:bg-gray-50 block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium w-full text-left"
                  data-testid="api-key-button-mobile"
                >
                  <div className="flex items-center">
                    <Key className="mr-2 h-5 w-5" />
                    {user.geminiApiKey ? 'Update API Key' : 'Add API Key'}
                  </div>
                </button>
                <button
                  onClick={() => {
                    signOut();
                    setIsOpen(false);
                  }}
                  className="text-gray-600 hover:bg-gray-50 block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium w-full text-left"
                >
                  <div className="flex items-center">
                    <LogOut className="mr-2 h-5 w-5" />
                    Sign Out
                  </div>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setIsLoginModalOpen(true);
                  setIsOpen(false);
                }}
                className="text-gray-600 hover:bg-gray-50 block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium w-full text-left"
              >
                <div className="flex items-center">
                  <LogIn className="mr-2 h-5 w-5" />
                  Sign In
                </div>
              </button>
            )}
          </div>
        </div>
      )}

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <ApiKeyModal isOpen={isApiKeyModalOpen} onClose={() => setIsApiKeyModalOpen(false)} />
    </nav>
  );
};

export default NavBar;