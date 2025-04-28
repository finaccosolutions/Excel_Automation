import React from 'react';
import { FileSpreadsheet, ExternalLink, Clock } from 'lucide-react';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={onClick}
    >
      <div className="bg-blue-600 px-4 py-2 text-white flex items-center">
        <FileSpreadsheet className="h-5 w-5 mr-2" />
        <h3 className="font-medium truncate">{project.title}</h3>
      </div>
      <div className="p-4">
        <p className="text-gray-600 text-sm line-clamp-2 mb-3 h-10">
          {project.description}
        </p>
        <div className="text-xs text-gray-500 flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          <span>Updated: {formatDate(project.updatedAt)}</span>
        </div>
        <div className="mt-4 flex justify-end">
          <button 
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            Open Project
            <ExternalLink className="h-3 w-3 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;