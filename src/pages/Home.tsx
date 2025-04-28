import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileSpreadsheet, MessageSquare, Code, FileCode, Settings, ArrowRight } from 'lucide-react';
import NewProjectModal from '../components/NewProjectModal';

const Home: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const features = [
    {
      icon: <MessageSquare className="h-8 w-8 text-blue-600" />,
      title: 'Conversational Interface',
      description: 'Describe your needs in plain English and let our AI understand your requirements.'
    },
    {
      icon: <Code className="h-8 w-8 text-blue-600" />,
      title: 'VBA Code Generation',
      description: 'Get customized VBA code tailored to your specific Excel automation needs.'
    },
    {
      icon: <FileCode className="h-8 w-8 text-blue-600" />,
      title: 'Ready-to-Use Macros',
      description: 'Copy the generated code directly into Excel or download as a .bas file.'
    },
    {
      icon: <Settings className="h-8 w-8 text-blue-600" />,
      title: 'Error Prevention',
      description: 'Our system checks for common errors and provides working solutions.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div className="lg:w-1/2">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6 leading-tight">
                Excel VBA Generator
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-xl">
                Create custom Excel VBA tools through simple conversation.
                No coding experience required.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-white text-blue-700 font-medium py-3 px-6 rounded-lg shadow-md hover:bg-blue-50 transition-colors flex items-center"
                >
                  Create New Project
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <button
                  onClick={() => navigate('/projects')}
                  className="bg-blue-700 text-white font-medium py-3 px-6 rounded-lg border border-blue-400 hover:bg-blue-600 transition-colors"
                >
                  View Projects
                </button>
              </div>
            </div>
            <div className="hidden lg:block lg:w-1/2 mt-10 lg:mt-0">
              <div className="bg-white rounded-lg shadow-xl overflow-hidden transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="bg-gray-100 p-2 border-b border-gray-200">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                <div className="p-4">
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-md text-sm overflow-hidden">
                    <code>
{`Sub AutomateDataProcess()
    ' Excel VBA Generator
    Dim ws As Worksheet
    Set ws = ActiveSheet
    
    ' Process data
    With ws.Range("A1:D10")
        .Sort Key1:=ws.Range("A1"), Order1:=xlAscending
        .Font.Bold = True
    End With
    
    MsgBox "Data processing complete!"
End Sub`}
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group"
              >
                <div className="rounded-full bg-blue-50 w-16 h-16 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to automate your Excel workflows?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Start creating custom VBA solutions today.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white font-medium py-3 px-8 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          >
            Get Started
          </button>
        </div>
      </section>

      <NewProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Home;