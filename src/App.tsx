import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Projects from './pages/Projects';
import LoginModal from './components/Auth/LoginModal';
import { initializeSessionSync } from './context/sessionSync';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

function AppContent() {
  const [loginModalOpen, setLoginModalOpen] = React.useState(false);
  const { user } = useAuth();

  return (
    <div className="h-screen flex flex-col">
      <NavBar onLoginClick={() => setLoginModalOpen(true)} />
      
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } />
          <Route path="/projects" element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          } />
        </Routes>
      </main>

      <LoginModal 
        isOpen={loginModalOpen} 
        onClose={() => setLoginModalOpen(false)}
        onSuccess={() => {
          setLoginModalOpen(false);
        }}
      />
    </div>
  );
}

function App() {
  useEffect(() => {
    const cleanup = initializeSessionSync();
    return cleanup;
  }, []);

  return (
    <Router>
      <AuthProvider>
        <ProjectProvider>
          <AppContent />
        </ProjectProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;