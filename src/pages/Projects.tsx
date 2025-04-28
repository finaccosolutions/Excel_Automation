import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import ProjectCard from '../components/ProjectCard';
import NewProjectModal from '../components/NewProjectModal';
import { FilePlus, FileSpreadsheet } from 'lucide-react';

const Projects: React.FC = () => {
  const { projects, selectProject } = useProject();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleProjectClick = (id: string) => {
    selectProject(id);
    navigate('/chat');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Your Excel VBA Projects</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
          >
            <FilePlus className="h-5 w-5 mr-2" />
            New Project
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-blue-100 p-3">
                <FileSpreadsheet className="h-10 w-10 text-blue-600" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Projects Yet</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Create your first Excel VBA project to start generating customized automation solutions.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white font-medium py-2 px-6 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
            >
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => handleProjectClick(project.id)}
              />
            ))}
          </div>
        )}
      </div>

      <NewProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Projects;