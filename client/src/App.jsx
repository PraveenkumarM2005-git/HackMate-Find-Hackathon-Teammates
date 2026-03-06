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
          background: 'rgba(2, 6, 23, 0.5)',
          color: 'var(--text-muted)',
          fontSize: '0.95rem'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>HackMate</span> — Find Your Elite Squad.
          </div>
          <div style={{ opacity: 0.8 }}>
            Built with ❤️ by <a href="https://github.com/PraveenkumarM2005-git" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'underline' }}>Praveenkumar</a>
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
            &copy; {new Date().getFullYear()} All Rights Reserved.
          </div>
        </footer>

      </div>
    </Router>
  );
}

export default App;
