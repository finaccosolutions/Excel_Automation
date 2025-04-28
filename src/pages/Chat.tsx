import React from 'react';
import ChatContainer from '../components/Chat/ChatContainer';
import VbaCodeEditor from '../components/CodePreview/VbaCodeEditor';
import ExcelPreview from '../components/CodePreview/ExcelPreview';
import { useProject } from '../context/ProjectContext';
import { useNavigate } from 'react-router-dom';
import { FileSpreadsheet, MessageSquare } from 'lucide-react';

const Chat: React.FC = () => {
  const { currentProject } = useProject();
  const navigate = useNavigate();

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-blue-100 p-3">
              <FileSpreadsheet className="h-10 w-10 text-blue-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Project</h2>
          <p className="text-gray-600 mb-6">
            You need to create or select a project before you can start chatting.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white font-medium py-2 px-6 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <FileSpreadsheet className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">{currentProject.title}</h2>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <MessageSquare className="h-4 w-4 mr-1" />
            <span>{currentProject.messages.length} messages</span>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
          <ChatContainer />
          <div className="flex flex-col overflow-hidden">
            <VbaCodeEditor />
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <ExcelPreview />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;