import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Explore from './pages/Explore';
import CreateProject from './pages/CreateProject';
import Profile from './pages/Profile';
import ProjectDetail from './pages/ProjectDetail';
import Chat from './pages/Chat';
import './index.css';

function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/create" element={<CreateProject />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
            <Route path="/chat/:id" element={<Chat />} />
          </Routes>
        </main>
        <footer style={{
          padding: '4rem 2rem',
          textAlign: 'center',
          borderTop: '1px solid var(--glass-border)',
          color: 'var(--text-muted)',
          fontSize: '0.9rem'
        }}>
          &copy; 2026 HackMate. Built for Hackers.
        </footer>
      </div>
    </Router>
  );
}

export default App;
