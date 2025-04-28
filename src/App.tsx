import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Projects from './pages/Projects';

function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <Router>
          <div className="h-screen flex flex-col">
            <NavBar />
            <main className="flex-1 overflow-auto">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/projects" element={<Projects />} />
              </Routes>
            </main>
          </div>
        </Router>
      </ProjectProvider>
    </AuthProvider>
  );
}

export default App;