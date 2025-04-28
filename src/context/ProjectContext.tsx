import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Project, Message } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';

interface ProjectContextType {
  currentProject: Project | null;
  projects: Project[];
  createNewProject: (title: string, description: string) => void;
  addMessage: (content: string, sender: 'user' | 'assistant') => void;
  updateVbaCode: (code: string) => void;
  selectProject: (id: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const { user } = useAuth();

  const createNewProject = (title: string, description: string) => {
    if (!user) return;

    const newProject: Project = {
      id: uuidv4(),
      title,
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [],
      userId: user.id
    };
    setProjects([...projects, newProject]);
    setCurrentProject(newProject);
  };

  const addMessage = (content: string, sender: 'user' | 'assistant') => {
    if (!currentProject) return;
    
    const newMessage: Message = {
      id: uuidv4(),
      content,
      sender,
      timestamp: new Date(),
    };
    
    const updatedProject = {
      ...currentProject,
      messages: [...currentProject.messages, newMessage],
      updatedAt: new Date(),
    };
    
    setCurrentProject(updatedProject);
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const updateVbaCode = (code: string) => {
    if (!currentProject) return;
    
    const updatedProject = {
      ...currentProject,
      vbaCode: code,
      updatedAt: new Date(),
    };
    
    setCurrentProject(updatedProject);
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const selectProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      setCurrentProject(project);
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        currentProject,
        projects,
        createNewProject,
        addMessage,
        updateVbaCode,
        selectProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};